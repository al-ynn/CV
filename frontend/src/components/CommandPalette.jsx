import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import { useTheme } from "../lib/theme";
import { NAV_LINKS } from "../data/content";

export default function CommandPalette({ open, setOpen }) {
  const navigate = useNavigate();
  const { cycle } = useTheme();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const go = (to) => { setOpen(false); navigate(to); };

  const items = [
    { label: "Go Home", action: () => go("/"), hint: "/" },
    ...NAV_LINKS.map((l) => ({ label: `View ${l.label}`, action: () => go(l.to), hint: l.to })),
    { label: "View Resume", action: () => go("/resume"), hint: "/resume" },
    {
      label: "Download CV (PDF)",
      action: () => { setOpen(false); window.open(`${process.env.REACT_APP_BACKEND_URL}/api/resume.pdf`, "_blank"); },
      hint: "PDF",
    },
    { label: "Quote Estimator", action: () => go("/pricing#estimator"), hint: "₱" },
    { label: "Toggle Theme", action: () => cycle(), hint: "THEME" },
  ];

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      data-testid="command-palette"
      className="fixed inset-0 z-[70] flex items-start justify-center pt-[18vh] px-4"
    >
      <div className="absolute inset-0 bg-canvas/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg panel shadow-2xl">
        <div className="flex items-center gap-3 px-4 border-b border-line">
          <span className="font-mono text-[10px] tracking-[0.25em] text-violet">CMD</span>
          <Command.Input
            data-testid="command-input"
            placeholder="Type a command or search…"
            className="w-full h-12 bg-transparent font-mono text-sm text-ink placeholder:text-ink3 focus:outline-none"
          />
        </div>
        <Command.List className="max-h-72 overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center font-mono text-xs text-ink3">NO MATCHING COMMAND</Command.Empty>
          {items.map((item) => (
            <Command.Item
              key={item.label}
              onSelect={item.action}
              data-testid={`command-${item.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              className="flex items-center justify-between px-3 py-2.5 cursor-pointer font-mono text-xs text-ink2 data-[selected=true]:bg-canvas2 data-[selected=true]:text-ink"
            >
              <span>{item.label}</span>
              <span className="text-[9px] tracking-[0.2em] text-ink3">{item.hint}</span>
            </Command.Item>
          ))}
        </Command.List>
        <div className="px-4 py-2 border-t border-line flex justify-between font-mono text-[9px] tracking-[0.2em] text-ink3 uppercase">
          <span>↑↓ navigate · ↵ select · esc close</span>
          <span>SYS.PALETTE</span>
        </div>
      </div>
    </Command.Dialog>
  );
}
