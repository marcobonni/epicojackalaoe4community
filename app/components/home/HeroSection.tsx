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
    {
      href: "/patch-notes",
      label: "Patch Notes",
      accent:
        "border-amber-300/18 bg-[linear-gradient(180deg,rgba(250,204,21,0.22),rgba(15,23,42,0.18))] text-amber-50 hover:border-amber-300/40",
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

      <div className="relative mx-auto max-w-[min(90vw,1380px)] px-[clamp(1rem,1.9vw,1.45rem)] py-[clamp(2.2rem,5vh,3.5rem)]">
        <div className="grid min-h-[calc(100svh-4.5rem)] items-end gap-[clamp(1.2rem,2vw,2.3rem)] xl:min-h-[calc(100svh-6rem)] xl:grid-cols-[minmax(0,0.98fr)_minmax(16rem,0.68fr)] xl:items-center">
          <div className="max-w-[min(100%,47rem)] pb-2 xl:-translate-y-[clamp(0.15rem,0.8vw,0.55rem)]">
            <div className="hero-intro inline-flex items-center rounded-full border border-amber-300/28 bg-amber-300/10 px-4 py-1.5 text-sm font-semibold text-amber-200 shadow-[0_0_0_1px_rgba(250,204,21,0.08)]">
              {hero.badge}
            </div>

            <p className="hero-intro hero-intro-delay-1 mt-[clamp(0.85rem,1.4vw,1.15rem)] text-[clamp(0.64rem,0.2vw+0.6rem,0.74rem)] font-semibold uppercase tracking-[0.38em] text-amber-200/85">
              {hero.statsHeading}
            </p>

            <h1 className="hero-intro hero-intro-delay-2 mt-[clamp(0.65rem,1.2vw,0.95rem)] max-w-[min(100%,10.5ch)] text-[clamp(2.5rem,2.5vw+1.2rem,3.95rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-white">
              {hero.title}
            </h1>

            <p className="hero-intro hero-intro-delay-3 mt-[clamp(0.75rem,1.15vw,1rem)] max-w-[min(100%,34rem)] text-[clamp(0.88rem,0.16vw+0.82rem,0.96rem)] leading-[1.62] text-slate-200/88">
              {hero.description}
            </p>

            <div className="hero-intro hero-intro-delay-4 mt-[clamp(1rem,1.5vw,1.3rem)] flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <LoadingLink
                target="_blank"
                rel="noopener noreferrer"
                href={SERVER_CONFIG.inviteUrl}
                className="group inline-flex min-h-[clamp(2.8rem,2.2vw,3.05rem)] items-center justify-center rounded-full 
bg-[linear-gradient(180deg,#facc15,#eab308)] 
px-[clamp(0.95rem,1vw,1.2rem)] py-[clamp(0.7rem,0.7vw,0.82rem)] text-center text-[clamp(0.82rem,0.12vw+0.79rem,0.9rem)] font-semibold text-black 
shadow-[0_18px_50px_rgba(234,179,8,0.35)] 
transition duration-300 hover:-translate-y-0.5 
hover:bg-[linear-gradient(180deg,#fde047,#facc15)] 
hover:shadow-[0_24px_60px_rgba(234,179,8,0.5)]"
              >
                <span>{hero.ctaJoin}</span>
                <span className="ml-2.5 text-base transition duration-300 group-hover:translate-x-1">
                  →
                </span>
              </LoadingLink>

              <LoadingLink
                href="/tournaments"
                className="inline-flex min-h-[clamp(2.8rem,2.2vw,3.05rem)] items-center justify-center rounded-full border border-white/18 bg-white/[0.1] px-[clamp(0.95rem,1vw,1.2rem)] py-[clamp(0.7rem,0.7vw,0.82rem)] text-center text-[clamp(0.82rem,0.12vw+0.79rem,0.9rem)] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/36 hover:bg-white/[0.16]"
              >
                {hero.ctaTournaments}
              </LoadingLink>

              <LoadingLink
                href="/login"
                className="inline-flex min-h-[clamp(2.8rem,2.2vw,3.05rem)] items-center justify-center rounded-full border border-rose-300/18 bg-[linear-gradient(180deg,rgba(225,29,72,0.2),rgba(15,23,42,0.18))] px-[clamp(0.95rem,1vw,1.2rem)] py-[clamp(0.7rem,0.7vw,0.82rem)] text-center text-[clamp(0.82rem,0.12vw+0.79rem,0.9rem)] font-semibold text-rose-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-rose-300/36 hover:bg-[linear-gradient(180deg,rgba(225,29,72,0.28),rgba(15,23,42,0.22))]"
              >
                {hero.ctaPortal}
              </LoadingLink>
            </div>

            <div className="hero-intro hero-intro-delay-5 mt-[clamp(1rem,1.4vw,1.3rem)] grid gap-3 sm:grid-cols-2 xl:max-w-[min(100%,35rem)] xl:grid-cols-3">
              {quickLinks.map((item) => (
                <LoadingLink
                  key={item.label}
                  href={item.href}
                  className={`group flex min-h-[clamp(2.8rem,2vw,3.05rem)] items-center justify-between rounded-[1.05rem] border px-[clamp(0.78rem,0.75vw,0.92rem)] py-[clamp(0.62rem,0.65vw,0.76rem)] text-[clamp(0.7rem,0.1vw+0.67rem,0.78rem)] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 ${item.accent}`}
                >
                  <span className="max-w-[8rem] leading-[0.95rem]">{item.label}</span>
                  <span className="ml-3 flex items-center gap-2">
                    {item.badge ? <NewBadge /> : null}
                    <span className="text-[0.82rem] text-white/70 transition duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </LoadingLink>
              ))}
            </div>
          </div>

          <div className="hero-intro hero-intro-delay-4 hero-rail-float xl:justify-self-end">
            <div className="relative w-full max-w-[min(100%,21rem)] overflow-hidden rounded-[clamp(1.45rem,1.1vw,1.8rem)] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,28,0.82),rgba(7,11,22,0.52))] p-[clamp(0.85rem,0.9vw,1.05rem)] shadow-[0_32px_80px_rgba(0,0,0,0.34)] backdrop-blur-md">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.22),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_30%,rgba(15,23,42,0.22))]" />
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/55 to-transparent" />

              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-amber-200/90">
                  {hero.statsHeading}
                </p>

                <div className="mt-[clamp(0.9rem,1.2vw,1.15rem)] space-y-[clamp(0.7rem,0.8vw,0.9rem)]">
                  {hero.stats.map((stat, index) => (
                    <div
                      key={stat.label}
                      className={`rounded-[clamp(1.15rem,1vw,1.45rem)] border px-[clamp(0.9rem,0.9vw,1rem)] py-[clamp(0.9rem,1vw,1rem)] ${
                        index === 0
                          ? "border-amber-300/22 bg-amber-300/[0.08]"
                          : "border-white/8 bg-slate-950/26"
                      }`}
                    >
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <div className="text-[clamp(1.85rem,1vw+1.55rem,2.45rem)] font-semibold tracking-[-0.04em] text-white">
                            {stat.value}
                          </div>
                          <div className="mt-1.5 text-[clamp(0.76rem,0.12vw+0.74rem,0.86rem)] text-slate-300/78">
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
