import { useEffect, useState } from "react";
import api, { formatApiError } from "../lib/api";
import { useContent } from "../lib/content";
import { StatusBadge } from "./fields";
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";

const inputCls = "w-full h-9 px-3 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none";
const labelCls = "block font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-1.5";
const KINDS = ["static", "dynamic", "system", "design", "support"];

function Panel({ title, meta, children, testid }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="panel" data-testid={testid}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left" aria-expanded={open}>
        <div>
          <span className="font-display font-bold text-sm text-ink">{title}</span>
          {meta && <span className="block font-mono text-[9px] text-ink3 mt-0.5 uppercase tracking-[0.15em]">{meta}</span>}
        </div>
        <span className="font-mono text-[9px] tracking-[0.2em] text-violet uppercase">{open ? "Close" : "Edit"}</span>
      </button>
      {open && <div className="px-5 pb-5 border-t border-line pt-5">{children}</div>}
    </div>
  );
}

function NumField({ label, value, onChange }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input type="number" value={value ?? 0} onChange={(e) => onChange(Number(e.target.value) || 0)} className={inputCls} />
    </div>
  );
}

export default function PricingAdmin() {
  const { refresh } = useContent();
  const [refs, setRefs] = useState(null);       // pricing collection
  const [est, setEst] = useState(null);         // estimator singleton
  const [msg, setMsg] = useState("");

  const load = () => {
    api.get("/admin/collection/pricing").then(({ data }) => setRefs(data.filter((p) => !p.archived)));
    api.get("/admin/singleton/estimator").then(({ data }) => setEst(data));
  };
  useEffect(() => { load(); }, []);

  const saveRef = async (p) => {
    try {
      await api.put(`/admin/collection/pricing/${p.id}`, p);
      setMsg("✓ Reference saved");
      load(); refresh();
    } catch (err) { setMsg(formatApiError(err.response?.data?.detail)); }
  };

  const saveEst = async () => {
    try {
      await api.put("/admin/singleton/estimator", est);
      setMsg("✓ Estimator rules saved — live on the pricing page");
      refresh();
    } catch (err) { setMsg(formatApiError(err.response?.data?.detail)); }
  };

  const setEstKey = (k, v) => setEst({ ...est, [k]: v });
  const editRow = (key, i, patch) => setEstKey(key, est[key].map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const moveRow = (key, i, dir) => {
    const arr = [...est[key]];
    const [it] = arr.splice(i, 1);
    arr.splice(i + dir, 0, it);
    setEstKey(key, arr);
  };

  if (!refs || !est) return <p className="font-mono text-xs text-ink3 animate-blink">LOADING PRICING…</p>;

  return (
    <div data-testid="pricing-admin" className="max-w-4xl">
      <div className="mb-6">
        <span className="font-mono text-[10px] tracking-[0.3em] text-violet">ADMIN / PRICING</span>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">PRICING CONTROL</h1>
        <p className="mt-1.5 font-mono text-[9px] tracking-[0.15em] text-ink3 uppercase">Scope-based pricing. All values editable. Nothing hard-coded.</p>
      </div>
      {msg && <p className={`mb-4 font-mono text-xs ${msg.startsWith("✓") ? "text-grn" : "text-pk"}`}>{msg}</p>}

      <div className="space-y-3">
        <Panel title="STARTING PRICE REFERENCES" meta={`${refs.length} references`} testid="pa-refs">
          <div className="space-y-3">
            {refs.map((p) => (
              <div key={p.id} className="border border-line p-4 grid gap-3" data-testid={`pa-ref-${p.id}`}>
                <div className="grid sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2"><label className={labelCls}>Name</label>
                    <input value={p.name} onChange={(e) => setRefs(refs.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)))} className={inputCls} /></div>
                  <NumField label="Min ₱" value={p.min} onChange={(v) => setRefs(refs.map((x) => (x.id === p.id ? { ...x, min: v } : x)))} />
                  <NumField label="Max ₱" value={p.max} onChange={(v) => setRefs(refs.map((x) => (x.id === p.id ? { ...x, max: v } : x)))} />
                </div>
                <div className="grid sm:grid-cols-3 gap-3 items-end">
                  <div><label className={labelCls}>Kind</label>
                    <select value={p.kind} onChange={(e) => setRefs(refs.map((x) => (x.id === p.id ? { ...x, kind: e.target.value } : x)))} className={inputCls}>
                      {KINDS.map((k) => <option key={k}>{k}</option>)}
                    </select></div>
                  <label className="flex items-center gap-2 font-mono text-[10px] uppercase text-ink2 pb-2">
                    <input type="checkbox" checked={!!p.plus} onChange={(e) => setRefs(refs.map((x) => (x.id === p.id ? { ...x, plus: e.target.checked } : x)))} className="accent-[#a855f7] w-4 h-4" />
                    Show "+" after range
                  </label>
                  <div className="flex gap-2 pb-0.5">
                    <button onClick={() => saveRef(p)} data-testid={`pa-ref-save-${p.id}`}
                      className="h-9 px-4 bg-violet font-mono text-[9px] tracking-[0.15em] uppercase font-semibold" style={{ color: "var(--bg)" }}>Save</button>
                    <button onClick={async () => { await api.put(`/admin/collection/pricing/${p.id}`, { ...p, status: p.status === "published" ? "hidden" : "published" }); load(); refresh(); }}
                      className="h-9 px-3 border border-line font-mono text-[9px] uppercase text-ink2 hover:border-violet">
                      {p.status === "published" ? "Hide" : "Publish"}
                    </button>
                  </div>
                </div>
                <div><label className={labelCls}>Typical includes (one per line)</label>
                  <textarea rows={3} defaultValue={(p.typical || []).join("\n")}
                    onBlur={(e) => saveRef({ ...p, typical: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) })}
                    className="w-full px-3 py-2 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none resize-y" /></div>
                <div><label className={labelCls}>Note</label>
                  <input value={p.note || ""} onChange={(e) => setRefs(refs.map((x) => (x.id === p.id ? { ...x, note: e.target.value } : x)))}
                    onBlur={() => saveRef(refs.find((x) => x.id === p.id))} className={inputCls} /></div>
              </div>
            ))}
          </div>
          <button onClick={async () => { await api.post("/admin/collection/pricing", { name: "NEW REFERENCE", kind: "static", min: 1000, max: 5000, plus: false, typical: [], note: "", featured: false, status: "draft", order: refs.length + 1 }); load(); }}
            data-testid="pa-ref-add"
            className="mt-4 h-9 px-4 border border-line font-mono text-[10px] tracking-[0.15em] uppercase text-ink2 hover:border-violet inline-flex items-center gap-1.5">
            <Plus size={12} /> Add Price Reference
          </button>
        </Panel>

        <Panel title="ESTIMATOR — PROJECT TYPES" meta={`${est.types?.length || 0} types`} testid="pa-types">
          <div className="space-y-2">
            {(est.types || []).map((t, i) => (
              <div key={i} className="border border-line p-3 grid grid-cols-2 sm:grid-cols-7 gap-2 items-end">
                <div className="col-span-2"><label className={labelCls}>Label</label>
                  <input value={t.label} onChange={(e) => editRow("types", i, { label: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Kind</label>
                  <select value={t.kind} onChange={(e) => editRow("types", i, { kind: e.target.value })} className={inputCls}>
                    {KINDS.map((k) => <option key={k}>{k}</option>)}
                  </select></div>
                <NumField label="Min" value={t.min} onChange={(v) => editRow("types", i, { min: v })} />
                <NumField label="Max" value={t.max} onChange={(v) => editRow("types", i, { max: v })} />
                <NumField label="Weeks" value={t.weeks} onChange={(v) => editRow("types", i, { weeks: v })} />
                <button onClick={() => setEstKey("types", est.types.filter((_, j) => j !== i))} aria-label="Remove"
                  className="h-9 border border-line text-pk hover:border-pk grid place-items-center"><X size={12} /></button>
              </div>
            ))}
          </div>
          <button onClick={() => setEstKey("types", [...est.types, { label: "New Type", kind: "static", min: 3000, max: 6000, weeks: 2, complexity: "STANDARD" }])}
            data-testid="pa-type-add"
            className="mt-3 h-9 px-4 border border-line font-mono text-[10px] uppercase text-ink2 hover:border-violet inline-flex items-center gap-1.5">
            <Plus size={12} /> Add Project Type
          </button>
        </Panel>

        <Panel title="STATIC PAGE BRACKETS" meta="price added per page-count bracket" testid="pa-pages">
          <div className="space-y-2">
            {(est.pageBrackets || []).map((b, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 items-end border border-line p-3">
                <div><label className={labelCls}>Pages</label>
                  <input value={b.label} onChange={(e) => editRow("pageBrackets", i, { label: e.target.value })} className={inputCls} /></div>
                <NumField label="+Min" value={b.addMin} onChange={(v) => editRow("pageBrackets", i, { addMin: v })} />
                <NumField label="+Max" value={b.addMax} onChange={(v) => editRow("pageBrackets", i, { addMax: v })} />
                <button onClick={() => setEstKey("pageBrackets", est.pageBrackets.filter((_, j) => j !== i))} aria-label="Remove"
                  className="h-9 border border-line text-pk grid place-items-center"><X size={12} /></button>
              </div>
            ))}
          </div>
          <button onClick={() => setEstKey("pageBrackets", [...(est.pageBrackets || []), { label: "11+", addMin: 0, addMax: 0 }])}
            className="mt-3 h-9 px-4 border border-line font-mono text-[10px] uppercase text-ink2 hover:border-violet">+ Add Bracket</button>
        </Panel>

        <Panel title="SYSTEM MODULE BRACKETS" meta="dynamic/system scope" testid="pa-modules">
          <div className="space-y-2">
            {(est.moduleBrackets || []).map((m, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 items-end border border-line p-3">
                <div><label className={labelCls}>Modules</label>
                  <input value={m.label} onChange={(e) => editRow("moduleBrackets", i, { label: e.target.value })} className={inputCls} /></div>
                <NumField label="+Min" value={m.addMin} onChange={(v) => editRow("moduleBrackets", i, { addMin: v })} />
                <NumField label="+Max" value={m.addMax} onChange={(v) => editRow("moduleBrackets", i, { addMax: v })} />
                <NumField label="+Weeks" value={m.weeks} onChange={(v) => editRow("moduleBrackets", i, { weeks: v })} />
                <button onClick={() => setEstKey("moduleBrackets", est.moduleBrackets.filter((_, j) => j !== i))} aria-label="Remove"
                  className="h-9 border border-line text-pk grid place-items-center"><X size={12} /></button>
              </div>
            ))}
          </div>
          <button onClick={() => setEstKey("moduleBrackets", [...(est.moduleBrackets || []), { label: "New", addMin: 0, addMax: 0, weeks: 0 }])}
            className="mt-3 h-9 px-4 border border-line font-mono text-[10px] uppercase text-ink2 hover:border-violet">+ Add Bracket</button>
        </Panel>

        <Panel title="FEATURE COSTS" meta="internal calculation values — not individually exposed" testid="pa-features">
          <div className="space-y-2">
            {(est.features || []).map((f, i) => (
              <div key={i} className="grid grid-cols-[1fr_120px_40px] gap-2 items-end border border-line p-3">
                <div><label className={labelCls}>Feature</label>
                  <input value={f.label} onChange={(e) => editRow("features", i, { label: e.target.value })} className={inputCls} /></div>
                <NumField label="+₱" value={f.add} onChange={(v) => editRow("features", i, { add: v })} />
                <button onClick={() => setEstKey("features", est.features.filter((_, j) => j !== i))} aria-label="Remove"
                  className="h-9 border border-line text-pk grid place-items-center"><X size={12} /></button>
              </div>
            ))}
          </div>
          <button onClick={() => setEstKey("features", [...(est.features || []), { label: "New Feature", add: 1000 }])}
            data-testid="pa-feature-add"
            className="mt-3 h-9 px-4 border border-line font-mono text-[10px] uppercase text-ink2 hover:border-violet">+ Add Feature</button>
        </Panel>

        <Panel title="DESIGN & TIMELINE MULTIPLIERS" meta="urgency and design effort" testid="pa-multipliers">
          <div className="grid sm:grid-cols-2 gap-6">
            {["design", "timeline"].map((key) => (
              <div key={key}>
                <span className={labelCls}>{key.toUpperCase()}</span>
                <div className="space-y-2">
                  {(est[key] || []).map((d, i) => (
                    <div key={i} className="grid grid-cols-[1fr_90px_36px] gap-2 items-end">
                      <input value={d.label} onChange={(e) => editRow(key, i, { label: e.target.value })} className={inputCls} />
                      <input type="number" step="0.05" value={d.mult} onChange={(e) => editRow(key, i, { mult: Number(e.target.value) || 1 })} className={inputCls} />
                      <button onClick={() => setEstKey(key, est[key].filter((_, j) => j !== i))} aria-label="Remove"
                        className="h-9 border border-line text-pk grid place-items-center"><X size={12} /></button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setEstKey(key, [...(est[key] || []), { label: "New", mult: 1 }])}
                  className="mt-2 h-8 px-3 border border-line font-mono text-[9px] uppercase text-ink2 hover:border-violet">+ Add</button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="MESSAGING & DISCLAIMERS" meta="pricing page copy" testid="pa-messaging">
          <div className="grid gap-4">
            <div><label className={labelCls}>Philosophy Heading</label>
              <input value={est.philosophyHeading || ""} onChange={(e) => setEstKey("philosophyHeading", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Philosophy Body</label>
              <textarea rows={3} value={est.philosophyBody || ""} onChange={(e) => setEstKey("philosophyBody", e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none resize-y" /></div>
            <div><label className={labelCls}>Architecture Note (dynamic pricing warning)</label>
              <textarea rows={2} value={est.architectureNote || ""} onChange={(e) => setEstKey("architectureNote", e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none resize-y" /></div>
            <div><label className={labelCls}>Result Disclaimer</label>
              <textarea rows={2} value={est.resultDisclaimer || ""} onChange={(e) => setEstKey("resultDisclaimer", e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none resize-y" /></div>
            <div><label className={labelCls}>Estimator Disclaimer</label>
              <textarea rows={2} value={est.disclaimer || ""} onChange={(e) => setEstKey("disclaimer", e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none resize-y" /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Budget options (contact form, one per line)</label>
                <textarea rows={4} value={(est.budgetOptions || []).join("\n")}
                  onChange={(e) => setEstKey("budgetOptions", e.target.value.split("\n").map((x) => x.trim()).filter(Boolean))}
                  className="w-full px-3 py-2 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none resize-y" /></div>
              <div><label className={labelCls}>Project types (contact form, one per line)</label>
                <textarea rows={4} value={(est.projectTypes || []).join("\n")}
                  onChange={(e) => setEstKey("projectTypes", e.target.value.split("\n").map((x) => x.trim()).filter(Boolean))}
                  className="w-full px-3 py-2 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none resize-y" /></div>
            </div>
          </div>
        </Panel>
      </div>

      <button onClick={saveEst} data-testid="pa-save-estimator"
        className="mt-6 h-11 px-8 bg-violet font-mono text-[11px] tracking-[0.2em] uppercase font-semibold" style={{ color: "var(--bg)" }}>
        Save Estimator Rules →
      </button>
    </div>
  );
}
