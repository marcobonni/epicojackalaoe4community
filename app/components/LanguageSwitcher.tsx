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
  it: "bg-[linear-gradient(90deg,#009246_0%,#009246_33.33%,#ffffff_33.33%,#ffffff_66.66%,#ce2b37_66.66%,#ce2b37_100%)]",
  en: "bg-[linear-gradient(180deg,#012169_0%,#012169_100%)] before:absolute before:inset-0 before:bg-[linear-gradient(90deg,transparent_42%,#ffffff_42%,#ffffff_58%,transparent_58%),linear-gradient(180deg,transparent_38%,#ffffff_38%,#ffffff_62%,transparent_62%)] after:absolute after:inset-0 after:bg-[linear-gradient(90deg,transparent_46%,#c8102e_46%,#c8102e_54%,transparent_54%),linear-gradient(180deg,transparent_44%,#c8102e_44%,#c8102e_56%,transparent_56%)]",
  fr: "bg-[linear-gradient(90deg,#0055a4_0%,#0055a4_33.33%,#ffffff_33.33%,#ffffff_66.66%,#ef4135_66.66%,#ef4135_100%)]",
  de: "bg-[linear-gradient(180deg,#000000_0%,#000000_33.33%,#dd0000_33.33%,#dd0000_66.66%,#ffce00_66.66%,#ffce00_100%)]",
  pl: "bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_50%,#dc143c_50%,#dc143c_100%)]",
  es: "bg-[linear-gradient(180deg,#aa151b_0%,#aa151b_25%,#f1bf00_25%,#f1bf00_75%,#aa151b_75%,#aa151b_100%)]",
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
              <span
                aria-hidden="true"
                className={`relative inline-block h-3.5 w-5 overflow-hidden rounded-[0.2rem] border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] ${localeFlags[option]}`}
              />
              <span>{localeLabels[option]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
