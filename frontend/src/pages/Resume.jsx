import { useContent } from "../lib/content";
import useSeo from "../lib/useSeo";
import { periodOf } from "../data/content";
import { SectionHead, TechLabel, Reveal } from "../components/system/bits";
import { Download } from "lucide-react";

export default function Resume() {
  const { projects, settings, education, experience, skills, certifications } = useContent();
  useSeo("Resume");

  const proSkills = (skills.find((s) => s.title === "PROFESSIONAL SKILLS") || {}).items || [];

  return (
    <div className="mx-auto max-w-[1100px] px-5 sm:px-8 py-16 sm:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
        <SectionHead num="CV /" title="RESUME" sub="The web version. The PDF version is one click away." />
        <a
          href={`${process.env.REACT_APP_BACKEND_URL}/api/resume.pdf`}
          data-testid="resume-download"
          className="inline-flex h-11 items-center gap-2 px-6 bg-violet font-mono text-[11px] tracking-[0.2em] uppercase font-semibold hover:opacity-90 transition-opacity -mt-8"
          style={{ color: "var(--bg)" }}
        >
          <Download size={14} /> Download CV
        </a>
      </div>

      <div className="panel p-6 sm:p-10 space-y-12" data-testid="resume-document">
        <div className="border-b border-line pb-8">
          <TechLabel className="block mb-3">DOCUMENT / RESUME.PDF.WEB</TechLabel>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ink uppercase">
            {settings.fullName}
          </h1>
          <p className="mt-2 font-mono text-[11px] tracking-[0.15em] uppercase text-ink2">{settings.title}</p>
          <p className="mt-1 font-mono text-[10px] tracking-[0.15em] uppercase text-ink3">
            {settings.location} {settings.contactEmail && `· ${settings.contactEmail}`}
          </p>
        </div>

        <section>
          <TechLabel className="block mb-4 text-violet">01 / PROFILE</TechLabel>
          <p className="text-sm text-ink2 leading-relaxed max-w-3xl">{settings.resumeSummary}</p>
        </section>

        {education.length > 0 && (
          <section>
            <TechLabel className="block mb-4 text-violet">02 / EDUCATION</TechLabel>
            {education.map((e) => (
              <div key={e.id} className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-display font-bold text-ink">{e.program}</p>
                  <p className="font-mono text-xs text-ink3 mt-1">{e.institution}</p>
                </div>
                <span className="font-mono text-xs text-violet">
                  {e.currentEnrolled ? `${e.startYear} — Present` : `${e.startYear} — ${e.endYear}`}
                </span>
              </div>
            ))}
          </section>
        )}

        <section>
          <TechLabel className="block mb-4 text-violet">03 / EXPERIENCE</TechLabel>
          <div className="space-y-6">
            {experience.map((e) => (
              <div key={e.id} className="border-l-2 border-line pl-5">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-display font-bold text-ink">{e.role} — {e.org}</p>
                  <span className="font-mono text-[11px] text-violet">{periodOf(e)}</span>
                </div>
                {e.description && <p className="mt-1.5 text-xs text-ink2 leading-relaxed">{e.description}</p>}
              </div>
            ))}
          </div>
        </section>

        <section>
          <TechLabel className="block mb-4 text-violet">04 / SELECTED PROJECTS</TechLabel>
          <div className="space-y-4">
            {projects.map((p) => (
              <div key={p.id} className="flex flex-wrap justify-between gap-2 border-b border-line pb-3 last:border-0">
                <div>
                  <p className="font-display font-bold text-ink text-sm">{p.title} — {p.subtitle}</p>
                  <p className="font-mono text-[10px] text-ink3 mt-1">{(p.stack || []).join(" · ")}</p>
                </div>
                <span className="font-mono text-[11px] text-ink3">{p.year}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <TechLabel className="block mb-4 text-violet">05 / TECHNICAL SKILLS</TechLabel>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-4">
            {skills.filter((s) => s.title !== "PROFESSIONAL SKILLS").map((cat) => (
              <div key={cat.id}>
                <p className="font-mono text-[10px] tracking-[0.2em] text-ink3 mb-2">{cat.title}</p>
                <p className="font-mono text-[11px] text-ink2 leading-relaxed">
                  {(cat.items || []).map((i) => i.name).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </section>

        {certifications.length > 0 && (
          <section>
            <TechLabel className="block mb-4 text-violet">06 / CERTIFICATIONS</TechLabel>
            {certifications.map((c) => (
              <div key={c.id} className="mb-4 last:mb-0">
                <p className="font-display font-bold text-ink">{c.name}</p>
                <p className="font-mono text-xs text-ink3 mt-1">{c.issuer} · {c.date}</p>
              </div>
            ))}
          </section>
        )}

        {proSkills.length > 0 && (
          <section>
            <TechLabel className="block mb-4 text-violet">07 / PROFESSIONAL SKILLS</TechLabel>
            <p className="font-mono text-[11px] text-ink2 leading-relaxed">
              {proSkills.map((s) => s.name).join(" · ")}
            </p>
          </section>
        )}
      </div>

      <Reveal className="mt-8 text-center">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink3">
          PDF is generated from this data — replaceable anytime via the admin panel
        </p>
      </Reveal>
    </div>
  );
}
