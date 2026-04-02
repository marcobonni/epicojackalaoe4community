import ChatPanel from "./ChatPanel";

type Player = {
  id: string;
  name: string;
  score: number;
  connected: boolean;
};

type Category = {
  id: string;
  label: string;
};

type Room = {
  code: string;
  hostId: string;
};

type ChatMessage = {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  createdAt: number;
};

export default function LobbyView({
  room,
  players,
  categories,
  selectedCategories,
  totalQuestions,
  savingSettings,
  isHost,
  currentPlayerName,
  chatMessages,
  onSendChat,
  onStartGame,
  onSaveSettings,
  onToggleCategory,
  onTotalQuestionsChange,
}: {
  room: Room;
  players: Player[];
  categories: Category[];
  selectedCategories: string[];
  totalQuestions: number;
  savingSettings: boolean;
  isHost: boolean;
  currentPlayerName: string;
  chatMessages: ChatMessage[];
  onSendChat: (text: string) => Promise<void>;
  onStartGame: () => Promise<void>;
  onSaveSettings: () => Promise<void>;
  onToggleCategory: (categoryId: string) => void;
  onTotalQuestionsChange: (value: number) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6 rounded-3xl border border-amber-400/20 bg-slate-900/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
              Lobby attiva
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              Stanza {room.code}
            </h2>
          </div>

          {isHost ? (
            <button
              className="inline-flex items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/90 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => void onStartGame()}
            >
              Avvia partita
            </button>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-400">
              In attesa che l&apos;host avvii la partita.
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <div
              key={player.id}
              className={`rounded-2xl border p-4 ${
                player.id === room.hostId
                  ? "border-amber-400/30 bg-amber-400/10"
                  : "border-slate-800 bg-slate-950/50"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-white">{player.name}</span>

                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    player.connected
                      ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                      : "border border-slate-700 bg-slate-800 text-slate-300"
                  }`}
                >
                  {player.connected ? "online" : "offline"}
                </span>
              </div>

              <div className="mt-3 text-sm text-slate-400">
                Punti:{" "}
                <span className="font-semibold text-slate-200">{player.score}</span>
              </div>

              {player.id === room.hostId ? (
                <div className="mt-2 text-xs uppercase tracking-[0.2em] text-amber-300">
                  Host
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <ChatPanel
          roomCode={room.code}
          currentPlayerName={currentPlayerName}
          messages={chatMessages}
          onSend={onSendChat}
        />
      </div>

      <div className="rounded-3xl border border-amber-400/20 bg-slate-900/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
        <h3 className="text-xl font-bold text-white">Impostazioni</h3>
        <p className="mt-2 text-sm text-slate-400">
          Le categorie selezionate decidono il pool di domande.
        </p>

        <div className="mt-6 space-y-3">
          {categories.map((category) => {
            const checked = selectedCategories.includes(category.id);

            return (
              <label
                key={category.id}
                className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3"
              >
                <span className="text-sm font-semibold text-slate-100">
                  {category.label}
                </span>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!isHost}
                  onChange={() => onToggleCategory(category.id)}
                  className="h-4 w-4 accent-amber-400"
                />
              </label>
            );
          })}
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            Numero domande
          </label>
          <input
            type="range"
            min={5}
            max={20}
            step={1}
            value={totalQuestions}
            disabled={!isHost}
            onChange={(e) => onTotalQuestionsChange(Number(e.target.value))}
            className="w-full accent-amber-400"
          />
          <div className="mt-2 text-sm text-slate-400">{totalQuestions} domande</div>
        </div>

        {isHost ? (
          <button
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 font-semibold text-slate-100 transition hover:bg-slate-700 disabled:opacity-50"
            onClick={() => void onSaveSettings()}
            disabled={savingSettings}
          >
            Salva impostazioni
          </button>
        ) : (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-400">
            Solo l&apos;host può modificare le impostazioni.
          </div>
        )}
      </div>
    </div>
  );
}