import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

const TONES = {
  success: { icon: CheckCircle2, color: "text-grn", border: "border-grn/40", bar: "bg-grn" },
  error: { icon: XCircle, color: "text-pk", border: "border-pk/50", bar: "bg-pk" },
  warning: { icon: AlertTriangle, color: "text-amb", border: "border-amb/50", bar: "bg-amb" },
  info: { icon: Info, color: "text-violet", border: "border-violet/50", bar: "bg-violet" },
};

export function AdminToast({ notification, onClose }) {
  useEffect(() => {
    if (!notification) return undefined;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;
  const tone = TONES[notification.type] || TONES.info;
  const Icon = tone.icon;
  return (
    <div className="fixed right-4 top-4 z-[120] w-[min(390px,calc(100vw-2rem))]" role="status" aria-live="polite" data-testid="admin-notification">
      <div className={`relative overflow-hidden border ${tone.border} bg-card shadow-2xl`}>
        <span className={`absolute inset-y-0 left-0 w-1 ${tone.bar}`} />
        <div className="flex items-start gap-3 p-4 pl-5">
          <Icon size={17} className={`mt-0.5 shrink-0 ${tone.color}`} />
          <div className="min-w-0 flex-1">
            <p className={`font-mono text-[9px] tracking-[0.22em] uppercase ${tone.color}`}>{notification.title || notification.type}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink">{notification.message}</p>
          </div>
          <button onClick={onClose} aria-label="Dismiss notification" className="p-1 text-ink3 hover:text-ink"><X size={14} /></button>
        </div>
      </div>
    </div>
  );
}

export function AdminConfirm({ open, title, item, description, confirmLabel = "Confirm", danger = false, busy = false, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && !busy && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !busy && onCancel()}>
      <div className="panel w-full max-w-md overflow-hidden border-pk/35 shadow-2xl" role="alertdialog" aria-modal="true" aria-labelledby="admin-confirm-title" data-testid="admin-confirm-dialog">
        <div className="flex items-start gap-4 border-b border-line p-5 sm:p-6">
          <div className={`grid h-10 w-10 shrink-0 place-items-center border ${danger ? "border-pk/50 bg-pk/10 text-pk" : "border-amb/50 bg-amb/10 text-amb"}`}><AlertTriangle size={19} /></div>
          <div>
            <p className={`font-mono text-[9px] tracking-[0.25em] uppercase ${danger ? "text-pk" : "text-amb"}`}>Confirmation required</p>
            <h2 id="admin-confirm-title" className="mt-1 font-display text-xl font-extrabold text-ink">{title}</h2>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          {item && <div className="mb-4 border border-line bg-canvas px-4 py-3 font-mono text-xs text-ink">{item}</div>}
          <p className="text-sm leading-relaxed text-ink2">{description}</p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button disabled={busy} onClick={onCancel} className="h-10 px-5 border border-line font-mono text-[10px] tracking-[0.16em] uppercase text-ink3 hover:border-ink3 hover:text-ink disabled:opacity-50">Cancel</button>
            <button disabled={busy} onClick={onConfirm} data-testid="admin-confirm-submit" className={`h-10 px-5 font-mono text-[10px] font-semibold tracking-[0.16em] uppercase disabled:opacity-50 ${danger ? "bg-pk text-white" : "bg-amb text-black"}`}>{busy ? "Working…" : confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
