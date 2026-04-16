"use client";

import { useTranslations } from "@/app/components/LanguageProvider";

export default function FeaturesSection() {
  const messages = useTranslations();
  const section = messages.home.features;

  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
          {section.badge}
        </p>

        <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
          {section.title}
        </h2>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {section.items.map((feature) => (
          <div
            key={feature.title}
            className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20"
          >
            <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
