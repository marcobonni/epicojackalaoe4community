import { notFound } from "next/navigation";
import {
  confirmMatchResultAction,
  disputeMatchResultAction,
  generateBracketAction,
  resolveDisputedMatchAction,
  submitMatchResultAction,
} from "@/app/actions/tournaments";
import StatusBadge from "@/app/components/portal/StatusBadge";
import { getOptionalSession } from "@/app/lib/session";
import {
  getTournamentBySlug,
  getParticipantDisplayName,
} from "@/app/lib/tournaments/store";
import {
  getMatchPerspective,
  getTournamentSummaryForUser,
  getParticipantSeedLabel,
} from "@/app/lib/tournaments/queries";
import { tournamentFormatLabels } from "@/app/lib/tournaments/types";

type TournamentDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function buildRounds(roundNumbers: number[]) {
  return Array.from(new Set(roundNumbers)).sort((left, right) => left - right);
}

export async function generateMetadata({ params }: TournamentDetailPageProps) {
  const { slug } = await params;
  const payload = await getTournamentBySlug(slug);

  if (!payload.tournament) {
    return {};
  }

  return {
    title: `${payload.tournament.title} | Tornei AoE4`,
    description: payload.tournament.description,
  };
}

export default async function TournamentDetailPage({
  params,
}: TournamentDetailPageProps) {
  const { slug } = await params;
  const session = await getOptionalSession();
  const payload = await getTournamentBySlug(slug, session?.accessToken);

  if (!payload.tournament) {
    notFound();
  }

  const tournament = payload.tournament;

  if (tournament.visibility === "hidden" && session?.user.role !== "admin") {
    notFound();
  }

  const personalSummary = getTournamentSummaryForUser(payload, session?.user.id);
  const roundNumbers = buildRounds(payload.matches.map((match) => match.round_number));
  const rounds = roundNumbers.map((roundNumber) => ({
    roundNumber,
    matches: payload.matches.filter((match) => match.round_number === roundNumber),
  }));

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-amber-400/20 bg-slate-950/75 p-8 shadow-2xl shadow-black/30">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
                {tournamentFormatLabels[tournament.format]}
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
                {tournament.title}
              </h1>
            </div>

            <StatusBadge kind="tournament" status={tournament.status} />
          </div>

          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            {tournament.description || "Dettagli torneo in aggiornamento."}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                Partecipanti
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {payload.participants.length}/{tournament.max_participants}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                Modalita
              </p>
              <p className="mt-3 text-base font-semibold text-white">
                {tournament.participant_mode} • BO{tournament.best_of}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                Iscrizione
              </p>
              <p className="mt-3 text-base font-semibold text-white">
                {tournament.signup_mode.replaceAll("_", " ")}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-8 shadow-2xl shadow-black/30">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Il tuo riepilogo
          </p>

          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                Prossimo avversario
              </p>
              <p className="mt-3 text-xl font-semibold text-white">
                {personalSummary.nextOpponent ?? "Accedi per vedere il tuo percorso"}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                Stato del tuo match
              </p>
              <div className="mt-3">
                {personalSummary.nextMatch ? (
                  <StatusBadge kind="match" status={personalSummary.nextMatch.status} />
                ) : (
                  <span className="text-sm text-slate-300">
                    Nessuna partita da gestire al momento
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {tournament.map_rules || tournament.notes ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/75 p-7 shadow-2xl shadow-black/20">
            <h2 className="text-2xl font-semibold text-white">Regole match</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              {tournament.map_rules || "Nessuna regola mappe specificata."}
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-950/75 p-7 shadow-2xl shadow-black/20">
            <h2 className="text-2xl font-semibold text-white">Note organizzative</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              {tournament.notes || "Nessuna nota aggiuntiva."}
            </p>
          </div>
        </section>
      ) : null}

      {personalSummary.nextMatch ? (
        <section className="rounded-[2rem] border border-emerald-500/20 bg-slate-950/75 p-7 shadow-2xl shadow-black/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
                Match personale
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                {getParticipantDisplayName(
                  payload.participants,
                  personalSummary.nextMatch.player1_id
                )}{" "}
                vs{" "}
                {getParticipantDisplayName(
                  payload.participants,
                  personalSummary.nextMatch.player2_id
                )}
              </h2>
            </div>

            <StatusBadge kind="match" status={personalSummary.nextMatch.status} />
          </div>

          {(personalSummary.nextMatch.status === "ready" ||
            personalSummary.nextMatch.status === "disputed") &&
          session ? (
            <form
              action={submitMatchResultAction}
              className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_1.4fr_auto]"
            >
              <input type="hidden" name="slug" value={tournament.slug} />
              <input type="hidden" name="matchId" value={personalSummary.nextMatch.id} />

              <input
                name="playerOneWins"
                type="number"
                min={0}
                max={tournament.best_of}
                required
                placeholder="Score player 1"
                className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
              <input
                name="playerTwoWins"
                type="number"
                min={0}
                max={tournament.best_of}
                required
                placeholder="Score player 2"
                className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
              <input
                name="evidenceNote"
                type="text"
                placeholder="Screenshot, replay o nota prova"
                className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
              <button
                type="submit"
                className="rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                Invia risultato
              </button>
            </form>
          ) : null}

          {personalSummary.nextMatch.status === "awaiting_confirmation" &&
          personalSummary.nextMatch.reported_by_id !== session?.user.id ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-[auto_1fr]">
              <form action={confirmMatchResultAction}>
                <input type="hidden" name="slug" value={tournament.slug} />
                <input type="hidden" name="matchId" value={personalSummary.nextMatch.id} />
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
                >
                  Conferma risultato
                </button>
              </form>

              <form action={disputeMatchResultAction} className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <input type="hidden" name="slug" value={tournament.slug} />
                <input type="hidden" name="matchId" value={personalSummary.nextMatch.id} />
                <input
                  type="text"
                  name="disputeReason"
                  placeholder="Spiega brevemente il problema"
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-rose-300"
                />
                <button
                  type="submit"
                  className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
                >
                  Contesta
                </button>
              </form>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-slate-800 bg-slate-950/75 p-7 shadow-2xl shadow-black/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              Bracket
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Tabellone e andamento partite
            </h2>
          </div>

          {session?.user.role === "admin" && payload.matches.length === 0 ? (
            <form action={generateBracketAction}>
              <input type="hidden" name="tournamentId" value={tournament.id} />
              <input type="hidden" name="slug" value={tournament.slug} />
              <button
                type="submit"
                className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
              >
                Genera bracket
              </button>
            </form>
          ) : null}
        </div>

        {rounds.length > 0 ? (
          <div className="mt-8 overflow-x-auto">
            <div className="flex min-w-max gap-5">
              {rounds.map((round) => (
                <div key={round.roundNumber} className="w-80 shrink-0 space-y-4">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
                    <p className="text-xs uppercase tracking-[0.26em] text-amber-300">
                      Round {round.roundNumber}
                    </p>
                  </div>

                  {round.matches.map((match) => {
                    const perspective = getMatchPerspective(match);

                    return (
                      <article
                        key={match.id}
                        className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-slate-200">
                            Match {match.match_number}
                          </span>
                          <StatusBadge kind="match" status={match.status} />
                        </div>

                        <div className="mt-4 space-y-3">
                          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                            {perspective.playerOneName}
                            {match.player1_wins != null ? (
                              <span className="float-right font-semibold text-white">
                                {match.player1_wins}
                              </span>
                            ) : null}
                          </div>

                          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                            {perspective.playerTwoName}
                            {match.player2_wins != null ? (
                              <span className="float-right font-semibold text-white">
                                {match.player2_wins}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {match.winner_id ? (
                          <p className="mt-4 text-sm text-emerald-200">
                            Vincitore: {perspective.winnerName}
                          </p>
                        ) : null}

                        {match.dispute_reason ? (
                          <p className="mt-4 text-sm leading-6 text-rose-200">
                            Contestazione: {match.dispute_reason}
                          </p>
                        ) : null}

                        {match.report_evidence ? (
                          <p className="mt-4 text-sm leading-6 text-slate-400">
                            Prova allegata: {match.report_evidence}
                          </p>
                        ) : null}

                        {session?.user.role === "admin" &&
                        (match.status === "disputed" ||
                          match.status === "awaiting_confirmation" ||
                          match.status === "admin_review" ||
                          match.status === "ready") ? (
                          <form
                            action={resolveDisputedMatchAction}
                            className="mt-5 space-y-3 rounded-3xl border border-slate-800 bg-slate-950/70 p-4"
                          >
                            <input type="hidden" name="slug" value={tournament.slug} />
                            <input type="hidden" name="matchId" value={match.id} />

                            <div className="grid gap-3 sm:grid-cols-2">
                              <input
                                type="number"
                                name="playerOneWins"
                                min={0}
                                max={tournament.best_of}
                                placeholder="Score P1"
                                className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                              />
                              <input
                                type="number"
                                name="playerTwoWins"
                                min={0}
                                max={tournament.best_of}
                                placeholder="Score P2"
                                className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                              />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <select
                                name="winnerSide"
                                defaultValue="1"
                                className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                              >
                                <option value="1">Vince player 1</option>
                                <option value="2">Vince player 2</option>
                              </select>

                              <select
                                name="resolution"
                                defaultValue="admin"
                                className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                              >
                                <option value="admin">Risoluzione admin</option>
                                <option value="forfeit">Forfeit</option>
                              </select>
                            </div>

                            <textarea
                              name="adminNotes"
                              rows={2}
                              placeholder="Nota admin"
                              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                            />

                            <button
                              type="submit"
                              className="w-full rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/20"
                            >
                              Risolvi da admin
                            </button>
                          </form>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center">
            <p className="text-base text-slate-300">
              Il bracket non e ancora stato generato.
            </p>
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-950/75 p-7 shadow-2xl shadow-black/20">
          <h2 className="text-2xl font-semibold text-white">Partecipanti</h2>
          <div className="mt-6 space-y-3">
            {payload.participants.length > 0 ? (
              payload.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-200"
                >
                  <span>{participant.profile?.display_name ?? "Player"}</span>
                  <span className="text-slate-400">
                    Seed {getParticipantSeedLabel(participant)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Ancora nessun partecipante.</p>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-800 bg-slate-950/75 p-7 shadow-2xl shadow-black/20">
          <h2 className="text-2xl font-semibold text-white">Storico partite</h2>
          <div className="mt-6 space-y-3">
            {payload.matches.length > 0 ? (
              payload.matches.map((match) => {
                const perspective = getMatchPerspective(match);

                return (
                  <div
                    key={match.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p>
                        Round {match.round_number} • Match {match.match_number}
                      </p>
                      <StatusBadge kind="match" status={match.status} />
                    </div>
                    <p className="mt-2 leading-6 text-slate-300">
                      {perspective.playerOneName} vs {perspective.playerTwoName}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-400">
                Lo storico apparira qui appena il torneo parte.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
