"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  localeCookieName,
  localeLabels,
  supportedLocales,
} from "@/app/lib/i18n-config";
import { useLanguage, useTranslations } from "@/app/components/LanguageProvider";
import type { Locale } from "@/app/lib/i18n-schema";

const cookieMaxAge = 60 * 60 * 24 * 365;

const localeFlags: Record<Locale, string> = {
  it: "🇮🇹",
  en: "🇬🇧",
  fr: "🇫🇷",
  de: "🇩🇪",
  pl: "🇵🇱",
  es: "🇪🇸",
};

function persistLocale(nextLocale: Locale) {
  window.document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=${cookieMaxAge}; samesite=lax`;
}

export default function LanguageSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { locale } = useLanguage();
  const messages = useTranslations();

  function handleChange(nextLocale: Locale) {
    persistLocale(nextLocale);

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="w-full">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300">
        {messages.languageSwitcher.shortLabel}
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {supportedLocales.map((option) => {
          const isActive = option === locale;

          return (
            <button
              key={option}
              type="button"
              aria-label={`${messages.languageSwitcher.label}: ${localeLabels[option]}`}
              aria-pressed={isActive}
              disabled={isPending}
              onClick={() => handleChange(option)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                isActive
                  ? "border-amber-300 bg-amber-400/15 text-amber-100"
                  : "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500 hover:text-white"
              } ${isPending ? "cursor-not-allowed opacity-70" : ""}`}
            >
              <span aria-hidden="true" className="text-sm leading-none">
                {localeFlags[option]}
              </span>
              <span>{localeLabels[option]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
