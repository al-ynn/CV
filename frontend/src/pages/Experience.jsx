import { useState } from "react";
import { useContent } from "../lib/content";
import useSeo from "../lib/useSeo";
import { periodOf } from "../data/content";
import { SectionHead, TechLabel, Reveal, LevelTag } from "../components/system/bits";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ChevronDown, ExternalLink } from "lucide-react";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

function WorkNode({ e, index }) {
  const [open, setOpen] = useState(false);
  const year = (e.start || "").match(/\d{4}/)?.[0] || e.start;
  return (
    <Reveal delay={index * 0.06} className="relative pl-10 pb-8 last:pb-0">
      <span className="absolute left-[13px] top-8 bottom-0 w-px bg-line last:hidden" />
      <span className={`absolute left-0 top-1.5 grid place-items-center w-7 h-7 border bg-card ${e.current ? "border-grn" : "border-line"}`}>
        <span className={`w-2 h-2 rounded-full ${e.current ? "bg-grn animate-blink" : "bg-violet"}`} />
      </span>
      <div className="font-mono text-[10px] tracking-[0.25em] text-violet mb-1.5">{year}{e.current ? " — NOW" : ""}</div>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        data-testid={`exp-node-${e.id}`}
        className="w-full text-left panel panel-hover px-5 py-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-sm font-bold tracking-wide text-ink uppercase">
              {(e.role || "").replace(/[^a-z0-9 ]/gi, "").replace(/ /g, "_")}
            </p>
            <p className="font-mono text-[10px] text-ink3 mt-1">{e.org} · {periodOf(e)}</p>
          </div>
          <ChevronDown size={14} className={`text-ink3 shrink-0 mt-1 transition-transform ${open ? "rotate-180 text-violet" : ""}`} />
        </div>
        {e.description && !open && <p className="mt-2 text-xs text-ink2 leading-relaxed line-clamp-2">{e.description}</p>}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="ml-0 mt-2 panel p-5 space-y-4 border-l-2" style={{ borderLeftColor: "var(--violet)" }}>
              <div className="flex flex-wrap gap-6 font-mono text-[10px] uppercase">
                <div><TechLabel className="block mb-1">Type</TechLabel><span className="text-ink">{e.employmentType}</span></div>
                {e.location && <div><TechLabel className="block mb-1">Location</TechLabel><span className="text-ink">{e.location}</span></div>}
                <div><TechLabel className="block mb-1">Period</TechLabel><span className="text-violet">{periodOf(e)}</span></div>
              </div>
              {e.description && <p className="text-xs text-ink2 leading-relaxed">{e.description}</p>}
              {(e.points || []).length > 0 && (
                <div>
                  <TechLabel className="block mb-2">Responsibilities</TechLabel>
                  <ul className="space-y-1.5">
                    {e.points.map((pt) => (
                      <li key={pt} className="font-mono text-[10px] text-ink2 flex gap-2"><span className="text-violet shrink-0">▸</span>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(e.technologies || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-line">
                  {e.technologies.map((t) => (
                    <span key={t} className="font-mono text-[9px] tracking-[0.12em] uppercase px-2 py-0.5 border border-line text-ink3">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reveal>
  );
}

function CertNode({ c, index }) {
  const [open, setOpen] = useState(false);
  const verified = c.verificationUrl || c.credentialId;
  const hasMore = (c.courses || []).length > 0 || (c.skills || []).length > 0 || c.description || c.image;
  return (
    <Reveal delay={index * 0.06} className="relative pl-10 pb-8 last:pb-0">
      <span className="absolute left-[13px] top-8 bottom-0 w-px bg-line" />
      <span className={`absolute left-0 top-1.5 grid place-items-center w-7 h-7 border bg-card transition-colors ${open ? "border-amb" : "border-line"}`}>
        <Award size={13} className="text-amb" />
      </span>
      <div className="font-mono text-[10px] tracking-[0.25em] text-amb mb-1.5">{c.date}</div>
      <button
        type="button"
        onClick={() => hasMore && setOpen(!open)}
        aria-expanded={open}
        data-testid={`cert-node-${c.id}`}
        className={`w-full text-left panel px-5 py-4 transition-colors ${hasMore ? "panel-hover cursor-pointer" : ""} ${open ? "border-amb/60" : ""}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-sm font-bold text-ink">{c.name}</p>
            <p className="font-mono text-[10px] text-ink3 mt-1 uppercase tracking-[0.1em]">{c.issuer}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {verified && (
              <span className="font-mono text-[8px] tracking-[0.2em] px-2 py-0.5 border border-grn/40 text-grn">VERIFIED</span>
            )}
            {hasMore && <ChevronDown size={14} className={`text-ink3 transition-transform ${open ? "rotate-180 text-amb" : ""}`} />}
          </div>
        </div>
        {(c.courses || []).length > 0 && !open && (
          <p className="mt-2.5 font-mono text-[9px] tracking-[0.12em] uppercase text-ink3">
            {c.courses.length} course{c.courses.length === 1 ? "" : "s"} covered — click to expand
          </p>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="mt-2 panel p-5 space-y-4 border-l-2" style={{ borderLeftColor: "var(--amber)" }}>
              {c.image && (
                <div className="border border-line overflow-hidden aspect-video bg-canvas2">
                  <img src={c.image.startsWith("/") ? `${BACKEND}${c.image}` : c.image} alt={c.name} loading="lazy"
                    className="w-full h-full object-cover" />
                </div>
              )}
              {c.description && <p className="text-xs text-ink2 leading-relaxed">{c.description}</p>}
              {(c.courses || []).length > 0 && (
                <div>
                  <TechLabel className="block mb-2">Courses Covered</TechLabel>
                  <ul className="font-mono text-[10px] text-ink2 space-y-1">
                    {c.courses.map((course, i) => (
                      <li key={course} className="flex gap-2">
                        <span className="text-ink3">{i === c.courses.length - 1 ? "└" : "├"}</span> {course}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(c.skills || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-line">
                  {c.skills.map((s) => (
                    <span key={s} className="font-mono text-[9px] tracking-[0.12em] uppercase px-2 py-0.5 border border-line text-ink3">{s}</span>
                  ))}
                </div>
              )}
              {(c.verificationUrl || c.certificatePdf || c.credentialId) && (
                <div className="pt-3 border-t border-line flex flex-wrap items-center gap-4">
                  {c.credentialId && (
                    <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink3">ID — {c.credentialId}</span>
                  )}
                  {(c.verificationUrl || c.certificatePdf) && (
                    <a href={c.verificationUrl || c.certificatePdf} target="_blank" rel="noopener noreferrer"
                      data-testid={`cert-view-${c.id}`}
                      className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.15em] uppercase text-violet hover:underline">
                      View Credential <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reveal>
  );
}

export default function Experience() {
  const { experience, certifications, loading } = useContent();
  useSeo("Experience");

  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-16 sm:py-24">
      <SectionHead
        num="05 /"
        title="EXPERIENCE"
        sub="PROFESSIONAL_HISTORY / CREDENTIAL_LOG — work, systems, certifications, and the progression behind them."
      />

      {loading && <p className="font-mono text-xs text-ink3 animate-blink mb-6">LOADING RECORDS…</p>}

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
        <section data-testid="work-log">
          <div className="flex items-center gap-3 mb-8">
            <span className="font-mono text-[10px] tracking-[0.3em] text-violet">WORK.LOG</span>
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-[9px] text-ink3">{experience.length} ENTRIES</span>
          </div>
          <div>
            {experience.map((e, i) => <WorkNode key={e.id} e={e} index={i} />)}
            {experience.length > 0 && (
              <Reveal className="relative pl-10">
                <span className="absolute left-0 top-1.5 grid place-items-center w-7 h-7 border border-grn bg-card">
                  <span className="w-2 h-2 rounded-full bg-grn animate-blink" />
                </span>
                <div className="font-mono text-[10px] tracking-[0.25em] text-grn mb-1.5">CURRENT</div>
                <p className="font-mono text-sm font-bold tracking-wide text-grn">BUILDING / LEARNING / SHIPPING</p>
              </Reveal>
            )}
          </div>
        </section>

        <section data-testid="cert-log">
          <div className="flex items-center gap-3 mb-8">
            <span className="font-mono text-[10px] tracking-[0.3em] text-amb">CERTIFICATION.LOG</span>
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-[9px] text-ink3">{certifications.length} CREDENTIALS</span>
          </div>
          {certifications.length === 0 ? (
            <div className="panel p-10 text-center font-mono text-xs text-ink3">NO CREDENTIALS PUBLISHED YET</div>
          ) : (
            <div>{certifications.map((c, i) => <CertNode key={c.id} c={c} index={i} />)}</div>
          )}
        </section>
      </div>
    </div>
  );
}
