import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "./api";

const ContentContext = createContext(null);

const FALLBACK = {
  settings: {
    contactEmail: "", socials: {}, github: "", linkedin: "", available: true,
    availability: "available", location: "Philippines", siteName: "AMURAO.DEV",
    version: "PORTFOLIO / 1.1", copyright: "", fullName: "Aleana Rose C. Amurao", title: "",
  },
  homepage: {},
  about: {},
  estimator: {},
  seo: {},
  appearance: {},
  projects: [],
  services: [],
  pricing: [],
  experience: [],
  education: [],
  certifications: [],
  journey: [],
  skills: [],
  technologies: [],
};

const ACCENTS = {
  violet: { dark: "#a855f7", light: "#6d28d9" },
  cyan: { dark: "#22d3ee", light: "#0e7490" },
  pink: { dark: "#fb4d6d", light: "#e11d48" },
  amber: { dark: "#fbbf24", light: "#b45309" },
  green: { dark: "#34d399", light: "#047857" },
};

export function ContentProvider({ children }) {
  const [data, setData] = useState({ ...FALLBACK, loading: true });

  const load = useCallback(async () => {
    try {
      const { data: d } = await api.get("/content/bootstrap");
      const accent = d.appearance?.primaryAccent;
      if (accent && ACCENTS[accent]) {
        const dark = document.documentElement.classList.contains("dark");
        document.documentElement.style.setProperty("--violet", ACCENTS[accent][dark ? "dark" : "light"]);
      }
      setData({ ...FALLBACK, ...d, settings: { ...FALLBACK.settings, ...d.settings }, loading: false });
    } catch {
      setData((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return <ContentContext.Provider value={{ ...data, refresh: load }}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);
