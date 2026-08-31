import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SwapText, LevelTag, TechLabel } from "./system/bits";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

export default function ProjectRecord({ project, index = 0, large = false }) {
  const p = project;
  return (
    <motion.div
      layout
      className="h-full"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/work/${p.slug}`}
        data-testid={`project-card-${p.slug}`}
        className={`group eq-card panel panel-hover relative overflow-hidden ${large ? "p-7 sm:p-10" : "p-6"}`}
      >
        <div className="absolute top-0 left-0 w-full h-0.5 bg-violet scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
        {p.cover && (
          <div className="mb-5 border border-line overflow-hidden aspect-video bg-canvas2">
            <img src={`${BACKEND}${p.cover}`} alt={p.title} loading="lazy"
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-500" />
          </div>
        )}
        <div className="flex items-start justify-between gap-4 mb-5">
          <span className="font-mono text-[11px] tracking-[0.3em] text-violet group-hover:tracking-[0.38em] transition-all duration-300">PROJECT / {p.num || "—"}</span>
          <span
            className="font-mono text-[9px] tracking-[0.2em] px-2 py-0.5 border group-hover:border-violet/40 transition-colors"
            style={{
              color: p.disclosure === "PUBLIC" ? "var(--green)" : p.disclosure === "LIMITED DISCLOSURE" ? "var(--amber)" : "var(--pink)",
              borderColor: "var(--line)",
            }}
          >
            {p.disclosure}
          </span>
        </div>

        <h3 className={`font-display font-extrabold tracking-tight text-ink leading-none group-hover:translate-x-1 transition-transform duration-300 ${large ? "text-3xl sm:text-4xl" : "text-2xl"}`}>
          {p.title}
        </h3>
        <p className="mt-1.5 font-mono text-[11px] tracking-[0.2em] uppercase text-ink3">{p.subtitle}</p>
        <p className="mt-4 text-sm text-ink2 leading-relaxed line-clamp-3">{p.description}</p>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {(p.stack || []).slice(0, 6).map((s) => (
            <span key={s} className="font-mono text-[9px] tracking-[0.15em] uppercase px-2 py-1 border border-line text-ink3 group-hover:border-violet/40 transition-colors">
              {s}
            </span>
          ))}
        </div>

        <div className="eq-card-foot mt-6 pt-4 border-t border-line flex items-center justify-between gap-3">
          <div className="flex gap-6 font-mono text-[9px] tracking-[0.15em] uppercase text-ink3">
            <span>TYPE — {p.type}</span>
            <span>YEAR — {p.year}</span>
          </div>
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink2">
            <SwapText label="VIEW PROJECT →" alt={`OPEN /PROJECT/${p.num || "—"} →`} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export const ProjectMeta = ({ label, value }) => (
  <div>
    <TechLabel className="block mb-1.5">{label}</TechLabel>
    <div className="font-mono text-xs text-ink leading-relaxed">{value}</div>
  </div>
);

export const DisclosureBanner = ({ disclosure }) => {
  if (!disclosure || disclosure === "PUBLIC") return null;
  return (
    <div className="panel px-4 py-3 flex items-center gap-3 border-l-2" style={{ borderLeftColor: "var(--amber)" }}>
      <LevelTag level={disclosure === "LIMITED DISCLOSURE" ? "WORKING KNOWLEDGE" : "LEARNING"} />
      <p className="font-mono text-[10px] tracking-[0.1em] text-ink3 uppercase leading-relaxed">
        {disclosure === "PRIVATE / NDA"
          ? "Confidential project — conceptual overview only. Screenshots, internals, and client details are withheld."
          : "Limited disclosure — shown with client permission; internal details withheld."}
      </p>
    </div>
  );
};
