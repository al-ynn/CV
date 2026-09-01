import os
import re
import uuid
import secrets
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File
from fastapi.responses import FileResponse, Response
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List

from db import db, client
from auth import (
    create_access_token, verify_password, hash_password, get_current_admin, seed_admin,
    create_indexes, check_lockout, record_failed_attempt, clear_attempts,
)
from emailer import send_email, inquiry_notification_html, reset_email_html
from seed_data import (
    DEFAULT_SERVICES, DEFAULT_PRICING, DEFAULT_PROJECTS,
    SEED_EXPERIENCE, SEED_EDUCATION, SEED_CERTIFICATIONS, SEED_JOURNEY,
    SEED_SKILLS, SEED_TECHNOLOGIES, SEED_SINGLETONS,
)
from resume import ensure_generated_resume, get_resume_bytes, save_custom_resume
from storage import get_object, init_storage
import cms
import about_cms
import home_cms

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI()
api = APIRouter(prefix="/api")


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ForgotIn(BaseModel):
    email: EmailStr


class ResetIn(BaseModel):
    token: str
    password: str


class PasswordChangeIn(BaseModel):
    current: str
    new: str


class InquiryIn(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = ""
    projectType: Optional[str] = ""
    budget: Optional[str] = ""
    timeline: Optional[str] = ""
    message: str
    brief: Optional[dict] = None
    website: Optional[str] = ""  # honeypot


class InquiryPatch(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


async def get_site_singleton():
    doc = await db.singletons.find_one({"key": "site"}, {"_id": 0})
    return doc["data"] if doc else {}


# ---------- public ----------

@api.get("/health")
async def health():
    return {"status": "ok"}


@api.get("/content/bootstrap")
async def bootstrap():
    out = {}
    for name in cms.PUBLISHABLE:
        out[name] = await db[name].find(
            {"status": "published", "archived": {"$ne": True}}, {"_id": 0}
        ).sort("order", 1).to_list(500)
    singles = {}
    for key in cms.SINGLETONS:
        doc = await db.singletons.find_one({"key": key}, {"_id": 0})
        singles[key] = doc["data"] if doc else {}

    published_home = await home_cms.get_published()
    singles["homepage"] = published_home["data"]

    profile = singles.get("profile", {})
    site = singles.get("site", {})
    contact = singles.get("contact", {})
    socials = {k: v for k, v in (profile.get("socials") or {}).items() if v}
    availability = site.get("availability", "available")

    about_prof = await db.about_profiles.find_one({"status": "published"}, {"_id": 0, "photos": 1})
    portrait = ""
    if about_prof:
        photos = about_prof.get("photos") or []
        port = next((ph for ph in photos if ph.get("role") == "Professional Portrait" and ph.get("url")), None)
        portrait = (port or {}).get("url", "")
    settings = {
        "contactEmail": contact.get("email") or profile.get("contactEmail", ""),
        "contact": {
            "email": contact.get("email") or profile.get("contactEmail", ""),
            "mobile": contact.get("mobile", "") or profile.get("phone", ""),
            "whatsapp": contact.get("whatsapp", ""),
            "facebookName": contact.get("facebookName", ""),
            "facebookUrl": contact.get("facebookUrl", ""),
            "github": contact.get("github", "") or socials.get("github", ""),
            "linkedin": contact.get("linkedin", "") or socials.get("linkedin", ""),
            "other": contact.get("other", ""),
        },
        "socials": socials,
        "github": socials.get("github", ""),
        "linkedin": socials.get("linkedin", ""),
        "available": availability != "unavailable",
        "availability": availability,
        "location": profile.get("location", "Philippines"),
        "siteName": site.get("siteName", "AMURAO.DEV"),
        "version": site.get("version", "PORTFOLIO / 1.1"),
        "copyright": site.get("copyright", ""),
        "fullName": profile.get("fullName", "Aleana Rose C. Amurao"),
        "title": profile.get("title", ""),
        "portrait": portrait,
    }
    return {
        "settings": settings,
        "homepage": singles.get("homepage", {}),
        "about": singles.get("about", {}),
        "estimator": singles.get("estimator", {}),
        "seo": singles.get("seo", {}),
        "appearance": singles.get("appearance", {}),
        **out,
    }


@api.post("/inquiries")
async def create_inquiry(payload: InquiryIn):
    if payload.website:
        return {"status": "received"}
    doc = payload.model_dump(exclude={"website"})
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "NEW"
    doc["notes"] = ""
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.inquiries.insert_one(doc)

    site = await get_site_singleton()
    owner = (site.get("ownerNotifyEmail") or "").strip()
    emailed = False
    if owner:
        try:
            await send_email(to=owner, subject=f"New project inquiry — {payload.name}",
                             html=inquiry_notification_html(doc))
            emailed = True
        except Exception as e:
            logger.error(f"Inquiry email failed: {e}")
    return {"status": "received", "id": doc["id"], "emailed": emailed}


@api.get("/resume.pdf")
async def resume_pdf():
    data = await get_resume_bytes()
    return Response(content=data, media_type="application/pdf",
                    headers={"Content-Disposition": 'inline; filename="Aleana-Amurao-CV.pdf"'})


@api.get("/media/files/{media_id}")
async def serve_media(media_id: str):
    doc = await db.media.find_one({"id": media_id, "is_deleted": {"$ne": True}}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    data, content_type = await get_object(doc["storage_path"])
    return Response(content=data, media_type=doc.get("mime") or content_type)


@api.get("/sitemap.xml")
async def sitemap(request: Request):
    seo_doc = await db.singletons.find_one({"key": "seo"}, {"_id": 0})
    seo = (seo_doc or {}).get("data", {})
    base = (seo.get("canonical") or os.environ.get("FRONTEND_URL", "")).rstrip("/")
    if not base:
        base = str(request.base_url).rstrip("/")
    paths = ["", "/about", "/work", "/services", "/pricing", "/experience", "/resume", "/contact"]
    projects = await db.projects.find({"status": "published", "archived": {"$ne": True}}, {"slug": 1}).to_list(200)
    paths += [f"/work/{p['slug']}" for p in projects if p.get("slug")]
    urls = "".join(f"<url><loc>{base}{p}</loc></url>" for p in paths)
    xml = f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>'
    return Response(content=xml, media_type="application/xml")


# ---------- about (public) ----------

@api.get("/content/about")
async def public_about():
    profile = await db.about_profiles.find_one({"status": "published"}, {"_id": 0})
    stats = {
        "projects": await db.projects.count_documents({"status": "published", "archived": {"$ne": True}}),
        "technologies": await db.technologies.count_documents({"status": "published", "archived": {"$ne": True}}),
        "certifications": await db.certifications.count_documents({"status": "published", "archived": {"$ne": True}}),
        "services": await db.services.count_documents({"status": "published", "archived": {"$ne": True}}),
        "experienceSince": 2025,
    }
    return {"profile": profile, "stats": stats}


@api.get("/about/preview-data/{token}")
async def about_preview_data(token: str):
    rec = await db.about_preview_tokens.find_one({"token": token})
    if not rec or datetime.fromisoformat(rec["expires_at"]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=404, detail="Preview link expired or invalid.")
    profile = await db.about_profiles.find_one({"id": rec["profile_id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    stats = {
        "projects": await db.projects.count_documents({"status": "published", "archived": {"$ne": True}}),
        "technologies": await db.technologies.count_documents({"status": "published", "archived": {"$ne": True}}),
        "certifications": await db.certifications.count_documents({"status": "published", "archived": {"$ne": True}}),
        "services": await db.services.count_documents({"status": "published", "archived": {"$ne": True}}),
        "experienceSince": 2025,
    }
    return {"profile": profile, "stats": stats}


@api.get("/homepage/preview-data/{token}")
async def homepage_preview_data(token: str):
    rec = await db.about_preview_tokens.find_one({"token": token, "kind": "homepage"})
    if not rec or datetime.fromisoformat(rec["expires_at"]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=404, detail="Preview link expired or invalid.")
    draft = await home_cms.get_draft()
    return {"homepage": draft["data"]}


# ---------- auth ----------

@api.post("/auth/login")
async def login(payload: LoginIn, request: Request):
    email = payload.email.lower()
    identifier = f"{request.client.host}:{email}"
    await check_lockout(identifier)
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        await record_failed_attempt(identifier)
        raise HTTPException(status_code=401, detail="Invalid credentials")
    await clear_attempts(identifier)
    token = create_access_token(user["id"], email)
    return {"token": token, "user": {"email": email, "name": user.get("name", "Admin"), "role": user.get("role", "admin")}}


@api.get("/auth/me")
async def me(admin=Depends(get_current_admin)):
    return admin


@api.post("/auth/forgot-password")
async def forgot_password(payload: ForgotIn):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email, "role": "admin"})
    if user:
        token = secrets.token_urlsafe(32)
        await db.password_reset_tokens.insert_one({
            "token": token, "email": email, "used": False,
            "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
        })
        link = f"{os.environ.get('FRONTEND_URL', '').rstrip('/')}/admin/reset/{token}"
        try:
            await send_email(to=email, subject="Reset your admin password", html=reset_email_html(link))
        except Exception as e:
            logger.error(f"Reset email failed: {e}")
    return {"status": "ok"}


@api.post("/auth/reset-password")
async def reset_password(payload: ResetIn):
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    rec = await db.password_reset_tokens.find_one({"token": payload.token, "used": False})
    if not rec or datetime.fromisoformat(rec["expires_at"]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset link is invalid or expired.")
    await db.users.update_one({"email": rec["email"]}, {"$set": {"password_hash": hash_password(payload.password)}})
    await db.password_reset_tokens.update_one({"token": payload.token}, {"$set": {"used": True}})
    return {"status": "ok"}


@api.post("/admin/password")
async def change_password(payload: PasswordChangeIn, admin=Depends(get_current_admin)):
    user = await db.users.find_one({"id": admin["id"]})
    if not verify_password(payload.current, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    if len(payload.new) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters.")
    await db.users.update_one({"id": admin["id"]}, {"$set": {"password_hash": hash_password(payload.new)}})
    return {"status": "ok"}


# ---------- admin (non-generic) ----------

@api.get("/admin/stats")
async def admin_stats(admin=Depends(get_current_admin)):
    stats = {
        "inquiries_total": await db.inquiries.count_documents({}),
        "inquiries_new": await db.inquiries.count_documents({"status": "NEW"}),
        "media": await db.media.count_documents({"is_deleted": {"$ne": True}}),
    }
    drafts = 0
    for name in cms.PUBLISHABLE:
        stats[name] = await db[name].count_documents({"archived": {"$ne": True}})
        drafts += await db[name].count_documents({"status": "draft", "archived": {"$ne": True}})
    stats["drafts"] = drafts
    return stats


@api.get("/admin/inquiries")
async def list_inquiries(admin=Depends(get_current_admin)):
    return await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.patch("/admin/inquiries/{inq_id}")
async def update_inquiry(inq_id: str, payload: InquiryPatch, admin=Depends(get_current_admin)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if update:
        await db.inquiries.update_one({"id": inq_id}, {"$set": update})
    return {"status": "ok"}


@api.delete("/admin/inquiries/{inq_id}")
async def delete_inquiry(inq_id: str, admin=Depends(get_current_admin)):
    await db.inquiries.delete_one({"id": inq_id})
    return {"status": "ok"}


@api.post("/admin/resume")
async def upload_resume(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="PDF only")
    content = await file.read()
    if len(content) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 8 MB)")
    doc = await save_custom_resume(content, file.filename)
    await cms.log_activity("uploaded", f"resume: {file.filename}", "resume")
    return {"status": "ok", "bytes": doc["size"], "at": datetime.now(timezone.utc).isoformat()}


# ---------- startup ----------

CMS_SEEDS = {
    "experience": SEED_EXPERIENCE,
    "education": SEED_EDUCATION,
    "certifications": SEED_CERTIFICATIONS,
    "journey": SEED_JOURNEY,
    "skills": SEED_SKILLS,
    "technologies": SEED_TECHNOLOGIES,
}


LEVEL_MAP = {"CORE": "CORE", "PROFICIENT": "PROFICIENT", "EXPERIENCE": "PROFICIENT",
             "AVAILABLE": "WORKING KNOWLEDGE", "WORKING KNOWLEDGE": "WORKING KNOWLEDGE",
             "FAMILIAR": "FAMILIAR", "LEARNING": "LEARNING"}

PRICING_V2 = [
    {"id": "pr-landing", "name": "STATIC LANDING PAGE", "kind": "static", "min": 3000, "max": 5000, "plus": False,
     "typical": ["1 page", "Responsive", "Basic contact information", "Provided content", "Basic deployment assistance"],
     "note": "Single-page sites with provided content.", "featured": False, "order": 1, "status": "published"},
    {"id": "pr-multi", "name": "STATIC MULTI-PAGE WEBSITE", "kind": "static", "min": 5000, "max": 10000, "plus": False,
     "typical": ["3–5 pages", "Business / company website", "Responsive", "Basic forms", "Provided content"],
     "note": "Company and portfolio sites.", "featured": False, "order": 2, "status": "published"},
    {"id": "pr-custom-ui", "name": "CUSTOM UI STATIC WEBSITE", "kind": "static", "min": 7000, "max": 15000, "plus": False,
     "typical": ["Custom interface", "Figma design", "Animations", "Responsive requirements"],
     "note": "Depends on pages and interface complexity.", "featured": False, "order": 3, "status": "published"},
    {"id": "pr-dynamic", "name": "DYNAMIC WEBSITE", "kind": "dynamic", "min": 10000, "max": 20000, "plus": False,
     "typical": ["Database-driven content", "Login", "Admin content management", "Basic user accounts"],
     "note": "Backend and database included.", "featured": False, "order": 4, "status": "published"},
    {"id": "pr-system", "name": "WEB APPLICATION / SYSTEM", "kind": "system", "min": 15000, "max": 40000, "plus": True,
     "typical": ["Multiple modules", "User roles", "Database complexity", "Business workflows", "Reporting", "Integrations"],
     "note": "Priced primarily by module and workflow complexity.", "featured": True, "order": 5, "status": "published"},
    {"id": "pr-ecommerce", "name": "E-COMMERCE", "kind": "system", "min": 15000, "max": 30000, "plus": True,
     "typical": ["Products", "Customer accounts", "Inventory", "Admin", "Checkout", "Payment gateway", "Order management"],
     "note": "Payment integrations and complex administration affect the range.", "featured": True, "order": 6, "status": "published"},
    {"id": "pr-uiux", "name": "UI/UX DESIGN", "kind": "design", "min": 2500, "max": 7500, "plus": True,
     "typical": ["Number of screens", "Complexity", "Wireframes", "Responsive versions", "Prototype requirements"],
     "note": "Priced per screen count and fidelity.", "featured": False, "order": 7, "status": "published"},
    {"id": "pr-bugfix", "name": "BUG FIX / SMALL FEATURE", "kind": "support", "min": 500, "max": 2500, "plus": True,
     "typical": ["Issue investigation", "Repair", "Small features"],
     "note": "Depends on investigation and complexity.", "featured": False, "order": 8, "status": "published"},
]

ESTIMATOR_V2 = {
    "types": [
        {"label": "Landing Page", "kind": "static", "min": 3000, "max": 5000, "weeks": 1, "complexity": "SIMPLE"},
        {"label": "Company Website", "kind": "static", "min": 5000, "max": 10000, "weeks": 2, "complexity": "SIMPLE"},
        {"label": "Portfolio Website", "kind": "static", "min": 4000, "max": 8000, "weeks": 1, "complexity": "SIMPLE"},
        {"label": "Dynamic Website", "kind": "dynamic", "min": 10000, "max": 20000, "weeks": 4, "complexity": "STANDARD"},
        {"label": "E-Commerce Website", "kind": "system", "min": 15000, "max": 30000, "weeks": 6, "complexity": "ADVANCED"},
        {"label": "Web Application", "kind": "system", "min": 15000, "max": 40000, "weeks": 6, "complexity": "ADVANCED"},
        {"label": "Information System", "kind": "system", "min": 15000, "max": 40000, "weeks": 8, "complexity": "ADVANCED"},
        {"label": "Internal Business System", "kind": "system", "min": 15000, "max": 40000, "weeks": 8, "complexity": "ADVANCED"},
        {"label": "Dashboard", "kind": "dynamic", "min": 8000, "max": 18000, "weeks": 3, "complexity": "STANDARD"},
        {"label": "Existing System Improvement", "kind": "dynamic", "min": 2000, "max": 10000, "weeks": 2, "complexity": "STANDARD"},
        {"label": "UI/UX Only", "kind": "design", "min": 2500, "max": 7500, "weeks": 2, "complexity": "STANDARD"},
    ],
    "pageBrackets": [
        {"label": "1", "addMin": 0, "addMax": 0},
        {"label": "2–3", "addMin": 1500, "addMax": 3000},
        {"label": "4–5", "addMin": 2500, "addMax": 5000},
        {"label": "6–10", "addMin": 4000, "addMax": 9000},
        {"label": "10+", "addMin": 6000, "addMax": 15000},
    ],
    "moduleBrackets": [
        {"label": "1–2", "addMin": 0, "addMax": 2000, "weeks": 0},
        {"label": "3–5", "addMin": 3000, "addMax": 8000, "weeks": 2},
        {"label": "6–10", "addMin": 8000, "addMax": 18000, "weeks": 4},
        {"label": "10+", "addMin": 15000, "addMax": 35000, "weeks": 8},
    ],
    "architectureNote": "Dynamic application pricing is primarily based on features, roles, data, workflows and integrations rather than screen count.",
    "philosophyHeading": "PRICING BUILT AROUND THE SYSTEM, NOT A RANDOM PACKAGE.",
    "philosophyBody": "Every project has different requirements. A five-page static company website is fundamentally different from a five-page application with authentication, dashboards, database workflows and administrative tools. Pricing is therefore calculated from actual scope rather than page count alone.",
    "resultDisclaimer": "THIS IS NOT A FINAL QUOTATION. Your final quotation is based on what the project actually needs.",
}


async def migrate_v5():
    # capabilities: status -> standardized proficiency level
    async for cat in db.services.find({}):
        changed = False
        caps = cat.get("capabilities", [])
        for cap in caps:
            if "level" not in cap:
                cap["level"] = LEVEL_MAP.get(cap.get("status"), "WORKING KNOWLEDGE")
                cap["shortDesc"] = cap.get("desc", "")
                cap.setdefault("detail", "")
                cap.setdefault("technologies", [])
                cap.setdefault("projects", [])
                cap.setdefault("price", "")
                cap.setdefault("featured", False)
                cap.setdefault("visible", True)
                cap.pop("status", None)
                cap.pop("desc", None)
                changed = True
        if changed or "slug" not in cat:
            slug = cat.get("slug") or re.sub(r"[^a-z0-9]+", "-", cat.get("title", "").lower()).strip("-")
            await db.services.update_one(
                {"id": cat["id"]},
                {"$set": {"capabilities": caps, "slug": slug, "featured": cat.get("featured", False),
                          "longDescription": cat.get("longDescription", "")}},
            )
    # pricing: rebuild to range-based references if legacy shape
    legacy = await db.pricing.find_one({"min": {"$exists": False}})
    if legacy:
        await db.pricing.delete_many({})
        await db.pricing.insert_many([dict(p) for p in PRICING_V2])
    # estimator: merge v2 keys
    est = await db.singletons.find_one({"key": "estimator"})
    if est and "types" in est.get("data", {}) and "pageBrackets" not in est["data"]:
        data = est["data"]
        data.update(ESTIMATOR_V2)
        await db.singletons.update_one({"key": "estimator"}, {"$set": {"data": data}})


DEFAULT_CONTACT = {
    "email": "aleanaamurao12@gmail.com",
    "mobile": "0945 137 3741",
    "whatsapp": "639451373741",
    "facebookName": "Yenzii Stdio",
    "facebookUrl": "",
    "github": "",
    "linkedin": "",
    "other": "",
}


async def migrate_v6():
    # contact singleton: single source of truth for direct channels
    existing = await db.singletons.find_one({"key": "contact"})
    if not existing:
        await db.singletons.insert_one(
            {"key": "contact", "data": dict(DEFAULT_CONTACT), "updated_at": datetime.now(timezone.utc).isoformat()}
        )
    # proficiency labels: EXPERIENCE / AVAILABLE -> standardized scale
    await db.technologies.update_many({"level": "EXPERIENCE"}, {"$set": {"level": "PROFICIENT"}})
    await db.technologies.update_many({"level": "AVAILABLE"}, {"$set": {"level": "FAMILIAR"}})
    async for sk in db.skills.find({}):
        items = sk.get("items", [])
        changed = False
        for it in items:
            if it.get("level") in ("EXPERIENCE", "AVAILABLE"):
                it["level"] = "PROFICIENT" if it["level"] == "EXPERIENCE" else "FAMILIAR"
                changed = True
        if changed:
            await db.skills.update_one({"id": sk["id"]}, {"$set": {"items": items}})
    # homepage config: remove journey section, add contact channels + roadmap phases
    defaults = home_cms.default_homepage_config()
    async for doc in db.homepage_config.find({"key": {"$in": ["draft", "published"]}}):
        data = doc.get("data", {})
        changed = False
        sections = [s for s in data.get("sections", []) if s.get("key") != "journey"]
        if len(sections) != len(data.get("sections", [])):
            changed = True
        if not any(s.get("key") == "contactChannels" for s in sections):
            idx = next((i for i, s in enumerate(sections) if s.get("key") == "finalCta"), len(sections))
            sections.insert(idx, {"key": "contactChannels", "visible": True})
            changed = True
        data["sections"] = sections
        data.pop("journey", None)
        if "contactChannels" not in data:
            data["contactChannels"] = defaults["contactChannels"]
            changed = True
        rm = data.get("roadmap", {})
        if "phases" not in rm:
            rm.update(defaults["roadmap"])
            rm.pop("stages", None)
            rm.pop("intro", None)
            changed = True
        if changed:
            await db.homepage_config.update_one({"key": doc["key"]}, {"$set": {"data": data}})


async def seed_content():
    await migrate_v5()
    await migrate_v6()
    if await db.services.count_documents({}) == 0:
        await db.services.insert_many([dict(s) for s in DEFAULT_SERVICES])
    if await db.pricing.count_documents({}) == 0:
        await db.pricing.insert_many([dict(p) for p in DEFAULT_PRICING])
    if await db.projects.count_documents({}) == 0:
        await db.projects.insert_many([dict(p) for p in DEFAULT_PROJECTS])
    for name, docs in CMS_SEEDS.items():
        if await db[name].count_documents({}) == 0:
            await db[name].insert_many([dict(d) for d in docs])
    for key, data in SEED_SINGLETONS.items():
        await db.singletons.update_one(
            {"key": key}, {"$setOnInsert": {"key": key, "data": data}}, upsert=True
        )
    # migration: v1 records lack CMS status flags
    for name in cms.PUBLISHABLE:
        await db[name].update_many({"status": {"$exists": False}}, {"$set": {"status": "published"}})
        await db[name].update_many({"archived": {"$exists": False}}, {"$set": {"archived": False}})
    # seed default About profile if none exists
    if await db.about_profiles.count_documents({}) == 0:
        doc = about_cms.default_profile(name="Professional About 2026", template=4)
        doc["status"] = "published"
        doc["published_at"] = doc["created_at"]
        await db.about_profiles.insert_one(doc)
    await db.about_preview_tokens.create_index("token")


@app.on_event("startup")
async def startup():
    await create_indexes()
    await db.password_reset_tokens.create_index("token")
    await seed_admin()
    await seed_content()
    try:
        init_storage()
        await ensure_generated_resume()
    except Exception as e:
        logger.error(f"Storage/resume init failed: {e}")


@app.on_event("shutdown")
async def shutdown():
    client.close()


api.include_router(cms.router, prefix="/admin")
api.include_router(about_cms.router, prefix="/admin/about")
api.include_router(home_cms.router, prefix="/admin/homepage-config")
app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
