"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { SERVER_CONFIG } from "@/app/config/site";
import LoadingLink from "@/app/components/LoadingLink";
import { useTranslations } from "@/app/components/LanguageProvider";

function NewBadge() {
  const messages = useTranslations();

  return (
    <span className="ml-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-900">
      {messages.common.new}
    </span>
  );
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const messages = useTranslations();
  const hero = messages.home.hero;

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
    <section ref={sectionRef} className="relative overflow-hidden bg-[#020617]">
      <div ref={backgroundRef} className="absolute inset-0 will-change-transform">
        <Image
          src="/images/hero_top.png"
          alt="Age of Empires background"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      <div className="absolute inset-0 bg-slate-950/45" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_48%,rgba(2,6,23,0.65))]" />
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-b from-transparent via-[#020617] to-[#020617]" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-sm text-amber-300">
              {hero.badge}
            </div>

            <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
              {hero.title}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              {hero.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <LoadingLink
                target="_blank"
                rel="noopener noreferrer"
                href={SERVER_CONFIG.inviteUrl}
                className="rounded-2xl bg-amber-400 px-6 py-3 text-center text-base font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5"
              >
                {hero.ctaJoin}
              </LoadingLink>

              <LoadingLink
                href="/leaderboard"
                className="rounded-2xl bg-blue-600 px-6 py-3 text-center text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                {hero.ctaItalianLeaderboard}
              </LoadingLink>

              <LoadingLink
                href="/leaderboard/nord"
                className="rounded-2xl bg-green-600 px-6 py-3 text-center text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                {hero.ctaNorthLeaderboard}
              </LoadingLink>

              <LoadingLink
                href="/leaderboard/centro"
                className="rounded-2xl bg-white px-6 py-3 text-center text-base font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5"
              >
                {hero.ctaCenterLeaderboard}
              </LoadingLink>

              <LoadingLink
                href="/leaderboard/sud"
                className="rounded-2xl bg-red-600 px-6 py-3 text-center text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                {hero.ctaSouthLeaderboard}
              </LoadingLink>

              <LoadingLink
                href="/beasty"
                className="flex items-center justify-center rounded-2xl bg-red-600 px-6 py-3 text-center text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                {hero.ctaQuiz} <NewBadge />
              </LoadingLink>

              <LoadingLink
                href="/matchmaking"
                className="flex items-center justify-center rounded-2xl bg-slate-800 px-6 py-3 text-center text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                {hero.ctaMatchmaking} <NewBadge />
              </LoadingLink>

              <LoadingLink
                href="/tournaments"
                className="rounded-2xl bg-amber-500 px-6 py-3 text-center text-base font-semibold text-slate-950 shadow-lg transition hover:-translate-y-0.5"
              >
                {hero.ctaTournaments}
              </LoadingLink>

              <LoadingLink
                href="/login"
                className="rounded-2xl border border-slate-600 bg-slate-950/70 px-6 py-3 text-center text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                {hero.ctaPortal}
              </LoadingLink>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
              {hero.statsHeading}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {hero.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-center"
                >
                  <div className="text-2xl font-bold text-amber-300">{stat.value}</div>
                  <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
