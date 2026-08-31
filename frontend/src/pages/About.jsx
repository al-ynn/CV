import { useEffect, useState } from "react";
import api from "../lib/api";
import { useContent } from "../lib/content";
import useSeo from "../lib/useSeo";
import TemplateRenderer from "../components/about/AboutTemplates";

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
    <div data-testid="about-page" data-template={profile.template}>
      <TemplateRenderer profile={profile} ctx={ctx} />
    </div>
  );
}
