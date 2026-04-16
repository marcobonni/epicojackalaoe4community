import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/app/lib/supabase/proxy";
import {
  detectLocaleFromAcceptLanguage,
  localeCookieName,
} from "@/app/lib/i18n-config";

export async function proxy(request: NextRequest) {
  const response = await updateSupabaseSession(request);

  if (!request.cookies.get(localeCookieName)?.value) {
    response.cookies.set(localeCookieName, detectLocaleFromAcceptLanguage(request.headers.get("accept-language")), {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
