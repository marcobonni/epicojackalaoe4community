"use client";

import { useTranslations } from "@/app/components/LanguageProvider";

export default function TwitchStatusBadge({ isLive }) {
  const messages = useTranslations();

  return (
    <div
      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${
        isLive
          ? "border-rose-400/30 bg-rose-400/10 text-rose-200"
          : "border-white/10 bg-white/[0.05] text-slate-300"
      }`}
    >
      {isLive ? messages.common.live : messages.common.offline}
    </div>
  );
}
