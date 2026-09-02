import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../lib/content";
import { peso } from "../data/content";

const TYPE_OPTIONS = [
  { label: "Landing Page", sources: ["Landing Page"] },
  { label: "Business Website", sources: ["Company Website", "Website"] },
  { label: "Portfolio Website", sources: ["Portfolio Website"] },
  { label: "Online Store", sources: ["E-Commerce Website", "E-Commerce"] },
  { label: "Booking / Service Website", sources: ["Dynamic Website"] },
  { label: "Web System", sources: ["Web Application", "Information System", "Internal Business System"] },
  { label: "Dashboard", sources: ["Dashboard"] },
  { label: "Improve an Existing Website", sources: ["Existing System Improvement", "Existing System Work"] },
  { label: "Design Only", sources: ["UI/UX Only", "UI/UX"] },
  { label: "Not Sure Yet", sources: ["Company Website", "Website", "Landing Page"] },
];

const FEATURE_OPTIONS = [
  { label: "Account / Login", sources: ["Authentication"] },
  { label: "Admin Panel", sources: ["Admin Dashboard"] },
  { label: "Save Customer or Business Data", sources: ["Database"] },
  { label: "Online Shopping", sources: ["E-Commerce"] },
  { label: "Online Payments", sources: ["Payment Gateway"] },
  { label: "Connect to Other Services", sources: ["API"] },
  { label: "Different User Access", sources: ["Role Management"] },
  { label: "Reports", sources: ["Reporting"] },
  { label: "Email Notifications", sources: ["Email"] },
  { label: "SMS Notifications", sources: ["SMS"] },
  { label: "File Upload", sources: ["File Upload"] },
  { label: "QR Code", sources: ["QR"] },
  { label: "Search & Filters", sources: ["Advanced Search"] },
  { label: "Booking / Scheduling", sources: ["Booking / Scheduling", "API"] },
  { label: "Contact Forms", sources: ["Contact Forms", "Email"] },
  { label: "Not Sure Yet", sources: [] },
];

const DESIGN_LABELS = {
  "Existing design": "I Already Have a Design",
  "Template customization": "Customize a Template",
  "Custom UI/UX": "Create a New Design",
};
const TIMELINE_LABELS = { Flexible: "No Rush", Standard: "Standard", Priority: "As Soon As Possible" };

function Question({ number, children }) {
  return <h3 className="mb-3.5 text-base sm:text-[17px] font-semibold text-ink leading-snug"><span className="mr-2 font-mono text-[11px] tracking-[0.12em] text-violet">{number} /</span>{children}</h3>;
}

function Chip({ active, onClick, children, testid }) {
  return <button type="button" data-testid={testid} onClick={onClick} aria-pressed={active}
    className={`min-h-11 px-4 py-2 border text-sm font-medium leading-snug text-left transition-[color,background-color,border-color,box-shadow] focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet ${active ? "border-violet bg-violet/10 text-violet shadow-[inset_0_0_0_1px_var(--violet)]" : "border-line text-ink2 hover:border-violet/70 hover:text-ink hover:bg-violet/5"}`}>
    {children}
  </button>;
}

const firstMatch = (items, names) => names.map((name) => items.find((item) => item.label === name)).find(Boolean);
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function Estimator() {
  const navigate = useNavigate();
  const { estimator } = useContent();
  const cfg = estimator?.types ? estimator : null;
  const [typeLabel, setTypeLabel] = useState("Not Sure Yet");
  const [scopeIndex, setScopeIndex] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [designLabel, setDesignLabel] = useState("I'm Not Sure");
  const [timelineLabel, setTimelineLabel] = useState("Standard");
  const types = cfg?.types || [];
  const pageBrackets = cfg?.pageBrackets || [];
  const moduleBrackets = cfg?.moduleBrackets || [];
  const sourceFeatures = cfg?.features || [];
  const designOpts = cfg?.design || [];
  const timelineOpts = cfg?.timeline || [];

  const typeOptions = TYPE_OPTIONS.map((option) => ({ ...option, source: firstMatch(types, option.sources) })).filter((option) => option.source);
  const activeTypeOption = typeOptions.find((option) => option.label === typeLabel) || typeOptions[0];
  const activeType = activeTypeOption?.source || { kind: "static", min: 0, max: 0, weeks: 1, complexity: "SIMPLE", label: "" };
  const isBasicWebsite = activeType.kind === "static" || activeType.kind === "design";
  const scopeOptions = ["1", "2–3", "4–5", "6–10", "10+", "Not Sure"];
  const activeScopeIndex = Math.min(scopeIndex, Math.max(0, (isBasicWebsite ? pageBrackets.length : moduleBrackets.length) - 1));

  const featureOptions = FEATURE_OPTIONS.map((option) => {
    const source = firstMatch(sourceFeatures, option.sources);
    return { ...option, source, key: option.label, add: Number(source?.add || 0) };
  });
  const activeDesign = designLabel === "I'm Not Sure"
    ? designOpts.find((item) => item.label === "Existing design") || designOpts[0]
    : designOpts.find((item) => (DESIGN_LABELS[item.label] || item.label) === designLabel) || designOpts[0];
  const activeTimeline = timelineOpts.find((item) => (TIMELINE_LABELS[item.label] || item.label) === timelineLabel) || timelineOpts[0];

  const result = useMemo(() => {
    let low = Number(activeType.min || activeType.base || 0);
    let high = Number(activeType.max || activeType.base || 0);
    let weeks = Number(activeType.weeks || 2);
    const bracket = isBasicWebsite ? pageBrackets[activeScopeIndex] : moduleBrackets[activeScopeIndex];
    if (bracket) {
      low += Number(bracket.addMin || 0);
      high += Number(bracket.addMax || 0);
      weeks += Number(bracket.weeks || Math.round((Number(bracket.addMin || 0) + Number(bracket.addMax || 0)) / 4000));
    }
    const featureAdd = selectedFeatures.reduce((sum, key) => sum + Number(featureOptions.find((item) => item.key === key)?.add || 0), 0);
    low += featureAdd;
    high += featureAdd * 1.3;
    weeks += Math.round(featureAdd / 4000);
    low *= Number(activeDesign?.mult || 1) * Number(activeTimeline?.mult || 1);
    high *= Number(activeDesign?.mult || 1) * Number(activeTimeline?.mult || 1);
    const count = selectedFeatures.filter((key) => key !== "Not Sure Yet").length;
    const projectSize = count >= 8 ? "Large" : count + (isBasicWebsite ? 0 : 1) >= 5 ? "Large" : activeType.complexity === "SIMPLE" ? "Small" : "Medium";
    return { low, high, weeks: Math.max(1, weeks), projectSize };
  }, [activeType, isBasicWebsite, pageBrackets, moduleBrackets, activeScopeIndex, selectedFeatures, featureOptions, activeDesign, activeTimeline]);

  if (!cfg) return null;

  const toggleFeature = (key) => setSelectedFeatures((current) => key === "Not Sure Yet"
    ? (current.includes(key) ? [] : [key])
    : (current.includes(key) ? current.filter((item) => item !== key) : [...current.filter((item) => item !== "Not Sure Yet"), key]));

  const sendBrief = () => navigate("/contact", { state: { brief: {
    range: `${peso(result.low)} — ${peso(result.high)}`,
    features: selectedFeatures,
    type: activeTypeOption?.label || activeType.label,
  } } });

  return <div className="panel" data-testid="quote-estimator">
    <div className="px-5 sm:px-6 py-4 border-b border-line flex items-center justify-between gap-4">
      <span className="font-mono text-[10px] tracking-[0.2em] text-violet uppercase">Project Estimate</span>
      <span className="font-mono text-[9px] tracking-[0.16em] text-ink3 uppercase">Rough estimate only</span>
    </div>
    <div className="px-5 sm:px-8 pt-6">
      <h2 className="font-display text-2xl font-bold text-ink">Project Estimate</h2>
      <p className="mt-2 text-sm sm:text-base text-ink2">Answer a few simple questions to get a rough estimate of your project.</p>
    </div>
    <div className="p-5 sm:p-8 grid lg:grid-cols-[1fr_340px] gap-10">
      <div className="space-y-9">
        <div><Question number="01">What are you building?</Question><div className="flex flex-wrap gap-2">{typeOptions.map((option) => <Chip key={option.label} testid={`est-type-${slug(option.label)}`} active={activeTypeOption?.label === option.label} onClick={() => { setTypeLabel(option.label); setScopeIndex(0); }}>{option.label}</Chip>)}</div></div>

        <div><Question number="02">About how many pages do you need?</Question><div className="flex flex-wrap gap-2">{scopeOptions.map((label, index) => <Chip key={label} testid={`est-pages-${slug(label)}`} active={scopeIndex === index} onClick={() => setScopeIndex(index)}>{label}</Chip>)}</div></div>

        <div><Question number="03">What features do you need?</Question><div className="flex flex-wrap gap-2">{featureOptions.map((option) => <Chip key={option.key} testid={`est-feature-${slug(option.label)}`} active={selectedFeatures.includes(option.key)} onClick={() => toggleFeature(option.key)}>{option.label}</Chip>)}</div></div>

        <div className="grid sm:grid-cols-2 gap-9">
          <div><Question number="04">Do you already have a design?</Question><div className="flex flex-wrap gap-2">{[...designOpts.map((item) => DESIGN_LABELS[item.label] || item.label), "I'm Not Sure"].map((label) => <Chip key={label} testid={`est-design-${slug(label)}`} active={designLabel === label} onClick={() => setDesignLabel(label)}>{label}</Chip>)}</div></div>
          <div><Question number="05">When do you need it?</Question><div className="flex flex-wrap gap-2">{timelineOpts.map((item) => { const label = TIMELINE_LABELS[item.label] || item.label; return <Chip key={item.label} testid={`est-timeline-${slug(label)}`} active={timelineLabel === label} onClick={() => setTimelineLabel(label)}>{label}</Chip>; })}</div></div>
        </div>
      </div>

      <aside className="panel p-6 self-start lg:sticky lg:top-24" aria-live="polite">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink3">Estimated Budget</span>
        <div className="mt-3 font-display text-2xl sm:text-3xl font-bold text-violet leading-tight" data-testid="estimator-range">{peso(result.low)} – {peso(result.high)}</div>
        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-ink2">Estimated time</dt><dd className="font-semibold text-ink">{result.weeks}–{result.weeks + 2} weeks</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-ink2">Project size</dt><dd className="font-semibold text-cy">{result.projectSize}</dd></div>
        </dl>
        <p className="mt-6 border-t border-line pt-5 text-sm leading-relaxed text-ink2">This is only a rough estimate. The final price may change depending on the actual requirements of your project.</p>
        <button data-testid="estimator-send-brief" onClick={sendBrief} className="mt-6 w-full min-h-12 px-4 bg-violet text-sm font-semibold hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet transition" style={{ color: "var(--bg)" }}>Get a Detailed Quote →</button>
      </aside>
    </div>
  </div>;
}
