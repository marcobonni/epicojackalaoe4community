import { getOptionalSession } from "@/app/lib/session";
import { requestTournamentJoinAction } from "@/app/actions/tournaments";
import LoadingLink from "@/app/components/LoadingLink";
import PendingSubmitButton from "@/app/components/portal/PendingSubmitButton";
import StatusBadge from "@/app/components/portal/StatusBadge";
import { listTournaments } from "@/app/lib/tournaments/store";
import {
  tournamentFormatLabels,
  type TournamentSummary,
} from "@/app/lib/tournaments/types";

export const metadata = {
  title: "Tornei | AoE4 Community Italia",
};

export default async function TournamentsPage() {
  const session = await getOptionalSession();
  let tournaments: TournamentSummary[] = [];
  let loadError: string | null = null;

  try {
    tournaments = await listTournaments(session?.accessToken);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Il backend torneo non ha risposto correttamente.";
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-amber-400/20 bg-slate-950/75 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
          Tornei community
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
          Elenco tornei collegato al backend reale.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          Qui puoi entrare nei tornei aperti, vedere il formato scelto
          dall&apos;admin e aprire il tabellone completo. Le iscrizioni e lo stato
          personale arrivano ora direttamente dal servizio Express.
        </p>
      </section>

      {loadError ? (
        <section className="rounded-[2rem] border border-rose-500/25 bg-rose-950/20 p-6 shadow-2xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-200">
            Servizio torneo non disponibile
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-rose-100">
            Il frontend ha raggiunto il backend, ma la rotta tornei ha risposto con
            un errore. In locale succede spesso se manca lo schema Supabase oppure se
            il backend non riesce a leggere le tabelle torneo.
          </p>
          <p className="mt-3 rounded-2xl border border-rose-400/20 bg-slate-950/60 px-4 py-3 font-mono text-xs text-rose-100">
            {loadError}
          </p>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        {tournaments.length > 0 ? (
          tournaments.map((tournament) => {
            const canJoin =
              Boolean(session?.user) &&
              !tournament.my_registration_status &&
              tournament.status === "registration_open" &&
              tournament.signup_mode !== "manual_roster" &&
              tournament.signup_mode !== "invite_only" &&
              (tournament.participant_count ?? 0) < tournament.max_participants;
            const joinLabel =
              tournament.signup_mode === "approval"
                ? "Invia richiesta"
                : tournament.signup_mode === "hybrid"
                  ? "Entra / richiedi slot"
                  : "Iscriviti";

            return (
              <article
                key={tournament.id}
                className="rounded-[2rem] border border-slate-800 bg-slate-950/75 p-7 shadow-2xl shadow-black/20"
              >
                {tournament.banner_url ? (
                  <div className="mb-6 overflow-hidden rounded-[1.75rem] border border-slate-800">
                    <img
                      src={tournament.banner_url}
                      alt={`Banner ${tournament.title}`}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                ) : null}

                <div className="flex flex-wrap items-start justify-between gap-4">
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

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  {tournament.description || "Nessuna descrizione ancora inserita."}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                    <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                      Partecipanti
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {tournament.participant_count ?? 0}/{tournament.max_participants}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                    <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                      Regole
                    </p>
                    <p className="mt-3 text-sm text-slate-200">
                      {tournament.participant_mode} • BO{tournament.best_of}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <LoadingLink
                    href={`/tournaments/${tournament.slug}`}
                    className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
                  >
                    Apri torneo
                  </LoadingLink>

                  {tournament.my_registration_status === "registered" ? (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100">
                      Gia partecipante
                    </span>
                  ) : null}

                  {tournament.my_registration_status === "pending" ? (
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-100">
                      Richiesta in approvazione
                    </span>
                  ) : null}

                  {canJoin ? (
                    <form action={requestTournamentJoinAction}>
                      <input type="hidden" name="tournamentId" value={tournament.id} />
                      <input type="hidden" name="slug" value={tournament.slug} />
                      <PendingSubmitButton
                        idleLabel={joinLabel}
                        pendingLabel="Iscrizione in corso..."
                        className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-300 hover:text-amber-200"
                      />
                    </form>
                  ) : null}
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-700 bg-slate-950/70 p-10 text-center lg:col-span-2">
            <h2 className="text-2xl font-semibold text-white">
              Nessun torneo disponibile
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              Appena un admin crea il primo torneo, comparira qui con formato,
              stato e pulsante di iscrizione.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
