"use client";

import { createContext, useContext, useEffect } from "react";
import type { Dictionary, Locale } from "@/app/lib/i18n-schema";

type LanguageContextValue = {
  locale: Locale;
  messages: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  locale,
  messages,
  children,
}: LanguageContextValue & { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, messages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}

export function useTranslations() {
  return useLanguage().messages;
}
