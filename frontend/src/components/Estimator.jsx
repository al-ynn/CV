import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ESTIMATOR, peso } from "../data/content";
import { TechLabel } from "./system/bits";

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
  const [type, setType] = useState("website");
  const [features, setFeatures] = useState([]);
  const [design, setDesign] = useState("existing");
  const [timeline, setTimeline] = useState("standard");

  const toggleFeature = (id) =>
    setFeatures((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const estimate = useMemo(() => {
    const t = ESTIMATOR.types.find((x) => x.id === type);
    const base = t ? t.base : 0;
    const feat = features.reduce((sum, id) => sum + (ESTIMATOR.features.find((f) => f.id === id)?.add || 0), 0);
    const dMult = ESTIMATOR.design.find((x) => x.id === design)?.mult || 1;
    const tMult = ESTIMATOR.timeline.find((x) => x.id === timeline)?.mult || 1;
    const mid = Math.max(1500, (base + feat) * dMult * tMult);
    return { low: mid * 0.85, high: mid * 1.25, mid };
  }, [type, features, design, timeline]);

  const sendBrief = () => {
    const featureLabels = features.map((id) => ESTIMATOR.features.find((f) => f.id === id)?.label).filter(Boolean);
    navigate("/contact", {
      state: {
        brief: {
          range: `${peso(estimate.low)} — ${peso(estimate.high)}`,
          features: featureLabels,
          type: ESTIMATOR.types.find((x) => x.id === type)?.label,
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
              {ESTIMATOR.types.map((t) => (
                <Chip key={t.id} testid={`est-type-${t.id}`} active={type === t.id} onClick={() => setType(t.id)}>
                  {t.label}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <TechLabel className="block mb-3">02 / FEATURES</TechLabel>
            <div className="flex flex-wrap gap-2">
              {ESTIMATOR.features.map((f) => (
                <Chip key={f.id} testid={`est-feature-${f.id}`} active={features.includes(f.id)} onClick={() => toggleFeature(f.id)}>
                  {f.label}
                </Chip>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <TechLabel className="block mb-3">03 / DESIGN</TechLabel>
              <div className="flex flex-wrap gap-2">
                {ESTIMATOR.design.map((d) => (
                  <Chip key={d.id} testid={`est-design-${d.id}`} active={design === d.id} onClick={() => setDesign(d.id)}>
                    {d.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <TechLabel className="block mb-3">04 / TIMELINE</TechLabel>
              <div className="flex flex-wrap gap-2">
                {ESTIMATOR.timeline.map((t) => (
                  <Chip key={t.id} testid={`est-timeline-${t.id}`} active={timeline === t.id} onClick={() => setTimeline(t.id)}>
                    {t.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="panel p-6 self-start sticky top-24">
          <TechLabel className="block mb-4">ESTIMATED SCOPE</TechLabel>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-violet" data-testid="estimator-range">
            {peso(estimate.low)} — {peso(estimate.high)}
          </div>
          <p className="mt-4 font-mono text-[10px] leading-relaxed text-ink3 uppercase tracking-[0.08em]">
            This estimator provides an initial range only. Final pricing requires project review.
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
