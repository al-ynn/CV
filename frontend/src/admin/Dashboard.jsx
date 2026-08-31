import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { StatusBadge } from "./fields";
import { Search } from "lucide-react";

const CARDS = [
  ["projects", "PROJECTS"], ["services", "SERVICES"], ["pricing", "PRICE PACKAGES"],
  ["certifications", "CERTIFICATIONS"], ["experience", "EXPERIENCE"], ["technologies", "TECHNOLOGIES"],
];

export default function Dashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data)).catch(() => {});
    api.get("/admin/activity").then(({ data }) => setActivity(data.slice(0, 6))).catch(() => {});
    api.get("/admin/inquiries").then(({ data }) => setInquiries(data.slice(0, 4))).catch(() => {});
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) return setResults(null);
    const t = setTimeout(() => api.get(`/admin/search?q=${encodeURIComponent(q)}`).then(({ data }) => setResults(data)), 250);
    return () => clearTimeout(t);
  }, [q]);

  const firstName = (user?.name || "Aleana").split(" ")[0];

  return (
    <div data-testid="admin-dashboard-overview">
      <span className="font-mono text-[10px] tracking-[0.3em] text-violet">PORTFOLIO CONTROL CENTER</span>
      <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
        WELCOME BACK, {firstName.toUpperCase()}.
      </h1>
      <p className="mt-1 font-mono text-[10px] tracking-[0.2em] text-grn uppercase">● Portfolio status: live</p>

      <div className="relative mt-6 max-w-xl">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink3" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search all content & messages…"
          data-testid="admin-global-search"
          className="w-full h-11 pl-9 pr-3 bg-card border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none" />
        {results && (
          <div className="absolute top-12 inset-x-0 panel shadow-xl z-20 max-h-64 overflow-y-auto">
            {results.length === 0 && <p className="px-4 py-3 font-mono text-[10px] text-ink3">NO RESULTS</p>}
            {results.map((r) => (
              <Link key={r.collection + r.id} to={`/admin/${r.collection}`} onClick={() => { setQ(""); setResults(null); }}
                className="flex items-center justify-between px-4 py-2.5 border-b border-line last:border-0 hover:bg-canvas2/60 font-mono text-xs text-ink2">
                <span>{r.label}</span>
                <span className="text-[9px] tracking-[0.2em] text-ink3 uppercase">{r.collection}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-px bg-line border border-line mt-8">
        {CARDS.map(([key, label]) => (
          <Link to={`/admin/${key}`} key={key} data-testid={`dash-${key}`} className="bg-card p-5 hover:bg-canvas2/60 transition-colors">
            <span className="block font-mono text-[9px] tracking-[0.2em] text-ink3 mb-2">{label}</span>
            <span className="font-mono text-3xl font-bold text-violet tabular-nums">{stats ? stats[key] ?? 0 : "—"}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line mt-px">
        <div className="bg-card p-5">
          <span className="block font-mono text-[9px] tracking-[0.2em] text-ink3 mb-2">CONTACT REQUESTS</span>
          <span className="font-mono text-3xl font-bold text-cy tabular-nums">{stats ? stats.inquiries_total : "—"}</span>
        </div>
        <div className="bg-card p-5">
          <span className="block font-mono text-[9px] tracking-[0.2em] text-ink3 mb-2">NEW INQUIRIES</span>
          <span className="font-mono text-3xl font-bold text-pk tabular-nums">{stats ? stats.inquiries_new : "—"}</span>
        </div>
        <div className="bg-card p-5">
          <span className="block font-mono text-[9px] tracking-[0.2em] text-ink3 mb-2">DRAFT CONTENT</span>
          <span className="font-mono text-3xl font-bold text-amb tabular-nums">{stats ? stats.drafts : "—"}</span>
        </div>
        <div className="bg-card p-5">
          <span className="block font-mono text-[9px] tracking-[0.2em] text-ink3 mb-2">MEDIA FILES</span>
          <span className="font-mono text-3xl font-bold text-grn tabular-nums">{stats ? stats.media : "—"}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {[
          ["+ Add Project", "/admin/projects"], ["+ Add Service", "/admin/services"], ["+ Add Certification", "/admin/certifications"],
          ["Update Pricing", "/admin/pricing"], ["Edit Homepage", "/admin/homepage"], ["Upload Resume", "/admin/resume"],
        ].map(([label, to]) => (
          <Link key={to} to={to} data-testid={`quick-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
            className="h-9 px-4 inline-flex items-center border border-line font-mono text-[10px] tracking-[0.15em] uppercase text-ink2 hover:border-violet hover:text-violet transition-colors">
            {label}
          </Link>
        ))}
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="h-9 px-4 inline-flex items-center bg-violet font-mono text-[10px] tracking-[0.15em] uppercase font-semibold" style={{ color: "var(--bg)" }}>
          View Website →
        </a>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-10">
        <div className="panel p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="font-mono text-[10px] tracking-[0.25em] text-violet">RECENT ACTIVITY</span>
            <Link to="/admin/activity" className="font-mono text-[9px] text-ink3 hover:text-violet uppercase">All →</Link>
          </div>
          {activity.length === 0 && <p className="font-mono text-[10px] text-ink3">No activity yet.</p>}
          <div className="space-y-2.5">
            {activity.map((a) => (
              <div key={a.id} className="flex items-baseline justify-between gap-3 font-mono text-[11px]">
                <span className="text-ink2 truncate">{a.action} "{a.record}"</span>
                <span className="text-[9px] text-ink3 shrink-0">{new Date(a.at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="font-mono text-[10px] tracking-[0.25em] text-violet">LATEST INQUIRIES</span>
            <Link to="/admin/messages" className="font-mono text-[9px] text-ink3 hover:text-violet uppercase">Inbox →</Link>
          </div>
          {inquiries.length === 0 && <p className="font-mono text-[10px] text-ink3">Inbox empty.</p>}
          <div className="space-y-2.5">
            {inquiries.map((q) => (
              <div key={q.id} className="flex items-center justify-between gap-3 font-mono text-[11px]">
                <span className="text-ink2 truncate">{q.name} — {q.projectType || "inquiry"}</span>
                <StatusBadge status={q.status === "NEW" ? "draft" : "hidden"} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
