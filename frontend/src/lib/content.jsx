import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "./api";

const ContentContext = createContext(null);

const EMPTY_CONTENT = {
  settings: {
    contactEmail: "", contact: {}, socials: {}, github: "", linkedin: "", available: false,
    availability: "", location: "", siteName: "", version: "", copyright: "", fullName: "", title: "",
    resumeTitle: "", resumeSummary: "", portrait: "",
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
  const [data, setData] = useState({ ...EMPTY_CONTENT, loading: true, error: null });

  const load = useCallback(async () => {
    try {
      const { data: d } = await api.get("/content/bootstrap");
      const accent = d.appearance?.primaryAccent;
      if (accent && ACCENTS[accent]) {
        const dark = document.documentElement.classList.contains("dark");
        document.documentElement.style.setProperty("--violet", ACCENTS[accent][dark ? "dark" : "light"]);
      }
      setData({ ...EMPTY_CONTENT, ...d, settings: { ...EMPTY_CONTENT.settings, ...d.settings }, loading: false, error: null });
    } catch (error) {
      console.error("Portfolio content API failed", error);
      setData({ ...EMPTY_CONTENT, loading: false, error: error.response?.data?.detail || error.message || "Unable to load content." });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return <ContentContext.Provider value={{ ...data, refresh: load }}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);
