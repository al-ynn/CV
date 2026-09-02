import { useEffect, useRef, useState } from "react";
import api, { formatApiError } from "../lib/api";
import { useContent } from "../lib/content";
import { ABOUT_TEMPLATES, PHOTO_ROLES, SECTION_NAMES, CUSTOM_BLOCK_TYPES, STATUS_BADGE, timeAgo } from "./aboutShared";
import { MediaPicker } from "./fields";
import { ArrowUp, ArrowDown, X, Plus, Eye, RotateCcw, Monitor, Tablet, Smartphone, ExternalLink } from "lucide-react";
import { useAdminFeedback } from "./AdminFeedback";

const TABS = ["CONTENT", "PHOTOS", "SECTIONS", "TEMPLATE", "STATS & SEO", "HISTORY"];
const DEVICES = { desktop: { label: "Desktop", width: "100%", icon: Monitor }, tablet: { label: "Tablet", width: 820, icon: Tablet }, mobile: { label: "Mobile", width: 390, icon: Smartphone } };

const inputCls = "w-full h-10 px-3 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none";
const labelCls = "block font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-1.5";

const L = ({ label, children, wide }) => (
  <div className={wide ? "sm:col-span-2" : ""}>
    <label className={labelCls}>{label}</label>
    {children}
  </div>
);
const Txt = ({ value, onChange, testid }) => <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputCls} data-testid={testid} />;
const Txa = ({ value, onChange, rows = 3, testid }) => (
  <textarea rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} data-testid={testid}
    className="w-full px-3 py-2 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none resize-y" />
);

function PipeEdit({ value = [], keys, hint, onChange }) {
  const text = (value || []).map((it) => keys.map((k) => it[k] ?? "").join(" | ")).join("\n");
  return (
    <div>
      <textarea rows={Math.max(4, Math.min(14, (value || []).length + 1))} defaultValue={text}
        onBlur={(e) => onChange(e.target.value.split("\n").filter((l) => l.trim()).map((line) => {
          const parts = line.split("|").map((x) => x.trim());
          const o = {};
          keys.forEach((k, i) => (o[k] = parts[i] ?? ""));
          return o;
        }).filter((o) => o[keys[0]]))}
        className="w-full px-3 py-2 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none resize-y" />
      {hint && <p className="mt-1 font-mono text-[9px] text-ink3">{hint} — saved on blur</p>}
    </div>
  );
}

function ListEdit({ value = [], onChange, placeholder }) {
  const [d, setD] = useState("");
  const items = value || [];
  return (
    <div>
      <div className="flex gap-2">
        <input value={d} onChange={(e) => setD(e.target.value)} placeholder={placeholder || "Add item…"} className={inputCls}
          onKeyDown={(e) => { if (e.key === "Enter" && d.trim()) { e.preventDefault(); onChange([...items, d.trim()]); setD(""); } }} />
        <button type="button" onClick={() => { if (d.trim()) { onChange([...items, d.trim()]); setD(""); } }}
          className="h-10 px-4 border border-line text-ink2 hover:border-violet shrink-0"><Plus size={13} /></button>
      </div>
      <div className="mt-2 space-y-1">
        {items.map((it, i) => (
          <div key={`${it}-${i}`} className="flex items-center gap-1">
            <span className="flex-1 px-3 py-1.5 bg-canvas border border-line font-mono text-[11px] text-ink2 truncate">{it}</span>
            <button type="button" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-1.5 text-ink3 hover:text-pk"><X size={12} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AboutEditor({ profileId, onBack }) {
  const { confirm } = useAdminFeedback();
  const { refresh } = useContent();
  const [p, setP] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [tab, setTab] = useState("CONTENT");
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState(null); // {url}
  const [device, setDevice] = useState("desktop");
  const [revisions, setRevisions] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sportsPickerOpen, setSportsPickerOpen] = useState(false);
  const dirtyRef = useRef(false);
  const pRef = useRef(null);
  dirtyRef.current = dirty;
  pRef.current = p;

  const load = () => api.get(`/admin/about/profiles/${profileId}`).then(({ data }) => { setP(data); setDirty(false); });
  useEffect(() => { load().catch(() => setMsg("Profile not found")); }, [profileId]);

  const save = async (silent = false) => {
    try {
      const doc = { ...pRef.current };
      const { data } = await api.put(`/admin/about/profiles/${profileId}`, doc);
      if (data.profile) setP(data.profile);
      setDirty(false);
      setLastSaved(data.updated_at);
      if (!silent) setMsg("✓ Draft saved");
    } catch (err) {
      if (!silent) setMsg(formatApiError(err.response?.data?.detail));
    }
  };

  // autosave draft every 20s while dirty
  useEffect(() => {
    const id = setInterval(() => { if (dirtyRef.current && pRef.current) save(true); }, 20000);
    return () => clearInterval(id);
  }, []);

  // warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e) => { if (dirtyRef.current) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const set = (path, value) => {
    const keys = path.split(".");
    setP((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]] = cur[keys[i]] || {};
      cur[keys[keys.length - 1]] = value;
      return copy;
    });
    setDirty(true);
  };

  const publish = async () => {
    await save(true);
    try {
      await api.post(`/admin/about/profiles/${profileId}/publish`);
      setMsg("✓ Published — /about now uses this profile");
      load();
      refresh();
    } catch (err) {
      setMsg(formatApiError(err.response?.data?.detail));
    }
  };

  const openPreview = async (newTab = false) => {
    await save(true);
    const { data } = await api.post(`/admin/about/profiles/${profileId}/preview-token`);
    const url = `${window.location.origin}${data.url}?t=${Date.now()}`;
    if (newTab) window.open(url, "_blank");
    else setPreview({ url });
  };

  const back = async () => {
    if (dirty && !await confirm({ title: "Discard unsaved changes?", description: "Changes to this About profile have not been saved.", confirmLabel: "Discard changes", danger: true })) return;
    onBack();
  };

  if (!p) return <p className="font-mono text-xs text-ink3 animate-blink">LOADING PROFILE…</p>;

  const tmpl = ABOUT_TEMPLATES.find((t) => t.id === p.template) || ABOUT_TEMPLATES[3];
  const photoCount = (p.photos || []).length;

  // ---------- photos tab helpers ----------
  const addPhotos = async (urls) => {
    const selectedUrls = Array.isArray(urls) ? urls : [urls];
    const current = pRef.current;
    const existing = new Set((current.photos || []).map((photo) => photo.url));
    const additions = selectedUrls.filter((url) => !existing.has(url)).map((url) => ({
      url, role: "Other", caption: "", alt: "", focalX: 50, focalY: 50,
    }));
    const next = { ...current, photos: [...(current.photos || []), ...additions] };
    setP(next);
    setDirty(true);
    try {
      const { data } = await api.put(`/admin/about/profiles/${profileId}`, next);
      setP(data.profile || next);
      setDirty(false);
      setLastSaved(data.updated_at);
      setMsg(`✓ ${additions.length} photo${additions.length === 1 ? "" : "s"} added and saved`);
    } catch (error) {
      setP(current);
      setDirty(false);
      throw error;
    }
  };
  const movePhoto = (i, dir) => {
    const ph = [...p.photos];
    const [it] = ph.splice(i, 1);
    ph.splice(i + dir, 0, it);
    set("photos", ph);
  };
  const setFocal = (i, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fx = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const fy = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    const ph = [...p.photos];
    ph[i] = { ...ph[i], focalX: fx, focalY: fy };
    set("photos", ph);
  };

  // ---------- sports gallery helpers ----------
  const addSportsPhoto = (url) => {
    set("sportsGallery", [...(p.sportsGallery || []), { url, sport: "Sport", caption: "", alt: "", focalX: 50, focalY: 40 }]);
  };
  const moveSportsPhoto = (i, dir) => {
    const ph = [...(p.sportsGallery || [])];
    const [it] = ph.splice(i, 1);
    ph.splice(i + dir, 0, it);
    set("sportsGallery", ph);
  };
  const setSportsField = (i, key, value) => {
    const ph = [...(p.sportsGallery || [])];
    ph[i] = { ...ph[i], [key]: value };
    set("sportsGallery", ph);
  };
  const setSportsFocal = (i, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fx = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const fy = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setSportsField(i, "focalX", fx);
    const ph = [...(p.sportsGallery || [])];
    ph[i] = { ...ph[i], focalX: fx, focalY: fy };
    set("sportsGallery", ph);
  };

  // ---------- sections tab helpers ----------
  const moveSection = (i, dir) => {
    const s = [...p.sections];
    const [it] = s.splice(i, 1);
    s.splice(i + dir, 0, it);
    set("sections", s);
  };
  const addCustom = (type) => {
    const id = Math.random().toString(36).slice(2, 9);
    set("customSections", [...(p.customSections || []), { id, name: `Section ${id}`, type, heading: "", eyebrow: "", content: "", items: [], images: [], visible: true }]);
    set("sections", [...p.sections, { key: `custom:${id}`, visible: true }]);
  };
  const removeCustom = (id) => {
    set("customSections", (p.customSections || []).filter((c) => c.id !== id));
    set("sections", p.sections.filter((s) => s.key !== `custom:${id}`));
  };
  const setCustom = (id, key, value) => {
    set("customSections", (p.customSections || []).map((c) => (c.id === id ? { ...c, [key]: value } : c)));
  };

  return (
    <div data-testid="about-editor">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <button onClick={back} className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 hover:text-violet mb-2">← All Profiles</button>
          <div className="flex flex-wrap items-center gap-3">
            <input value={p.name} onChange={(e) => set("name", e.target.value)} data-testid="about-name"
              className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-ink bg-transparent border-b border-transparent hover:border-line focus:border-violet focus:outline-none" />
            <span className={`font-mono text-[9px] tracking-[0.2em] px-2 py-0.5 border uppercase ${STATUS_BADGE[p.status]}`}>{p.status}</span>
          </div>
          <p className="mt-1.5 font-mono text-[9px] tracking-[0.15em] text-ink3 uppercase">
            Template 0{p.template} / {tmpl.name} · Photos {photoCount}/{tmpl.photoLabel} recommended
            {dirty ? " · UNSAVED CHANGES" : lastSaved ? ` · Last saved ${timeAgo(lastSaved)}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => openPreview(false)} data-testid="about-preview-btn"
            className="h-9 px-4 border border-line font-mono text-[10px] tracking-[0.15em] uppercase text-ink2 hover:border-violet inline-flex items-center gap-1.5">
            <Eye size={12} /> Preview
          </button>
          <button onClick={() => openPreview(true)} data-testid="about-preview-newtab"
            className="h-9 px-4 border border-line font-mono text-[10px] uppercase text-ink2 hover:border-violet inline-flex items-center gap-1.5">
            <ExternalLink size={12} /> New Tab
          </button>
          <button onClick={() => save()} data-testid="about-save-draft"
            className="h-9 px-4 border border-amb/50 font-mono text-[10px] tracking-[0.15em] uppercase text-amb hover:bg-amb/10">
            Save Draft
          </button>
          <button onClick={publish} data-testid="about-publish"
            className="h-9 px-5 bg-violet font-mono text-[10px] tracking-[0.15em] uppercase font-semibold" style={{ color: "var(--bg)" }}>
            Publish →
          </button>
        </div>
      </div>

      {msg && <p className={`mb-4 font-mono text-xs ${msg.startsWith("✓") ? "text-grn" : "text-pk"}`} data-testid="about-editor-msg">{msg}</p>}

      {/* tabs */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} data-testid={`about-tab-${t.toLowerCase().replace(/[^a-z]+/g, "-")}`}
            className={`h-9 px-4 font-mono text-[9px] tracking-[0.2em] border whitespace-nowrap transition-colors ${
              tab === t ? "border-violet text-violet bg-violet/10" : "border-line text-ink3 hover:text-ink"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {tab === "CONTENT" && (
        <div className="space-y-8 max-w-4xl">
          <div className="panel p-5 sm:p-6 grid sm:grid-cols-2 gap-4">
            <span className="sm:col-span-2 font-mono text-[10px] tracking-[0.3em] text-violet">INTRODUCTION</span>
            <L label="Eyebrow"><Txt value={p.intro?.eyebrow} onChange={(v) => set("intro.eyebrow", v)} /></L>
            <L label="Heading (*word* = accent)"><Txt value={p.intro?.heading} onChange={(v) => set("intro.heading", v)} testid="intro-heading" /></L>
            <L label="Body" wide><Txa value={p.intro?.body} onChange={(v) => set("intro.body", v)} rows={4} /></L>
          </div>

          <div className="panel p-5 sm:p-6 grid gap-4">
            <span className="font-mono text-[10px] tracking-[0.3em] text-violet">MY STORY</span>
            {[["beforeTheCode", "01 Before the Code (sports background)"], ["theShift", "02 The Shift"],
              ["firstSystem", "03 First Major System (SoilTrack)"], ["choosingThePath", "04 Choosing the Path"],
              ["today", "05 Today"], ["theGoal", "06 The Goal"]].map(([k, label]) => (
              <L key={k} label={label} wide><Txa value={p.story?.[k]} onChange={(v) => set(`story.${k}`, v)} rows={3} /></L>
            ))}
          </div>

          <div className="panel p-5 sm:p-6 grid gap-4">
            <span className="font-mono text-[10px] tracking-[0.3em] text-violet">WORKING STUDENT</span>
            <L label="Heading" wide><Txt value={p.workingStudent?.heading} onChange={(v) => set("workingStudent.heading", v)} /></L>
            <L label="Body" wide><Txa value={p.workingStudent?.body} onChange={(v) => set("workingStudent.body", v)} rows={3} /></L>
          </div>

          <div className="panel p-5 sm:p-6 grid gap-4">
            <span className="font-mono text-[10px] tracking-[0.3em] text-violet">HOW I WORK (PIPELINE STEPS)</span>
            <PipeEdit value={p.howIWork} keys={["num", "title", "desc"]} onChange={(v) => set("howIWork", v)}
              hint="Num | Title | Description — e.g. 01 | DISCOVER | Understand the problem" />
            <L label="Note" wide><Txa value={p.howIWorkNote} onChange={(v) => set("howIWorkNote", v)} rows={2} /></L>
          </div>

          <div className="panel p-5 sm:p-6 grid gap-4">
            <span className="font-mono text-[10px] tracking-[0.3em] text-violet">PRINCIPLES</span>
            <PipeEdit value={p.principles} keys={["title", "desc"]} onChange={(v) => set("principles", v)}
              hint="Title | Description" />
          </div>

          <div className="panel p-5 sm:p-6 grid gap-4">
            <span className="font-mono text-[10px] tracking-[0.3em] text-violet">BEYOND CODE / SPORTS / GAMING</span>
            <L label="Beyond Code Heading" wide><Txt value={p.beyondCode?.heading} onChange={(v) => set("beyondCode.heading", v)} /></L>
            <L label="Beyond Code Body" wide><Txa value={p.beyondCode?.body} onChange={(v) => set("beyondCode.body", v)} rows={2} /></L>
            <L label="Beyond Code Items" wide><ListEdit value={p.beyondCode?.items} onChange={(v) => set("beyondCode.items", v)} /></L>
            <L label="Sports Heading" wide><Txt value={p.sports?.heading} onChange={(v) => set("sports.heading", v)} /></L>
            <L label="Sports Body" wide><Txa value={p.sports?.body} onChange={(v) => set("sports.body", v)} rows={2} /></L>
            <L label="Physical Sports" wide><ListEdit value={p.sports?.items} onChange={(v) => set("sports.items", v)} /></L>
            <L label="Digital / Gaming" wide><ListEdit value={p.gaming?.digital} onChange={(v) => set("gaming.digital", v)} /></L>
          </div>

          <div className="panel p-5 sm:p-6 grid gap-4">
            <span className="font-mono text-[10px] tracking-[0.3em] text-violet">SPORT → DEV MAP / INTERESTS</span>
            <PipeEdit value={p.sportToDev} keys={["sport", "dev"]} onChange={(v) => set("sportToDev", v)} hint="Sport term | Dev term — e.g. TRAIN | LEARN" />
            <L label="Interests" wide><ListEdit value={p.interests} onChange={(v) => set("interests", v)} /></L>
          </div>

          <div className="panel p-5 sm:p-6 grid gap-4">
            <span className="font-mono text-[10px] tracking-[0.3em] text-violet">CAREER GOAL / OPEN TO / FOCUS / CTA</span>
            <L label="Goal Heading" wide><Txt value={p.careerGoal?.heading} onChange={(v) => set("careerGoal.heading", v)} /></L>
            <L label="Goal Status Label"><Txt value={p.careerGoal?.statusLabel} onChange={(v) => set("careerGoal.statusLabel", v)} /></L>
            <L label="Goal Body" wide><Txa value={p.careerGoal?.body} onChange={(v) => set("careerGoal.body", v)} rows={3} /></L>
            <L label="Open To — Intro Text" wide><Txa value={p.openTo?.body} onChange={(v) => set("openTo.body", v)} rows={2} /></L>
            <L label="Open To — Items" wide><ListEdit value={p.openTo?.items} onChange={(v) => set("openTo.items", v)} /></L>
            <L label="Current Focus" wide><PipeEdit value={p.currentFocus} keys={["label", "value"]} onChange={(v) => set("currentFocus", v)} hint="Label | Value — e.g. BUILDING | Full-stack systems" /></L>
            <L label="Resume CTA Heading"><Txt value={p.cta?.resumeHeading} onChange={(v) => set("cta.resumeHeading", v)} /></L>
            <L label="Contact CTA Label"><Txt value={p.cta?.contactHeading} onChange={(v) => set("cta.contactHeading", v)} /></L>
            <L label="Contact CTA Line" wide><Txt value={p.cta?.contactBody} onChange={(v) => set("cta.contactBody", v)} /></L>
            <L label="Featured Project Slugs (blank = featured projects)" wide><ListEdit value={p.projectsHighlight} onChange={(v) => set("projectsHighlight", v)} placeholder="e.g. studya" /></L>
          </div>
        </div>
      )}

      {/* PHOTOS */}
      {tab === "PHOTOS" && (
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-5">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink3">
              {photoCount} / {tmpl.photoLabel} recommended for Template 0{p.template} — fewer is fine, the layout adapts
            </p>
            <button onClick={() => setPickerOpen(true)} data-testid="photo-add"
              className="h-9 px-4 bg-violet font-mono text-[10px] tracking-[0.2em] uppercase font-semibold inline-flex items-center gap-1.5" style={{ color: "var(--bg)" }}>
              <Plus size={12} /> Add Photo
            </button>
          </div>
          <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={addPhotos} multiple />
          {photoCount === 0 && (
            <div className="panel p-12 text-center">
              <p className="font-mono text-xs tracking-[0.25em] text-ink3 mb-2">NO PHOTOS</p>
              <p className="font-mono text-[10px] text-ink3">Add photos from the Media Library. Click a photo to set its focal point.</p>
            </div>
          )}
          <div className="space-y-4">
            {(p.photos || []).map((ph, i) => (
              <div key={i} className="panel p-4 grid sm:grid-cols-[180px_1fr] gap-4" data-testid={`photo-row-${i}`}>
                <div>
                  <div className="relative aspect-video sm:aspect-square bg-canvas2 border border-line overflow-hidden cursor-crosshair"
                    onClick={(e) => setFocal(i, e)} title="Click to set focal point">
                    <img src={`${process.env.REACT_APP_BACKEND_URL}${ph.url}`} alt={ph.alt || ""}
                      className="w-full h-full object-cover" style={{ objectPosition: `${ph.focalX}% ${ph.focalY}%` }} />
                    <span className="absolute w-3 h-3 rounded-full border-2 border-violet bg-violet/40 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ left: `${ph.focalX}%`, top: `${ph.focalY}%` }} />
                  </div>
                  <p className="mt-1.5 font-mono text-[8px] tracking-[0.15em] text-ink3 uppercase text-center">focal {ph.focalX}% · {ph.focalY}%</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 content-start">
                  <div>
                    <label className={labelCls}>Role</label>
                    <select value={ph.role} onChange={(e) => { const ph2 = [...p.photos]; ph2[i] = { ...ph, role: e.target.value }; set("photos", ph2); }}
                      className={inputCls} data-testid={`photo-role-${i}`}>
                      {PHOTO_ROLES.map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Caption</label>
                    <input value={ph.caption} onChange={(e) => { const ph2 = [...p.photos]; ph2[i] = { ...ph, caption: e.target.value }; set("photos", ph2); }} className={inputCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Alt Text</label>
                    <input value={ph.alt} onChange={(e) => { const ph2 = [...p.photos]; ph2[i] = { ...ph, alt: e.target.value }; set("photos", ph2); }} className={inputCls} />
                  </div>
                  <div className="sm:col-span-2 flex gap-1.5">
                    <button onClick={() => movePhoto(i, -1)} disabled={i === 0} aria-label="Move up" className="p-2 border border-line text-ink3 hover:text-violet disabled:opacity-20"><ArrowUp size={12} /></button>
                    <button onClick={() => movePhoto(i, 1)} disabled={i === photoCount - 1} aria-label="Move down" className="p-2 border border-line text-ink3 hover:text-violet disabled:opacity-20"><ArrowDown size={12} /></button>
                    <button onClick={() => set("photos", p.photos.filter((_, j) => j !== i))} aria-label="Remove" className="p-2 border border-line text-pk hover:border-pk"><X size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ---------- SPORTS GALLERY ---------- */}
          <div className="mt-12 pt-8 border-t border-line">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] tracking-[0.25em] text-grn">SPORTS GALLERY</span>
              <button onClick={() => setSportsPickerOpen(true)} data-testid="sports-photo-add"
                className="h-9 px-4 border border-grn/50 font-mono text-[10px] tracking-[0.2em] uppercase text-grn hover:bg-grn/10 inline-flex items-center gap-1.5">
                <Plus size={12} /> Add Sports Photo
              </button>
            </div>
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink3 mb-5">
              Shown in the OFF_CLOCK / Sports section — {(p.sportsGallery || []).length} photo(s). Click a photo to set its focal point.
            </p>
            <MediaPicker open={sportsPickerOpen} onClose={() => setSportsPickerOpen(false)} onSelect={addSportsPhoto} />
            {(p.sportsGallery || []).length === 0 && (
              <div className="panel p-10 text-center">
                <p className="font-mono text-xs tracking-[0.25em] text-ink3 mb-2">NO SPORTS PHOTOS</p>
                <p className="font-mono text-[10px] text-ink3">Add match photos (volleyball, futsal, badminton…) from the Media Library.</p>
              </div>
            )}
            <div className="space-y-4">
              {(p.sportsGallery || []).map((ph, i) => (
                <div key={i} className="panel p-4 grid sm:grid-cols-[180px_1fr] gap-4" data-testid={`sports-photo-row-${i}`}>
                  <div>
                    <div className="relative aspect-[3/4] bg-canvas2 border border-line overflow-hidden cursor-crosshair"
                      onClick={(e) => setSportsFocal(i, e)} title="Click to set focal point">
                      <img src={`${process.env.REACT_APP_BACKEND_URL}${ph.url}`} alt={ph.alt || ""}
                        className="w-full h-full object-cover" style={{ objectPosition: `${ph.focalX}% ${ph.focalY}%` }} />
                      <span className="absolute w-3 h-3 rounded-full border-2 border-grn bg-grn/40 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ left: `${ph.focalX}%`, top: `${ph.focalY}%` }} />
                    </div>
                    <p className="mt-1.5 font-mono text-[8px] tracking-[0.15em] text-ink3 uppercase text-center">focal {ph.focalX}% · {ph.focalY}%</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 content-start">
                    <div>
                      <label className={labelCls}>Sport</label>
                      <input value={ph.sport || ""} onChange={(e) => setSportsField(i, "sport", e.target.value)} className={inputCls}
                        placeholder="Volleyball" data-testid={`sports-photo-sport-${i}`} />
                    </div>
                    <div>
                      <label className={labelCls}>Caption</label>
                      <input value={ph.caption || ""} onChange={(e) => setSportsField(i, "caption", e.target.value)} className={inputCls} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Alt Text</label>
                      <input value={ph.alt || ""} onChange={(e) => setSportsField(i, "alt", e.target.value)} className={inputCls} />
                    </div>
                    <div className="sm:col-span-2 flex gap-1.5">
                      <button onClick={() => moveSportsPhoto(i, -1)} disabled={i === 0} aria-label="Move up" className="p-2 border border-line text-ink3 hover:text-grn disabled:opacity-20"><ArrowUp size={12} /></button>
                      <button onClick={() => moveSportsPhoto(i, 1)} disabled={i === (p.sportsGallery || []).length - 1} aria-label="Move down" className="p-2 border border-line text-ink3 hover:text-grn disabled:opacity-20"><ArrowDown size={12} /></button>
                      <button onClick={() => set("sportsGallery", (p.sportsGallery || []).filter((_, j) => j !== i))} aria-label="Remove" className="p-2 border border-line text-pk hover:border-pk"><X size={12} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SECTIONS */}
      {tab === "SECTIONS" && (
        <div className="max-w-2xl space-y-6">
          <div className="panel divide-y divide-line" data-testid="about-sections-list">
            {(p.sections || []).map((s, i) => (
              <div key={s.key} className="flex items-center gap-3 px-4 py-3">
                <div className="flex flex-col">
                  <button onClick={() => moveSection(i, -1)} disabled={i === 0} aria-label="Move up" className="text-ink3 hover:text-violet disabled:opacity-20"><ArrowUp size={11} /></button>
                  <button onClick={() => moveSection(i, 1)} disabled={i === p.sections.length - 1} aria-label="Move down" className="text-ink3 hover:text-violet disabled:opacity-20"><ArrowDown size={11} /></button>
                </div>
                <label className="flex items-center gap-2.5 flex-1 font-mono text-[11px] text-ink2 cursor-pointer">
                  <input type="checkbox" checked={s.visible}
                    onChange={(e) => set("sections", p.sections.map((x, j) => (j === i ? { ...x, visible: e.target.checked } : x)))}
                    className="accent-[#a855f7] w-4 h-4" data-testid={`section-vis-${s.key}`} />
                  {s.key.startsWith("custom:") ? (p.customSections || []).find((c) => `custom:${c.id}` === s.key)?.name || s.key : SECTION_NAMES[s.key] || s.key}
                </label>
                {s.key.startsWith("custom:") && (
                  <button onClick={() => removeCustom(s.key.slice(7))} aria-label="Remove custom section" className="p-1.5 text-ink3 hover:text-pk"><X size={12} /></button>
                )}
              </div>
            ))}
          </div>

          <div className="panel p-5">
            <span className="font-mono text-[10px] tracking-[0.25em] text-violet block mb-4">+ ADD CUSTOM SECTION</span>
            <div className="flex flex-wrap gap-2">
              {CUSTOM_BLOCK_TYPES.map((t) => (
                <button key={t} onClick={() => addCustom(t)} data-testid={`add-block-${t}`}
                  className="h-9 px-4 border border-line font-mono text-[10px] tracking-[0.15em] uppercase text-ink2 hover:border-violet hover:text-violet">
                  {t}
                </button>
              ))}
            </div>
          </div>

          {(p.customSections || []).map((c) => (
            <div key={c.id} className="panel p-5 grid gap-3">
              <span className="font-mono text-[9px] tracking-[0.25em] text-cy uppercase">CUSTOM / {c.type}</span>
              <div className="grid sm:grid-cols-2 gap-3">
                <L label="Admin Name"><Txt value={c.name} onChange={(v) => setCustom(c.id, "name", v)} /></L>
                <L label="Public Heading"><Txt value={c.heading} onChange={(v) => setCustom(c.id, "heading", v)} /></L>
              </div>
              <L label="Eyebrow Label"><Txt value={c.eyebrow} onChange={(v) => setCustom(c.id, "eyebrow", v)} /></L>
              {(c.type === "text" || c.type === "quote" || c.type === "cta") && (
                <L label="Content"><Txa value={c.content} onChange={(v) => setCustom(c.id, "content", v)} rows={3} /></L>
              )}
              {(c.type === "cards" || c.type === "timeline") && (
                <L label="Items"><PipeEdit value={c.items} keys={["title", "desc"]} onChange={(v) => setCustom(c.id, "items", v)} hint="Title | Description" /></L>
              )}
              {c.type === "gallery" && (
                <L label="Image URLs (from Media Library)"><ListEdit value={c.images} onChange={(v) => setCustom(c.id, "images", v)} placeholder="/api/media/files/…" /></L>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TEMPLATE */}
      {tab === "TEMPLATE" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl" data-testid="template-picker">
          {ABOUT_TEMPLATES.map((t) => (
            <div key={t.id} className={`panel p-5 ${p.template === t.id ? "border-violet" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xl font-bold text-violet">0{t.id}</span>
                {p.template === t.id && <span className="font-mono text-[9px] tracking-[0.2em] text-grn">ACTIVE</span>}
              </div>
              <h3 className="font-display text-base font-bold text-ink">{t.name}</h3>
              <p className="mt-1.5 font-mono text-[9px] tracking-[0.15em] uppercase text-ink3">Photos: {t.photoLabel} recommended</p>
              <p className="mt-1 font-mono text-[9px] text-ink3">{t.best}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => { set("template", t.id); }} data-testid={`template-apply-${t.id}`}
                  className={`h-8 px-3 font-mono text-[9px] tracking-[0.15em] uppercase ${
                    p.template === t.id ? "border border-line text-ink3" : "bg-violet font-semibold"
                  }`} style={p.template === t.id ? {} : { color: "var(--bg)" }}>
                  {p.template === t.id ? "Selected" : "Apply Template"}
                </button>
                <button onClick={() => { set("template", t.id); openPreview(false); }}
                  className="h-8 px-3 border border-line font-mono text-[9px] tracking-[0.15em] uppercase text-ink2 hover:border-violet">
                  Preview
                </button>
              </div>
            </div>
          ))}
          <p className="sm:col-span-2 lg:col-span-3 font-mono text-[9px] tracking-[0.1em] text-ink3 uppercase leading-relaxed">
            Switching templates never deletes content — biography, story, photos, sections, and settings carry over. Only presentation changes.
          </p>
        </div>
      )}

      {/* STATS & SEO */}
      {tab === "STATS & SEO" && (
        <div className="max-w-2xl space-y-6">
          <div className="panel p-5">
            <span className="font-mono text-[10px] tracking-[0.25em] text-violet block mb-4">ABOUT STATISTICS — COMPUTED LIVE FROM THE DATABASE</span>
            <div className="space-y-2.5">
              {[["projects", "Published Projects"], ["technologies", "Active Technologies"], ["services", "Service Categories"], ["certifications", "Published Certifications"], ["experience", "Experience (freelance since 2025)"]].map(([k, label]) => (
                <label key={k} className="flex items-center gap-2.5 font-mono text-[11px] text-ink2 cursor-pointer">
                  <input type="checkbox" checked={!!p.statsSelection?.[k]}
                    onChange={(e) => set("statsSelection", { ...(p.statsSelection || {}), [k]: e.target.checked })}
                    className="accent-[#a855f7] w-4 h-4" data-testid={`stat-sel-${k}`} />
                  {label}
                </label>
              ))}
            </div>
            <p className="mt-4 font-mono text-[9px] text-ink3 uppercase">Counts are never manually entered — no inflated numbers.</p>
          </div>
          <div className="panel p-5 grid gap-4">
            <span className="font-mono text-[10px] tracking-[0.25em] text-violet">SEO (applies when this profile is published)</span>
            <L label="SEO Title" wide><Txt value={p.seo?.title} onChange={(v) => set("seo.title", v)} /></L>
            <L label="Meta Description" wide><Txa value={p.seo?.description} onChange={(v) => set("seo.description", v)} rows={2} /></L>
          </div>
        </div>
      )}

      {/* HISTORY */}
      {tab === "HISTORY" && (
        <div className="max-w-2xl">
          {!revisions && (
            <button onClick={async () => setRevisions((await api.get(`/admin/about/profiles/${profileId}/revisions`)).data)}
              data-testid="load-revisions"
              className="h-10 px-5 border border-line font-mono text-[10px] tracking-[0.2em] uppercase text-ink2 hover:border-violet">
              Load Revision History
            </button>
          )}
          {revisions && (
            <div className="panel divide-y divide-line" data-testid="revision-list">
              {revisions.length === 0 && <p className="px-5 py-6 font-mono text-xs text-ink3">No revisions recorded yet — they appear after your first edit.</p>}
              {[...revisions].reverse().map((r) => (
                <div key={r.index} className="flex items-center justify-between px-5 py-3.5 font-mono text-[11px]">
                  <span className="text-ink2">{r.note}</span>
                  <span className="text-ink3 text-[10px]">{new Date(r.at).toLocaleString()}</span>
                  <button
                    onClick={async () => await confirm({ title: "Restore this revision?", description: "It will become the current draft. Your present state is snapshotted first.", confirmLabel: "Restore revision" }) &&
                      api.post(`/admin/about/profiles/${profileId}/restore-revision/${r.index}`).then(load)}
                    className="px-3 h-8 border border-line font-mono text-[9px] tracking-[0.15em] uppercase text-ink2 hover:border-violet inline-flex items-center gap-1.5">
                    <RotateCcw size={11} /> Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* preview modal */}
      {preview && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-canvas" data-testid="about-preview-modal">
          <div className="flex items-center justify-between gap-3 px-4 h-14 border-b border-line shrink-0">
            <span className="font-mono text-[10px] tracking-[0.25em] text-amb uppercase">Preview — draft content · template 0{p.template}</span>
            <div className="flex items-center gap-1.5">
              {Object.entries(DEVICES).map(([key, d]) => (
                <button key={key} onClick={() => setDevice(key)} data-testid={`preview-${key}`}
                  className={`h-9 px-3 border font-mono text-[9px] uppercase inline-flex items-center gap-1.5 ${
                    device === key ? "border-violet text-violet" : "border-line text-ink3 hover:text-ink"
                  }`}>
                  <d.icon size={12} /> <span className="hidden sm:inline">{d.label}</span>
                </button>
              ))}
              <button onClick={() => setPreview(null)} data-testid="preview-close"
                className="h-9 px-4 border border-line font-mono text-[9px] uppercase text-ink3 hover:text-ink ml-2">
                Close ✕
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-canvas2/40 p-4 flex justify-center">
            <div className="border border-line bg-canvas h-full transition-all" style={{ width: DEVICES[device].width, maxWidth: "100%" }}>
              <iframe src={preview.url} title="About preview" className="w-full h-full border-0" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
