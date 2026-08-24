import { useEffect, useState } from "react";
import api, { formatApiError } from "../lib/api";
import { Trash2, Plus, Save, X } from "lucide-react";

const Head = ({ title, sub }) => (
  <div className="mb-8">
    <span className="font-mono text-[10px] tracking-[0.3em] text-violet">ADMIN / {title}</span>
    <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
    {sub && <p className="mt-2 text-sm text-ink2">{sub}</p>}
  </div>
);

const Msg = ({ msg }) =>
  msg ? (
    <p className={`mt-3 font-mono text-xs ${msg.startsWith("✓") ? "text-grn" : "text-pk"}`} data-testid="admin-msg">{msg}</p>
  ) : null;

const In = ({ label, ...props }) => (
  <div>
    <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-1.5">{label}</label>
    <input {...props} className="w-full h-10 px-3 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none" />
  </div>
);

const Ta = ({ label, rows = 3, ...props }) => (
  <div>
    <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-1.5">{label}</label>
    <textarea rows={rows} {...props} className="w-full px-3 py-2 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none resize-y" />
  </div>
);

// ---------- OVERVIEW ----------

export function Overview({ setTab }) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data)).catch(() => {});
  }, []);
  const cells = stats
    ? [
        { k: "INQUIRIES.NEW", v: stats.inquiries_new, tab: "inquiries", c: "var(--pink)" },
        { k: "INQUIRIES.TOTAL", v: stats.inquiries_total, tab: "inquiries", c: "var(--violet)" },
        { k: "PROJECTS", v: stats.projects, tab: "projects", c: "var(--cyan)" },
        { k: "SERVICES", v: stats.services, tab: "services", c: "var(--amber)" },
        { k: "PRICE PACKAGES", v: stats.packages, tab: "pricing", c: "var(--green)" },
      ]
    : [];
  return (
    <div data-testid="admin-overview">
      <Head title="OVERVIEW" sub="System metrics for the portfolio." />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-line border border-line">
        {cells.map((c) => (
          <button key={c.k} onClick={() => setTab(c.tab)} data-testid={`stat-${c.k.toLowerCase()}`}
            className="bg-card p-5 text-left hover:bg-canvas2/60 transition-colors">
            <span className="block font-mono text-[9px] tracking-[0.2em] text-ink3 mb-2">{c.k}</span>
            <span className="font-mono text-3xl font-bold tabular-nums" style={{ color: c.c }}>{c.v}</span>
          </button>
        ))}
      </div>
      {!stats && <p className="font-mono text-xs text-ink3 animate-blink">LOADING METRICS…</p>}
    </div>
  );
}

// ---------- INQUIRIES ----------

export function Inquiries() {
  const [items, setItems] = useState(null);
  const [openId, setOpenId] = useState(null);

  const load = () => api.get("/admin/inquiries").then(({ data }) => setItems(data)).catch(() => setItems([]));
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    await api.patch(`/admin/inquiries/${id}`, { status });
    load();
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this inquiry?")) return;
    await api.delete(`/admin/inquiries/${id}`);
    load();
  };

  return (
    <div data-testid="admin-inquiries">
      <Head title="INQUIRIES" sub="Messages from the contact system." />
      {!items ? (
        <p className="font-mono text-xs text-ink3 animate-blink">LOADING…</p>
      ) : items.length === 0 ? (
        <div className="panel p-10 text-center font-mono text-xs text-ink3">INBOX EMPTY — 0 RECORDS</div>
      ) : (
        <div className="space-y-3">
          {items.map((q) => (
            <div key={q.id} className="panel">
              <button data-testid={`inquiry-${q.id}`} onClick={() => setOpenId(openId === q.id ? null : q.id)}
                className="w-full flex flex-wrap items-center gap-4 px-5 py-4 text-left">
                <span className={`font-mono text-[9px] tracking-[0.2em] px-2 py-0.5 border ${q.status === "NEW" ? "text-pk border-pk/40" : "text-ink3 border-line"}`}>
                  {q.status}
                </span>
                <span className="font-display font-bold text-sm text-ink">{q.name}</span>
                <span className="font-mono text-[10px] text-ink3">{q.projectType || "—"}</span>
                <span className="ml-auto font-mono text-[10px] text-ink3">{new Date(q.created_at).toLocaleDateString()}</span>
              </button>
              {openId === q.id && (
                <div className="px-5 pb-5 border-t border-line pt-4 space-y-3 font-mono text-xs">
                  <div className="grid sm:grid-cols-3 gap-3 text-ink2">
                    <span>EMAIL: {q.email}</span>
                    <span>ORG: {q.company || "—"}</span>
                    <span>BUDGET: {q.budget || "—"}</span>
                    <span>TIMELINE: {q.timeline || "—"}</span>
                    {q.brief?.range && <span>ESTIMATE: {q.brief.range}</span>}
                  </div>
                  <p className="text-ink2 whitespace-pre-wrap leading-relaxed border border-line bg-canvas p-4">{q.message}</p>
                  <div className="flex gap-3">
                    <a href={`mailto:${q.email}`} className="px-4 h-9 inline-flex items-center bg-violet font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--bg)" }}>
                      Reply ↗
                    </a>
                    {q.status === "NEW" && (
                      <button onClick={() => setStatus(q.id, "READ")} className="px-4 h-9 border border-line font-mono text-[10px] tracking-[0.2em] uppercase text-ink2 hover:border-violet">
                        Mark Read
                      </button>
                    )}
                    <button onClick={() => setStatus(q.id, q.status === "ARCHIVED" ? "READ" : "ARCHIVED")} className="px-4 h-9 border border-line font-mono text-[10px] tracking-[0.2em] uppercase text-ink2 hover:border-violet">
                      {q.status === "ARCHIVED" ? "Unarchive" : "Archive"}
                    </button>
                    <button onClick={() => remove(q.id)} className="px-4 h-9 border border-line font-mono text-[10px] tracking-[0.2em] uppercase text-pk hover:border-pk">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- PROJECTS ----------

const EMPTY_PROJECT = {
  slug: "", title: "", subtitle: "", year: "2026", categories: [], type: "", role: "Full-Stack Developer",
  disclosure: "PUBLIC", featured: false, order: 99, stack: [], features: [], description: "", architecture: [],
  caseStudy: { overview: "", problem: "", role: "", process: "", challenges: "", solutions: "", result: "", learned: "" },
};
const CS_KEYS = ["overview", "problem", "role", "process", "challenges", "solutions", "result", "learned"];
const csv = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);

function ProjectForm({ initial, onSave, onCancel }) {
  const [p, setP] = useState(() => ({
    ...initial,
    categories: initial.categories.join(", "),
    stack: initial.stack.join(", "),
    features: initial.features.join(", "),
    architecture: (initial.architecture || []).join(", "),
    caseStudy: { ...EMPTY_PROJECT.caseStudy, ...initial.caseStudy },
  }));
  const [msg, setMsg] = useState("");
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value });
  const setCs = (k) => (e) => setP({ ...p, caseStudy: { ...p.caseStudy, [k]: e.target.value } });

  const save = async () => {
    try {
      const doc = {
        ...p,
        categories: csv(p.categories), stack: csv(p.stack), features: csv(p.features),
        architecture: csv(p.architecture), order: Number(p.order) || 99,
        slug: p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      };
      await onSave(doc);
    } catch (err) {
      setMsg(formatApiError(err.response?.data?.detail));
    }
  };

  return (
    <div className="panel p-6 space-y-4" data-testid="project-form">
      <div className="grid sm:grid-cols-3 gap-4">
        <In label="Title *" data-testid="pf-title" value={p.title} onChange={set("title")} />
        <In label="Subtitle" value={p.subtitle} onChange={set("subtitle")} />
        <In label="Slug" value={p.slug} onChange={set("slug")} placeholder="auto-from-title" />
        <In label="Year" value={p.year} onChange={set("year")} />
        <In label="Type" value={p.type} onChange={set("type")} placeholder="Full-Stack Development" />
        <In label="Role" value={p.role} onChange={set("role")} />
        <In label="Order" type="number" value={p.order} onChange={set("order")} />
        <div>
          <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-1.5">Disclosure</label>
          <select value={p.disclosure} onChange={set("disclosure")} data-testid="pf-disclosure"
            className="w-full h-10 px-3 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none">
            <option>PUBLIC</option>
            <option>LIMITED DISCLOSURE</option>
            <option>PRIVATE / NDA</option>
          </select>
        </div>
        <label className="flex items-end gap-2 pb-2 font-mono text-[10px] tracking-[0.2em] uppercase text-ink3">
          <input type="checkbox" checked={p.featured} onChange={(e) => setP({ ...p, featured: e.target.checked })} data-testid="pf-featured" />
          Featured
        </label>
      </div>
      <In label="Categories (comma: FULL STACK, E-COMMERCE, INFORMATION SYSTEMS, UI / UX, WORDPRESS, EXPERIMENTS)" value={p.categories} onChange={set("categories")} />
      <In label="Stack (comma)" value={p.stack} onChange={set("stack")} />
      <In label="Features (comma)" value={p.features} onChange={set("features")} />
      <In label="Architecture nodes (comma)" value={p.architecture} onChange={set("architecture")} />
      <Ta label="Description" value={p.description} onChange={set("description")} />
      <div className="border-t border-line pt-4 grid sm:grid-cols-2 gap-4">
        {CS_KEYS.map((k) => (
          <Ta key={k} label={`Case Study: ${k}`} rows={2} value={p.caseStudy[k] || ""} onChange={setCs(k)} />
        ))}
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={save} data-testid="pf-save" className="h-10 px-6 bg-violet font-mono text-[10px] tracking-[0.2em] uppercase font-semibold inline-flex items-center gap-2" style={{ color: "var(--bg)" }}>
          <Save size={13} /> Save
        </button>
        <button onClick={onCancel} className="h-10 px-6 border border-line font-mono text-[10px] tracking-[0.2em] uppercase text-ink2 inline-flex items-center gap-2">
          <X size={13} /> Cancel
        </button>
      </div>
      <Msg msg={msg} />
    </div>
  );
}

export function ProjectsPanel() {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null); // project | 'new' | null
  const [msg, setMsg] = useState("");

  const load = () => api.get("/admin/projects").then(({ data }) => setItems(data));
  useEffect(() => { load().catch(() => setItems([])); }, []);

  const save = async (doc) => {
    if (editing === "new") {
      await api.post("/admin/projects", doc);
    } else {
      await api.put(`/admin/projects/${editing.id}`, doc);
    }
    setEditing(null);
    setMsg("✓ Saved");
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this project record?")) return;
    await api.delete(`/admin/projects/${id}`);
    load();
  };

  return (
    <div data-testid="admin-projects">
      <Head title="PROJECTS" sub="Add, edit, or remove project records. Changes go live immediately." />
      {editing ? (
        <ProjectForm
          initial={editing === "new" ? EMPTY_PROJECT : editing}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <>
          <button onClick={() => setEditing("new")} data-testid="project-new"
            className="mb-6 h-10 px-5 bg-violet font-mono text-[10px] tracking-[0.2em] uppercase font-semibold inline-flex items-center gap-2"
            style={{ color: "var(--bg)" }}>
            <Plus size={13} /> New Project
          </button>
          <Msg msg={msg} />
          <div className="space-y-2 mt-4">
            {(items || []).map((p) => (
              <div key={p.id} className="panel px-5 py-4 flex flex-wrap items-center gap-4">
                <span className="font-mono text-[10px] text-violet">{p.num}</span>
                <span className="font-display font-bold text-sm text-ink flex-1 min-w-0 truncate">{p.title}</span>
                <span className="font-mono text-[10px] text-ink3">{p.year}</span>
                <span className="font-mono text-[9px] tracking-[0.15em] text-ink3">{p.disclosure}</span>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(p)} data-testid={`project-edit-${p.slug}`}
                    className="px-3 h-8 border border-line font-mono text-[10px] uppercase text-ink2 hover:border-violet">Edit</button>
                  <button onClick={() => remove(p.id)} data-testid={`project-delete-${p.slug}`}
                    className="px-3 h-8 border border-line font-mono text-[10px] uppercase text-pk hover:border-pk">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------- SERVICES ----------

export function ServicesPanel() {
  const [items, setItems] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/content/bootstrap").then(({ data }) =>
      setItems(data.services.map((s) => ({
        ...s,
        _caps: s.capabilities.map((c) => `${c.name} | ${c.status} | ${c.desc}`).join("\n"),
      })))
    );
  }, []);

  const save = async () => {
    try {
      const docs = items.map((s) => ({
        ...s,
        capabilities: s._caps.split("\n").filter(Boolean).map((line) => {
          const [name, status, ...rest] = line.split("|").map((x) => x.trim());
          return { name: name || "", status: status || "AVAILABLE", desc: rest.join(" | ") };
        }).filter((c) => c.name),
      }));
      await api.put("/admin/services", docs.map(({ _caps, ...d }) => d));
      setMsg("✓ Services saved — live on the site");
    } catch (err) {
      setMsg(formatApiError(err.response?.data?.detail));
    }
  };

  if (!items) return <p className="font-mono text-xs text-ink3 animate-blink">LOADING…</p>;

  return (
    <div data-testid="admin-services">
      <Head title="SERVICES" sub="One capability per line: Name | STATUS | Description. Status: CORE / AVAILABLE / EXPERIENCE." />
      <div className="space-y-5">
        {items.map((s, i) => (
          <div key={s.id} className="panel p-5 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <In label={`Category ${s.num} — Title`} value={s.title}
                onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
              <In label="Blurb" value={s.blurb}
                onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, blurb: e.target.value } : x)))} />
            </div>
            <Ta label="Capabilities" rows={Math.min(12, s.capabilities.length + 1)} value={s._caps}
              onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, _caps: e.target.value } : x)))} />
          </div>
        ))}
      </div>
      <button onClick={save} data-testid="services-save"
        className="mt-6 h-10 px-6 bg-violet font-mono text-[10px] tracking-[0.2em] uppercase font-semibold inline-flex items-center gap-2"
        style={{ color: "var(--bg)" }}>
        <Save size={13} /> Save All Services
      </button>
      <Msg msg={msg} />
    </div>
  );
}

// ---------- PRICING ----------

export function PricingPanel() {
  const [items, setItems] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/content/bootstrap").then(({ data }) =>
      setItems(data.pricing.map((p) => ({ ...p, _inc: p.includes.join("\n") })))
    );
  }, []);

  const save = async () => {
    try {
      await api.put("/admin/pricing", items.map(({ _inc, ...p }) => ({ ...p, includes: _inc.split("\n").map((x) => x.trim()).filter(Boolean) })));
      setMsg("✓ Pricing saved — live on the site");
    } catch (err) {
      setMsg(formatApiError(err.response?.data?.detail));
    }
  };

  const upd = (i, k, v) => setItems(items.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  if (!items) return <p className="font-mono text-xs text-ink3 animate-blink">LOADING…</p>;

  return (
    <div data-testid="admin-pricing">
      <Head title="PRICING" sub="Edit amounts, inclusions, and notes. One inclusion per line." />
      <div className="grid md:grid-cols-2 gap-5">
        {items.map((p, i) => (
          <div key={p.id} className="panel p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <In label="Package" value={p.name} onChange={(e) => upd(i, "name", e.target.value)} />
              <In label="Price" value={p.price} onChange={(e) => upd(i, "price", e.target.value)} data-testid={`price-input-${p.id}`} />
              <In label="Model label" value={p.model} onChange={(e) => upd(i, "model", e.target.value)} />
              <In label="CTA" value={p.cta} onChange={(e) => upd(i, "cta", e.target.value)} />
            </div>
            <Ta label="Includes" rows={4} value={p._inc} onChange={(e) => upd(i, "_inc", e.target.value)} />
            <In label="Note" value={p.note} onChange={(e) => upd(i, "note", e.target.value)} />
            <label className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-ink3">
              <input type="checkbox" checked={!!p.featured} onChange={(e) => upd(i, "featured", e.target.checked)} /> Featured
            </label>
          </div>
        ))}
      </div>
      <button onClick={save} data-testid="pricing-save"
        className="mt-6 h-10 px-6 bg-violet font-mono text-[10px] tracking-[0.2em] uppercase font-semibold inline-flex items-center gap-2"
        style={{ color: "var(--bg)" }}>
        <Save size={13} /> Save All Pricing
      </button>
      <Msg msg={msg} />
    </div>
  );
}

// ---------- SETTINGS ----------

export function SettingsPanel() {
  const [s, setS] = useState(null);
  const [msg, setMsg] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    api.get("/admin/settings").then(({ data }) => setS(data));
  }, []);

  const save = async () => {
    try {
      await api.put("/admin/settings", {
        contactEmail: s.contactEmail, ownerNotifyEmail: s.ownerNotifyEmail,
        github: s.github, linkedin: s.linkedin, available: s.available, location: s.location,
      });
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        await api.post("/admin/resume", fd);
      }
      setMsg("✓ Settings saved — live on the site");
    } catch (err) {
      setMsg(formatApiError(err.response?.data?.detail));
    }
  };

  if (!s) return <p className="font-mono text-xs text-ink3 animate-blink">LOADING…</p>;

  return (
    <div data-testid="admin-settings" className="max-w-xl">
      <Head title="SETTINGS" sub="Site-wide configuration. Email, socials, availability, and the downloadable CV." />
      <div className="panel p-6 space-y-4">
        <In label="Public contact email (shown on site — leave blank to hide)" value={s.contactEmail || ""}
          onChange={(e) => setS({ ...s, contactEmail: e.target.value })} data-testid="set-contact-email" />
        <In label="Inquiry notification email (receives contact form alerts — leave blank to disable email)" value={s.ownerNotifyEmail || ""}
          onChange={(e) => setS({ ...s, ownerNotifyEmail: e.target.value })} data-testid="set-notify-email" />
        <In label="GitHub URL (blank = hidden)" value={s.github || ""} onChange={(e) => setS({ ...s, github: e.target.value })} />
        <In label="LinkedIn URL (blank = hidden)" value={s.linkedin || ""} onChange={(e) => setS({ ...s, linkedin: e.target.value })} />
        <In label="Location" value={s.location || ""} onChange={(e) => setS({ ...s, location: e.target.value })} />
        <label className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-ink3">
          <input type="checkbox" checked={!!s.available} onChange={(e) => setS({ ...s, available: e.target.checked })} data-testid="set-available" />
          Status: Available for projects
        </label>
        <div>
          <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-1.5">
            Replace downloadable CV (PDF)
          </label>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} data-testid="set-resume-upload"
            className="font-mono text-xs text-ink2" />
          <p className="mt-1 font-mono text-[9px] text-ink3">If none uploaded, the site serves an auto-generated CV.</p>
        </div>
        <button onClick={save} data-testid="settings-save"
          className="h-10 px-6 bg-violet font-mono text-[10px] tracking-[0.2em] uppercase font-semibold inline-flex items-center gap-2"
          style={{ color: "var(--bg)" }}>
          <Save size={13} /> Save Settings
        </button>
        <Msg msg={msg} />
      </div>
    </div>
  );
}
