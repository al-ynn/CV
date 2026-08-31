import { useEffect, useState } from "react";
import api, { formatApiError } from "../lib/api";
import { Upload, Copy, Trash2, FileText } from "lucide-react";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

export default function MediaPage() {
  const [media, setMedia] = useState(null);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => api.get("/admin/media").then(({ data }) => setMedia(data)).catch(() => setMedia([]));
  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setMsg("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post("/admin/media", fd);
      setMsg("✓ Uploaded");
      load();
    } catch (err) {
      setMsg(formatApiError(err.response?.data?.detail));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const copyUrl = (m) => {
    navigator.clipboard.writeText(`${BACKEND}${m.url}`);
    setMsg("✓ URL copied");
  };

  const remove = async (m) => {
    if (window.confirm(`DELETE FILE?\n\n${m.filename}\n\nContent using this image will lose it.`)) {
      await api.delete(`/admin/media/${m.id}`);
      load();
    }
  };

  const shown = (media || []).filter((m) => (m.filename || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div data-testid="admin-media">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <span className="font-mono text-[10px] tracking-[0.3em] text-violet">ADMIN / MEDIA LIBRARY</span>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            MEDIA / {String((media || []).length).padStart(2, "0")}
          </h1>
        </div>
        <label className="h-10 px-5 bg-violet font-mono text-[10px] tracking-[0.2em] uppercase font-semibold inline-flex items-center gap-2 cursor-pointer"
          style={{ color: "var(--bg)" }}>
          <Upload size={13} /> {uploading ? "Uploading…" : "Upload File"}
          <input type="file" accept="image/*,application/pdf" className="hidden" onChange={upload} data-testid="media-upload" />
        </label>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files…"
        data-testid="media-search"
        className="w-full max-w-sm h-10 px-3 mb-5 bg-card border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none" />

      {msg && <p className={`mb-4 font-mono text-xs ${msg.startsWith("✓") ? "text-grn" : "text-pk"}`}>{msg}</p>}

      {!media ? (
        <p className="font-mono text-xs text-ink3 animate-blink">LOADING…</p>
      ) : shown.length === 0 ? (
        <div className="panel p-12 text-center">
          <p className="font-mono text-xs tracking-[0.25em] text-ink3 mb-2">NO FILES</p>
          <p className="font-mono text-[10px] text-ink3">Upload images or PDFs — PNG, JPG, WEBP, GIF, PDF · max 8 MB.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {shown.map((m) => (
            <div key={m.id} className="panel overflow-hidden group" data-testid={`media-${m.id}`}>
              <div className="aspect-video bg-canvas2 grid place-items-center overflow-hidden">
                {m.mime?.startsWith("image/") ? (
                  <img src={`${BACKEND}${m.url}`} alt={m.alt || m.filename} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <FileText size={28} className="text-ink3" />
                )}
              </div>
              <div className="p-3">
                <p className="font-mono text-[10px] text-ink truncate">{m.filename}</p>
                <p className="font-mono text-[9px] text-ink3 mt-0.5">{(m.size / 1024).toFixed(0)} KB</p>
                <input defaultValue={m.alt || ""} placeholder="alt text"
                  onBlur={(e) => e.target.value !== (m.alt || "") && api.put(`/admin/media/${m.id}`, { alt: e.target.value, filename: m.filename })}
                  className="mt-2 w-full h-7 px-2 bg-canvas border border-line font-mono text-[9px] text-ink2 focus:border-violet focus:outline-none" />
                <div className="flex gap-1.5 mt-2">
                  <button onClick={() => copyUrl(m)} data-testid={`media-copy-${m.id}`}
                    className="flex-1 h-7 border border-line font-mono text-[9px] uppercase text-ink2 hover:border-violet flex items-center justify-center gap-1">
                    <Copy size={10} /> URL
                  </button>
                  <button onClick={() => remove(m)} className="h-7 px-2 border border-line text-pk hover:border-pk">
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
