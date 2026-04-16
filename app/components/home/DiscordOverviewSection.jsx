"use client";

import { useTranslations } from "@/app/components/LanguageProvider";

export default function DiscordOverviewSection({
  inviteUrl,
  onlineMembers,
  liveStats,
}) {
  const messages = useTranslations();
  const section = messages.home.discord;

  return (
    <section className="mx-auto max-w-[1500px] px-6 py-20 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="cinematic-panel-strong p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xl">
              <p className="cinematic-kicker">{section.liveBadge}</p>
              <h2 className="cinematic-title mt-5 text-3xl sm:text-4xl">
                {section.serverTitle}
              </h2>
              <p className="cinematic-body mt-4 text-sm sm:text-base">
                {section.liveDescription}
              </p>
            </div>

            <a
              target="_blank"
              rel="noopener noreferrer"
              href={inviteUrl}
              className="cinematic-button-primary shrink-0"
            >
              {section.open}
            </a>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {liveStats.map((item) => (
              <div key={item.label} className="cinematic-stat-card p-5">
                <div className="text-4xl font-semibold tracking-[-0.04em] text-white">
                  {item.value}
                </div>
                <div className="mt-3 text-sm leading-6 text-slate-300/76">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cinematic-panel p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="cinematic-kicker">{section.serverBadge}</p>
              <p className="cinematic-body mt-4 max-w-xl text-sm">
                {section.serverDescription}
              </p>
            </div>

            <div className="rounded-full border border-emerald-300/24 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-100">
              {messages.common.live}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
            <div className="cinematic-card-grid p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/88">
                {section.presenceTitle}
              </p>
              <p className="mt-5 text-5xl font-semibold tracking-[-0.05em] text-white">
                {onlineMembers ?? messages.common.noData}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300/76">
                {section.presenceText}
              </p>
            </div>

            <div className="cinematic-card-grid flex items-end p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/88">
                  {section.selectedRoom}
                </p>
                <div className="mt-5 h-px w-16 bg-gradient-to-r from-amber-200/60 to-transparent" />
                <p className="mt-5 text-sm leading-7 text-slate-300/76">
                  {section.serverDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
