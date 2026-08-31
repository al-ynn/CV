import { useEffect, useState } from "react";
import api, { formatApiError } from "../lib/api";
import { useContent } from "../lib/content";
import { StatusBadge } from "./fields";
import { Plus, X, ArrowUp, ArrowDown, Copy, Archive, ArchiveRestore, Trash2, ChevronDown } from "lucide-react";

const LEVELS = ["CORE", "PROFICIENT", "WORKING KNOWLEDGE", "FAMILIAR", "LEARNING"];
const inputCls = "w-full h-9 px-3 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none";
const labelCls = "block font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-1.5";
const EMPTY_CAP = { name: "", shortDesc: "", detail: "", level: "WORKING KNOWLEDGE", technologies: [], projects: [], price: "", featured: false, visible: true };

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function ServicesAdmin() {
  const { refresh } = useContent();
  const [cats, setCats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [openCat, setOpenCat] = useState(null);
  const [editingCat, setEditingCat] = useState(null);
  const [catDraft, setCatDraft] = useState(null);
  const [capModal, setCapModal] = useState(null); // {catId, index|null, cap}
  const [msg, setMsg] = useState("");

  const load = () =>
    api.get("/admin/collection/services").then(({ data }) => setCats(data.filter((c) => !c.archived)));
  useEffect(() => {
    load();
    api.get("/admin/collection/projects").then(({ data }) => setProjects(data.filter((p) => !p.archived)));
  }, []);

  const saveCat = async (cat) => {
    try {
      const { id, created_at, ...doc } = cat;
      doc.slug = doc.slug || slugify(doc.title);
      if (String(id).includes("-") && cats.some((c) => c.id === id)) {
        await api.put(`/admin/collection/services/${id}`, doc);
      } else {
        await api.post("/admin/collection/services", { ...doc, id: undefined });
      }
      setMsg("✓ Saved");
      setEditingCat(null);
      load();
      refresh();
    } catch (err) {
      setMsg(formatApiError(err.response?.data?.detail));
    }
  };

  const addCategory = () => {
    setEditingCat("new");
    setCatDraft({ title: "", num: String((cats?.length || 0) + 1).padStart(2, "0"), blurb: "", longDescription: "", featured: false, status: "draft", order: (cats?.length || 0) + 1, capabilities: [] });
  };

  const act = async (fn, m) => { await fn(); if (m) setMsg(m); load(); refresh(); };

  const saveCap = async () => {
    const { catId, index, cap } = capModal;
    const cat = cats.find((c) => c.id === catId);
    const caps = [...cat.capabilities];
    if (index === null) caps.push(cap);
    else caps[index] = cap;
    await act(() => api.put(`/admin/collection/services/${catId}`, { ...cat, capabilities: caps }), "✓ Capability saved");
    setCapModal(null);
  };

  const removeCap = (cat, i) => {
    if (!window.confirm(`Remove capability "${cat.capabilities[i].name}"?`)) return;
    act(() => api.put(`/admin/collection/services/${cat.id}`, { ...cat, capabilities: cat.capabilities.filter((_, j) => j !== i) }), "✓ Removed");
  };

  const moveCap = (cat, i, dir) => {
    const caps = [...cat.capabilities];
    const [it] = caps.splice(i, 1);
    caps.splice(i + dir, 0, it);
    act(() => api.put(`/admin/collection/services/${cat.id}`, { ...cat, capabilities: caps }));
  };

  const moveCapToCategory = (fromCat, i, toCatId) => {
    const toCat = cats.find((c) => c.id === toCatId);
    if (!toCat) return;
    const cap = fromCat.capabilities[i];
    const fromCaps = fromCat.capabilities.filter((_, j) => j !== i);
    const toCaps = [...toCat.capabilities, cap];
    act(async () => {
      await api.put(`/admin/collection/services/${fromCat.id}`, { ...fromCat, capabilities: fromCaps });
      await api.put(`/admin/collection/services/${toCatId}`, { ...toCat, capabilities: toCaps });
    }, "✓ Moved");
  };

  if (!cats) return <p className="font-mono text-xs text-ink3 animate-blink">LOADING…</p>;

  return (
    <div data-testid="services-admin">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <span className="font-mono text-[10px] tracking-[0.3em] text-violet">ADMIN / SERVICES</span>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            SERVICE DOMAINS / {String(cats.length).padStart(2, "0")}
          </h1>
        </div>
        <button onClick={addCategory} data-testid="svc-add-category"
          className="h-10 px-5 bg-violet font-mono text-[10px] tracking-[0.2em] uppercase font-semibold inline-flex items-center gap-2"
          style={{ color: "var(--bg)" }}>
          <Plus size={13} /> Add Category
        </button>
      </div>
      {msg && <p className={`mb-4 font-mono text-xs ${msg.startsWith("✓") ? "text-grn" : "text-pk"}`}>{msg}</p>}

      {/* category editor */}
      {editingCat && (
        <div className="panel p-5 mb-6 grid sm:grid-cols-2 gap-4" data-testid="svc-cat-editor">
          <span className="sm:col-span-2 font-mono text-[10px] tracking-[0.25em] text-violet">
            {editingCat === "new" ? "NEW CATEGORY" : "EDIT CATEGORY"}
          </span>
          <div><label className={labelCls}>Category Name *</label>
            <input value={catDraft.title} onChange={(e) => setCatDraft({ ...catDraft, title: e.target.value })} className={inputCls} data-testid="svc-cat-title" /></div>
          <div><label className={labelCls}>Number</label>
            <input value={catDraft.num} onChange={(e) => setCatDraft({ ...catDraft, num: e.target.value })} className={inputCls} /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Short Description</label>
            <textarea rows={2} value={catDraft.blurb} onChange={(e) => setCatDraft({ ...catDraft, blurb: e.target.value })}
              className="w-full px-3 py-2 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none resize-y" /></div>
          <label className="flex items-center gap-2 font-mono text-[10px] uppercase text-ink2">
            <input type="checkbox" checked={!!catDraft.featured} onChange={(e) => setCatDraft({ ...catDraft, featured: e.target.checked })} className="accent-[#a855f7] w-4 h-4" /> Featured
          </label>
          <div><label className={labelCls}>Status</label>
            <select value={catDraft.status} onChange={(e) => setCatDraft({ ...catDraft, status: e.target.value })} className={inputCls}>
              <option value="published">published</option><option value="draft">draft</option><option value="hidden">hidden</option>
            </select></div>
          <div className="sm:col-span-2 flex gap-2">
            <button onClick={() => catDraft.title.trim() ? saveCat(catDraft) : setMsg("Category name is required.")}
              data-testid="svc-cat-save"
              className="h-9 px-5 bg-violet font-mono text-[10px] tracking-[0.15em] uppercase font-semibold" style={{ color: "var(--bg)" }}>Save</button>
            <button onClick={() => setEditingCat(null)} className="h-9 px-4 border border-line font-mono text-[10px] uppercase text-ink3">Cancel</button>
          </div>
        </div>
      )}

      {/* categories */}
      <div className="space-y-3">
        {cats.map((cat, ci) => (
          <div key={cat.id} className="panel" data-testid={`svc-cat-${cat.id}`}>
            <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="flex flex-col">
                  <button aria-label="Move up" disabled={ci === 0}
                    onClick={async () => { const other = cats[ci - 1]; await act(async () => { await api.put(`/admin/collection/services/${cat.id}`, { ...cat, order: other.order }); await api.put(`/admin/collection/services/${other.id}`, { ...other, order: cat.order }); }); }}
                    className="text-ink3 hover:text-violet disabled:opacity-20"><ArrowUp size={11} /></button>
                  <button aria-label="Move down" disabled={ci === cats.length - 1}
                    onClick={async () => { const other = cats[ci + 1]; await act(async () => { await api.put(`/admin/collection/services/${cat.id}`, { ...cat, order: other.order }); await api.put(`/admin/collection/services/${other.id}`, { ...other, order: cat.order }); }); }}
                    className="text-ink3 hover:text-violet disabled:opacity-20"><ArrowDown size={11} /></button>
                </div>
              <button onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)} className="flex-1 min-w-[160px] text-left">
                <span className="font-display font-bold text-sm text-ink">{cat.num} · {cat.title}</span>
                <span className="block font-mono text-[10px] text-ink3 mt-0.5">{(cat.capabilities || []).length} capabilities</span>
              </button>
              <StatusBadge status={cat.status} />
              <div className="flex gap-1.5">
                <button onClick={() => { setEditingCat(cat.id); setCatDraft({ ...cat }); }} data-testid={`svc-edit-${cat.id}`}
                  className="px-3 h-8 border border-line font-mono text-[9px] uppercase text-ink2 hover:border-violet">Edit</button>
                <button onClick={() => act(() => api.post(`/admin/collection/services/${cat.id}/duplicate`), "✓ Duplicated as draft")}
                  aria-label="Duplicate" className="p-2 border border-line text-ink3 hover:text-violet"><Copy size={12} /></button>
                <button onClick={() => act(() => api.put(`/admin/collection/services/${cat.id}`, { ...cat, status: cat.status === "published" ? "hidden" : "published" }), "✓ Status changed")}
                  className="px-3 h-8 border border-line font-mono text-[9px] uppercase text-ink2 hover:border-violet">
                  {cat.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => window.confirm(`ARCHIVE CATEGORY?\n\n${cat.title}\n\nHidden publicly, restorable.`) && act(() => api.delete(`/admin/collection/services/${cat.id}`), "✓ Archived")}
                  aria-label="Archive" className="p-2 border border-line text-ink3 hover:text-amb"><Archive size={12} /></button>
                <button onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)} aria-label="Expand"
                  className="p-2 border border-line text-ink3"><ChevronDown size={12} className={openCat === cat.id ? "rotate-180" : ""} /></button>
              </div>
            </div>

            {openCat === cat.id && (
              <div className="border-t border-line px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[9px] tracking-[0.25em] text-ink3 uppercase">Capabilities</span>
                  <button onClick={() => setCapModal({ catId: cat.id, index: null, cap: { ...EMPTY_CAP } })}
                    data-testid={`svc-add-cap-${cat.id}`}
                    className="h-8 px-3 bg-violet font-mono text-[9px] tracking-[0.15em] uppercase font-semibold inline-flex items-center gap-1.5" style={{ color: "var(--bg)" }}>
                    <Plus size={11} /> Add Capability
                  </button>
                </div>
                <div className="space-y-1.5">
                  {(cat.capabilities || []).map((cap, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2 border border-line px-3 py-2.5" data-testid={`cap-row-${i}`}>
                      <span className="font-mono text-[11px] text-ink flex-1 min-w-[140px]">{cap.name}</span>
                      <span className={`font-mono text-[8px] tracking-[0.15em] px-1.5 py-0.5 border ${
                        cap.level === "CORE" ? "border-violet/40 text-violet" : cap.level === "PROFICIENT" ? "border-cy/40 text-cy" : "border-line text-ink3"
                      }`}>{cap.level}</span>
                      {cap.price && <span className="font-mono text-[9px] text-amb">{cap.price}</span>}
                      {cap.visible === false && <span className="font-mono text-[8px] text-ink3">HIDDEN</span>}
                      <select defaultValue="" onChange={(e) => { if (e.target.value) moveCapToCategory(cat, i, e.target.value); }}
                        className="h-7 px-1.5 bg-canvas border border-line font-mono text-[9px] text-ink3" aria-label="Move to category">
                        <option value="">Move…</option>
                        {cats.filter((c) => c.id !== cat.id).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                      <button onClick={() => setCapModal({ catId: cat.id, index: i, cap: { ...EMPTY_CAP, ...cap } })}
                        className="px-2.5 h-7 border border-line font-mono text-[9px] uppercase text-ink2 hover:border-violet">Edit</button>
                      <button onClick={() => moveCap(cat, i, -1)} disabled={i === 0} aria-label="Up" className="p-1.5 text-ink3 hover:text-violet disabled:opacity-20"><ArrowUp size={11} /></button>
                      <button onClick={() => moveCap(cat, i, 1)} disabled={i === cat.capabilities.length - 1} aria-label="Down" className="p-1.5 text-ink3 hover:text-violet disabled:opacity-20"><ArrowDown size={11} /></button>
                      <button onClick={() => removeCap(cat, i)} aria-label="Remove" className="p-1.5 text-ink3 hover:text-pk"><Trash2 size={11} /></button>
                    </div>
                  ))}
                  {(cat.capabilities || []).length === 0 && (
                    <p className="font-mono text-[10px] text-ink3 py-4 text-center">No capabilities yet — add one.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* capability modal */}
      {capModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" data-testid="cap-editor-modal">
          <div className="absolute inset-0 bg-canvas/80 backdrop-blur-sm" onClick={() => setCapModal(null)} />
          <div className="relative panel w-full max-w-xl max-h-[85vh] overflow-y-auto p-6 grid gap-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.25em] text-violet">{capModal.index === null ? "NEW CAPABILITY" : "EDIT CAPABILITY"}</span>
              <button onClick={() => setCapModal(null)} aria-label="Close"><X size={16} className="text-ink3" /></button>
            </div>
            <div><label className={labelCls}>Name *</label>
              <input value={capModal.cap.name} onChange={(e) => setCapModal({ ...capModal, cap: { ...capModal.cap, name: e.target.value } })} className={inputCls} data-testid="cap-name" /></div>
            <div><label className={labelCls}>Short Description</label>
              <input value={capModal.cap.shortDesc} onChange={(e) => setCapModal({ ...capModal, cap: { ...capModal.cap, shortDesc: e.target.value } })} className={inputCls} /></div>
            <div><label className={labelCls}>Detailed Description</label>
              <textarea rows={3} value={capModal.cap.detail} onChange={(e) => setCapModal({ ...capModal, cap: { ...capModal.cap, detail: e.target.value } })}
                className="w-full px-3 py-2 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none resize-y" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Experience Level</label>
                <select value={capModal.cap.level} onChange={(e) => setCapModal({ ...capModal, cap: { ...capModal.cap, level: e.target.value } })} className={inputCls} data-testid="cap-level">
                  {LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select></div>
              <div><label className={labelCls}>Starting Price (optional, e.g. ₱3,000)</label>
                <input value={capModal.cap.price} onChange={(e) => setCapModal({ ...capModal, cap: { ...capModal.cap, price: e.target.value } })} className={inputCls} /></div>
            </div>
            <div><label className={labelCls}>Technologies (comma separated)</label>
              <input value={(capModal.cap.technologies || []).join(", ")}
                onChange={(e) => setCapModal({ ...capModal, cap: { ...capModal.cap, technologies: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) } })}
                className={inputCls} placeholder="Laravel, PHP, MySQL" /></div>
            <div>
              <label className={labelCls}>Related Projects (proof)</label>
              <div className="flex flex-wrap gap-3 border border-line p-3">
                {projects.map((p) => (
                  <label key={p.id} className="flex items-center gap-1.5 font-mono text-[10px] text-ink2 cursor-pointer">
                    <input type="checkbox" checked={(capModal.cap.projects || []).includes(p.slug)}
                      onChange={(e) => setCapModal({ ...capModal, cap: { ...capModal.cap, projects: e.target.checked ? [...(capModal.cap.projects || []), p.slug] : (capModal.cap.projects || []).filter((s) => s !== p.slug) } })}
                      className="accent-[#a855f7]" />
                    {p.title}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 font-mono text-[10px] uppercase text-ink2">
                <input type="checkbox" checked={!!capModal.cap.featured} onChange={(e) => setCapModal({ ...capModal, cap: { ...capModal.cap, featured: e.target.checked } })} className="accent-[#a855f7] w-4 h-4" /> Featured
              </label>
              <label className="flex items-center gap-2 font-mono text-[10px] uppercase text-ink2">
                <input type="checkbox" checked={capModal.cap.visible !== false} onChange={(e) => setCapModal({ ...capModal, cap: { ...capModal.cap, visible: e.target.checked } })} className="accent-[#a855f7] w-4 h-4" /> Visible
              </label>
            </div>
            <button onClick={() => capModal.cap.name.trim() ? saveCap() : setMsg("Capability name is required.")}
              data-testid="cap-save"
              className="h-10 bg-violet font-mono text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: "var(--bg)" }}>
              Save Capability
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
