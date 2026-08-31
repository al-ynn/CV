import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useContent } from "../lib/content";
import useSeo from "../lib/useSeo";
import { MARQUEE_ITEMS, PROCESS, WHAT_I_BUILD } from "../data/content";
import { SectionHead, TechLabel, StatusDot, SwapText, Reveal, LevelTag } from "../components/system/bits";
import Marquee from "../components/system/Marquee";
import ProjectRecord from "../components/ProjectRecord";

const BARS = [
  { label: "FRONTEND", val: 87, color: "var(--cyan)" },
  { label: "BACKEND", val: 92, color: "var(--violet)" },
  { label: "DATABASE", val: 85, color: "var(--pink)" },
  { label: "UI / UX", val: 78, color: "var(--amber)" },
  { label: "SYSTEM DESIGN", val: 82, color: "var(--violet)" },
];

function HeroTitle({ text }) {
  const lines = (text || "I BUILD SYSTEMS\nTHAT WORK BEYOND\nTHE *INTERFACE.*").split("\n");
  return (
    <h1 className="font-display font-extrabold tracking-tight leading-[0.95] text-[13vw] sm:text-6xl lg:text-7xl xl:text-[5.2rem] text-ink">
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-1">
          <motion.span
            className="block"
            initial={{ y: "112%" }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 + i * 0.13, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {line.split(/(\*[^*]+\*)/g).map((part, j) =>
              part.startsWith("*") ? (
                <span key={j} className="text-violet">{part.replaceAll("*", "")}</span>
              ) : (
                part
              )
            )}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

function SystemProfile({ projectCount }) {
  return (
    <div className="panel relative overflow-hidden" data-testid="system-profile">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-line">
        <span className="font-mono text-[10px] tracking-[0.25em] text-violet">SYSTEM PROFILE</span>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-pk/70" />
          <span className="w-2 h-2 rounded-full bg-amb/70" />
          <span className="w-2 h-2 rounded-full bg-grn/70" />
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="font-mono text-xs text-ink mb-1">ALEANA_AMURAO</div>
        <div className="font-mono text-[10px] tracking-[0.2em] text-ink3 mb-6">FULL_STACK_DEVELOPER</div>
        <div className="space-y-3.5">
          {BARS.map((b, i) => (
            <div key={b.label}>
              <div className="flex justify-between font-mono text-[9px] tracking-[0.2em] text-ink3 mb-1.5">
                <span>{b.label}</span>
                <span style={{ color: b.color }}>{b.val}%</span>
              </div>
              <div className="h-1.5 bg-canvas2 overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: b.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${b.val}%` }}
                  transition={{ delay: 0.9 + i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-px bg-line border border-line mt-7">
          {[
            { k: "STATUS", v: "AVAILABLE", dot: true },
            { k: "PROJECTS", v: `${projectCount} DEPLOYED` },
            { k: "LOCATION", v: "PHILIPPINES" },
          ].map((cell) => (
            <div key={cell.k} className="bg-card px-3 py-3">
              <div className="font-mono text-[8px] tracking-[0.2em] text-ink3 mb-1">{cell.k}</div>
              <div className="font-mono text-[10px] tracking-[0.1em] text-ink flex items-center gap-1.5">
                {cell.dot && <StatusDot />}
                {cell.v}
              </div>
            </div>
          ))}
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

export default function Home() {
  const { projects, services, pricing, settings, homepage, skills, journey, loading } = useContent();
  useSeo(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const panelY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.25]);

  const sections = homepage.sections || {};
  const show = (key) => sections[key] !== false;

  const featured = projects.filter((p) => p.featured).slice(0, 3);
  const shown = featured.length ? featured : projects.slice(0, 3);
  const pricingPreview = pricing.filter((p) => p.featured).slice(0, 2);
  const stackPreview = skills.filter((s) => s.title !== "PROFESSIONAL SKILLS").slice(0, 6);
  const journeyTeaser = journey.slice(-3);

  return (
    <div>
      {homepage.showAnnouncement && homepage.announcement && (
        <div className="border-b border-line bg-violet/10 px-5 py-2.5 text-center font-mono text-[10px] tracking-[0.2em] uppercase text-violet" data-testid="announcement-bar">
          {homepage.announcement}
        </div>
      )}

      {/* HERO */}
      <section ref={heroRef} className="relative bg-grid overflow-hidden">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 pt-16 sm:pt-24 pb-16 sm:pb-20 grid lg:grid-cols-12 gap-12 items-center">
          <motion.div className="lg:col-span-7" style={{ opacity: heroOpacity }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="flex items-center gap-3 mb-8">
              <span className="font-mono text-[10px] tracking-[0.3em] text-violet">
                {homepage.heroEyebrow || "FULL-STACK DEVELOPER / PHILIPPINES"}
              </span>
              <span className="h-px w-16 bg-violet/50" />
            </motion.div>

            <HeroTitle text={homepage.heroTitle} />

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.6 }}
              className="mt-7 max-w-xl text-sm sm:text-base text-ink2 leading-relaxed">
              {homepage.heroParagraph}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-6 flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase" data-testid="hero-status">
              <StatusDot color={settings.available ? "var(--green)" : "var(--amber)"} />
              <span style={{ color: settings.available ? "var(--green)" : "var(--amber)" }}>
                {settings.availability === "limited" ? "Limited availability" : settings.available ? "Available for select projects" : "Currently unavailable"}
              </span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.6 }}
              className="mt-9 flex flex-wrap items-center gap-4">
              <Link to="/contact" data-testid="hero-cta-start"
                className="group inline-flex h-12 items-center px-7 bg-violet font-mono text-[11px] tracking-[0.2em] uppercase font-semibold hover:opacity-90 transition-opacity"
                style={{ color: "var(--bg)" }}>
                <SwapText label={homepage.primaryCta || "Start a Project →"} alt="Initialize Inquiry →" />
              </Link>
              <Link to="/work" data-testid="hero-cta-work"
                className="group inline-flex h-12 items-center px-7 border border-line font-mono text-[11px] tracking-[0.2em] uppercase text-ink hover:border-violet hover:text-violet transition-colors">
                <SwapText label={homepage.secondaryCta || "Explore My Work"} alt="Open /Project Archive" />
              </Link>
              <a href={`${process.env.REACT_APP_BACKEND_URL}/api/resume.pdf`} data-testid="hero-cta-cv"
                className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink3 hover:text-violet transition-colors">
                Download CV ↓
              </a>
            </motion.div>
          </motion.div>

          <motion.div className="lg:col-span-5" style={{ y: panelY }}
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <SystemProfile projectCount={projects.length || 5} />
          </motion.div>
        </div>
      </section>

      {/* QUICK METRICS */}
      <section className="border-y border-line">
        <div className="mx-auto max-w-[1440px] grid grid-cols-2 lg:grid-cols-4">
          {[
            { k: "SYS.STATUS", v: settings.available ? "ONLINE" : "BUSY", c: "var(--green)" },
            { k: "DEPLOYED SYSTEMS", v: String(projects.length || 0).padStart(2, "0"), c: "var(--violet)" },
            { k: "SERVICE MODULES", v: String(services.length || 0).padStart(2, "0"), c: "var(--cyan)" },
            { k: "EDUCATION", v: "BS IT · CLSU", c: "var(--amber)" },
          ].map((m, i) => (
            <Reveal key={m.k} delay={i * 0.06}
              className={`px-5 sm:px-8 py-7 border-line ${i > 0 ? "border-l" : ""} ${i > 1 ? "max-lg:border-t max-lg:border-l-0" : ""} ${i % 2 === 1 ? "max-lg:border-l" : ""}`}>
              <TechLabel className="block mb-2">{m.k}</TechLabel>
              <span className="font-mono text-xl sm:text-2xl font-bold tabular-nums" style={{ color: m.c }}>{m.v}</span>
            </Reveal>
          ))}
        </div>
      </section>

      <Marquee items={MARQUEE_ITEMS} />

      {/* SELECTED WORK */}
      {show("selectedWork") && (
        <section className="mx-auto max-w-[1440px] px-5 sm:px-8 py-20 sm:py-28">
          <SectionHead num="02" title="SELECTED WORK"
            sub="Real systems, shipped for real use. Numbered records from the project archive."
            right={
              <Link to="/work" data-testid="home-all-work"
                className="group font-mono text-[10px] tracking-[0.2em] uppercase text-ink2 hover:text-violet transition-colors whitespace-nowrap">
                <SwapText label="Full Archive →" alt="Open /Work →" />
              </Link>
            } />
          <div className="grid lg:grid-cols-3 gap-5">
            {shown.map((p, i) => <ProjectRecord key={p.id} project={p} index={i} />)}
          </div>
          {loading && <p className="font-mono text-xs text-ink3 mt-6 animate-blink">LOADING PROJECT RECORDS…</p>}
        </section>
      )}

      {/* WHAT I BUILD */}
      {show("whatIBuild") && (
        <section className="border-y border-line bg-canvas2/40">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-20 sm:py-28">
            <SectionHead num="03" title="WHAT I BUILD" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line">
              {WHAT_I_BUILD.map((w, i) => (
                <Reveal key={w.num} delay={i * 0.07} className="bg-card p-7 group hover:bg-canvas2/60 transition-colors">
                  <span className="font-mono text-[10px] tracking-[0.3em] text-violet">{w.num}</span>
                  <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-ink group-hover:text-violet transition-colors">{w.title}</h3>
                  <p className="mt-3 text-sm text-ink2 leading-relaxed">{w.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SERVICES PREVIEW */}
      {show("services") && (
        <section className="mx-auto max-w-[1440px] px-5 sm:px-8 py-20 sm:py-28">
          <SectionHead num="04" title={`SERVICES / ${String(services.length || 0).padStart(2, "0")}`}
            sub="Service systems. Each one a stack of specialized capabilities." />
          <div className="border-t border-line">
            {services.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.04}>
                <Link to="/services" data-testid={`home-service-${s.id}`}
                  className="group flex items-center gap-4 sm:gap-8 py-5 border-b border-line hover:bg-canvas2/50 transition-colors px-2 sm:px-4">
                  <span className="font-mono text-[11px] text-violet tracking-[0.2em] w-8 shrink-0">{s.num}</span>
                  <span className="font-display text-base sm:text-xl font-bold tracking-tight text-ink group-hover:text-violet transition-colors flex-1 min-w-0 truncate">
                    {s.title}
                  </span>
                  <span className="hidden md:block font-mono text-[9px] tracking-[0.15em] text-ink3 uppercase">
                    {(s.capabilities || []).length} CAPABILITIES
                  </span>
                  <span className="font-mono text-xs text-ink3 group-hover:text-violet group-hover:translate-x-1 transition-all">→</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* STACK PREVIEW */}
      {show("stack") && stackPreview.length > 0 && (
        <section className="border-y border-line bg-canvas2/40">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-20 sm:py-28">
            <SectionHead num="05" title="TECHNICAL STACK" sub="No fake percentages. Levels labeled honestly." />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {stackPreview.map((cat, i) => (
                <Reveal key={cat.id} delay={i * 0.05} className="panel p-6">
                  <TechLabel className="block mb-4 text-violet">{cat.title}</TechLabel>
                  <ul className="space-y-2.5">
                    {(cat.items || []).slice(0, 5).map((item) => (
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
        </section>
      )}

      {/* PROCESS PIPELINE */}
      {show("process") && (
        <section className="mx-auto max-w-[1440px] px-5 sm:px-8 py-20 sm:py-28">
          <SectionHead num="06" title="DEVELOPMENT PROCESS" sub="Every project runs the same pipeline. No skipped stages." />
          <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-px bg-line border border-line">
            {PROCESS.map((step, i) => (
              <Reveal key={step.num} delay={i * 0.06} className="bg-card p-6 relative group hover:bg-canvas2/60 transition-colors">
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono text-xl font-bold text-violet">{step.num}</span>
                  {i < PROCESS.length - 1 && <span className="font-mono text-ink3 text-xs max-xl:hidden">→</span>}
                </div>
                <h3 className="font-display text-sm font-bold tracking-wide text-ink mb-4">{step.title}</h3>
                <ul className="space-y-1.5">
                  {step.items.map((it) => (
                    <li key={it} className="font-mono text-[10px] tracking-[0.08em] text-ink3 uppercase">· {it}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* JOURNEY TEASER */}
      {show("journey") && journeyTeaser.length > 0 && (
        <section className="border-y border-line bg-canvas2/40">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHead num="07" title="JOURNEY.LOG" sub="Commit history of a developer career — initialized 2023, still pushing." />
              <Link to="/journey" data-testid="home-journey-cta"
                className="group inline-flex h-11 items-center px-6 border border-line font-mono text-[11px] tracking-[0.2em] uppercase text-ink hover:border-violet hover:text-violet transition-colors">
                <SwapText label="View Full Log →" alt="Open /Journey →" />
              </Link>
            </div>
            <div className="panel p-6 font-mono text-xs space-y-3">
              <div className="text-ink3 text-[10px] tracking-[0.25em] mb-4">$ git log --career</div>
              {journeyTeaser.map((j, i) => (
                <Reveal key={j.id} delay={i * 0.08} className="flex gap-4">
                  <span className="text-violet shrink-0">{j.code}</span>
                  <div className="min-w-0">
                    <span className="text-ink">{j.title}</span>
                    <span className="text-ink3 ml-2">({j.year})</span>
                  </div>
                </Reveal>
              ))}
              <div className="text-grn text-[10px] tracking-[0.2em] pt-2">→ HEAD is now at BUILDING</div>
            </div>
          </div>
        </section>
      )}

      {/* PRICING PREVIEW */}
      {show("pricing") && (
        <section className="mx-auto max-w-[1440px] px-5 sm:px-8 py-20 sm:py-28">
          <SectionHead num="08" title="PRICING"
            sub="Starting points, not traps. Final pricing depends on scope, integrations, complexity, and timeline."
            right={
              <Link to="/pricing" data-testid="home-pricing-link"
                className="group font-mono text-[10px] tracking-[0.2em] uppercase text-ink2 hover:text-violet transition-colors whitespace-nowrap">
                <SwapText label="All Packages →" alt="Open /Pricing →" />
              </Link>
            } />
          <div className="grid sm:grid-cols-2 gap-5">
            {(pricingPreview.length ? pricingPreview : pricing.slice(0, 2)).map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08} className="panel panel-hover p-7">
                <TechLabel className="block mb-3">{p.model}</TechLabel>
                <div className="font-mono text-3xl font-bold text-violet">{p.price}</div>
                <h3 className="mt-3 font-display text-lg font-bold text-ink">{p.name}</h3>
                <p className="mt-2 text-xs text-ink3 font-mono">{p.note}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CONTACT CTA */}
      {show("contactCta") && (
        <section className="border-t border-line bg-grid">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-24 sm:py-32 text-center">
            <Reveal>
              <TechLabel className="block mb-6">TRANSMISSION / 09</TechLabel>
              <h2 className="font-display font-extrabold tracking-tight leading-[0.95] text-5xl sm:text-7xl text-ink">
                HAVE A SYSTEM<br /><span className="text-violet">IN MIND?</span>
              </h2>
              <p className="mt-6 max-w-xl mx-auto text-sm sm:text-base text-ink2 leading-relaxed">
                Tell me what you're building, what problem you're solving, or what existing system needs improvement.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link to="/contact" data-testid="home-contact-cta"
                  className="group inline-flex h-12 items-center px-8 bg-violet font-mono text-[11px] tracking-[0.2em] uppercase font-semibold hover:opacity-90 transition-opacity"
                  style={{ color: "var(--bg)" }}>
                  <SwapText label="Start a Project →" alt="Open /Contact →" />
                </Link>
                <Link to="/pricing#estimator" data-testid="home-estimator-cta"
                  className="inline-flex h-12 items-center px-8 border border-line font-mono text-[11px] tracking-[0.2em] uppercase text-ink hover:border-violet hover:text-violet transition-colors">
                  Estimate Scope ₱
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </div>
  );
}
