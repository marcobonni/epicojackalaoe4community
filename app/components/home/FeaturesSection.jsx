"use client";

import { useTranslations } from "@/app/components/LanguageProvider";

export default function FeaturesSection() {
  const messages = useTranslations();
  const section = messages.home.features;

  return (
    <section id="features" className="mx-auto max-w-[1500px] px-8 py-20 lg:px-14 xl:px-16">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="cinematic-kicker">{section.badge}</p>
          <h2 className="cinematic-title mt-5 max-w-xl text-3xl sm:text-4xl">
            {section.title}
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {section.items.map((feature, index) => (
            <article
              key={feature.title}
              className={`${index === 0 ? "cinematic-panel-strong" : "cinematic-panel-soft"} p-7`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="cinematic-kicker text-[11px]">
                  {(index + 1).toString().padStart(2, "0")}
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-amber-200/30 to-transparent" />
              </div>

              <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-white">
                {feature.title}
              </h3>

              <p className="cinematic-body mt-4 text-sm">{feature.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
