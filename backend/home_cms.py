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
            "heading": "FEATURED SERVICES",
            "mode": "categories",
            "ids": [],
            "max": 4,
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
            "scopeLabel": "DEVELOPMENT WORKFLOW — SYSTEM / WEB / APP PROJECTS",
            "whyHeading": "WHY SCRUM + PROTOTYPING?",
            "whyBody": [
                "I prefer an iterative development process because websites, applications and systems rarely become perfect from the first plan. Requirements change, users reveal problems, workflows become clearer and better solutions appear once something actually exists to test.",
                "I use Scrum-inspired planning to break large projects into manageable pieces and rapid prototyping to validate ideas before committing too much time to the wrong solution.",
                "The goal is not to follow Scrum ceremonially. The goal is to keep development visible, testable and adaptable.",
            ],
            "loopFrom": "REVIEW",
            "loopTo": "BUILD",
            "loopLabel": "ITERATION LOOP — refine and rebuild until accepted, then ship",
            "phases": [
                {"num": "01", "title": "DISCOVER", "desc": "Understand the problem, users, objectives and constraints before anything is designed or built.",
                 "subs": ["REQUIREMENTS", "STAKEHOLDERS", "CONSTRAINTS"], "type": "Planning", "visible": True},
                {"num": "02", "title": "PLAN", "desc": "Translate requirements into a prioritized backlog and realistic sprint slices.",
                 "subs": ["PRODUCT BACKLOG", "SPRINT PLAN", "PRIORITIES"], "type": "Planning", "visible": True},
                {"num": "03", "title": "PROTOTYPE", "desc": "Wireframes, UI flows and clickable concepts — validated before committing to the full build.",
                 "subs": ["WIREFRAMES", "UI FLOWS", "FEEDBACK", "REVISION"], "type": "Design", "visible": True, "loopTag": "FEEDBACK LOOP"},
                {"num": "04", "title": "BUILD", "desc": "Frontend, backend, database and integrations developed in sprint-sized pieces.",
                 "subs": ["FRONTEND", "BACKEND", "DATABASE", "INTEGRATION"], "type": "Development", "visible": True},
                {"num": "05", "title": "REVIEW", "desc": "Test the working iteration against requirements — accept it, or refine and loop back into build.",
                 "subs": ["TESTING", "FEEDBACK", "REFINEMENT"], "type": "Review", "visible": True, "loopTag": "↺ LOOPS TO BUILD"},
                {"num": "06", "title": "SHIP", "desc": "Deploy a stable version, document it, support it — and keep iterating as real needs surface.",
                 "subs": ["DEPLOY", "DOCUMENT", "SUPPORT", "ITERATE"], "type": "Deployment", "visible": True},
            ],
        },
        "contactChannels": {
            "heading": "DIRECT_CHANNELS",
            "sub": "No forms required. Reach me directly through any of these channels.",
            "showEmail": True, "showWhatsapp": True, "showFacebook": True,
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
            {"key": "contactChannels", "visible": True},
            {"key": "finalCta", "visible": True},
        ],
    }


async def get_draft():
    doc = await db.homepage_config.find_one({"key": "draft"}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=503, detail="Homepage draft is not initialized.")
    return doc


async def get_published():
    doc = await db.homepage_config.find_one({"key": "published"}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=503, detail="Published homepage is not initialized.")
    return doc


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
