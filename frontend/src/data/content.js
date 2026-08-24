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

export const EXPERIENCE = [
  {
    role: "Freelance Full-Stack Web Developer",
    org: "Self-Employed",
    period: "2025 — Present",
    tag: "FREELANCE",
    points: [
      "Responsive websites and database-driven web applications",
      "Laravel, Vue.js, Inertia, and MySQL systems",
      "WordPress and WooCommerce builds",
      "Authentication and role-based systems",
      "Payment gateway integrations",
      "Direct client requirements and communication",
      "Post-deployment support and iteration",
    ],
  },
  {
    role: "IT Commissioner / Full-Stack Developer",
    org: "VNL Company",
    period: "2025 — Present",
    tag: "PROJECT-BASED",
    points: ["Project-based full-stack development and technical commissioning."],
  },
  {
    role: "IT Commissioner / Full-Stack Developer",
    org: "CIM Creatives",
    period: "2026 — Present",
    tag: "PROJECT-BASED",
    points: ["Project-based full-stack development and technical commissioning."],
  },
  {
    role: "Customer Support / Cold Caller",
    org: "Capital Group",
    period: "Nov 2024 — Jun 2025",
    tag: "COMMUNICATION",
    points: [
      "Client communication and outbound sales",
      "CRM documentation and record accuracy",
      "Adaptability across shifting campaigns and requirements",
    ],
  },
];

export const JOURNEY = [
  { hash: "a3f9c21", year: "2023", title: "INITIALIZED", desc: "BS Information Technology — Central Luzon State University.", branch: "main" },
  { hash: "7b2e8d4", year: "2024", title: "CUSTOMER_COMMUNICATION", desc: "Customer support and outbound sales — Capital Group. Learned how clients actually talk about problems.", branch: "main" },
  { hash: "e51c0f9", year: "2025", title: "FULL_STACK_MODE = TRUE", desc: "Started freelance full-stack development. First client systems shipped. VNL Company.", branch: "main" },
  { hash: "9d4a7b2", year: "2026", title: "SYSTEMS / COMMERCE / UI", desc: "StudYA · SoilTrack · Camela · IoT Operations Platform. CIM Creatives. Google Agile Essentials.", branch: "main" },
  { hash: "HEAD", year: "NOW", title: "BUILDING / LEARNING / SHIPPING", desc: "Available for select projects.", branch: "main" },
];

export const STACK = [
  {
    category: "FRONTEND",
    items: [
      { name: "HTML", level: "CORE" },
      { name: "CSS", level: "CORE" },
      { name: "JavaScript", level: "CORE" },
      { name: "Vue.js", level: "CORE" },
      { name: "Inertia.js", level: "CORE" },
      { name: "React", level: "WORKING KNOWLEDGE" },
      { name: "TypeScript", level: "LEARNING" },
    ],
  },
  {
    category: "BACKEND",
    items: [
      { name: "PHP", level: "CORE" },
      { name: "Laravel", level: "CORE" },
      { name: "Python", level: "WORKING KNOWLEDGE" },
      { name: "Django", level: "WORKING KNOWLEDGE" },
      { name: "Java", level: "WORKING KNOWLEDGE" },
    ],
  },
  {
    category: "DATABASE",
    items: [
      { name: "MySQL", level: "CORE" },
      { name: "Relational Database Design", level: "CORE" },
      { name: "Database Management", level: "EXPERIENCE" },
    ],
  },
  {
    category: "CMS / E-COMMERCE",
    items: [
      { name: "WordPress", level: "EXPERIENCE" },
      { name: "WooCommerce", level: "EXPERIENCE" },
      { name: "Elementor", level: "EXPERIENCE" },
    ],
  },
  {
    category: "DESIGN",
    items: [
      { name: "Figma", level: "CORE" },
      { name: "UI/UX", level: "CORE" },
      { name: "Prototyping", level: "EXPERIENCE" },
      { name: "Graphic Design", level: "EXPERIENCE" },
      { name: "Draw.io", level: "EXPERIENCE" },
    ],
  },
  {
    category: "WORKFLOW",
    items: [
      { name: "Git", level: "CORE" },
      { name: "GitHub", level: "CORE" },
      { name: "REST APIs", level: "CORE" },
      { name: "Agile", level: "WORKING KNOWLEDGE" },
      { name: "Scrum", level: "WORKING KNOWLEDGE" },
      { name: "System Documentation", level: "EXPERIENCE" },
      { name: "Testing", level: "EXPERIENCE" },
    ],
  },
];

export const CERTIFICATIONS = [
  {
    title: "Google Agile Essentials Specialization",
    org: "Coursera × Google",
    date: "July 2026",
    courses: [
      "Foundations of Agile Project Management",
      "Implement the Scrum Framework",
      "Organize Projects and Measure Productivity with Scrum",
    ],
  },
];

export const PRO_SKILLS = [
  "Written & Verbal Communication", "Customer Service", "Problem Solving", "Attention to Detail",
  "Organization", "Time Management", "Multitasking", "Adaptability", "Collaboration",
  "Independent Work", "Critical Thinking", "Documentation", "Technical Writing", "Research", "Troubleshooting",
];

export const PROCESS = [
  { num: "01", title: "DISCOVERY", items: ["Requirements", "Business Problem", "Scope"] },
  { num: "02", title: "SYSTEM DESIGN", items: ["Architecture", "Database", "User Flows", "UI / UX"] },
  { num: "03", title: "BUILD", items: ["Frontend", "Backend", "Integration"] },
  { num: "04", title: "VALIDATE", items: ["Testing", "Debugging", "Responsive Review"] },
  { num: "05", title: "SHIP", items: ["Deployment", "Documentation", "Handover"] },
  { num: "06", title: "SUPPORT", items: ["Maintenance", "Improvements", "Future Iterations"] },
];

export const BUDGET_OPTIONS = ["Below ₱10K", "₱10K–₱25K", "₱25K–₱50K", "₱50K–₱100K", "₱100K+", "Not sure yet"];

export const PROJECT_TYPES = [
  "Full-Stack Web Development",
  "UI/UX & Product Design",
  "E-Commerce Development",
  "Backend, API & Database",
  "Business / Information System",
  "WordPress / CMS",
  "Development Support",
  "Something else",
];

export const ESTIMATOR = {
  types: [
    { id: "website", label: "Website", base: 8000 },
    { id: "ecommerce", label: "E-Commerce", base: 25000 },
    { id: "webapp", label: "Web Application", base: 20000 },
    { id: "system", label: "Information System", base: 30000 },
    { id: "uiux", label: "UI/UX", base: 5000 },
    { id: "existing", label: "Existing System Work", base: 3000 },
  ],
  features: [
    { id: "auth", label: "Authentication", add: 3000 },
    { id: "admin", label: "Admin Dashboard", add: 4000 },
    { id: "database", label: "Database", add: 4000 },
    { id: "commerce", label: "E-Commerce", add: 8000 },
    { id: "payments", label: "Payment Gateway", add: 5000 },
    { id: "api", label: "API", add: 4000 },
    { id: "roles", label: "Role Management", add: 3000 },
    { id: "reporting", label: "Reporting", add: 3000 },
    { id: "email", label: "Email", add: 1500 },
    { id: "sms", label: "SMS", add: 2500 },
    { id: "upload", label: "File Upload", add: 1500 },
    { id: "qr", label: "QR", add: 3000 },
    { id: "search", label: "Advanced Search", add: 2500 },
  ],
  design: [
    { id: "existing", label: "Existing design", mult: 1 },
    { id: "template", label: "Template customization", mult: 1.1 },
    { id: "custom", label: "Custom UI/UX", mult: 1.35 },
  ],
  timeline: [
    { id: "flexible", label: "Flexible", mult: 1 },
    { id: "standard", label: "Standard", mult: 1.1 },
    { id: "priority", label: "Priority", mult: 1.3 },
  ],
};

export const peso = (n) => "₱" + (Math.round(n / 500) * 500).toLocaleString("en-PH");
