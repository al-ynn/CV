import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { TechLabel, Reveal } from "./system/bits";

const CANVAS = { width: 1440, height: 700, cardWidth: 250 };
const POS = {
  DISCOVER: { x: 30, y: 50 }, PLAN: { x: 350, y: 210 },
  PROTOTYPE: { x: 670, y: 50 }, BUILD: { x: 990, y: 260 },
  REVIEW: { x: 610, y: 500 }, SHIP: { x: 1020, y: 545 },
};
const EDGES = [
  { id: "discover-plan", d: "M280 72 H320 V190 H375 V210", phases: ["DISCOVER", "PLAN"] },
  { id: "plan-prototype", d: "M475 210 V160 H670", phases: ["PLAN", "PROTOTYPE"] },
  { id: "prototype-build", d: "M920 72 H1115 V260", phases: ["PROTOTYPE", "BUILD"] },
  { id: "build-review", d: "M1240 335 H1270 V485 H735 V500", phases: ["BUILD", "REVIEW"] },
  { id: "review-ship", d: "M860 555 H950 V610 H1020", label: "ACCEPTED  →  SHIP", labelAt: [940, 590], phases: ["REVIEW", "SHIP"] },
  { id: "refine", d: "M860 535 H1310 V360 H1240", dashed: true, loop: true, label: "↺  REFINE", labelAt: [1085, 525], phases: ["REVIEW", "BUILD"] },
  { id: "feedback", d: "M795 180 V500", dashed: true, loop: true, label: "FEEDBACK LOOP", labelAt: [770, 360], rotate: -90, phases: ["PROTOTYPE", "REVIEW"] },
  { id: "iteration", d: "M1270 610 H1370 V20 H155 V50", dashed: true, loop: true, label: "↺  ITERATE  —  RELEASES FEED THE NEXT DISCOVERY", labelAt: [1090, 16], phases: ["SHIP", "DISCOVER"] },
];

function PhaseCard({ phase, hot, pinned, onEnter, onLeave, onClick }) {
  return <>
    <button type="button" onMouseEnter={onEnter} onMouseLeave={onLeave} onClick={onClick}
      data-testid={`roadmap-node-${phase.title.toLowerCase()}`} aria-expanded={pinned}
      className={`w-full text-left panel p-5 min-h-[120px] flex flex-col transition-colors duration-300 ${hot ? "border-violet bg-violet/5" : "hover:border-ink3"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`font-mono text-lg font-bold ${hot ? "text-violet" : "text-violet/80"}`}>{phase.num}</span>
        <span className="font-mono text-[8px] tracking-[0.25em] uppercase text-ink3">{phase.type}</span>
      </div>
      <h4 className="font-display text-lg font-extrabold tracking-tight text-ink leading-tight">{phase.title}</h4>
      <p className={`mt-2 font-mono text-[10px] text-ink3 leading-[1.6] ${pinned ? "" : "line-clamp-2"}`}>{phase.desc}</p>
      {phase.loopTag && <span className="mt-auto pt-2 font-mono text-[8px] tracking-[0.18em] uppercase text-violet">{phase.loopTag}</span>}
    </button>
    <div className="flex justify-center"><span className={`w-px h-3 ${hot ? "bg-violet" : "bg-line"}`} /></div>
    <div className="flex flex-wrap gap-1.5 justify-center">{(phase.subs || []).map((sub) =>
      <span key={sub} data-testid={`roadmap-sub-${phase.title.toLowerCase()}-${sub.toLowerCase().replace(/[^a-z]+/g, "-")}`}
        className={`font-mono text-[9px] tracking-[0.15em] uppercase px-2 py-1 border ${hot ? "border-violet text-violet bg-violet/10" : "border-line text-ink3"}`}>{sub}</span>)}</div>
  </>;
}

export default function RoadmapCanvas({ cfg }) {
  const phases = (cfg?.phases || []).filter((phase) => phase.visible !== false);
  const [active, setActive] = useState(null);
  const [pinned, setPinned] = useState(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  if (!phases.length) return null;
  const engaged = active || pinned;
  const edgeClass = (edge) => engaged && edge.phases.includes(engaged) ? "text-violet" : engaged ? "text-line" : edge.loop ? "text-violet/50" : "text-ink3/50";

  return <div ref={ref} data-testid="roadmap-canvas">
    <div className="hidden lg:block relative w-full aspect-[1440/700] mt-24 select-none overflow-visible">
      <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs><marker id="roadmap-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9" fill="none" stroke="context-stroke" strokeWidth="1" /></marker></defs>
        {EDGES.map((edge) => <g key={edge.id} className={edgeClass(edge)} style={{ transition: "color .3s" }}>
          <motion.path d={edge.d} fill="none" pathLength={1} stroke="currentColor" strokeWidth={engaged && edge.phases.includes(engaged) ? 2 : 1}
            strokeDasharray={edge.dashed ? "9 12" : undefined} vectorEffect="non-scaling-stroke" markerEnd="url(#roadmap-arrow)"
            initial={{ strokeDashoffset: 1, opacity: 0 }} animate={inView ? { strokeDashoffset: 0, opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.25, ease: "easeOut" }} />
          {edge.label && <text x={edge.labelAt[0]} y={edge.labelAt[1]} textAnchor="middle" fill="currentColor"
            transform={edge.rotate ? `rotate(${edge.rotate} ${edge.labelAt[0]} ${edge.labelAt[1]})` : undefined}
            className="font-mono uppercase" style={{ fontSize: 12, letterSpacing: 3, paintOrder: "stroke", stroke: "var(--bg)", strokeWidth: 8, strokeLinejoin: "round" }}>{edge.label}</text>}
        </g>)}
      </svg>
      {phases.map((phase) => {
        const pos = POS[phase.title] || { x: 30, y: 50 };
        const hot = engaged === phase.title;
        return <motion.div key={phase.num + phase.title} className="absolute"
          style={{ left: `${pos.x / CANVAS.width * 100}%`, top: `${pos.y / CANVAS.height * 100}%`, width: `${CANVAS.cardWidth / CANVAS.width * 100}%` }}
          initial={{ opacity: 0, scale: 0.94 }} animate={inView ? { opacity: engaged && !hot ? 0.38 : 1, scale: 1 } : {}}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
          <PhaseCard phase={phase} hot={hot} pinned={pinned === phase.title} onEnter={() => setActive(phase.title)} onLeave={() => setActive(null)} onClick={() => setPinned(pinned === phase.title ? null : phase.title)} />
        </motion.div>;
      })}
      {cfg.loopLabel && <div className="absolute bottom-0 left-[2%] font-mono text-[9px] tracking-[0.18em] uppercase text-ink3"><span className="text-violet">↺</span> {cfg.loopLabel}</div>}
    </div>

    <div className="lg:hidden" data-testid="roadmap-mobile">{phases.map((phase, index) =>
      <Reveal key={phase.num + phase.title} delay={index * 0.05} className="flex gap-4">
        <div className="flex flex-col items-center"><span className={`grid place-items-center w-8 h-8 border font-mono text-[10px] font-bold shrink-0 ${phase.loopTag ? "border-violet text-violet" : "border-line text-violet/80"}`}>{phase.num}</span>{index < phases.length - 1 && <span className="w-px flex-1 bg-line" />}</div>
        <div className="pb-8 min-w-0"><div className="flex items-center gap-2 flex-wrap"><span className="font-display text-base font-extrabold tracking-tight text-ink">{phase.title}</span><span className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink3">{phase.type}</span>{phase.loopTag && <span className="font-mono text-[8px] tracking-[0.18em] text-violet border border-violet/40 px-1.5 py-0.5 uppercase">{phase.loopTag}</span>}</div>
          <p className="mt-1.5 text-xs text-ink2 leading-relaxed">{phase.desc}</p>
          {!!(phase.subs || []).length && <ul className="mt-2.5 font-mono text-[10px] text-ink2 space-y-1">{phase.subs.map((sub, i) => <li key={sub} className="flex gap-2 uppercase tracking-[0.1em]"><span className="text-ink3">{i === phase.subs.length - 1 ? "└" : "├"}</span><span>{sub}</span></li>)}</ul>}
        </div>
      </Reveal>)}
      {cfg.loopLabel && <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink3 border border-line px-4 py-3"><span className="text-violet">↺</span> {cfg.loopLabel}</p>}
    </div>
  </div>;
}

export function WhyScrum({ cfg }) {
  const paras = Array.isArray(cfg?.whyBody) ? cfg.whyBody : cfg?.whyBody ? [cfg.whyBody] : [];
  if (!cfg?.whyHeading && !paras.length) return null;
  const body = paras.length ? paras : [
    "I prefer an iterative development process because websites, applications and systems rarely become perfect from the first plan. Requirements change, users reveal problems, workflows become clearer and better solutions appear once something actually exists to test.",
    "I use Scrum-inspired planning to break large projects into manageable pieces and rapid prototyping to validate ideas before committing too much time to the wrong solution.",
    "The goal is not to follow Scrum ceremonially. The goal is to keep development visible, testable and adaptable.",
  ];
  return <div className="mt-16" data-testid="roadmap-why"><div className="grid lg:grid-cols-12 gap-10 lg:gap-12">
    <div className="lg:col-span-5"><TechLabel className="block mb-5 text-violet uppercase tracking-[0.3em]">{cfg.scopeLabel || "DEVELOPMENT WORKFLOW — SYSTEM / WEB / APP PROJECTS"}</TechLabel><h3 className="font-display text-3xl sm:text-4xl lg:text-[2rem] font-extrabold tracking-tight text-ink leading-[1.1]">{cfg.whyHeading || "WHY SCRUM + PROTOTYPING?"}</h3></div>
    <div className="lg:col-span-7 space-y-5">{body.map((paragraph, index) => <p key={index} className={index === body.length - 1 ? "text-ink text-base border-l-2 border-violet pl-5 font-medium leading-[1.55]" : "text-ink2 text-[15px] leading-[1.55]"}>{paragraph}</p>)}<p className="pt-1 font-mono text-[10px] tracking-[0.15em] uppercase text-ink3 leading-relaxed">Applies to system, web and app development — not small design or document tasks.</p></div>
  </div></div>;
}
