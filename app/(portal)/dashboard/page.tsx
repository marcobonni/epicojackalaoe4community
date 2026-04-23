import LoadingLink from "@/app/components/LoadingLink";
import StatusBadge from "@/app/components/portal/StatusBadge";
import { getRequiredSession, hasRole } from "@/app/lib/session";
import { getMyTournaments } from "@/app/lib/tournaments/store";
import { tournamentFormatLabels } from "@/app/lib/tournaments/types";

export const metadata = {
  title: "Dashboard tornei | AoE4 Italia Legacy",
};

export default async function DashboardPage() {
  const session = await getRequiredSession();
  const myTournaments = session.accessToken
    ? await getMyTournaments(session.accessToken)
    : [];

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
        <div className="cinematic-panel-strong p-8 sm:p-10">
          <p className="cinematic-kicker">Area giocatore</p>
          <h1 className="cinematic-title mt-5 text-4xl sm:text-5xl">
            Ciao {session.user.name}, qui trovi il tuo percorso torneo.
          </h1>
          <p className="cinematic-body mt-5 max-w-3xl text-sm sm:text-base">
            Qui puoi controllare i tornei a cui partecipi, vedere la tua prossima
            partita e raggiungere in un attimo il tabellone completo.
          </p>
        </div>

        <div className="cinematic-panel p-8">
          <p className="cinematic-kicker text-[#d8cbb7]/74">Azioni rapide</p>
          <div className="mt-6 space-y-3">
            <LoadingLink href="/tournaments" className="cinematic-button-primary w-full">
              Sfoglia tornei
            </LoadingLink>

            <LoadingLink href="/clanwars/risiko" className="cinematic-button-ghost w-full">
              Apri mappa Clan Wars
            </LoadingLink>

            {hasRole(session, "admin") ? (
              <LoadingLink href="/admin" className="cinematic-button-secondary w-full">
                Vai all'area organizzazione
              </LoadingLink>
            ) : null}
          </div>
        </div>
      </section>

      {myTournaments.length > 0 ? (
        <section className="grid gap-6 lg:grid-cols-2">
          {myTournaments.map(({ tournament, nextMatch }, index) => {
            const nextOpponent =
              nextMatch?.player1_id === session.user.id
                ? nextMatch.player2?.display_name ?? "In attesa di avversario"
                : nextMatch?.player2_id === session.user.id
                  ? nextMatch.player1?.display_name ?? "In attesa di avversario"
                  : "In attesa di avversario";

            return (
              <article
                key={tournament.id}
                className={`${index === 0 ? "cinematic-panel-strong" : "cinematic-panel"} p-7`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="cinematic-kicker text-[11px]">
                      {tournamentFormatLabels[tournament.format]}
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
                      {tournament.title}
                    </h2>
                  </div>

                  <StatusBadge kind="tournament" status={tournament.status} />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="cinematic-stat-card p-5">
                    <p className="text-xs uppercase tracking-[0.26em] text-[#bcae9a]">
                      Prossimo avversario
                    </p>
                    <p className="mt-4 text-xl font-semibold text-white">
                      {nextMatch ? nextOpponent : "In attesa del prossimo round"}
                    </p>
                  </div>

                  <div className="cinematic-stat-card p-5">
                    <p className="text-xs uppercase tracking-[0.26em] text-[#bcae9a]">
                      Stato match
                    </p>
                    <div className="mt-4">
                      {nextMatch ? (
                        <StatusBadge kind="match" status={nextMatch.status} />
                      ) : (
                        <span className="text-sm text-[#d8cbb7]/74">
                          Nessun match aperto al momento
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <LoadingLink
                    href={`/tournaments/${tournament.slug}`}
                    className="cinematic-button-primary"
                  >
                    Apri torneo
                  </LoadingLink>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="cinematic-empty-state p-10 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Nessun torneo personale trovato
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-[#d8cbb7]/74">
            Quando entrerai in un torneo, qui vedrai subito avversari, partite da
            giocare e aggiornamenti del tabellone.
          </p>
          <LoadingLink href="/tournaments" className="cinematic-button-primary mt-6">
            Vai ai tornei disponibili
          </LoadingLink>
        </section>
      )}
    </div>
  );
}

