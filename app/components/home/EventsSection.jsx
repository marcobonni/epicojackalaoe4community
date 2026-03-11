import { UPCOMING_EVENTS, SERVER_CONFIG } from "@/app/config/site.js";

export default function EventsSection() {
  return (
    <section id="events" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div className="max-w-2xl">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
            Eventi AoE
          </p>

          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            Prossimi appuntamenti della community
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            Tornei, serate team game e sessioni di coaching organizzate
            direttamente dalla community.
          </p>

        </div>

        <a
          target="_blank"
          rel="noopener noreferrer"
          href={SERVER_CONFIG.inviteUrl}
          className="inline-flex rounded-2xl border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
        >
          Partecipa agli eventi
        </a>

      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">

        {UPCOMING_EVENTS.map((event) => (
          <div
            key={event.title}
            className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20"
          >

            <div className="flex items-start justify-between gap-4">

              <div>

                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                  {event.day}
                </div>

                <h3 className="mt-3 text-xl font-semibold text-white">
                  {event.title}
                </h3>

              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-1 text-sm text-slate-300">
                {event.type}
              </div>

            </div>

            <p className="mt-4 text-sm text-slate-400">
              Ore {event.time}
            </p>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              {event.desc}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}