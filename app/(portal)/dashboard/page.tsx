import LoadingLink from "@/app/components/LoadingLink";
import StatusBadge from "@/app/components/portal/StatusBadge";
import { getRequiredSession, hasRole } from "@/app/lib/session";
import { getMyTournaments } from "@/app/lib/tournaments/store";
import { tournamentFormatLabels } from "@/app/lib/tournaments/types";

export const metadata = {
  title: "Dashboard tornei | AoE4 Community Italia",
};

export default async function DashboardPage() {
  const session = await getRequiredSession();
  const myTournaments = session.accessToken
    ? await getMyTournaments(session.accessToken)
    : [];

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[2rem] border border-amber-400/20 bg-slate-950/70 p-8 shadow-2xl shadow-black/30">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
            Area giocatore
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
            Ciao {session.user.name}, qui trovi il tuo percorso torneo.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            La dashboard ora legge i tuoi dati dal backend torneo reale e mostra
            per ogni evento la prossima partita, il relativo stato e il link
            diretto al bracket.
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-8 shadow-2xl shadow-black/30">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Azioni rapide
          </p>
          <div className="mt-6 space-y-3">
            <LoadingLink
              href="/tournaments"
              className="block rounded-2xl bg-amber-400 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Sfoglia tornei
            </LoadingLink>

            <LoadingLink
              href="/clanwars/risiko"
              className="block rounded-2xl border border-slate-700 px-4 py-3 text-center text-sm font-semibold text-slate-100 transition hover:border-amber-300 hover:text-amber-200"
            >
              Apri mappa Clan Wars
            </LoadingLink>

            {hasRole(session, "admin") ? (
              <LoadingLink
                href="/admin"
                className="block rounded-2xl border border-slate-700 px-4 py-3 text-center text-sm font-semibold text-slate-100 transition hover:border-amber-300 hover:text-amber-200"
              >
                Vai alla console admin
              </LoadingLink>
            ) : null}
          </div>
        </div>
      </section>

      {myTournaments.length > 0 ? (
        <section className="grid gap-6 lg:grid-cols-2">
          {myTournaments.map(({ tournament, nextMatch }) => {
            const nextOpponent =
              nextMatch?.player1_id === session.user.id
                ? nextMatch.player2?.display_name ?? "In attesa di avversario"
                : nextMatch?.player2_id === session.user.id
                  ? nextMatch.player1?.display_name ?? "In attesa di avversario"
                  : "In attesa di avversario";

            return (
              <article
                key={tournament.id}
                className="rounded-[2rem] border border-slate-800 bg-slate-950/75 p-7 shadow-2xl shadow-black/20"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-amber-300">
                      {tournamentFormatLabels[tournament.format]}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      {tournament.title}
                    </h2>
                  </div>

                  <StatusBadge kind="tournament" status={tournament.status} />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                    <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                      Prossimo avversario
                    </p>
                    <p className="mt-3 text-xl font-semibold text-white">
                      {nextMatch ? nextOpponent : "In attesa del prossimo round"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                    <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                      Stato match
                    </p>
                    <div className="mt-3">
                      {nextMatch ? (
                        <StatusBadge kind="match" status={nextMatch.status} />
                      ) : (
                        <span className="text-sm text-slate-300">
                          Nessun match aperto al momento
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <LoadingLink
                    href={`/tournaments/${tournament.slug}`}
                    className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
                  >
                    Apri torneo
                  </LoadingLink>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="rounded-[2rem] border border-dashed border-slate-700 bg-slate-950/70 p-10 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Nessun torneo personale trovato
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400">
            Appena ti iscrivi a un torneo o vieni aggiunto dall&apos;admin, qui
            compariranno il prossimo avversario, il tuo tabellone e le partite da
            confermare.
          </p>
          <LoadingLink
            href="/tournaments"
            className="mt-6 inline-flex rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Vai ai tornei disponibili
          </LoadingLink>
        </section>
      )}
    </div>
  );
}
