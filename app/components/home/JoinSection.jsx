"use client";

import { SERVER_CONFIG } from "@/app/config/site";
import { useTranslations } from "@/app/components/LanguageProvider";

export default function JoinSection() {
  const messages = useTranslations();
  const section = messages.home.join;

  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 lg:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
            {section.listBadge}
          </p>

          <ul className="mt-6 space-y-4 text-slate-300">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div
          id="join"
          className="rounded-[2rem] border border-amber-400/30 bg-amber-400/10 p-8"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-200">
            {section.cardBadge}
          </p>

          <h3 className="mt-4 text-2xl font-bold text-white">{section.title}</h3>
          <p className="mt-4 text-sm leading-7 text-amber-50/90">{section.description}</p>

          <a
            target="_blank"
            rel="noopener noreferrer"
            href={SERVER_CONFIG.inviteUrl}
            className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5"
          >
            {section.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
