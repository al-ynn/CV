import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../../lib/content";
import { NAV_LINKS } from "../../data/content";
import { StatusDot, TechLabel } from "../system/bits";

const AVAILABILITY_LABEL = { available: "AVAILABLE", limited: "LIMITED", unavailable: "UNAVAILABLE" };
const AVAILABILITY_COLOR = { available: "var(--green)", limited: "var(--amber)", unavailable: "var(--pink)" };

export default function Footer() {
  const { settings } = useContent();
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat("en-PH", {
          timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
        }).format(new Date())
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const year = new Date().getFullYear();
  const socials = settings.socials || {};
  const avail = settings.availability || "available";

  return (
    <footer className="border-t border-line bg-canvas2/40">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6">
          <div className="lg:col-span-4">
            <div className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight leading-none">
              ALEANA<br />AMURAO
            </div>
            <p className="mt-4 font-mono text-[11px] tracking-[0.2em] uppercase text-ink2 leading-relaxed">
              Full-Stack Developer<br />Systems / Web / UI<br />{settings.location}
            </p>
            <p className="mt-6 font-mono text-[10px] tracking-[0.3em] text-violet">BUILD / SHIP / ITERATE</p>
          </div>

          <div className="lg:col-span-2">
            <TechLabel className="block mb-4">Navigate</TechLabel>
            <ul className="space-y-2.5">
              {[...NAV_LINKS, { to: "/resume", label: "Resume" }].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} data-testid={`footer-link-${l.label.toLowerCase()}`}
                    className="font-mono text-[11px] tracking-[0.15em] uppercase text-ink2 hover:text-violet transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <TechLabel className="block mb-4">Contact</TechLabel>
            <ul className="space-y-3 font-mono text-[11px] tracking-[0.1em]">
              {(settings.contact?.email || settings.contactEmail) && (
                <li>
                  <span className="block text-[9px] tracking-[0.2em] text-ink3 uppercase mb-0.5">Email</span>
                  <a href={`mailto:${settings.contact?.email || settings.contactEmail}`} data-testid="footer-email"
                    className="text-ink2 hover:text-violet transition-colors break-all">
                    {settings.contact?.email || settings.contactEmail}
                  </a>
                </li>
              )}
              {settings.contact?.mobile && (
                <li>
                  <span className="block text-[9px] tracking-[0.2em] text-ink3 uppercase mb-0.5">WhatsApp / Mobile</span>
                  <a href={settings.contact?.whatsapp ? `https://wa.me/${settings.contact.whatsapp.replace(/\D/g, "")}` : `tel:${settings.contact.mobile.replace(/[^\d+]/g, "")}`}
                    data-testid="footer-whatsapp"
                    {...(settings.contact?.whatsapp ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="text-ink2 hover:text-violet transition-colors">
                    {settings.contact.mobile}
                  </a>
                </li>
              )}
              {settings.contact?.facebookName && (
                <li>
                  <span className="block text-[9px] tracking-[0.2em] text-ink3 uppercase mb-0.5">Facebook</span>
                  {settings.contact?.facebookUrl ? (
                    <a href={settings.contact.facebookUrl} target="_blank" rel="noopener noreferrer" data-testid="footer-facebook"
                      className="text-ink2 hover:text-violet transition-colors">
                      {settings.contact.facebookName} ↗
                    </a>
                  ) : (
                    <span className="text-ink2" data-testid="footer-facebook">{settings.contact.facebookName}</span>
                  )}
                </li>
              )}
              <li>
                <span className="block text-[9px] tracking-[0.2em] text-ink3 uppercase mb-0.5">CV</span>
                <a href={`${process.env.REACT_APP_BACKEND_URL}/api/resume.pdf`} data-testid="footer-resume"
                  className="text-ink2 hover:text-violet transition-colors uppercase">
                  Resume ↓
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <TechLabel className="block mb-4">Links</TechLabel>
            <ul className="space-y-2.5">
              {Object.entries(socials).map(([k, v]) => (
                <li key={k}>
                  <a href={v} target="_blank" rel="noopener noreferrer" data-testid={`footer-${k}`}
                    className="font-mono text-[11px] tracking-[0.15em] uppercase text-ink2 hover:text-violet transition-colors">
                    {k} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <TechLabel className="block mb-4">System</TechLabel>
            <dl className="space-y-3 font-mono text-[10px] tracking-[0.12em] uppercase">
              <div>
                <dt className="text-ink3">Local Time</dt>
                <dd className="text-ink mt-0.5 tabular-nums" data-testid="footer-local-time">{time} PHT</dd>
              </div>
              <div>
                <dt className="text-ink3">Status</dt>
                <dd className="mt-0.5 flex items-center gap-2" data-testid="footer-status">
                  <StatusDot color={AVAILABILITY_COLOR[avail]} />
                  <span style={{ color: AVAILABILITY_COLOR[avail] }}>{AVAILABILITY_LABEL[avail]}</span>
                </dd>
              </div>
              <div>
                <dt className="text-ink3">Version</dt>
                <dd className="text-ink2 mt-0.5">{settings.version}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink3">
            {settings.copyright || `© ${year} Aleana Amurao`}
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink3">
            Designed & built as a system — not a template
          </span>
        </div>
      </div>
    </footer>
  );
}
