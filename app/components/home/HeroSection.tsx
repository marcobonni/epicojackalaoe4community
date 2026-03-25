"use client";

import { useEffect, useRef } from "react";
import { SERVER_CONFIG, HERO_STATS } from "@/app/config/site";
import LoadingLink from "@/app/components/LoadingLink";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      const background = backgroundRef.current;

      if (!section || !background) return;

      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.bottom < 0 || rect.top > windowHeight) return;

      const offset = rect.top * -0.5;
      background.style.transform = `translateY(${offset}px) scale(1.08)`;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#020617]"
    >
      {/* background image with parallax */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 will-change-transform"
      >
        <img
          src="/images/hero_top.png"
          alt="Age of Empires background"
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* dark overlay for readability */}
      <div className="absolute inset-0 bg-slate-950/45" />

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_48%,rgba(2,6,23,0.65))]" />

      {/* bottom fade into next section */}
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-b from-transparent via-[#020617] to-[#020617]" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-sm text-amber-300">
              Age of Empires Community Discord
            </div>

            <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
              La tua community Discord per vivere Age of Empires ogni giorno
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Un server pensato per appassionati di Age of Empires: partite,
              eventi, tornei, consigli strategici e una community con cui
              giocare davvero.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <LoadingLink
                target="_blank"
                rel="noopener noreferrer"
                href={SERVER_CONFIG.inviteUrl}
                className="rounded-2xl bg-amber-400 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5"
              >
                Entra nel server
              </LoadingLink>

              <LoadingLink
                href="/leaderboard"
                className="rounded-2xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                Classifica italiana 🇮🇹
              </LoadingLink>
<div className="flex gap-4">

  <LoadingLink
    href="/leaderboard/nord"
    className="rounded-2xl bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
  >
    Classifica Nord
  </LoadingLink>

  <LoadingLink
    href="/leaderboard/centro"
    className="rounded-2xl bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5"
  >
    Classifica Centro
  </LoadingLink>

  <LoadingLink
    href="/leaderboard/sud"
    className="rounded-2xl bg-red-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
  >
    Classifica Sud
  </LoadingLink>

</div>
  <LoadingLink
    href="/beasty"
    className="rounded-2xl bg-red-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
  >
    Quiz
  </LoadingLink>


            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
              EpicoJackal&apos;s AoE4 Community
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {HERO_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-center"
                >
                  <div className="text-2xl font-bold text-amber-300">
                    {stat.value}
                  </div>

                  <div className="mt-1 text-sm text-slate-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}