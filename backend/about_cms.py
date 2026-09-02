import uuid
import secrets
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from pymongo import ReturnDocument
from typing import Optional

from db import db
from auth import get_current_admin

router = APIRouter()

TRASH_DAYS = 30
REVISION_CAP = 20
STATUSES = {"draft", "published", "archived", "trash"}


def now():
    return datetime.now(timezone.utc)


def now_iso():
    return now().isoformat()


# ---------- default content ----------

def default_profile(name="Professional About", template=4):
    return {
        "id": str(uuid.uuid4()),
        "name": name,
        "slug": name.lower().replace(" ", "-"),
        "template": template,
        "status": "draft",
        "intro": {
            "eyebrow": "ABOUT / PROFILE",
            "heading": "I DIDN'T WANT GRADUATION\nTO BE WHERE *EXPERIENCE* STARTS.",
            "body": "I'm Aleana Rose C. Amurao — a working student and Full-Stack & Systems Developer. "
                    "I've deliberately used my university years for more than academic requirements: building "
                    "real systems, working with real clients, and developing the discipline and professional "
                    "habits the industry actually asks for. I keep accepting opportunities that let me solve "
                    "real problems, work on actual systems, and improve the way I design and build software.",
        },
        "story": {
            "beforeTheCode": "My path into development wasn't a straight line. For a significant part of my "
                             "student life, my energy went into sport — basketball, volleyball, badminton, and "
                             "eventually futsal, where I became part of the CLSU women's futsal team. Sport "
                             "taught me things no classroom exercise could: discipline, teamwork, resilience, "
                             "and the habit of reviewing what failed before the next game.",
            "theShift": "Over time, my priorities started changing. I began thinking seriously about what I "
                        "wanted waiting for me after graduation — and I realized I didn't want graduation to be "
                        "the point where I started figuring out how professional development worked. So I "
                        "started investing my time differently: self-study, full-stack development, databases, "
                        "UI/UX, system design, and understanding how complete systems are actually built.",
            "firstSystem": "SoilTrack became one of those turning points. It was no longer about completing a "
                           "programming exercise. I was working on a laboratory information system connected to "
                           "actual Department of Agriculture-related operations — real workflows, real data, "
                           "real users, real responsibilities. It made the gap between studying software and "
                           "building software very real.",
            "choosingThePath": "As my development responsibilities grew, I made a conscious decision to step "
                               "away from competitive futsal. Not because sport stopped mattering — but because "
                               "I chose where my limited hours would compound: academics, development, freelance "
                               "and project work, and preparing for the career I want.",
            "today": "I'm now in my third year, and I'm still deliberately looking for work that teaches me "
                     "something: building, learning, solving actual problems, working with clients, and "
                     "sharpening my technical judgment. My loop is simple — LEARN → BUILD → TEST → SHIP → "
                     "REFLECT → IMPROVE.",
            "theGoal": "The long-term target is Senior Full-Stack & Systems Developer. I'm not trying to rush "
                       "the title. The objective is to keep developing the technical judgment, system knowledge, "
                       "communication, and professionalism required to eventually earn it — and to arrive at "
                       "graduation with meaningful experience already behind me.",
        },
        "workingStudent": {
            "heading": "STUDYING THE THEORY. WORKING ON THE REAL THING.",
            "body": "Being a working student has taught me to handle competing responsibilities honestly: "
                    "deadlines, academic requirements, client expectations, documentation, and independent "
                    "problem solving. It's not about glorifying being busy — it's about professional "
                    "responsibility and deliberate growth.",
        },
        "howIWork": [
            {"num": "01", "title": "DISCOVER", "desc": "Understand the client, users, requirements, constraints, and the actual problem."},
            {"num": "02", "title": "SCOPE", "desc": "Break the system into features, priorities, stories, and deliverables."},
            {"num": "03", "title": "PROTOTYPE", "desc": "Create flows, UI concepts, wireframes, and early working versions."},
            {"num": "04", "title": "SPRINT / BUILD", "desc": "Develop features in manageable iterations."},
            {"num": "05", "title": "REVIEW", "desc": "Test the current build, collect feedback, identify changes."},
            {"num": "06", "title": "REFINE", "desc": "Improve the interface, logic, database, and workflow."},
            {"num": "07", "title": "SHIP", "desc": "Deploy or hand over a stable iteration."},
            {"num": "08", "title": "ITERATE", "desc": "Continue improving based on actual use and feedback."},
        ],
        "howIWorkNote": "My workflow is influenced by Scrum, rapid prototyping, and iterative development — "
                        "it keeps me from building an entire complex system blindly before validating how its "
                        "pieces should work.",
        "principles": [
            {"title": "Understand Before Building", "desc": "Code should solve a defined problem, not simply implement requested screens without understanding the workflow."},
            {"title": "Build in Iterations", "desc": "A working prototype gives better feedback than long assumptions."},
            {"title": "Systems Over Screens", "desc": "Frontend interfaces only make sense when the backend, database, permissions, workflows, and user needs work together."},
            {"title": "Keep It Maintainable", "desc": "Software should remain understandable after the first version ships."},
            {"title": "Communicate Early", "desc": "Questions and constraints should be surfaced before they turn into expensive changes."},
            {"title": "Test the Workflow", "desc": "A feature is not finished simply because it compiles."},
        ],
        "beyondCode": {
            "heading": "BEYOND_CODE",
            "body": "Working directly with different people and responsibilities has taught me that successful "
                    "software development includes communication and documentation — not only code.",
            "items": ["Customer Communication", "Technical Support", "Documentation", "Research", "Writing",
                      "Presentations", "UI/UX", "Graphic Design", "Project Coordination", "Problem Solving",
                      "Requirements Gathering"],
        },
        "sports": {
            "heading": "OFF_SCREEN / SPORTS",
            "body": "Sport is still part of who I am. I played basketball, volleyball, and badminton, and "
                    "competed with the CLSU women's futsal team — an important chapter of my student life that "
                    "shaped how I train, review, and improve.",
            "items": ["Basketball", "Volleyball", "Badminton", "Futsal"],
        },
        "gaming": {
            "heading": "OFF_CLOCK",
            "physical": ["Basketball", "Volleyball", "Badminton", "Futsal"],
            "digital": ["PC", "Mobile", "Console", "Online Multiplayer", "Esports"],
        },
        "interests": ["Web Development", "UI/UX Design", "Information Systems", "Software Development",
                      "System Architecture", "Technology Research", "Graphic Design", "Digital Content",
                      "Gaming", "Esports", "Sports", "Data", "Research", "Technical Writing",
                      "Documentation", "System Testing", "Troubleshooting"],
        "careerGoal": {
            "heading": "SENIOR FULL-STACK & SYSTEMS DEVELOPER",
            "statusLabel": "IN PROGRESS",
            "body": "My goal is not simply to collect technologies. I want to develop the technical judgment "
                    "required to understand a system from its interface to its database, infrastructure, users, "
                    "workflows, and business requirements — and to grow into a senior developer capable of "
                    "taking ownership of complex systems and helping other developers build them well.",
        },
        "openTo": {
            "heading": "OPEN TO",
            "body": "Open to opportunities where I can contribute with my current capabilities while continuing "
                    "to grow professionally.",
            "items": ["Freelance Projects", "Project-Based Development", "Part-Time Development", "Internships",
                      "Junior Development Roles", "Collaborations", "System Development", "Web Development",
                      "UI/UX Work", "Technical Projects"],
        },
        "currentFocus": [
            {"label": "BUILDING", "value": "Full-stack systems"},
            {"label": "LEARNING", "value": "Better system architecture"},
            {"label": "IMPROVING", "value": "Professional development workflow"},
            {"label": "STUDYING", "value": "BS Information Technology"},
            {"label": "WORKING", "value": "Freelance / Project-Based"},
        ],
        "sportToDev": [
            {"sport": "TRAIN", "dev": "LEARN"},
            {"sport": "GAME PLAN", "dev": "SCOPE"},
            {"sport": "PLAY", "dev": "BUILD"},
            {"sport": "HALFTIME REVIEW", "dev": "SPRINT REVIEW"},
            {"sport": "ADJUST", "dev": "ITERATE"},
            {"sport": "NEXT GAME", "dev": "NEXT RELEASE"},
        ],
        "cta": {
            "resumeHeading": "NEED THE FORMAL VERSION?",
            "contactHeading": "CURRENT STATUS: BUILDING.",
            "contactBody": "NEXT SYSTEM COULD BE YOURS.",
        },
        "sections": [
            {"key": "intro", "visible": True}, {"key": "story", "visible": True},
            {"key": "workingStudent", "visible": True}, {"key": "howIWork", "visible": True},
            {"key": "principles", "visible": True}, {"key": "specializations", "visible": True},
            {"key": "beyondCode", "visible": True}, {"key": "offClock", "visible": True},
            {"key": "interests", "visible": True}, {"key": "careerGoal", "visible": True},
            {"key": "openTo", "visible": True}, {"key": "stats", "visible": True},
            {"key": "currentFocus", "visible": True}, {"key": "education", "visible": True},
            {"key": "experience", "visible": True}, {"key": "projects", "visible": True},
            {"key": "certifications", "visible": True}, {"key": "resumeCta", "visible": True},
            {"key": "contactCta", "visible": True},
        ],
        "customSections": [],
        "statsSelection": {"projects": True, "technologies": True, "services": False, "certifications": True, "experience": False},
        "projectsHighlight": [],
        "photos": [],
        "seo": {"title": "", "description": "", "ogImage": ""},
        "created_at": now_iso(),
        "updated_at": now_iso(),
        "published_at": None,
        "deleted_at": None,
        "editor": "admin",
    }


# ---------- helpers ----------

async def purge_trash():
    cutoff = (now() - timedelta(days=TRASH_DAYS)).isoformat()
    await db.about_profiles.delete_many({"status": "trash", "deleted_at": {"$lt": cutoff}})


async def snapshot_revision(profile: dict, note: str = "Updated"):
    await db.about_revisions.update_one(
        {"profile_id": profile["id"]},
        {
            "$push": {"snapshots": {"$each": [{"at": now_iso(), "note": note, "data": profile}], "$slice": -REVISION_CAP}},
            "$set": {"profile_id": profile["id"]},
        },
        upsert=True,
    )


def public_view(p: dict):
    p.pop("_id", None)
    return p


# ---------- routes ----------

@router.get("/profiles")
async def list_profiles(admin=Depends(get_current_admin)):
    await purge_trash()
    docs = await db.about_profiles.find(
        {}, {"_id": 0, "id": 1, "name": 1, "template": 1, "status": 1, "created_at": 1,
             "updated_at": 1, "published_at": 1, "deleted_at": 1, "editor": 1, "photos": 1}
    ).sort("updated_at", -1).to_list(100)
    for d in docs:
        d["photoCount"] = len(d.get("photos") or [])
        d.pop("photos", None)
        if d.get("deleted_at"):
            deleted = datetime.fromisoformat(d["deleted_at"])
            purge_at = deleted + timedelta(days=TRASH_DAYS)
            d["purge_at"] = purge_at.isoformat()
            d["days_remaining"] = max(0, (purge_at - now()).days)
    return docs


class CreateProfileIn(BaseModel):
    name: str
    template: Optional[int] = 4
    duplicateFrom: Optional[str] = None


@router.post("/profiles")
async def create_profile(payload: CreateProfileIn, admin=Depends(get_current_admin)):
    if payload.duplicateFrom:
        src = await db.about_profiles.find_one({"id": payload.duplicateFrom}, {"_id": 0})
        if not src:
            raise HTTPException(status_code=404, detail="Source profile not found")
        doc = {**src, "id": str(uuid.uuid4()), "name": payload.name, "status": "draft",
               "created_at": now_iso(), "updated_at": now_iso(), "published_at": None, "deleted_at": None}
    else:
        doc = default_profile(name=payload.name, template=payload.template or 4)
    await db.about_profiles.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.get("/profiles/{pid}")
async def get_profile(pid: str, admin=Depends(get_current_admin)):
    doc = await db.about_profiles.find_one({"id": pid}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return doc


@router.put("/profiles/{pid}")
async def update_profile(pid: str, payload: dict, admin=Depends(get_current_admin)):
    old = await db.about_profiles.find_one({"id": pid}, {"_id": 0})
    if not old:
        raise HTTPException(status_code=404, detail="Not found")
    doc = dict(payload)
    for k in ("id", "_id", "created_at", "published_at", "deleted_at"):
        doc.pop(k, None)
    if "status" in doc and doc["status"] not in STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    doc["updated_at"] = now_iso()
    doc["editor"] = admin.get("email", "admin")
    await snapshot_revision(old, "Updated")
    saved = await db.about_profiles.find_one_and_update(
        {"id": pid},
        {"$set": doc},
        projection={"_id": 0},
        return_document=ReturnDocument.AFTER,
    )
    return {"status": "ok", "updated_at": saved["updated_at"], "profile": saved}


@router.post("/profiles/{pid}/publish")
async def publish_profile(pid: str, admin=Depends(get_current_admin)):
    doc = await db.about_profiles.find_one({"id": pid})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    if not (doc.get("name") or "").strip():
        raise HTTPException(status_code=400, detail="Profile name is required.")
    if doc.get("template") not in (1, 2, 3, 4, 5):
        raise HTTPException(status_code=400, detail="Select a template (1–5) before publishing.")
    if not (doc.get("intro") or {}).get("body", "").strip():
        raise HTTPException(status_code=400, detail="Introduction body is required before publishing.")
    # atomic-ish: demote current published, promote this one
    await db.about_profiles.update_many({"status": "published"}, {"$set": {"status": "archived"}})
    await db.about_profiles.update_one(
        {"id": pid}, {"$set": {"status": "published", "published_at": now_iso(), "updated_at": now_iso()}}
    )
    return {"status": "ok"}


@router.post("/profiles/{pid}/unpublish")
async def unpublish_profile(pid: str, admin=Depends(get_current_admin)):
    await db.about_profiles.update_one({"id": pid}, {"$set": {"status": "draft", "updated_at": now_iso()}})
    return {"status": "ok"}


@router.post("/profiles/{pid}/archive")
async def archive_profile(pid: str, admin=Depends(get_current_admin)):
    await db.about_profiles.update_one({"id": pid}, {"$set": {"status": "archived", "updated_at": now_iso()}})
    return {"status": "ok"}


@router.delete("/profiles/{pid}")
async def trash_profile(pid: str, admin=Depends(get_current_admin)):
    doc = await db.about_profiles.find_one({"id": pid})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    if doc.get("status") == "published":
        raise HTTPException(status_code=400, detail="Unpublish or archive the live profile before deleting it.")
    await db.about_profiles.update_one({"id": pid}, {"$set": {"status": "trash", "deleted_at": now_iso()}})
    return {"status": "ok", "purge_at": (now() + timedelta(days=TRASH_DAYS)).isoformat()}


@router.post("/profiles/{pid}/restore")
async def restore_profile(pid: str, admin=Depends(get_current_admin)):
    await db.about_profiles.update_one(
        {"id": pid, "status": "trash"}, {"$set": {"status": "draft", "deleted_at": None, "updated_at": now_iso()}}
    )
    return {"status": "ok"}


@router.delete("/profiles/{pid}/permanent")
async def delete_permanent(pid: str, admin=Depends(get_current_admin)):
    doc = await db.about_profiles.find_one({"id": pid})
    if not doc or doc.get("status") != "trash":
        raise HTTPException(status_code=400, detail="Only trashed profiles can be permanently deleted.")
    await db.about_profiles.delete_one({"id": pid})
    await db.about_revisions.delete_one({"profile_id": pid})
    # shared media is never deleted with a profile
    return {"status": "ok"}


@router.get("/profiles/{pid}/revisions")
async def get_revisions(pid: str, admin=Depends(get_current_admin)):
    doc = await db.about_revisions.find_one({"profile_id": pid}, {"_id": 0})
    snaps = doc.get("snapshots", []) if doc else []
    return [{"at": s["at"], "note": s.get("note", "Updated"), "index": i} for i, s in enumerate(snaps)]


@router.post("/profiles/{pid}/restore-revision/{index}")
async def restore_revision(pid: str, index: int, admin=Depends(get_current_admin)):
    doc = await db.about_revisions.find_one({"profile_id": pid}, {"_id": 0})
    snaps = doc.get("snapshots", []) if doc else []
    if index < 0 or index >= len(snaps):
        raise HTTPException(status_code=404, detail="Revision not found")
    current = await db.about_profiles.find_one({"id": pid}, {"_id": 0})
    if current:
        await snapshot_revision(current, "Before restore")
    data = dict(snaps[index]["data"])
    data.pop("_id", None)
    data["status"] = "draft"  # restoring creates a draft, never silently republishes
    data["updated_at"] = now_iso()
    keep = {k: current.get(k) for k in ("published_at", "deleted_at")} if current else {}
    data.update(keep)
    await db.about_profiles.update_one({"id": pid}, {"$set": data})
    return {"status": "ok"}


@router.post("/profiles/{pid}/preview-token")
async def preview_token(pid: str, admin=Depends(get_current_admin)):
    doc = await db.about_profiles.find_one({"id": pid})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    token = secrets.token_urlsafe(24)
    await db.about_preview_tokens.insert_one({
        "token": token, "profile_id": pid,
        "expires_at": (now() + timedelta(hours=2)).isoformat(),
    })
    return {"token": token, "url": f"/about-preview/{token}"}
