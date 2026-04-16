import { notFound } from "next/navigation";
import {
  confirmMatchResultAction,
  disputeMatchResultAction,
  generateBracketAction,
  resolveDisputedMatchAction,
  submitMatchResultAction,
} from "@/app/actions/tournaments";
import PendingSubmitButton from "@/app/components/portal/PendingSubmitButton";
import StatusBadge from "@/app/components/portal/StatusBadge";
import { getOptionalSession, hasRole } from "@/app/lib/session";
import {
  getTournamentBySlug,
  getParticipantDisplayName,
} from "@/app/lib/tournaments/store";
import {
  formatSupportsStandings,
  getMatchPerspective,
  getTournamentStandings,
  getTournamentSummaryForUser,
  getParticipantSeedLabel,
} from "@/app/lib/tournaments/queries";
import {
  resultConfirmationOptions,
  schedulingModeOptions,
  tieBreakerOptions,
  tournamentFormatLabels,
} from "@/app/lib/tournaments/types";

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

  if (tournament.visibility === "hidden" && !hasRole(session, "admin")) {
    notFound();
  }

  const personalSummary = getTournamentSummaryForUser(payload, session?.user.id);
  const nextPersonalMatch = personalSummary.nextMatch;
  const standings = formatSupportsStandings(tournament.format)
    ? getTournamentStandings(tournament, payload.participants, payload.matches)
    : [];
  const roundNumbers = buildRounds(payload.matches.map((match) => match.round_number));
  const rounds = roundNumbers.map((roundNumber) => ({
    roundNumber,
    matches: payload.matches.filter((match) => match.round_number === roundNumber),
  }));
  const canAutoReportMatch =
    Boolean(session) &&
    Boolean(nextPersonalMatch) &&
    (nextPersonalMatch?.status === "ready" ||
      nextPersonalMatch?.status === "disputed" ||
      (nextPersonalMatch?.status === "awaiting_confirmation" &&
        tournament.result_confirmation_mode === "auto_on_same_report" &&
        nextPersonalMatch?.reported_by_id !== session?.user.id));
  const resultModeLabel =
    resultConfirmationOptions.find(
      (option) => option.value === tournament.result_confirmation_mode
    )?.label ?? tournament.result_confirmation_mode.replaceAll("_", " ");
  const schedulingModeLabel =
    schedulingModeOptions.find(
      (option) => option.value === tournament.scheduling_mode
    )?.label ?? tournament.scheduling_mode.replaceAll("_", " ");
  const tieBreakerLabel =
    tieBreakerOptions.find((option) => option.value === tournament.tie_breaker)?.label ??
    tournament.tie_breaker.replaceAll("_", " ");

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="cinematic-panel-strong p-8 sm:p-10">
          {tournament.banner_url ? (
            <div className="mb-6 overflow-hidden rounded-[1.75rem] border border-slate-800">
              <img
                src={tournament.banner_url}
                alt={`Banner ${tournament.title}`}
                className="h-64 w-full object-cover"
              />
            </div>
          ) : null}

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="cinematic-kicker">
                {tournamentFormatLabels[tournament.format]}
              </p>
              <h1 className="cinematic-title mt-5 text-4xl sm:text-5xl">
                {tournament.title}
              </h1>
            </div>

            <StatusBadge kind="tournament" status={tournament.status} />
          </div>

          <p className="cinematic-body mt-5 max-w-3xl text-sm sm:text-base">
            {tournament.description || "Dettagli torneo in aggiornamento."}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="cinematic-stat-card p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                Partecipanti
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {payload.participants.length}/{tournament.max_participants}
              </p>
            </div>

            <div className="cinematic-stat-card p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                Modalita
              </p>
              <p className="mt-3 text-base font-semibold text-white">
                {tournament.participant_mode} • BO{tournament.best_of}
              </p>
            </div>

            <div className="cinematic-stat-card p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                Iscrizione
              </p>
              <p className="mt-3 text-base font-semibold text-white">
                {tournament.signup_mode.replaceAll("_", " ")}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="cinematic-stat-card p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                Conferma risultati
              </p>
              <p className="mt-3 text-base font-semibold text-white">{resultModeLabel}</p>
            </div>

            <div className="cinematic-stat-card p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                Scheduling
              </p>
              <p className="mt-3 text-base font-semibold text-white">{schedulingModeLabel}</p>
            </div>

            <div className="cinematic-stat-card p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                Tie-breaker
              </p>
              <p className="mt-3 text-base font-semibold text-white">{tieBreakerLabel}</p>
            </div>
          </div>
        </div>

        <div className="cinematic-panel p-8 sm:p-10">
          <p className="cinematic-kicker text-slate-300/74">
            Il tuo riepilogo
          </p>

          <div className="mt-6 space-y-4">
            <div className="cinematic-stat-card p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                Prossimo avversario
              </p>
              <p className="mt-3 text-xl font-semibold text-white">
                {personalSummary.nextOpponent ?? "Accedi per vedere il tuo percorso"}
              </p>
            </div>

            <div className="cinematic-stat-card p-5">
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
          <div className="cinematic-panel p-7">
            <h2 className="text-2xl font-semibold text-white">Regole match</h2>
            <p className="cinematic-body mt-4 text-sm">
              {tournament.map_rules || "Nessuna regola mappe specificata."}
            </p>
          </div>

          <div className="cinematic-panel p-7">
            <h2 className="text-2xl font-semibold text-white">Note organizzative</h2>
            <p className="cinematic-body mt-4 text-sm">
              {tournament.notes || "Nessuna nota aggiuntiva."}
            </p>
          </div>
        </section>
      ) : null}

      {personalSummary.nextMatch ? (
        <section className="cinematic-panel-strong rounded-[2rem] border border-emerald-500/20 p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="cinematic-kicker text-emerald-200">
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

          {canAutoReportMatch ? (
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
                className="cinematic-input text-sm"
              />
              <input
                name="playerTwoWins"
                type="number"
                min={0}
                max={tournament.best_of}
                required
                placeholder="Score player 2"
                className="cinematic-input text-sm"
              />
              <input
                name="evidenceNote"
                type="text"
                required={tournament.evidence_mode === "required"}
                placeholder={
                  tournament.evidence_mode === "required"
                    ? "Inserisci prova obbligatoria: screenshot, replay o link"
                    : "Screenshot, replay o nota prova"
                }
                className="cinematic-input text-sm"
              />
              <PendingSubmitButton
                idleLabel={
                  personalSummary.nextMatch.status === "awaiting_confirmation"
                    ? "Invia il tuo report"
                    : "Invia risultato"
                }
                pendingLabel={
                  personalSummary.nextMatch.status === "awaiting_confirmation"
                    ? "Confronto report in corso..."
                    : "Invio risultato..."
                }
                className="cinematic-button-primary"
              />
            </form>
          ) : null}

          {personalSummary.nextMatch.status === "awaiting_confirmation" &&
          personalSummary.nextMatch.reported_by_id !== session?.user.id &&
          tournament.result_confirmation_mode === "dual_confirmation" ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-[auto_1fr]">
              <form action={confirmMatchResultAction}>
                <input type="hidden" name="slug" value={tournament.slug} />
                <input type="hidden" name="matchId" value={personalSummary.nextMatch.id} />
                <PendingSubmitButton
                  idleLabel="Conferma risultato"
                  pendingLabel="Conferma in corso..."
                  className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
                />
              </form>

              <form action={disputeMatchResultAction} className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <input type="hidden" name="slug" value={tournament.slug} />
                <input type="hidden" name="matchId" value={personalSummary.nextMatch.id} />
                <input
                  type="text"
                  name="disputeReason"
                  placeholder="Spiega brevemente il problema"
                  className="cinematic-input text-sm"
                />
                <PendingSubmitButton
                  idleLabel="Contesta"
                  pendingLabel="Invio contestazione..."
                  className="cinematic-button-ghost border-rose-500/40 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
                />
              </form>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="cinematic-panel p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="cinematic-kicker text-slate-300/74">
              Bracket
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Tabellone e andamento partite
            </h2>
          </div>

          {hasRole(session, "admin") && payload.matches.length === 0 ? (
              <form action={generateBracketAction}>
                <input type="hidden" name="tournamentId" value={tournament.id} />
                <input type="hidden" name="slug" value={tournament.slug} />
                <PendingSubmitButton
                idleLabel="Genera struttura torneo"
                pendingLabel="Generazione struttura..."
                className="cinematic-button-primary"
              />
            </form>
          ) : null}
        </div>

        {rounds.length > 0 ? (
          <div className="mt-8 overflow-x-auto">
            <div className="flex min-w-max gap-5">
              {rounds.map((round) => (
                <div key={round.roundNumber} className="w-80 shrink-0 space-y-4">
                  <div className="cinematic-stat-card p-4">
                    <p className="text-xs uppercase tracking-[0.26em] text-amber-300">
                      Round {round.roundNumber}
                    </p>
                  </div>

                  {round.matches.map((match) => {
                    const perspective = getMatchPerspective(match);

                    return (
                      <article
                        key={match.id}
                        className="cinematic-card-grid p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-slate-200">
                            Match {match.match_number}
                          </span>
                          <StatusBadge kind="match" status={match.status} />
                        </div>

                        <div className="mt-4 space-y-3">
                          <div className="rounded-2xl border border-white/8 bg-black/16 px-4 py-3 text-sm text-slate-200">
                            {perspective.playerOneName}
                            {match.player1_wins != null ? (
                              <span className="float-right font-semibold text-white">
                                {match.player1_wins}
                              </span>
                            ) : null}
                          </div>

                          <div className="rounded-2xl border border-white/8 bg-black/16 px-4 py-3 text-sm text-slate-200">
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

                        {hasRole(session, "admin") &&
                        (match.status === "disputed" ||
                          match.status === "awaiting_confirmation" ||
                          match.status === "admin_review" ||
                          match.status === "ready") ? (
                          <form
                            action={resolveDisputedMatchAction}
                            className="cinematic-stat-card mt-5 space-y-3 rounded-[1.6rem] p-4"
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
                                className="cinematic-input text-sm"
                              />
                              <input
                                type="number"
                                name="playerTwoWins"
                                min={0}
                                max={tournament.best_of}
                                placeholder="Score P2"
                                className="cinematic-input text-sm"
                              />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <select
                                name="winnerSide"
                                defaultValue="1"
                                className="cinematic-input text-sm"
                              >
                                <option value="1">Vince player 1</option>
                                <option value="2">Vince player 2</option>
                              </select>

                              <select
                                name="resolution"
                                defaultValue="admin"
                                className="cinematic-input text-sm"
                              >
                                <option value="admin">Risoluzione admin</option>
                                <option value="forfeit">Forfeit</option>
                              </select>
                            </div>

                            <textarea
                              name="adminNotes"
                              rows={2}
                              placeholder="Nota admin"
                              className="cinematic-input text-sm"
                            />

                            <PendingSubmitButton
                              idleLabel="Risolvi da admin"
                              pendingLabel="Risoluzione match..."
                              className="cinematic-button-secondary w-full"
                            />
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
          <div className="cinematic-empty-state mt-8 p-8 text-center">
            <p className="text-base text-slate-300">
              La struttura del torneo non e ancora stata generata.
            </p>
          </div>
        )}
      </section>

      {standings.length > 0 ? (
        <section className="cinematic-panel p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Classifica live</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300/74">
                Ordinata usando il tie-breaker selezionato dall&apos;admin: {tieBreakerLabel}.
              </p>
            </div>

            <div className="cinematic-pill">
              Formato: {tournamentFormatLabels[tournament.format]}
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm text-slate-200">
              <thead>
                <tr className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  <th className="px-4">#</th>
                  <th className="px-4">Partecipante</th>
                  <th className="px-4">W-L</th>
                  <th className="px-4">Mappe</th>
                  <th className="px-4">Buchholz</th>
                  <th className="px-4">Seed</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((standing, index) => (
                  <tr
                    key={standing.participantId}
                    className="rounded-2xl border border-white/8 bg-white/[0.04]"
                  >
                    <td className="rounded-l-2xl px-4 py-3 font-semibold text-white">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">{standing.displayName}</td>
                    <td className="px-4 py-3">
                      {standing.matchWins}-{standing.matchLosses}
                    </td>
                    <td className="px-4 py-3">
                      {standing.mapWins}-{standing.mapLosses}
                    </td>
                    <td className="px-4 py-3">{standing.buchholz}</td>
                    <td className="rounded-r-2xl px-4 py-3">
                      {standing.seed ?? "TBD"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="cinematic-panel p-7">
          <h2 className="text-2xl font-semibold text-white">Partecipanti</h2>
          <div className="mt-6 space-y-3">
            {payload.participants.length > 0 ? (
              payload.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="cinematic-card-grid flex items-center justify-between rounded-[1.4rem] px-4 py-3 text-sm text-slate-200"
                >
                  <span>{participant.profile?.display_name ?? "Player"}</span>
                  <span className="text-slate-400">
                    Seed {getParticipantSeedLabel(participant)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-300/74">Ancora nessun partecipante.</p>
            )}
          </div>
        </div>

        <div className="cinematic-panel p-7">
          <h2 className="text-2xl font-semibold text-white">Storico partite</h2>
          <div className="mt-6 space-y-3">
            {payload.matches.length > 0 ? (
              payload.matches.map((match) => {
                const perspective = getMatchPerspective(match);

                return (
                  <div
                    key={match.id}
                    className="cinematic-card-grid rounded-[1.4rem] p-4 text-sm text-slate-200"
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
              <p className="text-sm text-slate-300/74">
                Lo storico apparira qui appena il torneo parte.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
