import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../lib/content";
import { peso } from "../data/content";
import { TechLabel } from "./system/bits";

const KIND_LABEL = { static: "STATIC", dynamic: "DYNAMIC", system: "SYSTEM", design: "DESIGN", support: "SUPPORT" };

function Chip({ active, onClick, children, testid }) {
  return (
    <button type="button" data-testid={testid} onClick={onClick} aria-pressed={active}
      className={`px-3.5 h-9 font-mono text-[10px] tracking-[0.12em] uppercase border transition-colors ${
        active ? "border-violet text-violet bg-violet/10" : "border-line text-ink2 hover:border-ink3"
      }`}>
      {children}
    </button>
  );
}

export default function Estimator() {
  const navigate = useNavigate();
  const { estimator } = useContent();
  const cfg = estimator?.types ? estimator : null;
  const [type, setType] = useState(null);
  const [pages, setPages] = useState(null);
  const [modules, setModules] = useState(null);
  const [features, setFeatures] = useState([]);
  const [design, setDesign] = useState(null);
  const [timeline, setTimeline] = useState(null);

  const types = cfg?.types || [];
  const pageBrackets = cfg?.pageBrackets || [];
  const moduleBrackets = cfg?.moduleBrackets || [];
  const featureList = cfg?.features || [];
  const designOpts = cfg?.design || [];
  const timelineOpts = cfg?.timeline || [];

  const activeType = types.find((t) => t.label === type) || types[0] || { kind: "static", min: 0, max: 0, weeks: 1, complexity: "SIMPLE", label: "" };
  const isStatic = activeType.kind === "static" || activeType.kind === "design";
  const showModules = !isStatic;
  const activePages = pages ?? pageBrackets[0]?.label;
  const activeModules = modules ?? moduleBrackets[0]?.label;
  const activeDesign = design ?? designOpts[0]?.label;
  const activeTimeline = timeline ?? (timelineOpts.find((t) => t.label === "Standard")?.label || timelineOpts[0]?.label);

  const result = useMemo(() => {
    let low = activeType.min, high = activeType.max, weeks = activeType.weeks || 2;
    if (isStatic) {
      const b = pageBrackets.find((x) => x.label === activePages);
      if (b) { low += b.addMin; high += b.addMax; weeks += Math.round((b.addMin + b.addMax) / 4000); }
    } else {
      const m = moduleBrackets.find((x) => x.label === activeModules);
      if (m) { low += m.addMin; high += m.addMax; weeks += m.weeks || 0; }
    }
    const featAdd = features.reduce((s, label) => s + Number(featureList.find((f) => f.label === label)?.add || 0), 0);
    low += featAdd; high += featAdd * 1.3;
    weeks += Math.round(featAdd / 4000);
    const dMult = Number(designOpts.find((x) => x.label === activeDesign)?.mult || 1);
    const tMult = Number(timelineOpts.find((x) => x.label === activeTimeline)?.mult || 1);
    low *= dMult * tMult; high *= dMult * tMult;
    let complexity = activeType.complexity || "STANDARD";
    if (features.length + (showModules ? 1 : 0) >= 5) complexity = "ADVANCED";
    if (features.length >= 8) complexity = "CUSTOM";
    return { low, high, weeks: Math.max(1, weeks), complexity };
  }, [activeType, isStatic, activePages, activeModules, features, activeDesign, activeTimeline, pageBrackets, moduleBrackets, featureList, designOpts, timelineOpts, showModules]);

  if (!cfg) return null;

  const toggleFeature = (label) =>
    setFeatures((f) => (f.includes(label) ? f.filter((x) => x !== label) : [...f, label]));

  const sendBrief = () => {
    navigate("/contact", {
      state: {
        brief: {
          range: `${peso(result.low)} — ${peso(result.high)}`,
          features,
          type: `${activeType.label} (${KIND_LABEL[activeType.kind] || activeType.kind})`,
        },
      },
    });
  };

  return (
    <div className="panel" data-testid="quote-estimator">
      <div className="px-5 sm:px-6 py-3 border-b border-line flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.25em] text-violet">PROJECT_SCOPE / ESTIMATOR</span>
        <span className="font-mono text-[9px] tracking-[0.2em] text-ink3">NON-BINDING</span>
      </div>
      <div className="p-5 sm:p-8 grid lg:grid-cols-[1fr_340px] gap-10">
        <div className="space-y-8">
          <div>
            <TechLabel className="block mb-3">01 / WHAT ARE YOU BUILDING?</TechLabel>
            <div className="flex flex-wrap gap-2">
              {cfg.types.map((t) => (
                <Chip key={t.label} testid={`est-type-${t.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                  active={activeType.label === t.label} onClick={() => setType(t.label)}>
                  {t.label}
                </Chip>
              ))}
            </div>
            <p className="mt-2.5 font-mono text-[9px] tracking-[0.15em] text-ink3 uppercase">
              ARCHITECTURE: {KIND_LABEL[activeType.kind] || activeType.kind}
            </p>
          </div>

          {isStatic ? (
            <div>
              <TechLabel className="block mb-3">02 / HOW MANY PAGES?</TechLabel>
              <div className="flex flex-wrap gap-2">
                {cfg.pageBrackets.map((b) => (
                  <Chip key={b.label} testid={`est-pages-${b.label.replace(/[^a-z0-9]+/g, "-")}`}
                    active={activePages === b.label} onClick={() => setPages(b.label)}>
                    {b.label}
                  </Chip>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <TechLabel className="block mb-3">02 / APPROXIMATE MODULES</TechLabel>
              <div className="flex flex-wrap gap-2">
                {cfg.moduleBrackets.map((m) => (
                  <Chip key={m.label} testid={`est-modules-${m.label.replace(/[^a-z0-9]+/g, "-")}`}
                    active={activeModules === m.label} onClick={() => setModules(m.label)}>
                    {m.label}
                  </Chip>
                ))}
              </div>
              <p className="mt-2.5 font-mono text-[9px] tracking-[0.1em] text-amb uppercase leading-relaxed">
                ⚠ {cfg.architectureNote}
              </p>
            </div>
          )}

          <div>
            <TechLabel className="block mb-3">03 / FEATURES</TechLabel>
            <div className="flex flex-wrap gap-2">
              {cfg.features.map((f) => (
                <Chip key={f.label} testid={`est-feature-${f.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                  active={features.includes(f.label)} onClick={() => toggleFeature(f.label)}>
                  {f.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <TechLabel className="block mb-3">04 / DESIGN</TechLabel>
              <div className="flex flex-wrap gap-2">
                {cfg.design.map((d) => (
                  <Chip key={d.label} testid={`est-design-${d.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                    active={activeDesign === d.label} onClick={() => setDesign(d.label)}>
                    {d.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <TechLabel className="block mb-3">05 / TARGET WINDOW</TechLabel>
              <div className="flex flex-wrap gap-2">
                {cfg.timeline.map((t) => (
                  <Chip key={t.label} testid={`est-timeline-${t.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                    active={activeTimeline === t.label} onClick={() => setTimeline(t.label)}>
                    {t.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="panel p-6 self-start lg:sticky lg:top-24">
          <TechLabel className="block mb-4">INITIAL PROJECT RANGE</TechLabel>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-violet" data-testid="estimator-range">
            {peso(result.low)} – {peso(result.high)}
          </div>
          <div className="mt-5 space-y-2.5 font-mono text-[10px] tracking-[0.15em] uppercase">
            <div className="flex justify-between">
              <span className="text-ink3">Estimated duration</span>
              <span className="text-ink">~{result.weeks}–{result.weeks + 2} weeks</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink3">Complexity</span>
              <span className="text-cy">{result.complexity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink3">Architecture</span>
              <span className="text-ink">{KIND_LABEL[activeType.kind] || activeType.kind}</span>
            </div>
          </div>
          <p className="mt-5 font-mono text-[10px] leading-relaxed text-amb uppercase tracking-[0.08em] border-t border-line pt-4">
            {cfg.resultDisclaimer}
          </p>
          <button data-testid="estimator-send-brief" onClick={sendBrief}
            className="mt-6 w-full h-11 bg-violet font-mono text-[11px] tracking-[0.2em] uppercase font-semibold hover:opacity-90 transition-opacity"
            style={{ color: "var(--bg)" }}>
            Request Detailed Quote →
          </button>
        </div>
      </div>
    </div>
  );
}
