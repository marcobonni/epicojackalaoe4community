import { SERVER_CONFIG, HERO_STATS } from "@/app/config/site";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-amber-500/20">
      <div className="absolute inset-0">
        <img
          src="/images/aoe_hero.png"
          alt="Castello medievale al tramonto"
          className="h-full w-full object-cover opacity-100"
        />

        <div className="absolute inset-0 bg-slate-950/80" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_30%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-sm text-amber-300 backdrop-blur">
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
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={SERVER_CONFIG.inviteUrl}
                className="rounded-2xl bg-amber-400 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5"
              >
                Entra nel server
              </Link>

              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="/leaderboard"
                className="rounded-2xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                Classifica italiana 🇮🇹
              </Link>

              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="https://aoeitalia.com/ruota"
                className="rounded-2xl bg-red-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                Ruota delle civ
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-700/80 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-md">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
              EpicoJackal&apos;s Aoe4 Community
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {HERO_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-700/80 bg-slate-950/70 p-4 text-center backdrop-blur"
                >
                  <div className="text-2xl font-bold text-amber-300">
                    {stat.value}
                  </div>

                  <div className="mt-1 text-sm text-slate-300">
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