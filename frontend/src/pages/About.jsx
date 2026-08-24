import { SectionHead, TechLabel, Reveal, LevelTag } from "../components/system/bits";
import { PRO_SKILLS, CERTIFICATIONS, STACK } from "../data/content";
import { Award } from "lucide-react";

const META = [
  { label: "EDUCATION", lines: ["Central Luzon State University", "BS Information Technology", "2023 — Present"] },
  { label: "FOCUS", lines: ["Full-Stack Development", "Systems Development", "UI/UX", "Business Applications"] },
  { label: "WORK TYPE", lines: ["Freelance", "Project-Based", "Remote / Hybrid"] },
];

export default function About() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-16 sm:py-24">
      <SectionHead num="01 /" title="ABOUT" />

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-ink">
              Development is not just writing code.
              <br />
              <span className="text-violet">It's understanding the system behind the problem.</span>
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-8 space-y-5 text-sm sm:text-base text-ink2 leading-relaxed max-w-2xl">
              <p>
                I'm Aleana Rose C. Amurao — a BS Information Technology student at Central Luzon State
                University, and a working freelance full-stack developer. I complete my degree during the
                day and ship real systems the rest of the time.
              </p>
              <p>
                I've developed e-commerce platforms, laboratory information systems, operations platforms,
                APIs, databases, administrative dashboards, and client-facing websites — working directly
                with clients from requirements through deployment, documentation, and post-launch support.
              </p>
              <p>
                Being a working student isn't a limitation of this profile — it's the point of it.
                Everything here was built while studying: real deadlines, real stakeholders, real systems.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid sm:grid-cols-3 gap-px bg-line border border-line">
            {META.map((m, i) => (
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
            {CERTIFICATIONS.map((cert) => (
              <div key={cert.title} data-testid="certification-card">
                <div className="flex items-start gap-3">
                  <Award size={18} className="text-amb shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-display text-base font-bold text-ink">{cert.title}</h3>
                    <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink3 mt-1">
                      {cert.org} · {cert.date}
                    </p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 border-t border-line pt-4">
                  {cert.courses.map((c) => (
                    <li key={c} className="font-mono text-[11px] text-ink2 flex gap-2">
                      <span className="text-grn">✓</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Reveal>

          <Reveal className="panel p-6">
            <TechLabel className="block mb-5">STACK.SUMMARY</TechLabel>
            <div className="space-y-3">
              {STACK.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between gap-3 border-b border-line pb-2.5 last:border-0 last:pb-0">
                  <span className="font-mono text-[10px] tracking-[0.15em] text-ink3">{cat.category}</span>
                  <span className="font-mono text-[10px] text-violet">{cat.items.length} MODULES</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <div className="mt-16">
        <TechLabel className="block mb-5">PROFESSIONAL SKILLS / NON-TECHNICAL</TechLabel>
        <div className="flex flex-wrap gap-2">
          {PRO_SKILLS.map((s, i) => (
            <Reveal key={s} delay={i * 0.02} y={10}>
              <span className="inline-block px-3 py-1.5 border border-line font-mono text-[10px] tracking-[0.1em] uppercase text-ink2 hover:border-violet hover:text-violet transition-colors cursor-default">
                {s}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
