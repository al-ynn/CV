import { motion } from "framer-motion";
import { TechLabel, StatusDot } from "../system/bits";
import {
  AccentText, Photo, photosOf, photoByRole, renderSections, renderOnly,
  IntroSection, StorySection, SpecializationsSection, CareerGoalSection, StatsSection,
} from "./AboutSections";

const ChapterHead = ({ num, title, sub }) => (
  <div className="flex items-center gap-4 mb-8">
    <span className="font-mono text-[11px] tracking-[0.3em] text-violet">{num}</span>
    <span className="h-px flex-1 bg-gradient-to-r from-violet/60 via-line to-transparent" />
    <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-ink">{title}</span>
    {sub && <TechLabel>{sub}</TechLabel>}
  </div>
);

const ChapterDivider = () => (
  <div className="flex justify-center py-2">
    <div className="relative w-40">
      <div className="hr-gradient" />
      <span className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 rounded-full bg-violet/40 blur-sm" />
      <span className="absolute left-1/2 -translate-x-1/2 -top-0.5 w-1 h-1 rounded-full bg-violet" />
    </div>
  </div>
);

// ---------- Ambient wrapper — soft aurora + accent orbs for every About template ----------

function AboutAmbient({ children, variant = "default" }) {
  const orbs = {
    default: [
      { cls: "orb-violet orb-float-a", style: { width: "24rem", height: "24rem", top: "-6rem", left: "-6rem" } },
      { cls: "orb-cyan orb-float-b hidden md:block",   style: { width: "20rem", height: "20rem", top: "30rem", right: "-6rem" } },
      { cls: "orb-pink orb-float-c hidden lg:block",   style: { width: "16rem", height: "16rem", bottom: "20%", left: "45%" } },
    ],
    story: [
      { cls: "orb-violet orb-float-a", style: { width: "22rem", height: "22rem", top: "8rem", left: "-6rem" } },
      { cls: "orb-amber orb-float-c hidden md:block",  style: { width: "18rem", height: "18rem", top: "60%", right: "-4rem" } },
      { cls: "orb-cyan orb-float-b hidden lg:block",   style: { width: "14rem", height: "14rem", bottom: "10%", left: "20%" } },
    ],
    editorial: [
      { cls: "orb-cyan orb-float-a", style: { width: "26rem", height: "26rem", top: "-4rem", right: "-6rem" } },
      { cls: "orb-violet orb-float-b hidden md:block",   style: { width: "20rem", height: "20rem", top: "50%", left: "-6rem" } },
      { cls: "orb-pink orb-float-c hidden lg:block",     style: { width: "14rem", height: "14rem", bottom: "-4rem", right: "20%" } },
    ],
    system: [
      { cls: "orb-violet orb-float-a", style: { width: "24rem", height: "24rem", top: "-6rem", left: "-6rem" } },
      { cls: "orb-cyan orb-float-b hidden md:block",   style: { width: "22rem", height: "22rem", top: "40%", right: "-6rem" } },
    ],
  };
  const chosen = orbs[variant] || orbs.default;
  return (
    <div className="relative bg-aurora-soft bg-dots overflow-hidden">
      {chosen.map((o, i) => (
        <span key={i} aria-hidden="true" className={`orb ${o.cls}`} style={o.style} />
      ))}
      <div className="relative">{children}</div>
    </div>
  );
}

// ---------- TEMPLATE 01 — PROFILE (1 photo, restrained) ----------

function ProfileTemplate({ profile, ctx }) {
  const portrait = photoByRole(profile, "Professional Portrait", 0);
  return (
    <AboutAmbient variant="default">
    <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-16 sm:py-24 space-y-20">
      <section className="grid lg:grid-cols-12 gap-12 items-center">
        {portrait && (
          <div className="lg:col-span-5">
            <Photo photo={portrait} ratio="aspect-[4/5]" eager />
          </div>
        )}
        <div className={portrait ? "lg:col-span-7" : "lg:col-span-12 max-w-3xl"}>
          <TechLabel className="block mb-5 text-violet">PROFILE / 01</TechLabel>
          <h1 className="font-display font-extrabold tracking-tight leading-[0.95] text-5xl sm:text-6xl text-ink">
            ALEANA<br /><span className="gradient-text">AMURAO</span>
          </h1>
          <p className="mt-5 font-mono text-xs tracking-[0.2em] uppercase text-ink2 leading-loose">
            Full-Stack &<br />Systems Developer
          </p>
          <div className="mt-7 space-y-2 font-mono text-[10px] tracking-[0.2em] uppercase text-ink3">
            <p>Working Student · Freelance Developer</p>
            <p>{ctx.settings?.location || "Philippines"}</p>
            <p className="flex items-center gap-2"><StatusDot /> {ctx.settings?.available ? "Available for select projects" : "Limited availability"}</p>
          </div>
        </div>
      </section>
      {renderSections(profile, ctx)}
    </div>
    </AboutAmbient>
  );
}

// ---------- TEMPLATE 02 — DUAL FRAME (2 photos) ----------

function DualFrameTemplate({ profile, ctx }) {
  const portrait = photoByRole(profile, "Professional Portrait", 0);
  const workspace = photoByRole(profile, "Workspace", 1);
  return (
    <AboutAmbient variant="default">
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-16 sm:py-24 space-y-24">
      <section>
        <ChapterHead num="01" title="WHO I AM" />
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5"><Photo photo={portrait} ratio="aspect-[3/4]" eager /></div>
          <div className="lg:col-span-7"><IntroSection profile={profile} /></div>
        </div>
      </section>

      <ChapterDivider />

      <section>
        <ChapterHead num="02" title="WHAT I BUILD" />
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-14">
            {renderSections(profile, ctx, { skip: ["intro", "careerGoal", "openTo", "story", "resumeCta", "contactCta"] })}
          </div>
          <div className="lg:col-span-5"><Photo photo={workspace} ratio="aspect-[4/5]" /></div>
        </div>
      </section>

      <ChapterDivider />

      <section>
        <ChapterHead num="03" title="WHERE I'M GOING" />
        <div className="space-y-14 max-w-4xl">
          <StorySection profile={profile} compact />
          {renderOnly(profile, ctx, ["careerGoal", "openTo", "resumeCta", "contactCta"])}
        </div>
      </section>
    </div>
    </AboutAmbient>
  );
}

// ---------- TEMPLATE 03 — STORY (3 photos, narrative) ----------

function StoryTemplate({ profile, ctx }) {
  const portrait = photoByRole(profile, "Professional Portrait", 0);
  const sports = photoByRole(profile, "Sports", 1);
  const workspace = photoByRole(profile, "Workspace", 2) || photoByRole(profile, "Coding", 2);
  const s = profile.story || {};
  const beats = [
    ["ATHLETE", s.beforeTheCode, sports],
    ["STUDENT", s.theShift, portrait],
    ["DEVELOPER", [s.firstSystem, s.choosingThePath].filter(Boolean).join("\n\n"), workspace],
    ["BUILDING FORWARD", [s.today, s.theGoal].filter(Boolean).join("\n\n"), null],
  ];
  return (
    <AboutAmbient variant="story">
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-16 sm:py-24 space-y-24">
      <section className="max-w-3xl"><IntroSection profile={profile} /></section>

      {beats.map(([label, body, photo], i) =>
        body ? (
          <section key={label}>
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              <div className={`lg:col-span-7 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                <div className="flex items-center gap-4 mb-5">
                  <span className="font-mono text-[11px] tracking-[0.3em] text-violet">{String(i + 1).padStart(2, "0")}</span>
                  <span className="h-px flex-1 bg-gradient-to-r from-violet/60 via-line to-transparent" />
                </div>
                <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-ink mb-6"><span className="gradient-text-cool">{label}</span></h2>
                <p className="text-sm sm:text-base text-ink2 leading-relaxed whitespace-pre-line">{body}</p>
              </div>
              {photo && (
                <div className={`lg:col-span-5 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  <Photo photo={photo} ratio="aspect-[4/3]" />
                </div>
              )}
            </div>
            {i < beats.length - 1 && <ChapterDivider />}
          </section>
        ) : null
      )}

      <section className="space-y-16">
        {renderSections(profile, ctx, { skip: ["intro", "story"] })}
      </section>
    </div>
    </AboutAmbient>
  );
}

// ---------- TEMPLATE 04 — SYSTEM PROFILE (4 photos, technical motif) ----------

function SystemProfileTemplate({ profile, ctx }) {
  const photos = photosOf(profile);
  const s = ctx.settings || {};
  const stats = ctx.stats || {};
  const readout = [
    ["ID", "ALEANA_AMURAO"],
    ["ROLE", "FULL_STACK_SYSTEMS_DEVELOPER"],
    ["STATUS", "WORKING_STUDENT"],
    ["CURRENT_MODE", "BUILDING EXPERIENCE"],
    ["TARGET", "SENIOR_FULL_STACK_&_SYSTEMS_DEVELOPER"],
    ["AVAILABILITY", (s.availability || "available").toUpperCase()],
  ];
  return (
    <AboutAmbient variant="system">
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-16 sm:py-24 space-y-20">
      <section className="panel scan-line relative">
        <div className="flex items-center justify-between px-5 py-3 border-b border-line">
          <span className="font-mono text-[10px] tracking-[0.25em] text-violet">PERSON_PROFILE</span>
          <StatusDot />
        </div>
        <div className="grid lg:grid-cols-12">
          <div className={`${photos.length ? "lg:col-span-7 border-b lg:border-b-0 lg:border-r" : "lg:col-span-12"} p-6 sm:p-10 border-line`}>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
              {readout.map(([k, v], i) => (
                <motion.div key={k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.45 }}>
                  <TechLabel className="block mb-1.5">{k}</TechLabel>
                  <span className="font-mono text-xs sm:text-sm text-ink break-words">{v}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-10">
              <IntroSection profile={profile} />
            </div>
          </div>
          {photos.length > 0 && (
            <div className="lg:col-span-5 p-6 sm:p-10">
              <div className="grid grid-cols-2 gap-3">
                {photos.slice(0, 4).map((photo, i) => (
                  <Photo key={i} photo={photo} ratio="aspect-square" eager={i === 0} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section><StatsSection profile={profile} ctx={ctx} /></section>
      <section className="space-y-16">{renderSections(profile, ctx, { skip: ["intro", "stats"] })}</section>
      <p className="font-mono text-[9px] tracking-[0.25em] text-ink3 uppercase">
        // counts derived live from the portfolio database — {stats.projects ?? 0} projects, {stats.technologies ?? 0} technologies, {stats.certifications ?? 0} certifications
      </p>
    </div>
    </AboutAmbient>
  );
}

// ---------- TEMPLATE 05 — EDITORIAL JOURNEY (5–8 photos) ----------

function EditorialJourneyTemplate({ profile, ctx }) {
  const photos = photosOf(profile);
  const chapters = [
    ["CHAPTER 01", "THE START", null],
    ["CHAPTER 02", "ATHLETE", profile.story?.beforeTheCode],
    ["CHAPTER 03", "THE SHIFT", profile.story?.theShift],
    ["CHAPTER 04", "BUILDING EXPERIENCE", [profile.story?.firstSystem, profile.story?.choosingThePath].filter(Boolean).join("\n\n")],
    ["CHAPTER 05", "SYSTEMS", null],
    ["CHAPTER 06", "WHAT'S NEXT", [profile.story?.today, profile.story?.theGoal].filter(Boolean).join("\n\n")],
  ];
  let photoIdx = 0;
  const nextPhoto = () => (photos.length ? photos[photoIdx++ % photos.length] : null);

  return (
    <AboutAmbient variant="editorial">
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-16 sm:py-24 space-y-28">
      <section className="grid lg:grid-cols-12 gap-12 items-end">
        <div className="lg:col-span-8"><IntroSection profile={profile} /></div>
        <div className="lg:col-span-4"><Photo photo={nextPhoto()} ratio="aspect-[3/4]" eager /></div>
      </section>

      {chapters.slice(1).map(([num, title, body], i) => {
        const photo = nextPhoto();
        return (
          <section key={num}>
            <ChapterHead num={num} title={title} />
            <div className={`grid lg:grid-cols-12 gap-10 ${i % 2 === 0 ? "" : ""}`}>
              {photo && i % 2 === 0 && (
                <div className="lg:col-span-5"><Photo photo={photo} ratio={i % 3 === 0 ? "aspect-[4/3]" : "aspect-square"} /></div>
              )}
              <div className={photo ? "lg:col-span-7" : "lg:col-span-12 max-w-3xl"}>
                {title === "SYSTEMS" ? (
                  <div className="space-y-14">
                    <SpecializationsSection profile={profile} ctx={ctx} />
                    <StatsSection profile={profile} ctx={ctx} />
                  </div>
                ) : (
                  body && <p className="text-sm sm:text-base text-ink2 leading-relaxed whitespace-pre-line">{body}</p>
                )}
              </div>
              {photo && i % 2 === 1 && (
                <div className="lg:col-span-5"><Photo photo={photo} ratio="aspect-[4/3]" /></div>
              )}
            </div>
          </section>
        );
      })}

      {photos.length > 4 && (
        <section>
          <TechLabel className="block mb-5">FIELD_NOTES / GALLERY</TechLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {photos.slice(0, 8).map((p, i) => (
              <Photo key={i} photo={p} ratio="aspect-square" />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-16">
        {renderSections(profile, ctx, { skip: ["intro", "story", "specializations", "stats"] })}
      </section>
    </div>
    </AboutAmbient>
  );
}

const TEMPLATES = { 1: ProfileTemplate, 2: DualFrameTemplate, 3: StoryTemplate, 4: SystemProfileTemplate, 5: EditorialJourneyTemplate };

export default function TemplateRenderer({ profile, ctx }) {
  const T = TEMPLATES[profile.template] || SystemProfileTemplate;
  return (
    <motion.div key={profile.id + String(profile.template)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <T profile={profile} ctx={ctx} />
    </motion.div>
  );
}
