import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Reveal, TechLabel, LevelTag, StatusDot } from "../system/bits";
import { periodOf } from "../../data/content";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

export const TEMPLATE_META = {
  1: { name: "PROFILE", photos: "1", best: "Recruiters · clean CV-style" },
  2: { name: "DUAL FRAME", photos: "2", best: "Person + developer contrast" },
  3: { name: "STORY", photos: "3", best: "Narrative — athlete to developer" },
  4: { name: "SYSTEM PROFILE", photos: "4", best: "Technical interface motif" },
  5: { name: "EDITORIAL JOURNEY", photos: "5–8", best: "Long-form personal story" },
};

export const SECTION_LABELS = {
  intro: "Introduction / Bio", story: "My Story", workingStudent: "Working Student",
  howIWork: "How I Work", principles: "Principles", specializations: "What I Specialize In",
  beyondCode: "Beyond Code", offClock: "Sports & Gaming", interests: "Interests",
  careerGoal: "Career Goal", openTo: "Open To Opportunities", stats: "Statistics",
  currentFocus: "Current Focus", education: "Education", experience: "Work Experience",
  projects: "Projects Highlight", certifications: "Certifications",
  storyTimeline: "Interactive Timeline", gallery: "Photo Gallery",
  resumeCta: "Resume CTA", contactCta: "Contact CTA",
};

export function AccentText({ text, className = "" }) {
  return (
    <span className={className}>
      {(text || "").split(/(\*[^*]+\*)/g).map((part, j) =>
        part.startsWith("*") ? (
          <span key={j} className="text-violet">{part.replaceAll("*", "")}</span>
        ) : (
          part
        )
      )}
    </span>
  );
}

export function Photo({ photo, className = "", ratio = "aspect-[4/5]", eager = false }) {
  if (!photo?.url) return null;
  return (
    <figure className={`panel overflow-hidden ${className}`}>
      <div className={`${ratio} overflow-hidden bg-canvas2`}>
        <img
          src={photo.url.startsWith("/") ? `${BACKEND}${photo.url}` : photo.url}
          alt={photo.alt || photo.caption || "About photo"}
          loading={eager ? "eager" : "lazy"}
          className="w-full h-full object-cover"
          style={{ objectPosition: `${photo.focalX ?? 50}% ${photo.focalY ?? 50}%` }}
        />
      </div>
      {photo.caption && (
        <figcaption className="px-3 py-2 border-t border-line font-mono text-[9px] tracking-[0.15em] uppercase text-ink3">
          {photo.caption}
        </figcaption>
      )}
    </figure>
  );
}

export const photosOf = (profile) => (profile.photos || []).filter((p) => p.url);
export const photoByRole = (profile, role, fallbackIndex = 0) => {
  const photos = photosOf(profile);
  return photos.find((p) => p.role === role) || photos[fallbackIndex] || null;
};
// informal photos = everything that isn't the formal professional portrait
export const informalPhotosOf = (profile) =>
  photosOf(profile).filter((p) => p.role !== "Professional Portrait");

// auto-sliding, swipeable photo carousel
export function PhotoCarousel({ photos = [], ratio = "aspect-[4/5]", interval = 3800, className = "" }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = photos.length;
  const startX = useRef(null);

  useEffect(() => {
    if (n <= 1 || paused) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % n), interval);
    return () => clearInterval(id);
  }, [n, paused, interval]);

  if (!n) return null;
  const go = (i) => setIdx((i + n) % n);
  const onDown = (e) => { startX.current = (e.touches ? e.touches[0].clientX : e.clientX); };
  const onUp = (e) => {
    if (startX.current == null) return;
    const endX = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX);
    const dx = endX - startX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? idx + 1 : idx - 1);
    startX.current = null;
  };

  return (
    <div className={`panel overflow-hidden select-none ${className}`} data-testid="photo-carousel"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onTouchStart={onDown} onTouchEnd={onUp} onMouseDown={onDown} onMouseUp={onUp}>
      <div className={`relative ${ratio} overflow-hidden bg-canvas2`}>
        {photos.map((p, i) => (
          <motion.img
            key={i}
            src={p.url.startsWith("/") ? `${BACKEND}${p.url}` : p.url}
            alt={p.alt || p.caption || "About photo"}
            loading={i === 0 ? "eager" : "lazy"}
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: `${p.focalX ?? 50}% ${p.focalY ?? 50}%` }}
            initial={false}
            animate={{ opacity: i === idx ? 1 : 0, scale: i === idx ? 1 : 1.03 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          />
        ))}
        {/* frame counter */}
        <div className="absolute top-2 left-2 z-10 font-mono text-[9px] tracking-[0.2em] px-1.5 py-0.5 bg-black/55 text-white/85">
          {String(idx + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </div>
        {/* caption */}
        {photos[idx]?.caption && (
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent px-3 pt-8 pb-2.5">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/90">{photos[idx].caption}</p>
          </div>
        )}
        {/* arrows */}
        {n > 1 && (
          <>
            <button aria-label="Previous photo" data-testid="carousel-prev" onClick={() => go(idx - 1)}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center bg-black/45 hover:bg-violet text-white font-mono text-sm transition-colors">‹</button>
            <button aria-label="Next photo" data-testid="carousel-next" onClick={() => go(idx + 1)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center bg-black/45 hover:bg-violet text-white font-mono text-sm transition-colors">›</button>
          </>
        )}
      </div>
      {/* dots */}
      {n > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-2.5 border-t border-line">
          {photos.map((_, i) => (
            <button key={i} aria-label={`Go to photo ${i + 1}`} data-testid={`carousel-dot-${i}`} onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-violet" : "w-1.5 bg-line hover:bg-ink3"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- section components ----------

export function IntroSection({ profile }) {
  const intro = profile.intro || {};
  return (
    <div>
      <TechLabel className="block mb-5 text-violet">{intro.eyebrow || "ABOUT / PROFILE"}</TechLabel>
      <h2 className="font-display font-extrabold tracking-tight leading-[1.02] text-3xl sm:text-5xl text-ink whitespace-pre-line">
        <AccentText text={intro.heading} />
      </h2>
      <p className="mt-7 max-w-2xl text-sm sm:text-base text-ink2 leading-relaxed whitespace-pre-line">{intro.body}</p>
    </div>
  );
}

export function StorySection({ profile, compact = false }) {
  const s = profile.story || {};
  const [openChapter, setOpenChapter] = useState(null);
  const chapters = [
    ["BEFORE THE CODE", s.beforeTheCode],
    ["THE SHIFT", s.theShift],
    ["FIRST MAJOR SYSTEM — SOILTRACK", s.firstSystem],
    ["CHOOSING THE PATH", s.choosingThePath],
    ["TODAY", s.today],
    ["THE GOAL", s.theGoal],
  ].filter(([, body]) => body);
  return (
    <div className={compact ? "space-y-8" : "space-y-6"}>
      {chapters.map(([label, body], i) => {
        const isOpen = openChapter === label;
        return (
          <Reveal key={label}>
            <button
              type="button"
              onClick={() => setOpenChapter(isOpen ? null : label)}
              aria-expanded={isOpen}
              data-testid={`story-chapter-${i}`}
              className="w-full text-left group"
            >
              <div className="flex items-center gap-4 mb-3">
                <span className={`font-mono text-[11px] tracking-[0.3em] transition-colors ${isOpen ? "text-violet" : "text-violet/70 group-hover:text-violet"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-line group-hover:bg-violet/40 transition-colors" />
                <TechLabel className="group-hover:text-ink transition-colors">{label}</TechLabel>
                <span className={`font-mono text-[9px] tracking-[0.15em] uppercase transition-colors ${isOpen ? "text-violet" : "text-ink3 group-hover:text-violet"}`}>
                  {isOpen ? "— CLOSE" : "+ READ"}
                </span>
              </div>
              <p className={`text-sm sm:text-base text-ink2 leading-relaxed sm:pl-10 whitespace-pre-line transition-all ${isOpen ? "" : "line-clamp-2"}`}>
                {body}
              </p>
            </button>
          </Reveal>
        );
      })}
    </div>
  );
}

export function WorkingStudentSection({ profile }) {
  const w = profile.workingStudent || {};
  if (!w.heading && !w.body) return null;
  const load = [
    { tag: "STUDENT", value: "BS INFORMATION TECHNOLOGY", color: "var(--cyan)" },
    { tag: "DEVELOPER", value: "FREELANCE / PROJECT-BASED", color: "var(--violet)" },
    { tag: "LEARNING", value: "SYSTEMS / SOFTWARE", color: "var(--amber)" },
  ];
  return (
    <div className="panel p-7 sm:p-10 bg-grid" data-testid="about-working-student">
      <TechLabel className="block mb-6">CURRENT_LOAD</TechLabel>
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
        {load.map((item, i) => (
          <div key={item.tag} className="flex items-center gap-3 flex-1">
            <Reveal delay={i * 0.1} className="flex-1 border border-line bg-card px-5 py-4 hover:border-violet transition-colors">
              <span className="font-mono text-[9px] tracking-[0.25em] uppercase" style={{ color: item.color }}>{item.tag}</span>
              <p className="mt-1.5 font-mono text-xs text-ink font-semibold">{item.value}</p>
            </Reveal>
            {i < load.length - 1 && <span className="font-mono text-xl text-ink3 shrink-0 max-lg:rotate-90 max-lg:mx-auto">+</span>}
          </div>
        ))}
        <div className="flex items-center gap-3 flex-[1.2]">
          <span className="font-mono text-xl text-violet shrink-0 max-lg:rotate-90 max-lg:mx-auto">=</span>
          <Reveal delay={0.35} className="flex-1 border border-violet/60 bg-violet/5 px-5 py-4">
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-violet">OUTPUT</span>
            <p className="mt-1.5 font-display text-base font-extrabold tracking-tight text-ink">
              {w.heading || "BUILDING EXPERIENCE BEFORE GRADUATION"}
            </p>
          </Reveal>
        </div>
      </div>
      {w.body && <p className="mt-6 max-w-2xl text-sm sm:text-base text-ink2 leading-relaxed whitespace-pre-line">{w.body}</p>}
    </div>
  );
}

export function HowIWorkSection({ profile }) {
  const steps = profile.howIWork || [];
  if (!steps.length) return null;
  return (
    <div>
      <TechLabel className="block mb-6">PROCESS.PIPELINE — SCRUM-INFLUENCED</TechLabel>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line">
        {steps.map((step, i) => (
          <Reveal key={step.num || i} delay={i * 0.04} className="bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-base font-bold text-violet">{step.num}</span>
              {i < steps.length - 1 && <span className="font-mono text-ink3 text-[10px]">↓</span>}
            </div>
            <h4 className="font-display text-sm font-bold tracking-wide text-ink mb-2">{step.title}</h4>
            <p className="font-mono text-[10px] text-ink3 leading-relaxed">{step.desc}</p>
          </Reveal>
        ))}
      </div>
      {profile.howIWorkNote && (
        <p className="mt-4 font-mono text-[10px] tracking-[0.08em] text-ink3 leading-relaxed uppercase">{profile.howIWorkNote}</p>
      )}
    </div>
  );
}

export function PrinciplesSection({ profile }) {
  const items = profile.principles || [];
  if (!items.length) return null;
  return (
    <div>
      <TechLabel className="block mb-6">DEVELOPMENT.PRINCIPLES</TechLabel>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line">
        {items.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.05} className="bg-card p-6 group hover:bg-canvas2/60 transition-colors">
            <span className="font-mono text-[10px] tracking-[0.3em] text-violet">{String(i + 1).padStart(2, "0")}</span>
            <h4 className="mt-3 font-display text-base font-bold tracking-tight text-ink group-hover:text-violet transition-colors">{p.title}</h4>
            <p className="mt-2.5 text-xs text-ink2 leading-relaxed">{p.desc}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export function SpecializationsSection({ ctx }) {
  const cats = (ctx.skills || []).filter((s) => s.title !== "PROFESSIONAL SKILLS");
  if (!cats.length) return null;
  return (
    <div>
      <TechLabel className="block mb-6">SPECIALIZATIONS — LABELED HONESTLY</TechLabel>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cats.map((cat, i) => (
          <Reveal key={cat.id} delay={i * 0.04} className="panel p-6">
            <TechLabel className="block mb-4 text-violet">{cat.title}</TechLabel>
            <ul className="space-y-2">
              {(cat.items || []).map((item) => (
                <li key={item.name} className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-ink">{item.name}</span>
                  <LevelTag level={item.level} />
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export function BeyondCodeSection({ profile }) {
  const b = profile.beyondCode || {};
  if (!(b.items || []).length) return null;
  return (
    <div className="panel p-7">
      <TechLabel className="block mb-4 text-violet">{b.heading || "BEYOND_CODE"}</TechLabel>
      {b.body && <p className="max-w-2xl text-sm text-ink2 leading-relaxed mb-5 whitespace-pre-line">{b.body}</p>}
      <div className="flex flex-wrap gap-2">
        {b.items.map((it) => (
          <span key={it} className="px-3 py-1.5 border border-line font-mono text-[10px] tracking-[0.1em] uppercase text-ink2">
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

export function OffClockSection({ profile }) {
  const g = profile.gaming || {};
  const s = profile.sports || {};
  const gallery = (profile.sportsGallery || []).filter((p) => p.url);
  const hasSport = (s.items || []).length;
  const hasDigital = (g.digital || []).length;
  if (!hasSport && !hasDigital && !gallery.length) return null;
  return (
    <div>
      <TechLabel className="block mb-6">{g.heading || "OFF_CLOCK"}</TechLabel>
      {gallery.length > 0 && (
        <div className="mb-8" data-testid="sports-gallery">
          <TechLabel className="block mb-4 text-grn">SPORTS_LOG // {String(gallery.length).padStart(2, "0")}</TechLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {gallery.map((p, i) => (
              <motion.figure
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group relative overflow-hidden border border-line bg-card"
                data-testid={`sports-gallery-item-${i}`}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={p.url.startsWith("/") ? `${BACKEND}${p.url}` : p.url}
                    alt={p.alt || p.sport || "Sports photo"}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="w-full h-full object-cover grayscale-[0.2] transition-all duration-500 group-hover:grayscale-0 group-hover:scale-[1.04]"
                    style={{ objectPosition: `${p.focalX ?? 50}% ${p.focalY ?? 50}%` }}
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pt-8 pb-2.5">
                  <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-grn">{p.sport || "SPORT"}</p>
                  {p.caption && <p className="font-mono text-[9px] tracking-[0.1em] text-white/70 mt-0.5 truncate">{p.caption}</p>}
                </div>
              </motion.figure>
            ))}
          </div>
        </div>
      )}
      {(hasSport || hasDigital) && (
      <div className="grid sm:grid-cols-2 gap-px bg-line border border-line">
        <div className="bg-card p-6">
          <TechLabel className="block mb-4 text-grn">PHYSICAL</TechLabel>
          <ul className="space-y-2">
            {(s.items || g.physical || []).map((it) => (
              <li key={it} className="font-mono text-xs text-ink flex gap-2"><span className="text-grn">▸</span>{it}</li>
            ))}
          </ul>
          {s.body && <p className="mt-4 text-xs text-ink2 leading-relaxed border-t border-line pt-4">{s.body}</p>}
        </div>
        <div className="bg-card p-6">
          <TechLabel className="block mb-4 text-cy">DIGITAL</TechLabel>
          <ul className="space-y-2">
            {(g.digital || []).map((it) => (
              <li key={it} className="font-mono text-xs text-ink flex gap-2"><span className="text-cy">▸</span>{it}</li>
            ))}
          </ul>
        </div>
      </div>
      )}
    </div>
  );
}

export function InterestsSection({ profile }) {
  const items = profile.interests || [];
  if (!items.length) return null;
  return (
    <div>
      <TechLabel className="block mb-5">INTERESTS.INDEX</TechLabel>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <span key={it} className="px-3 py-1.5 border border-line font-mono text-[10px] tracking-[0.1em] uppercase text-ink2 hover:border-violet hover:text-violet transition-colors cursor-default">
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CareerGoalSection({ profile }) {
  const g = profile.careerGoal || {};
  if (!g.heading) return null;
  return (
    <div className="panel p-7 sm:p-10 border-l-2" style={{ borderLeftColor: "var(--violet)" }}>
      <div className="flex flex-wrap items-center gap-4 mb-5">
        <TechLabel>TARGET_ROLE</TechLabel>
        <span className="font-mono text-[9px] tracking-[0.2em] px-2 py-0.5 border border-amb/40 text-amb">{g.statusLabel || "IN PROGRESS"}</span>
      </div>
      <h3 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-ink">{g.heading}</h3>
      <p className="mt-5 max-w-2xl text-sm sm:text-base text-ink2 leading-relaxed whitespace-pre-line">{g.body}</p>
      <div className="mt-8 max-w-2xl" data-testid="career-progress">
        <div className="flex justify-between font-mono text-[9px] tracking-[0.2em] uppercase mb-2">
          <span className="text-grn flex items-center gap-1.5"><StatusDot color="var(--green)" pulse={false} /> NOW — BUILDING</span>
          <span className="text-amb">TARGET — SENIOR</span>
        </div>
        <div className="relative h-1.5 bg-line">
          <motion.span
            className="absolute inset-y-0 left-0"
            style={{ background: "linear-gradient(90deg, var(--green), var(--violet), var(--amber))" }}
            initial={{ width: 0 }}
            whileInView={{ width: "62%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="flex justify-between mt-2 font-mono text-[8px] tracking-[0.15em] uppercase text-ink3">
          <span>junior / freelance</span>
          <span>mid-level systems</span>
          <span>senior full-stack & systems</span>
        </div>
      </div>
    </div>
  );
}

export function OpenToSection({ profile }) {
  const o = profile.openTo || {};
  if (!(o.items || []).length) return null;
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <StatusDot />
        <TechLabel>{o.heading || "OPEN TO"}</TechLabel>
      </div>
      {o.body && <p className="max-w-2xl text-sm text-ink2 leading-relaxed mb-5">{o.body}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-line border border-line">
        {o.items.map((it) => (
          <div key={it} className="bg-card px-4 py-3.5 font-mono text-[10px] tracking-[0.1em] uppercase text-ink2 text-center">
            {it}
          </div>
        ))}
      </div>
    </div>
  );
}

const STAT_DEFS = [
  ["projects", "PROJECT_INDEX", "PUBLISHED PROJECTS"],
  ["technologies", "TECH_STACK", "TECHNOLOGIES"],
  ["services", "SERVICE_MODULES", "SERVICE CATEGORIES"],
  ["certifications", "CERT_LOG", "CERTIFICATIONS"],
  ["experience", "EXPERIENCE", "FREELANCE SINCE"],
];

export function StatsSection({ profile, ctx }) {
  const sel = profile.statsSelection || {};
  const stats = ctx.stats || {};
  const active = STAT_DEFS.filter(([key]) => sel[key]);
  if (!active.length) return null;
  return (
    <div className={`grid gap-px bg-line border border-line ${active.length > 2 ? "grid-cols-2 lg:grid-cols-" + Math.min(active.length, 5) : "grid-cols-2"}`}>
      {active.map(([key, code, label]) => (
        <div key={key} className="bg-card p-6">
          <TechLabel className="block mb-3">{code}</TechLabel>
          <div className="font-mono text-3xl sm:text-4xl font-bold text-violet tabular-nums">
            {key === "experience" ? stats.experienceSince : String(stats[key] ?? 0).padStart(2, "0")}
          </div>
          <div className="mt-2 font-mono text-[9px] tracking-[0.2em] uppercase text-ink3">{label}</div>
        </div>
      ))}
    </div>
  );
}

export function CurrentFocusSection({ profile }) {
  const items = profile.currentFocus || [];
  if (!items.length) return null;
  return (
    <div>
      <TechLabel className="block mb-5">CURRENT_FOCUS</TechLabel>
      <div className="panel divide-y divide-line">
        {items.map((f) => (
          <div key={f.label} className="flex items-center gap-5 px-5 py-3.5">
            <span className="font-mono text-[10px] tracking-[0.25em] text-violet w-28 shrink-0">{f.label}</span>
            <span className="font-mono text-xs text-ink">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EducationSection({ ctx }) {
  if (!(ctx.education || []).length) return null;
  return (
    <div>
      <TechLabel className="block mb-5">EDUCATION</TechLabel>
      {ctx.education.map((e) => (
        <div key={e.id} className="panel p-6 flex flex-wrap justify-between gap-3">
          <div>
            <p className="font-display font-bold text-ink">{e.program}</p>
            <p className="font-mono text-xs text-ink3 mt-1">{e.institution}{e.location ? ` · ${e.location}` : ""}</p>
          </div>
          <span className="font-mono text-xs text-violet">
            {e.currentEnrolled ? `${e.startYear} — Present` : `${e.startYear} — ${e.endYear}`}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ExperienceSection({ ctx }) {
  if (!(ctx.experience || []).length) return null;
  return (
    <div>
      <TechLabel className="block mb-5">WORK EXPERIENCE</TechLabel>
      <div className="space-y-3">
        {ctx.experience.map((e) => (
          <div key={e.id} className="panel px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display font-bold text-sm text-ink">{e.role}</p>
              <p className="font-mono text-[10px] text-ink3 mt-0.5">{e.org} · {e.employmentType}</p>
            </div>
            <span className="font-mono text-[10px] tracking-[0.15em] text-violet">{periodOf(e)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectsSection({ profile, ctx }) {
  const all = ctx.projects || [];
  const wanted = (profile.projectsHighlight || []).length
    ? all.filter((p) => profile.projectsHighlight.includes(p.slug))
    : all.filter((p) => p.featured).slice(0, 4);
  if (!wanted.length) return null;
  return (
    <div>
      <TechLabel className="block mb-5">SELECTED WORK</TechLabel>
      <div className="border-t border-line">
        {wanted.map((p, i) => (
          <Link key={p.id} to={`/work/${p.slug}`} data-testid={`about-project-${p.slug}`}
            className="group flex items-center gap-4 sm:gap-6 py-4 border-b border-line hover:bg-canvas2/50 transition-colors px-2">
            <span className="font-mono text-[11px] text-violet w-8 shrink-0">{String(i + 1).padStart(2, "0")}</span>
            <span className="font-display text-base sm:text-lg font-bold tracking-tight text-ink group-hover:text-violet transition-colors flex-1 min-w-0 truncate uppercase">
              {p.title}
            </span>
            <span className="hidden sm:block font-mono text-[9px] tracking-[0.15em] text-ink3 uppercase">{p.type}</span>
            <span className="font-mono text-xs text-ink3 group-hover:text-violet group-hover:translate-x-1 transition-all">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CertificationsSection({ ctx }) {
  if (!(ctx.certifications || []).length) return null;
  return (
    <div>
      <TechLabel className="block mb-5">CERT_LOG</TechLabel>
      <div className="space-y-3">
        {ctx.certifications.map((c) => (
          <div key={c.id} className="panel px-5 py-4">
            <p className="font-display font-bold text-sm text-ink">{c.name}</p>
            <p className="font-mono text-[10px] text-ink3 mt-1">{c.issuer} · {c.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResumeCtaSection({ profile }) {
  const heading = profile.cta?.resumeHeading || "NEED THE FORMAL VERSION?";
  return (
    <div className="panel p-7 flex flex-wrap items-center justify-between gap-5">
      <h3 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-ink">{heading}</h3>
      <div className="flex gap-3">
        <Link to="/resume" data-testid="about-view-cv"
          className="h-11 px-6 inline-flex items-center border border-line font-mono text-[10px] tracking-[0.2em] uppercase text-ink hover:border-violet hover:text-violet transition-colors">
          View CV
        </Link>
        <a href={`${BACKEND}/api/resume.pdf`} data-testid="about-download-cv"
          className="h-11 px-6 inline-flex items-center bg-violet font-mono text-[10px] tracking-[0.2em] uppercase font-semibold"
          style={{ color: "var(--bg)" }}>
          Download CV ↓
        </a>
      </div>
    </div>
  );
}

export function ContactCtaSection({ profile }) {
  const c = profile.cta || {};
  return (
    <div className="panel p-8 sm:p-12 text-center bg-grid">
      <TechLabel className="block mb-4">{c.contactHeading || "CURRENT STATUS: BUILDING."}</TechLabel>
      <h3 className="font-display font-extrabold tracking-tight leading-tight text-3xl sm:text-5xl text-ink">
        <AccentText text={c.contactBody || "NEXT SYSTEM COULD BE *YOURS.*"} />
      </h3>
      <Link to="/contact" data-testid="about-contact-cta"
        className="mt-8 inline-flex h-12 items-center px-8 bg-violet font-mono text-[11px] tracking-[0.2em] uppercase font-semibold hover:opacity-90 transition-opacity"
        style={{ color: "var(--bg)" }}>
        Let's Talk →
      </Link>
    </div>
  );
}

export function SportDevMapSection({ profile }) {
  const rows = profile.sportToDev || [];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  if (!rows.length) return null;
  return (
    <div ref={ref} data-testid="about-sportdev">
      <TechLabel className="block mb-2">SPORT → DEVELOPMENT</TechLabel>
      <p className="mb-6 max-w-xl text-sm text-ink2 leading-relaxed">
        The discipline transferred directly. Same loop, different arena.
      </p>
      <div className="panel">
        <div className="grid grid-cols-[1fr_64px_1fr] font-mono text-[9px] tracking-[0.25em] uppercase text-ink3 border-b border-line">
          <span className="px-5 py-2.5">Sport</span>
          <span className="px-2 py-2.5 text-center border-l border-line">→</span>
          <span className="px-5 py-2.5 border-l border-line">Development</span>
        </div>
        {rows.map((r, i) => (
          <div key={r.sport} className="group grid grid-cols-[1fr_64px_1fr] border-b border-line last:border-0 font-mono text-xs hover:bg-canvas2/50 transition-colors">
            <span className="px-5 py-3.5 text-ink2 group-hover:text-ink transition-colors">{r.sport}</span>
            <span className="relative border-l border-line overflow-hidden" aria-hidden="true">
              <motion.span
                className="absolute inset-y-0 left-0 bg-violet/25 border-r border-violet"
                initial={{ width: 0 }}
                animate={inView ? { width: "100%" } : {}}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.09, ease: "easeOut" }}
              />
            </span>
            <span className="px-5 py-3.5 border-l border-line text-violet">{r.dev}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const MILESTONE_COLOR = {
  education: "var(--cyan)", work: "var(--violet)", release: "var(--pink)",
  current: "var(--green)", target: "var(--amber)",
};

export function StoryTimelineSection({ ctx }) {
  const items = (ctx.journey || []);
  const [open, setOpen] = useState(null);
  if (!items.length) return null;
  return (
    <div data-testid="about-story-timeline">
      <TechLabel className="block mb-2">TIMELINE.LOG</TechLabel>
      <p className="mb-8 max-w-xl text-sm text-ink2 leading-relaxed">
        The path so far — select a milestone to read the note behind it.
      </p>
      <div>
        {items.map((j, i) => {
          const color = MILESTONE_COLOR[j.milestoneType] || "var(--violet)";
          const isOpen = open === j.id;
          return (
            <Reveal key={j.id} delay={i * 0.04} className="relative pl-10 pb-6 last:pb-0">
              <span className="absolute left-[13px] top-7 bottom-0 w-px bg-line last:hidden" />
              <span className="absolute left-0 top-1 grid place-items-center w-7 h-7 border bg-card transition-colors"
                style={{ borderColor: isOpen ? color : "var(--line)" }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              </span>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : j.id)}
                aria-expanded={isOpen}
                data-testid={`timeline-node-${j.id}`}
                className="w-full text-left group"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-[10px] tracking-[0.25em]" style={{ color }}>{j.year}</span>
                  {j.code && <span className="font-mono text-[9px] text-ink3">{j.code}</span>}
                  <span className={`font-display text-base sm:text-lg font-extrabold tracking-tight transition-colors ${isOpen ? "" : "text-ink group-hover:text-violet"}`}
                    style={isOpen ? { color } : {}}>
                    {j.title}
                  </span>
                  {j.milestoneType === "target" && (
                    <span className="font-mono text-[8px] tracking-[0.2em] text-amb border border-amb/40 px-1.5 py-0.5">TARGET</span>
                  )}
                  {j.milestoneType === "current" && (
                    <span className="font-mono text-[8px] tracking-[0.2em] text-grn border border-grn/40 px-1.5 py-0.5">NOW</span>
                  )}
                </div>
              </button>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {j.desc && (
                  <p className="pt-2.5 pl-1 max-w-2xl text-sm text-ink2 leading-relaxed border-l-2 ml-1 pl-4 mt-2"
                    style={{ borderLeftColor: color }}>
                    {j.desc}
                  </p>
                )}
              </motion.div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

export function GallerySection({ profile }) {
  const photos = photosOf(profile);
  if (photos.length < 2) return null;
  return (
    <div data-testid="about-gallery">
      <TechLabel className="block mb-2">FIELD_NOTES / GALLERY</TechLabel>
      <p className="mb-8 max-w-xl text-sm text-ink2 leading-relaxed">Fragments from the process — court, desk, and everything between.</p>
      {/* offset contact-sheet grid */}
      <div className="hidden sm:grid grid-cols-4 gap-4">
        {photos.slice(0, 8).map((p, i) => (
          <div key={i} className={`group ${i % 4 === 1 ? "translate-y-8" : i % 4 === 3 ? "translate-y-4" : ""} ${i % 3 === 2 ? "col-span-1" : ""}`}>
            <div className="panel overflow-hidden hover:border-violet transition-colors">
              <div className={`${i % 2 === 0 ? "aspect-[4/5]" : "aspect-square"} overflow-hidden bg-canvas2`}>
                <img
                  src={p.url.startsWith("/") ? `${BACKEND}${p.url}` : p.url}
                  alt={p.alt || p.caption || "Gallery photo"}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-500"
                  style={{ objectPosition: `${p.focalX ?? 50}% ${p.focalY ?? 50}%` }}
                />
              </div>
              <div className="px-3 py-2 border-t border-line flex items-center justify-between">
                <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink3 truncate">
                  {p.caption || p.role || `FRAME_${String(i + 1).padStart(2, "0")}`}
                </span>
                <span className="font-mono text-[8px] text-violet opacity-0 group-hover:opacity-100 transition-opacity">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* mobile: horizontal contact sheet */}
      <div className="sm:hidden flex gap-3 overflow-x-auto pb-3 -mx-5 px-5 snap-x">
        {photos.slice(0, 8).map((p, i) => (
          <div key={i} className="w-40 shrink-0 snap-start panel overflow-hidden">
            <div className="aspect-[4/5] overflow-hidden bg-canvas2">
              <img src={p.url.startsWith("/") ? `${BACKEND}${p.url}` : p.url} alt={p.alt || "Gallery photo"} loading="lazy"
                className="w-full h-full object-cover" style={{ objectPosition: `${p.focalX ?? 50}% ${p.focalY ?? 50}%` }} />
            </div>
            <div className="px-2.5 py-1.5 border-t border-line font-mono text-[8px] tracking-[0.15em] uppercase text-ink3 truncate">
              {p.caption || p.role || `FRAME_${i + 1}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export function CustomSection({ section }) {
  if (!section.visible) return null;
  const items = section.items || [];
  const images = (section.images || []).filter(Boolean);
  return (
    <div>
      {(section.eyebrow || section.heading) && (
        <div className="mb-5">
          {section.eyebrow && <TechLabel className="block mb-3 text-violet">{section.eyebrow}</TechLabel>}
          {section.heading && (
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              <AccentText text={section.heading} />
            </h3>
          )}
        </div>
      )}
      {section.type === "quote" ? (
        <p className="font-display text-xl sm:text-2xl font-bold text-ink2 leading-snug border-l-2 pl-6 whitespace-pre-line" style={{ borderLeftColor: "var(--violet)" }}>
          {section.content}
        </p>
      ) : section.type === "cards" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line">
          {items.map((it, i) => (
            <div key={i} className="bg-card p-5">
              <p className="font-display font-bold text-sm text-ink">{it.title}</p>
              {it.desc && <p className="mt-2 font-mono text-[10px] text-ink3 leading-relaxed">{it.desc}</p>}
            </div>
          ))}
        </div>
      ) : section.type === "timeline" ? (
        <div className="panel divide-y divide-line">
          {items.map((it, i) => (
            <div key={i} className="flex gap-5 px-5 py-3.5">
              <span className="font-mono text-[10px] tracking-[0.2em] text-violet w-24 shrink-0">{it.title}</span>
              <span className="font-mono text-xs text-ink2">{it.desc}</span>
            </div>
          ))}
        </div>
      ) : section.type === "gallery" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((url, i) => (
            <div key={i} className="panel overflow-hidden aspect-video bg-canvas2">
              <img src={url.startsWith("/") ? `${BACKEND}${url}` : url} alt={section.heading || "Gallery image"} loading="lazy" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      ) : section.type === "cta" ? (
        <div className="panel p-7 text-center">
          {section.content && <p className="text-sm text-ink2 mb-5 whitespace-pre-line">{section.content}</p>}
          <Link to="/contact" className="inline-flex h-11 px-7 items-center bg-violet font-mono text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: "var(--bg)" }}>
            Let's Talk →
          </Link>
        </div>
      ) : (
        section.content && <p className="max-w-2xl text-sm sm:text-base text-ink2 leading-relaxed whitespace-pre-line">{section.content}</p>
      )}
    </div>
  );
}

export const SECTION_COMPONENTS = {
  intro: IntroSection,
  story: StorySection,
  workingStudent: WorkingStudentSection,
  howIWork: HowIWorkSection,
  principles: PrinciplesSection,
  specializations: SpecializationsSection,
  beyondCode: BeyondCodeSection,
  offClock: OffClockSection,
  interests: InterestsSection,
  careerGoal: CareerGoalSection,
  openTo: OpenToSection,
  stats: StatsSection,
  currentFocus: CurrentFocusSection,
  education: EducationSection,
  experience: ExperienceSection,
  projects: ProjectsSection,
  certifications: CertificationsSection,
  resumeCta: ResumeCtaSection,
  contactCta: ContactCtaSection,
  sportDevMap: SportDevMapSection,
  storyTimeline: StoryTimelineSection,
  gallery: GallerySection,
};

export function renderOnly(profile, ctx, keys) {
  return keys.map((key) => {
    const conf = (profile.sections || []).find((s) => s.key === key);
    if (conf && !conf.visible) return null;
    const Comp = SECTION_COMPONENTS[key];
    if (!Comp) return null;
    return (
      <section key={key} data-section={key}>
        <Comp profile={profile} ctx={ctx} />
      </section>
    );
  });
}

export function renderSections(profile, ctx, { skip = [] } = {}) {
  const ordered = (profile.sections || []).filter((s) => s.visible && !skip.includes(s.key));
  const custom = profile.customSections || [];
  return ordered.map((s) => {
    if (s.key.startsWith("custom:")) {
      const c = custom.find((x) => `custom:${x.id}` === s.key);
      return c ? <CustomSection key={s.key} section={c} /> : null;
    }
    const Comp = SECTION_COMPONENTS[s.key];
    if (!Comp) return null;
    return (
      <section key={s.key} data-section={s.key}>
        <Comp profile={profile} ctx={ctx} />
      </section>
    );
  });
}
