import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "../lib/content";
import { SectionHead, TechLabel, LevelTag, Reveal } from "../components/system/bits";
import { ChevronDown } from "lucide-react";

export default function Services() {
  const { services, loading } = useContent();
  const [open, setOpen] = useState(services[0]?.id || null);

  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-16 sm:py-24">
      <SectionHead
        num="03 /"
        title={`SERVICES / ${String(services.length || 7).padStart(2, "0")}`}
        sub="Seven service systems. Each capability is labeled with its actual status — core strength, experience, or available on request."
      />

      {loading && <p className="font-mono text-xs text-ink3 animate-blink mb-6">LOADING SERVICE MODULES…</p>}

      <div className="space-y-4">
        {services.map((s) => {
          const isOpen = open === s.id;
          return (
            <Reveal key={s.id} className={`panel ${isOpen ? "border-violet" : "panel-hover"}`}>
              <button
                data-testid={`service-toggle-${s.id}`}
                onClick={() => setOpen(isOpen ? null : s.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-4 sm:gap-6 p-5 sm:p-6 text-left"
              >
                <span className="font-mono text-[11px] tracking-[0.25em] text-violet shrink-0">
                  SERVICE / {s.num}
                </span>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-base sm:text-xl font-extrabold tracking-tight text-ink truncate">
                    {s.title}
                  </h2>
                  <p className="hidden sm:block text-xs text-ink3 mt-1 truncate">{s.blurb}</p>
                </div>
                <span className="hidden md:inline font-mono text-[9px] tracking-[0.2em] text-ink3 uppercase shrink-0">
                  {s.capabilities.length} CAPABILITIES
                </span>
                <ChevronDown
                  size={16}
                  className={`text-ink3 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-violet" : ""}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-6">
                      <p className="sm:hidden text-xs text-ink3 mb-4">{s.blurb}</p>
                      <div className="grid grid-cols-[1fr_auto] gap-px bg-line border border-line font-mono text-[9px] tracking-[0.2em] uppercase">
                        <div className="bg-canvas2 px-4 py-2 text-ink3">CAPABILITIES</div>
                        <div className="bg-canvas2 px-4 py-2 text-ink3 text-right">STATUS</div>
                        {s.capabilities.map((cap) => (
                          <div key={cap.name} className="contents group">
                            <div className="bg-card px-4 py-3 group-hover:bg-canvas2/60 transition-colors">
                              <div className="text-[11px] tracking-normal normal-case text-ink font-medium">{cap.name}</div>
                              <div className="text-[10px] tracking-normal normal-case text-ink3 mt-0.5 leading-relaxed">{cap.desc}</div>
                            </div>
                            <div className="bg-card px-4 py-3 flex items-start justify-end group-hover:bg-canvas2/60 transition-colors">
                              <LevelTag level={cap.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 flex justify-end">
                        <Link
                          to="/contact"
                          data-testid={`service-inquire-${s.id}`}
                          className="font-mono text-[10px] tracking-[0.2em] uppercase text-violet hover:underline"
                        >
                          INQUIRE ABOUT THIS SERVICE →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-16 panel p-8 text-center bg-grid">
        <TechLabel className="block mb-3">SCOPE.UNKNOWN?</TechLabel>
        <p className="font-display text-xl sm:text-2xl font-extrabold text-ink">NOT SURE WHICH SERVICE FITS?</p>
        <Link
          to="/contact"
          data-testid="services-contact-cta"
          className="mt-5 inline-flex h-11 items-center px-7 bg-violet font-mono text-[11px] tracking-[0.2em] uppercase font-semibold hover:opacity-90 transition-opacity"
          style={{ color: "var(--bg)" }}
        >
          Describe the Problem →
        </Link>
      </div>
    </div>
  );
}
