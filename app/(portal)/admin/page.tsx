import {
  addManualParticipantAction,
  approveRegistrationAction,
  createTournamentAction,
  generateBracketAction,
  removeParticipantAction,
  updateParticipantAction,
  updateTournamentStatusAction,
} from "@/app/actions/tournaments";
import PendingSubmitButton from "@/app/components/portal/PendingSubmitButton";
import StatusBadge from "@/app/components/portal/StatusBadge";
import { getRequiredAdminSession } from "@/app/lib/session";
import { getAdminTournaments } from "@/app/lib/tournaments/store";
import {
  participantModeOptions,
  registrationStatusLabels,
  resultConfirmationOptions,
  schedulingModeOptions,
  seedingModeOptions,
  signupModeOptions,
  tieBreakerOptions,
  type RegistrationStatus,
  tournamentFormatLabels,
  tournamentFormatOptions,
  visibilityOptions,
} from "@/app/lib/tournaments/types";

export const metadata = {
  title: "Admin tornei | AoE4 Italia Legacy",
};

const participantStatusOptions: RegistrationStatus[] = [
  "pending",
  "registered",
  "rejected",
  "withdrawn",
];

function getRegistrationTone(status: RegistrationStatus) {
  const palette: Record<RegistrationStatus, string> = {
    pending: "border-amber-400/30 bg-amber-400/10 text-amber-100",
    registered: "border-[#d9b265]/30 bg-[#d9b265]/10 text-[#f8edd7]",
    rejected: "border-rose-500/30 bg-rose-500/10 text-rose-100",
    withdrawn: "border-[#6a4c41] bg-[#140c0d] text-[#d8cbb7]",
  };

  return palette[status];
}

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
      <span className="mb-2 block text-sm font-medium text-[#e8dcc8]">{label}</span>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="mt-2 block text-xs leading-6 text-[#8f7e69]">
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
      <section className="rounded-[2rem] border border-amber-400/20 bg-[#0b0708]/75 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
          Area organizzazione
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
          Organizza tornei, gestisci iscrizioni e tieni tutto sotto controllo.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#d8cbb7]">
          Sei connesso come {session.user.email}. Da qui puoi aprire iscrizioni,
          aggiornare i roster, generare la fase torneo e seguire l&apos;andamento degli eventi.
        </p>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <form
          action={createTournamentAction}
          className="rounded-[2rem] border border-[#3a2621] bg-[#0b0708]/75 p-8 shadow-2xl shadow-black/20"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#bcae9a]">
                Nuovo torneo
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Crea un nuovo torneo
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label htmlFor="name" className="block">
                <span className="mb-2 block text-sm font-medium text-[#e8dcc8]">
                  Nome torneo
                </span>
                <input
                  id="name"
                  name="name"
                  required
                  placeholder="Spring Clash AoE4"
                  className="w-full rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                />
              </label>

              <label htmlFor="slug" className="block">
                <span className="mb-2 block text-sm font-medium text-[#e8dcc8]">
                  Slug URL
                </span>
                <input
                  id="slug"
                  name="slug"
                  placeholder="spring-clash"
                  className="w-full rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                />
              </label>
            </div>

            <label htmlFor="description" className="block">
              <span className="mb-2 block text-sm font-medium text-[#e8dcc8]">
                Descrizione
              </span>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Torneo community con bracket finale e conferma risultati a due step."
                className="w-full rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
            </label>

            <label htmlFor="bannerFile" className="block">
              <span className="mb-2 block text-sm font-medium text-[#e8dcc8]">
                Banner torneo
              </span>
              <input
                id="bannerFile"
                name="bannerFile"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
className="w-full rounded-2xl border border-dashed border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-[#e8dcc8] outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-amber-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#1a0d0c] hover:border-amber-300"
              />
              <span className="mt-2 block text-xs leading-6 text-[#8f7e69]">
                Carica un&apos;immagine orizzontale per la card e la pagina torneo. Formati supportati:
                PNG, JPG, WEBP o GIF, massimo 5 MB.
              </span>
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
                <span className="mb-2 block text-sm font-medium text-[#e8dcc8]">Best of</span>
                <input
                  id="bestOf"
                  name="bestOf"
                  type="number"
                  min={1}
                  step={2}
                  defaultValue={3}
                  className="w-full rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                />
              </label>

              <label htmlFor="minParticipants" className="block">
                <span className="mb-2 block text-sm font-medium text-[#e8dcc8]">
                  Min partecipanti
                </span>
                <input
                  id="minParticipants"
                  name="minParticipants"
                  type="number"
                  min={2}
                  defaultValue={2}
                  className="w-full rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                />
              </label>

              <label htmlFor="maxParticipants" className="block">
                <span className="mb-2 block text-sm font-medium text-[#e8dcc8]">
                  Max partecipanti
                </span>
                <input
                  id="maxParticipants"
                  name="maxParticipants"
                  type="number"
                  min={2}
                  defaultValue={8}
                  className="w-full rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                />
              </label>

              <label htmlFor="prizeSummary" className="block">
                <span className="mb-2 block text-sm font-medium text-[#e8dcc8]">
                  Premio
                </span>
                <input
                  id="prizeSummary"
                  name="prizeSummary"
                  placeholder="Badge + premio Discord"
                  className="w-full rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <label htmlFor="registrationsOpenAt" className="block">
                <span className="mb-2 block text-sm font-medium text-[#e8dcc8]">
                  Apertura iscrizioni
                </span>
                <input
                  id="registrationsOpenAt"
                  name="registrationsOpenAt"
                  type="datetime-local"
                  className="w-full rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                />
              </label>

              <label htmlFor="registrationsCloseAt" className="block">
                <span className="mb-2 block text-sm font-medium text-[#e8dcc8]">
                  Chiusura iscrizioni
                </span>
                <input
                  id="registrationsCloseAt"
                  name="registrationsCloseAt"
                  type="datetime-local"
                  className="w-full rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                />
              </label>

              <label htmlFor="startsAt" className="block">
                <span className="mb-2 block text-sm font-medium text-[#e8dcc8]">
                  Inizio torneo
                </span>
                <input
                  id="startsAt"
                  name="startsAt"
                  type="datetime-local"
                  className="w-full rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                />
              </label>
            </div>

            <label htmlFor="mapRules" className="block">
              <span className="mb-2 block text-sm font-medium text-[#e8dcc8]">
                Regole mappe / veto / civ
              </span>
              <textarea
                id="mapRules"
                name="mapRules"
                rows={3}
                placeholder="Map pool fisso, veto 1-1, no remake salvo crash entro 3 minuti."
                className="w-full rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
            </label>

            <label htmlFor="notes" className="block">
              <span className="mb-2 block text-sm font-medium text-[#e8dcc8]">
                Note organizzative
              </span>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Deadline round, policy no-show, canale Discord per scheduling."
                className="w-full rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
            </label>

            <label htmlFor="manualRoster" className="block">
              <span className="mb-2 block text-sm font-medium text-[#e8dcc8]">
                Roster manuale
              </span>
              <textarea
                id="manualRoster"
                name="manualRoster"
                rows={6}
                placeholder={"PlayerOne <player1@example.com>\nPlayerTwo <player2@example.com>\nPlayerThree"}
                className="w-full rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
              />
              <span className="mt-2 block text-xs leading-6 text-[#8f7e69]">
                Una riga per giocatore. Se inserisci anche l&apos;email, sara piu facile
                riconoscere il partecipante corretto.
              </span>
            </label>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="flex items-center gap-3 rounded-2xl border border-[#3a2621] bg-[#140c0d]/70 px-4 py-3 text-sm text-[#e8dcc8]">
                <input type="checkbox" name="requiresCheckIn" className="size-4" />
                Check-in obbligatorio
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-[#3a2621] bg-[#140c0d]/70 px-4 py-3 text-sm text-[#e8dcc8]">
                <input type="checkbox" name="requiresEvidence" className="size-4" />
                Prova risultato richiesta
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-[#3a2621] bg-[#140c0d]/70 px-4 py-3 text-sm text-[#e8dcc8]">
                <input type="checkbox" name="autoGenerateBracket" className="size-4" />
                Genera bracket subito se possibile
              </label>
            </div>

            <PendingSubmitButton
              idleLabel="Crea torneo"
              pendingLabel="Creazione torneo in corso..."
className="rounded-2xl bg-amber-400 px-5 py-4 text-sm font-semibold text-[#1a0d0c] transition hover:bg-amber-300"
            />
          </div>
        </form>

        <section className="rounded-[2rem] border border-[#3a2621] bg-[#0b0708]/75 p-8 shadow-2xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-[#bcae9a]">
            Guida rapida
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Cosa puoi fare da qui
          </h2>

          <div className="mt-6 space-y-4 text-sm leading-7 text-[#d8cbb7]">
            <div className="rounded-2xl border border-[#3a2621] bg-[#140c0d]/70 px-4 py-3">
              Creare nuovi tornei con formato, date e regole
            </div>
            <div className="rounded-2xl border border-[#3a2621] bg-[#140c0d]/70 px-4 py-3">
              Approvare iscrizioni e completare il roster
            </div>
            <div className="rounded-2xl border border-[#3a2621] bg-[#140c0d]/70 px-4 py-3">
              Aggiornare stato, seed e partecipanti
            </div>
            <div className="rounded-2xl border border-[#3a2621] bg-[#140c0d]/70 px-4 py-3">
              Generare il bracket quando tutto e pronto
            </div>
          </div>
        </section>
      </section>

      <section className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#bcae9a]">
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
                className="rounded-[2rem] border border-[#3a2621] bg-[#0b0708]/75 p-7 shadow-2xl shadow-black/20"
              >
                {tournament.banner_url ? (
                  <div className="mb-6 overflow-hidden rounded-[1.75rem] border border-[#3a2621]">
                    <img
                      src={tournament.banner_url}
                      alt={`Banner ${tournament.title}`}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                ) : null}

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
                  <div className="rounded-3xl border border-[#3a2621] bg-[#140c0d]/70 p-5">
                    <p className="text-xs uppercase tracking-[0.26em] text-[#8f7e69]">
                      Partecipanti
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {tournament.participant_count ?? 0}/{tournament.max_participants}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[#3a2621] bg-[#140c0d]/70 p-5">
                    <p className="text-xs uppercase tracking-[0.26em] text-[#8f7e69]">
                      Iscrizioni pending
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {tournament.pending_registrations ?? 0}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[#3a2621] bg-[#140c0d]/70 p-5">
                    <p className="text-xs uppercase tracking-[0.26em] text-[#8f7e69]">
                      Match generati
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {tournament.match_count ?? 0}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[#3a2621] bg-[#140c0d]/70 p-5">
                    <p className="text-xs uppercase tracking-[0.26em] text-[#8f7e69]">
                      Dettagli torneo
                    </p>
                    <div className="mt-3 space-y-1 text-sm text-[#e8dcc8]">
                      <p className="font-semibold text-white">
                        {tournament.participant_mode} â€¢ BO{tournament.best_of}
                      </p>
                      <p>Signup: {tournament.signup_mode.replaceAll("_", " ")}</p>
                      <p>Seeding: {tournament.seeding_mode.replaceAll("_", " ")}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <form action={updateTournamentStatusAction}>
                    <input type="hidden" name="tournamentId" value={tournament.id} />
                    <input type="hidden" name="slug" value={tournament.slug} />
                    <input type="hidden" name="status" value="registration_open" />
                    <PendingSubmitButton
                      idleLabel="Apri iscrizioni"
                      pendingLabel="Apertura iscrizioni..."
                      className="rounded-full border border-[#4b312a] px-4 py-2 text-sm font-semibold text-[#f5ecdc] transition hover:border-amber-300 hover:text-amber-200"
                    />
                  </form>

                  <form action={updateTournamentStatusAction}>
                    <input type="hidden" name="tournamentId" value={tournament.id} />
                    <input type="hidden" name="slug" value={tournament.slug} />
                    <input type="hidden" name="status" value="check_in" />
                    <PendingSubmitButton
                      idleLabel="Avvia check-in"
                      pendingLabel="Avvio check-in..."
                      className="rounded-full border border-[#4b312a] px-4 py-2 text-sm font-semibold text-[#f5ecdc] transition hover:border-amber-300 hover:text-amber-200"
                    />
                  </form>

                  <form action={updateTournamentStatusAction}>
                    <input type="hidden" name="tournamentId" value={tournament.id} />
                    <input type="hidden" name="slug" value={tournament.slug} />
                    <input type="hidden" name="status" value="seeding" />
                    <PendingSubmitButton
                      idleLabel="Passa al seeding"
                      pendingLabel="Aggiornamento seeding..."
                      className="rounded-full border border-[#4b312a] px-4 py-2 text-sm font-semibold text-[#f5ecdc] transition hover:border-amber-300 hover:text-amber-200"
                    />
                  </form>

                  <form action={updateTournamentStatusAction}>
                    <input type="hidden" name="tournamentId" value={tournament.id} />
                    <input type="hidden" name="slug" value={tournament.slug} />
                    <input type="hidden" name="status" value="paused" />
                    <PendingSubmitButton
                      idleLabel="Metti in pausa"
                      pendingLabel="Messa in pausa..."
                      className="rounded-full border border-[#4b312a] px-4 py-2 text-sm font-semibold text-[#f5ecdc] transition hover:border-amber-300 hover:text-amber-200"
                    />
                  </form>

                  <form action={generateBracketAction}>
                    <input type="hidden" name="tournamentId" value={tournament.id} />
                    <input type="hidden" name="slug" value={tournament.slug} />
                    <PendingSubmitButton
                      idleLabel="Genera fase / struttura"
                      pendingLabel="Generazione struttura..."
className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-[#1a0d0c] transition hover:bg-amber-300"
                    />
                  </form>
                </div>

                <div className="mt-8 grid gap-6 xl:grid-cols-3">
                  <div className="rounded-3xl border border-[#3a2621] bg-[#140c0d]/70 p-5">
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
                        className="w-full rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email opzionale"
                        className="w-full rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                      />
                      <PendingSubmitButton
                        idleLabel="Inserisci nel roster"
                        pendingLabel="Inserimento nel roster..."
                        className="w-full rounded-2xl border border-[#4b312a] px-4 py-3 text-sm font-semibold text-[#f5ecdc] transition hover:border-amber-300 hover:text-amber-200"
                      />
                    </form>
                  </div>

                  <div className="rounded-3xl border border-[#3a2621] bg-[#140c0d]/70 p-5">
                    <h4 className="text-lg font-semibold text-white">
                      Richieste in approvazione
                    </h4>
                    <div className="mt-4 space-y-3">
                      {tournament.pending_registration_entries?.length ? (
                        tournament.pending_registration_entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/70 p-4"
                          >
                            <p className="font-semibold text-white">
                              {entry.profile?.display_name ?? "Player"}
                            </p>
                            <p className="mt-1 text-sm text-[#bcae9a]">
                              {entry.profile?.email ?? "Partecipante manuale"}
                            </p>
                            <form action={approveRegistrationAction} className="mt-3">
                              <input type="hidden" name="tournamentId" value={tournament.id} />
                              <input type="hidden" name="slug" value={tournament.slug} />
                              <input type="hidden" name="registrationId" value={entry.id} />
                              <PendingSubmitButton
                                idleLabel="Approva iscrizione"
                                pendingLabel="Approvazione in corso..."
                className="rounded-full bg-[#b9855f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c9956c]"
                              />
                            </form>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm leading-7 text-[#bcae9a]">
                          Nessuna richiesta pending su questo torneo.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-[#3a2621] bg-[#140c0d]/70 p-5">
                    <h4 className="text-lg font-semibold text-white">
                      Controllo roster
                    </h4>
                    <div className="mt-4 space-y-3 text-sm leading-6 text-[#d8cbb7]">
                      <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/70 px-4 py-3">
                        Puoi cambiare stato, seed e rimuovere ogni partecipante del torneo.
                      </div>
                      <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/70 px-4 py-3">
                        Se il bracket e gia stato generato, alcune modifiche potrebbero richiedere piu attenzione.
                      </div>
                      <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/70 px-4 py-3">
                        I partecipanti aggiunti a mano restano modificabili in qualsiasi momento da questa pagina.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-[2rem] border border-[#3a2621] bg-[#140c0d]/60 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xl font-semibold text-white">
                        Partecipanti del torneo
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-[#bcae9a]">
                        Vista completa del roster: pending, registrati, respinti e ritirati.
                      </p>
                    </div>

                    <div className="rounded-full border border-[#4b312a] bg-[#0b0708]/80 px-4 py-2 text-sm text-[#d8cbb7]">
                      Totale roster: {tournament.participant_entries?.length ?? 0}
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {tournament.participant_entries?.length ? (
                      tournament.participant_entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-3xl border border-[#3a2621] bg-[#0b0708]/75 p-5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <p className="text-lg font-semibold text-white">
                                  {entry.profile?.display_name ?? "Player"}
                                </p>
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRegistrationTone(
                                    entry.status
                                  )}`}
                                >
                                  {registrationStatusLabels[entry.status]}
                                </span>
                                <span className="rounded-full border border-[#4b312a] px-3 py-1 text-xs font-semibold text-[#d8cbb7]">
                                  {entry.source === "manual" ? "Manuale" : "Signup"}
                                </span>
                              </div>

                              <div className="mt-2 space-y-1 text-sm text-[#bcae9a]">
                                <p>{entry.profile?.email ?? "Nessuna email collegata"}</p>
                                <p>
                                  Steam: {entry.profile?.steam_name ?? "n/d"} | Discord:{" "}
                                  {entry.profile?.discord_name ?? "n/d"}
                                </p>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-[#3a2621] bg-[#140c0d]/70 px-4 py-3 text-sm text-[#d8cbb7]">
                              Seed attuale:{" "}
                              <span className="font-semibold text-white">
                                {entry.seed ?? "Non assegnato"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.7fr_auto]">
                            <form
                              action={updateParticipantAction}
                              className="grid gap-3 md:grid-cols-[1fr_140px_auto]"
                            >
                              <input type="hidden" name="slug" value={tournament.slug} />
                              <input
                                type="hidden"
                                name="registrationId"
                                value={entry.id}
                              />
                              <select
                                name="status"
                                defaultValue={entry.status}
                                className="rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                              >
                                {participantStatusOptions.map((status) => (
                                  <option key={status} value={status}>
                                    {registrationStatusLabels[status]}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="number"
                                name="seed"
                                min={1}
                                defaultValue={entry.seed ?? ""}
                                placeholder="Seed"
                                className="rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                              />
                              <PendingSubmitButton
                                idleLabel="Aggiorna partecipante"
                                pendingLabel="Aggiornamento partecipante..."
                                className="rounded-2xl border border-amber-400/40 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:border-amber-300 hover:text-white"
                              />
                            </form>

                            {entry.status === "pending" ? (
                              <form action={approveRegistrationAction}>
                                <input
                                  type="hidden"
                                  name="tournamentId"
                                  value={tournament.id}
                                />
                                <input type="hidden" name="slug" value={tournament.slug} />
                                <input
                                  type="hidden"
                                  name="registrationId"
                                  value={entry.id}
                                />
                                <PendingSubmitButton
                                  idleLabel="Approva subito"
                                  pendingLabel="Approvazione in corso..."
                className="w-full rounded-2xl bg-[#b9855f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c9956c]"
                                />
                              </form>
                            ) : (
                              <div className="rounded-2xl border border-[#3a2621] bg-[#140c0d]/70 px-4 py-3 text-sm text-[#bcae9a]">
                                Puoi aggiornare lo stato del partecipante in qualsiasi momento.
                              </div>
                            )}

                            <form action={removeParticipantAction}>
                              <input type="hidden" name="slug" value={tournament.slug} />
                              <input
                                type="hidden"
                                name="registrationId"
                                value={entry.id}
                              />
                              <PendingSubmitButton
                                idleLabel="Rimuovi dal torneo"
                                pendingLabel="Rimozione in corso..."
                                className="rounded-2xl border border-rose-500/40 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:border-rose-400 hover:text-white"
                              />
                            </form>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-3xl border border-dashed border-[#4b312a] bg-[#0b0708]/60 p-6 text-sm leading-7 text-[#bcae9a]">
                        Nessun partecipante presente su questo torneo.
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[#4b312a] bg-[#0b0708]/70 p-10 text-center">
            <h3 className="text-2xl font-semibold text-white">
              Nessun torneo creato
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#bcae9a]">
              Usa il modulo qui sopra per pubblicare il primo torneo e iniziare a raccogliere iscrizioni.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

