import { useContent } from "../lib/content";
import useSeo from "../lib/useSeo";
import { periodOf } from "../data/content";
import { SectionHead, TechLabel, Reveal, StatusDot } from "../components/system/bits";
import { GitCommitHorizontal } from "lucide-react";

export default function Journey() {
  const { journey, experience } = useContent();
  useSeo("Journey");

  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-16 sm:py-24">
      <SectionHead num="05 /" title="JOURNEY.LOG" sub="A career rendered as commit history. Progression, not pretense." />

      <div className="grid lg:grid-cols-12 gap-14">
        <div className="lg:col-span-5">
          <div className="panel p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <span className="font-mono text-[10px] tracking-[0.25em] text-violet">$ git log --career --oneline</span>
              <StatusDot />
            </div>
            <div className="space-y-0">
              {journey.map((j, i) => (
                <Reveal key={j.id} delay={i * 0.08} className="relative pl-10 pb-10 last:pb-0">
                  {i < journey.length - 1 && <span className="absolute left-[13px] top-7 bottom-0 w-px bg-line" />}
                  <span className="absolute left-0 top-1 grid place-items-center w-7 h-7 border border-line bg-card">
                    <GitCommitHorizontal size={13} className={j.milestoneType === "current" ? "text-grn" : "text-violet"} />
                  </span>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-[11px] text-violet">{j.code}</span>
                    <span className="font-mono text-[9px] tracking-[0.2em] text-ink3">{j.year} · main</span>
                  </div>
                  <h3 className={`mt-1.5 font-mono text-sm font-bold tracking-wide ${j.milestoneType === "current" ? "text-grn" : "text-ink"}`}>
                    {j.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-ink2 leading-relaxed">{j.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <TechLabel className="block mb-6">EXPERIENCE / PROFESSIONAL TIMELINE</TechLabel>
          <div className="space-y-5">
            {experience.map((e, i) => (
              <Reveal key={e.id} delay={i * 0.06} className="panel panel-hover p-6 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-tight text-ink">{e.role}</h3>
                    <p className="font-mono text-[11px] text-ink3 mt-1">{e.org}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[10px] tracking-[0.15em] text-violet block">{periodOf(e)}</span>
                    <span className="font-mono text-[9px] tracking-[0.2em] text-ink3 uppercase">{e.employmentType}</span>
                  </div>
                </div>
                {e.description && <p className="text-xs text-ink2 mb-3">{e.description}</p>}
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 border-t border-line pt-4">
                  {(e.points || []).map((pt) => (
                    <li key={pt} className="font-mono text-[10px] tracking-[0.04em] text-ink2 flex gap-2">
                      <span className="text-violet shrink-0">▸</span> {pt}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 font-mono text-[10px] tracking-[0.12em] text-ink3 uppercase leading-relaxed">
            * The support role stays in the log deliberately — client communication is a shipping skill too.
          </p>
        </div>
      </div>
    </div>
  );
}
