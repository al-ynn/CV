import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ArrowRight, Layers3, Check } from "lucide-react";
import { useContent } from "../lib/content";
import useSeo from "../lib/useSeo";
import { SectionHead, TechLabel, Reveal } from "../components/system/bits";

const list = (value) => Array.isArray(value) ? value : String(value || "").split(/,|\n/).map((item) => item.trim()).filter(Boolean);
const textOf = (cap) => cap.shortDesc || cap.desc || cap.description || "";
const normalize = (cap) => ({
  ...cap,
  shortDesc: textOf(cap),
  detail: cap.detail || cap.description || textOf(cap),
  includes: list(cap.includes), goodFor: list(cap.goodFor), addOns: list(cap.addOns),
  tags: list(cap.tags || cap.technologies), keywords: list(cap.keywords), projects: list(cap.projects),
});
const slug = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function ServiceCard({ category, index, onOpen }) {
  const capabilities = (category.capabilities || []).map(normalize);
  return <Reveal delay={Math.min(index, 8) * 0.035} className="h-full">
    <article className="group h-full min-h-[250px] panel panel-hover glow-violet-hover shine p-5 sm:p-6 flex flex-col relative overflow-hidden card-hover-lift">
      <span className="absolute top-0 left-0 h-0.5 w-full bg-gradient-to-r from-violet via-cyan to-pink scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
      <div className="flex items-center justify-between gap-4"><TechLabel className="text-violet/80">SERVICE / {category.num || String(index + 1).padStart(2, "0")}</TechLabel><TechLabel>{String(capabilities.length).padStart(2, "0")} CAPABILITIES</TechLabel></div>
      <h3 className="mt-5 font-display text-xl sm:text-2xl font-bold tracking-tight text-ink group-hover:text-violet transition-colors">{category.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-ink2 line-clamp-3">{category.blurb}</p>
      <div className="mt-5 flex flex-wrap gap-1.5">{capabilities.slice(0, 4).map((cap) => <span key={cap.name} className="px-2 py-1 border border-line font-mono text-[8px] tracking-[0.1em] uppercase text-ink3">{cap.name}</span>)}</div>
      <button type="button" onClick={onOpen} data-testid={`service-${slug(category.slug || category.id)}`}
        className="mt-auto pt-5 flex items-center gap-2 text-sm font-semibold text-ink2 group-hover:text-violet transition-colors">
        View more <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </article>
  </Reveal>;
}

function DetailGroup({ title, items }) {
  if (!items.length) return null;
  return <div><TechLabel className="block mb-3">{title}</TechLabel><ul className="grid sm:grid-cols-2 gap-2">{items.map((item) => <li key={item} className="flex gap-2.5 border border-line bg-canvas/30 p-3 text-sm leading-relaxed text-ink2"><Check size={14} className="mt-0.5 shrink-0 text-violet" />{item}</li>)}</ul></div>;
}

function ServiceDetails({ selected, onClose }) {
  if (!selected) return null;
  const category = selected;
  const capabilities = (category.capabilities || []).map(normalize);
  return <motion.div className="fixed inset-0 z-[80] flex justify-end bg-canvas/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" onClick={onClose}>
    <motion.aside initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} transition={{ ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-5xl h-full overflow-y-auto overscroll-contain border-l border-line bg-card shadow-2xl" onClick={(event) => event.stopPropagation()}>
      <div className="sticky top-0 z-10 px-5 sm:px-7 py-4 border-b border-line bg-card/95 backdrop-blur flex items-center justify-between">
        <TechLabel className="text-violet">SERVICE DETAILS</TechLabel><button type="button" onClick={onClose} className="grid place-items-center w-10 h-10 border border-line text-ink3 hover:text-violet hover:border-violet" aria-label="Close service details"><X size={16} /></button>
      </div>
      <div className="p-6 sm:p-9">
        <TechLabel>SERVICE / {category.num || "—"}</TechLabel>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">{category.title}</h2>
        <p className="mt-5 text-base leading-relaxed text-ink2">{category.longDescription || category.blurb}</p>
        <div className="mt-7 border border-line p-4 flex items-center justify-between gap-4"><div><TechLabel className="block">AVAILABLE CAPABILITIES</TechLabel><strong className="block mt-1 text-sm text-ink">{capabilities.length} specialized services</strong></div><Layers3 size={20} className="text-violet" /></div>
        <div className={`mt-8 grid gap-3 ${capabilities.length <= 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          {capabilities.map((cap, index) => <article key={cap.name} className="h-full border border-line bg-canvas/30 p-4 sm:p-5">
            <div className="flex items-start gap-4"><span className="font-mono text-[10px] text-violet">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><h3 className="font-display text-lg font-bold text-ink">{cap.name}</h3><p className="mt-1 text-sm leading-relaxed text-ink2">{cap.detail || cap.shortDesc}</p></div></div>
            <div className="mt-4 flex flex-wrap gap-2"><span className="px-2 py-1 border border-line font-mono text-[8px] tracking-[0.12em] text-violet">{cap.level || "WORKING KNOWLEDGE"}</span>{cap.price && <span className="px-2 py-1 border border-line font-mono text-[8px] tracking-[0.12em] text-ink3">FROM {cap.price}</span>}{cap.tags.slice(0, 4).map((tag) => <span key={tag} className="px-2 py-1 border border-line font-mono text-[8px] tracking-[0.1em] uppercase text-ink3">{tag}</span>)}</div>
            {(cap.includes.length > 0 || cap.goodFor.length > 0) && <div className="mt-5 space-y-5"><DetailGroup title="WHAT CAN BE INCLUDED" items={cap.includes} /><DetailGroup title="GOOD FOR" items={cap.goodFor} /></div>}
          </article>)}
        </div>
        <div className="mt-10 pt-6 border-t border-line flex flex-wrap gap-3">
          <Link to="/contact" state={{ service: category.title }} onClick={onClose} data-testid="capability-inquire"
            className="inline-flex min-h-12 items-center gap-2 px-6 bg-violet text-sm font-semibold hover:brightness-110" style={{ color: "var(--bg)" }}>Discuss This Project <ArrowRight size={15} /></Link>
          <Link to="/pricing#estimator" onClick={onClose} className="inline-flex min-h-12 items-center px-6 border border-line text-sm font-semibold text-ink2 hover:text-violet hover:border-violet">Estimate Scope</Link>
        </div>
      </div>
    </motion.aside>
  </motion.div>;
}

export default function Services() {
  const { services, loading } = useContent();
  useSeo("Services");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const visible = useMemo(() => services.map((cat) => ({ ...cat, capabilities: (cat.capabilities || []).filter((cap) => cap.visible !== false) })), [services]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visible.filter((cat) => category === "ALL" || (cat.slug || cat.id) === category).map((cat) => ({
      ...cat,
      capabilities: cat.capabilities.filter((raw) => {
        if (!q) return true;
        const cap = normalize(raw);
        return [cat.title, cat.blurb, cap.name, cap.shortDesc, cap.detail, ...cap.includes, ...cap.goodFor, ...cap.addOns, ...cap.tags, ...cap.keywords].join(" ").toLowerCase().includes(q);
      }),
    })).filter((cat) => cat.capabilities.length);
  }, [visible, category, query]);
  const resultCount = filtered.reduce((sum, cat) => sum + cat.capabilities.length, 0);
  const totalCount = visible.reduce((sum, cat) => sum + cat.capabilities.length, 0);

  return <div className="relative bg-aurora-soft overflow-hidden">
    <span aria-hidden="true" className="orb orb-violet orb-float-a hidden md:block" style={{ width: "22rem", height: "22rem", top: "-6rem", left: "-4rem" }} />
    <span aria-hidden="true" className="orb orb-cyan orb-float-b hidden lg:block" style={{ width: "18rem", height: "18rem", top: "20rem", right: "-4rem" }} />
    <span aria-hidden="true" className="orb orb-pink orb-float-c hidden lg:block" style={{ width: "14rem", height: "14rem", bottom: "10%", left: "35%" }} />
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-16 sm:py-24 relative">
    <SectionHead num="03 /" title={`SERVICES / ${String(visible.length).padStart(2, "0")}`} sub="Explore the services I can provide for websites, systems, online stores, product design, and ongoing development support." />
    <section className="panel p-4 sm:p-5 mb-14 bg-grid relative overflow-hidden shine" aria-label="Search and filter services">
      <span aria-hidden="true" className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-violet/60 to-transparent" />
      <TechLabel className="block mb-3">SEARCH SERVICES</TechLabel>
      <div className="grid md:grid-cols-[1fr_300px] gap-3">
        <label className="relative block"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink3" /><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search for a service, feature, or solution…" data-testid="services-search" className="w-full h-12 pl-11 pr-4 bg-card border border-line text-sm text-ink placeholder:text-ink3 focus:border-violet focus:outline-none" /></label>
        <label className="relative block"><SlidersHorizontal size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink3 pointer-events-none" /><select value={category} onChange={(event) => setCategory(event.target.value)} data-testid="services-category-filter" className="w-full h-12 pl-11 pr-4 bg-card border border-line text-sm text-ink focus:border-violet focus:outline-none appearance-auto"><option value="ALL">All service categories</option>{visible.map((cat) => <option key={cat.id} value={cat.slug || cat.id}>{cat.title}</option>)}</select></label>
      </div>
      <div className="mt-3 flex items-center justify-between gap-4 font-mono text-[9px] tracking-[0.16em] uppercase text-ink3"><span>{query || category !== "ALL" ? `${resultCount} matching` : `${totalCount} available`} capabilities</span>{(query || category !== "ALL") && <button type="button" onClick={() => { setQuery(""); setCategory("ALL"); }} className="text-violet hover:underline">Clear filters</button>}</div>
    </section>

    {loading && <p className="font-mono text-xs text-ink3 animate-blink">LOADING SERVICE DIRECTORY…</p>}
    {!loading && !filtered.length && <div className="panel p-12 text-center"><TechLabel className="block mb-3">0 RESULTS</TechLabel><p className="text-sm text-ink2">No services match that search. Try a broader term or clear the category filter.</p></div>}

    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="service-directory">
      {filtered.map((cat, index) => <ServiceCard key={cat.id} category={cat} index={index} onOpen={() => setSelected(cat)} />)}
    </div>

    <div className="mt-20 panel p-8 text-center bg-grid relative overflow-hidden">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet to-transparent" />
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" style={{ background: "linear-gradient(90deg, transparent, var(--cyan), transparent)" }} />
      <TechLabel className="block mb-3">SCOPE.UNKNOWN?</TechLabel>
      <p className="font-display text-xl sm:text-2xl font-extrabold text-ink">NOT SURE WHICH SERVICE FITS?</p>
      <Link to="/contact" className="mt-5 inline-flex h-11 items-center px-7 font-mono text-[11px] tracking-[0.2em] uppercase font-semibold hover:opacity-90 transition-opacity" style={{ color: "var(--bg)", background: "linear-gradient(90deg, var(--violet), color-mix(in srgb, var(--violet) 55%, var(--pink)))" }}>Describe the Problem →</Link>
    </div>
    <AnimatePresence>{selected && <ServiceDetails selected={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </div>
  </div>;
}
