import { useEffect, useMemo, useState } from "react";
import api, { formatApiError } from "../lib/api";
import { useContent } from "../lib/content";
import { Field, StatusBadge, getPath } from "./fields";
import { Plus, Search, Copy, Archive, ArchiveRestore, Trash2, ArrowUp, ArrowDown, ExternalLink, RotateCcw, Pencil } from "lucide-react";

const FILTERS = ["ALL", "PUBLISHED", "DRAFT", "HIDDEN", "ARCHIVED"];

export default function CollectionPage({ schema, name }) {
  const { refresh } = useContent();
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [editing, setEditing] = useState(null); // null | "new" | item
  const [draft, setDraft] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [revisions, setRevisions] = useState(null);

  const load = () =>
    api.get(`/admin/collection/${name}`).then(({ data }) => setItems(data)).catch(() => setItems([]));
  useEffect(() => { load(); }, [name]);

  const filtered = useMemo(() => {
    if (!items) return [];
    let out = items;
    if (filter === "ARCHIVED") out = out.filter((i) => i.archived);
    else if (filter !== "ALL") out = out.filter((i) => !i.archived && (i.status || "draft") === filter.toLowerCase());
    else out = out;
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter((i) => schema.search.some((f) => String(i[f] || "").toLowerCase().includes(q)));
    }
    return out;
  }, [items, search, filter, schema]);

  const openEditor = (item) => {
    setEditing(item);
    setDraft(JSON.parse(JSON.stringify(item === "new" ? { ...schema.defaults } : item)));
    setDirty(false);
    setFieldErrors({});
    setRevisions(null);
  };

  const closeEditor = () => {
    if (dirty && !window.confirm("You have unsaved changes.\n\nOK = Discard changes · Cancel = Stay")) return;
    setEditing(null);
    setDraft(null);
    setDirty(false);
  };

  const validate = (targetStatus, enforcePublishRequirements = false) => {
    const errs = {};
    schema.fields.forEach((f) => {
      if (f.required && !String(getPath(draft, f.key) ?? "").trim()) errs[f.key] = `${f.label} is required.`;
      if (f.exactLength && targetStatus === "published" && enforcePublishRequirements && (getPath(draft, f.key) || []).length !== f.exactLength) {
        errs[f.key] = `Please upload ${f.exactLength} project screenshots before publishing.`;
      }
    });
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const save = async (statusOverride) => {
    const targetStatus = statusOverride || draft.status;
    const enforcePublishRequirements = statusOverride === "published" || editing === "new";
    if (!validate(targetStatus, enforcePublishRequirements)) return;
    const doc = { ...draft };
    if (statusOverride) doc.status = statusOverride;
    if (name === "projects" && !doc.slug && doc.title) {
      doc.slug = doc.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }
    if (name === "services" && !doc.num && doc.title) {
      doc.num = String((items?.length || 0) + 1).padStart(2, "0");
    }
    try {
      if (editing === "new") {
        await api.post(`/admin/collection/${name}`, doc);
      } else {
        await api.put(`/admin/collection/${name}/${editing.id}`, doc);
      }
      setMsg(`✓ ${schema.singular} saved`);
      setEditing(null);
      setDirty(false);
      load();
      refresh();
    } catch (err) {
      setMsg(formatApiError(err.response?.data?.detail));
    }
  };

  const act = async (fn) => { await fn(); load(); refresh(); };

  const move = async (idx, dir) => {
    const list = filtered;
    const a = list[idx];
    const b = list[idx + dir];
    if (!a || !b) return;
    await act(() => api.post(`/admin/collection/${name}/reorder`, {
      ids: items.map((i) => (i.id === a.id ? b.id : i.id === b.id ? a.id : i.id)),
    }));
  };

  const archive = (item) => {
    if (window.confirm(`ARCHIVE ${schema.singular.toUpperCase()}?\n\n${item.title || item.name}\n\nIt will no longer appear publicly, but can be restored.`)) {
      act(() => api.delete(`/admin/collection/${name}/${item.id}`));
    }
  };

  const hardDelete = (item) => {
    if (window.confirm(`DELETE PERMANENTLY?\n\n${item.title || item.name}\n\nThis cannot be undone.`)) {
      act(() => api.delete(`/admin/collection/${name}/${item.id}?hard=true`));
    }
  };

  // ---------- editor view ----------
  if (editing) {
    return (
      <div data-testid={`${name}-editor`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <span className="font-mono text-[10px] tracking-[0.3em] text-violet">
              {editing === "new" ? `NEW ${schema.singular.toUpperCase()}` : `EDITING: ${(editing.title || editing.name || "").toUpperCase()}`}
            </span>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={draft.status} archived={draft.archived} />
              {draft.updated_at && <span className="font-mono text-[9px] text-ink3">UPDATED {new Date(draft.updated_at).toLocaleString()}</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {schema.preview && draft.slug && (
              <a href={schema.preview(draft)} target="_blank" rel="noopener noreferrer" data-testid="editor-preview"
                className="h-9 px-4 inline-flex items-center gap-1.5 border border-line font-mono text-[10px] uppercase text-ink2 hover:border-violet">
                <ExternalLink size={12} /> Preview
              </a>
            )}
            {(name === "projects" || name === "pricing") && editing !== "new" && (
              <button onClick={async () => setRevisions((await api.get(`/admin/collection/${name}/${editing.id}/revisions`)).data)}
                className="h-9 px-4 inline-flex items-center gap-1.5 border border-line font-mono text-[10px] uppercase text-ink2 hover:border-violet">
                <RotateCcw size={12} /> History ({revisions ? revisions.length : "…"})
              </button>
            )}
            <button onClick={() => save("draft")} data-testid="editor-save-draft"
              className="h-9 px-4 border border-amb/50 font-mono text-[10px] tracking-[0.15em] uppercase text-amb hover:bg-amb/10">
              Save Draft
            </button>
            <button onClick={() => save()} data-testid="editor-save"
              className="h-9 px-4 border border-line font-mono text-[10px] tracking-[0.15em] uppercase text-ink2 hover:border-violet">
              Save
            </button>
            <button onClick={() => save("published")} data-testid="editor-publish"
              className="h-9 px-5 bg-violet font-mono text-[10px] tracking-[0.15em] uppercase font-semibold" style={{ color: "var(--bg)" }}>
              Publish →
            </button>
            <button onClick={closeEditor} data-testid="editor-cancel"
              className="h-9 px-4 border border-line font-mono text-[10px] uppercase text-ink3 hover:text-ink">
              Cancel
            </button>
          </div>
        </div>

        {revisions && (
          <div className="panel p-4 mb-6 font-mono text-[10px] text-ink2 space-y-1.5">
            <span className="text-violet tracking-[0.25em]">REVISION HISTORY (last 10)</span>
            {revisions.length === 0 && <p className="text-ink3">No previous versions recorded yet.</p>}
            {[...revisions].reverse().map((r, i) => (
              <div key={i} className="flex justify-between border-b border-line pb-1.5">
                <span>{r.data.title || r.data.name || "snapshot"}</span>
                <span className="text-ink3">{new Date(r.at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        <div className="panel p-5 sm:p-7 grid sm:grid-cols-2 gap-x-6 gap-y-4">
          {schema.fields.map((f, i) =>
            f.type === "section" ? (
              <div key={i} className="sm:col-span-2"><Field def={f} item={draft} onChange={(v) => { setDraft(v); setDirty(true); }} /></div>
            ) : (
              <div key={f.key} className={f.type === "textarea" || f.type === "list" || f.type === "pipelist" ? "sm:col-span-2" : ""}>
                <Field def={f} item={draft} error={fieldErrors[f.key]}
                  onChange={(v) => { setDraft(v); setDirty(true); }} />
              </div>
            )
          )}
        </div>
        {msg && <p className={`mt-4 font-mono text-xs ${msg.startsWith("✓") ? "text-grn" : "text-pk"}`}>{msg}</p>}
      </div>
    );
  }

  // ---------- list view ----------
  return (
    <div data-testid={`${name}-list`}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <span className="font-mono text-[10px] tracking-[0.3em] text-violet">ADMIN / {schema.title}</span>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            {schema.title} / {String((items || []).filter((i) => !i.archived).length).padStart(2, "0")}
          </h1>
        </div>
        <button onClick={() => openEditor("new")} data-testid={`${name}-add`}
          className="h-10 px-5 bg-violet font-mono text-[10px] tracking-[0.2em] uppercase font-semibold inline-flex items-center gap-2"
          style={{ color: "var(--bg)" }}>
          <Plus size={13} /> Add {schema.singular}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink3" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${schema.title.toLowerCase()}…`}
            data-testid={`${name}-search`}
            className="w-full h-10 pl-9 pr-3 bg-card border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none" />
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} data-testid={`${name}-filter-${f.toLowerCase()}`}
              className={`h-10 px-3 font-mono text-[9px] tracking-[0.15em] border transition-colors ${
                filter === f ? "border-violet text-violet bg-violet/10" : "border-line text-ink3 hover:text-ink"
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {msg && <p className="mb-4 font-mono text-xs text-grn">{msg}</p>}

      {!items ? (
        <p className="font-mono text-xs text-ink3 animate-blink">LOADING…</p>
      ) : filtered.length === 0 ? (
        <div className="panel p-12 text-center" data-testid={`${name}-empty`}>
          <p className="font-mono text-xs tracking-[0.25em] text-ink3 mb-2">NO {schema.title} FOUND</p>
          <p className="font-mono text-[10px] text-ink3 mb-6">
            {filter !== "ALL" || search ? "Try clearing the filter or search." : `Add your first ${schema.singular.toLowerCase()} to display it on the public portfolio.`}
          </p>
          <button onClick={() => openEditor("new")}
            className="h-10 px-6 border border-violet font-mono text-[10px] tracking-[0.2em] uppercase text-violet">
            + Add {schema.singular}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, idx) => (
            <div key={item.id} className="panel px-4 sm:px-5 py-4 flex flex-wrap items-center gap-3 sm:gap-4" data-testid={`${name}-row-${item.id}`}>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => move(idx, -1)} aria-label="Move up" className="text-ink3 hover:text-violet disabled:opacity-20" disabled={idx === 0}>
                  <ArrowUp size={12} />
                </button>
                <button onClick={() => move(idx, 1)} aria-label="Move down" className="text-ink3 hover:text-violet disabled:opacity-20" disabled={idx === filtered.length - 1}>
                  <ArrowDown size={12} />
                </button>
              </div>
              <div className="flex-1 min-w-[140px]">
                <button onClick={() => openEditor(item)} className="text-left">
                  <span className="font-display font-bold text-sm text-ink hover:text-violet transition-colors">{item.title || item.name}</span>
                  <span className="block font-mono text-[10px] text-ink3 mt-0.5">{schema.listSub(item)}</span>
                </button>
              </div>
              <StatusBadge status={item.status} archived={item.archived} />
              <span className="hidden md:inline font-mono text-[9px] text-ink3">
                {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "—"}
              </span>
              <div className="flex gap-1.5">
                {!item.archived && (
                  <button onClick={() => openEditor(item)} aria-label={`Edit ${item.title || item.name}`} title="Edit"
                    data-testid={`${name}-edit-${item.id}`} className="h-9 px-3 inline-flex items-center gap-2 border border-line text-ink2 hover:text-violet hover:border-violet">
                    <Pencil size={12} /><span className="hidden xl:inline font-mono text-[9px] tracking-[0.12em] uppercase">Edit</span>
                  </button>
                )}
                <button onClick={() => act(() => api.post(`/admin/collection/${name}/${item.id}/duplicate`))} aria-label="Duplicate"
                  title="Duplicate" data-testid={`${name}-dup-${item.id}`} className="h-9 w-9 grid place-items-center border border-line text-ink3 hover:text-violet hover:border-violet">
                  <Copy size={12} />
                </button>
                {item.archived ? (
                  <>
                    <button onClick={() => act(() => api.post(`/admin/collection/${name}/${item.id}/restore`))} aria-label="Restore"
                      className="p-2 border border-line text-ink3 hover:text-grn hover:border-grn">
                      <ArchiveRestore size={12} />
                    </button>
                    <button onClick={() => hardDelete(item)} aria-label="Delete permanently"
                      title="Delete permanently" className="h-9 w-9 grid place-items-center border border-line text-pk hover:border-pk">
                      <Trash2 size={12} />
                    </button>
                  </>
                ) : (
                  <button onClick={() => archive(item)} aria-label="Archive" data-testid={`${name}-archive-${item.id}`}
                    title="Archive" className="h-9 w-9 grid place-items-center border border-line text-ink3 hover:text-amb hover:border-amb">
                    <Archive size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
