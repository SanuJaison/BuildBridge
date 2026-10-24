import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";

const FALLBACK = {
  siteName: "BuildBridge",
  tagline: "Where ambitious ideas meet proven digital talent.",
  heroHeadline: "Build something remarkable with the right people behind it.",
  heroSubline:
    "Discover independent specialists, studios, and digital agencies who turn product ideas into working software, games, brands, and growth engines.",
  supportEmail: "hello@buildbridge.dev",
  supportPhone: "",
  location: "Remote-first · Serving teams worldwide",
  showDemoNotice: true,
};

const BrandingContext = createContext({ branding: FALLBACK, refresh: () => {} });

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(FALLBACK);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/settings/public");
      if (data?.branding) setBranding({ ...FALLBACK, ...data.branding });
    } catch {
      // Keep the local defaults if settings cannot be reached.
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ branding, refresh }), [branding, refresh]);
  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
