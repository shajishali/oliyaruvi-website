import { createContext, useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { getNavigation, getSite, getTheme } from "../../lib/api";
import { fallbackNav, fallbackSite, fallbackTheme } from "../../lib/fallback";
import type { NavResponse, SiteResponse, SiteSettings, ThemeResponse } from "../../lib/types";

const SiteContext = createContext<SiteSettings>(fallbackSite.settings);

export function useSiteSettings() {
  return useContext(SiteContext);
}
import { MobileActionBar } from "./MobileActionBar";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function PublicLayout() {
  const [site, setSite] = useState<SiteResponse>(fallbackSite);
  const [nav, setNav] = useState<NavResponse>(fallbackNav);
  const [theme, setTheme] = useState<ThemeResponse>(fallbackTheme);

  useEffect(() => {
    let active = true;
    Promise.all([getSite(), getNavigation(), getTheme()])
      .then(([nextSite, nextNav, nextTheme]) => {
        if (!active) return;
        setSite(nextSite);
        setNav(nextNav);
        setTheme(nextTheme);
      })
      .catch(() => {
        // Keep the verified studio facts already on screen.
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const color = theme.tokens.color;
    root.style.setProperty("--color-background", safeColor(color.background, "#0B0B0D"));
    root.style.setProperty("--color-surface", safeColor(color.surface, "#17171B"));
    root.style.setProperty("--color-gold", safeColor(color.gold, "#D6AC57"));
    root.style.setProperty("--color-light-gold", safeColor(color.lightGold, "#F3D58C"));
    root.style.setProperty("--color-maroon", safeColor(color.maroon, "#651C2A"));
    root.style.setProperty("--color-text", safeColor(color.text, "#F7F3EB"));
    root.style.setProperty("--color-muted", safeColor(color.muted, "#B8B1A8"));
    root.style.setProperty("--font-heading", `${safeFont(theme.tokens.font.heading, "Playfair Display")}, Georgia, serif`);
    root.style.setProperty("--font-body", `${safeFont(theme.tokens.font.body, "Inter")}, sans-serif`);
    root.style.setProperty("--font-tamil", `${safeFont(theme.tokens.font.tamil, "Noto Sans Tamil")}, sans-serif`);
    root.style.setProperty("--radius-button", safeLength(theme.tokens.radius, "999px"));
    root.style.setProperty("--space-section", safeLength(theme.tokens.spacing, "4.5rem"));
    // Per-page titles are set by CmsPage / product / album views. Only seed the brand if empty.
    if (!document.title || document.title === "Oliyaruvi Digital Colour Lab") {
      document.title = site.settings.businessName;
    }
  }, [site.settings.businessName, theme]);

  return (
    <div className="flex min-h-screen flex-col pb-24 md:pb-0">
      <a className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-surface focus:px-3 focus:py-2" href="#content">
        Skip to content
      </a>
      <SiteHeader settings={site.settings} items={nav.header} />
      <SiteContext.Provider value={site.settings}>
        <main id="content" className="flex-1">
          <Outlet />
        </main>
      </SiteContext.Provider>
      <SiteFooter settings={site.settings} items={nav.footer} />
      <MobileActionBar settings={site.settings} />
    </div>
  );
}

function safeColor(value: string, fallback: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function safeFont(value: string, fallback: string) {
  return /^[A-Za-z0-9 ]{2,40}$/.test(value) ? value : fallback;
}

function safeLength(value: string, fallback: string) {
  return /^\d+(\.\d+)?(px|rem)$/.test(value) ? value : fallback;
}
