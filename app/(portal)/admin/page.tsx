import {
  addManualParticipantAction,
  approveRegistrationAction,
  createTournamentAction,
  generateBracketAction,
  updateTournamentStatusAction,
} from "@/app/actions/tournaments";
import StatusBadge from "@/app/components/portal/StatusBadge";
import { getRequiredAdminSession } from "@/app/lib/session";
import { getAdminTournaments } from "@/app/lib/tournaments/store";
import {
  participantModeOptions,
  resultConfirmationOptions,
  schedulingModeOptions,
  seedingModeOptions,
  signupModeOptions,
  tieBreakerOptions,
  tournamentFormatLabels,
  tournamentFormatOptions,
  visibilityOptions,
} from "@/app/lib/tournaments/types";

export const metadata = {
  title: "Admin tornei | AoE4 Community Italia",
};

function SelectField<T extends string>({
  id,
  label,
  name,
  options,
  defaultValue,
}: {
  id: string;
  label: string;
  name: string;
  options: {
    value: T;
    label: string;
    description: string;
  }[];
  defaultValue: T;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="mt-2 block text-xs leading-6 text-slate-500">
        {options.find((option) => option.value === defaultValue)?.description}
      </span>
    </label>
  );
}

export default async function AdminPage() {
  const session = await getRequiredAdminSession();
  const tournaments = session.accessToken
    ? await getAdminTournaments(session.accessToken)
    : [];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-amber-400/20 bg-slate-950/75 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
          Console admin
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
          Organizza tornei, gestisci roster e controlla il bracket reale.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          Sei autenticato come {session.user.email}. Da qui il frontend parla con
          il backend Express e usa il database Supabase del progetto torneo.
        </p>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <form
          action={createTournamentAction}
          className="rounded-[2rem] border border-slate-800 bg-slate-950/75 p-8 shadow-2xl shadow-black/20"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Nuovo torneo
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Creazione torneo collegata al backend
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label htmlFor="name" className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  Nome torneo
                </span>
                <input
                  id="name"
                  name="name"
                  required
                  placeholder="Spring Clash AoE4"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                />
              </label>

              <label htmlFor="slug" className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  Slug URL
                </span>
                <input
                  id="slug"
                  name="slug"
                  placeholder="spring-clash"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                />
              </label>
            </div>

            <label htmlFor="description" className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Descrizione
              </span>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Torneo community con bracket finale e conferma risultati a due step."
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <SelectField
                id="format"
                label="Formato torneo"
                name="format"
                options={tournamentFormatOptions}
                defaultValue="single_elimination"
              />
              <SelectField
                id="participantMode"
                label="Tipo partecipanti"
                name="participantMode"
                options={participantModeOptions}
                defaultValue="1v1"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <SelectField
                id="signupMode"
                label="Modalita iscrizione"
                name="signupMode"
                options={signupModeOptions}
                defaultValue="public"
              />
              <SelectField
                id="seedingMode"
                label="Seeding"
                name="seedingMode"
                options={seedingModeOptions}
                defaultValue="manual"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <SelectField
                id="visibility"
                label="Visibilita"
                name="visibility"
                options={visibilityOptions}
                defaultValue="public"
              />
              <SelectField
                id="resultConfirmationMode"
                label="Conferma risultati"
                name="resultConfirmationMode"
                options={resultConfirmationOptions}
                defaultValue="dual_confirmation"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <SelectField
                id="schedulingMode"
                label="Scheduling"
                name="schedulingMode"
                options={schedulingModeOptions}
                defaultValue="deadline"
              />
              <SelectField
                id="tieBreaker"
                label="Tie-breaker"
                name="tieBreaker"
                options={tieBreakerOptions}
                defaultValue="head_to_head"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-4">
              <label htmlFor="bestOf" className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Best of</span>
                <input
                  id="bestOf"
                  name="bestOf"
                  type="number"
                  min={1}
                  step={2}
                  defaultValue={3}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                />
              </label>

              <label htmlFor="minParticipants" className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  Min partecipanti
                </span>
                <input
                  id="minParticipants"
                  name="minParticipants"
                  type="number"
                  min={2}
                  defaultValue={2}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                />
              </label>

              <label htmlFor="maxParticipants" className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  Max partecipanti
                </span>
                <input
                  id="maxParticipants"
                  name="maxParticipants"
                  type="number"
                  min={2}
                  defaultValue={8}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                />
              </label>

              <label htmlFor="prizeSummary" className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  Premio
                </span>
                <input
                  id="prizeSummary"
                  name="prizeSummary"
                  placeholder="Badge + premio Discord"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <label htmlFor="registrationsOpenAt" className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  Apertura iscrizioni
                </span>
                <input
                  id="registrationsOpenAt"
                  name="registrationsOpenAt"
                  type="datetime-local"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                />
              </label>

              <label htmlFor="registrationsCloseAt" className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  Chiusura iscrizioni
                </span>
                <input
                  id="registrationsCloseAt"
                  name="registrationsCloseAt"
                  type="datetime-local"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                />
              </label>

              <label htmlFor="startsAt" className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  Inizio torneo
                </span>
                <input
                  id="startsAt"
                  name="startsAt"
                  type="datetime-local"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                />
              </label>
            </div>

            <label htmlFor="mapRules" className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Regole mappe / veto / civ
              </span>
              <textarea
                id="mapRules"
                name="mapRules"
                rows={3}
                placeholder="Map pool fisso, veto 1-1, no remake salvo crash entro 3 minuti."
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
            </label>

            <label htmlFor="notes" className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Note organizzative
              </span>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Deadline round, policy no-show, canale Discord per scheduling."
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
            </label>

            <label htmlFor="manualRoster" className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Roster manuale
              </span>
              <textarea
                id="manualRoster"
                name="manualRoster"
                rows={6}
                placeholder={"EpicoJackal <jackal@example.com>\nPlayerTwo <player2@example.com>\nPlayerTre"}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
              <span className="mt-2 block text-xs leading-6 text-slate-500">
                Una riga per giocatore. Se inserisci email, il backend prova a
                collegarlo al profilo reale; altrimenti crea un partecipante manuale.
              </span>
            </label>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
                <input type="checkbox" name="requiresCheckIn" className="size-4" />
                Check-in obbligatorio
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
                <input type="checkbox" name="requiresEvidence" className="size-4" />
                Prova risultato richiesta
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
                <input type="checkbox" name="autoGenerateBracket" className="size-4" />
                Genera bracket subito se possibile
              </label>
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-amber-400 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Crea torneo
            </button>
          </div>
        </form>

        <section className="rounded-[2rem] border border-slate-800 bg-slate-950/75 p-8 shadow-2xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Integrazione live
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Cosa cambia rispetto al tentativo locale
          </h2>

          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
              Login email/password e sessioni tramite Supabase
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
              Dati torneo caricati dal backend Express
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
              Admin actions inoltrate al backend con chiave server-only
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
              Nessun salvataggio JSON locale nel frontend
            </div>
          </div>
        </section>
      </section>

      <section className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Tornei creati
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Gestione rapida roster, iscrizioni e bracket
          </h2>
        </div>

        {tournaments.length > 0 ? (
          <div className="space-y-6">
            {tournaments.map((tournament) => (
              <article
                key={tournament.id}
                className="rounded-[2rem] border border-slate-800 bg-slate-950/75 p-7 shadow-2xl shadow-black/20"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-amber-300">
                      {tournamentFormatLabels[tournament.format]}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      {tournament.title}
                    </h3>
                  </div>

                  <StatusBadge kind="tournament" status={tournament.status} />
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-4">
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
                      Iscrizioni pending
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {tournament.pending_registrations ?? 0}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                    <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                      Match generati
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {tournament.match_count ?? 0}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                    <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                      Regole
                    </p>
                    <p className="mt-3 text-base font-semibold text-white">
                      {tournament.participant_mode} • BO{tournament.best_of}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <form action={updateTournamentStatusAction}>
                    <input type="hidden" name="tournamentId" value={tournament.id} />
                    <input type="hidden" name="slug" value={tournament.slug} />
                    <input type="hidden" name="status" value="registration_open" />
                    <button
                      type="submit"
                      className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-300 hover:text-amber-200"
                    >
                      Apri iscrizioni
                    </button>
                  </form>

                  <form action={updateTournamentStatusAction}>
                    <input type="hidden" name="tournamentId" value={tournament.id} />
                    <input type="hidden" name="slug" value={tournament.slug} />
                    <input type="hidden" name="status" value="paused" />
                    <button
                      type="submit"
                      className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-300 hover:text-amber-200"
                    >
                      Metti in pausa
                    </button>
                  </form>

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
                </div>

                <div className="mt-8 grid gap-6 xl:grid-cols-2">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                    <h4 className="text-lg font-semibold text-white">
                      Aggiungi player manualmente
                    </h4>
                    <form action={addManualParticipantAction} className="mt-4 space-y-3">
                      <input type="hidden" name="tournamentId" value={tournament.id} />
                      <input type="hidden" name="slug" value={tournament.slug} />
                      <input
                        type="text"
                        name="displayName"
                        placeholder="Nome giocatore"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email opzionale"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                      />
                      <button
                        type="submit"
                        className="w-full rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-amber-300 hover:text-amber-200"
                      >
                        Inserisci nel roster
                      </button>
                    </form>
                  </div>

                  <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                    <h4 className="text-lg font-semibold text-white">
                      Richieste in approvazione
                    </h4>
                    <div className="mt-4 space-y-3">
                      {tournament.pending_registration_entries?.length ? (
                        tournament.pending_registration_entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                          >
                            <p className="font-semibold text-white">
                              {entry.profile?.display_name ?? "Player"}
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              {entry.profile?.email ?? "Partecipante manuale"}
                            </p>
                            <form action={approveRegistrationAction} className="mt-3">
                              <input type="hidden" name="tournamentId" value={tournament.id} />
                              <input type="hidden" name="slug" value={tournament.slug} />
                              <input type="hidden" name="registrationId" value={entry.id} />
                              <button
                                type="submit"
                                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
                              >
                                Approva iscrizione
                              </button>
                            </form>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm leading-7 text-slate-400">
                          Nessuna richiesta pending su questo torneo.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-700 bg-slate-950/70 p-10 text-center">
            <h3 className="text-2xl font-semibold text-white">
              Nessun torneo creato
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400">
              Usa il form sopra per creare il primo torneo e iniziare a testare il
              flusso completo di iscrizione, gestione match e aggiornamento del tabellone.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
