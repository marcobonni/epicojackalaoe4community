import ChatPanel from "./ChatPanel";

type Room = {
  code: string;
};

type FinalRound = {
  questionText: string;
  category: string;
  difficulty: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
};

type FinalResult = {
  playerId: string;
  playerName: string;
  finalScore: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  totalPointsEarned: number;
  avgResponseTimeMs: number;
  rounds: FinalRound[];
};

type ChatMessage = {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  createdAt: number;
};

export default function FinalResultsView({
  room,
  finalResults,
  isHost,
  currentPlayerName,
  chatMessages,
  onSendChat,
  onRematch,
  onExit,
}: {
  room: Room;
  finalResults: FinalResult[];
  isHost: boolean;
  currentPlayerName: string;
  chatMessages: ChatMessage[];
  onSendChat: (text: string) => Promise<void>;
  onRematch: () => Promise<void>;
  onExit: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-3xl border border-amber-400/20 bg-[#140c0d]/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {finalResults.map((result, index) => (
            <div
              key={result.playerId}
              className={`rounded-2xl border p-5 ${
                index === 0
                  ? "border-amber-300/40 bg-[linear-gradient(180deg,rgba(245,158,11,0.12),rgba(2,6,23,0.6))] shadow-[0_0_30px_rgba(245,158,11,0.12)]"
                  : "border-[#3a2621] bg-[#0b0708]/50"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                    {index === 0 ? "ðŸ† Vincitore" : `#${index + 1}`}
                  </div>
                  <div className="mt-1 text-xl font-black text-white">
                    {result.playerName}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-right">
                  <div className="text-xs uppercase tracking-[0.2em] text-amber-300/80">
                    Punteggio finale
                  </div>
                  <div className="text-2xl font-black text-amber-300">
                    {result.finalScore}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-[#3a2621] bg-[#140c0d]/70 p-3">
                  <div className="text-[#bcae9a]">Corrette</div>
                  <div className="mt-1 font-semibold text-[#f0d7a0]">
                    {result.correctAnswers}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#3a2621] bg-[#140c0d]/70 p-3">
                  <div className="text-[#bcae9a]">Sbagliate</div>
                  <div className="mt-1 font-semibold text-red-300">
                    {result.wrongAnswers}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#3a2621] bg-[#140c0d]/70 p-3">
                  <div className="text-[#bcae9a]">Accuratezza</div>
                  <div className="mt-1 font-semibold text-white">
                    {result.accuracy}%
                  </div>
                </div>
                <div className="rounded-2xl border border-[#3a2621] bg-[#140c0d]/70 p-3">
                  <div className="text-[#bcae9a]">Punti ottenuti</div>
                  <div className="mt-1 font-semibold text-amber-300">
                    {result.totalPointsEarned}
                  </div>
                </div>
                <div className="col-span-2 rounded-2xl border border-[#3a2621] bg-[#140c0d]/70 p-3">
                  <div className="text-[#bcae9a]">Tempo medio risposta</div>
                  <div className="mt-1 font-semibold text-[#f2c7bd]">
                    {(result.avgResponseTimeMs / 1000).toFixed(2)}s
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d8cbb7]">
                  Dettaglio round
                </div>

                <div className="mt-3 max-h-80 space-y-3 overflow-auto pr-1">
                  {result.rounds.map((round, roundIndex) => (
                    <div
                      key={`${result.playerId}-${roundIndex}`}
                      className="rounded-2xl border border-[#3a2621] bg-[#140c0d]/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm font-semibold text-white">
                          {round.questionText}
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                            round.isCorrect
                              ? "border border-[#d9b265]/30 bg-[#d9b265]/10 text-[#f0d7a0]"
                              : "border border-red-400/30 bg-red-500/10 text-red-300"
                          }`}
                        >
                          {round.isCorrect ? "Corretta" : "Sbagliata"}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full border border-[#4b312a] bg-[#241618] px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-[#d8cbb7]">
                          {round.category}
                        </span>
                        <span className="rounded-full border border-[#4b312a] bg-[#241618] px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-[#d8cbb7]">
                          {round.difficulty}
                        </span>
                      </div>

                      <div className="mt-3 text-sm text-[#d8cbb7]">
                        Risposta scelta:{" "}
                        <span className="font-semibold text-white">
                          {round.selectedAnswer}
                        </span>
                      </div>

                      {!round.isCorrect ? (
                        <div className="mt-1 text-sm text-[#bcae9a]">
                          Corretta:{" "}
                          <span className="font-semibold text-[#f0d7a0]">
                            {round.correctAnswer}
                          </span>
                        </div>
                      ) : null}

                      <div className="mt-2 text-sm text-[#bcae9a]">
                        Punti round:{" "}
                        <span className="font-semibold text-amber-300">
                          +{round.pointsEarned}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {isHost ? (
            <button
className="inline-flex items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/90 px-5 py-3 font-semibold text-[#1a0d0c] transition hover:bg-amber-400"
              onClick={() => void onRematch()}
            >
              Torna in lobby
            </button>
          ) : (
            <button
className="inline-flex items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/90 px-5 py-3 font-semibold text-[#1a0d0c] transition hover:bg-amber-400"
              onClick={onExit}
            >
              Esci
            </button>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-amber-400/20 bg-[#140c0d]/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
        <ChatPanel
          roomCode={room.code}
          currentPlayerName={currentPlayerName}
          messages={chatMessages}
          onSend={onSendChat}
        />
      </div>
    </div>
  );
}

