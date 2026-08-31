import uuid
import secrets
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, HTTPException, Depends

from db import db
from auth import get_current_admin

router = APIRouter()


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def default_homepage_config():
    return {
        "hero": {
            "eyebrow": "FULL-STACK DEVELOPER / PHILIPPINES",
            "title": "I BUILD SYSTEMS\nTHAT WORK BEYOND\nTHE *INTERFACE.*",
            "paragraph": "I design and develop full-stack web applications, information systems, e-commerce platforms, APIs, databases, and digital experiences — from idea and interface to deployment.",
            "availabilityLabel": "",
            "primaryCta": "Start a Project →",
            "secondaryCta": "Explore My Work",
            "resumeCta": "Download CV ↓",
        },
        "announcement": "",
        "showAnnouncement": False,
        "systemProfile": {
            "label": "SYSTEM PROFILE",
            "displayName": "ALEANA_AMURAO",
            "role": "FULL_STACK_SYSTEMS_DEVELOPER",
            "secondaryTitle": "WORKING STUDENT · FREELANCE DEVELOPER",
            "location": "PHILIPPINES",
            "capabilities": [
                {"label": "Backend Development", "status": "CORE", "visible": True},
                {"label": "Laravel", "status": "CORE", "visible": True},
                {"label": "Full-Stack Development", "status": "CORE", "visible": True},
                {"label": "Frontend Development", "status": "PROFICIENT", "visible": True},
                {"label": "Vue.js", "status": "PROFICIENT", "visible": True},
                {"label": "Database Development", "status": "PROFICIENT", "visible": True},
                {"label": "System Design", "status": "PROFICIENT", "visible": True},
                {"label": "UI/UX", "status": "WORKING KNOWLEDGE", "visible": True},
                {"label": "React", "status": "WORKING KNOWLEDGE", "visible": True},
                {"label": "Python / Django", "status": "WORKING KNOWLEDGE", "visible": True},
            ],
            "projectMetric": {"mode": "auto-published", "manualValue": "", "label": "DEPLOYED"},
        },
        "metrics": {
            "items": [
                {"key": "projects", "label": "PUBLISHED PROJECTS", "visible": True},
                {"key": "technologies", "label": "TECHNOLOGIES", "visible": True},
                {"key": "services", "label": "SERVICES", "visible": True},
                {"key": "certifications", "label": "CERTIFICATIONS", "visible": True},
                {"key": "education", "label": "EDUCATION", "visible": True},
            ]
        },
        "featuredProjects": {
            "heading": "FEATURED PROJECTS",
            "label": "PROJECT_INDEX / FEATURED",
            "ids": [],
            "max": 4,
            "showImage": True, "showStack": True, "showDescription": True, "showRole": True, "showYear": True,
        },
        "whatIBuild": {
            "heading": "WHAT I BUILD",
            "items": [
                {"title": "WEB APPLICATIONS", "desc": "Database-driven applications with real business logic — not page collections.", "techLabel": "SYS.WEBAPP", "visible": True},
                {"title": "E-COMMERCE PLATFORMS", "desc": "Storefronts with cart, checkout, orders, inventory, and payment integration.", "techLabel": "SYS.COMMERCE", "visible": True},
                {"title": "INFORMATION SYSTEMS", "desc": "Internal systems that digitize how organizations actually operate.", "techLabel": "SYS.MIS", "visible": True},
                {"title": "CUSTOM SYSTEMS", "desc": "Applications built around specific business workflows instead of forcing a company into a generic template.", "techLabel": "SYS.CUSTOM", "visible": True},
            ],
        },
        "services": {
            "heading": "SERVICES",
            "mode": "categories",
            "ids": [],
            "max": 7,
            "showCount": True,
            "ctaLabel": "VIEW ALL SERVICES →",
        },
        "techStack": {
            "heading": "TECHNICAL STACK",
            "sub": "Proficiency labeled honestly. No fake percentages.",
            "ids": [],
        },
        "roadmap": {
            "heading": "SCRUM / PROTOTYPE ROADMAP",
            "intro": "My workflow combines Scrum-inspired planning and iteration with rapid prototyping. I break larger systems into manageable features, produce working versions early, review them against requirements, and refine the system through repeated development cycles.",
            "loopFrom": "REVIEW",
            "loopTo": "BUILD",
            "stages": [
                {"num": "01", "title": "DISCOVER", "desc": "Understand the problem, users, objectives and constraints.", "type": "Planning", "visible": True},
                {"num": "02", "title": "REQUIREMENTS", "desc": "Translate needs into system requirements and expected workflows.", "type": "Planning", "visible": True},
                {"num": "03", "title": "PRODUCT BACKLOG", "desc": "Break larger requirements into manageable features and priorities.", "type": "Planning", "visible": True},
                {"num": "04", "title": "UI / UX PROTOTYPE", "desc": "Create flows, interfaces and working concepts before committing to the complete build.", "type": "Design", "visible": True},
                {"num": "05", "title": "SPRINT PLANNING", "desc": "Choose what can realistically be developed in the next iteration.", "type": "Planning", "visible": True},
                {"num": "06", "title": "BUILD", "desc": "Develop frontend, backend, database and integrations.", "type": "Development", "visible": True},
                {"num": "07", "title": "TEST", "desc": "Validate features, workflows, responsiveness and edge cases.", "type": "Testing", "visible": True},
                {"num": "08", "title": "SPRINT REVIEW", "desc": "Evaluate the working iteration against requirements and feedback.", "type": "Review", "visible": True},
                {"num": "09", "title": "REFINE", "desc": "Improve functionality, UX, architecture or logic based on findings.", "type": "Review", "visible": True},
                {"num": "10", "title": "DEPLOY", "desc": "Prepare and release a stable version.", "type": "Deployment", "visible": True},
                {"num": "11", "title": "DOCUMENT", "desc": "Prepare user, technical or project documentation where required.", "type": "Support", "visible": True},
                {"num": "12", "title": "SUPPORT / ITERATE", "desc": "Continue improving the system as new needs are discovered.", "type": "Support", "visible": True},
            ],
        },
        "journey": {
            "heading": "JOURNEY.LOG",
            "mode": "latest",
            "ids": [],
            "max": 4,
        },
        "finalCta": {
            "eyebrow": "SYSTEM STATUS: AVAILABLE",
            "heading": "HAVE SOMETHING\nTO *BUILD?*",
            "body": "Tell me what you're building, what problem you're solving, or what existing system needs improvement.",
            "buttonLabel": "LET'S TALK →",
        },
        "sections": [
            {"key": "hero", "visible": True},
            {"key": "metrics", "visible": True},
            {"key": "featuredProjects", "visible": True},
            {"key": "whatIBuild", "visible": True},
            {"key": "services", "visible": True},
            {"key": "techStack", "visible": True},
            {"key": "roadmap", "visible": True},
            {"key": "journey", "visible": True},
            {"key": "finalCta", "visible": True},
        ],
    }


async def get_draft():
    doc = await db.homepage_config.find_one({"key": "draft"}, {"_id": 0})
    if not doc:
        doc = {"key": "draft", "data": default_homepage_config(), "updated_at": now_iso()}
        await db.homepage_config.insert_one(doc)
        doc.pop("_id", None)
    return doc


async def get_published():
    doc = await db.homepage_config.find_one({"key": "published"}, {"_id": 0})
    if doc:
        return doc
    draft = await get_draft()
    pub = {"key": "published", "data": draft["data"], "updated_at": now_iso(), "published_at": now_iso()}
    await db.homepage_config.insert_one(pub)
    pub.pop("_id", None)
    return pub


@router.get("")
async def read_homepage(admin=Depends(get_current_admin)):
    draft = await get_draft()
    published = await db.homepage_config.find_one({"key": "published"}, {"_id": 0})
    return {
        "draft": draft["data"],
        "updated_at": draft.get("updated_at"),
        "published_at": (published or {}).get("published_at"),
        "has_unpublished_changes": bool(published) and published.get("data") != draft["data"],
    }


@router.put("")
async def save_homepage(payload: dict, admin=Depends(get_current_admin)):
    old = await get_draft()
    await db.homepage_revisions.update_one(
        {"key": "homepage"},
        {"$push": {"snapshots": {"$each": [{"at": now_iso(), "data": old["data"]}], "$slice": -15}}},
        upsert=True,
    )
    await db.homepage_config.update_one(
        {"key": "draft"}, {"$set": {"data": payload, "updated_at": now_iso()}}, upsert=True
    )
    return {"status": "ok", "updated_at": now_iso()}


@router.post("/publish")
async def publish_homepage(admin=Depends(get_current_admin)):
    draft = await get_draft()
    await db.homepage_config.update_one(
        {"key": "published"},
        {"$set": {"data": draft["data"], "updated_at": now_iso(), "published_at": now_iso()}},
        upsert=True,
    )
    return {"status": "ok"}


@router.post("/preview-token")
async def homepage_preview_token(admin=Depends(get_current_admin)):
    token = secrets.token_urlsafe(24)
    await db.about_preview_tokens.insert_one({
        "token": token, "kind": "homepage",
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=2)).isoformat(),
    })
    return {"token": token, "url": f"/home-preview/{token}"}


@router.get("/revisions")
async def homepage_revisions(admin=Depends(get_current_admin)):
    doc = await db.homepage_revisions.find_one({"key": "homepage"}, {"_id": 0})
    snaps = doc.get("snapshots", []) if doc else []
    return [{"at": s["at"], "index": i} for i, s in enumerate(snaps)]


@router.post("/restore-revision/{index}")
async def homepage_restore(index: int, admin=Depends(get_current_admin)):
    doc = await db.homepage_revisions.find_one({"key": "homepage"}, {"_id": 0})
    snaps = doc.get("snapshots", []) if doc else []
    if index < 0 or index >= len(snaps):
        raise HTTPException(status_code=404, detail="Revision not found")
    await db.homepage_config.update_one(
        {"key": "draft"}, {"$set": {"data": snaps[index]["data"], "updated_at": now_iso()}}, upsert=True
    )
    return {"status": "ok"}
