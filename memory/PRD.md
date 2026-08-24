# PRD — AMURAO.DEV — Personal Full-Stack Developer Website

## Original Problem Statement
Production-quality personal portfolio, CV, services, and freelance developer website for
Aleana Rose C. Amurao (BS IT student at Central Luzon State University + working freelance
full-stack developer). Visual motif: dark technical/system-interface aesthetic (near-black,
purple/navy undertones, monospace labels, thin outlined containers, diagram layouts) with a
proper light mode. Concept: "a résumé encoded into a software interface". Includes services
(7 categories), project case studies, pricing in PHP, quote estimator, contact system,
developer journey (git-log style), and an admin panel to manage projects, categories,
pricing, and site settings.

## Architecture
- Frontend: React 19 (CRA/craco), Tailwind (custom CSS-var design tokens), framer-motion,
  lenis smooth scroll, cmdk command palette, react-router v7
- Backend: FastAPI + Motor (MongoDB), JWT admin auth (bcrypt, brute-force lockout),
  Resend managed email via integration proxy, reportlab PDF résumé generation
- Content: MongoDB collections (settings, projects, services, pricing, inquiries, users)
  seeded from backend/seed_data.py; static editorial data (experience, journey, stack,
  certifications, process) in frontend/src/data/content.js
- Admin: /admin route — JWT Bearer auth, tabs: Overview, Inquiries, Projects, Services,
  Pricing, Settings (incl. CV PDF upload)

## User Personas
- Potential freelance clients (evaluate services/pricing, send inquiries)
- Recruiters / software companies (CV, projects, stack)
- Aleana (admin: manage content, read inquiries, replace CV)

## Implemented (2026-08-24)
- Full public site: Home (kinetic masked hero + System Profile widget + parallax),
  About, Work (filterable archive, URL query state), Case studies with architecture
  diagrams, Services (7 expandable technical panels), Pricing + interactive quote
  estimator (₱ ranges, brief handoff to contact), Journey (JOURNEY.LOG git timeline +
  experience), Resume (web CV + generated PDF download), Contact (deployment-sequence
  submit, saves to MongoDB, emails owner when configured), 404
- Theme system: dark (default) / light / system, persisted, FOUC-safe inline script
- Command palette (Ctrl/Cmd+K), editorial marquee, hover swap micro-interactions,
  reduced-motion support, data-testids throughout
- Admin panel: JWT login, metrics overview, inquiry inbox (read/archive/delete/reply),
  project CRUD (incl. case study fields, disclosure levels), services editor,
  pricing editor, site settings, CV PDF upload/replace
- Backend: seeded content (5 projects, 7 service categories, 6 pricing packages),
  /api/content/bootstrap, /api/inquiries (honeypot spam trap), /api/resume.pdf,
  /api/auth/*, /api/admin/* (all auth-guarded)
- Email: Resend managed integration wired (notification template ready); activates once
  ownerNotifyEmail is set in Admin → Settings

## Pending / Notes
- Owner email + public contact email + GitHub/LinkedIn URLs: NOT provided yet —
  set them in Admin → Settings (social links stay hidden until configured; no fakes)
- Project screenshots: intentionally none (abstract technical panels per user choice) —
  user will provide later; architecture diagrams fill the visual role
- Testimonials: architecture intentionally omitted until real ones exist (per brief)

## Backlog
- P0: Set real emails/socials in Admin → Settings; verify inquiry email delivery
- P1: Project screenshot/media support in admin editor
- P1: Admin editors for journey/experience/stack (currently in src/data/content.js)
- P2: Testimonials section (disabled until real quotes exist)
- P2: Sitemap.xml + JSON-LD structured data endpoints
- P2: Per-page meta tags (react-helmet or similar)

## Credentials
See /app/memory/test_credentials.md — admin@amurao.dev / AmuraoDev-2026!
