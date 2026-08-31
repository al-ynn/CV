export const ABOUT_TEMPLATES = [
  { id: 1, name: "PROFILE", photos: 1, photoLabel: "1", best: "Recruiters · clean CV-style" },
  { id: 2, name: "DUAL FRAME", photos: 2, photoLabel: "2", best: "Person + developer contrast" },
  { id: 3, name: "STORY", photos: 3, photoLabel: "3", best: "Narrative — athlete to developer" },
  { id: 4, name: "SYSTEM PROFILE", photos: 4, photoLabel: "4", best: "Technical interface motif" },
  { id: 5, name: "EDITORIAL JOURNEY", photos: 6, photoLabel: "5–8", best: "Long-form personal story" },
];

export const PHOTO_ROLES = ["Professional Portrait", "Workspace", "Coding", "Project", "Education", "Sports", "Lifestyle", "Personal", "Other"];

export const BUILTIN_SECTIONS = [
  "intro", "story", "workingStudent", "howIWork", "principles", "specializations", "beyondCode",
  "offClock", "interests", "careerGoal", "openTo", "stats", "currentFocus", "education",
  "experience", "projects", "certifications", "resumeCta", "contactCta", "sportDevMap",
];

export const SECTION_NAMES = {
  intro: "Introduction / Bio", story: "My Story", workingStudent: "Working Student",
  howIWork: "How I Work", principles: "Principles", specializations: "Specializations",
  beyondCode: "Beyond Code", offClock: "Sports & Gaming", interests: "Interests",
  careerGoal: "Career Goal", openTo: "Open To", stats: "Statistics", currentFocus: "Current Focus",
  education: "Education", experience: "Experience", projects: "Projects Highlight",
  certifications: "Certifications", resumeCta: "Resume CTA", contactCta: "Contact CTA",
  sportDevMap: "Sport → Development Map",
};

export const CUSTOM_BLOCK_TYPES = ["text", "quote", "cards", "timeline", "gallery", "cta"];

export const STATUS_BADGE = {
  published: "border-grn/40 text-grn",
  draft: "border-amb/40 text-amb",
  archived: "border-line text-ink3",
  trash: "border-pk/40 text-pk",
};

export const timeAgo = (iso) => {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hours ago`;
  return new Date(iso).toLocaleDateString();
};
