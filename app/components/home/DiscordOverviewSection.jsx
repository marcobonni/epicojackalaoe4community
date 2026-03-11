export default function DiscordOverviewSection({
  inviteUrl,
  onlineMembers,
  liveStats,
  visibleMembers,
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Box stanza vocale */}
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 shadow-lg shadow-black/20">

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
                Live del Discord
              </p>

              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
                I dati qui sotto sono dei giocatori della nostra community!
              </p>
            </div>

            <a
              target="_blank"
              rel="noopener noreferrer"
              href={inviteUrl}
              className="hidden rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 md:inline-flex"
            >
              Apri Discord
            </a>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-sm font-semibold text-white">
              Giocatori nella stanza selezionata
            </p>

           
          </div>
        </div>

        {/* Box statistiche */}
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 shadow-lg shadow-black/20">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
            Stato del server
          </p>

          <h2 className="mt-3 text-3xl font-bold text-white">
            Numeri che danno fiducia
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            I dati qui sotto arrivano dal widget pubblico del server.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {liveStats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5"
              >
                <div className="text-3xl font-bold text-amber-300">
                  {item.value}
                </div>

                <div className="mt-2 text-sm text-slate-400">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-emerald-300">
                  Presenza live
                </p>

                <p className="mt-1 text-sm text-slate-300">
                  {onlineMembers ?? "—"} membri online in questo momento.
                </p>
              </div>

              <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
                Live
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}