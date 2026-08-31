import { useEffect, useMemo, useState } from "react";
import api, { formatApiError } from "../lib/api";
import { ABOUT_TEMPLATES, STATUS_BADGE, timeAgo } from "./aboutShared";
import { Plus, Search, Copy, Archive, Trash2, ArchiveRestore, ExternalLink } from "lucide-react";

const FILTERS = ["ALL", "PUBLISHED", "DRAFT", "ARCHIVED", "TRASH"];

export default function AboutList({ onEdit, onNew }) {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", template: 4, duplicateFrom: "" });

  const load = () => api.get("/admin/about/profiles").then(({ data }) => setItems(data));
  useEffect(() => { load().catch(() => setItems([])); }, []);

  const shown = useMemo(() => {
    let out = items || [];
    if (filter !== "ALL") out = out.filter((p) => (p.status || "draft") === filter.toLowerCase());
    if (search.trim()) out = out.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    return out;
  }, [items, filter, search]);

  const act = async (fn, okMsg) => {
    try {
      await fn();
      if (okMsg) setMsg(okMsg);
      load();
    } catch (err) {
      setMsg(formatApiError(err.response?.data?.detail));
    }
  };

  const create = async () => {
    if (!form.name.trim()) return setMsg("Profile name is required.");
    try {
      const { data } = await api.post("/admin/about/profiles", {
        name: form.name, template: form.template, duplicateFrom: form.duplicateFrom || undefined,
      });
      setCreating(false);
      onEdit(data.id);
    } catch (err) {
      setMsg(formatApiError(err.response?.data?.detail));
    }
  };

  return (
    <div data-testid="about-profiles">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <span className="font-mono text-[10px] tracking-[0.3em] text-violet">ADMIN / ABOUT BUILDER</span>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            ABOUT PROFILES / {String((items || []).filter((p) => p.status !== "trash").length).padStart(2, "0")}
          </h1>
        </div>
        <button onClick={() => setCreating(true)} data-testid="about-new"
          className="h-10 px-5 bg-violet font-mono text-[10px] tracking-[0.2em] uppercase font-semibold inline-flex items-center gap-2"
          style={{ color: "var(--bg)" }}>
          <Plus size={13} /> New About Profile
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink3" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search profiles…"
            data-testid="about-search"
            className="w-full h-10 pl-9 pr-3 bg-card border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} data-testid={`about-filter-${f.toLowerCase()}`}
              className={`h-10 px-3 font-mono text-[9px] tracking-[0.15em] border transition-colors ${
                filter === f ? "border-violet text-violet bg-violet/10" : "border-line text-ink3 hover:text-ink"
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {msg && <p className={`mb-4 font-mono text-xs ${msg.startsWith("✓") ? "text-grn" : "text-pk"}`}>{msg}</p>}

      {creating && (
        <div className="panel p-5 mb-6 space-y-4" data-testid="about-create-form">
          <span className="font-mono text-[10px] tracking-[0.25em] text-violet">NEW ABOUT PROFILE</span>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-1.5">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="about-create-name"
                placeholder="e.g. Recruiter Version"
                className="w-full h-10 px-3 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none" />
            </div>
            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-1.5">Template</label>
              <select value={form.template} onChange={(e) => setForm({ ...form, template: Number(e.target.value) })} data-testid="about-create-template"
                className="w-full h-10 px-3 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none">
                {ABOUT_TEMPLATES.map((t) => <option key={t.id} value={t.id}>0{t.id} — {t.name} ({t.photoLabel} photos)</option>)}
              </select>
            </div>
            <div>
              <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-1.5">Duplicate from (optional)</label>
              <select value={form.duplicateFrom} onChange={(e) => setForm({ ...form, duplicateFrom: e.target.value })} data-testid="about-create-dup"
                className="w-full h-10 px-3 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none">
                <option value="">Start fresh</option>
                {(items || []).filter((p) => p.status !== "trash").map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={create} data-testid="about-create-submit"
              className="h-9 px-5 bg-violet font-mono text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: "var(--bg)" }}>
              Create Draft →
            </button>
            <button onClick={() => setCreating(false)} className="h-9 px-4 border border-line font-mono text-[10px] uppercase text-ink3">Cancel</button>
          </div>
        </div>
      )}

      {!items ? (
        <p className="font-mono text-xs text-ink3 animate-blink">LOADING…</p>
      ) : shown.length === 0 ? (
        <div className="panel p-12 text-center">
          <p className="font-mono text-xs tracking-[0.25em] text-ink3 mb-2">NO PROFILES FOUND</p>
          <p className="font-mono text-[10px] text-ink3">Create an About profile to control the public /about page.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {shown.map((p) => (
            <div key={p.id} className="panel px-4 sm:px-5 py-4" data-testid={`about-row-${p.id}`}>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex-1 min-w-[160px]">
                  <button onClick={() => p.status !== "trash" && onEdit(p.id)} className="text-left">
                    <span className="font-display font-bold text-sm text-ink hover:text-violet transition-colors">{p.name}</span>
                    <span className="block font-mono text-[10px] text-ink3 mt-0.5">
                      Template 0{p.template} · {p.photoCount} image{p.photoCount === 1 ? "" : "s"} · updated {timeAgo(p.updated_at)}
                      {p.published_at && ` · published ${timeAgo(p.published_at)}`}
                    </span>
                  </button>
                </div>
                <span className={`font-mono text-[9px] tracking-[0.2em] px-2 py-0.5 border uppercase ${STATUS_BADGE[p.status] || STATUS_BADGE.draft}`}>
                  {p.status}
                </span>
                <div className="flex gap-1.5">
                  {p.status === "trash" ? (
                    <>
                      <button onClick={() => act(() => api.post(`/admin/about/profiles/${p.id}/restore`), "✓ Restored to drafts")}
                        data-testid={`about-restore-${p.id}`} aria-label="Restore"
                        className="p-2 border border-line text-ink3 hover:text-grn hover:border-grn">
                        <ArchiveRestore size={12} />
                      </button>
                      <button
                        onClick={() => window.confirm(`DELETE PERMANENTLY?\n\n${p.name}\n\nThis cannot be undone. Shared media files are kept.`) &&
                          act(() => api.delete(`/admin/about/profiles/${p.id}/permanent`), "✓ Permanently deleted")}
                        aria-label="Delete permanently" data-testid={`about-purge-${p.id}`}
                        className="p-2 border border-line text-pk hover:border-pk">
                        <Trash2 size={12} />
                      </button>
                    </>
                  ) : (
                    <>
                      {p.status !== "published" && (
                        <button onClick={() => act(() => api.post(`/admin/about/profiles/${p.id}/publish`), "✓ Published — now live at /about")}
                          data-testid={`about-publish-${p.id}`}
                          className="px-3 h-8 border border-grn/50 font-mono text-[9px] tracking-[0.15em] uppercase text-grn hover:bg-grn/10">
                          Set Live
                        </button>
                      )}
                      <button onClick={() => act(() => api.post("/admin/about/profiles", { name: `${p.name} (Copy)`, duplicateFrom: p.id }), "✓ Duplicated as draft")}
                        aria-label="Duplicate" data-testid={`about-dup-${p.id}`}
                        className="p-2 border border-line text-ink3 hover:text-violet hover:border-violet">
                        <Copy size={12} />
                      </button>
                      {p.status !== "archived" && p.status !== "published" && (
                        <button onClick={() => act(() => api.post(`/admin/about/profiles/${p.id}/archive`))} aria-label="Archive"
                          className="p-2 border border-line text-ink3 hover:text-amb hover:border-amb">
                          <Archive size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => window.confirm(`MOVE TO TRASH?\n\n${p.name}\n\nKept for 30 days, then permanently deleted.`) &&
                          act(() => api.delete(`/admin/about/profiles/${p.id}`), "✓ Moved to trash (30-day retention)")}
                        aria-label="Move to trash" data-testid={`about-trash-${p.id}`}
                        className="p-2 border border-line text-pk hover:border-pk">
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {p.status === "trash" && (
                <p className="mt-3 font-mono text-[9px] tracking-[0.15em] uppercase text-pk">
                  Deleted {new Date(p.deleted_at).toLocaleDateString()} · permanent deletion {new Date(p.purge_at).toLocaleDateString()} · {p.days_remaining} days remaining
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AboutLiveLink() {
  return (
    <a href="/about" target="_blank" rel="noopener noreferrer"
      className="h-9 px-4 inline-flex items-center gap-1.5 border border-line font-mono text-[10px] uppercase text-ink2 hover:border-violet">
      <ExternalLink size={12} /> View Live /about
    </a>
  );
}
