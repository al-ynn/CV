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

## Implemented (2026-08-24 v1, rebuilt + CMS 2026-08-31 v2)
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
