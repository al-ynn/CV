import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TechLabel, Reveal } from "./system/bits";

/* Desktop canvas node placement (% of container). Each block: major node + subnode chips. */
const POS = {
  DISCOVER: { x: 2, y: 3 },
  PLAN: { x: 24, y: 18 },
  PROTOTYPE: { x: 46, y: 3 },
  BUILD: { x: 68, y: 26 },
  REVIEW: { x: 42, y: 60 },
  SHIP: { x: 70, y: 66 },
};

/* Edges drawn in a 100x100 viewBox (preserveAspectRatio=none). dir = arrowhead orientation at path end. */
const EDGES = [
  { id: "e1", d: "M19,10 H22 V25 H24", end: [24, 25], dir: "right", phases: ["DISCOVER", "PLAN"] },
  { id: "e2", d: "M32.5,18 V10 H46", end: [46, 10], dir: "right", phases: ["PLAN", "PROTOTYPE"] },
  { id: "e3", d: "M63,10 H76.5 V26", end: [76.5, 26], dir: "down", phases: ["PROTOTYPE", "BUILD"] },
  { id: "e4", d: "M76.5,50 V67 H59", end: [59, 67], dir: "left", phases: ["BUILD", "REVIEW"] },
  { id: "e5", d: "M50.5,60 V44 H68", end: [68, 44], dir: "right", dashed: true, loop: true,
    label: "REFINE ↺ BUILD", labelAt: [55, 42.5], phases: ["REVIEW", "BUILD"] },
  { id: "e6", d: "M50.5,84 V89 H78.5 V90", end: [78.5, 90], dir: "down", label: "ACCEPTED ↓ SHIP", labelAt: [54, 87], phases: ["REVIEW", "SHIP"] },
  { id: "e7", d: "M87,75 H95 V6 H10.5 V3", end: [10.5, 3], dir: "down", dashed: true, loop: true,
    label: "↺ ITERATE — RELEASES FEED NEW DISCOVERY", labelAt: [55, 4.6], phases: ["SHIP", "DISCOVER"] },
];

const DIR_ROT = { right: 0, down: 90, left: 180, up: 270 };

function ArrowHead({ at, dir, active, dimmed }) {
  return (
    <path
      d="M0,0 L1.6,0.7 L0,1.4"
      fill="none"
      transform={`translate(${at[0] - (dir === "right" ? 1.6 : 0) * (dir === "right" || dir === "left" ? 1 : 0)} ${at[1]}) rotate(${DIR_ROT[dir]}) translate(${dir === "right" ? 0 : 0} ${dir === "down" ? -0.7 : 0})`}
      stroke="currentColor"
      strokeWidth="1"
      vectorEffect="non-scaling-stroke"
      className={active ? "text-violet" : dimmed ? "text-line" : "text-ink3"}
      style={{ transition: "color .3s" }}
    />
  );
}

export default function RoadmapCanvas({ cfg }) {
  const phases = (cfg?.phases || []).filter((p) => p.visible !== false);
  const [active, setActive] = useState(null);
  const [pinned, setPinned] = useState(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  if (!phases.length) return null;

  const engaged = active || pinned;
  const posOf = (p) => POS[p.title] || { x: 2, y: 3 };
  const isDim = (p) => engaged && p.title !== engaged;
  const edgeState = (e) => ({
    active: engaged && e.phases.includes(engaged),
    dimmed: engaged && !e.phases.includes(engaged),
  });

  return (
    <div ref={ref} data-testid="roadmap-canvas">
      {/* ── desktop: engineering-map canvas ── */}
      <div className="hidden lg:block relative h-[680px] select-none">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {EDGES.map((e) => {
            const st = edgeState(e);
            return (
              <g key={e.id}>
                <motion.path
                  d={e.d}
                  fill="none"
                  pathLength={1}
                  strokeDasharray={e.dashed ? "0.7 0.9" : undefined}
                  strokeWidth={st.active ? 2 : 1}
                  vectorEffect="non-scaling-stroke"
                  className={st.active ? "text-violet" : st.dimmed ? "text-line" : e.loop ? "text-violet/60" : "text-ink3/70"}
                  stroke="currentColor"
                  style={{ transition: "color .3s" }}
                  initial={{ strokeDashoffset: 1, opacity: 0 }}
                  animate={inView ? { strokeDashoffset: 0, opacity: 1 } : {}}
                  transition={{ duration: e.dashed ? 1 : 1, delay: 0.25, ease: "easeOut" }}
                />
                <ArrowHead at={e.end} dir={e.dir} {...st} />
                {e.label && (
                  <text
                    x={e.labelAt[0]}
                    y={e.labelAt[1]}
                    className={`font-mono uppercase ${st.active ? "fill-[var(--violet)]" : st.dimmed ? "fill-[var(--line)]" : "fill-[var(--tx3)]"}`}
                    style={{ fontSize: "2.4px", letterSpacing: "0.28px", transition: "fill .3s" }}
                  >
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {phases.map((p) => {
          const pos = posOf(p);
          const hot = engaged === p.title;
          return (
            <motion.div
              key={p.num + p.title}
              className="absolute"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: "17.5%" }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={inView ? { opacity: isDim(p) ? 0.38 : 1, scale: 1 } : {}}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                onMouseEnter={() => setActive(p.title)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setPinned(pinned === p.title ? null : p.title)}
                data-testid={`roadmap-node-${p.title.toLowerCase()}`}
                aria-expanded={pinned === p.title}
                className={`w-full text-left panel p-4 min-h-[108px] flex flex-col transition-colors duration-300 ${
                  hot ? "border-violet bg-violet/5" : "hover:border-ink3"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-mono text-base font-bold transition-colors ${hot ? "text-violet" : "text-violet/80"}`}>{p.num}</span>
                  <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink3">{p.type}</span>
                </div>
                <h4 className="font-display text-base font-extrabold tracking-tight text-ink">{p.title}</h4>
                <p className={`mt-1.5 font-mono text-[9px] text-ink3 leading-relaxed ${pinned === p.title ? "" : "line-clamp-2"}`}>
                  {p.desc}
                </p>
                {p.loopTag && (
                  <span className="mt-auto pt-2 font-mono text-[8px] tracking-[0.18em] uppercase text-violet">{p.loopTag}</span>
                )}
              </button>
              {/* subnodes */}
              <div className="flex justify-center">
                <span className={`w-px h-3 transition-colors ${hot ? "bg-violet" : "bg-line"}`} />
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                {(p.subs || []).map((s) => (
                  <span
                    key={s}
                    data-testid={`roadmap-sub-${p.title.toLowerCase()}-${s.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                    className={`font-mono text-[8px] tracking-[0.14em] uppercase px-1.5 py-1 border transition-colors duration-300 ${
                      hot ? "border-violet text-violet bg-violet/10" : "border-line text-ink3"
                    }`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}

        {cfg.loopLabel && (
          <div className="absolute bottom-0 left-[2%] font-mono text-[9px] tracking-[0.18em] uppercase text-ink3">
            <span className="text-violet">↺</span> {cfg.loopLabel}
          </div>
        )}
      </div>

      {/* ── mobile / tablet: intentional vertical development path ── */}
      <div className="lg:hidden" data-testid="roadmap-mobile">
        {phases.map((p, i) => (
          <Reveal key={p.num + p.title} delay={i * 0.05} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className={`grid place-items-center w-8 h-8 border font-mono text-[10px] font-bold shrink-0 ${
                p.loopTag ? "border-violet text-violet" : "border-line text-violet/80"
              }`}>
                {p.num}
              </span>
              {i < phases.length - 1 && <span className="w-px flex-1 bg-line" />}
            </div>
            <div className="pb-8 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display text-base font-extrabold tracking-tight text-ink">{p.title}</span>
                <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink3">{p.type}</span>
                {p.loopTag && (
                  <span className="font-mono text-[8px] tracking-[0.18em] text-violet border border-violet/40 px-1.5 py-0.5 uppercase">{p.loopTag}</span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-ink2 leading-relaxed">{p.desc}</p>
              {(p.subs || []).length > 0 && (
                <ul className="mt-2.5 font-mono text-[10px] text-ink2 space-y-1">
                  {p.subs.map((s, j) => (
                    <li key={s} className="flex gap-2 uppercase tracking-[0.1em]">
                      <span className="text-ink3">{j === p.subs.length - 1 ? "└" : "├"}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        ))}
        {cfg.loopLabel && (
          <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink3 border border-line px-4 py-3">
            <span className="text-violet">↺</span> {cfg.loopLabel}
          </p>
        )}
      </div>
    </div>
  );
}

export function WhyScrum({ cfg }) {
  const paras = Array.isArray(cfg?.whyBody) ? cfg.whyBody : cfg?.whyBody ? [cfg.whyBody] : [];
  if (!cfg?.whyHeading && !paras.length) return null;
  return (
    <Reveal className="mb-14 grid lg:grid-cols-12 gap-8 items-start" data-testid="roadmap-why">
      <div className="lg:col-span-5">
        <TechLabel className="block mb-3 text-violet">{cfg.scopeLabel || "DEVELOPMENT WORKFLOW"}</TechLabel>
        <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink leading-tight">
          {cfg.whyHeading || "WHY SCRUM + PROTOTYPING?"}
        </h3>
      </div>
      <div className="lg:col-span-7 space-y-4 lg:pt-8">
        {paras.map((p, i) => (
          <p key={i} className={`text-sm sm:text-base leading-relaxed ${i === paras.length - 1 ? "text-ink border-l-2 pl-4" : "text-ink2"}`}
            style={i === paras.length - 1 ? { borderLeftColor: "var(--violet)" } : {}}>
            {p}
          </p>
        ))}
        <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink3 pt-1">
          Applies to system, web and app development — not small design or document tasks.
        </p>
      </div>
    </Reveal>
  );
}
