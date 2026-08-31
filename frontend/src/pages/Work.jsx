import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useContent } from "../lib/content";
import useSeo from "../lib/useSeo";
import { WORK_FILTERS } from "../data/content";
import { SectionHead, TechLabel } from "../components/system/bits";
import ProjectRecord from "../components/ProjectRecord";

export default function Work() {
  const { projects, loading } = useContent();
  useSeo("Work");
  const [params, setParams] = useSearchParams();
  const active = params.get("filter") || "ALL";

  const filtered = useMemo(
    () => (active === "ALL" ? projects : projects.filter((p) => (p.categories || []).includes(active))),
    [projects, active]
  );

  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-16 sm:py-24">
      <SectionHead num="02 /" title="PROJECT ARCHIVE"
        sub="Every record is a real system — scoped, built, and shipped. Confidential work is labeled accordingly." />

      <div className="flex flex-wrap gap-2 mb-10" role="tablist" aria-label="Project filters">
        {WORK_FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={active === f}
            data-testid={`filter-${f.toLowerCase().replace(/[^a-z]+/g, "-")}`}
            onClick={() => setParams(f === "ALL" ? {} : { filter: f })}
            className={`px-4 h-9 font-mono text-[10px] tracking-[0.2em] uppercase border transition-colors ${
              active === f ? "border-violet text-violet bg-violet/10" : "border-line text-ink3 hover:text-ink hover:border-ink3"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-mono text-xs text-ink3 animate-blink">LOADING ARCHIVE…</p>
      ) : filtered.length === 0 ? (
        <div className="panel p-12 text-center" data-testid="work-empty">
          <TechLabel className="block mb-2">QUERY RESULT</TechLabel>
          <p className="font-mono text-xs text-ink2">0 RECORDS FOUND FOR "{active}"</p>
        </div>
      ) : (
        <motion.div layout className="grid md:grid-cols-2 gap-5" data-testid="work-grid">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <ProjectRecord key={p.id} project={p} index={i} large={i === 0 && active === "ALL"} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <p className="mt-8 font-mono text-[10px] tracking-[0.2em] text-ink3 uppercase">
        {filtered.length} RECORD{filtered.length === 1 ? "" : "S"} · FILTER: {active}
      </p>
    </div>
  );
}
