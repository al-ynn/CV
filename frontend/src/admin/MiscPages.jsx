import { useEffect, useState } from "react";
import api, { formatApiError } from "../lib/api";
import { Download, Upload } from "lucide-react";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

export function ResumePage() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  const upload = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post("/admin/resume", fd);
      setMsg("✓ CV replaced — the public Download CV button now serves this file");
      setFile(null);
    } catch (err) {
      setMsg(formatApiError(err.response?.data?.detail));
    }
  };

  return (
    <div data-testid="admin-resume" className="max-w-2xl">
      <span className="font-mono text-[10px] tracking-[0.3em] text-violet">ADMIN / RESUME</span>
      <h1 className="mt-2 mb-6 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">DOWNLOADABLE CV</h1>
      <div className="panel p-6 space-y-5">
        <div className="flex flex-wrap gap-3">
          <a href={`${BACKEND}/api/resume.pdf`} target="_blank" rel="noopener noreferrer" data-testid="resume-preview"
            className="h-10 px-5 inline-flex items-center gap-2 border border-line font-mono text-[10px] tracking-[0.15em] uppercase text-ink2 hover:border-violet">
            Preview Current CV ↗
          </a>
          <a href={`${BACKEND}/api/resume.pdf`} download data-testid="resume-download-admin"
            className="h-10 px-5 inline-flex items-center gap-2 border border-line font-mono text-[10px] tracking-[0.15em] uppercase text-ink2 hover:border-violet">
            <Download size={12} /> Download
          </a>
        </div>
        <div>
          <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-2">Replace CV (PDF, max 8 MB)</span>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} data-testid="resume-upload"
            className="font-mono text-xs text-ink2" />
        </div>
        <button onClick={upload} disabled={!file} data-testid="resume-upload-btn"
          className="h-10 px-6 bg-violet font-mono text-[10px] tracking-[0.2em] uppercase font-semibold inline-flex items-center gap-2 disabled:opacity-40"
          style={{ color: "var(--bg)" }}>
          <Upload size={13} /> Replace CV
        </button>
        <p className="font-mono text-[9px] text-ink3">Without an upload, the site serves an auto-generated CV built from your portfolio data.</p>
        {msg && <p className={`font-mono text-xs ${msg.startsWith("✓") ? "text-grn" : "text-pk"}`}>{msg}</p>}
      </div>
    </div>
  );
}

export function SecurityPage() {
  const [form, setForm] = useState({ current: "", new: "" });
  const [msg, setMsg] = useState("");

  const save = async () => {
    try {
      await api.post("/admin/password", form);
      setMsg("✓ Password changed");
      setForm({ current: "", new: "" });
    } catch (err) {
      setMsg(formatApiError(err.response?.data?.detail));
    }
  };

  return (
    <div data-testid="admin-security" className="max-w-md">
      <span className="font-mono text-[10px] tracking-[0.3em] text-violet">ACCOUNT / SECURITY</span>
      <h1 className="mt-2 mb-6 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">SECURITY</h1>
      <div className="panel p-6 space-y-4">
        <div>
          <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-1.5">Current Password</label>
          <input type="password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })}
            data-testid="security-current"
            className="w-full h-10 px-3 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none" />
        </div>
        <div>
          <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ink3 mb-1.5">New Password (min 8 chars)</label>
          <input type="password" value={form.new} onChange={(e) => setForm({ ...form, new: e.target.value })}
            data-testid="security-new"
            className="w-full h-10 px-3 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none" />
        </div>
        <button onClick={save} data-testid="security-save"
          className="h-10 px-6 bg-violet font-mono text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: "var(--bg)" }}>
          Change Password
        </button>
        {msg && <p className={`font-mono text-xs ${msg.startsWith("✓") ? "text-grn" : "text-pk"}`}>{msg}</p>}
        <p className="font-mono text-[9px] text-ink3 leading-relaxed">
          Sessions expire after 12 hours. Login is rate-limited after 5 failed attempts. Password reset links are emailed to the admin address.
        </p>
      </div>
    </div>
  );
}

export function ActivityPage() {
  const [items, setItems] = useState(null);
  useEffect(() => {
    api.get("/admin/activity").then(({ data }) => setItems(data)).catch(() => setItems([]));
  }, []);
  return (
    <div data-testid="admin-activity">
      <span className="font-mono text-[10px] tracking-[0.3em] text-violet">ADMIN / ACTIVITY LOG</span>
      <h1 className="mt-2 mb-6 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">ACTIVITY</h1>
      {!items ? (
        <p className="font-mono text-xs text-ink3 animate-blink">LOADING…</p>
      ) : items.length === 0 ? (
        <div className="panel p-12 text-center font-mono text-xs text-ink3">NO ACTIVITY RECORDED YET</div>
      ) : (
        <div className="panel divide-y divide-line">
          {items.map((a) => (
            <div key={a.id} className="px-5 py-3.5 flex flex-wrap items-baseline justify-between gap-2 font-mono text-[11px]">
              <span className="text-ink2">
                <span className="text-violet uppercase">{a.action}</span> "{a.record}" <span className="text-ink3">in {a.collection}</span>
              </span>
              <span className="text-[9px] text-ink3">{new Date(a.at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ExportPanel() {
  const [msg, setMsg] = useState("");
  const doExport = async () => {
    try {
      const { data } = await api.get("/admin/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `amurao-portfolio-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg("✓ Export downloaded");
    } catch {
      setMsg("Export failed");
    }
  };
  return (
    <div className="panel p-6 mt-8 max-w-2xl" data-testid="admin-export">
      <span className="font-mono text-[10px] tracking-[0.25em] text-violet">BACKUP / EXPORT</span>
      <p className="mt-2 font-mono text-[10px] text-ink3 leading-relaxed">
        Download all portfolio content as structured JSON. Your content stays portable — never locked in.
      </p>
      <button onClick={doExport} data-testid="export-btn"
        className="mt-4 h-10 px-5 border border-line font-mono text-[10px] tracking-[0.15em] uppercase text-ink2 hover:border-violet inline-flex items-center gap-2">
        <Download size={12} /> Export Content (JSON)
      </button>
      {msg && <p className="mt-3 font-mono text-xs text-grn">{msg}</p>}
    </div>
  );
}
