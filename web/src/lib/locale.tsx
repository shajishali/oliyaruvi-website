import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "en" | "ta";

type LocaleValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleValue | null>(null);
const storageKey = "oliyaruvi.locale";

function readLocale(): Locale {
  try {
    return localStorage.getItem(storageKey) === "ta" ? "ta" : "en";
  } catch {
    return "en";
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(readLocale);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, locale);
    } catch {
      // The switch still works for this visit if storage is blocked.
    }
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("Locale is missing");
  return value;
}

export function textFor(locale: Locale, en: string, ta: string) {
  if (locale === "ta" && ta.trim()) return ta;
  return en;
}
