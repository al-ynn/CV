export const NAV_LINKS = [
  { to: "/about", label: "About", num: "01" },
  { to: "/work", label: "Work", num: "02" },
  { to: "/services", label: "Services", num: "03" },
  { to: "/pricing", label: "Pricing", num: "04" },
  { to: "/journey", label: "Journey", num: "05" },
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

export const PROCESS = [
  { num: "01", title: "DISCOVERY", items: ["Requirements", "Business Problem", "Scope"] },
  { num: "02", title: "SYSTEM DESIGN", items: ["Architecture", "Database", "User Flows", "UI / UX"] },
  { num: "03", title: "BUILD", items: ["Frontend", "Backend", "Integration"] },
  { num: "04", title: "VALIDATE", items: ["Testing", "Debugging", "Responsive Review"] },
  { num: "05", title: "SHIP", items: ["Deployment", "Documentation", "Handover"] },
  { num: "06", title: "SUPPORT", items: ["Maintenance", "Improvements", "Future Iterations"] },
];

export const WHAT_I_BUILD = [
  { num: "01", title: "WEB APPLICATIONS", desc: "Database-driven applications with real business logic — not page collections." },
  { num: "02", title: "E-COMMERCE", desc: "Storefronts with cart, checkout, orders, inventory, and payment integration." },
  { num: "03", title: "INFORMATION SYSTEMS", desc: "Internal systems that digitize how organizations actually operate." },
  { num: "04", title: "INTERFACES", desc: "UI/UX designed around user flows, then built pixel-accurate." },
];

export const peso = (n) => "₱" + (Math.round(n / 500) * 500).toLocaleString("en-PH");

export const periodOf = (e) =>
  e.current ? `${e.start} — Present` : e.end ? `${e.start} — ${e.end}` : e.start;
