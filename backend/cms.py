import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File

from db import db
from auth import get_current_admin
from storage import put_object

router = APIRouter()

PUBLISHABLE = [
    "projects", "services", "pricing", "experience", "education",
    "certifications", "journey", "skills", "technologies",
]
REVISIONED = {"projects", "pricing"}
SINGLETONS = ["homepage", "about", "profile", "seo", "site", "estimator", "appearance", "contact"]
STATUSES = {"draft", "published", "hidden"}

ALLOWED_MIME = {
    "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp",
    "image/gif": ".gif", "application/pdf": ".pdf",
}
MAX_UPLOAD = 8 * 1024 * 1024


def now():
    return datetime.now(timezone.utc).isoformat()


def _coll(name: str):
    if name not in PUBLISHABLE:
        raise HTTPException(status_code=404, detail="Unknown collection")
    return db[name]


def validate_project_for_publish(name: str, doc: dict, previous: dict | None = None):
    """Drafts may be incomplete; published portfolio records require five screenshots."""
    if name != "projects" or doc.get("status") != "published":
        return
    # Existing published projects predate the five-image gallery. Allow ordinary
    # content edits; enforce the rule for new records and draft-to-published changes.
    if previous and previous.get("status") == "published":
        return
    screenshots = [url for url in (doc.get("screenshots") or []) if isinstance(url, str) and url.strip()]
    if len(screenshots) != 5:
        raise HTTPException(status_code=400, detail="Please upload 5 project screenshots before publishing.")


async def log_activity(action: str, record: str, collection: str):
    await db.activity.insert_one(
        {"id": str(uuid.uuid4()), "action": action, "record": record, "collection": collection, "at": now()}
    )


# ---------- generic collection CRUD ----------

@router.get("/collection/{name}")
async def list_collection(name: str, admin=Depends(get_current_admin)):
    coll = _coll(name)
    return await coll.find({}, {"_id": 0}).sort("order", 1).to_list(1000)


@router.post("/collection/{name}")
async def create_item(name: str, payload: dict, admin=Depends(get_current_admin)):
    coll = _coll(name)
    doc = dict(payload)
    doc.pop("id", None)
    doc.pop("_id", None)
    doc["id"] = str(uuid.uuid4())
    doc.setdefault("status", "published")
    if doc["status"] not in STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    validate_project_for_publish(name, doc)
    doc.setdefault("order", 99)
    doc["archived"] = False
    doc["created_at"] = now()
    doc["updated_at"] = now()
    await coll.insert_one(doc)
    doc.pop("_id", None)
    await log_activity("created", doc.get("title") or doc.get("name") or doc["id"], name)
    return doc


@router.put("/collection/{name}/{item_id}")
async def update_item(name: str, item_id: str, payload: dict, admin=Depends(get_current_admin)):
    coll = _coll(name)
    old = await coll.find_one({"id": item_id}, {"_id": 0})
    if not old:
        raise HTTPException(status_code=404, detail="Not found")
    doc = dict(payload)
    for k in ("id", "_id", "created_at"):
        doc.pop(k, None)
    if "status" in doc and doc["status"] not in STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    validate_project_for_publish(name, doc, old)
    doc["updated_at"] = now()
    if name in REVISIONED:
        await db.revisions.update_one(
            {"collection": name, "item_id": item_id},
            {
                "$push": {"snapshots": {"$each": [{"at": now(), "data": old}], "$slice": -10}},
                "$set": {"collection": name, "item_id": item_id},
            },
            upsert=True,
        )
    await coll.update_one({"id": item_id}, {"$set": doc})
    await log_activity("updated", doc.get("title") or doc.get("name") or old.get("title") or old.get("name") or item_id, name)
    return {"status": "ok", "updated_at": doc["updated_at"]}


@router.delete("/collection/{name}/{item_id}")
async def delete_item(name: str, item_id: str, hard: bool = False, admin=Depends(get_current_admin)):
    coll = _coll(name)
    item = await coll.find_one({"id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    label = item.get("title") or item.get("name") or item_id
    if hard:
        await coll.delete_one({"id": item_id})
        await log_activity("deleted", label, name)
    else:
        await coll.update_one({"id": item_id}, {"$set": {"archived": True, "updated_at": now()}})
        await log_activity("archived", label, name)
    return {"status": "ok"}


@router.post("/collection/{name}/{item_id}/restore")
async def restore_item(name: str, item_id: str, admin=Depends(get_current_admin)):
    coll = _coll(name)
    await coll.update_one({"id": item_id}, {"$set": {"archived": False, "updated_at": now()}})
    item = await coll.find_one({"id": item_id})
    await log_activity("restored", item.get("title") or item.get("name") or item_id, name)
    return {"status": "ok"}


@router.post("/collection/{name}/{item_id}/duplicate")
async def duplicate_item(name: str, item_id: str, admin=Depends(get_current_admin)):
    coll = _coll(name)
    item = await coll.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    item["id"] = str(uuid.uuid4())
    if item.get("title"):
        item["title"] = item["title"] + " (Copy)"
    if item.get("name"):
        item["name"] = item["name"] + " (Copy)"
    if item.get("slug"):
        item["slug"] = item["slug"] + "-copy"
    item["status"] = "draft"
    item["archived"] = False
    item["created_at"] = now()
    item["updated_at"] = now()
    await coll.insert_one(item)
    item.pop("_id", None)
    await log_activity("duplicated", item.get("title") or item.get("name") or item_id, name)
    return item


@router.post("/collection/{name}/reorder")
async def reorder(name: str, payload: dict, admin=Depends(get_current_admin)):
    coll = _coll(name)
    ids = payload.get("ids", [])
    for i, item_id in enumerate(ids):
        await coll.update_one({"id": item_id}, {"$set": {"order": i + 1}})
    return {"status": "ok"}


@router.get("/collection/{name}/{item_id}/revisions")
async def revisions(name: str, item_id: str, admin=Depends(get_current_admin)):
    doc = await db.revisions.find_one({"collection": name, "item_id": item_id}, {"_id": 0})
    return doc.get("snapshots", []) if doc else []


# ---------- singletons ----------

@router.get("/singleton/{key}")
async def get_singleton(key: str, admin=Depends(get_current_admin)):
    if key not in SINGLETONS:
        raise HTTPException(status_code=404, detail="Unknown singleton")
    doc = await db.singletons.find_one({"key": key}, {"_id": 0})
    return doc["data"] if doc else {}


@router.put("/singleton/{key}")
async def put_singleton(key: str, payload: dict, admin=Depends(get_current_admin)):
    if key not in SINGLETONS:
        raise HTTPException(status_code=404, detail="Unknown singleton")
    old = await db.singletons.find_one({"key": key}, {"_id": 0})
    if key in ("homepage",) and old:
        await db.revisions.update_one(
            {"collection": "singleton", "item_id": key},
            {"$push": {"snapshots": {"$each": [{"at": now(), "data": old["data"]}], "$slice": -10}}},
            upsert=True,
        )
    await db.singletons.update_one(
        {"key": key}, {"$set": {"data": payload, "updated_at": now()}}, upsert=True
    )
    await log_activity("updated", key, "singleton")
    return {"status": "ok"}


# ---------- media library ----------

@router.post("/media")
async def upload_media(file: UploadFile = File(...), alt: str = "", admin=Depends(get_current_admin)):
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail="Unsupported file type. Images (PNG/JPG/WEBP/GIF) and PDF only.")
    content = await file.read()
    if len(content) > MAX_UPLOAD:
        raise HTTPException(status_code=400, detail="File too large (max 8 MB)")
    media_id = str(uuid.uuid4())
    result = await put_object(f"amurao-dev/media/{uuid.uuid4().hex}{ALLOWED_MIME[file.content_type]}", content, file.content_type)
    doc = {
        "id": media_id,
        "storage_path": result["path"],
        "filename": file.filename,
        "mime": file.content_type,
        "size": result["size"],
        "alt": alt,
        "is_deleted": False,
        "url": f"/api/media/files/{media_id}",
        "created_at": now(),
    }
    await db.media.insert_one(doc)
    doc.pop("_id", None)
    await log_activity("uploaded", file.filename, "media")
    return doc


@router.get("/media")
async def list_media(admin=Depends(get_current_admin)):
    return await db.media.find({"is_deleted": {"$ne": True}}, {"_id": 0}).sort("created_at", -1).to_list(500)


@router.put("/media/{media_id}")
async def update_media(media_id: str, payload: dict, admin=Depends(get_current_admin)):
    await db.media.update_one(
        {"id": media_id}, {"$set": {"alt": payload.get("alt", ""), "filename": payload.get("filename", "")}}
    )
    return {"status": "ok"}


@router.delete("/media/{media_id}")
async def delete_media(media_id: str, admin=Depends(get_current_admin)):
    doc = await db.media.find_one({"id": media_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    await db.media.update_one({"id": media_id}, {"$set": {"is_deleted": True}})
    await log_activity("deleted", doc.get("filename", media_id), "media")
    return {"status": "ok"}


@router.get("/search")
async def admin_search(q: str = "", admin=Depends(get_current_admin)):
    if len(q.strip()) < 2:
        return []
    rx = {"$regex": q.strip(), "$options": "i"}
    results = []
    for name in PUBLISHABLE:
        docs = await db[name].find(
            {"$or": [{"title": rx}, {"name": rx}, {"subtitle": rx}, {"description": rx}, {"role": rx}, {"institution": rx}]},
            {"_id": 0, "id": 1, "title": 1, "name": 1, "status": 1},
        ).to_list(8)
        for d in docs:
            results.append({"collection": name, "id": d["id"], "label": d.get("title") or d.get("name"), "status": d.get("status")})
    msgs = await db.inquiries.find(
        {"$or": [{"name": rx}, {"email": rx}, {"message": rx}]}, {"_id": 0, "id": 1, "name": 1, "status": 1}
    ).to_list(5)
    for m in msgs:
        results.append({"collection": "messages", "id": m["id"], "label": m["name"], "status": m.get("status")})
    return results[:20]


# ---------- activity & export ----------

@router.get("/activity")
async def activity(admin=Depends(get_current_admin)):
    return await db.activity.find({}, {"_id": 0}).sort("at", -1).to_list(100)


@router.get("/export")
async def export_content(admin=Depends(get_current_admin)):
    data = {}
    for name in PUBLISHABLE:
        data[name] = await db[name].find({"archived": {"$ne": True}}, {"_id": 0}).to_list(1000)
    singles = await db.singletons.find({}, {"_id": 0}).to_list(20)
    data["singletons"] = {s["key"]: s.get("data", {}) for s in singles}
    await log_activity("exported", "content.json", "system")
    return data
