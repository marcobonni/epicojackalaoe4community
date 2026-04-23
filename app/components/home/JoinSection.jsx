"use client";

import { SERVER_CONFIG } from "@/app/config/site";
import { useTranslations } from "@/app/components/LanguageProvider";

export default function JoinSection() {
  const messages = useTranslations();
  const section = messages.home.join;

  return (
    <section className="mx-auto max-w-[1500px] px-8 pb-20 lg:px-14 xl:px-16">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="cinematic-panel p-8 sm:p-10">
          <p className="cinematic-kicker">{section.listBadge}</p>
          <ul className="mt-8 grid gap-4 text-[#e8dcc8]/88 sm:grid-cols-2">
            {section.items.map((item, index) => (
              <li
                key={item}
                className="cinematic-card-grid flex gap-4 rounded-[1.6rem] p-5"
              >
                <span className="text-sm font-semibold text-amber-200">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <span className="text-sm leading-7">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div id="join" className="cinematic-panel-strong flex flex-col justify-between p-8 sm:p-10">
          <div>
            <p className="cinematic-kicker">{section.cardBadge}</p>
            <h3 className="cinematic-title mt-5 text-3xl">{section.title}</h3>
            <p className="mt-5 max-w-md text-sm leading-8 text-amber-50/84">
              {section.description}
            </p>
          </div>

          <a
            target="_blank"
            rel="noopener noreferrer"
            href={SERVER_CONFIG.inviteUrl}
            className="cinematic-button-primary mt-8 self-start"
          >
            {section.cta}
          </a>
        </div>
      </div>
    </section>
  );
}

