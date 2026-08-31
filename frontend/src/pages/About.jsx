import { useContent } from "../lib/content";
import useSeo from "../lib/useSeo";
import { SectionHead, TechLabel, Reveal } from "../components/system/bits";
import { Award } from "lucide-react";

export default function About() {
  const { about, education, certifications, skills } = useContent();
  useSeo("About");

  const proSkills = (skills.find((s) => s.title === "PROFESSIONAL SKILLS") || {}).items || [];
  const edu = education[0];
  const meta = [
    {
      label: "EDUCATION",
      lines: edu
        ? [edu.institution, edu.program, edu.currentEnrolled ? `${edu.startYear} — Present` : `${edu.startYear} — ${edu.endYear}`]
        : [],
    },
    { label: "FOCUS", lines: about.focusAreas || [] },
    { label: "WORK TYPE", lines: about.workTypes || [] },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-16 sm:py-24">
      <SectionHead num="01 /" title="ABOUT" />

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-ink">
              {about.statement}
              <br />
              <span className="text-violet">{about.statementAccent}</span>
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-8 space-y-5 text-sm sm:text-base text-ink2 leading-relaxed max-w-2xl">
              {(about.bio || "").split("\n\n").filter(Boolean).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </Reveal>

          <div className="mt-12 grid sm:grid-cols-3 gap-px bg-line border border-line">
            {meta.map((m, i) => (
              <Reveal key={m.label} delay={i * 0.07} className="bg-card p-5">
                <TechLabel className="block mb-3 text-violet">{m.label}</TechLabel>
                <ul className="space-y-1.5">
                  {m.lines.map((l) => (
                    <li key={l} className="font-mono text-[11px] text-ink2">{l}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <Reveal className="panel p-6">
            <TechLabel className="block mb-5">CREDENTIALS / CERTIFICATIONS</TechLabel>
            {certifications.length === 0 && (
              <p className="font-mono text-xs text-ink3">No certifications published yet.</p>
            )}
            {certifications.map((cert) => (
              <div key={cert.id} data-testid={`certification-${cert.id}`} className="mb-6 last:mb-0">
                <div className="flex items-start gap-3">
                  <Award size={18} className="text-amb shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-display text-base font-bold text-ink">{cert.name}</h3>
                    <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink3 mt-1">
                      {cert.issuer} · {cert.date}
                    </p>
                    {cert.verificationUrl && (
                      <a href={cert.verificationUrl} target="_blank" rel="noopener noreferrer"
                        className="font-mono text-[10px] text-violet hover:underline">Verify ↗</a>
                    )}
                  </div>
                </div>
                {(cert.courses || []).length > 0 && (
                  <ul className="mt-4 space-y-2 border-t border-line pt-4">
                    {cert.courses.map((c) => (
                      <li key={c} className="font-mono text-[11px] text-ink2 flex gap-2">
                        <span className="text-grn">✓</span> {c}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </Reveal>

          <Reveal className="panel p-6">
            <TechLabel className="block mb-5">STACK.SUMMARY</TechLabel>
            <div className="space-y-3">
              {skills.filter((s) => s.title !== "PROFESSIONAL SKILLS").map((cat) => (
                <div key={cat.id} className="flex items-center justify-between gap-3 border-b border-line pb-2.5 last:border-0 last:pb-0">
                  <span className="font-mono text-[10px] tracking-[0.15em] text-ink3">{cat.title}</span>
                  <span className="font-mono text-[10px] text-violet">{(cat.items || []).length} MODULES</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {proSkills.length > 0 && (
        <div className="mt-16">
          <TechLabel className="block mb-5">PROFESSIONAL SKILLS / NON-TECHNICAL</TechLabel>
          <div className="flex flex-wrap gap-2">
            {proSkills.map((s, i) => (
              <Reveal key={s.name} delay={i * 0.02} y={10}>
                <span className="inline-block px-3 py-1.5 border border-line font-mono text-[10px] tracking-[0.1em] uppercase text-ink2 hover:border-violet hover:text-violet transition-colors cursor-default">
                  {s.name}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
