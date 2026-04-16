import { enMessages } from "@/app/lib/i18n-messages-en";
import { itMessages } from "@/app/lib/i18n-messages-it";
import type { Dictionary, Locale } from "@/app/lib/i18n-schema";

export const localeCookieName = "aoe4-locale";
export const supportedLocales: Locale[] = ["it", "en", "fr", "de", "pl"];
export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  it: "Italiano",
  en: "English",
  fr: "Francais",
  de: "Deutsch",
  pl: "Polski",
};

const dictionaries: Record<Locale, Dictionary> = {
  it: itMessages,
  en: enMessages,
  fr: { ...enMessages, languageSwitcher: { label: "Langue du site", shortLabel: "Langue" } },
  de: { ...enMessages, languageSwitcher: { label: "Sprache der Website", shortLabel: "Sprache" } },
  pl: { ...enMessages, languageSwitcher: { label: "Jezyk strony", shortLabel: "Jezyk" } },
};

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;

  const normalized = value.toLowerCase().trim().replace("_", "-");

  if (isSupportedLocale(normalized)) {
    return normalized;
  }

  return supportedLocales.find(
    (locale) => normalized === locale || normalized.startsWith(`${locale}-`)
  ) ?? null;
}

export function detectLocaleFromAcceptLanguage(
  acceptLanguageHeader: string | null | undefined
): Locale {
  if (!acceptLanguageHeader) return defaultLocale;

  const tags = acceptLanguageHeader
    .split(",")
    .map((entry) => entry.split(";")[0]?.trim())
    .filter(Boolean);

  for (const tag of tags) {
    const locale = normalizeLocale(tag);
    if (locale) return locale;
  }

  return defaultLocale;
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
