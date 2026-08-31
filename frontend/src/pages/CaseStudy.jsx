import { Link, useParams } from "react-router-dom";
import { useContent } from "../lib/content";
import useSeo from "../lib/useSeo";
import { SectionHead, TechLabel, Reveal, LevelTag } from "../components/system/bits";
import { ProjectMeta, DisclosureBanner } from "../components/ProjectRecord";
import ArchDiagram from "../components/system/ArchDiagram";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

const CASE_SECTIONS = [
  ["overview", "OVERVIEW"],
  ["problem", "PROBLEM"],
  ["requirements", "REQUIREMENTS"],
  ["role", "MY ROLE"],
  ["featuresText", "FEATURES"],
  ["uiux", "UI / UX"],
  ["process", "DEVELOPMENT PROCESS"],
  ["challenges", "CHALLENGES"],
  ["solutions", "SOLUTIONS"],
  ["outcome", "OUTCOME"],
  ["result", "RESULT"],
  ["learned", "WHAT I LEARNED"],
];

const LINKS = [
  ["liveUrl", "LIVE SITE ↗"],
  ["githubUrl", "GITHUB ↗"],
  ["figmaUrl", "FIGMA ↗"],
  ["videoUrl", "DEMO ↗"],
];

export default function CaseStudy() {
  const { slug } = useParams();
  const { projects, loading } = useContent();
  const p = projects.find((x) => x.slug === slug);
  useSeo(p ? p.title : "Project");

  if (loading) {
    return <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-24 font-mono text-xs text-ink3 animate-blink">LOADING RECORD…</div>;
  }
  if (!p) {
    return (
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-24 text-center" data-testid="case-not-found">
        <TechLabel className="block mb-4">ERROR / 404</TechLabel>
        <h1 className="font-display text-4xl font-extrabold text-ink">RECORD NOT FOUND</h1>
        <Link to="/work" className="mt-6 inline-block font-mono text-xs text-violet hover:underline">← BACK TO ARCHIVE</Link>
      </div>
    );
  }

  const cs = p.caseStudy || {};
  const sections = CASE_SECTIONS.filter(([key]) => cs[key]);
  const links = LINKS.filter(([key]) => p[key]);
  const showClient = p.client && !p.clientPrivate && p.disclosure === "PUBLIC";

  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-16 sm:py-24">
      <Link to="/work" data-testid="case-back"
        className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 hover:text-violet transition-colors">
        ← PROJECT ARCHIVE
      </Link>

      <div className="mt-8 mb-12">
        <div className="flex flex-wrap items-center gap-4 mb-5">
          <span className="font-mono text-[11px] tracking-[0.3em] text-violet">PROJECT / {p.num}</span>
          <LevelTag level={p.disclosure === "PUBLIC" ? "FAMILIAR" : p.disclosure === "LIMITED DISCLOSURE" ? "WORKING KNOWLEDGE" : "LEARNING"} />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-ink">
          {p.title}
        </h1>
        <p className="mt-3 font-mono text-xs tracking-[0.25em] uppercase text-ink3">{p.subtitle}</p>
      </div>

      {p.cover && (
        <div className="mb-12 border border-line overflow-hidden bg-canvas2">
          <img src={`${BACKEND}${p.cover}`} alt={p.title} className="w-full max-h-[480px] object-cover" />
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line mb-12">
        <div className="bg-card p-5"><ProjectMeta label="TYPE" value={p.type} /></div>
        <div className="bg-card p-5"><ProjectMeta label="YEAR" value={p.year} /></div>
        <div className="bg-card p-5"><ProjectMeta label="ROLE" value={p.role} /></div>
        <div className="bg-card p-5"><ProjectMeta label="STACK" value={(p.stack || []).join(" · ")} /></div>
      </div>

      {showClient && (
        <div className="mb-8"><ProjectMeta label="CLIENT / ORGANIZATION" value={p.client} /></div>
      )}

      <div className="mb-12"><DisclosureBanner disclosure={p.disclosure} /></div>

      {links.length > 0 && (
        <div className="mb-12 flex flex-wrap gap-3">
          {links.map(([key, label]) => (
            <a key={key} href={p[key]} target="_blank" rel="noopener noreferrer" data-testid={`case-link-${key}`}
              className="px-4 h-10 inline-flex items-center border border-line font-mono text-[10px] tracking-[0.2em] uppercase text-ink2 hover:border-violet hover:text-violet transition-colors">
              {label}
            </a>
          ))}
        </div>
      )}

      <Reveal className="max-w-3xl mb-16">
        <p className="text-base sm:text-lg text-ink2 leading-relaxed whitespace-pre-line">{p.description}</p>
      </Reveal>

      {(p.features || []).length > 0 && (
        <div className="mb-16">
          <TechLabel className="block mb-5">SYSTEMS / FEATURES</TechLabel>
          <div className="flex flex-wrap gap-2">
            {p.features.map((f) => (
              <span key={f} className="px-3 py-1.5 border border-line font-mono text-[10px] tracking-[0.12em] uppercase text-ink2">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {(p.architecture || []).length > 0 && (
        <div className="mb-16">
          <SectionHead num="ARCH /" title="SYSTEM ARCHITECTURE" />
          <div className="panel p-6 sm:p-10 bg-grid">
            <ArchDiagram nodes={p.architecture} />
          </div>
        </div>
      )}

      <div className="max-w-3xl space-y-12">
        {sections.map(([key, label], i) => (
          <Reveal key={key}>
            <div className="flex items-center gap-4 mb-4">
              <span className="font-mono text-[11px] tracking-[0.3em] text-violet">{String(i + 1).padStart(2, "0")}</span>
              <span className="h-px flex-1 bg-line" />
              <TechLabel>{label}</TechLabel>
            </div>
            <p className="text-sm sm:text-base text-ink2 leading-relaxed pl-0 sm:pl-10 whitespace-pre-line">{cs[key]}</p>
          </Reveal>
        ))}
      </div>

      <div className="mt-20 panel p-8 sm:p-10 text-center bg-grid">
        <TechLabel className="block mb-4">NEXT STEP</TechLabel>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
          NEED A SYSTEM LIKE THIS?
        </h2>
        <Link to="/contact" data-testid="case-contact-cta"
          className="mt-6 inline-flex h-11 items-center px-7 bg-violet font-mono text-[11px] tracking-[0.2em] uppercase font-semibold hover:opacity-90 transition-opacity"
          style={{ color: "var(--bg)" }}>
          Start a Project →
        </Link>
      </div>
    </div>
  );
}
