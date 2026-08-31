import { useEffect, useState } from "react";
import api from "../lib/api";
import { Trash2 } from "lucide-react";

const STATUSES = ["NEW", "READ", "REPLIED", "QUALIFIED", "CLOSED", "SPAM"];
const STATUS_STYLE = {
  NEW: "border-pk/40 text-pk", READ: "border-line text-ink3", REPLIED: "border-cy/40 text-cy",
  QUALIFIED: "border-grn/40 text-grn", CLOSED: "border-line text-ink3", SPAM: "border-amb/40 text-amb",
};

export default function InboxPage() {
  const [items, setItems] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [notes, setNotes] = useState("");

  const load = () => api.get("/admin/inquiries").then(({ data }) => setItems(data)).catch(() => setItems([]));
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => { await api.patch(`/admin/inquiries/${id}`, { status }); load(); };
  const saveNotes = async (id) => { await api.patch(`/admin/inquiries/${id}`, { notes }); load(); };
  const remove = async (id) => {
    if (window.confirm("Delete this inquiry permanently?")) {
      await api.delete(`/admin/inquiries/${id}`);
      load();
    }
  };

  const shown = (items || []).filter((q) => filter === "ALL" || q.status === filter);

  return (
    <div data-testid="admin-inbox">
      <span className="font-mono text-[10px] tracking-[0.3em] text-violet">ADMIN / CONTACT REQUESTS</span>
      <h1 className="mt-2 mb-6 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
        INBOX / {String((items || []).length).padStart(2, "0")}
      </h1>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {["ALL", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} data-testid={`inbox-filter-${s.toLowerCase()}`}
            className={`h-9 px-3 font-mono text-[9px] tracking-[0.15em] border transition-colors ${
              filter === s ? "border-violet text-violet bg-violet/10" : "border-line text-ink3 hover:text-ink"
            }`}>
            {s}
          </button>
        ))}
      </div>

      {!items ? (
        <p className="font-mono text-xs text-ink3 animate-blink">LOADING…</p>
      ) : shown.length === 0 ? (
        <div className="panel p-12 text-center">
          <p className="font-mono text-xs tracking-[0.25em] text-ink3 mb-2">INBOX EMPTY</p>
          <p className="font-mono text-[10px] text-ink3">Contact form submissions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((q) => (
            <div key={q.id} className="panel">
              <button data-testid={`inquiry-${q.id}`}
                onClick={() => { setOpenId(openId === q.id ? null : q.id); setNotes(q.notes || ""); }}
                className="w-full flex flex-wrap items-center gap-4 px-5 py-4 text-left">
                <span className={`font-mono text-[9px] tracking-[0.2em] px-2 py-0.5 border ${STATUS_STYLE[q.status] || STATUS_STYLE.NEW}`}>
                  {q.status}
                </span>
                <span className="font-display font-bold text-sm text-ink">{q.name}</span>
                <span className="font-mono text-[10px] text-ink3">{q.projectType || "—"}</span>
                <span className="ml-auto font-mono text-[10px] text-ink3">{new Date(q.created_at).toLocaleDateString()}</span>
              </button>
              {openId === q.id && (
                <div className="px-5 pb-5 border-t border-line pt-4 space-y-4 font-mono text-xs">
                  <div className="grid sm:grid-cols-3 gap-3 text-ink2">
                    <span>EMAIL: {q.email}</span>
                    <span>ORG: {q.company || "—"}</span>
                    <span>BUDGET: {q.budget || "—"}</span>
                    <span>TIMELINE: {q.timeline || "—"}</span>
                    {q.brief?.range && <span>ESTIMATE: {q.brief.range}</span>}
                  </div>
                  <p className="text-ink2 whitespace-pre-wrap leading-relaxed border border-line bg-canvas p-4">{q.message}</p>
                  <div>
                    <span className="block font-mono text-[9px] tracking-[0.25em] text-ink3 mb-1.5">INTERNAL NOTES (never public)</span>
                    <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-canvas border border-line font-mono text-xs text-ink focus:border-violet focus:outline-none resize-y" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href={`mailto:${q.email}`} className="px-4 h-9 inline-flex items-center bg-violet font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--bg)" }}>
                      Reply ↗
                    </a>
                    {STATUSES.filter((s) => s !== q.status).slice(0, 3).map((s) => (
                      <button key={s} onClick={() => setStatus(q.id, s)}
                        className="px-3 h-9 border border-line font-mono text-[9px] tracking-[0.15em] uppercase text-ink2 hover:border-violet">
                        → {s}
                      </button>
                    ))}
                    <button onClick={() => saveNotes(q.id)} className="px-4 h-9 border border-line font-mono text-[10px] tracking-[0.15em] uppercase text-ink2 hover:border-violet">
                      Save Notes
                    </button>
                    <button onClick={() => remove(q.id)} className="px-3 h-9 border border-line text-pk hover:border-pk">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
