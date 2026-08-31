import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "../lib/content";
import useSeo from "../lib/useSeo";
import { SectionHead, TechLabel, LevelTag, Reveal } from "../components/system/bits";
import { X } from "lucide-react";

function CapabilityCard({ cap, cat, index, onOpen, relatedCount }) {
  if (cap.visible === false) return null;
  return (
    <Reveal delay={index * 0.04} className="h-full">
      <button
        onClick={onOpen}
        data-testid={`cap-${cat.slug}-${(cap.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
        className="group w-full text-left panel panel-hover p-5 relative overflow-hidden eq-card"
      >
        <div className="absolute top-0 left-0 w-full h-0.5 bg-violet scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-display text-base font-bold tracking-tight text-ink group-hover:text-violet transition-colors leading-snug">
            {cap.name}
          </h3>
          {cap.featured && <span className="font-mono text-[8px] tracking-[0.2em] text-violet shrink-0">★</span>}
        </div>
        <p className="text-xs text-ink2 leading-relaxed line-clamp-2 min-h-[2rem]">{cap.shortDesc}</p>
        {(cap.technologies || []).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {cap.technologies.slice(0, 4).map((t) => (
              <span key={t} className="font-mono text-[8px] tracking-[0.12em] uppercase px-1.5 py-0.5 border border-line text-ink3">{t}</span>
            ))}
          </div>
        )}
        <div className="eq-card-foot mt-4 pt-3 border-t border-line flex items-center justify-between gap-2">
          <LevelTag level={cap.level} />
          {relatedCount > 0 && (
            <span className="font-mono text-[9px] tracking-[0.15em] text-ink3">USED IN {String(relatedCount).padStart(2, "0")} PROJECT{relatedCount === 1 ? "" : "S"}</span>
          )}
        </div>
      </button>
    </Reveal>
  );
}

function CapabilityModal({ cap, cat, projects, onClose }) {
  if (!cap) return null;
  const related = (cap.projects || [])
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter(Boolean);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" data-testid="capability-modal">
      <div className="absolute inset-0 bg-canvas/85 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative panel w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line sticky top-0 bg-card z-10">
          <span className="font-mono text-[10px] tracking-[0.25em] text-violet uppercase">{cat.title} / CAPABILITY</span>
          <button onClick={onClose} aria-label="Close" data-testid="capability-close" className="text-ink3 hover:text-ink"><X size={16} /></button>
        </div>
        <div className="p-6 sm:p-8">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">{cap.name}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <LevelTag level={cap.level} />
            {cap.price && <span className="font-mono text-[10px] tracking-[0.15em] text-amb uppercase">from {cap.price}</span>}
          </div>
          <p className="mt-5 text-sm text-ink2 leading-relaxed whitespace-pre-line">{cap.detail || cap.shortDesc}</p>
          {(cap.technologies || []).length > 0 && (
            <div className="mt-6">
              <TechLabel className="block mb-3">STACK</TechLabel>
              <div className="flex flex-wrap gap-1.5">
                {cap.technologies.map((t) => (
                  <span key={t} className="font-mono text-[9px] tracking-[0.12em] uppercase px-2 py-1 border border-line text-ink2">{t}</span>
                ))}
              </div>
            </div>
          )}
          {related.length > 0 && (
            <div className="mt-6">
              <TechLabel className="block mb-3">PROVEN IN</TechLabel>
              <div className="space-y-2">
                {related.map((p) => (
                  <Link key={p.id} to={`/work/${p.slug}`} onClick={onClose}
                    className="flex items-center justify-between panel panel-hover px-4 py-3 group">
                    <span className="font-mono text-xs text-ink group-hover:text-violet transition-colors">{p.title} — {p.subtitle}</span>
                    <span className="font-mono text-[9px] text-ink3">CASE STUDY →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="mt-8 pt-5 border-t border-line flex flex-wrap gap-3">
            <Link to="/contact" onClick={onClose} data-testid="capability-inquire"
              className="h-11 px-7 inline-flex items-center bg-violet font-mono text-[10px] tracking-[0.2em] uppercase font-semibold"
              style={{ color: "var(--bg)" }}>
              Request This Service →
            </Link>
            <Link to="/pricing" onClick={onClose}
              className="h-11 px-6 inline-flex items-center border border-line font-mono text-[10px] tracking-[0.2em] uppercase text-ink2 hover:border-violet">
              Estimate Scope ₱
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Services() {
  const { services, projects, loading } = useContent();
  useSeo("Services");
  const [active, setActive] = useState(null);
  const [openCap, setOpenCap] = useState(null);

  const cat = services.find((s) => s.slug === active) || services[0];
  const caps = ((cat?.capabilities) || []).filter((c) => c.visible !== false);

  const relatedCount = (cap) => {
    if ((cap.projects || []).length) return cap.projects.length;
    if (!(cap.technologies || []).length) return 0;
    return projects.filter((p) => (p.stack || []).some((s) => cap.technologies.some((t) => s.toLowerCase().includes(t.toLowerCase())))).length;
  };

  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-16 sm:py-24">
      <SectionHead num="03 /" title={`SERVICES / ${String(services.length || 0).padStart(2, "0")}`}
        sub="A capability matrix — not a list. Select a service domain; every capability carries its experience level, stack, and proof." />

      {loading && <p className="font-mono text-xs text-ink3 animate-blink mb-6">LOADING SERVICE MODULES…</p>}

      <TechLabel className="block mb-4">SELECT SERVICE DOMAIN</TechLabel>
      <div className="flex flex-wrap gap-2 mb-12" role="tablist" aria-label="Service domains">
        {services.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={cat?.id === s.id}
            data-testid={`domain-${s.slug || s.id}`}
            onClick={() => setActive(s.slug || s.id)}
            className={`px-4 h-10 font-mono text-[10px] tracking-[0.2em] uppercase border transition-colors ${
              cat?.id === s.id ? "border-violet text-violet bg-violet/10" : "border-line text-ink3 hover:text-ink hover:border-ink3"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {cat && (
        <motion.div key={cat.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="panel p-6 sm:p-8 mb-8 bg-grid">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="font-mono text-[11px] tracking-[0.3em] text-violet">SERVICE / {cat.num}</span>
                <h2 className="mt-2 font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-ink leading-none">{cat.title}</h2>
                <p className="mt-3 max-w-xl text-sm text-ink2 leading-relaxed">{cat.blurb}</p>
              </div>
              <div className="flex gap-8 font-mono text-[10px] uppercase">
                <div><TechLabel className="block mb-1">Capabilities</TechLabel><span className="text-xl font-bold text-violet">{String(caps.length).padStart(2, "0")}</span></div>
                {cat.featured && <div><TechLabel className="block mb-1">Featured</TechLabel><span className="text-xl font-bold text-grn">YES</span></div>}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 eq-grid" data-testid="capability-grid">
            {caps.map((cap, i) => (
              <CapabilityCard key={cap.name} cap={cap} cat={cat} index={i} relatedCount={relatedCount(cap)}
                onOpen={() => setOpenCap({ cap, cat })} />
            ))}
          </div>
          {caps.length === 0 && (
            <div className="panel p-10 text-center font-mono text-xs text-ink3">NO VISIBLE CAPABILITIES IN THIS DOMAIN</div>
          )}
        </motion.div>
      )}

      <div className="mt-16 panel p-8 text-center bg-grid">
        <TechLabel className="block mb-3">SCOPE.UNKNOWN?</TechLabel>
        <p className="font-display text-xl sm:text-2xl font-extrabold text-ink">NOT SURE WHICH SERVICE FITS?</p>
        <Link to="/contact" data-testid="services-contact-cta"
          className="mt-5 inline-flex h-11 items-center px-7 bg-violet font-mono text-[11px] tracking-[0.2em] uppercase font-semibold hover:opacity-90 transition-opacity"
          style={{ color: "var(--bg)" }}>
          Describe the Problem →
        </Link>
      </div>

      <AnimatePresence>
        {openCap && (
          <CapabilityModal cap={openCap.cap} cat={openCap.cat} projects={projects} onClose={() => setOpenCap(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
