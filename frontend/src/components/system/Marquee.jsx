export default function Marquee({ items, className = "" }) {
  const row = [...items, ...items, ...items];
  return (
    <div
      className={`overflow-hidden border-y border-line py-4 select-none ${className}`}
      aria-hidden="true"
    >
      <div className="marquee-track flex w-max animate-marquee gap-0">
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0">
            {row.map((item, i) => (
              <span key={`${half}-${i}`} className="flex items-center whitespace-nowrap">
                <span className="font-display text-lg sm:text-2xl font-extrabold tracking-tight text-ink px-6">
                  {item}
                </span>
                <span className="font-mono text-xs text-violet">//</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
