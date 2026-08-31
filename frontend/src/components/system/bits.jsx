import { motion } from "framer-motion";

export const TechLabel = ({ children, className = "" }) => (
  <span className={`font-mono text-[10px] tracking-[0.28em] uppercase text-ink3 ${className}`}>{children}</span>
);

export const StatusDot = ({ color = "var(--green)", pulse = true, className = "" }) => (
  <span className={`relative inline-flex h-2 w-2 ${className}`}>
    {pulse && <span className="absolute inset-0 rounded-full animate-pulse-ring" style={{ backgroundColor: color }} />}
    <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
  </span>
);

export const SectionHead = ({ num, eyebrow, title, sub, right, bigNum, className = "" }) => (
  <div className={`relative mb-12 sm:mb-16 ${className}`}>
    {bigNum && (
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute -top-7 sm:-top-12 right-0 font-display font-extrabold leading-none text-[5.5rem] sm:text-[8rem] lg:text-[9.5rem] text-ink opacity-[0.045] dark:opacity-[0.06]"
      >
        {bigNum}
      </span>
    )}
    <div className="relative flex items-center gap-4 mb-5">
      <span className="font-mono text-[11px] tracking-[0.3em] text-violet uppercase whitespace-nowrap">
        {[num, eyebrow].filter(Boolean).join(" / ") || "\u00A0"}
      </span>
      <span className="h-px flex-1 bg-line" />
      {right}
    </div>
    <h2 className="relative font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[0.95] text-ink whitespace-pre-line">
      {title}
    </h2>
    {sub && <p className="relative mt-5 max-w-2xl text-sm sm:text-base text-ink2 leading-relaxed">{sub}</p>}
  </div>
);

export const SwapText = ({ label, alt, className = "" }) => (
  <span className={`relative inline-block overflow-hidden ${className}`}>
    <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full">{label}</span>
    <span className="absolute inset-0 block translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 text-violet">
      {alt}
    </span>
  </span>
);

const LEVEL_STYLE = {
  CORE: { color: "var(--violet)", border: "var(--violet)" },
  PROFICIENT: { color: "var(--cyan)", border: "var(--cyan)" },
  "WORKING KNOWLEDGE": { color: "var(--amber)", border: "var(--amber)" },
  FAMILIAR: { color: "var(--tx2)", border: "var(--line)" },
  LEARNING: { color: "var(--tx3)", border: "var(--line)" },
};

export const LevelTag = ({ level }) => {
  if (!level) return null;
  const s = LEVEL_STYLE[level] || { color: "var(--cyan)", border: "var(--line)" };
  return (
    <span
      className="inline-block font-mono text-[9px] tracking-[0.18em] uppercase px-2 py-0.5 border whitespace-nowrap"
      style={{ color: s.color, borderColor: s.border }}
    >
      {level}
    </span>
  );
};

const PROFICIENCY_SCALE = ["LEARNING", "FAMILIAR", "WORKING KNOWLEDGE", "PROFICIENT", "CORE"];

export const StatusScale = ({ status }) => {
  const idx = PROFICIENCY_SCALE.indexOf(status);
  const active = LEVEL_STYLE[status] || LEVEL_STYLE.LEARNING;
  return (
    <div data-testid={`status-scale-${status.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
      <div className="flex gap-1" role="img" aria-label={`Proficiency: ${status}`}>
        {PROFICIENCY_SCALE.map((s, i) => (
          <span
            key={s}
            className="h-1 flex-1 transition-colors"
            style={{ backgroundColor: i <= idx ? active.color : "var(--line)" }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <span className="font-mono text-[8px] tracking-[0.15em] text-ink3 hidden xl:inline">
          {PROFICIENCY_SCALE.slice(0, idx).length ? PROFICIENCY_SCALE[Math.max(0, idx - 1)] : "—"}
        </span>
        <span className="font-mono text-[9px] tracking-[0.15em] font-semibold" style={{ color: active.color }}>
          {status}
        </span>
      </div>
    </div>
  );
};

export const Reveal = ({ children, delay = 0, y = 24, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);
