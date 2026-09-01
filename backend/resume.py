from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from db import db
from storage import put_object, get_object

GENERATED_PATH = "amurao-dev/resume/generated.pdf"
CUSTOM_PATH = "amurao-dev/resume/custom.pdf"

INK = HexColor("#15132E")
MUTED = HexColor("#5F6880")
VIOLET = HexColor("#6D28D9")
LINE = HexColor("#D8DDE6")

DATA = {
    "name": "ALEANA ROSE C. AMURAO",
    "title": "Full-Stack Developer · Systems Developer · UI/UX Designer · Freelance Technology Partner",
    "location": "Philippines",
    "profile": (
        "BS Information Technology student at Central Luzon State University working as a freelance "
        "full-stack developer. Experienced in developing real-world systems: e-commerce platforms, "
        "information systems, business applications, APIs, databases, administrative dashboards, and "
        "client-facing websites — from planning and interface to deployment and documentation."
    ),
    "education": [("BS Information Technology", "Central Luzon State University", "2023 — Present")],
    "experience": [
        ("Freelance Full-Stack Web Developer", "2025 — Present",
         "Responsive websites and web applications with Laravel, Vue.js, Inertia, and MySQL. WordPress and "
         "WooCommerce builds. Authentication, role-based systems, payment integrations, client requirements, "
         "and post-deployment support."),
        ("IT Commissioner / Full-Stack Developer — VNL Company", "2025 — Present",
         "Project-based full-stack development and technical commissioning."),
        ("IT Commissioner / Full-Stack Developer — CIM Creatives", "2026 — Present",
         "Project-based full-stack development and technical commissioning."),
        ("Customer Support / Cold Caller — Capital Group", "Nov 2024 — Jun 2025",
         "Client communication, outbound sales, and CRM documentation."),
    ],
    "projects": [
        ("StudYA — E-Commerce Platform", "Laravel · Vue.js · Inertia.js · MySQL · HitPay. Authentication, cart, checkout, administration, payments.", "2026"),
        ("SoilTrack — Laboratory Information System", "Sample tracking, results management, SMS logs, role-based dashboards for DA-related operations.", "2026"),
        ("Camela — E-Commerce Website", "Laravel · MySQL · REST APIs · Stripe. Converted an incomplete AI-generated frontend into an operational system.", "2026"),
        ("IoT Operations Platform", "Role-based access, dashboards, QR workflows, validation, reporting, audit logging.", "2026"),
        ("Professional CV Website", "WordPress · Elementor responsive portfolio/CV website.", "2024"),
    ],
    "skills": [
        "Frontend: HTML, CSS, JavaScript, Vue.js, React, Inertia.js",
        "Backend: PHP, Laravel, Python, Django, Java",
        "Database: MySQL, relational database design",
        "CMS: WordPress, WooCommerce, Elementor",
        "Design: Figma, UI/UX, prototyping, Draw.io",
        "Workflow: Git, GitHub, REST APIs, Agile, Scrum, documentation, testing",
    ],
    "certification": ("Google Agile Essentials Specialization", "Coursera × Google", "July 2026"),
}


def _wrap(text, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 <= width:
            cur = f"{cur} {w}".strip()
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def build_resume_bytes(portrait_bytes: bytes | None = None) -> bytes:
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    W, H = A4
    x, y = 18 * mm, H - 18 * mm

    def line(dy, size=9, font="Helvetica", color=INK, text=""):
        nonlocal y
        c.setFont(font, size)
        c.setFillColor(color)
        c.drawString(x, y, text)
        y -= dy

    def heading(text):
        nonlocal y
        y -= 3 * mm
        c.setStrokeColor(LINE)
        c.setLineWidth(0.5)
        c.line(x, y, W - 18 * mm, y)
        y -= 5 * mm
        c.setFont("Courier-Bold", 8)
        c.setFillColor(VIOLET)
        c.drawString(x, y, text.upper())
        y -= 4.5 * mm

    # optional portrait, top-right
    if portrait_bytes:
        try:
            ps = 26 * mm
            px, py = W - 18 * mm - ps, H - 18 * mm - ps + 4 * mm
            c.saveState()
            c.setStrokeColor(LINE)
            c.setLineWidth(0.7)
            c.rect(px, py, ps, ps, stroke=1, fill=0)
            c.drawImage(ImageReader(BytesIO(portrait_bytes)), px, py, ps, ps,
                        preserveAspectRatio=True, anchor="c", mask="auto")
            c.restoreState()
        except Exception:
            pass

    c.setFont("Courier", 7.5)
    c.setFillColor(VIOLET)
    c.drawString(x, y, "RESUME / CV — AMURAO.DEV")
    y -= 7 * mm
    line(7 * mm, 17, "Helvetica-Bold", INK, DATA["name"])
    line(5 * mm, 8.5, "Helvetica", MUTED, DATA["title"])
    line(6 * mm, 8.5, "Courier", MUTED, f"LOCATION: {DATA['location'].upper()}")

    heading("Profile")
    for ln in _wrap(DATA["profile"], 100):
        line(4.2 * mm, 9, "Helvetica", INK, ln)

    heading("Education")
    for deg, school, yr in DATA["education"]:
        line(4.5 * mm, 9.5, "Helvetica-Bold", INK, deg)
        line(4 * mm, 8.5, "Helvetica", MUTED, f"{school}  ·  {yr}")

    heading("Experience")
    for role, yr, desc in DATA["experience"]:
        line(4.5 * mm, 9.5, "Helvetica-Bold", INK, role)
        line(3.8 * mm, 8, "Courier", VIOLET, yr)
        for ln in _wrap(desc, 105):
            line(4 * mm, 8.5, "Helvetica", MUTED, ln)
        y -= 1.5 * mm

    heading("Selected Projects")
    for title, desc, yr in DATA["projects"]:
        line(4.5 * mm, 9.5, "Helvetica-Bold", INK, f"{title}  ·  {yr}")
        for ln in _wrap(desc, 105):
            line(4 * mm, 8.5, "Helvetica", MUTED, ln)
        y -= 1 * mm

    heading("Technical Skills")
    for s in DATA["skills"]:
        line(4.2 * mm, 8.5, "Helvetica", INK, s)

    heading("Certification")
    name, org, yr = DATA["certification"]
    line(4.5 * mm, 9.5, "Helvetica-Bold", INK, name)
    line(4 * mm, 8.5, "Helvetica", MUTED, f"{org}  ·  {yr}")

    c.setFont("Courier", 7)
    c.setFillColor(MUTED)
    c.drawString(x, 12 * mm, "BUILD / SHIP / ITERATE — generated by amurao.dev, replaceable via admin panel")
    c.save()
    return buf.getvalue()


async def get_portrait_bytes() -> bytes | None:
    prof = await db.about_profiles.find_one({"status": "published"}, {"_id": 0, "photos": 1})
    if not prof:
        return None
    photos = prof.get("photos") or []
    port = next((ph for ph in photos if ph.get("role") == "Professional Portrait" and ph.get("url")), None)
    if not port:
        return None
    media_id = port["url"].rstrip("/").split("/")[-1]
    media = await db.media.find_one({"id": media_id, "is_deleted": {"$ne": True}}, {"_id": 0})
    if not media:
        return None
    try:
        data, _ = await get_object(media["storage_path"])
        return data
    except Exception:
        return None


async def ensure_generated_resume():
    existing = await db.files.find_one({"kind": "resume_generated", "is_deleted": False})
    if existing:
        return
    portrait = await get_portrait_bytes()
    data = build_resume_bytes(portrait)
    result = await put_object(GENERATED_PATH, data, "application/pdf")
    await db.files.update_one(
        {"kind": "resume_generated"},
        {"$set": {"kind": "resume_generated", "storage_path": result["path"], "is_deleted": False,
                  "size": result["size"], "content_type": "application/pdf"}},
        upsert=True,
    )


async def get_resume_bytes() -> bytes:
    custom = await db.files.find_one({"kind": "resume_custom", "is_deleted": False})
    if custom:
        data, _ = await get_object(custom["storage_path"])
        return data
    # regenerate fresh so the CV always reflects the current portrait
    portrait = await get_portrait_bytes()
    return build_resume_bytes(portrait)


async def save_custom_resume(content: bytes, filename: str) -> dict:
    result = await put_object(CUSTOM_PATH, content, "application/pdf")
    doc = {"kind": "resume_custom", "storage_path": result["path"], "is_deleted": False,
           "size": result["size"], "filename": filename, "content_type": "application/pdf"}
    await db.files.update_one({"kind": "resume_custom"}, {"$set": doc}, upsert=True)
    return doc
