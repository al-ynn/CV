import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../lib/content";
import { peso } from "../data/content";
import { TechLabel } from "./system/bits";

const FALLBACK_CONFIG = {
  types: [
    { label: "Website", base: 8000 }, { label: "E-Commerce", base: 25000 },
    { label: "Web Application", base: 20000 }, { label: "Information System", base: 30000 },
    { label: "UI/UX", base: 5000 }, { label: "Existing System Work", base: 3000 },
  ],
  features: [
    { label: "Authentication", add: 3000 }, { label: "Admin Dashboard", add: 4000 },
    { label: "Database", add: 4000 }, { label: "E-Commerce", add: 8000 },
    { label: "Payment Gateway", add: 5000 }, { label: "API", add: 4000 },
    { label: "Role Management", add: 3000 }, { label: "Reporting", add: 3000 },
    { label: "Email", add: 1500 }, { label: "SMS", add: 2500 },
    { label: "File Upload", add: 1500 }, { label: "QR", add: 3000 },
    { label: "Advanced Search", add: 2500 },
  ],
  design: [
    { label: "Existing design", mult: 1 }, { label: "Template customization", mult: 1.1 },
    { label: "Custom UI/UX", mult: 1.35 },
  ],
  timeline: [
    { label: "Flexible", mult: 1 }, { label: "Standard", mult: 1.1 }, { label: "Priority", mult: 1.3 },
  ],
  disclaimer: "This estimator provides an initial range only. Final pricing requires project review.",
};

function Chip({ active, onClick, children, testid }) {
  return (
    <button
      type="button"
      data-testid={testid}
      onClick={onClick}
      aria-pressed={active}
      className={`px-3.5 h-9 font-mono text-[10px] tracking-[0.12em] uppercase border transition-colors ${
        active ? "border-violet text-violet bg-violet/10" : "border-line text-ink2 hover:border-ink3"
      }`}
    >
      {children}
    </button>
  );
}

export default function Estimator() {
  const navigate = useNavigate();
  const { estimator } = useContent();
  const cfg = estimator && estimator.types ? estimator : FALLBACK_CONFIG;

  const [type, setType] = useState(null);
  const [features, setFeatures] = useState([]);
  const [design, setDesign] = useState(null);
  const [timeline, setTimeline] = useState(null);

  const activeType = type ?? cfg.types[0]?.label;
  const activeDesign = design ?? cfg.design[0]?.label;
  const activeTimeline = timeline ?? cfg.timeline[1]?.label ?? cfg.timeline[0]?.label;

  const toggleFeature = (label) =>
    setFeatures((f) => (f.includes(label) ? f.filter((x) => x !== label) : [...f, label]));

  const estimate = useMemo(() => {
    const t = cfg.types.find((x) => x.label === activeType);
    const base = t ? Number(t.base) : 0;
    const feat = features.reduce((sum, label) => sum + Number(cfg.features.find((f) => f.label === label)?.add || 0), 0);
    const dMult = Number(cfg.design.find((x) => x.label === activeDesign)?.mult || 1);
    const tMult = Number(cfg.timeline.find((x) => x.label === activeTimeline)?.mult || 1);
    const mid = Math.max(1500, (base + feat) * dMult * tMult);
    return { low: mid * 0.85, high: mid * 1.25 };
  }, [cfg, activeType, features, activeDesign, activeTimeline]);

  const sendBrief = () => {
    navigate("/contact", {
      state: {
        brief: {
          range: `${peso(estimate.low)} — ${peso(estimate.high)}`,
          features,
          type: activeType,
        },
      },
    });
  };

  return (
    <div className="panel" data-testid="quote-estimator">
      <div className="px-5 sm:px-6 py-3 border-b border-line flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.25em] text-violet">ESTIMATOR.EXE</span>
        <span className="font-mono text-[9px] tracking-[0.2em] text-ink3">NON-BINDING</span>
      </div>
      <div className="p-5 sm:p-8 grid lg:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-8">
          <div>
            <TechLabel className="block mb-3">01 / PROJECT TYPE</TechLabel>
            <div className="flex flex-wrap gap-2">
              {cfg.types.map((t) => (
                <Chip key={t.label} testid={`est-type-${t.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                  active={activeType === t.label} onClick={() => setType(t.label)}>
                  {t.label}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <TechLabel className="block mb-3">02 / FEATURES</TechLabel>
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
              <TechLabel className="block mb-3">03 / DESIGN</TechLabel>
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
              <TechLabel className="block mb-3">04 / TIMELINE</TechLabel>
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
          <TechLabel className="block mb-4">ESTIMATED SCOPE</TechLabel>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-violet" data-testid="estimator-range">
            {peso(estimate.low)} — {peso(estimate.high)}
          </div>
          <p className="mt-4 font-mono text-[10px] leading-relaxed text-ink3 uppercase tracking-[0.08em]">
            {cfg.disclaimer}
          </p>
          <button
            data-testid="estimator-send-brief"
            onClick={sendBrief}
            className="mt-6 w-full h-11 bg-violet font-mono text-[11px] tracking-[0.2em] uppercase font-semibold hover:opacity-90 transition-opacity"
            style={{ color: "var(--bg)" }}
          >
            Send This Project Brief →
          </button>
        </div>
      </div>
    </div>
  );
}
