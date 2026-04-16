import "server-only";

import { cookies, headers } from "next/headers";
import {
  detectLocaleFromAcceptLanguage,
  getDictionary,
  localeCookieName,
  normalizeLocale,
} from "@/app/lib/i18n-config";

export {
  defaultLocale,
  detectLocaleFromAcceptLanguage,
  getDictionary,
  localeCookieName,
  localeLabels,
  normalizeLocale,
  supportedLocales,
} from "@/app/lib/i18n-config";

export async function getRequestLocale() {
  const cookieStore = await cookies();
  const cookieLocale = normalizeLocale(cookieStore.get(localeCookieName)?.value);

  if (cookieLocale) {
    return cookieLocale;
  }

  const headerStore = await headers();
  return detectLocaleFromAcceptLanguage(headerStore.get("accept-language"));
}

export async function getTranslations() {
  const locale = await getRequestLocale();
  return {
    locale,
    messages: getDictionary(locale),
  };
}
