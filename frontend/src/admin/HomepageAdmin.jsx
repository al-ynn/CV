import { useEffect, useState } from "react";
import api, { formatApiError } from "../lib/api";
import { useContent } from "../lib/content";
import { Plus, X, ArrowUp, ArrowDown, Eye, ExternalLink, RotateCcw, Monitor, Tablet, Smartphone, PencilLine } from "lucide-react";
import { useAdminFeedback } from "./AdminFeedback";

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

const SECTION_META = {
  hero: { title: "HERO", group: "IDENTITY", blurb: "Heading, copy, CTAs, announcement bar" },
  systemProfile: { title: "SYSTEM PROFILE", group: "IDENTITY", blurb: "Identity panel, capabilities, project metric" },
  metrics: { title: "HOMEPAGE METRICS", group: "IDENTITY", blurb: "Database-derived counters" },
  featuredProjects: { title: "FEATURED PROJECTS", group: "PORTFOLIO", blurb: "Project selection & display" },
  whatIBuild: { title: "WHAT I BUILD", group: "PORTFOLIO", blurb: "Build-type cards" },
  services: { title: "SERVICES", group: "PORTFOLIO", blurb: "References Services CMS" },
  techStack: { title: "TECHNICAL STACK", group: "PORTFOLIO", blurb: "Technology visibility" },
  roadmap: { title: "SCRUM / PROTOTYPE ROADMAP", group: "PROCESS", blurb: "Development workflow map" },
  contactChannels: { title: "DIRECT CHANNELS", group: "CONTACT", blurb: "Email / WhatsApp / Facebook strip" },
  finalCta: { title: "FINAL CTA", group: "CONTACT", blurb: "Closing call-to-action" },
};
const GROUP_ORDER = ["IDENTITY", "PORTFOLIO", "PROCESS", "CONTACT"];

const PRESETS = {
  recruiter: {
    label: "RECRUITER MODE",
    hint: "Skills & CV first",
    order: ["hero", "techStack", "metrics", "featuredProjects", "whatIBuild", "roadmap", "services", "contactChannels", "finalCta"],
  },
  client: {
    label: "CLIENT MODE",
    hint: "Services & projects first",
    order: ["hero", "services", "featuredProjects", "whatIBuild", "metrics", "techStack", "roadmap", "contactChannels", "finalCta"],
  },
  default: {
    label: "DEFAULT",
    hint: "Balanced original order",
    order: ["hero", "metrics", "featuredProjects", "whatIBuild", "services", "techStack", "roadmap", "contactChannels", "finalCta"],
  },
};

export default function HomepageAdmin() {
  const { confirm } = useAdminFeedback();
  const { refresh } = useContent();
  const [cfg, setCfg] = useState(null);
  const [meta, setMeta] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState(null);
  const [device, setDevice] = useState("desktop");
  const [refs, setRefs] = useState({ projects: [], services: [], technologies: [] });
  const [revisions, setRevisions] = useState(null);
  const [editing, setEditing] = useState(null); // section key open in drawer
  const [saving, setSaving] = useState(false);

  const load = () =>
    api.get("/admin/homepage-config").then(({ data }) => {
      setCfg(data.draft);
      setMeta({ updated_at: data.updated_at, published_at: data.published_at, hasChanges: data.has_unpublished_changes });
      setDirty(false);
    });

  useEffect(() => {
    load();
    Promise.all(["projects", "services", "technologies"].map((c) => api.get(`/admin/collection/${c}`)))
      .then(([p, s, t]) => setRefs({
        projects: p.data.filter((x) => !x.archived), services: s.data.filter((x) => !x.archived),
        technologies: t.data.filter((x) => !x.archived),
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
    setSaving(true);
    try {
      const { data } = await api.put("/admin/homepage-config", cfg);
      setCfg(data.draft);
      setMeta({
        updated_at: data.updated_at,
        published_at: data.published_at,
        hasChanges: data.has_unpublished_changes,
      });
      setMsg("✓ Draft saved — public homepage unchanged until you publish");
      setDirty(false);
      return true;
    } catch (err) {
      setMsg(formatApiError(err.response?.data?.detail));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setSaving(true);
    try {
      const { data: saved } = await api.put("/admin/homepage-config", cfg);
      const { data: published } = await api.post("/admin/homepage-config/publish");
      setCfg(saved.draft);
      setMeta({
        updated_at: saved.updated_at,
        published_at: published.published_at,
        hasChanges: published.has_unpublished_changes,
      });
      setMsg("✓ Published — live homepage updated");
      setDirty(false);
      await refresh();
    } catch (err) {
      setMsg(formatApiError(err.response?.data?.detail));
    } finally {
      setSaving(false);
    }
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
  const phases = cfg.roadmap?.phases || [];
  const featuredServices = refs.services.filter((service) => service.status === "published" && service.featured).slice(0, 4);
  const sectionVisible = (key) => (cfg.sections || []).find((s) => s.key === key)?.visible !== false;

  const activePreset = Object.keys(PRESETS).find((k) =>
    JSON.stringify((cfg.sections || []).map((s) => s.key)) ===
    JSON.stringify(PRESETS[k].order.filter((key) => (cfg.sections || []).some((s) => s.key === key)))
  );

  const applyPreset = (key) => {
    const byKey = Object.fromEntries((cfg.sections || []).map((s) => [s.key, s]));
    const next = PRESETS[key].order.filter((k) => byKey[k]).map((k) => byKey[k]);
    (cfg.sections || []).forEach((s) => { if (!PRESETS[key].order.includes(s.key)) next.push(s); });
    set("sections", next);
    setMsg(`✓ ${PRESETS[key].label} applied to draft — preview it, then Save Draft or Publish`);
  };

  // ---------- section form bodies ----------
  const FORMS = {
    hero: (
      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <L label="Eyebrow"><Txt value={cfg.hero?.eyebrow} onChange={(v) => set("hero.eyebrow", v)} /></L>
          <L label="Availability Label (blank = auto)"><Txt value={cfg.hero?.availabilityLabel} onChange={(v) => set("hero.availabilityLabel", v)} /></L>
          <L label="Heading (*word* = accent, one line per row)" wide><Txa value={cfg.hero?.title} onChange={(v) => set("hero.title", v)} rows={3} /></L>
          <L label="Paragraph" wide><Txa value={cfg.hero?.paragraph} onChange={(v) => set("hero.paragraph", v)} rows={3} /></L>
          <L label="Primary CTA"><Txt value={cfg.hero?.primaryCta} onChange={(v) => set("hero.primaryCta", v)} /></L>
          <L label="Secondary CTA"><Txt value={cfg.hero?.secondaryCta} onChange={(v) => set("hero.secondaryCta", v)} /></L>
          <L label="Resume CTA (empty = hidden)"><Txt value={cfg.hero?.resumeCta} onChange={(v) => set("hero.resumeCta", v)} /></L>
        </div>
        <div className="border-t border-line pt-4 grid sm:grid-cols-2 gap-4">
          <Check label="Show announcement bar" checked={cfg.showAnnouncement} onChange={(v) => set("showAnnouncement", v)} testid="hp-announce-toggle" />
          <L label="Announcement text"><Txt value={cfg.announcement} onChange={(v) => set("announcement", v)} /></L>
        </div>
      </div>
    ),
    systemProfile: (
      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <L label="Panel Label"><Txt value={sp.label} onChange={(v) => set("systemProfile.label", v)} /></L>
          <L label="System Name"><Txt value={sp.displayName} onChange={(v) => set("systemProfile.displayName", v)} /></L>
          <L label="Role"><Txt value={sp.role} onChange={(v) => set("systemProfile.role", v)} /></L>
          <L label="Secondary Title"><Txt value={sp.secondaryTitle} onChange={(v) => set("systemProfile.secondaryTitle", v)} /></L>
          <L label="Location"><Txt value={sp.location} onChange={(v) => set("systemProfile.location", v)} /></L>
        </div>
        <div>
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
        </div>
        <div className="border-t border-line pt-4">
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
      </div>
    ),
    metrics: (
      <div>
        <p className="font-mono text-[9px] text-ink3 uppercase mb-3">Only real database counts are shown. Nothing is manually inflated.</p>
        {(cfg.metrics?.items || []).map((m, i) => (
          <Check key={m.key} label={m.label} checked={m.visible}
            onChange={(v) => set("metrics.items", cfg.metrics.items.map((x, j) => (j === i ? { ...x, visible: v } : x)))}
            testid={`hp-metric-${m.key}`} />
        ))}
      </div>
    ),
    featuredProjects: (
      <div>
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
      </div>
    ),
    whatIBuild: (
      <div>
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
      </div>
    ),
    services: (
      <div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <L label="Section Heading"><Txt value={cfg.services?.heading} onChange={(v) => set("services.heading", v)} /></L>
          <L label="CTA Label"><Txt value={cfg.services?.ctaLabel} onChange={(v) => set("services.ctaLabel", v)} /></L>
          <div><span className={labelCls}>Homepage Limit</span><div className="h-9 px-3 flex items-center border border-line bg-canvas font-mono text-xs text-ink3">4 featured services</div></div>
          <Check label="Show capability counts" checked={cfg.services?.showCount !== false} onChange={(v) => set("services.showCount", v)} />
        </div>
        <span className={labelCls}>FEATURED IN SERVICES CMS</span>
        <div className="space-y-1.5 mt-2">
          {featuredServices.map((service, i) => (
            <div key={service.id} className="flex items-center gap-2 border border-violet/40 bg-violet/5 px-3 py-2">
              <span className="font-mono text-[10px] text-violet w-6">{i + 1}</span>
              <span className="font-mono text-[11px] text-ink flex-1">{service.title}</span>
              <span className="font-mono text-[9px] uppercase text-grn">Featured</span>
            </div>
          ))}
          {featuredServices.length === 0 && (
            <p className="border border-dashed border-line px-3 py-4 font-mono text-[10px] text-ink3">No published service is marked Featured. Select services from Admin / Services.</p>
          )}
        </div>
        <p className="mt-3 font-mono text-[9px] text-ink3 uppercase">Selection and ordering are managed in Services. Up to four published featured services appear here and on the homepage.</p>
      </div>
    ),
    techStack: (
      <div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <L label="Section Heading"><Txt value={cfg.techStack?.heading} onChange={(v) => set("techStack.heading", v)} /></L>
          <L label="Sub-label"><Txt value={cfg.techStack?.sub} onChange={(v) => set("techStack.sub", v)} /></L>
        </div>
        <p className="font-mono text-[9px] text-ink3 uppercase mb-3">Statuses are edited centrally in Portfolio → Technologies. Here you choose homepage visibility only.</p>
        <div className="space-y-1.5">
          {refs.technologies.map((t) => (
            <Check key={t.id} label={`${t.name} — ${t.category} · ${t.level}`} checked={(cfg.techStack?.ids || []).includes(t.id)}
              onChange={(v) => set("techStack.ids", v ? [...(cfg.techStack?.ids || []), t.id] : (cfg.techStack?.ids || []).filter((x) => x !== t.id))}
              testid={`hp-tech-${t.id}`} />
          ))}
        </div>
      </div>
    ),
    roadmap: (
      <div>
        <div className="grid gap-4 mb-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <L label="Section Heading"><Txt value={cfg.roadmap?.heading} onChange={(v) => set("roadmap.heading", v)} /></L>
            <L label="Scope Label"><Txt value={cfg.roadmap?.scopeLabel} onChange={(v) => set("roadmap.scopeLabel", v)} /></L>
          </div>
          <L label="Why Heading"><Txt value={cfg.roadmap?.whyHeading} onChange={(v) => set("roadmap.whyHeading", v)} /></L>
          <L label="Why Paragraphs (one per line)" wide>
            <Txa value={(cfg.roadmap?.whyBody || []).join("\n")} rows={4}
              onChange={(v) => set("roadmap.whyBody", v.split("\n").filter((x) => x.trim()))} />
          </L>
          <L label="Loop Label"><Txt value={cfg.roadmap?.loopLabel} onChange={(v) => set("roadmap.loopLabel", v)} /></L>
          <p className="font-mono text-[9px] text-ink3 uppercase leading-relaxed">
            The desktop roadmap map positions the six phases DISCOVER / PLAN / PROTOTYPE / BUILD / REVIEW / SHIP by title. Keep those titles to preserve the map layout; edit numbers, descriptions, sub-steps and loop badges freely.
          </p>
        </div>
        <div className="space-y-2">
          {phases.map((st, i) => (
            <div key={i} className="border border-line p-3 grid sm:grid-cols-[70px_1fr_140px] gap-2" data-testid={`hp-phase-${i}`}>
              <input value={st.num} onChange={(e) => set("roadmap.phases", phases.map((x, j) => (j === i ? { ...x, num: e.target.value } : x)))}
                className="h-8 px-2 bg-canvas border border-line font-mono text-[11px] text-violet focus:border-violet focus:outline-none" />
              <input value={st.title} onChange={(e) => set("roadmap.phases", phases.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                className="h-8 px-2 bg-canvas border border-line font-mono text-[11px] text-ink focus:border-violet focus:outline-none" />
              <select value={st.type} onChange={(e) => set("roadmap.phases", phases.map((x, j) => (j === i ? { ...x, type: e.target.value } : x)))}
                className="h-8 px-2 bg-canvas border border-line font-mono text-[10px] text-ink2 focus:border-violet focus:outline-none">
                {STAGE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <textarea value={st.desc} rows={1} onChange={(e) => set("roadmap.phases", phases.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)))}
                className="sm:col-span-3 px-2 py-1.5 bg-canvas border border-line font-mono text-[10px] text-ink2 focus:border-violet focus:outline-none resize-y" />
              <div className="sm:col-span-2">
                <input value={(st.subs || []).join(", ")} placeholder="Sub-steps, comma separated"
                  onChange={(e) => set("roadmap.phases", phases.map((x, j) => (j === i ? { ...x, subs: e.target.value.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean) } : x)))}
                  className="h-8 w-full px-2 bg-canvas border border-line font-mono text-[10px] text-ink2 focus:border-violet focus:outline-none" />
              </div>
              <input value={st.loopTag || ""} placeholder="Loop badge (optional, e.g. ↺ LOOPS TO BUILD)"
                onChange={(e) => set("roadmap.phases", phases.map((x, j) => (j === i ? { ...x, loopTag: e.target.value } : x)))}
                className="h-8 px-2 bg-canvas border border-line font-mono text-[10px] text-violet focus:border-violet focus:outline-none" />
              <div className="sm:col-span-3 flex items-center justify-between">
                <Check label="visible" checked={st.visible !== false} onChange={(v) => set("roadmap.phases", phases.map((x, j) => (j === i ? { ...x, visible: v } : x)))} />
                <RowControls i={i} len={phases.length} onMove={(a, d) => set("roadmap.phases", moveIn(phases, a, d))}
                  onRemove={(a) => set("roadmap.phases", phases.filter((_, j) => j !== a))} />
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => set("roadmap.phases", [...phases, { num: String(phases.length + 1).padStart(2, "0"), title: "NEW PHASE", desc: "", subs: [], type: "Development", visible: true }])}
          data-testid="stage-add"
          className="mt-3 h-9 px-4 border border-line font-mono text-[10px] tracking-[0.15em] uppercase text-ink2 hover:border-violet inline-flex items-center gap-1.5">
          <Plus size={12} /> Add Phase
        </button>
      </div>
    ),
    contactChannels: (
      <div>
        <div className="grid gap-4">
          <L label="Section Heading"><Txt value={cfg.contactChannels?.heading} onChange={(v) => set("contactChannels.heading", v)} /></L>
          <L label="Sub-copy" wide><Txa value={cfg.contactChannels?.sub} onChange={(v) => set("contactChannels.sub", v)} rows={2} /></L>
        </div>
        <div className="mt-4 border border-line px-4 py-3 bg-canvas2/40">
          <p className="font-mono text-[10px] text-ink3 uppercase leading-relaxed">
            Channel values (email, mobile, WhatsApp, Facebook) are managed centrally in <span className="text-violet">Website → Contact</span> — change once, updates everywhere.
          </p>
        </div>
      </div>
    ),
    finalCta: (
      <div className="grid sm:grid-cols-2 gap-4">
        <L label="Eyebrow"><Txt value={cfg.finalCta?.eyebrow} onChange={(v) => set("finalCta.eyebrow", v)} /></L>
        <L label="Button Label"><Txt value={cfg.finalCta?.buttonLabel} onChange={(v) => set("finalCta.buttonLabel", v)} /></L>
        <L label="Heading (*word* = accent)" wide><Txa value={cfg.finalCta?.heading} onChange={(v) => set("finalCta.heading", v)} rows={2} /></L>
        <L label="Body" wide><Txa value={cfg.finalCta?.body} onChange={(v) => set("finalCta.body", v)} rows={2} /></L>
      </div>
    ),
    revisions: (
      <div>
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
                  onClick={async () => await confirm({ title: "Restore this homepage revision?", description: "It will replace the current draft after the current state is snapshotted.", confirmLabel: "Restore revision" }) &&
                    api.post(`/admin/homepage-config/restore-revision/${r.index}`).then(load)}
                  className="px-3 h-8 border border-line font-mono text-[9px] uppercase text-ink2 hover:border-violet inline-flex items-center gap-1.5">
                  <RotateCcw size={11} /> Restore to Draft
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
  };

  const metaFor = (key) => {
    if (key === "systemProfile") return `${caps.filter((c) => c.visible).length} capabilities`;
    if (key === "featuredProjects") return `${(fp.ids || []).length || "auto"} selected · max ${fp.max}`;
    if (key === "whatIBuild") return `${(cfg.whatIBuild?.items || []).filter((i) => i.visible).length} build types`;
    if (key === "services") return `${featuredServices.length} featured services`;
    if (key === "techStack") return `${(cfg.techStack?.ids || []).length || "all"} technologies`;
    if (key === "roadmap") return `${phases.filter((p) => p.visible !== false).length} phases`;
    return SECTION_META[key]?.blurb;
  };

  return (
    <div data-testid="homepage-admin">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <span className="font-mono text-[10px] tracking-[0.3em] text-violet">WEBSITE / HOMEPAGE</span>
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
          <button onClick={save} disabled={saving} data-testid="homepage-save"
            className="h-9 px-4 border border-amb/50 font-mono text-[10px] tracking-[0.15em] uppercase text-amb hover:bg-amb/10">
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button onClick={publish} disabled={saving} data-testid="homepage-publish"
            className="h-9 px-5 bg-violet font-mono text-[10px] tracking-[0.15em] uppercase font-semibold" style={{ color: "var(--bg)" }}>
            Publish →
          </button>
        </div>
      </div>

      {msg && <p className={`mb-4 font-mono text-xs ${msg.startsWith("✓") ? "text-grn" : "text-pk"}`} data-testid="homepage-msg">{msg}</p>}

      {/* section visibility + order */}
      <div className="panel mb-8" data-testid="hp-sections">
        <div className="px-5 py-3.5 border-b border-line flex items-center justify-between">
          <span className="font-display font-bold text-sm text-ink">PAGE STRUCTURE — VISIBILITY & ORDER</span>
          <span className="font-mono text-[9px] text-ink3 uppercase tracking-[0.15em]">{(cfg.sections || []).filter((s) => s.visible).length} visible</span>
        </div>
        <div className="px-4 py-3 border-b border-line flex flex-wrap items-center gap-2" data-testid="hp-presets">
          <span className="font-mono text-[9px] tracking-[0.2em] text-ink3 uppercase mr-1">One-click presets</span>
          {Object.entries(PRESETS).map(([k, p]) => (
            <button key={k} onClick={() => applyPreset(k)} data-testid={`hp-preset-${k}`} title={p.hint}
              className={`h-8 px-3 border font-mono text-[9px] tracking-[0.15em] uppercase transition-colors ${
                activePreset === k ? "border-violet text-violet bg-violet/10" : "border-line text-ink2 hover:border-violet hover:text-violet"
              }`}>
              {activePreset === k && "● "}{p.label}
            </button>
          ))}
          <span className="font-mono text-[9px] text-ink3 uppercase tracking-[0.1em] w-full sm:w-auto sm:ml-1">
            {activePreset ? PRESETS[activePreset].hint : "custom order"}
          </span>
        </div>
        <div className="divide-y divide-line">
          {(cfg.sections || []).map((s, i) => (
            <div key={s.key} className="flex items-center gap-3 px-4 py-2">
              <RowControls i={i} len={cfg.sections.length} onMove={(a, d) => set("sections", moveIn(cfg.sections, a, d))} />
              <span className="font-mono text-[10px] text-ink2 uppercase tracking-[0.12em] flex-1">{SECTION_META[s.key]?.title || s.key}</span>
              <Check label="visible" checked={s.visible}
                onChange={(v) => set("sections", cfg.sections.map((x, j) => (j === i ? { ...x, visible: v } : x)))}
                testid={`hp-sec-${s.key}`} />
            </div>
          ))}
        </div>
      </div>

      {/* content map */}
      {GROUP_ORDER.map((group) => (
        <div key={group} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-[10px] tracking-[0.3em] text-violet">{group}</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
            {Object.entries(SECTION_META).filter(([, m]) => m.group === group).map(([key, m]) => (
              <div key={key} className={`panel p-5 min-h-[180px] flex flex-col group hover:border-violet transition-colors ${sectionVisible(key) ? "" : "opacity-55"}`}
                data-testid={`hp-card-${key}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`w-1.5 h-1.5 rounded-full ${sectionVisible(key) ? "bg-grn" : "bg-ink3"}`} />
                  <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink3">{sectionVisible(key) ? "VISIBLE" : "HIDDEN"}</span>
                </div>
                <h3 className="font-display text-base font-bold tracking-tight text-ink">{m.title}</h3>
                <p className="mt-1.5 font-mono text-[9px] text-ink3 uppercase tracking-[0.12em] leading-relaxed">{metaFor(key)}</p>
                <button onClick={() => setEditing(key)} data-testid={`hp-edit-${key}`}
                  className="mt-auto h-9 px-4 border border-line font-mono text-[10px] tracking-[0.12em] uppercase text-ink2 hover:border-violet hover:text-violet hover:bg-violet/5 transition-colors inline-flex items-center gap-1.5 self-start">
                  <PencilLine size={11} /> Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* revision history */}
      <div className="panel" data-testid="hp-revisions">
        <div className="px-5 py-3.5 border-b border-line flex items-center justify-between">
          <span className="font-display font-bold text-sm text-ink">REVISION HISTORY</span>
          <span className="font-mono text-[9px] text-ink3 uppercase tracking-[0.15em]">last 15 drafts</span>
        </div>
        <div className="p-5">{FORMS.revisions}</div>
      </div>

      {/* section editing drawer */}
      {editing && (
        <div className="fixed inset-0 z-[70] flex justify-end" data-testid="hp-drawer">
          <div className="absolute inset-0 bg-canvas/70 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-2xl bg-card border-l border-line h-full flex flex-col">
            <div className="flex items-center justify-between px-6 h-14 border-b border-line shrink-0">
              <div>
                <span className="font-mono text-[9px] tracking-[0.25em] text-violet uppercase">HOMEPAGE / {SECTION_META[editing]?.group}</span>
                <h2 className="font-display text-lg font-extrabold tracking-tight text-ink">{SECTION_META[editing]?.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={save} disabled={saving} className="h-9 px-4 border border-amb/50 font-mono text-[10px] uppercase text-amb hover:bg-amb/10 disabled:opacity-50">
                  {saving ? "Saving…" : "Save Draft"}
                </button>
                <button onClick={() => setEditing(null)} aria-label="Close editor" data-testid="hp-drawer-close"
                  className="h-9 w-9 grid place-items-center border border-line text-ink3 hover:text-ink"><X size={15} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{FORMS[editing]}</div>
          </div>
        </div>
      )}

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
