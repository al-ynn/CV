import { useState } from "react";
import api from "../lib/api";
import { ArrowUp, ArrowDown, X, Plus, ImageIcon, Upload } from "lucide-react";

export const getPath = (obj, path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
export const setPath = (obj, path, value) => {
  const keys = path.split(".");
  const copy = { ...obj };
  let cur = copy;
  for (let i = 0; i < keys.length - 1; i++) {
    cur[keys[i]] = { ...(cur[keys[i]] || {}) };
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
  return copy;
};

const inputCls =
  "w-full h-10 px-3 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none transition-colors";
const labelCls = "block font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-1.5";

export function StatusBadge({ status, archived }) {
  if (archived)
    return <span className="font-mono text-[9px] tracking-[0.2em] px-2 py-0.5 border border-pk/40 text-pk">ARCHIVED</span>;
  const map = {
    published: "border-grn/40 text-grn",
    draft: "border-amb/40 text-amb",
    hidden: "border-line text-ink3",
  };
  return (
    <span className={`font-mono text-[9px] tracking-[0.2em] px-2 py-0.5 border uppercase ${map[status] || map.hidden}`}>
      {status || "draft"}
    </span>
  );
}

function ListEditor({ value = [], onChange, hint }) {
  const [draft, setDraft] = useState("");
  const items = Array.isArray(value) ? value : [];
  const move = (i, dir) => {
    const next = [...items];
    const [it] = next.splice(i, 1);
    next.splice(i + dir, 0, it);
    onChange(next);
  };
  return (
    <div>
      <div className="flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} className={inputCls}
          placeholder={hint || "Add item…"}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              onChange([...items, draft.trim()]);
              setDraft("");
            }
          }} />
        <button type="button" data-testid="list-add" onClick={() => { if (draft.trim()) { onChange([...items, draft.trim()]); setDraft(""); } }}
          className="h-10 px-4 border border-line font-mono text-[10px] uppercase text-ink2 hover:border-violet shrink-0">
          <Plus size={13} />
        </button>
      </div>
      <div className="mt-2 space-y-1">
        {items.map((it, i) => (
          <div key={`${it}-${i}`} className="flex items-center gap-1 group">
            <span className="flex-1 px-3 py-1.5 bg-canvas border border-line font-mono text-[11px] text-ink2 truncate">{it}</span>
            <button type="button" aria-label="Move up" onClick={() => i > 0 && move(i, -1)} className="p-1.5 text-ink3 hover:text-violet"><ArrowUp size={12} /></button>
            <button type="button" aria-label="Move down" onClick={() => i < items.length - 1 && move(i, 1)} className="p-1.5 text-ink3 hover:text-violet"><ArrowDown size={12} /></button>
            <button type="button" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-1.5 text-ink3 hover:text-pk"><X size={12} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipeListEditor({ value = [], onChange, def }) {
  const keys = def.keys;
  const text = (Array.isArray(value) ? value : [])
    .map((item) => keys.map((k) => item[k] ?? "").join(" | "))
    .join("\n");
  const parse = (t) =>
    t.split("\n").filter((l) => l.trim()).map((line) => {
      const parts = line.split("|").map((x) => x.trim());
      const obj = {};
      keys.forEach((k, i) => {
        obj[k] = (def.numeric || []).includes(k) ? Number(parts[i]) || 0 : parts[i] ?? "";
      });
      return obj;
    }).filter((o) => o[keys[0]]);
  return (
    <div>
      <textarea rows={Math.max(4, Math.min(14, (value || []).length + 1))} defaultValue={text}
        onBlur={(e) => onChange(parse(e.target.value))}
        className="w-full px-3 py-2 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none resize-y" />
      {def.hint && <p className="mt-1 font-mono text-[9px] text-ink3">{def.hint} — saved on blur</p>}
    </div>
  );
}

export function MediaPicker({ open, onClose, onSelect }) {
  const [media, setMedia] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = () => api.get("/admin/media").then(({ data }) => setMedia(data));
  useState(() => { if (open) load(); }, [open]);
  if (open && media === null) load();

  if (!open) return null;
  const images = (media || []).filter((m) => m.mime?.startsWith("image/"));

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post("/admin/media", fd);
      load();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-canvas/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative panel w-full max-w-2xl max-h-[70vh] flex flex-col" data-testid="media-picker">
        <div className="flex items-center justify-between px-5 py-3 border-b border-line">
          <span className="font-mono text-[10px] tracking-[0.25em] text-violet">MEDIA LIBRARY</span>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer font-mono text-[10px] tracking-[0.15em] uppercase text-ink2 hover:text-violet flex items-center gap-1.5">
              <Upload size={12} /> {uploading ? "Uploading…" : "Upload"}
              <input type="file" accept="image/*" className="hidden" onChange={upload} data-testid="media-picker-upload" />
            </label>
            <button onClick={onClose} aria-label="Close" className="text-ink3 hover:text-ink"><X size={16} /></button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.length === 0 && (
            <p className="col-span-full py-10 text-center font-mono text-xs text-ink3">NO IMAGES YET — UPLOAD ONE</p>
          )}
          {images.map((m) => (
            <button key={m.id} onClick={() => { onSelect(m.url); onClose(); }} data-testid={`media-pick-${m.id}`}
              className="border border-line hover:border-violet transition-colors overflow-hidden bg-canvas2 aspect-video">
              <img src={`${process.env.REACT_APP_BACKEND_URL}${m.url}`} alt={m.alt || m.filename} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageField({ value, onChange }) {
  const [picker, setPicker] = useState(false);
  return (
    <div className="flex gap-2">
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} className={inputCls} placeholder="/api/media/files/…" />
      <button type="button" onClick={() => setPicker(true)} data-testid="image-browse"
        className="h-10 px-4 border border-line font-mono text-[10px] uppercase text-ink2 hover:border-violet shrink-0 flex items-center gap-1.5">
        <ImageIcon size={13} /> Browse
      </button>
      <MediaPicker open={picker} onClose={() => setPicker(false)} onSelect={onChange} />
    </div>
  );
}

export function Field({ def, item, onChange, error }) {
  if (def.type === "section") {
    return (
      <div className="pt-4 border-t border-line">
        <span className="font-mono text-[10px] tracking-[0.3em] text-violet">{def.label}</span>
      </div>
    );
  }
  const value = getPath(item, def.key);
  const set = (v) => onChange(setPath(item, def.key, v));

  return (
    <div className={def.type === "checkbox" ? "flex items-center gap-3 py-1" : ""}>
      {def.type !== "checkbox" && (
        <label className={labelCls}>
          {def.label} {def.required && <span className="text-pk">*</span>}
        </label>
      )}
      {def.type === "text" && <input value={value ?? ""} onChange={(e) => set(e.target.value)} className={inputCls} data-testid={`field-${def.key}`} />}
      {def.type === "number" && <input type="number" value={value ?? ""} onChange={(e) => set(Number(e.target.value))} className={inputCls} data-testid={`field-${def.key}`} />}
      {def.type === "textarea" && (
        <textarea rows={def.rows || 3} value={value ?? ""} onChange={(e) => set(e.target.value)}
          className="w-full px-3 py-2 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none resize-y"
          data-testid={`field-${def.key}`} />
      )}
      {def.type === "select" && (
        <select value={value ?? ""} onChange={(e) => set(e.target.value)} className={inputCls} data-testid={`field-${def.key}`}>
          {def.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
      {def.type === "checkbox" && (
        <label className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.15em] uppercase text-ink2 cursor-pointer">
          <input type="checkbox" checked={!!value} onChange={(e) => set(e.target.checked)} data-testid={`field-${def.key}`} className="accent-[#a855f7] w-4 h-4" />
          {def.label}
        </label>
      )}
      {def.type === "list" && <ListEditor value={value} onChange={set} hint={def.hint} />}
      {def.type === "pipelist" && <PipeListEditor value={value} onChange={set} def={def} />}
      {def.type === "image" && <ImageField value={value} onChange={set} />}
      {error && <p className="mt-1.5 font-mono text-[10px] text-pk">{error}</p>}
    </div>
  );
}
