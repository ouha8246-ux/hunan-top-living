"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { copy } from "@/lib/copy";
import type { Locale } from "@/types/catalog";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (typeof copy)[Locale];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("htl-locale");
    if (saved === "en" || saved === "zh") {
      const timer = window.setTimeout(() => setLocale(saved), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    window.localStorage.setItem("htl-locale", locale);
  }, [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale: () => setLocale((value) => (value === "en" ? "zh" : "en")), t: copy[locale] }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
