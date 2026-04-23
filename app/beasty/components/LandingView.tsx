type LandingMode = "create" | "join" | null;

type Category = {
  id: string;
  label: string;
};

export default function LandingView({
  landingMode,
  setLandingMode,
  name,
  setName,
  code,
  setCode,
  categories,
  selectedCategories,
  totalQuestions,
  onToggleCategory,
  onTotalQuestionsChange,
  onCreateRoom,
  onJoinRoom,
}: {
  landingMode: LandingMode;
  setLandingMode: (mode: LandingMode) => void;
  name: string;
  setName: (value: string) => void;
  code: string;
  setCode: (value: string) => void;
  categories: Category[];
  selectedCategories: string[];
  totalQuestions: number;
  onToggleCategory: (categoryId: string) => void;
  onTotalQuestionsChange: (value: number) => void;
  onCreateRoom: () => Promise<void>;
  onJoinRoom: () => Promise<void>;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-3xl border border-amber-400/20 bg-[#140c0d]/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
        {!landingMode ? (
          <div>
            <div className="grid gap-6 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setLandingMode("create")}
                className="group rounded-3xl border border-amber-400/20 bg-[#0b0708]/40 p-6 text-left transition hover:border-amber-400/40 hover:bg-[#140c0d]/70"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-2xl text-amber-300">
                  +
                </div>
                <h2 className="mt-5 text-2xl font-black text-white">
                  Crea stanza
                </h2>
                <p className="mt-2 text-sm text-[#bcae9a]">
                  Apri una nuova lobby privata, scegli le categorie e invita gli
                  altri giocatori con un codice.
                </p>
                <div className="mt-5 text-sm font-semibold text-amber-300 transition group-hover:text-amber-200">
                  Vai alla creazione â†’
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLandingMode("join")}
                className="group rounded-3xl border border-[#3a2621] bg-[#0b0708]/40 p-6 text-left transition hover:border-amber-400/40 hover:bg-[#140c0d]/70"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-2xl text-amber-300">
                  â†’
                </div>
                <h2 className="mt-5 text-2xl font-black text-white">
                  Unisciti a una stanza
                </h2>
                <p className="mt-2 text-sm text-[#bcae9a]">
                  Inserisci il codice della lobby ed entra subito nella partita con
                  gli altri giocatori.
                </p>
                <div className="mt-5 text-sm font-semibold text-amber-300 transition group-hover:text-amber-200">
                  Vai allâ€™ingresso â†’
                </div>
              </button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/40 p-5">
                <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                  Lobby private
                </div>
                <p className="mt-3 text-sm text-[#d8cbb7]">
                  Ogni partita vive in una stanza dedicata con codice condivisibile.
                </p>
              </div>

              <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/40 p-5">
                <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                  Risposte visibili
                </div>
                <p className="mt-3 text-sm text-[#d8cbb7]">
                  Quando un giocatore risponde, compare la sua icona sotto la scelta
                  fatta.
                </p>
              </div>

              <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/40 p-5">
                <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                  Riepilogo finale
                </div>
                <p className="mt-3 text-sm text-[#d8cbb7]">
                  A fine partita vedi statistiche complete e dettagli per ogni
                  giocatore.
                </p>
              </div>
            </div>
          </div>
        ) : landingMode === "create" ? (
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                  Creazione lobby
                </div>
                <h2 className="mt-2 text-3xl font-black text-white">
                  Crea una nuova stanza
                </h2>
                <p className="mt-2 text-sm text-[#bcae9a]">
                  Scegli il tuo nome e crea subito una lobby privata.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setLandingMode(null)}
                className="inline-flex items-center justify-center rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-2 text-sm font-semibold text-[#e8dcc8] transition hover:bg-[#241618]"
              >
                â† Indietro
              </button>
            </div>

            <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/40 p-5">
              <div className="space-y-3">
                <input
                  placeholder="Nome giocatore"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-[#4b312a] bg-[#0b0708]/70 px-4 py-3 text-[#f5ecdc] outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20"
                />

                <button
className="inline-flex w-full items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/90 px-5 py-3 font-semibold text-[#1a0d0c] transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => void onCreateRoom()}
                  disabled={!name.trim()}
                >
                  Crea stanza
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/40 p-5">
                <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                  Host
                </div>
                <p className="mt-3 text-sm text-[#d8cbb7]">
                  Sarai tu a far partire la partita e a gestire le impostazioni.
                </p>
              </div>

              <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/40 p-5">
                <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                  Codice lobby
                </div>
                <p className="mt-3 text-sm text-[#d8cbb7]">
                  Il server genererÃ  automaticamente un codice da condividere.
                </p>
              </div>

              <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/40 p-5">
                <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                  Categorie
                </div>
                <p className="mt-3 text-sm text-[#d8cbb7]">
                  Le impostazioni qui a destra verranno usate nella nuova stanza.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                  Ingresso lobby
                </div>
                <h2 className="mt-2 text-3xl font-black text-white">
                  Unisciti a una stanza
                </h2>
                <p className="mt-2 text-sm text-[#bcae9a]">
                  Inserisci il tuo nome e il codice stanza per entrare subito.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setLandingMode(null)}
                className="inline-flex items-center justify-center rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-2 text-sm font-semibold text-[#e8dcc8] transition hover:bg-[#241618]"
              >
                â† Indietro
              </button>
            </div>

            <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/40 p-5">
              <div className="space-y-3">
                <input
                  placeholder="Nome giocatore"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-[#4b312a] bg-[#0b0708]/70 px-4 py-3 text-[#f5ecdc] outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20"
                />

                <input
                  placeholder="Codice stanza"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full rounded-2xl border border-[#4b312a] bg-[#0b0708]/70 px-4 py-3 text-[#f5ecdc] outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20"
                />

                <button
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-[#4b312a] bg-[#241618] px-5 py-3 font-semibold text-[#f5ecdc] transition hover:bg-[#4b312a] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => void onJoinRoom()}
                  disabled={!name.trim() || !code.trim()}
                >
                  Entra nella stanza
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/40 p-5">
                <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                  Accesso rapido
                </div>
                <p className="mt-3 text-sm text-[#d8cbb7]">
                  Ti basta il codice lobby per entrare direttamente in partita.
                </p>
              </div>

              <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/40 p-5">
                <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                  Rejoin
                </div>
                <p className="mt-3 text-sm text-[#d8cbb7]">
                  Se eri giÃ  nella stanza, puoi rientrare con la tua sessione.
                </p>
              </div>

              <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/40 p-5">
                <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                  Subito pronto
                </div>
                <p className="mt-3 text-sm text-[#d8cbb7]">
                  Una volta dentro vedrai la lobby e aspetterai lâ€™avvio dellâ€™host.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-amber-400/20 bg-[#140c0d]/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
          <h3 className="text-xl font-bold text-white">Categorie iniziali</h3>
          <p className="mt-2 text-sm text-[#bcae9a]">
            Queste impostazioni verranno usate quando crei una nuova stanza.
          </p>

          <div className="mt-6 space-y-3">
            {categories.map((category) => {
              const checked = selectedCategories.includes(category.id);

              return (
                <label
                  key={category.id}
                  className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#3a2621] bg-[#0b0708]/40 px-4 py-3"
                >
                  <span className="text-sm font-semibold text-[#f5ecdc]">
                    {category.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleCategory(category.id)}
                    className="h-4 w-4 accent-amber-400"
                  />
                </label>
              );
            })}
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-[#e8dcc8]">
              Numero domande
            </label>
            <input
              type="range"
              min={5}
              max={20}
              step={1}
              value={totalQuestions}
              onChange={(e) => onTotalQuestionsChange(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
            <div className="mt-2 text-sm text-[#bcae9a]">
              {totalQuestions} domande
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#3a2621] bg-[#0b0708]/40 px-4 py-4 text-sm text-[#d8cbb7]">
            <div className="font-semibold text-white">Moltiplicatori difficoltÃ </div>
            <div className="mt-2 space-y-1">
              <div>Easy â†’ x1</div>
              <div>Medium â†’ x1.5</div>
              <div>Hard â†’ x2</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
