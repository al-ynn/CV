import { useEffect, useState } from "react";
import api, { formatApiError } from "../lib/api";
import { useContent } from "../lib/content";
import { Plus, X, ArrowUp, ArrowDown, ChevronDown, Eye, ExternalLink, RotateCcw, Monitor, Tablet, Smartphone } from "lucide-react";

const inputCls = "w-full h-10 px-3 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none";
const labelCls = "block font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-1.5";
const STATUSES = ["CORE", "PROFICIENT", "WORKING KNOWLEDGE", "FAMILIAR", "LEARNING"];
const STAGE_TYPES = ["Planning", "Design", "Development", "Testing", "Review", "Deployment", "Support"];
const DEVICES = { desktop: { width: "100%", icon: Monitor }, tablet: { width: 820, icon: Tablet }, mobile: { width: 390, icon: Smartphone } };

const L = ({ label, children, wide }) => (
  <div className={wide ? "sm:col-span-2" : ""}><label className={labelCls}>{label}</label>{children}</div>
);
const Txt = ({ value, onChange, testid }) => <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputCls} data-testid={testid} />;
const Txa = ({ value, onChange, rows = 3 }) => (
  <textarea rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none resize-y" />
);
const Check = ({ label, checked, onChange, testid }) => (
  <label className="flex items-center gap-2.5 font-mono text-[11px] text-ink2 cursor-pointer py-1">
    <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="accent-[#a855f7] w-4 h-4" data-testid={testid} />
    {label}
  </label>
);

function Panel({ title, meta, children, defaultOpen = false, testid }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="panel" data-testid={testid}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left" aria-expanded={open}>
        <div>
          <span className="font-display font-bold text-sm text-ink">{title}</span>
          {meta && <span className="block font-mono text-[9px] text-ink3 mt-0.5 uppercase tracking-[0.15em]">{meta}</span>}
        </div>
        <span className="flex items-center gap-3">
          <span className="font-mono text-[9px] tracking-[0.2em] text-violet uppercase">{open ? "Close" : "Edit"}</span>
          <ChevronDown size={14} className={`text-ink3 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && <div className="px-5 pb-5 border-t border-line pt-5">{children}</div>}
    </div>
  );
}

function RowControls({ i, len, onMove, onRemove }) {
  return (
    <div className="flex gap-1">
      <button onClick={() => onMove(i, -1)} disabled={i === 0} aria-label="Move up" className="p-1.5 border border-line text-ink3 hover:text-violet disabled:opacity-20"><ArrowUp size={11} /></button>
      <button onClick={() => onMove(i, 1)} disabled={i === len - 1} aria-label="Move down" className="p-1.5 border border-line text-ink3 hover:text-violet disabled:opacity-20"><ArrowDown size={11} /></button>
      {onRemove && <button onClick={() => onRemove(i)} aria-label="Remove" className="p-1.5 border border-line text-pk hover:border-pk"><X size={11} /></button>}
    </div>
  );
}

const moveIn = (arr, i, dir) => {
  const next = [...arr];
  const [it] = next.splice(i, 1);
  next.splice(i + dir, 0, it);
  return next;
};

export default function HomepageAdmin() {
  const { refresh } = useContent();
  const [cfg, setCfg] = useState(null);
  const [meta, setMeta] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState(null);
  const [device, setDevice] = useState("desktop");
  const [refs, setRefs] = useState({ projects: [], services: [], technologies: [], journey: [] });
  const [revisions, setRevisions] = useState(null);

  const load = () =>
    api.get("/admin/homepage-config").then(({ data }) => {
      setCfg(data.draft);
      setMeta({ updated_at: data.updated_at, published_at: data.published_at, hasChanges: data.has_unpublished_changes });
      setDirty(false);
    });

  useEffect(() => {
    load();
    Promise.all(["projects", "services", "technologies", "journey"].map((c) => api.get(`/admin/collection/${c}`)))
      .then(([p, s, t, j]) => setRefs({
        projects: p.data.filter((x) => !x.archived), services: s.data.filter((x) => !x.archived),
        technologies: t.data.filter((x) => !x.archived), journey: j.data.filter((x) => !x.archived),
      }));
  }, []);

  const set = (path, value) => {
    const keys = path.split(".");
    setCfg((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]] = cur[keys[i]] || {};
      cur[keys[keys.length - 1]] = value;
      return copy;
    });
    setDirty(true);
  };

  const save = async () => {
    try {
      await api.put("/admin/homepage-config", cfg);
      setMsg("✓ Draft saved — public homepage unchanged until you publish");
      setDirty(false);
      load();
    } catch (err) {
      setMsg(formatApiError(err.response?.data?.detail));
    }
  };

  const publish = async () => {
    await api.put("/admin/homepage-config", cfg);
    await api.post("/admin/homepage-config/publish");
    setMsg("✓ Published — live homepage updated");
    setDirty(false);
    load();
    refresh();
  };

  const openPreview = async (newTab = false) => {
    await api.put("/admin/homepage-config", cfg);
    setDirty(false);
    const { data } = await api.post("/admin/homepage-config/preview-token");
    const url = `${window.location.origin}${data.url}?t=${Date.now()}`;
    if (newTab) window.open(url, "_blank");
    else setPreview({ url });
  };

  if (!cfg) return <p className="font-mono text-xs text-ink3 animate-blink">LOADING HOMEPAGE CONFIG…</p>;

  const sp = cfg.systemProfile || {};
  const fp = cfg.featuredProjects || {};
  const caps = sp.capabilities || [];

  return (
    <div data-testid="homepage-admin">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <span className="font-mono text-[10px] tracking-[0.3em] text-violet">ADMIN / HOMEPAGE CONTROL</span>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">HOMEPAGE</h1>
          <p className="mt-1.5 font-mono text-[9px] tracking-[0.15em] uppercase text-ink3">
            {meta?.hasChanges || dirty ? (
              <span className="text-amb">● unpublished draft changes</span>
            ) : (
              <span className="text-grn">● published · in sync</span>
            )}
            {meta?.published_at && ` · last published ${new Date(meta.published_at).toLocaleString()}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => openPreview(false)} data-testid="homepage-preview"
            className="h-9 px-4 border border-line font-mono text-[10px] tracking-[0.15em] uppercase text-ink2 hover:border-violet inline-flex items-center gap-1.5">
            <Eye size={12} /> Preview
          </button>
          <button onClick={() => openPreview(true)} className="h-9 px-4 border border-line font-mono text-[10px] uppercase text-ink2 hover:border-violet inline-flex items-center gap-1.5">
            <ExternalLink size={12} /> New Tab
          </button>
          <button onClick={save} data-testid="homepage-save"
            className="h-9 px-4 border border-amb/50 font-mono text-[10px] tracking-[0.15em] uppercase text-amb hover:bg-amb/10">
            Save Draft
          </button>
          <button onClick={publish} data-testid="homepage-publish"
            className="h-9 px-5 bg-violet font-mono text-[10px] tracking-[0.15em] uppercase font-semibold" style={{ color: "var(--bg)" }}>
            Publish →
          </button>
        </div>
      </div>

      {msg && <p className={`mb-4 font-mono text-xs ${msg.startsWith("✓") ? "text-grn" : "text-pk"}`} data-testid="homepage-msg">{msg}</p>}

      <div className="space-y-3 max-w-4xl">
        <Panel title="01 · SECTIONS — VISIBILITY & ORDER" meta={`${(cfg.sections || []).filter((s) => s.visible).length} visible`} testid="hp-sections">
          <div className="divide-y divide-line border border-line">
            {(cfg.sections || []).map((s, i) => (
              <div key={s.key} className="flex items-center gap-3 px-4 py-2.5">
                <RowControls i={i} len={cfg.sections.length} onMove={(a, d) => set("sections", moveIn(cfg.sections, a, d))} />
                <Check label={s.key} checked={s.visible}
                  onChange={(v) => set("sections", cfg.sections.map((x, j) => (j === i ? { ...x, visible: v } : x)))}
                  testid={`hp-sec-${s.key}`} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="02 · HERO" meta="heading, copy, CTAs" testid="hp-hero">
          <div className="grid sm:grid-cols-2 gap-4">
            <L label="Eyebrow"><Txt value={cfg.hero?.eyebrow} onChange={(v) => set("hero.eyebrow", v)} /></L>
            <L label="Availability Label (blank = auto from global status)"><Txt value={cfg.hero?.availabilityLabel} onChange={(v) => set("hero.availabilityLabel", v)} /></L>
            <L label="Heading (*word* = accent, one line per row)" wide><Txa value={cfg.hero?.title} onChange={(v) => set("hero.title", v)} rows={3} /></L>
            <L label="Paragraph" wide><Txa value={cfg.hero?.paragraph} onChange={(v) => set("hero.paragraph", v)} rows={3} /></L>
            <L label="Primary CTA"><Txt value={cfg.hero?.primaryCta} onChange={(v) => set("hero.primaryCta", v)} /></L>
            <L label="Secondary CTA"><Txt value={cfg.hero?.secondaryCta} onChange={(v) => set("hero.secondaryCta", v)} /></L>
            <L label="Resume CTA (empty = hidden)"><Txt value={cfg.hero?.resumeCta} onChange={(v) => set("hero.resumeCta", v)} /></L>
          </div>
          <div className="mt-4 border-t border-line pt-4 grid sm:grid-cols-2 gap-4">
            <Check label="Show announcement bar" checked={cfg.showAnnouncement} onChange={(v) => set("showAnnouncement", v)} testid="hp-announce-toggle" />
            <L label="Announcement text"><Txt value={cfg.announcement} onChange={(v) => set("announcement", v)} /></L>
          </div>
        </Panel>

        <Panel title="03 · SYSTEM PROFILE" meta={`${caps.filter((c) => c.visible).length} capabilities visible`} testid="hp-sysprofile">
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <L label="Panel Label"><Txt value={sp.label} onChange={(v) => set("systemProfile.label", v)} /></L>
            <L label="System Name"><Txt value={sp.displayName} onChange={(v) => set("systemProfile.displayName", v)} /></L>
            <L label="Role"><Txt value={sp.role} onChange={(v) => set("systemProfile.role", v)} /></L>
            <L label="Secondary Title"><Txt value={sp.secondaryTitle} onChange={(v) => set("systemProfile.secondaryTitle", v)} /></L>
            <L label="Location"><Txt value={sp.location} onChange={(v) => set("systemProfile.location", v)} /></L>
          </div>
          <span className={labelCls}>CAPABILITIES — proficiency labels, not percentages</span>
          <div className="space-y-2 mt-2">
            {caps.map((c, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 border border-line px-3 py-2">
                <input value={c.label} onChange={(e) => set("systemProfile.capabilities", caps.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                  className="flex-1 min-w-[140px] h-8 px-2 bg-canvas border border-line font-mono text-[11px] text-ink focus:border-violet focus:outline-none" />
                <select value={c.status} onChange={(e) => set("systemProfile.capabilities", caps.map((x, j) => (j === i ? { ...x, status: e.target.value } : x)))}
                  className="h-8 px-2 bg-canvas border border-line font-mono text-[10px] text-ink focus:border-violet focus:outline-none" data-testid={`cap-status-${i}`}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <label className="flex items-center gap-1.5 font-mono text-[9px] text-ink3">
                  <input type="checkbox" checked={c.visible} onChange={(e) => set("systemProfile.capabilities", caps.map((x, j) => (j === i ? { ...x, visible: e.target.checked } : x)))} className="accent-[#a855f7]" />
                  show
                </label>
                <RowControls i={i} len={caps.length} onMove={(a, d) => set("systemProfile.capabilities", moveIn(caps, a, d))}
                  onRemove={(a) => set("systemProfile.capabilities", caps.filter((_, j) => j !== a))} />
              </div>
            ))}
          </div>
          <button onClick={() => set("systemProfile.capabilities", [...caps, { label: "New Capability", status: "LEARNING", visible: true }])}
            data-testid="cap-add"
            className="mt-3 h-9 px-4 border border-line font-mono text-[10px] tracking-[0.15em] uppercase text-ink2 hover:border-violet inline-flex items-center gap-1.5">
            <Plus size={12} /> Add Capability
          </button>

          <div className="mt-6 border-t border-line pt-4">
            <span className={labelCls}>PROJECT METRIC</span>
            <div className="space-y-1.5">
              {[["auto-published", "Automatically count published projects"], ["auto-featured", "Automatically count featured projects"],
                ["manual", "Manual value"], ["hidden", "Hide metric"]].map(([v, label]) => (
                <label key={v} className="flex items-center gap-2.5 font-mono text-[11px] text-ink2 cursor-pointer">
                  <input type="radio" name="metric-mode" checked={(sp.projectMetric?.mode || "auto-published") === v}
                    onChange={() => set("systemProfile.projectMetric", { ...(sp.projectMetric || {}), mode: v })} className="accent-[#a855f7]" />
                  {label}
                </label>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3 max-w-sm">
              <L label="Manual value"><Txt value={sp.projectMetric?.manualValue} onChange={(v) => set("systemProfile.projectMetric", { ...(sp.projectMetric || {}), manualValue: v })} /></L>
              <L label="Metric label"><Txt value={sp.projectMetric?.label} onChange={(v) => set("systemProfile.projectMetric", { ...(sp.projectMetric || {}), label: v })} /></L>
            </div>
          </div>
        </Panel>

        <Panel title="04 · HOMEPAGE METRICS" meta="database-derived only" testid="hp-metrics">
          <p className="font-mono text-[9px] text-ink3 uppercase mb-3">Only real database counts are shown. Nothing is manually inflated.</p>
          {(cfg.metrics?.items || []).map((m, i) => (
            <Check key={m.key} label={m.label} checked={m.visible}
              onChange={(v) => set("metrics.items", cfg.metrics.items.map((x, j) => (j === i ? { ...x, visible: v } : x)))}
              testid={`hp-metric-${m.key}`} />
          ))}
        </Panel>

        <Panel title="05 · FEATURED PROJECTS" meta={`${(fp.ids || []).length || "auto"} selected · max ${fp.max}`} testid="hp-featured">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <L label="Section Heading"><Txt value={fp.heading} onChange={(v) => set("featuredProjects.heading", v)} /></L>
            <L label="Technical Label"><Txt value={fp.label} onChange={(v) => set("featuredProjects.label", v)} /></L>
            <L label="Max Projects"><Txt value={fp.max} onChange={(v) => set("featuredProjects.max", Number(v) || 4)} /></L>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mb-4">
            <Check label="Show image" checked={fp.showImage} onChange={(v) => set("featuredProjects.showImage", v)} />
            <Check label="Show stack" checked={fp.showStack} onChange={(v) => set("featuredProjects.showStack", v)} />
            <Check label="Show description" checked={fp.showDescription} onChange={(v) => set("featuredProjects.showDescription", v)} />
            <Check label="Show year" checked={fp.showYear} onChange={(v) => set("featuredProjects.showYear", v)} />
          </div>
          <span className={labelCls}>SELECT & ORDER (references Projects CMS — no duplicated data)</span>
          <div className="space-y-1.5 mt-2">
            {(fp.ids || []).map((id, i) => {
              const proj = refs.projects.find((x) => x.id === id);
              if (!proj) return null;
              return (
                <div key={id} className="flex items-center gap-2 border border-violet/40 bg-violet/5 px-3 py-2">
                  <span className="font-mono text-[10px] text-violet w-6">{i + 1}</span>
                  <span className="font-mono text-[11px] text-ink flex-1">{proj.title}</span>
                  <RowControls i={i} len={fp.ids.length} onMove={(a, d) => set("featuredProjects.ids", moveIn(fp.ids, a, d))}
                    onRemove={(a) => set("featuredProjects.ids", fp.ids.filter((_, j) => j !== a))} />
                </div>
              );
            })}
            {refs.projects.filter((p) => !(fp.ids || []).includes(p.id)).map((p) => (
              <button key={p.id} onClick={() => set("featuredProjects.ids", [...(fp.ids || []), p.id])}
                data-testid={`fp-add-${p.slug}`}
                className="w-full flex items-center gap-2 border border-line px-3 py-2 text-left hover:border-violet transition-colors">
                <Plus size={11} className="text-ink3" />
                <span className="font-mono text-[11px] text-ink3">{p.title}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 font-mono text-[9px] text-ink3 uppercase">Empty selection = auto-use projects marked featured in Projects CMS.</p>
        </Panel>

        <Panel title="06 · WHAT I BUILD" meta={`${(cfg.whatIBuild?.items || []).filter((i) => i.visible).length} build types`} testid="hp-whatibuild">
          <L label="Section Heading"><Txt value={cfg.whatIBuild?.heading} onChange={(v) => set("whatIBuild.heading", v)} /></L>
          <div className="space-y-2 mt-4">
            {(cfg.whatIBuild?.items || []).map((it, i) => (
              <div key={i} className="border border-line p-3 grid sm:grid-cols-[1fr_140px] gap-2">
                <input value={it.title} onChange={(e) => set("whatIBuild.items", cfg.whatIBuild.items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                  className="h-8 px-2 bg-canvas border border-line font-mono text-[11px] text-ink focus:border-violet focus:outline-none" placeholder="Title" />
                <input value={it.techLabel} onChange={(e) => set("whatIBuild.items", cfg.whatIBuild.items.map((x, j) => (j === i ? { ...x, techLabel: e.target.value } : x)))}
                  className="h-8 px-2 bg-canvas border border-line font-mono text-[10px] text-ink3 focus:border-violet focus:outline-none" placeholder="SYS.LABEL" />
                <textarea value={it.desc} rows={2} onChange={(e) => set("whatIBuild.items", cfg.whatIBuild.items.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)))}
                  className="sm:col-span-2 px-2 py-1.5 bg-canvas border border-line font-mono text-[11px] text-ink2 focus:border-violet focus:outline-none resize-y" placeholder="Description" />
                <div className="sm:col-span-2 flex items-center justify-between">
                  <Check label="visible" checked={it.visible} onChange={(v) => set("whatIBuild.items", cfg.whatIBuild.items.map((x, j) => (j === i ? { ...x, visible: v } : x)))} />
                  <RowControls i={i} len={cfg.whatIBuild.items.length} onMove={(a, d) => set("whatIBuild.items", moveIn(cfg.whatIBuild.items, a, d))}
                    onRemove={(a) => set("whatIBuild.items", cfg.whatIBuild.items.filter((_, j) => j !== a))} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => set("whatIBuild.items", [...(cfg.whatIBuild?.items || []), { title: "NEW BUILD TYPE", desc: "", techLabel: "SYS.NEW", visible: true }])}
            data-testid="wib-add"
            className="mt-3 h-9 px-4 border border-line font-mono text-[10px] tracking-[0.15em] uppercase text-ink2 hover:border-violet inline-flex items-center gap-1.5">
            <Plus size={12} /> Add Build Type
          </button>
        </Panel>

        <Panel title="07 · SERVICES" meta="references Services CMS" testid="hp-services">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <L label="Section Heading"><Txt value={cfg.services?.heading} onChange={(v) => set("services.heading", v)} /></L>
            <L label="CTA Label"><Txt value={cfg.services?.ctaLabel} onChange={(v) => set("services.ctaLabel", v)} /></L>
            <L label="Max Shown"><Txt value={cfg.services?.max} onChange={(v) => set("services.max", Number(v) || 7)} /></L>
            <Check label="Show capability counts" checked={cfg.services?.showCount !== false} onChange={(v) => set("services.showCount", v)} />
          </div>
          <span className={labelCls}>FEATURED CATEGORIES (empty = all, in CMS order)</span>
          <div className="space-y-1.5 mt-2">
            {refs.services.map((s) => (
              <Check key={s.id} label={s.title} checked={(cfg.services?.ids || []).includes(s.id)}
                onChange={(v) => set("services.ids", v ? [...(cfg.services?.ids || []), s.id] : (cfg.services?.ids || []).filter((x) => x !== s.id))}
                testid={`hp-svc-${s.id}`} />
            ))}
          </div>
        </Panel>

        <Panel title="08 · TECHNICAL STACK" meta={`${(cfg.techStack?.ids || []).length || "all"} technologies`} testid="hp-techstack">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <L label="Section Heading"><Txt value={cfg.techStack?.heading} onChange={(v) => set("techStack.heading", v)} /></L>
            <L label="Sub-label"><Txt value={cfg.techStack?.sub} onChange={(v) => set("techStack.sub", v)} /></L>
          </div>
          <p className="font-mono text-[9px] text-ink3 uppercase mb-3">Statuses are edited centrally in Admin → Technologies. Here you choose homepage visibility only.</p>
          <div className="space-y-1.5">
            {refs.technologies.map((t) => (
              <Check key={t.id} label={`${t.name} — ${t.category} · ${t.level}`} checked={(cfg.techStack?.ids || []).includes(t.id)}
                onChange={(v) => set("techStack.ids", v ? [...(cfg.techStack?.ids || []), t.id] : (cfg.techStack?.ids || []).filter((x) => x !== t.id))}
                testid={`hp-tech-${t.id}`} />
            ))}
          </div>
        </Panel>

        <Panel title="09 · SCRUM / PROTOTYPE ROADMAP" meta={`${(cfg.roadmap?.stages || []).filter((s) => s.visible).length} stages · loop ${cfg.roadmap?.loopFrom}→${cfg.roadmap?.loopTo}`} testid="hp-roadmap">
          <div className="grid gap-4 mb-4">
            <L label="Section Heading" wide><Txt value={cfg.roadmap?.heading} onChange={(v) => set("roadmap.heading", v)} /></L>
            <L label="Intro" wide><Txa value={cfg.roadmap?.intro} onChange={(v) => set("roadmap.intro", v)} rows={2} /></L>
            <div className="grid grid-cols-2 gap-3">
              <L label="Loop back from"><Txt value={cfg.roadmap?.loopFrom} onChange={(v) => set("roadmap.loopFrom", v)} /></L>
              <L label="Loop back to"><Txt value={cfg.roadmap?.loopTo} onChange={(v) => set("roadmap.loopTo", v)} /></L>
            </div>
          </div>
          <div className="space-y-2">
            {(cfg.roadmap?.stages || []).map((st, i) => (
              <div key={i} className="border border-line p-3 grid sm:grid-cols-[70px_1fr_140px] gap-2">
                <input value={st.num} onChange={(e) => set("roadmap.stages", cfg.roadmap.stages.map((x, j) => (j === i ? { ...x, num: e.target.value } : x)))}
                  className="h-8 px-2 bg-canvas border border-line font-mono text-[11px] text-violet focus:border-violet focus:outline-none" />
                <input value={st.title} onChange={(e) => set("roadmap.stages", cfg.roadmap.stages.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                  className="h-8 px-2 bg-canvas border border-line font-mono text-[11px] text-ink focus:border-violet focus:outline-none" />
                <select value={st.type} onChange={(e) => set("roadmap.stages", cfg.roadmap.stages.map((x, j) => (j === i ? { ...x, type: e.target.value } : x)))}
                  className="h-8 px-2 bg-canvas border border-line font-mono text-[10px] text-ink2 focus:border-violet focus:outline-none">
                  {STAGE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <textarea value={st.desc} rows={1} onChange={(e) => set("roadmap.stages", cfg.roadmap.stages.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)))}
                  className="sm:col-span-3 px-2 py-1.5 bg-canvas border border-line font-mono text-[10px] text-ink2 focus:border-violet focus:outline-none resize-y" />
                <div className="sm:col-span-3 flex items-center justify-between">
                  <Check label="visible" checked={st.visible} onChange={(v) => set("roadmap.stages", cfg.roadmap.stages.map((x, j) => (j === i ? { ...x, visible: v } : x)))} />
                  <RowControls i={i} len={cfg.roadmap.stages.length} onMove={(a, d) => set("roadmap.stages", moveIn(cfg.roadmap.stages, a, d))}
                    onRemove={(a) => set("roadmap.stages", cfg.roadmap.stages.filter((_, j) => j !== a))} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => set("roadmap.stages", [...(cfg.roadmap?.stages || []), { num: String((cfg.roadmap?.stages || []).length + 1).padStart(2, "0"), title: "NEW STAGE", desc: "", type: "Development", visible: true }])}
            data-testid="stage-add"
            className="mt-3 h-9 px-4 border border-line font-mono text-[10px] tracking-[0.15em] uppercase text-ink2 hover:border-violet inline-flex items-center gap-1.5">
            <Plus size={12} /> Add Stage
          </button>
        </Panel>

        <Panel title="10 · JOURNEY LOG" meta={`mode: ${cfg.journey?.mode}`} testid="hp-journey">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <L label="Section Heading"><Txt value={cfg.journey?.heading} onChange={(v) => set("journey.heading", v)} /></L>
            <L label="Latest count"><Txt value={cfg.journey?.max} onChange={(v) => set("journey.max", Number(v) || 4)} /></L>
          </div>
          <div className="space-y-1.5 mb-4">
            {[["latest", "Latest milestones"], ["selected", "Selected milestones"], ["all", "Full journey"]].map(([v, label]) => (
              <label key={v} className="flex items-center gap-2.5 font-mono text-[11px] text-ink2 cursor-pointer">
                <input type="radio" name="journey-mode" checked={(cfg.journey?.mode || "latest") === v}
                  onChange={() => set("journey.mode", v)} className="accent-[#a855f7]" data-testid={`journey-mode-${v}`} />
                {label}
              </label>
            ))}
          </div>
          {cfg.journey?.mode === "selected" && (
            <div className="space-y-1.5">
              {(cfg.journey?.ids || []).map((id, i) => {
                const j = refs.journey.find((x) => x.id === id);
                if (!j) return null;
                return (
                  <div key={id} className="flex items-center gap-2 border border-violet/40 bg-violet/5 px-3 py-2">
                    <span className="font-mono text-[11px] text-ink flex-1">{j.title} ({j.year})</span>
                    <RowControls i={i} len={cfg.journey.ids.length} onMove={(a, d) => set("journey.ids", moveIn(cfg.journey.ids, a, d))}
                      onRemove={(a) => set("journey.ids", cfg.journey.ids.filter((_, jj) => jj !== a))} />
                  </div>
                );
              })}
              {refs.journey.filter((j) => !(cfg.journey?.ids || []).includes(j.id)).map((j) => (
                <button key={j.id} onClick={() => set("journey.ids", [...(cfg.journey?.ids || []), j.id])}
                  className="w-full flex items-center gap-2 border border-line px-3 py-2 text-left hover:border-violet transition-colors">
                  <Plus size={11} className="text-ink3" />
                  <span className="font-mono text-[11px] text-ink3">{j.title} ({j.year})</span>
                </button>
              ))}
            </div>
          )}
          <p className="mt-3 font-mono text-[9px] text-ink3 uppercase">Milestones are edited centrally in Admin → Journey.</p>
        </Panel>

        <Panel title="11 · FINAL CTA" meta="closing section" testid="hp-finalcta">
          <div className="grid sm:grid-cols-2 gap-4">
            <L label="Eyebrow"><Txt value={cfg.finalCta?.eyebrow} onChange={(v) => set("finalCta.eyebrow", v)} /></L>
            <L label="Button Label"><Txt value={cfg.finalCta?.buttonLabel} onChange={(v) => set("finalCta.buttonLabel", v)} /></L>
            <L label="Heading (*word* = accent)" wide><Txa value={cfg.finalCta?.heading} onChange={(v) => set("finalCta.heading", v)} rows={2} /></L>
            <L label="Body" wide><Txa value={cfg.finalCta?.body} onChange={(v) => set("finalCta.body", v)} rows={2} /></L>
          </div>
        </Panel>

        <Panel title="12 · REVISION HISTORY" meta="last 15 drafts" testid="hp-revisions">
          {!revisions ? (
            <button onClick={async () => setRevisions((await api.get("/admin/homepage-config/revisions")).data)}
              className="h-9 px-4 border border-line font-mono text-[10px] tracking-[0.15em] uppercase text-ink2 hover:border-violet">
              Load History
            </button>
          ) : (
            <div className="divide-y divide-line border border-line">
              {revisions.length === 0 && <p className="px-4 py-5 font-mono text-xs text-ink3">No revisions yet.</p>}
              {[...revisions].reverse().map((r) => (
                <div key={r.index} className="flex items-center justify-between px-4 py-3 font-mono text-[11px]">
                  <span className="text-ink3">{new Date(r.at).toLocaleString()}</span>
                  <button
                    onClick={() => window.confirm("Restore this draft revision? Current draft is snapshotted first.") &&
                      api.post(`/admin/homepage-config/restore-revision/${r.index}`).then(load)}
                    className="px-3 h-8 border border-line font-mono text-[9px] uppercase text-ink2 hover:border-violet inline-flex items-center gap-1.5">
                    <RotateCcw size={11} /> Restore to Draft
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {preview && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-canvas" data-testid="homepage-preview-modal">
          <div className="flex items-center justify-between gap-3 px-4 h-14 border-b border-line shrink-0">
            <span className="font-mono text-[10px] tracking-[0.25em] text-amb uppercase">Preview — unpublished homepage draft</span>
            <div className="flex items-center gap-1.5">
              {Object.entries(DEVICES).map(([key, d]) => (
                <button key={key} onClick={() => setDevice(key)} data-testid={`hp-preview-${key}`}
                  className={`h-9 px-3 border font-mono text-[9px] uppercase inline-flex items-center gap-1.5 ${device === key ? "border-violet text-violet" : "border-line text-ink3 hover:text-ink"}`}>
                  <d.icon size={12} /> <span className="hidden sm:inline">{key}</span>
                </button>
              ))}
              <button onClick={() => setPreview(null)} className="h-9 px-4 border border-line font-mono text-[9px] uppercase text-ink3 hover:text-ink ml-2">Close ✕</button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-canvas2/40 p-4 flex justify-center">
            <div className="border border-line bg-canvas h-full" style={{ width: DEVICES[device].width, maxWidth: "100%" }}>
              <iframe src={preview.url} title="Homepage preview" className="w-full h-full border-0" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
