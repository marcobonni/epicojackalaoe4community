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

type Player = {
  id: string;
  name: string;
  score: number;
  connected: boolean;
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

export default function QuestionView({
  room,
  question,
  sortedPlayers,
  answerMarkers,
  multiplierBadge,
  doublePoints,
  selectedAnswer,
  submittingAnswer,
  isPaused,
  isHost,
  togglingPause,
  isResumeCountdownActive,
  resumeCountdownSeconds,
  pauseLabel,
  timeLeft,
  timerPercent,
  chatMessages,
  currentPlayerName,
  onSendChat,
  onPauseToggle,
  onSubmitAnswer,
}: {
  room: Room;
  question: Question;
  sortedPlayers: Player[];
  answerMarkers: AnswerMarker[];
  multiplierBadge: string;
  doublePoints: boolean;
  selectedAnswer: number | null;
  submittingAnswer: boolean;
  isPaused: boolean;
  isHost: boolean;
  togglingPause: boolean;
  isResumeCountdownActive: boolean;
  resumeCountdownSeconds: number;
  pauseLabel: string;
  timeLeft: number;
  timerPercent: number;
  chatMessages: ChatMessage[];
  currentPlayerName: string;
  onSendChat: (text: string) => Promise<void>;
  onPauseToggle: () => Promise<void>;
  onSubmitAnswer: (answerIndex: number) => Promise<void>;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-3xl border border-amber-400/20 bg-slate-900/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                {question.category}
              </p>
              <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
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

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-200">
              Stanza {room.code}
            </div>

            {isHost ? (
              <button
                onClick={() => void onPauseToggle()}
                disabled={togglingPause || isResumeCountdownActive}
                className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isPaused
                    ? "border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                    : "border border-amber-400/40 bg-amber-400/10 text-amber-200 hover:bg-amber-400/15"
                }`}
              >
                {isPaused ? "Riprendi" : "Pausa"}
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {doublePoints ? (
            <div className="inline-flex rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
              Round a punti doppi
            </div>
          ) : null}

          {isPaused ? (
            <div className="inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              {pauseLabel}
            </div>
          ) : null}

          {isResumeCountdownActive ? (
            <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Ripresa tra {resumeCountdownSeconds}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-amber-400 transition-all"
              style={{ width: `${timerPercent}%` }}
            />
          </div>

          <div className="min-w-[90px] rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-center text-lg font-bold text-amber-300">
            {timeLeft}s
          </div>
        </div>

        <div className="relative mt-8">
          {isPaused ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-slate-950/70 backdrop-blur-[2px]">
              <div className="rounded-3xl border border-amber-400/30 bg-slate-950/90 px-8 py-6 text-center shadow-[0_0_30px_rgba(245,158,11,0.12)]">
                <div className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
                  {pauseLabel}
                </div>
                <div className="mt-3 text-3xl font-black text-white">
                  {timeLeft}s
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  Le risposte sono bloccate finché l&apos;host non riprende la
                  partita.
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

          <div className="grid gap-4 md:grid-cols-2">
            {question.options.map((opt, i) => {
              const markersForOption = answerMarkers.filter(
                (marker) => marker.answerIndex === i
              );

              return (
                <button
                  key={i}
                  className={`rounded-2xl border p-5 text-left text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    selectedAnswer === i
                      ? "border-amber-400/60 bg-amber-400/10 text-amber-100"
                      : "border-slate-700 bg-slate-950/60 text-slate-100 hover:border-amber-400/50 hover:bg-slate-800"
                  }`}
                  onClick={() => void onSubmitAnswer(i)}
                  disabled={
                    submittingAnswer ||
                    selectedAnswer !== null ||
                    timeLeft <= 0 ||
                    isPaused ||
                    isResumeCountdownActive
                  }
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-sm text-amber-300">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <div className="flex-1">
                      <div>{opt}</div>

                      {markersForOption.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {markersForOption.map((marker) => (
                            <div
                              key={marker.playerId}
                              title={marker.playerName}
                              className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-slate-600 bg-slate-800 px-2 text-[11px] font-bold text-slate-100"
                            >
                              {getPlayerBadge(marker.playerName)}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-bold text-white">Classifica live</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">
                    #{index + 1} {player.name}
                  </span>
                  <span className="text-amber-300">{player.score} pt</span>
                </div>
                <div className="mt-2 text-sm text-slate-400">
                  {player.connected ? "Connesso" : "Disconnesso"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-amber-400/20 bg-slate-900/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
        <ChatPanel
          roomCode={room.code}
          currentPlayerName={currentPlayerName}
          messages={chatMessages}
          onSend={onSendChat}
          disabled={false}
        />
      </div>
    </div>
  );
}