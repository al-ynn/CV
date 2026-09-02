import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useContent } from "../lib/content";
import useSeo from "../lib/useSeo";
import { peso } from "../data/content";
import { SectionHead, TechLabel, Reveal } from "../components/system/bits";
import Estimator from "../components/Estimator";

const KIND_STYLE = { static: "var(--green)", dynamic: "var(--cyan)", system: "var(--violet)", design: "var(--amber)", support: "var(--pink)" };

const PRICE_FACTORS = [
  "PROJECT TYPE", "STATIC / DYNAMIC", "PAGES / SCREENS", "MODULES", "DATABASE",
  "USER ROLES", "INTEGRATIONS", "UI / UX", "TIMELINE", "DOCUMENTATION",
];

const ARCH_EXPLAINER = [
  {
    title: "STATIC WEBSITE", code: "ARCH.STATIC", color: "var(--green)",
    items: ["Informational content", "No user login", "No database-driven workflow", "Company / portfolio / landing sites"],
    note: "Generally lower cost.",
  },
  {
    title: "DYNAMIC WEBSITE", code: "ARCH.DYNAMIC", color: "var(--cyan)",
    items: ["Database", "Login / accounts", "Content management", "Dashboards", "API integrations"],
    note: "Higher cost — backend included.",
  },
  {
    title: "WEB SYSTEM / APPLICATION", code: "ARCH.SYSTEM", color: "var(--violet)",
    items: ["Multiple user roles", "Complex database", "Admin modules", "Reporting", "Workflow management", "Audit logs"],
    note: "Priced by module and workflow complexity.",
  },
];

export default function Pricing() {
  const { pricing, estimator, loading } = useContent();
  useSeo("Pricing");
  const { hash } = useLocation();

  useEffect(() => {
    if (hash === "#estimator") {
      setTimeout(() => document.getElementById("estimator")?.scrollIntoView({ behavior: "smooth" }), 300);
    }
  }, [hash]);

  const est = estimator || {};

  return (
    <div className="bg-dots min-h-screen">
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-16 sm:py-24">
      <SectionHead num="04 /" title="PRICING"
        sub={est.philosophyBody || "Final pricing depends on scope, integrations, complexity, timeline, and technical requirements."} />

      {/* 01 static/dynamic/system */}
      <div className="mb-16">
        <TechLabel className="block mb-5">01 / ARCHITECTURE DETERMINES COST</TechLabel>
        <div className="grid md:grid-cols-3 gap-px bg-line border border-line eq-grid">
          {ARCH_EXPLAINER.map((a, i) => (
            <Reveal key={a.code} delay={i * 0.06} className="bg-card p-6 flex flex-col">
              <span className="font-mono text-[9px] tracking-[0.25em]" style={{ color: a.color }}>{a.code}</span>
              <h3 className="mt-2 font-display text-base font-bold text-ink">{a.title}</h3>
              <ul className="mt-4 space-y-1.5">
                {a.items.map((it) => (
                  <li key={it} className="font-mono text-[10px] text-ink2 flex gap-2"><span style={{ color: a.color }}>·</span>{it}</li>
                ))}
              </ul>
              <p className="mt-4 pt-3 border-t border-line font-mono text-[9px] tracking-[0.1em] uppercase text-ink3 mt-auto">{a.note}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* 02 starting references */}
      <div className="mb-16">
        <TechLabel className="block mb-5">02 / STARTING PRICE REFERENCES — EDITABLE RANGES, NOT PACKAGES</TechLabel>
        {loading ? (
          <p className="font-mono text-xs text-ink3 animate-blink">LOADING…</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 eq-grid" data-testid="pricing-references">
            {pricing.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.04} className="h-full">
                <div className={`panel panel-hover p-5 eq-card ${p.featured ? "border-violet/60" : ""}`}>
                  <span className="font-mono text-[8px] tracking-[0.25em] uppercase" style={{ color: KIND_STYLE[p.kind] || "var(--tx3)" }}>
                    {(p.kind || "").toUpperCase()}
                  </span>
                  <h3 className="mt-2 font-display text-sm font-bold tracking-tight text-ink leading-snug">{p.name}</h3>
                  <div className="mt-3 font-mono text-lg font-bold text-ink" data-testid={`range-${p.id}`}>
                    {peso(p.min)} – {peso(p.max)}{p.plus ? "+" : ""}
                  </div>
                  <ul className="mt-3 space-y-1">
                    {(p.typical || []).slice(0, 4).map((t) => (
                      <li key={t} className="font-mono text-[9px] tracking-[0.05em] text-ink3 uppercase flex gap-1.5">
                        <span className="text-grn">✓</span>{t}
                      </li>
                    ))}
                  </ul>
                  <p className="eq-card-foot mt-3 pt-3 border-t border-line font-mono text-[9px] text-ink3 leading-relaxed">{p.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {/* 03 estimator */}
      <div id="estimator" className="mb-16 scroll-mt-24">
        <TechLabel className="block mb-5">03 / PROJECT ESTIMATOR</TechLabel>
        <Estimator />
      </div>

      {/* 04 what affects price */}
      <div className="mb-16">
        <TechLabel className="block mb-5">04 / WHAT AFFECTS THE PRICE?</TechLabel>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-line border border-line">
          {PRICE_FACTORS.map((f, i) => (
            <div key={f} className="bg-card px-4 py-4">
              <span className="font-mono text-[10px] text-violet">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-1 font-mono text-[9px] tracking-[0.15em] uppercase text-ink2">{f}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 05 scope comparison */}
      <div className="mb-16">
        <TechLabel className="block mb-5">05 / WHY PAGE COUNT ALONE DOESN'T SET THE PRICE</TechLabel>
        <div className="grid md:grid-cols-2 gap-px bg-line border border-line">
          <div className="bg-card p-6">
            <span className="font-mono text-[9px] tracking-[0.25em] text-grn">PROJECT A / EXAMPLE</span>
            <h3 className="mt-2 font-display text-lg font-bold text-ink">COMPANY WEBSITE</h3>
            <div className="mt-4 space-y-1.5 font-mono text-[10px] text-ink2 uppercase">
              <p>STATIC · 5 pages · contact form · responsive</p>
            </div>
            <p className="mt-4 pt-3 border-t border-line font-mono text-[10px] text-grn uppercase">Estimate: lower range</p>
          </div>
          <div className="bg-card p-6">
            <span className="font-mono text-[9px] tracking-[0.25em] text-violet">PROJECT B / EXAMPLE</span>
            <h3 className="mt-2 font-display text-lg font-bold text-ink">BUSINESS SYSTEM</h3>
            <div className="mt-4 space-y-1.5 font-mono text-[10px] text-ink2 uppercase">
              <p>DYNAMIC · 5 screens · authentication · admin · database · reports · 3 roles</p>
            </div>
            <p className="mt-4 pt-3 border-t border-line font-mono text-[10px] text-violet uppercase">Estimate: higher range</p>
          </div>
        </div>
        <p className="mt-4 font-mono text-[10px] tracking-[0.08em] text-ink3 uppercase leading-relaxed">
          Both may have five screens — their technical scope is completely different. That's exactly why pricing here is scope-based.
        </p>
      </div>

      {/* 06 CTA */}
      <div className="panel p-8 sm:p-12 text-center bg-grid">
        <TechLabel className="block mb-4">CUSTOM SCOPE?</TechLabel>
        <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-ink">
          YOUR QUOTATION IS BASED ON<br /><span className="text-violet">WHAT THE PROJECT ACTUALLY NEEDS.</span>
        </h2>
        <Link to="/contact" data-testid="pricing-custom-quote"
          className="mt-7 inline-flex h-12 items-center px-8 bg-violet font-mono text-[11px] tracking-[0.2em] uppercase font-semibold hover:opacity-90 transition-opacity"
          style={{ color: "var(--bg)" }}>
          Request Custom Quote →
        </Link>
      </div>
    </div>
    </div>
  );
}
