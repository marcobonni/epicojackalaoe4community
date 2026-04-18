"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { SERVER_CONFIG } from "@/app/config/site";
import LoadingLink from "@/app/components/LoadingLink";
import { useTranslations } from "@/app/components/LanguageProvider";

function NewBadge() {
  const messages = useTranslations();

  return (
    <span className="rounded-full border border-amber-300/30 bg-amber-300/14 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100">
      {messages.common.new}
    </span>
  );
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const messages = useTranslations();
  const hero = messages.home.hero;

  const quickLinks = [
    {
      href: "/leaderboard",
      label: hero.ctaItalianLeaderboard,
      accent:
        "border-emerald-300/18 bg-[linear-gradient(180deg,rgba(22,163,74,0.26),rgba(15,23,42,0.2))] text-emerald-50 hover:border-emerald-300/40",
      badge: false,
    },
    {
      href: "/beasty",
      label: hero.ctaQuiz,
      accent:
        "border-slate-200/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(15,23,42,0.2))] text-slate-50 hover:border-white/40",
      badge: true,
    },
    {
      href: "/matchmaking",
      label: hero.ctaMatchmaking,
      accent:
        "border-rose-300/18 bg-[linear-gradient(180deg,rgba(225,29,72,0.26),rgba(15,23,42,0.2))] text-rose-50 hover:border-rose-300/40",
      badge: true,
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      const background = backgroundRef.current;

      if (!section || !background) return;

      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.bottom < 0 || rect.top > windowHeight) return;

      const offset = rect.top * -0.42;
      background.style.transform = `translateY(${offset}px) scale(1.1)`;
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
      className="relative isolate overflow-hidden bg-[#050816]"
    >
      <div ref={backgroundRef} className="absolute inset-0 will-change-transform">
        <Image
          src="/images/hero_top.png"
          alt="Age of Empires background"
          fill
          priority
          className="object-cover object-[72%_center] sm:object-[68%_center]"
        />
      </div>

      <div className="hero-atmosphere-drift absolute left-[38%] top-[18%] h-72 w-72 rounded-full bg-amber-200/16 blur-3xl" />
      <div className="hero-atmosphere-drift hero-atmosphere-drift-delay absolute bottom-[20%] right-[18%] h-64 w-64 rounded-full bg-orange-400/12 blur-3xl" />

      <div className="absolute inset-0 bg-[linear-gradient(92deg,rgba(4,7,18,0.96)_0%,rgba(6,10,22,0.68)_42%,rgba(8,11,22,0.35)_62%,rgba(8,11,22,0.86)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_46%,rgba(255,233,179,0.3),transparent_20%),radial-gradient(circle_at_54%_55%,rgba(255,177,66,0.18),transparent_26%),linear-gradient(180deg,rgba(2,6,23,0.14),rgba(2,6,23,0.9)_88%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#040714]" />

      <div className="relative mx-auto max-w-[1720px] px-6 py-12 sm:px-8 sm:py-16 lg:px-14 lg:py-16 xl:px-18 xl:py-12 2xl:px-20 2xl:py-14">
        <div className="grid min-h-[calc(100svh-4rem)] items-end gap-14 lg:min-h-[calc(100svh-5.5rem)] lg:grid-cols-[minmax(0,1.12fr)_minmax(400px,0.74fr)] lg:items-center lg:gap-14 2xl:min-h-[calc(100svh-4.5rem)] 2xl:gap-18">
          <div className="max-w-[72rem] pb-2 lg:-translate-y-6 xl:-translate-y-10">
            <div className="hero-intro inline-flex items-center rounded-full border border-amber-300/28 bg-amber-300/10 px-4 py-1.5 text-sm font-semibold text-amber-200 shadow-[0_0_0_1px_rgba(250,204,21,0.08)]">
              {hero.badge}
            </div>

            <p className="hero-intro hero-intro-delay-1 mt-6 text-xs font-semibold uppercase tracking-[0.48em] text-amber-200/85 sm:text-sm">
              {hero.statsHeading}
            </p>

            <h1 className="hero-intro hero-intro-delay-2 mt-5 max-w-5xl text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl xl:text-[6.4rem] 2xl:text-[7rem]">
              {hero.title}
            </h1>

            <p className="hero-intro hero-intro-delay-3 mt-7 max-w-3xl text-base leading-8 text-slate-200/88 sm:text-lg xl:text-[1.22rem] xl:leading-9">
              {hero.description}
            </p>

            <div className="hero-intro hero-intro-delay-4 mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <LoadingLink
                target="_blank"
                rel="noopener noreferrer"
                href={SERVER_CONFIG.inviteUrl}
                className="group inline-flex min-h-[60px] items-center justify-center rounded-full 
bg-[linear-gradient(180deg,#facc15,#eab308)] 
px-7 py-4 text-center text-base font-semibold text-black 
shadow-[0_18px_50px_rgba(234,179,8,0.35)] 
transition duration-300 hover:-translate-y-0.5 
hover:bg-[linear-gradient(180deg,#fde047,#facc15)] 
hover:shadow-[0_24px_60px_rgba(234,179,8,0.5)]"
              >
                <span>{hero.ctaJoin}</span>
                <span className="ml-3 text-lg transition duration-300 group-hover:translate-x-1">
                  →
                </span>
              </LoadingLink>

              <LoadingLink
                href="/tournaments"
                className="inline-flex min-h-[60px] items-center justify-center rounded-full border border-white/18 bg-white/[0.1] px-7 py-4 text-center text-base font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/36 hover:bg-white/[0.16]"
              >
                {hero.ctaTournaments}
              </LoadingLink>

              <LoadingLink
                href="/login"
                className="inline-flex min-h-[60px] items-center justify-center rounded-full border border-rose-300/18 bg-[linear-gradient(180deg,rgba(225,29,72,0.2),rgba(15,23,42,0.18))] px-7 py-4 text-center text-base font-semibold text-rose-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-rose-300/36 hover:bg-[linear-gradient(180deg,rgba(225,29,72,0.28),rgba(15,23,42,0.22))]"
              >
                {hero.ctaPortal}
              </LoadingLink>
            </div>

            <div className="hero-intro hero-intro-delay-5 mt-10 grid gap-3 sm:grid-cols-2 lg:max-w-[54rem] xl:max-w-[62rem] xl:grid-cols-3">
              {quickLinks.map((item) => (
                <LoadingLink
                  key={item.label}
                  href={item.href}
                  className={`group flex min-h-[64px] items-center justify-between rounded-[1.4rem] border px-4 py-3 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 ${item.accent}`}
                >
                  <span className="max-w-[12rem] leading-5">{item.label}</span>
                  <span className="ml-3 flex items-center gap-2">
                    {item.badge ? <NewBadge /> : null}
                    <span className="text-base text-white/70 transition duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </LoadingLink>
              ))}
            </div>
          </div>

          <div className="hero-intro hero-intro-delay-4 hero-rail-float lg:justify-self-end lg:-translate-y-4 xl:-translate-y-6">
            <div className="relative overflow-hidden rounded-[2.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,28,0.82),rgba(7,11,22,0.52))] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.34)] backdrop-blur-md sm:p-7 lg:min-w-[390px] lg:max-w-[470px] 2xl:min-w-[430px] 2xl:max-w-[510px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.22),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_30%,rgba(15,23,42,0.22))]" />
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/55 to-transparent" />

              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-amber-200/90">
                  {hero.statsHeading}
                </p>

                <div className="mt-6 space-y-4">
                  {hero.stats.map((stat, index) => (
                    <div
                      key={stat.label}
                      className={`rounded-[1.8rem] border px-5 py-5 ${
                        index === 0
                          ? "border-amber-300/22 bg-amber-300/[0.08]"
                          : "border-white/8 bg-slate-950/26"
                      }`}
                    >
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <div className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-[2.8rem]">
                            {stat.value}
                          </div>
                          <div className="mt-2 text-sm text-slate-300/78">
                            {stat.label}
                          </div>
                        </div>

                        <div className="hidden h-10 w-10 rounded-full border border-white/10 bg-white/[0.03] sm:block" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <div className="rounded-full border border-amber-300/22 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-amber-100">
                    {hero.ctaQuiz}
                  </div>
                  <div className="rounded-full border border-indigo-300/16 bg-indigo-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-100">
                    {hero.ctaMatchmaking}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
