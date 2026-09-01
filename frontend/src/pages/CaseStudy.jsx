import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Github, X } from "lucide-react";
import { useContent } from "../lib/content";
import useSeo from "../lib/useSeo";
import { SectionHead, TechLabel, Reveal, LevelTag } from "../components/system/bits";
import { ProjectMeta, DisclosureBanner } from "../components/ProjectRecord";
import ArchDiagram from "../components/system/ArchDiagram";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "";
const mediaSrc = (url) => !url ? "" : /^(https?:|data:|blob:)/.test(url) ? url : `${BACKEND}${url}`;

const CASE_SECTIONS = [
  ["overview", "OVERVIEW"], ["problem", "PROBLEM"], ["requirements", "REQUIREMENTS"],
  ["role", "MY ROLE"], ["featuresText", "FEATURES"], ["uiux", "UI / UX"],
  ["process", "DEVELOPMENT PROCESS"], ["challenges", "CHALLENGES"],
  ["solutions", "SOLUTIONS"], ["outcome", "OUTCOME"], ["result", "RESULT"],
  ["learned", "WHAT I LEARNED"],
];

function ShowcaseImage({ url, index, className = "", onOpen }) {
  return <button type="button" onClick={() => onOpen(index)}
    className={`group relative w-full border border-line bg-canvas2 overflow-hidden cursor-zoom-in hover:border-violet/60 transition-colors ${className}`}
    aria-label={`Enlarge project screenshot ${index + 1}`}>
    <img src={mediaSrc(url)} alt={`Project screenshot ${index + 1} of 5`} loading="lazy"
      className="w-full h-full object-contain group-hover:scale-[1.015] transition-transform duration-700" />
    <span className="absolute top-3 left-3 px-2 py-1 bg-canvas/85 border border-line font-mono text-[9px] tracking-[0.18em] text-ink2">
      {String(index + 1).padStart(2, "0")} / 05
    </span>
    <span className="absolute right-3 bottom-3 px-2.5 py-1.5 bg-canvas/90 border border-line font-mono text-[9px] tracking-[0.15em] text-ink3 opacity-0 group-hover:opacity-100 transition-opacity">VIEW FULLSCREEN ↗</span>
  </button>;
}

function ProjectGallery({ images, title }) {
  const [active, setActive] = useState(null);
  const close = () => setActive(null);
  const move = (direction) => setActive((current) => (current + direction + images.length) % images.length);
  useEffect(() => {
    if (active === null) return undefined;
    const keydown = (event) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", keydown);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", keydown); };
  }, [active, images.length]);

  if (images.length !== 5) return null;
  return <>
    <section className="mt-20" data-testid="project-gallery">
      <div className="flex items-center gap-4 mb-6"><TechLabel className="text-violet">PROJECT SHOWCASE</TechLabel><span className="h-px flex-1 bg-line" /><span className="font-mono text-[9px] tracking-[0.2em] text-ink3">05 SCREENSHOTS</span></div>
      <div className="space-y-5">
        <ShowcaseImage url={images[0]} index={0} onOpen={setActive} className="aspect-[16/9]" />
        <div className="grid md:grid-cols-2 gap-5">
          <ShowcaseImage url={images[1]} index={1} onOpen={setActive} className="aspect-[16/10]" />
          <ShowcaseImage url={images[2]} index={2} onOpen={setActive} className="aspect-[16/10]" />
        </div>
        <ShowcaseImage url={images[3]} index={3} onOpen={setActive} className="aspect-[16/9]" />
        <ShowcaseImage url={images[4]} index={4} onOpen={setActive} className="aspect-[16/9]" />
      </div>
    </section>

    <AnimatePresence>{active !== null && <motion.div className="fixed inset-0 z-[100] grid place-items-center p-4 sm:p-8 bg-canvas/95 backdrop-blur-md"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={`${title} screenshot viewer`} onClick={close}>
      <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.25em] text-ink2">{String(active + 1).padStart(2, "0")} / 05</div>
      <button type="button" onClick={close} className="absolute top-4 right-4 sm:top-6 sm:right-6 grid place-items-center w-11 h-11 border border-line text-ink2 hover:text-violet hover:border-violet" aria-label="Close image viewer"><X size={18} /></button>
      <button type="button" onClick={(event) => { event.stopPropagation(); move(-1); }} className="absolute left-3 sm:left-7 grid place-items-center w-11 h-11 border border-line bg-canvas/80 text-ink2 hover:text-violet hover:border-violet" aria-label="Previous screenshot"><ChevronLeft size={20} /></button>
      <motion.img key={active} src={mediaSrc(images[active])} alt={`${title} screenshot ${active + 1}`} onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-[92vw] max-h-[84vh] object-contain border border-line shadow-2xl" />
      <button type="button" onClick={(event) => { event.stopPropagation(); move(1); }} className="absolute right-3 sm:right-7 grid place-items-center w-11 h-11 border border-line bg-canvas/80 text-ink2 hover:text-violet hover:border-violet" aria-label="Next screenshot"><ChevronRight size={20} /></button>
    </motion.div>}</AnimatePresence>
  </>;
}

export default function CaseStudy() {
  const { slug } = useParams();
  const { projects, loading } = useContent();
  const p = projects.find((project) => project.slug === slug);
  useSeo(p ? p.title : "Project");
  if (loading) return <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-24 font-mono text-xs text-ink3 animate-blink">LOADING RECORD…</div>;
  if (!p) return <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-24 text-center" data-testid="case-not-found"><TechLabel className="block mb-4">ERROR / 404</TechLabel><h1 className="font-display text-4xl font-extrabold text-ink">RECORD NOT FOUND</h1><Link to="/work" className="mt-6 inline-block font-mono text-xs text-violet hover:underline">← BACK TO ARCHIVE</Link></div>;

  const ordered = [...projects].sort((a, b) => Number(a.order || 99) - Number(b.order || 99));
  const currentIndex = ordered.findIndex((project) => project.id === p.id);
  const previous = currentIndex > 0 ? ordered[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < ordered.length - 1 ? ordered[currentIndex + 1] : null;
  const cs = p.caseStudy || {};
  const sections = CASE_SECTIONS.filter(([key]) => cs[key]);
  const images = (p.screenshots || []).filter(Boolean).slice(0, 5);
  const showClient = p.client && !p.clientPrivate && p.disclosure === "PUBLIC";
  const projectLinks = [
    p.liveUrl && { href: p.liveUrl, label: "VIEW LIVE PROJECT", icon: ExternalLink, testid: "case-link-liveUrl" },
    p.githubUrl && { href: p.githubUrl, label: "GITHUB REPOSITORY", icon: Github, testid: "case-link-githubUrl" },
  ].filter(Boolean);

  return <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-16 sm:py-24">
    <Link to="/work" data-testid="case-back" className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 hover:text-violet transition-colors">← PROJECT ARCHIVE</Link>
    <header className="mt-8 mb-12">
      <div className="flex flex-wrap items-center gap-4 mb-5"><span className="font-mono text-[11px] tracking-[0.3em] text-violet">PROJECT / {p.num}</span><LevelTag level={p.disclosure === "PUBLIC" ? "FAMILIAR" : p.disclosure === "LIMITED DISCLOSURE" ? "WORKING KNOWLEDGE" : "LEARNING"} /></div>
      <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-ink">{p.title}</h1>
      <p className="mt-3 font-mono text-xs tracking-[0.25em] uppercase text-ink3">{p.subtitle}</p>
    </header>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line mb-12">
      <div className="bg-card p-5"><ProjectMeta label="TYPE" value={p.type} /></div><div className="bg-card p-5"><ProjectMeta label="YEAR" value={p.year} /></div>
      <div className="bg-card p-5"><ProjectMeta label="ROLE" value={p.role} /></div><div className="bg-card p-5"><ProjectMeta label="STACK" value={(p.stack || []).join(" · ")} /></div>
    </div>
    {showClient && <div className="mb-8"><ProjectMeta label="CLIENT / ORGANIZATION" value={p.client} /></div>}
    <div className="mb-10"><DisclosureBanner disclosure={p.disclosure} /></div>
    <Reveal className="max-w-4xl mb-12"><p className="text-base sm:text-lg text-ink2 leading-relaxed whitespace-pre-line">{p.description}</p></Reveal>

    {!!(p.features || []).length && <section className="mb-14"><TechLabel className="block mb-5">SYSTEMS / FEATURES</TechLabel><div className="flex flex-wrap gap-2">{p.features.map((feature) => <span key={feature} className="px-3 py-2 border border-line font-mono text-[10px] tracking-[0.12em] uppercase text-ink2">{feature}</span>)}</div></section>}

    {!!(p.architecture || []).length && <section className="mb-16"><SectionHead num="ARCH /" title="SYSTEM ARCHITECTURE" /><div className="panel p-6 sm:p-10 bg-grid"><ArchDiagram nodes={p.architecture} /></div></section>}

    <ProjectGallery images={images} title={p.title} />

    {!!sections.length && <div className="max-w-3xl mt-20 space-y-12">{sections.map(([key, label], index) => <Reveal key={key}><div className="flex items-center gap-4 mb-4"><span className="font-mono text-[11px] tracking-[0.3em] text-violet">{String(index + 1).padStart(2, "0")}</span><span className="h-px flex-1 bg-line" /><TechLabel>{label}</TechLabel></div><p className="text-sm sm:text-base text-ink2 leading-relaxed sm:pl-10 whitespace-pre-line">{cs[key]}</p></Reveal>)}</div>}

    {!!projectLinks.length && <section className="mt-20"><TechLabel className="block mb-5">PROJECT LINKS</TechLabel><div className="flex flex-wrap gap-3">{projectLinks.map(({ href, label, icon: Icon, testid }) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" data-testid={testid} className="inline-flex min-h-12 items-center gap-3 px-5 border border-line text-sm font-semibold text-ink2 hover:text-violet hover:border-violet hover:bg-violet/5 transition-colors"><Icon size={16} />{label}<ExternalLink size={13} /></a>)}</div></section>}

    {(previous || next) && <nav className="mt-20 pt-8 border-t border-line grid sm:grid-cols-2 gap-4" aria-label="Project navigation">
      {previous ? <Link to={`/work/${previous.slug}`} className="panel panel-hover p-5 group"><TechLabel>← PREVIOUS PROJECT</TechLabel><span className="block mt-2 font-display text-xl font-bold text-ink group-hover:text-violet">{previous.title}</span></Link> : <span />}
      {next && <Link to={`/work/${next.slug}`} className="panel panel-hover p-5 text-right group"><TechLabel>NEXT PROJECT →</TechLabel><span className="block mt-2 font-display text-xl font-bold text-ink group-hover:text-violet">{next.title}</span></Link>}
    </nav>}

    <div className="mt-16 panel p-8 sm:p-10 text-center bg-grid"><TechLabel className="block mb-4">NEXT STEP</TechLabel><h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">NEED A SYSTEM LIKE THIS?</h2><Link to="/contact" data-testid="case-contact-cta" className="mt-6 inline-flex h-11 items-center px-7 bg-violet font-mono text-[11px] tracking-[0.2em] uppercase font-semibold hover:opacity-90" style={{ color: "var(--bg)" }}>Start a Project →</Link></div>
  </div>;
}
