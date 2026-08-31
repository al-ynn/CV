import { useState } from "react";
import { Mail, MessageCircle, Facebook, Copy, Check, ExternalLink, Phone } from "lucide-react";
import { Reveal, TechLabel } from "./system/bits";

function CopyButton({ value, testid }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button
      type="button"
      onClick={copy}
      data-testid={testid}
      aria-label={`Copy ${value}`}
      className={`inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] uppercase px-2.5 py-1.5 border transition-colors ${
        copied ? "border-grn text-grn" : "border-line text-ink3 hover:text-violet hover:border-violet"
      }`}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied to clipboard" : "Copy"}
    </button>
  );
}

export function useChannels(settings) {
  const c = settings?.contact || {};
  const telDigits = (c.mobile || "").replace(/[^\d+]/g, "");
  const waDigits = (c.whatsapp || telDigits.replace(/^0/, "63")).replace(/\D/g, "");
  return [
    c.email && {
      key: "email", label: "EMAIL", value: c.email, icon: Mail, copy: c.email,
      actions: [{ href: `mailto:${c.email}`, label: "Open Mail", testid: "channel-email-open" }],
    },
    (c.mobile || c.whatsapp) && {
      key: "whatsapp", label: "WHATSAPP / MOBILE", value: c.mobile || c.whatsapp, icon: MessageCircle, copy: c.mobile || c.whatsapp,
      actions: [
        waDigits && { href: `https://wa.me/${waDigits}`, label: "WhatsApp", testid: "channel-whatsapp-open", external: true },
        telDigits && { href: `tel:${telDigits}`, label: "Call", testid: "channel-call", icon: Phone },
      ].filter(Boolean),
    },
    c.facebookName && {
      key: "facebook", label: "FACEBOOK", value: c.facebookName, icon: Facebook, copy: c.facebookUrl || c.facebookName,
      actions: c.facebookUrl
        ? [{ href: c.facebookUrl, label: "Open Page", testid: "channel-facebook-open", external: true }]
        : [],
    },
  ].filter(Boolean);
}

export default function DirectChannels({ settings, columns = "sm:grid-cols-3", testidPrefix = "channel" }) {
  const items = useChannels(settings);
  if (!items.length) return null;
  return (
    <div className={`grid ${columns} gap-4 eq-grid`} data-testid={`${testidPrefix}-grid`}>
      {items.map((ch, i) => {
        const Icon = ch.icon;
        return (
          <Reveal key={ch.key} delay={i * 0.06} className="h-full">
            <div
              className="eq-card panel panel-hover p-5 relative overflow-hidden group"
              data-testid={`${testidPrefix}-${ch.key}`}
            >
              <div className="absolute top-0 left-0 w-full h-0.5 bg-violet scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
              <div className="flex items-center justify-between mb-4">
                <span className="grid place-items-center w-9 h-9 border border-line text-violet group-hover:border-violet transition-colors">
                  <Icon size={15} />
                </span>
                <TechLabel>{ch.label}</TechLabel>
              </div>
              <p className="font-mono text-sm text-ink break-all leading-relaxed">{ch.value}</p>
              <div className="eq-card-foot pt-4 mt-4 border-t border-line flex flex-wrap items-center gap-2">
                <CopyButton value={ch.copy} testid={`${testidPrefix}-${ch.key}-copy`} />
                {ch.actions.map((a) => (
                  <a
                    key={a.label}
                    href={a.href}
                    {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    data-testid={a.testid}
                    className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] uppercase px-2.5 py-1.5 border border-line text-ink2 hover:text-violet hover:border-violet transition-colors"
                  >
                    {a.label} {a.external ? <ExternalLink size={10} /> : "→"}
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
