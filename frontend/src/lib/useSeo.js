import { useEffect } from "react";
import { useContent } from "./content";

export default function useSeo(pageTitle) {
  const { seo, settings } = useContent();
  useEffect(() => {
    const site = seo.siteTitle || `${settings.fullName} — Full-Stack Developer`;
    document.title = pageTitle ? `${pageTitle} · ${settings.siteName}` : site;
    let meta = document.querySelector('meta[name="description"]');
    if (meta && seo.siteDescription) meta.setAttribute("content", seo.siteDescription);
  }, [pageTitle, seo, settings]);
}
