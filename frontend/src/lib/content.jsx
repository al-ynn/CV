import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "./api";

const ContentContext = createContext(null);

const FALLBACK_SETTINGS = {
  contactEmail: "",
  github: "",
  linkedin: "",
  available: true,
  location: "Philippines",
  siteName: "AMURAO.DEV",
  version: "PORTFOLIO / 1.0",
};

export function ContentProvider({ children }) {
  const [data, setData] = useState({
    settings: FALLBACK_SETTINGS,
    projects: [],
    services: [],
    pricing: [],
    loading: true,
  });

  const load = useCallback(async () => {
    try {
      const { data: d } = await api.get("/content/bootstrap");
      setData({ ...d, settings: { ...FALLBACK_SETTINGS, ...d.settings }, loading: false });
    } catch {
      setData((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return <ContentContext.Provider value={{ ...data, refresh: load }}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);
