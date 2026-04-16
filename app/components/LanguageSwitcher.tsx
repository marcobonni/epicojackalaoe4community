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

export default function LanguageSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { locale } = useLanguage();
  const messages = useTranslations();

  function handleChange(nextLocale: Locale) {
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=${cookieMaxAge}; samesite=lax`;

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="fixed right-4 top-4 z-50 rounded-2xl border border-white/10 bg-slate-950/85 p-3 shadow-2xl backdrop-blur sm:right-6 sm:top-6">
      <label className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300">
        {messages.languageSwitcher.shortLabel}
      </label>
      <select
        aria-label={messages.languageSwitcher.label}
        className="mt-2 min-w-[9rem] rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-amber-300"
        value={locale}
        disabled={isPending}
        onChange={(event) => handleChange(event.target.value as Locale)}
      >
        {supportedLocales.map((option) => (
          <option key={option} value={option}>
            {localeLabels[option]}
          </option>
        ))}
      </select>
    </div>
  );
}
