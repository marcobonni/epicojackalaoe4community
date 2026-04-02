"use client";

import { useEffect, useRef, useState } from "react";

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
    const gap = 24;
    const amount = cardWidth + gap;

    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
          Coaching
        </p>

        <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
          Allenati con player della community
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          In questa sezione puoi mostrare i membri disponibili a fare coaching
          a pagamento, con specializzazione, prezzo e link diretto per essere
          contattati.
        </p>
      </div>

      <div className="relative mt-12 px-10">
        {coaches.length > 0 ? (
          <>
            {canScrollLeft ? (
              <div className="pointer-events-none absolute inset-y-0 left-10 z-10 w-16 bg-gradient-to-r from-[#020617] to-transparent" />
            ) : null}

            {canScrollRight ? (
              <div className="pointer-events-none absolute inset-y-0 right-10 z-10 w-16 bg-gradient-to-l from-[#020617] to-transparent" />
            ) : null}

            {canScrollLeft ? (
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Scorri a sinistra"
                className="absolute left-0 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-700 bg-slate-900 p-3 text-white shadow-lg shadow-black/30 transition hover:bg-slate-800"
              >
                ←
              </button>
            ) : null}

            {canScrollRight ? (
              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Scorri a destra"
                className="absolute right-0 top-1/2 z-20 translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-700 bg-slate-900 p-3 text-white shadow-lg shadow-black/30 transition hover:bg-slate-800"
              >
                →
              </button>
            ) : null}

            <div
              ref={scrollRef}
              className="overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex gap-6 px-2">
                {coaches.map((coach) => (
                  <div
                    key={coach.name}
                    data-coach-card
                    className="w-[320px] flex-none rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20 sm:w-[360px] xl:w-[380px]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                          Coach disponibile
                        </p>

                        <h3 className="mt-2 text-2xl font-semibold text-white">
                          {coach.name}
                        </h3>
                      </div>

                      {coach.badge ? (
                        <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                          {coach.badge}
                        </div>
                      ) : null}
                    </div>

                    {coach.role ? (
                      <p className="mt-3 text-sm text-slate-300">{coach.role}</p>
                    ) : null}

                    {coach.description ? (
                      <p className="mt-4 text-sm leading-7 text-slate-400">
                        {coach.description}
                      </p>
                    ) : null}

                    <div className="mt-6 space-y-3 text-sm text-slate-300">
                      {coach.specialty ? (
                        <div>
                          <span className="font-semibold text-white">Focus:</span>{" "}
                          {coach.specialty}
                        </div>
                      ) : null}

                      {coach.price ? (
                        <div>
                          <span className="font-semibold text-white">Prezzo:</span>{" "}
                          {coach.price}
                        </div>
                      ) : null}

                      {coach.availability ? (
                        <div>
                          <span className="font-semibold text-white">
                            Disponibilità:
                          </span>{" "}
                          {coach.availability}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      {coach.contactUrl ? (
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={coach.contactUrl}
                          className="rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
                        >
                          Contatta
                        </a>
                      ) : null}

                      {coach.profileUrl ? (
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={coach.profileUrl}
                          className="rounded-2xl border border-slate-700 bg-slate-950/70 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
                        >
                          Profilo
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-sm text-slate-400">
            Nessun coach configurato al momento.
          </div>
        )}
      </div>
    </section>
  );
}