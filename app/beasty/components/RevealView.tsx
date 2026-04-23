import ChatPanel from "./ChatPanel";
import { getPlayerBadge } from "../utils/getPlayerBadge";

type Room = {
  code: string;
};

type Question = {
  category: string;
  difficulty: string;
  text: string;
  options: string[];
};

type Reveal = {
  correctIndex: number;
};

type RoundResult = {
  playerId: string;
  playerName: string;
  selectedAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  totalScore: number;
};

type AnswerMarker = {
  playerId: string;
  playerName: string;
  answerIndex: number;
};

type ChatMessage = {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  createdAt: number;
};

export default function RevealView({
  room,
  question,
  reveal,
  roundResults,
  answerMarkers,
  multiplierBadge,
  isPaused,
  isHost,
  togglingPause,
  isResumeCountdownActive,
  resumeCountdownSeconds,
  pauseLabel,
  revealTimeLeft,
  revealTimerPercent,
  chatMessages,
  currentPlayerName,
  onSendChat,
  onPauseToggle,
}: {
  room: Room;
  question: Question;
  reveal: Reveal;
  roundResults: RoundResult[];
  answerMarkers: AnswerMarker[];
  multiplierBadge: string;
  isPaused: boolean;
  isHost: boolean;
  togglingPause: boolean;
  isResumeCountdownActive: boolean;
  resumeCountdownSeconds: number;
  pauseLabel: string;
  revealTimeLeft: number;
  revealTimerPercent: number;
  chatMessages: ChatMessage[];
  currentPlayerName: string;
  onSendChat: (text: string) => Promise<void>;
  onPauseToggle: () => Promise<void>;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="relative rounded-3xl border border-[#d9b265]/20 bg-[#140c0d]/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
        <div className="mb-6 rounded-3xl border border-[#d9b265]/20 bg-[#140c0d]/70 p-5 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f0d7a0]">
              {isResumeCountdownActive
                ? `Ripresa tra ${resumeCountdownSeconds}`
                : isPaused
                ? `${pauseLabel} Â· ${revealTimeLeft} secondi residui`
                : `Prossima domanda tra ${revealTimeLeft} secondi`}
            </div>

            {isHost ? (
              <button
                onClick={() => void onPauseToggle()}
                disabled={togglingPause || isResumeCountdownActive}
                className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isPaused
                    ? "border border-[#d9b265]/40 bg-[#d9b265]/10 text-[#f0d7a0] hover:bg-[#d9b265]/15"
                    : "border border-amber-400/40 bg-amber-400/10 text-amber-200 hover:bg-amber-400/15"
                }`}
              >
                {isPaused ? "Riprendi" : "Pausa"}
              </button>
            ) : null}
          </div>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-[#241618]">
            <div
              className={`h-full rounded-full transition-all ${
                isPaused ? "bg-amber-400" : "bg-[#d9b265]"
              }`}
              style={{ width: `${revealTimerPercent}%` }}
            />
          </div>
        </div>

        {isPaused ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-[#0b0708]/70 backdrop-blur-[2px]">
            <div className="rounded-3xl border border-amber-400/30 bg-[#0b0708]/90 px-8 py-6 text-center shadow-[0_0_30px_rgba(245,158,11,0.12)]">
              <div className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
                {pauseLabel}
              </div>
              <div className="mt-3 text-3xl font-black text-white">
                {revealTimeLeft}s
              </div>
              <p className="mt-2 text-sm text-[#d8cbb7]">
                In attesa che l&apos;host riprenda il quiz.
              </p>
            </div>
          </div>
        ) : null}

        {isResumeCountdownActive ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-black/75 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
                Ripresa partita
              </div>
              <div className="mt-4 text-7xl font-black text-white">
                {resumeCountdownSeconds}
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/50 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm uppercase tracking-[0.2em] text-[#f0d7a0]/80">
              {question.category}
            </p>
            <span className="rounded-full border border-[#aa221d]/30 bg-[#7f1517]/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#f2c7bd]">
              {question.difficulty}
            </span>
            <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
              {multiplierBadge} punteggio
            </span>
          </div>

          <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
            {question.text}
          </h2>
        </div>

        <div className="mt-6 space-y-3">
          {question.options.map((option, index) => {
            const markersForOption = answerMarkers.filter(
              (marker) => marker.answerIndex === index
            );

            return (
              <div
                key={option}
                className={`rounded-2xl border p-4 ${
                  index === reveal.correctIndex
                    ? "border-[#d9b265]/40 bg-[#d9b265]/10"
                    : "border-[#3a2621] bg-[#0b0708]/50"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="font-semibold text-white">
                    <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-sm text-amber-300">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </div>

                  {index === reveal.correctIndex ? (
                    <span className="rounded-full border border-[#d9b265]/30 bg-[#d9b265]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d7a0]">
                      Corretta
                    </span>
                  ) : null}
                </div>

                {markersForOption.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {markersForOption.map((marker) => (
                      <div
                        key={marker.playerId}
                        title={marker.playerName}
                        className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-[#4b312a] bg-[#241618] px-2 text-xs font-bold text-[#f5ecdc]"
                      >
                        {getPlayerBadge(marker.playerName)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-[#8f7e69]">
                    Nessun giocatore ha scelto questa risposta.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-[#d9b265]/20 bg-[#140c0d]/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
          <h3 className="text-lg font-bold text-white">Recap round</h3>

          <div className="mt-4 space-y-3">
            {roundResults.map((result) => (
              <div
                key={result.playerId}
                className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/50 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-white">
                    {result.playerName}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      result.isCorrect
                        ? "border border-[#d9b265]/30 bg-[#d9b265]/10 text-[#f0d7a0]"
                        : "border border-red-400/30 bg-red-500/10 text-red-300"
                    }`}
                  >
                    {result.isCorrect ? "Corretta" : "Sbagliata"}
                  </span>
                </div>

                <div className="mt-3 text-sm text-[#d8cbb7]">
                  Risposta:{" "}
                  <span className="font-semibold text-white">
                    {result.selectedAnswer}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-[#bcae9a]">Punti round</span>
                  <span className="font-semibold text-amber-300">
                    +{result.pointsEarned}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-[#bcae9a]">Totale</span>
                  <span className="font-semibold text-white">
                    {result.totalScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#d9b265]/20 bg-[#140c0d]/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
          <ChatPanel
            roomCode={room.code}
            currentPlayerName={currentPlayerName}
            messages={chatMessages}
            onSend={onSendChat}
            disabled={false}
          />
        </div>
      </div>
    </div>
  );
}

