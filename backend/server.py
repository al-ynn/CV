import os
import uuid
import logging
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File
from fastapi.responses import FileResponse
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any

from db import db, client
from auth import (
    create_access_token, verify_password, get_current_admin, seed_admin,
    create_indexes, check_lockout, record_failed_attempt, clear_attempts,
)
from emailer import send_email, inquiry_notification_html
from seed_data import DEFAULT_SETTINGS, DEFAULT_SERVICES, DEFAULT_PRICING, DEFAULT_PROJECTS
from resume import generate_resume, current_resume_path, CUSTOM_PDF

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI()
api = APIRouter(prefix="/api")


# ---------- models ----------

class LoginIn(BaseModel):
    email: EmailStr
    password: str


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


class InquiryStatus(BaseModel):
    status: str


class SettingsIn(BaseModel):
    contactEmail: Optional[str] = ""
    ownerNotifyEmail: Optional[str] = ""
    github: Optional[str] = ""
    linkedin: Optional[str] = ""
    available: Optional[bool] = True
    location: Optional[str] = "Philippines"


class ProjectIn(BaseModel):
    slug: str
    title: str
    subtitle: Optional[str] = ""
    year: Optional[str] = ""
    categories: List[str] = []
    type: Optional[str] = ""
    role: Optional[str] = ""
    disclosure: Optional[str] = "PUBLIC"
    featured: Optional[bool] = False
    order: Optional[int] = 99
    stack: List[str] = []
    features: List[str] = []
    description: Optional[str] = ""
    architecture: List[str] = []
    caseStudy: Optional[dict] = {}


# ---------- public ----------

@api.get("/health")
async def health():
    return {"status": "ok"}


@api.get("/content/bootstrap")
async def bootstrap():
    settings = await db.settings.find_one({"key": "site"}, {"_id": 0}) or dict(DEFAULT_SETTINGS)
    public_settings = {
        "contactEmail": settings.get("contactEmail", ""),
        "github": settings.get("github", ""),
        "linkedin": settings.get("linkedin", ""),
        "available": settings.get("available", True),
        "location": settings.get("location", "Philippines"),
        "siteName": settings.get("siteName", "AMURAO.DEV"),
        "version": settings.get("version", "PORTFOLIO / 1.0"),
    }
    projects = await db.projects.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    services = await db.services.find({}, {"_id": 0}).sort("order", 1).to_list(50)
    pricing = await db.pricing.find({}, {"_id": 0}).sort("order", 1).to_list(50)
    return {"settings": public_settings, "projects": projects, "services": services, "pricing": pricing}


@api.post("/inquiries")
async def create_inquiry(payload: InquiryIn):
    if payload.website:  # honeypot triggered — pretend success
        return {"status": "received"}
    doc = payload.model_dump(exclude={"website"})
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "NEW"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.inquiries.insert_one(doc)

    settings = await db.settings.find_one({"key": "site"}, {"_id": 0}) or {}
    owner = (settings.get("ownerNotifyEmail") or "").strip()
    emailed = False
    if owner:
        try:
            await send_email(
                to=owner,
                subject=f"New project inquiry — {payload.name}",
                html=inquiry_notification_html(doc),
            )
            emailed = True
        except Exception as e:
            logger.error(f"Inquiry email failed: {e}")
    doc.pop("_id", None)
    return {"status": "received", "id": doc["id"], "emailed": emailed}


@api.get("/resume.pdf")
async def resume_pdf():
    return FileResponse(current_resume_path(), media_type="application/pdf", filename="Aleana-Amurao-CV.pdf")


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
    return {"token": token, "user": {"email": email, "name": user.get("name", "Admin"), "role": "admin"}}


@api.get("/auth/me")
async def me(admin=Depends(get_current_admin)):
    return admin


# ---------- admin ----------

@api.get("/admin/stats")
async def admin_stats(admin=Depends(get_current_admin)):
    return {
        "inquiries_total": await db.inquiries.count_documents({}),
        "inquiries_new": await db.inquiries.count_documents({"status": "NEW"}),
        "projects": await db.projects.count_documents({}),
        "services": await db.services.count_documents({}),
        "packages": await db.pricing.count_documents({}),
    }


@api.get("/admin/inquiries")
async def list_inquiries(admin=Depends(get_current_admin)):
    return await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.patch("/admin/inquiries/{inq_id}")
async def update_inquiry(inq_id: str, payload: InquiryStatus, admin=Depends(get_current_admin)):
    await db.inquiries.update_one({"id": inq_id}, {"$set": {"status": payload.status}})
    return {"status": "ok"}


@api.delete("/admin/inquiries/{inq_id}")
async def delete_inquiry(inq_id: str, admin=Depends(get_current_admin)):
    await db.inquiries.delete_one({"id": inq_id})
    return {"status": "ok"}


@api.get("/admin/settings")
async def get_settings(admin=Depends(get_current_admin)):
    s = await db.settings.find_one({"key": "site"}, {"_id": 0}) or dict(DEFAULT_SETTINGS)
    return s


@api.put("/admin/settings")
async def put_settings(payload: SettingsIn, admin=Depends(get_current_admin)):
    await db.settings.update_one({"key": "site"}, {"$set": payload.model_dump()}, upsert=True)
    return {"status": "ok"}


@api.get("/admin/projects")
async def admin_projects(admin=Depends(get_current_admin)):
    return await db.projects.find({}, {"_id": 0}).sort("order", 1).to_list(100)


@api.post("/admin/projects")
async def create_project(payload: ProjectIn, admin=Depends(get_current_admin)):
    existing = await db.projects.find_one({"slug": payload.slug})
    if existing:
        raise HTTPException(status_code=409, detail="Slug already exists")
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    nums = [p.get("num", "000") for p in await db.projects.find({}, {"num": 1}).to_list(200)]
    doc["num"] = f"{len(nums) + 1:03d}"
    await db.projects.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.put("/admin/projects/{proj_id}")
async def update_project(proj_id: str, payload: ProjectIn, admin=Depends(get_current_admin)):
    doc = payload.model_dump()
    await db.projects.update_one({"id": proj_id}, {"$set": doc})
    return {"status": "ok"}


@api.delete("/admin/projects/{proj_id}")
async def delete_project(proj_id: str, admin=Depends(get_current_admin)):
    await db.projects.delete_one({"id": proj_id})
    return {"status": "ok"}


@api.put("/admin/services")
async def put_services(payload: List[dict], admin=Depends(get_current_admin)):
    await db.services.delete_many({})
    if payload:
        await db.services.insert_many([{**s} for s in payload])
    return {"status": "ok"}


@api.put("/admin/pricing")
async def put_pricing(payload: List[dict], admin=Depends(get_current_admin)):
    await db.pricing.delete_many({})
    if payload:
        await db.pricing.insert_many([{**p} for p in payload])
    return {"status": "ok"}


@api.post("/admin/resume")
async def upload_resume(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="PDF only")
    content = await file.read()
    CUSTOM_PDF.parent.mkdir(exist_ok=True)
    CUSTOM_PDF.write_bytes(content)
    return {"status": "ok", "bytes": len(content)}


# ---------- startup ----------

async def seed_content():
    if await db.settings.count_documents({"key": "site"}) == 0:
        await db.settings.insert_one(dict(DEFAULT_SETTINGS))
    if await db.services.count_documents({}) == 0:
        await db.services.insert_many([dict(s) for s in DEFAULT_SERVICES])
    if await db.pricing.count_documents({}) == 0:
        await db.pricing.insert_many([dict(p) for p in DEFAULT_PRICING])
    if await db.projects.count_documents({}) == 0:
        await db.projects.insert_many([dict(p) for p in DEFAULT_PROJECTS])


@app.on_event("startup")
async def startup():
    await create_indexes()
    await seed_admin()
    await seed_content()
    try:
        generate_resume()
    except Exception as e:
        logger.error(f"Resume generation failed: {e}")


@app.on_event("shutdown")
async def shutdown():
    client.close()


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
