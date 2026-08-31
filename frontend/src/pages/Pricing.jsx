import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useContent } from "../lib/content";
import useSeo from "../lib/useSeo";
import { SectionHead, TechLabel, Reveal } from "../components/system/bits";
import Estimator from "../components/Estimator";

export default function Pricing() {
  const { pricing, estimator, loading } = useContent();
  useSeo("Pricing");
  const { hash } = useLocation();

  useEffect(() => {
    if (hash === "#estimator") {
      setTimeout(() => document.getElementById("estimator")?.scrollIntoView({ behavior: "smooth" }), 300);
    }
  }, [hash]);

  const disclaimer = estimator.disclaimer ||
    "Every project is scoped individually. Small budgets are welcome — scope adjusts, quality doesn't.";

  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-16 sm:py-24">
      <SectionHead num="04 /" title="PRICING"
        sub="Transparent starting points in Philippine Peso. Final pricing depends on scope, integrations, complexity, timeline, and technical requirements." />

      <div className="panel px-5 py-3.5 mb-10 border-l-2" style={{ borderLeftColor: "var(--amber)" }}>
        <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink3 leading-relaxed">
          <span style={{ color: "var(--amber)" }}>NOTE //</span> {disclaimer}
        </p>
      </div>

      {loading ? (
        <p className="font-mono text-xs text-ink3 animate-blink">LOADING PACKAGES…</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pricing.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05} className={`panel panel-hover p-6 flex flex-col ${p.featured ? "border-violet/60" : ""}`}>
              {p.featured && (
                <span className="font-mono text-[9px] tracking-[0.25em] text-violet mb-3">★ FREQUENTLY REQUESTED</span>
              )}
              <TechLabel className="block mb-2">{p.model}</TechLabel>
              <div className="font-mono text-3xl font-bold text-ink" data-testid={`price-${p.id}`}>
                {p.currency || "₱"}{String(p.price).replace(/^₱/, "")}
              </div>
              <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-ink">{p.name}</h3>
              <ul className="mt-4 space-y-1.5 flex-1">
                {(p.includes || []).map((inc) => (
                  <li key={inc} className="font-mono text-[10px] tracking-[0.05em] text-ink3 uppercase flex gap-2">
                    <span className="text-grn">✓</span> {inc}
                  </li>
                ))}
                {(p.excludes || []).map((exc) => (
                  <li key={exc} className="font-mono text-[10px] tracking-[0.05em] text-ink3/60 uppercase flex gap-2">
                    <span className="text-pk">✕</span> {exc}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[11px] text-ink3 leading-relaxed border-t border-line pt-3">{p.note}</p>
              <Link to="/contact" data-testid={`pricing-cta-${p.id}`}
                className="mt-5 inline-flex h-10 items-center justify-center border border-line font-mono text-[10px] tracking-[0.2em] uppercase text-ink hover:border-violet hover:text-violet transition-colors">
                {p.cta} →
              </Link>
            </Reveal>
          ))}
        </div>
      )}

      <div id="estimator" className="mt-20 scroll-mt-24">
        <SectionHead num="04.5 /" title="QUOTE ESTIMATOR" sub="Configure a rough scope. Get an initial range — not a binding quote." />
        <Estimator />
      </div>

      <div className="mt-20 panel p-8 sm:p-12 text-center bg-grid">
        <TechLabel className="block mb-4">OUT OF SCOPE?</TechLabel>
        <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-ink">
          NEED SOMETHING OUTSIDE THESE PACKAGES?<br /><span className="text-violet">LET'S SCOPE IT.</span>
        </h2>
        <Link to="/contact" data-testid="pricing-custom-quote"
          className="mt-7 inline-flex h-12 items-center px-8 bg-violet font-mono text-[11px] tracking-[0.2em] uppercase font-semibold hover:opacity-90 transition-opacity"
          style={{ color: "var(--bg)" }}>
          Request Custom Quote →
        </Link>
      </div>
    </div>
  );
}
