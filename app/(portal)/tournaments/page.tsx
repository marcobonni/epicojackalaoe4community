import { requestTournamentJoinAction } from "@/app/actions/tournaments";
import LoadingLink from "@/app/components/LoadingLink";
import PendingSubmitButton from "@/app/components/portal/PendingSubmitButton";
import StatusBadge from "@/app/components/portal/StatusBadge";
import { getTranslations } from "@/app/lib/i18n";
import { getOptionalSession } from "@/app/lib/session";
import { listTournaments } from "@/app/lib/tournaments/store";
import type { TournamentSummary } from "@/app/lib/tournaments/types";

export async function generateMetadata() {
  const { messages } = await getTranslations();

  return {
    title: messages.metadata.tournamentsTitle,
  };
}

export default async function TournamentsPage() {
  const session = await getOptionalSession();
  const { messages } = await getTranslations();
  let tournaments: TournamentSummary[] = [];
  let loadError: string | null = null;

  try {
    tournaments = await listTournaments(session?.accessToken);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : messages.tournamentsPage.serviceUnavailable;
  }

  return (
    <div className="space-y-8">
      <section className="cinematic-panel-strong p-8 sm:p-10">
        <p className="cinematic-kicker">{messages.tournamentsPage.eyebrow}</p>
        <h1 className="cinematic-title mt-5 text-4xl sm:text-5xl">
          {messages.tournamentsPage.title}
        </h1>
        <p className="cinematic-body mt-5 max-w-3xl text-sm sm:text-base">
          {messages.tournamentsPage.description}
        </p>
      </section>

      {loadError ? (
        <section className="cinematic-panel-soft rounded-[1.8rem] border border-rose-500/25 bg-rose-950/20 p-6">
          <p className="cinematic-kicker text-rose-200">
            {messages.tournamentsPage.serviceUnavailable}
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-rose-100/88">
            {messages.tournamentsPage.serviceDescription}
          </p>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        {tournaments.length > 0 ? (
          tournaments.map((tournament, index) => {
            const canJoin =
              Boolean(session?.user) &&
              !tournament.my_registration_status &&
              tournament.status === "registration_open" &&
              tournament.signup_mode !== "manual_roster" &&
              tournament.signup_mode !== "invite_only" &&
              (tournament.participant_count ?? 0) < tournament.max_participants;

            const joinLabel =
              tournament.signup_mode === "approval"
                ? messages.tournamentsPage.joinLabels.approval
                : tournament.signup_mode === "hybrid"
                  ? messages.tournamentsPage.joinLabels.hybrid
                  : messages.tournamentsPage.joinLabels.default;

            return (
              <article
                key={tournament.id}
                className={`${index % 3 === 1 ? "cinematic-panel-strong" : "cinematic-panel"} p-7`}
              >
                {tournament.banner_url ? (
                  <div className="mb-6 overflow-hidden rounded-[1.75rem] border border-white/8">
                    <img
                      src={tournament.banner_url}
                      alt={`Banner ${tournament.title}`}
                      className="h-56 w-full object-cover"
                    />
                  </div>
                ) : null}

                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="cinematic-kicker text-[11px]">
                      {messages.tournamentsPage.formatLabels[tournament.format]}
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
                      {tournament.title}
                    </h2>
                  </div>

                  <StatusBadge kind="tournament" status={tournament.status} />
                </div>

                <p className="cinematic-body mt-5 text-sm">
                  {tournament.description || messages.tournamentsPage.noDescription}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="cinematic-stat-card p-5">
                    <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
                      {messages.tournamentsPage.participants}
                    </p>
                    <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
                      {tournament.participant_count ?? 0}/{tournament.max_participants}
                    </p>
                  </div>

                  <div className="cinematic-stat-card p-5">
                    <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
                      {messages.tournamentsPage.rules}
                    </p>
                    <p className="mt-4 text-sm font-semibold text-white">
                      {tournament.participant_mode} • BO{tournament.best_of}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <LoadingLink
                    href={`/tournaments/${tournament.slug}`}
                    className="cinematic-button-primary"
                  >
                    {messages.tournamentsPage.openTournament}
                  </LoadingLink>

                  {tournament.my_registration_status === "registered" ? (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100">
                      {messages.tournamentsPage.alreadyJoined}
                    </span>
                  ) : null}

                  {tournament.my_registration_status === "pending" ? (
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-100">
                      {messages.tournamentsPage.pendingApproval}
                    </span>
                  ) : null}

                  {canJoin ? (
                    <form action={requestTournamentJoinAction}>
                      <input type="hidden" name="tournamentId" value={tournament.id} />
                      <input type="hidden" name="slug" value={tournament.slug} />
                      <PendingSubmitButton
                        idleLabel={joinLabel}
                        pendingLabel={messages.tournamentsPage.joinPending}
                        className="cinematic-button-ghost"
                      />
                    </form>
                  ) : null}
                </div>
              </article>
            );
          })
        ) : (
          <div className="cinematic-empty-state p-10 text-center lg:col-span-2">
            <h2 className="text-2xl font-semibold text-white">
              {messages.tournamentsPage.emptyTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-slate-300/74">
              {messages.tournamentsPage.emptyDescription}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
