"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/app/components/LanguageProvider";

type Coach = {
  name: string;
  badge: string;
  role: string;
  description: string;
  specialty: string;
  price: string | null;
  availability: string;
  contactUrl: string;
  profileUrl: string | null;
};

export default function CoachingSection({
  coaches = [],
}: {
  coaches?: Coach[];
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const messages = useTranslations();
  const section = messages.home.coaching;

  const updateScrollState = () => {
    const container = scrollRef.current;
    if (!container) return;

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const tolerance = 4;

    setCanScrollLeft(container.scrollLeft > tolerance);
    setCanScrollRight(container.scrollLeft < maxScrollLeft - tolerance);
  };

  useEffect(() => {
    updateScrollState();

    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => updateScrollState();
    const handleResize = () => updateScrollState();

    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [coaches]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    const firstCard = container.querySelector<HTMLElement>("[data-coach-card]");
    const cardWidth = firstCard?.offsetWidth ?? 360;

    container.scrollBy({
      left: direction === "left" ? -(cardWidth + 24) : cardWidth + 24,
      behavior: "smooth",
    });
  };

  return (
    <section className="mx-auto max-w-[1500px] px-8 py-20 lg:px-14 xl:px-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="cinematic-kicker">{section.badge}</p>
          <h2 className="cinematic-title mt-5 text-3xl sm:text-4xl">{section.title}</h2>
          <p className="cinematic-body mt-4 text-sm sm:text-base">{section.description}</p>
        </div>

        {coaches.length > 0 ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label={section.scrollLeft}
              disabled={!canScrollLeft}
              className="cinematic-pill disabled:cursor-not-allowed disabled:opacity-45"
            >
              <span aria-hidden="true">&larr;</span>
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label={section.scrollRight}
              disabled={!canScrollRight}
              className="cinematic-pill disabled:cursor-not-allowed disabled:opacity-45"
            >
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        ) : null}
      </div>

      <div className="relative mt-10">
        {coaches.length > 0 ? (
          <>
            {canScrollLeft ? (
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#07101f] to-transparent" />
            ) : null}

            {canScrollRight ? (
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#07101f] to-transparent" />
            ) : null}

            <div
              ref={scrollRef}
              className="overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex gap-5">
                {coaches.map((coach, index) => (
                  <div
                    key={coach.name}
                    data-coach-card
                    className={`${index === 0 ? "cinematic-panel-strong" : "cinematic-panel"} w-[320px] flex-none p-7 sm:w-[360px] xl:w-[390px]`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="cinematic-kicker text-[11px]">{section.available}</p>
                        <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
                          {coach.name}
                        </h3>
                      </div>

                      {coach.badge ? (
                        <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100">
                          {coach.badge}
                        </div>
                      ) : null}
                    </div>

                    {coach.role ? (
                      <p className="mt-4 text-sm font-semibold text-slate-100/88">{coach.role}</p>
                    ) : null}

                    {coach.description ? (
                      <p className="cinematic-body mt-4 text-sm">{coach.description}</p>
                    ) : null}

                    <div className="mt-6 space-y-3 text-sm text-slate-200/84">
                      {coach.specialty ? (
                        <div className="cinematic-card-grid rounded-[1.4rem] p-4">
                          <span className="font-semibold text-white">{section.focus}:</span>{" "}
                          {coach.specialty}
                        </div>
                      ) : null}

                      <div className="grid gap-3 sm:grid-cols-2">
                        {coach.price ? (
                          <div className="cinematic-card-grid rounded-[1.4rem] p-4">
                            <span className="font-semibold text-white">{section.price}:</span>{" "}
                            {coach.price}
                          </div>
                        ) : null}

                        {coach.availability ? (
                          <div className="cinematic-card-grid rounded-[1.4rem] p-4">
                            <span className="font-semibold text-white">
                              {section.availability}:
                            </span>{" "}
                            {coach.availability}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-7 flex flex-wrap gap-3">
                      {coach.contactUrl ? (
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={coach.contactUrl}
                          className="cinematic-button-primary"
                        >
                          {section.contact}
                        </a>
                      ) : null}

                      {coach.profileUrl ? (
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={coach.profileUrl}
                          className="cinematic-button-ghost"
                        >
                          {section.profile}
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="cinematic-empty-state p-8 text-sm text-slate-300/74">
            {section.empty}
          </div>
        )}
      </div>
    </section>
  );
}
