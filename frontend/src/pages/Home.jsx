import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useContent } from "../lib/content";
import useSeo from "../lib/useSeo";
import { MARQUEE_ITEMS } from "../data/content";
import { SectionHead, TechLabel, StatusDot, SwapText, Reveal, LevelTag, StatusScale } from "../components/system/bits";
import Marquee from "../components/system/Marquee";
import ProjectRecord from "../components/ProjectRecord";
import DirectChannels from "../components/ContactChannels";
import RoadmapCanvas, { WhyScrum } from "../components/RoadmapCanvas";
import { X } from "lucide-react";

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
              part.startsWith("*") ? <span key={j} className="gradient-text">{part.replaceAll("*", "")}</span> : part
            )}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

const DEPLOY_LINES = [
  "$ git push origin main",
  "▸ build ........ PASSING",
  "▸ tests ........ ALL OK",
  "▸ deploy ....... amurao.dev ✓ LIVE",
];

function DeployLog() {
  const [text, setText] = useState("");
  const [line, setLine] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(DEPLOY_LINES[DEPLOY_LINES.length - 1]);
      return;
    }
    let i = 0, timer;
    const current = DEPLOY_LINES[line];
    const type = () => {
      i += 1;
      setText(current.slice(0, i));
      if (i < current.length) timer = setTimeout(type, 32);
      else timer = setTimeout(() => setLine((l) => (l + 1) % DEPLOY_LINES.length), 1700);
    };
    timer = setTimeout(type, 350);
    return () => clearTimeout(timer);
  }, [line]);
  return (
    <div className="mt-4 flex items-center gap-2 px-3 py-2 border border-line bg-canvas2/60 font-mono text-[9px] tracking-[0.08em] overflow-hidden whitespace-nowrap" data-testid="hero-deploy-log">
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--green)" }} />
      <span className="truncate" style={{ color: "var(--green)" }}>{text}</span>
      <span className="text-violet animate-blink shrink-0">▌</span>
    </div>
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
        <DeployLog />
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

function FeaturedProjects({ cfg, content, num }) {
  const byId = Object.fromEntries(content.projects.map((p) => [p.id, p]));
  let list = (cfg.ids || []).map((id) => byId[id]).filter(Boolean);
  const preferredSlugs = ["soiltrack", "iot-operations-platform", "camela"];
  const preferred = preferredSlugs.map((slug) => content.projects.find((p) => p.slug === slug)).filter(Boolean);
  const isLegacySelection = list.some((p) => p.slug === "studya") && !list.some((p) => p.slug === "iot-operations-platform");
  if (!list.length || isLegacySelection) {
    list = preferred.length === preferredSlugs.length ? preferred : content.projects.filter((p) => p.featured);
  }
  list = list.slice(0, cfg.max || 4);
  if (!list.length) return null;
  return (
    <section className="mx-auto max-w-[1440px] px-5 sm:px-8 py-20 sm:py-28" data-testid="home-featured">
      <SectionHead num={num} bigNum={num} eyebrow={cfg.label || "PROJECT_INDEX / FEATURED"} title={cfg.heading || "FEATURED\nPROJECTS"}
        sub="A selection of systems and applications I've designed and developed."
        right={
          <Link to="/work" data-testid="home-all-work"
            className="group font-mono text-[10px] tracking-[0.2em] uppercase text-ink2 hover:text-violet transition-colors whitespace-nowrap">
            <SwapText label="Full Archive →" alt="Open /Work →" />
          </Link>
        } />
      <div className="grid lg:grid-cols-3 gap-5 eq-grid">
        {list.map((p, i) => (
          <ProjectRecord key={p.id} project={p} index={i} />
        ))}
      </div>
    </section>
  );
}

function WhatIBuild({ cfg, num }) {
  const items = (cfg.items || []).filter((i) => i.visible);
  if (!items.length) return null;
  return (
    <section className="relative border-y border-line bg-canvas2/40 bg-dots overflow-hidden" data-testid="home-whatibuild">
      <span aria-hidden="true" className="orb orb-violet orb-float-b hidden md:block" style={{ width: "18rem", height: "18rem", top: "10%", right: "-6rem" }} />
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-20 sm:py-28 relative">
        <SectionHead num={num} bigNum={num} eyebrow="CAPABILITY_INDEX" title={cfg.heading || "WHAT I BUILD"} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line eq-grid">
          {items.map((w, i) => (
            <Reveal key={w.title + i} delay={i * 0.07} className="bg-card p-7 group hover:bg-canvas2/60 transition-colors flex flex-col relative overflow-hidden shine">
              <span aria-hidden="true" className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-violet/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="font-mono text-[10px] tracking-[0.3em] text-violet">{w.techLabel || String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-ink group-hover:text-violet transition-colors">{w.title}</h3>
              <p className="mt-3 text-sm text-ink2 leading-relaxed line-clamp-4">{w.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesPreview({ cfg, content, num }) {
  const byId = Object.fromEntries(content.services.map((s) => [s.id, s]));
  const featured = content.services.filter((service) => service.featured);
  const configured = (cfg.ids || []).map((id) => byId[id]).filter(Boolean);
  let list = (featured.length ? featured : configured.length ? configured : content.services).slice(0, cfg.max || 4);
  const homepageLabels = {
    infosystems: "CUSTOM SYSTEM DEVELOPMENT",
    backend: "DATABASE DESIGN",
  };
  if (!list.length) return null;
  return (
    <section className="mx-auto max-w-[1440px] px-5 sm:px-8 py-20 sm:py-28" data-testid="home-services">
      <SectionHead num={num} bigNum={num} eyebrow="SERVICE_INDEX / FEATURED" title={cfg.heading && cfg.heading !== "SERVICES" ? cfg.heading : "FEATURED SERVICES"}
        sub="Selected service areas from the Services CMS. Explore the full directory for every available capability." />
      <div className="border-t border-line">
        {list.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.04}>
            <Link to="/services" data-testid={`home-service-${s.id}`}
              className="group flex items-center gap-4 sm:gap-8 py-5 border-b border-line hover:bg-canvas2/50 transition-colors px-2 sm:px-4">
              <span className="font-mono text-[11px] text-violet tracking-[0.2em] w-8 shrink-0">{s.num}</span>
              <span className="font-display text-base sm:text-xl font-bold tracking-tight text-ink group-hover:text-violet group-hover:translate-x-1 transition-all flex-1 min-w-0 truncate">{homepageLabels[s.id] || s.title}</span>
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

function TechDetailModal({ tech, content, onClose }) {
  if (!tech) return null;
  const usedIn = content.projects.filter((p) =>
    (p.stack || []).some((s) => s.toLowerCase().includes((tech.name || "").toLowerCase()))
  );
  const related = content.technologies.filter((t) => t.category === tech.category && t.id !== tech.id).slice(0, 4);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" data-testid="tech-modal">
      <div className="absolute inset-0 bg-canvas/85 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative panel w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line sticky top-0 bg-card z-10">
          <span className="font-mono text-[10px] tracking-[0.25em] text-violet uppercase">TECH_STACK / {tech.category}</span>
          <button onClick={onClose} aria-label="Close" data-testid="tech-modal-close" className="text-ink3 hover:text-ink"><X size={16} /></button>
        </div>
        <div className="p-6 sm:p-8">
          <h3 className="font-display text-2xl font-extrabold tracking-tight text-ink">{tech.name}</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div><TechLabel className="block mb-1.5">Status</TechLabel><LevelTag level={tech.level} /></div>
            <div><TechLabel className="block mb-1.5">Category</TechLabel><span className="font-mono text-xs text-ink uppercase">{tech.category}</span></div>
          </div>
          {usedIn.length > 0 && (
            <div className="mt-6">
              <TechLabel className="block mb-3">Used In</TechLabel>
              <div className="space-y-2">
                {usedIn.map((p) => (
                  <Link key={p.id} to={`/work/${p.slug}`} onClick={onClose}
                    className="flex items-center justify-between panel panel-hover px-4 py-3 group">
                    <span className="font-mono text-xs text-ink group-hover:text-violet transition-colors">{p.title}</span>
                    <span className="font-mono text-[9px] text-ink3">CASE STUDY →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {related.length > 0 && (
            <div className="mt-6">
              <TechLabel className="block mb-3">Related</TechLabel>
              <div className="flex flex-wrap gap-1.5">
                {related.map((t) => (
                  <span key={t.id} className="font-mono text-[9px] tracking-[0.12em] uppercase px-2 py-1 border border-line text-ink2">{t.name}</span>
                ))}
              </div>
            </div>
          )}
          {usedIn.length === 0 && related.length === 0 && (
            <p className="mt-6 font-mono text-[10px] text-ink3 uppercase tracking-[0.12em]">Part of the active development toolkit.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function TechStack({ cfg, content, num }) {
  const [open, setOpen] = useState(null);
  const byId = Object.fromEntries(content.technologies.map((t) => [t.id, t]));
  let list = (cfg.ids || []).map((id) => byId[id]).filter(Boolean);
  if (!list.length) list = content.technologies;
  if (!list.length) return null;
  const byCat = {};
  list.forEach((t) => { (byCat[t.category || "Other"] = byCat[t.category || "Other"] || []).push(t); });
  const maxRows = Math.max(...Object.values(byCat).map((items) => items.length));
  return (
    <section className="relative border-y border-line bg-canvas2/40 bg-circuit overflow-hidden" data-testid="home-techstack">
      <span aria-hidden="true" className="orb orb-cyan orb-float-a hidden md:block" style={{ width: "20rem", height: "20rem", top: "-4rem", left: "-4rem" }} />
      <span aria-hidden="true" className="orb orb-violet orb-float-c hidden lg:block" style={{ width: "16rem", height: "16rem", bottom: "-3rem", right: "-3rem" }} />
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-20 sm:py-28 relative">
        <SectionHead num={num} bigNum={num} eyebrow="STACK.INDEX" title={cfg.heading || "TECHNICAL\nSTACK"}
          sub={cfg.sub || "Proficiency labeled honestly. Click a technology to see where it's proven."} />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 eq-grid">
          {Object.entries(byCat).map(([cat, items], i) => (
            <Reveal key={cat} delay={i * 0.05} className="h-full">
              <div className="eq-card panel p-6">
                <TechLabel className="block mb-4 text-violet">TECH_STACK / {cat.toUpperCase()}</TechLabel>
                <ul className="space-y-2.5" style={{ minHeight: `${maxRows * 2.125}rem` }}>
                  {items.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => setOpen(t)}
                        data-testid={`tech-${(t.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                        className="w-full flex items-center justify-between gap-3 px-2 py-1 -mx-2 hover:bg-canvas2/70 transition-colors group"
                      >
                        <span className="font-mono text-xs text-ink group-hover:text-violet transition-colors">{t.name}</span>
                        <LevelTag level={t.level} />
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="eq-card-foot pt-4 mt-4 border-t border-line font-mono text-[9px] tracking-[0.18em] uppercase text-ink3">
                  {String(items.length).padStart(2, "0")} TECHNOLOG{items.length === 1 ? "Y" : "IES"}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {open && <TechDetailModal tech={open} content={content} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </section>
  );
}

function Roadmap({ cfg, num }) {
  const phases = (cfg.phases || []).filter((s) => s.visible !== false);
  if (!phases.length) return null;
  return (
    <section className="mx-auto max-w-[1440px] px-5 sm:px-8 py-20 sm:py-28" data-testid="home-roadmap">
      <SectionHead num={num} bigNum={num} eyebrow={`${num} / ${cfg.scopeLabel || "DEVELOPMENT WORKFLOW — SYSTEM / WEB / APP PROJECTS"}`}
        title={cfg.heading || "SCRUM / PROTOTYPE\nROADMAP"} />
      <WhyScrum cfg={cfg} />
      <RoadmapCanvas cfg={cfg} />
    </section>
  );
}

function ContactChannelsSection({ cfg, content, num }) {
  return (
    <section className="relative border-t border-line bg-canvas2/40 bg-aurora-soft overflow-hidden" data-testid="home-contact-channels">
      <span aria-hidden="true" className="orb orb-pink orb-float-b hidden md:block" style={{ width: "18rem", height: "18rem", top: "10%", right: "-4rem" }} />
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-20 sm:py-28 relative">
        <SectionHead num={num} bigNum={num} eyebrow="OPEN.CHANNELS" title={cfg.heading || "DIRECT\nCHANNELS"}
          sub={cfg.sub || "No forms required. Reach me directly through any of these."} />
        <DirectChannels settings={content.settings} testidPrefix="home-channel" compact />
      </div>
    </section>
  );
}

function FinalCta({ cfg, content }) {
  return (
    <section className="border-t border-line bg-grid bg-aurora-cta relative overflow-hidden" data-testid="home-final-cta">
      <span aria-hidden="true" className="orb orb-violet orb-float-a" style={{ width: "26rem", height: "26rem", top: "-8rem", left: "-6rem" }} />
      <span aria-hidden="true" className="orb orb-cyan orb-float-b hidden md:block" style={{ width: "22rem", height: "22rem", bottom: "-8rem", right: "-6rem" }} />
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-24 sm:py-32 text-center relative">
        <Reveal>
          <div className="flex items-center justify-center gap-2 mb-6">
            <StatusDot color={content.settings.available ? "var(--green)" : "var(--amber)"} />
            <TechLabel>{cfg.eyebrow}</TechLabel>
          </div>
          <h2 className="font-display font-extrabold tracking-tight leading-[0.95] text-5xl sm:text-7xl text-ink whitespace-pre-line">
            {(cfg.heading || "").split(/(\*[^*]+\*)/g).map((part, j) =>
              part.startsWith("*") ? <span key={j} className="gradient-text">{part.replaceAll("*", "")}</span> : part
            )}
          </h2>
          {cfg.body && <p className="mt-6 max-w-xl mx-auto text-sm sm:text-base text-ink2 leading-relaxed">{cfg.body}</p>}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/contact" data-testid="home-contact-cta"
              className="group relative inline-flex h-12 items-center px-8 font-mono text-[11px] tracking-[0.2em] uppercase font-semibold hover:opacity-90 transition-opacity overflow-hidden"
              style={{ color: "var(--bg)", background: "linear-gradient(90deg, var(--violet), color-mix(in srgb, var(--violet) 55%, var(--pink)))" }}>
              <span className="relative z-10">{cfg.buttonLabel || "LET'S TALK →"}</span>
            </Link>
            <Link to="/pricing#estimator" data-testid="home-estimator-cta"
              className="inline-flex h-12 items-center px-8 border border-line font-mono text-[11px] tracking-[0.2em] uppercase text-ink hover:border-violet hover:text-violet transition-colors bg-card/60 backdrop-blur-sm">
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
  contactChannels: ContactChannelsSection,
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
        <section ref={heroRef} className="relative bg-grid bg-aurora overflow-hidden">
          {/* Floating accent orbs — pure CSS, transform-only. */}
          <span aria-hidden="true" className="orb orb-violet orb-float-a" style={{ width: "22rem", height: "22rem", top: "-6rem", left: "-4rem" }} />
          <span aria-hidden="true" className="orb orb-cyan orb-float-b hidden md:block" style={{ width: "18rem", height: "18rem", top: "4rem", right: "-4rem" }} />
          <span aria-hidden="true" className="orb orb-pink orb-float-c hidden lg:block" style={{ width: "14rem", height: "14rem", bottom: "-3rem", left: "40%" }} />
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 pt-16 sm:pt-24 pb-16 sm:pb-20 grid lg:grid-cols-12 gap-12 items-center relative">
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
                    className="group inline-flex h-12 items-center gap-3 px-5 border border-violet/50 bg-violet/5 font-mono text-[11px] tracking-[0.18em] uppercase font-semibold text-ink2 hover:text-violet hover:border-violet hover:bg-violet/10 hover:shadow-[0_0_24px_color-mix(in_srgb,var(--violet)_14%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet transition-all">
                    <span>{(hero.resumeCta || "Download CV").replace(/\s*[↓↧]\s*$/, "")}</span>
                    <span aria-hidden="true" className="text-violet text-base leading-none group-hover:translate-y-0.5 transition-transform">↓</span>
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
        const num = String(i + 2).padStart(2, "0");
        return (
          <div key={sec.key}>
            <Comp cfg={config[sec.key] || {}} content={content} num={num} />
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
