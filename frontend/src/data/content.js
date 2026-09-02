export const NAV_LINKS = [
  { to: "/", label: "Home", num: "00" },
  { to: "/about", label: "About", num: "01" },
  { to: "/work", label: "Work", num: "02" },
  { to: "/services", label: "Services", num: "03" },
  { to: "/pricing", label: "Pricing", num: "04" },
  { to: "/experience", label: "Experience", num: "05" },
  { to: "/contact", label: "Contact", num: "06" },
];

export const MARQUEE_ITEMS = [
  "DESIGN IT.",
  "BUILD IT.",
  "SHIP IT.",
  "FROM DATABASE TO INTERFACE.",
  "SYSTEMS BUILT AROUND REAL WORKFLOWS.",
  "NOT JUST THE FRONTEND.",
];

export const WORK_FILTERS = ["ALL", "FULL STACK", "E-COMMERCE", "INFORMATION SYSTEMS", "UI / UX", "WORDPRESS", "EXPERIMENTS"];

export const peso = (n) => "₱" + (Math.round(n / 500) * 500).toLocaleString("en-PH");

export const periodOf = (e) =>
  e.current ? `${e.start} — Present` : e.end ? `${e.start} — ${e.end}` : e.start;
