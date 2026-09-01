# PRD — AMURAO.DEV — Personal Full-Stack Developer Website + CMS

## Original Problem Statement
Production-quality personal portfolio, CV, services, and freelance developer website for
Aleana Rose C. Amurao (BS IT student at Central Luzon State University + working freelance
full-stack developer), with a complete admin CMS so ALL public content is managed from a
dashboard without touching source code. Visual motif: dark technical/system-interface
aesthetic + polished light mode. Concept: "a résumé encoded into a software interface".

## Architecture
- Frontend: React 19 (CRA/craco), Tailwind CSS-var design tokens, framer-motion, lenis,
  cmdk palette, react-router v7
- Backend: FastAPI + Motor (MongoDB), JWT admin auth (bcrypt, 5-attempt lockout,
  12h sessions, forgot/reset via Resend email), generic schema-driven CMS CRUD
- Storage: Emergent object storage for resume PDF + media library (persists in production)
- Email: Resend managed integration (inquiry notifications + password reset links)
- Content model: MongoDB collections (projects, services, pricing, experience, education,
  certifications, journey, skills, technologies, media, inquiries, activity, revisions,
  users) + singletons (homepage, about, profile, seo, site, estimator, appearance)
- Every publishable record: status (draft/published/hidden), archived (soft delete),
  order, created_at, updated_at. Public API only returns published + non-archived.

## Implemented (2026-08-24 v1, rebuilt + CMS 2026-08-31 v2, About CMS 2026-08-31 v3)
- About Page Builder (v3): about_profiles collection with versions (draft/published/
  archived/trash), one-live-publish with automatic demote of the previous version,
  30-day trash retention with auto-purge and restore, duplicate, revision history
  (restore creates a draft), secure 2h preview tokens (/about-preview/:token),
  5 templates (Profile / Dual Frame / Story / System Profile / Editorial Journey)
  sharing one section library, photo management with roles + focal-point picker
  (object-position, originals untouched), section manager (show/hide/reorder) +
  custom section builder (text/quote/cards/timeline/gallery/cta), dynamic stats
  computed from real DB counts, per-profile SEO fields, autosave drafts (20s) +
  unsaved-changes guard, device preview modal (desktop/tablet/mobile iframe)
- Homepage CMS (v4): homepage_config with draft/published documents — Save Draft keeps
  the public page untouched until Publish; preview tokens (desktop/tablet/mobile);
  revision history. All sections manageable: hero, System Profile (identity fields +
  capability editor with 5-step proficiency scale LEARNING→CORE replacing fake
  percentages; configurable project metric: auto-published/auto-featured/manual/hidden),
  homepage metrics (DB-derived, selectable), featured projects (reference Projects CMS,
  order + display toggles + max), What I Build items, services selection (references
  Services CMS), tech stack visibility (statuses via Technologies CMS), Scrum/Prototype
  roadmap (12 editable stages + iteration loop visualization), journey log
  (latest/selected/all modes), final CTA, master section visibility + ordering
- Rewritten professional story content (athlete → shift → SoilTrack → working
  student → senior target) seeded as "Professional About 2026" (published, T04)
- Public site: Home (CMS-driven hero, section visibility toggles, announcement bar),
  About (bio/focus/work-type from CMS), Work (filters + URL state), Case studies
  (12 editable sections, links, cover image, disclosure levels), Services (CMS panels),
  Pricing (CMS packages + CMS-configured estimator), Journey (CMS git-log + experience),
  Resume (web CV + PDF from object storage), Contact (validation + deployment sequence
  + honeypot), theme system (dark/light/system, persisted), command palette, SEO hook,
  dynamic sitemap.xml, robots.txt
- Admin CMS at /admin: dashboard (real stats, global search, quick actions, activity,
  latest inquiries), generic CRUD for 9 collections with search/filters/reorder
  (up-down buttons)/duplicate/archive/restore/hard-delete, draft/publish workflow,
  unsaved-changes guard, preview links, revision history (projects/pricing/homepage),
  singleton editors (homepage, about, profile, SEO, site settings, estimator,
  appearance), media library (upload to object storage, alt text, copy URL, soft delete),
  resume replace, inbox with statuses (NEW/READ/REPLIED/QUALIFIED/CLOSED/SPAM) +
  private notes, activity log, JSON export, change password, forgot/reset password
- Security: server-side authz on every /admin route, bcrypt, login lockout, upload
  validation (MIME + 8MB), honeypot spam trap, no open admin registration
- Appearance: accent color configurable (violet/cyan/pink/amber/green)

## Verified
- Backend: full lifecycle create→publish→public-visible→duplicate→archive→restore→
  hard-delete; draft/hidden excluded from public API; media upload/serve/soft-delete;
  resume.pdf from object storage; activity log; export; search; singletons
- Frontend: home renders CMS content; admin login, dashboard, project list, editor

## Implemented (2026-09-01 v5 — ambient design pass + micro-interactions)
- Aurora/orb/dot-matrix ambient backgrounds across Home, Services, all 5 About templates
  (pure transform/opacity CSS, reduced-motion safe, blur reduced on small screens)
- Cursor Trail: soft violet cursor-follow glow (CursorTrail.jsx, mounted in Layout);
  desktop fine-pointer only, disabled on touch / reduced-motion / ≤2-core devices
- Hero Terminal: live typing deployment-log chip inside System Profile panel
  (DeployLog in Home.jsx, loops 4 log lines; static final line under reduced motion)
- Case Study polish: aurora band + orbs behind header, gradient-text accent and
  gradient-fill CTA on the closing panel (CaseStudy.jsx)
- Experience git-log timeline: deterministic commit-hash prefixes, "$ git log --graph"
  chips, animated gradient connector beams (.timeline-beam / -amb, reduced-motion safe)
- Homepage one-click presets (HomepageAdmin.jsx): RECRUITER MODE (hero → tech stack →
  metrics → projects, skills/CV first), CLIENT MODE (services/projects first), DEFAULT.
  Reorders draft sections only; active preset auto-detected and highlighted. Recruiter
  draft currently saved (public unchanged) with a live real-data preview verified.

## Pending / Notes
- Owner notification email + public contact email + social URLs: set in Admin →
  Site Settings / Profile (blank = hidden, per no-fabrication rule)
- Project screenshots: user provides later; cover image field ready in project editor
- Rich text: long fields are plain-textareas with newline rendering (safe by default);
  a full rich-text editor is a future enhancement
- Drag-and-drop: accessible up/down ordering buttons used instead
- Testimonials: section exists in section-visibility toggles, stays off until real quotes

## Credentials
See /app/memory/test_credentials.md — admin@amurao.dev / AmuraoDev-2026!

## 2026-06 — Preview URL fix
- Root cause of "page not viewing properly": frontend/.env had REACT_APP_BACKEND_URL=http://localhost:8001 (set during a prior fork). Works inside pod, fails from external browser.
- Fix: set REACT_APP_BACKEND_URL to external preview endpoint (env `preview_endpoint`: https://b04cb3fe-b471-4891-b54e-b6ed0b7200e0.preview.emergentagent.com) and restarted frontend.
- Uploaded backend.zip = identical backend code (CRLF + local venv only), no DB dump. Existing MongoDB (DB_NAME=cv) already seeded with real data.
- Admin: /admin — admin@amurao.dev / AmuraoDev-2026!
