import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useContent } from "../lib/content";
import useSeo from "../lib/useSeo";
import { MARQUEE_ITEMS } from "../data/content";
import { SectionHead, TechLabel, StatusDot, SwapText, Reveal, LevelTag, StatusScale } from "../components/system/bits";
import Marquee from "../components/system/Marquee";
import ProjectRecord from "../components/ProjectRecord";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

function HeroTitle({ text }) {
  const lines = (text || "").split("\n");
  return (
    <h1 className="font-display font-extrabold tracking-tight leading-[0.95] text-[13vw] sm:text-6xl lg:text-7xl xl:text-[5.2rem] text-ink">
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-1">
          <motion.span className="block" initial={{ y: "112%" }} animate={{ y: 0 }}
            transition={{ delay: 0.2 + i * 0.13, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            {line.split(/(\*[^*]+\*)/g).map((part, j) =>
              part.startsWith("*") ? <span key={j} className="text-violet">{part.replaceAll("*", "")}</span> : part
            )}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

function SystemProfile({ cfg, content }) {
  const caps = (cfg.capabilities || []).filter((c) => c.visible);
  const metric = cfg.projectMetric || {};
  const metricValue =
    metric.mode === "hidden" ? null :
    metric.mode === "manual" ? metric.manualValue :
    metric.mode === "auto-featured" ? String(content.projects.filter((p) => p.featured).length) :
    String(content.projects.length);
  const s = content.settings;
  return (
    <div className="panel relative overflow-hidden" data-testid="system-profile">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-line">
        <span className="font-mono text-[10px] tracking-[0.25em] text-violet">{cfg.label || "SYSTEM PROFILE"}</span>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-pk/70" />
          <span className="w-2 h-2 rounded-full bg-amb/70" />
          <span className="w-2 h-2 rounded-full bg-grn/70" />
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="font-mono text-xs text-ink mb-1">{cfg.displayName}</div>
        <div className="font-mono text-[10px] tracking-[0.2em] text-ink3 mb-1">{cfg.role}</div>
        {cfg.secondaryTitle && <div className="font-mono text-[9px] tracking-[0.2em] text-ink3 mb-6">{cfg.secondaryTitle}</div>}
        <div className="space-y-4 mt-5">
          {caps.map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.07, duration: 0.4 }}>
              <div className="font-mono text-[9px] tracking-[0.2em] text-ink3 mb-1.5 uppercase">{c.label}</div>
              <StatusScale status={c.status} />
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-px bg-line border border-line mt-7">
          <div className="bg-card px-3 py-3">
            <div className="font-mono text-[8px] tracking-[0.2em] text-ink3 mb-1">STATUS</div>
            <div className="font-mono text-[10px] tracking-[0.1em] flex items-center gap-1.5"
              style={{ color: s.available ? "var(--green)" : "var(--amber)" }}>
              <StatusDot color={s.available ? "var(--green)" : "var(--amber)"} />
              {(s.availability || "available").toUpperCase()}
            </div>
          </div>
          {metricValue !== null && (
            <div className="bg-card px-3 py-3">
              <div className="font-mono text-[8px] tracking-[0.2em] text-ink3 mb-1">PROJECTS</div>
              <div className="font-mono text-[10px] tracking-[0.1em] text-ink">{metricValue} {metric.label || "DEPLOYED"}</div>
            </div>
          )}
          <div className="bg-card px-3 py-3">
            <div className="font-mono text-[8px] tracking-[0.2em] text-ink3 mb-1">LOCATION</div>
            <div className="font-mono text-[10px] tracking-[0.1em] text-ink">{cfg.location || "PHILIPPINES"}</div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2 font-mono text-[9px] tracking-[0.15em] text-ink3">
          {["USER", "UI", "API", "DB"].map((n, i) => (
            <span key={n} className="flex items-center gap-2">
              <span className="px-2 py-1 border border-line text-ink2">{n}</span>
              {i < 3 && <span className="text-violet animate-blink">→</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricsStrip({ cfg, content }) {
  const values = {
    projects: String(content.projects.length).padStart(2, "0"),
    technologies: String(content.technologies.length).padStart(2, "0"),
    services: String(content.services.reduce((n, s) => n + (s.capabilities || []).length, 0)).padStart(2, "0"),
    serviceCategories: String(content.services.length).padStart(2, "0"),
    certifications: String(content.certifications.length).padStart(2, "0"),
    education: content.education[0] ? "BS IT · CLSU" : "—",
  };
  const colors = ["var(--green)", "var(--violet)", "var(--cyan)", "var(--amber)", "var(--pink)"];
  const items = (cfg.items || []).filter((m) => m.visible);
  if (!items.length) return null;
  return (
    <section className="border-y border-line" data-testid="home-metrics">
      <div className={`mx-auto max-w-[1440px] grid grid-cols-2 lg:grid-cols-${Math.min(items.length, 5)}`}>
        {items.map((m, i) => (
          <Reveal key={m.key} delay={i * 0.06}
            className={`px-5 sm:px-8 py-7 border-line ${i > 0 ? "border-l" : ""} ${i > 1 ? "max-lg:border-t max-lg:border-l-0" : ""} ${i % 2 === 1 ? "max-lg:border-l" : ""}`}>
            <TechLabel className="block mb-2">{m.label}</TechLabel>
            <span className="font-mono text-xl sm:text-2xl font-bold tabular-nums" style={{ color: colors[i % colors.length] }}>
              {values[m.key] ?? "—"}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function FeaturedProjects({ cfg, content }) {
  const byId = Object.fromEntries(content.projects.map((p) => [p.id, p]));
  let list = (cfg.ids || []).map((id) => byId[id]).filter(Boolean);
  if (!list.length) list = content.projects.filter((p) => p.featured);
  list = list.slice(0, cfg.max || 4);
  if (!list.length) return null;
  return (
    <section className="mx-auto max-w-[1440px] px-5 sm:px-8 py-20 sm:py-28" data-testid="home-featured">
      <SectionHead num="" title={cfg.heading || "FEATURED PROJECTS"}
        sub={cfg.label}
        right={
          <Link to="/work" data-testid="home-all-work"
            className="group font-mono text-[10px] tracking-[0.2em] uppercase text-ink2 hover:text-violet transition-colors whitespace-nowrap">
            <SwapText label="Full Archive →" alt="Open /Work →" />
          </Link>
        } />
      <div className="grid lg:grid-cols-3 gap-5">
        {list.map((p, i) => (
          <ProjectRecord key={p.id} project={p} index={i} large={i === 0} />
        ))}
      </div>
    </section>
  );
}

function WhatIBuild({ cfg }) {
  const items = (cfg.items || []).filter((i) => i.visible);
  if (!items.length) return null;
  return (
    <section className="border-y border-line bg-canvas2/40" data-testid="home-whatibuild">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-20 sm:py-28">
        <SectionHead num="" title={cfg.heading || "WHAT I BUILD"} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line">
          {items.map((w, i) => (
            <Reveal key={w.title + i} delay={i * 0.07} className="bg-card p-7 group hover:bg-canvas2/60 transition-colors">
              <span className="font-mono text-[10px] tracking-[0.3em] text-violet">{w.techLabel || String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-ink group-hover:text-violet transition-colors">{w.title}</h3>
              <p className="mt-3 text-sm text-ink2 leading-relaxed">{w.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesPreview({ cfg, content }) {
  const byId = Object.fromEntries(content.services.map((s) => [s.id, s]));
  let list = (cfg.ids || []).map((id) => byId[id]).filter(Boolean);
  if (!list.length) list = content.services;
  list = list.slice(0, cfg.max || 7);
  if (!list.length) return null;
  return (
    <section className="mx-auto max-w-[1440px] px-5 sm:px-8 py-20 sm:py-28" data-testid="home-services">
      <SectionHead num="" title={`${cfg.heading || "SERVICES"} / ${String(content.services.length).padStart(2, "0")}`}
        sub="Service areas. Each one a stack of specialized capabilities." />
      <div className="border-t border-line">
        {list.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.04}>
            <Link to="/services" data-testid={`home-service-${s.id}`}
              className="group flex items-center gap-4 sm:gap-8 py-5 border-b border-line hover:bg-canvas2/50 transition-colors px-2 sm:px-4">
              <span className="font-mono text-[11px] text-violet tracking-[0.2em] w-8 shrink-0">{s.num}</span>
              <span className="font-display text-base sm:text-xl font-bold tracking-tight text-ink group-hover:text-violet transition-colors flex-1 min-w-0 truncate">{s.title}</span>
              {cfg.showCount !== false && (
                <span className="hidden md:block font-mono text-[9px] tracking-[0.15em] text-ink3 uppercase">
                  {(s.capabilities || []).length} SERVICES
                </span>
              )}
              <span className="font-mono text-xs text-ink3 group-hover:text-violet group-hover:translate-x-1 transition-all">→</span>
            </Link>
          </Reveal>
        ))}
      </div>
      {cfg.ctaLabel && (
        <Link to="/services" data-testid="home-services-cta"
          className="mt-8 inline-flex h-11 items-center px-6 border border-line font-mono text-[10px] tracking-[0.2em] uppercase text-ink2 hover:border-violet hover:text-violet transition-colors">
          {cfg.ctaLabel}
        </Link>
      )}
    </section>
  );
}

function TechStack({ cfg, content }) {
  const byId = Object.fromEntries(content.technologies.map((t) => [t.id, t]));
  let list = (cfg.ids || []).map((id) => byId[id]).filter(Boolean);
  if (!list.length) list = content.technologies;
  if (!list.length) return null;
  const byCat = {};
  list.forEach((t) => { (byCat[t.category || "Other"] = byCat[t.category || "Other"] || []).push(t); });
  return (
    <section className="border-y border-line bg-canvas2/40" data-testid="home-techstack">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-20 sm:py-28">
        <SectionHead num="" title={cfg.heading || "TECHNICAL STACK"} sub={cfg.sub} />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(byCat).map(([cat, items], i) => (
            <Reveal key={cat} delay={i * 0.05} className="panel p-6">
              <TechLabel className="block mb-4 text-violet">TECH_STACK / {cat.toUpperCase()}</TechLabel>
              <ul className="space-y-2.5">
                {items.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-ink">{t.name}</span>
                    <LevelTag level={t.level} />
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Roadmap({ cfg }) {
  const stages = (cfg.stages || []).filter((s) => s.visible);
  if (!stages.length) return null;
  const loopFrom = cfg.loopFrom || "REVIEW";
  const loopTo = cfg.loopTo || "BUILD";
  const loopStart = stages.findIndex((s) => s.title.includes(loopFrom));
  const loopEnd = stages.findIndex((s) => s.title.includes(loopTo));
  const inLoop = (i) => loopStart >= 0 && loopEnd >= 0 && loopEnd < loopStart && i > loopStart && i <= stages.length - 1;
  const isLoopBack = (i) => loopStart >= 0 && loopEnd >= 0 && i === loopStart;
  return (
    <section className="mx-auto max-w-[1440px] px-5 sm:px-8 py-20 sm:py-28" data-testid="home-roadmap">
      <SectionHead num="" title={cfg.heading || "SCRUM / PROTOTYPE ROADMAP"} sub={cfg.intro} />

      {/* desktop: snake roadmap with iteration loop */}
      <div className="hidden lg:block relative">
        <div className="grid grid-cols-4 gap-5">
          {stages.map((st, i) => (
            <Reveal key={st.num + st.title} delay={i * 0.04}
              className={`panel p-5 relative ${isLoopBack(i) ? "border-violet" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-base font-bold text-violet">{st.num}</span>
                <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink3">{st.type}</span>
              </div>
              <h4 className="font-display text-sm font-bold tracking-wide text-ink mb-2">{st.title}</h4>
              <p className="font-mono text-[9px] text-ink3 leading-relaxed">{st.desc}</p>
              {isLoopBack(i) && (
                <span className="absolute -top-2.5 left-4 bg-canvas px-2 font-mono text-[8px] tracking-[0.2em] text-violet">
                  ↺ ITERATION POINT
                </span>
              )}
              {i < stages.length - 1 && (
                <span className="absolute top-1/2 -right-4 z-10 font-mono text-ink3 text-xs">→</span>
              )}
            </Reveal>
          ))}
        </div>
        {loopStart >= 0 && loopEnd >= 0 && loopEnd < loopStart && (
          <div className="mt-5 panel px-5 py-3 flex items-center justify-center gap-4 font-mono text-[10px] tracking-[0.2em] uppercase">
            <span className="text-violet">↺ ITERATION LOOP</span>
            <span className="text-ink2">{loopFrom}</span>
            <span className="text-ink3">→</span>
            <span className="text-ink2">REFINE</span>
            <span className="text-ink3">→</span>
            <span className="text-violet">{loopTo}</span>
            <span className="text-ink3">// repeats until accepted, then deploy</span>
          </div>
        )}
      </div>

      {/* mobile: vertical roadmap */}
      <div className="lg:hidden">
        {stages.map((st, i) => (
          <div key={st.num + st.title} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className={`w-2.5 h-2.5 rounded-full mt-1.5 ${isLoopBack(i) ? "bg-violet" : "bg-line"}`} style={isLoopBack(i) ? {} : { backgroundColor: "var(--violet)", opacity: 0.5 }} />
              {i < stages.length - 1 && <span className="w-px flex-1 bg-line" />}
            </div>
            <div className="pb-7">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] text-violet">{st.num}</span>
                <span className="font-display text-sm font-bold text-ink">{st.title}</span>
                {isLoopBack(i) && <span className="font-mono text-[8px] tracking-[0.2em] text-violet border border-violet/40 px-1.5 py-0.5">↺ LOOPS TO {loopTo}</span>}
              </div>
              <p className="mt-1 font-mono text-[10px] text-ink3 leading-relaxed">{st.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function JourneyPreview({ cfg, content }) {
  const byId = Object.fromEntries((content.journey || []).map((j) => [j.id, j]));
  let list;
  if (cfg.mode === "selected") list = (cfg.ids || []).map((id) => byId[id]).filter(Boolean);
  else if (cfg.mode === "all") list = content.journey;
  else list = (content.journey || []).slice(-(cfg.max || 4));
  if (!list.length) return null;
  return (
    <section className="border-y border-line bg-canvas2/40" data-testid="home-journey">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <SectionHead num="" title={cfg.heading || "JOURNEY.LOG"} sub="Commit history of a developer career — progression, not pretense." />
          <Link to="/journey" data-testid="home-journey-cta"
            className="group inline-flex h-11 items-center px-6 border border-line font-mono text-[11px] tracking-[0.2em] uppercase text-ink hover:border-violet hover:text-violet transition-colors">
            <SwapText label="View Full Log →" alt="Open /Journey →" />
          </Link>
        </div>
        <div className="panel p-6 font-mono text-xs space-y-3">
          <div className="text-ink3 text-[10px] tracking-[0.25em] mb-4">$ git log --career</div>
          {list.map((j, i) => (
            <Reveal key={j.id} delay={i * 0.08} className="flex gap-4">
              <span className="text-violet shrink-0">{j.code}</span>
              <div className="min-w-0">
                <span className={j.milestoneType === "target" ? "text-amb" : j.milestoneType === "current" ? "text-grn" : "text-ink"}>
                  {j.title}
                </span>
                <span className="text-ink3 ml-2">({j.year})</span>
                {j.milestoneType === "target" && <span className="ml-2 text-[8px] tracking-[0.2em] text-amb border border-amb/40 px-1.5 py-0.5">TARGET</span>}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta({ cfg, content }) {
  return (
    <section className="border-t border-line bg-grid" data-testid="home-final-cta">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-24 sm:py-32 text-center">
        <Reveal>
          <div className="flex items-center justify-center gap-2 mb-6">
            <StatusDot color={content.settings.available ? "var(--green)" : "var(--amber)"} />
            <TechLabel>{cfg.eyebrow}</TechLabel>
          </div>
          <h2 className="font-display font-extrabold tracking-tight leading-[0.95] text-5xl sm:text-7xl text-ink whitespace-pre-line">
            {(cfg.heading || "").split(/(\*[^*]+\*)/g).map((part, j) =>
              part.startsWith("*") ? <span key={j} className="text-violet">{part.replaceAll("*", "")}</span> : part
            )}
          </h2>
          {cfg.body && <p className="mt-6 max-w-xl mx-auto text-sm sm:text-base text-ink2 leading-relaxed">{cfg.body}</p>}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/contact" data-testid="home-contact-cta"
              className="inline-flex h-12 items-center px-8 bg-violet font-mono text-[11px] tracking-[0.2em] uppercase font-semibold hover:opacity-90 transition-opacity"
              style={{ color: "var(--bg)" }}>
              {cfg.buttonLabel || "LET'S TALK →"}
            </Link>
            <Link to="/pricing#estimator" data-testid="home-estimator-cta"
              className="inline-flex h-12 items-center px-8 border border-line font-mono text-[11px] tracking-[0.2em] uppercase text-ink hover:border-violet hover:text-violet transition-colors">
              Estimate Scope ₱
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const SECTION_RENDERERS = {
  metrics: MetricsStrip,
  featuredProjects: FeaturedProjects,
  whatIBuild: WhatIBuild,
  services: ServicesPreview,
  techStack: TechStack,
  roadmap: Roadmap,
  journey: JourneyPreview,
  finalCta: FinalCta,
};

export function HomeRenderer({ config, content }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const panelY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.25]);

  const hero = config.hero || {};
  const sections = (config.sections || []).filter((s) => s.visible);
  const s = content.settings;

  return (
    <div>
      {config.showAnnouncement && config.announcement && (
        <div className="border-b border-line bg-violet/10 px-5 py-2.5 text-center font-mono text-[10px] tracking-[0.2em] uppercase text-violet" data-testid="announcement-bar">
          {config.announcement}
        </div>
      )}

      {sections.find((x) => x.key === "hero") && (
        <section ref={heroRef} className="relative bg-grid overflow-hidden">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 pt-16 sm:pt-24 pb-16 sm:pb-20 grid lg:grid-cols-12 gap-12 items-center">
            <motion.div className="lg:col-span-7" style={{ opacity: heroOpacity }}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                className="flex items-center gap-3 mb-8">
                <span className="font-mono text-[10px] tracking-[0.3em] text-violet">{hero.eyebrow}</span>
                <span className="h-px w-16 bg-violet/50" />
              </motion.div>
              <HeroTitle text={hero.title} />
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.6 }}
                className="mt-7 max-w-xl text-sm sm:text-base text-ink2 leading-relaxed">
                {hero.paragraph}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }}
                className="mt-6 flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase" data-testid="hero-status">
                <StatusDot color={s.available ? "var(--green)" : "var(--amber)"} />
                <span style={{ color: s.available ? "var(--green)" : "var(--amber)" }}>
                  {hero.availabilityLabel || (s.availability === "limited" ? "Limited availability" : s.available ? "Available for select projects" : "Currently unavailable")}
                </span>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.6 }}
                className="mt-9 flex flex-wrap items-center gap-4">
                <Link to="/contact" data-testid="hero-cta-start"
                  className="group inline-flex h-12 items-center px-7 bg-violet font-mono text-[11px] tracking-[0.2em] uppercase font-semibold hover:opacity-90 transition-opacity"
                  style={{ color: "var(--bg)" }}>
                  <SwapText label={hero.primaryCta || "Start a Project →"} alt="Initialize Inquiry →" />
                </Link>
                <Link to="/work" data-testid="hero-cta-work"
                  className="group inline-flex h-12 items-center px-7 border border-line font-mono text-[11px] tracking-[0.2em] uppercase text-ink hover:border-violet hover:text-violet transition-colors">
                  <SwapText label={hero.secondaryCta || "Explore My Work"} alt="Open /Project Archive" />
                </Link>
                {hero.resumeCta !== "" && (
                  <a href={`${BACKEND}/api/resume.pdf`} data-testid="hero-cta-cv"
                    className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink3 hover:text-violet transition-colors">
                    {hero.resumeCta || "Download CV ↓"}
                  </a>
                )}
              </motion.div>
            </motion.div>
            <motion.div className="lg:col-span-5" style={{ y: panelY }}
              initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
              <SystemProfile cfg={config.systemProfile || {}} content={content} />
            </motion.div>
          </div>
        </section>
      )}

      {sections.filter((x) => x.key !== "hero").map((sec, i) => {
        const Comp = SECTION_RENDERERS[sec.key];
        if (!Comp) return null;
        return (
          <div key={sec.key}>
            <Comp cfg={config[sec.key] || {}} content={content} />
            {sec.key === "metrics" && <Marquee items={MARQUEE_ITEMS} />}
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const content = useContent();
  useSeo(null);
  if (content.loading) {
    return <div className="min-h-[60vh] grid place-items-center font-mono text-xs text-ink3 animate-blink">LOADING SYSTEM…</div>;
  }
  return <HomeRenderer config={content.homepage} content={content} />;
}
