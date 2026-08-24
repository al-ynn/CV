from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

STATIC_DIR = Path(__file__).parent / "static"
GENERATED_PDF = STATIC_DIR / "resume_generated.pdf"
CUSTOM_PDF = STATIC_DIR / "resume_custom.pdf"

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


def generate_resume() -> Path:
    STATIC_DIR.mkdir(exist_ok=True)
    c = canvas.Canvas(str(GENERATED_PDF), pagesize=A4)
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
    return GENERATED_PDF


def current_resume_path() -> Path:
    if CUSTOM_PDF.exists():
        return CUSTOM_PDF
    if not GENERATED_PDF.exists():
        generate_resume()
    return GENERATED_PDF
