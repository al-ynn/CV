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

export const SectionHead = ({ num, title, sub, right }) => (
  <div className="mb-12 sm:mb-16">
    <div className="flex items-center gap-4 mb-5">
      <span className="font-mono text-[11px] tracking-[0.3em] text-violet">{num}</span>
      <span className="h-px flex-1 bg-line" />
      {right}
    </div>
    <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-none text-ink">
      {title}
    </h2>
    {sub && <p className="mt-4 max-w-2xl text-sm sm:text-base text-ink2 leading-relaxed">{sub}</p>}
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
  "WORKING KNOWLEDGE": { color: "var(--cyan)", border: "var(--cyan)" },
  EXPERIENCE: { color: "var(--amber)", border: "var(--amber)" },
  LEARNING: { color: "var(--tx3)", border: "var(--line)" },
  AVAILABLE: { color: "var(--cyan)", border: "var(--line)" },
};

export const LevelTag = ({ level }) => {
  if (!level) return null;
  const s = LEVEL_STYLE[level] || LEVEL_STYLE.AVAILABLE;
  return (
    <span
      className="inline-block font-mono text-[9px] tracking-[0.18em] uppercase px-2 py-0.5 border whitespace-nowrap"
      style={{ color: s.color, borderColor: s.border }}
    >
      {level}
    </span>
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
