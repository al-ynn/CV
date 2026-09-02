import { useEffect, useState } from "react";
import api from "../lib/api";
import { useContent } from "../lib/content";
import useSeo from "../lib/useSeo";
import TemplateRenderer from "../components/about/AboutTemplates";

function AboutScrollLight() {
  const trail = "M120 -70 C820 70 875 185 245 300 S105 500 790 590 S900 790 265 900 S120 1040 735 1120";
  return (
    <div className="about-scroll-light" aria-hidden="true">
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <defs>
          <linearGradient id="about-trail-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--violet)">
              <animate attributeName="stop-color" values="var(--violet);var(--cyan);var(--pink);var(--violet)" dur="9s" repeatCount="indefinite" />
            </stop>
            <stop offset="52%" stopColor="var(--cyan)">
              <animate attributeName="stop-color" values="var(--cyan);var(--pink);var(--violet);var(--cyan)" dur="9s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="var(--pink)">
              <animate attributeName="stop-color" values="var(--pink);var(--violet);var(--cyan);var(--pink)" dur="9s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          <filter id="about-trail-glow" x="-80%" y="-30%" width="260%" height="160%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <marker id="about-route-arrow" viewBox="0 0 12 12" refX="9" refY="6" markerWidth="9" markerHeight="9" orient="auto">
            <path d="M1 1 L10 6 L1 11" fill="none" stroke="var(--cyan)" strokeWidth="2" />
          </marker>
        </defs>
        <path d={trail} className="about-trail-glow" />
        <path d={trail} className="about-trail-road" />
        <path d={trail} className="about-trail-core" />
        <path d={trail} className="about-trail-arrows" markerMid="url(#about-route-arrow)" markerEnd="url(#about-route-arrow)" />
      </svg>
    </div>
  );
}

export default function About() {
  const content = useContent();
  const [data, setData] = useState(null);
  const profile = data?.profile;
  useSeo(profile?.seo?.title || "About");

  useEffect(() => {
    api.get("/content/about").then(({ data }) => setData(data)).catch(() => setData({ profile: null, stats: {} }));
  }, []);

  useEffect(() => {
    if (profile?.seo?.description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", profile.seo.description);
    }
  }, [profile]);

  if (!data) {
    return <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-24 font-mono text-xs text-ink3 animate-blink">LOADING PROFILE…</div>;
  }
  if (!profile) {
    return (
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 py-32 text-center" data-testid="about-empty">
        <p className="font-mono text-xs tracking-[0.25em] text-ink3">ABOUT / OFFLINE</p>
        <p className="mt-4 text-sm text-ink2">No published About profile yet.</p>
      </div>
    );
  }

  const ctx = { ...content, stats: data.stats };
  return (
    <div className="about-page-shell" data-testid="about-page" data-template={profile.template}>
      <AboutScrollLight />
      <div className="relative z-[1]">
        <TemplateRenderer profile={profile} ctx={ctx} />
      </div>
    </div>
  );
}
