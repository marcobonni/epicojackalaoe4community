"use client";

import { SERVER_CONFIG } from "@/app/config/site.js";
import { useTranslations } from "@/app/components/LanguageProvider";

export default function EventsSection() {
  const messages = useTranslations();
  const section = messages.home.events;

  return (
    <section id="events" className="mx-auto max-w-[1500px] px-8 py-20 lg:px-14 xl:px-16">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="cinematic-kicker">{section.badge}</p>
          <h2 className="cinematic-title mt-5 text-3xl sm:text-4xl">
            {section.title}
          </h2>
          <p className="cinematic-body mt-4 text-sm sm:text-base">
            {section.description}
          </p>
        </div>

        <a
          target="_blank"
          rel="noopener noreferrer"
          href={SERVER_CONFIG.inviteUrl}
          className="cinematic-button-ghost"
        >
          {section.cta}
        </a>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {section.items.map((event, index) => (
          <article
            key={`${event.day}-${event.title}`}
            className={`${index === 1 ? "cinematic-panel-strong" : "cinematic-panel-soft"} p-7`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="cinematic-kicker text-[11px]">{event.day}</div>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-white">
                  {event.title}
                </h3>
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e8dcc8]">
                {event.type}
              </div>
            </div>

            <p className="mt-5 text-sm font-semibold text-amber-100/90">
              {section.timePrefix} {event.time}
            </p>

            <p className="cinematic-body mt-4 text-sm">{event.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

