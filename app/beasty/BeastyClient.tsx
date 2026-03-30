"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useBeasty } from "@/app/lib/beasty/useBeasty";

const DEFAULT_CATEGORY_IDS = [
  "civilizations",
  "units",
  "landmarks",
  "buildings",
  "ages",
];
type LandingMode = "create" | "join" | null;

function getPlayerBadge(name: string) {
  const cleaned = name.trim();
  if (!cleaned) return "?";

  const parts = cleaned.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function HeroHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-10">
      <div className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
        Party Game AoE4
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() => {
            window.open("https://discord.com/users/240210612582481922", "_blank");
          }}
          className="inline-flex items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:border-amber-400/60 hover:bg-amber-400/15"
        >
          💬 Feedback
        </button>

        <button
          onClick={() => {
            window.localStorage.removeItem("beasty-landing-mode");
            window.location.href = "/";
          }}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-amber-400/50 hover:text-amber-300"
        >
          ← Home
        </button>
      </div>

      <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-5xl">
        {title}
      </h1>

      <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
        {description}
      </p>
    </div>
  );
}

export default function BeastyPage() {
  const {
    connected,
    room,
    question,
    players,
    createRoom,
    joinRoom,
    updateRoomSettings,
    startGame,
    submitAnswer,
    reveal,
    startedAt,
    gameFinished,
    doublePoints,
    difficultyMultiplier,
    requestRematch,
    categories,
    answerMarkers,
    roundResults,
    revealStartedAt,
    revealDurationMs,
    finalResults,
  } = useBeasty();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timerTick, setTimerTick] = useState(() => Date.now());
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    DEFAULT_CATEGORY_IDS
  );
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [savingSettings, setSavingSettings] = useState(false);
  const [landingMode, setLandingMode] = useState<LandingMode>(null);

  const previousPhaseRef = useRef<string | null>(null);

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => b.score - a.score),
    [players]
  );

  const currentPlayer = useMemo(
    () =>
      room &&
      players.find(
        (player) => player.name.trim().toLowerCase() === name.trim().toLowerCase()
      ),
    [players, room, name]
  );

  const isHost = Boolean(currentPlayer && room && currentPlayer.id === room.hostId);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedName = window.localStorage.getItem("beasty-player-name");
    const savedCode = window.localStorage.getItem("beasty-last-room-code");
    const savedCategories = window.localStorage.getItem("beasty-selected-categories");
    const savedTotalQuestions = window.localStorage.getItem(
      "beasty-total-questions"
    );
    const savedLandingMode = window.localStorage.getItem("beasty-landing-mode");

    if (savedName) setName(savedName);
    if (savedCode) setCode(savedCode);

    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedCategories(parsed);
        }
      } catch {}
    }

    if (savedTotalQuestions) {
      const parsed = Number(savedTotalQuestions);
      if (!Number.isNaN(parsed)) {
        setTotalQuestions(Math.max(5, Math.min(20, parsed)));
      }
    }

    if (savedLandingMode === "create" || savedLandingMode === "join") {
      setLandingMode(savedLandingMode);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("beasty-player-name", name);
  }, [name]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("beasty-last-room-code", code);
  }, [code]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "beasty-selected-categories",
      JSON.stringify(selectedCategories)
    );
  }, [selectedCategories]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("beasty-total-questions", String(totalQuestions));
  }, [totalQuestions]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (landingMode) {
      window.localStorage.setItem("beasty-landing-mode", landingMode);
    } else {
      window.localStorage.removeItem("beasty-landing-mode");
    }
  }, [landingMode]);

  useEffect(() => {
    if (!room?.settings) return;
    setSelectedCategories(room.settings.categories);
    setTotalQuestions(room.settings.totalQuestions);
  }, [room?.settings]);

  useEffect(() => {
    if (!question || !startedAt) {
      return;
    }

    const interval = setInterval(() => {
      setTimerTick(Date.now());
    }, 100);

    return () => clearInterval(interval);
  }, [question, startedAt]);

  useEffect(() => {
    if (!revealStartedAt || !revealDurationMs) {
      return;
    }

    const interval = setInterval(() => {
      setTimerTick(Date.now());
    }, 100);

    return () => clearInterval(interval);
  }, [revealStartedAt, revealDurationMs]);

  useEffect(() => {
    setSelectedAnswer(null);
    setSubmittingAnswer(false);
  }, [question?.id, room?.state]);

  useEffect(() => {
    const AudioCtx =
      window.AudioContext ||
      (window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;

    if (!AudioCtx) return;

    const playTone = (
      frequency: number,
      duration: number,
      type: OscillatorType = "sine",
      gainValue = 0.03
    ) => {
      const audioContext = new AudioCtx();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.value = gainValue;

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration / 1000);

      oscillator.onended = () => {
        void audioContext.close();
      };
    };

    let currentPhase = "home";

    if (room?.state === "question") currentPhase = "question";
    if (room?.state === "reveal") currentPhase = "reveal";
    if (room?.state === "finished" || gameFinished) currentPhase = "finished";

    if (previousPhaseRef.current !== currentPhase) {
      if (currentPhase === "question") {
        playTone(660, 120, "square");
      } else if (currentPhase === "reveal") {
        playTone(880, 140, "triangle");
      } else if (currentPhase === "finished") {
        playTone(523, 120, "sine");
        setTimeout(() => playTone(659, 120, "sine"), 140);
        setTimeout(() => playTone(784, 180, "sine"), 280);
      }
    }

    previousPhaseRef.current = currentPhase;
  }, [room?.state, gameFinished]);

  const handleCreateRoom = async () => {
    if (!name.trim()) return;

    setActionError(null);

    const response = (await createRoom(name.trim(), {
      categories: selectedCategories,
      totalQuestions,
    })) as {
      ok?: boolean;
      error?: string;
    };

    if (!response?.ok) {
      setActionError(response?.error ?? "Impossibile creare la stanza.");
    }
  };

  const handleJoinRoom = async () => {
    if (!name.trim() || !code.trim()) return;

    setActionError(null);

    const response = (await joinRoom(code.trim().toUpperCase(), name.trim())) as {
      ok?: boolean;
      error?: string;
    };

    if (!response?.ok) {
      setActionError(response?.error ?? "Impossibile entrare nella stanza.");
    }
  };

  const handleSaveSettings = async () => {
    if (!room) return;

    setActionError(null);
    setSavingSettings(true);

    const response = (await updateRoomSettings(room.code, {
      categories: selectedCategories,
      totalQuestions,
    })) as {
      ok?: boolean;
      error?: string;
    };

    if (!response?.ok) {
      setActionError(response?.error ?? "Impossibile salvare le impostazioni.");
    }

    setSavingSettings(false);
  };

  const handleStartGame = async () => {
    if (!room) return;

    setActionError(null);

    const response = (await startGame(room.code)) as {
      ok?: boolean;
      error?: string;
    };

    if (!response?.ok) {
      setActionError(response?.error ?? "Impossibile avviare la partita.");
    }
  };

  const handleSubmitAnswer = async (answerIndex: number) => {
    if (
      !room ||
      !question ||
      submittingAnswer ||
      selectedAnswer !== null ||
      reveal
    ) {
      return;
    }

    setSubmittingAnswer(true);
    setSelectedAnswer(answerIndex);
    setActionError(null);

    const response = (await submitAnswer(room.code, answerIndex, question.id)) as {
      ok?: boolean;
      error?: string;
    };

    if (!response?.ok) {
      setActionError(response?.error ?? "Impossibile inviare la risposta.");
      setSelectedAnswer(null);
    }

    setSubmittingAnswer(false);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        if (prev.length === 1) return prev;
        return prev.filter((entry) => entry !== categoryId);
      }

      return [...prev, categoryId];
    });
  };

  const remainingMs =
    question && startedAt
      ? Math.max(0, question.durationMs - (timerTick - startedAt))
      : 0;
  const timeLeft = Math.ceil(remainingMs / 1000);
  const timerPercent =
    question && question.durationMs > 0
      ? Math.max(0, (remainingMs / question.durationMs) * 100)
      : 0;

  const revealRemainingMs =
    revealStartedAt && revealDurationMs
      ? Math.max(0, revealDurationMs - (timerTick - revealStartedAt))
      : 0;
  const revealTimeLeft = Math.ceil(revealRemainingMs / 1000);
  const revealTimerPercent =
    revealDurationMs > 0
      ? Math.max(0, (revealRemainingMs / revealDurationMs) * 100)
      : 0;

  const multiplierBadge = `x${difficultyMultiplier}`;

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.10),transparent_30%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl border border-amber-400/20 bg-slate-900/70 px-8 py-10 text-center shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400" />
            <h2 className="text-2xl font-bold text-white">
              Connessione al server
            </h2>
            <p className="mt-2 text-slate-400">
              Sto preparando la lobby multiplayer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (room && gameFinished) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.10),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-12">
          <HeroHeader
            title="Riepilogo finale"
            description="Tutti i giocatori, tutti i risultati e il dettaglio completo della partita."
          />

          {actionError ? (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {actionError}
            </div>
          ) : null}

          <div className="rounded-3xl border border-amber-400/20 bg-slate-900/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
            <div className="grid gap-4 lg:grid-cols-3">
              {finalResults.map((result, index) => (
                <div
                  key={result.playerId}
                  className={`rounded-2xl border p-5 ${
                    index === 0
                      ? "border-amber-300/40 bg-[linear-gradient(180deg,rgba(245,158,11,0.12),rgba(2,6,23,0.6))] shadow-[0_0_30px_rgba(245,158,11,0.12)]"
                      : "border-slate-800 bg-slate-950/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                        {index === 0 ? "🏆 Vincitore" : `#${index + 1}`}
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
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                      <div className="text-slate-400">Corrette</div>
                      <div className="mt-1 font-semibold text-emerald-300">
                        {result.correctAnswers}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                      <div className="text-slate-400">Sbagliate</div>
                      <div className="mt-1 font-semibold text-red-300">
                        {result.wrongAnswers}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                      <div className="text-slate-400">Accuratezza</div>
                      <div className="mt-1 font-semibold text-white">
                        {result.accuracy}%
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                      <div className="text-slate-400">Punti ottenuti</div>
                      <div className="mt-1 font-semibold text-amber-300">
                        {result.totalPointsEarned}
                      </div>
                    </div>
                    <div className="col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                      <div className="text-slate-400">Tempo medio risposta</div>
                      <div className="mt-1 font-semibold text-cyan-300">
                        {(result.avgResponseTimeMs / 1000).toFixed(2)}s
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                      Dettaglio round
                    </div>

                    <div className="mt-3 max-h-80 space-y-3 overflow-auto pr-1">
                      {result.rounds.map((round, roundIndex) => (
                        <div
                          key={`${result.playerId}-${roundIndex}`}
                          className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="text-sm font-semibold text-white">
                              {round.questionText}
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                                round.isCorrect
                                  ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                                  : "border border-red-400/30 bg-red-500/10 text-red-300"
                              }`}
                            >
                              {round.isCorrect ? "Corretta" : "Sbagliata"}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
                              {round.category}
                            </span>
                            <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
                              {round.difficulty}
                            </span>
                          </div>

                          <div className="mt-3 text-sm text-slate-300">
                            Risposta scelta:{" "}
                            <span className="font-semibold text-white">
                              {round.selectedAnswer}
                            </span>
                          </div>

                          {!round.isCorrect ? (
                            <div className="mt-1 text-sm text-slate-400">
                              Corretta:{" "}
                              <span className="font-semibold text-emerald-300">
                                {round.correctAnswer}
                              </span>
                            </div>
                          ) : null}

                          <div className="mt-2 text-sm text-slate-400">
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
              <button
                className="inline-flex items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/90 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
                onClick={() => {
                  window.localStorage.removeItem("beasty-landing-mode");
                  window.location.reload();
                }}
              >
                Torna in lobby
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (room && room.state === "reveal" && question && reveal) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.10),transparent_30%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <HeroHeader
            title="Round concluso"
            description="Risposta corretta, scelte dei giocatori e punti ottenuti in questo round."
          />

          <div className="mb-6 rounded-3xl border border-emerald-400/20 bg-slate-900/70 p-5 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Prossima domanda tra {revealTimeLeft} secondi
              </div>
            </div>

            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all"
                style={{ width: `${revealTimerPercent}%` }}
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-3xl border border-emerald-400/20 bg-slate-900/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm uppercase tracking-[0.2em] text-emerald-300/80">
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
                          ? "border-emerald-400/40 bg-emerald-500/10"
                          : "border-slate-800 bg-slate-950/50"
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
                          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
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
                              className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800 px-2 text-xs font-bold text-slate-100"
                            >
                              {getPlayerBadge(marker.playerName)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 text-sm text-slate-500">
                          Nessun giocatore ha scelto questa risposta.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-400/20 bg-slate-900/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
              <h3 className="text-lg font-bold text-white">Recap round</h3>

              <div className="mt-4 space-y-3">
                {roundResults.map((result) => (
                  <div
                    key={result.playerId}
                    className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-white">
                        {result.playerName}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                          result.isCorrect
                            ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                            : "border border-red-400/30 bg-red-500/10 text-red-300"
                        }`}
                      >
                        {result.isCorrect ? "Corretta" : "Sbagliata"}
                      </span>
                    </div>

                    <div className="mt-3 text-sm text-slate-300">
                      Risposta:{" "}
                      <span className="font-semibold text-white">
                        {result.selectedAnswer}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-slate-400">Punti round</span>
                      <span className="font-semibold text-amber-300">
                        +{result.pointsEarned}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span className="text-slate-400">Totale</span>
                      <span className="font-semibold text-white">
                        {result.totalScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (room && question) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.10),transparent_30%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <HeroHeader
            title="Who Wants to Be Beasty?"
            description="Sfida live i tuoi amici. Rispondi più velocemente degli altri e scala la classifica."
          />

          {actionError ? (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {actionError}
            </div>
          ) : null}

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

              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-200">
                Stanza {room.code}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {doublePoints ? (
                <div className="inline-flex rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-300">
                  Round a punti doppi
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

              <div className="min-w-[70px] rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-center text-lg font-bold text-amber-300">
                {timeLeft}s
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
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
                    onClick={() => handleSubmitAnswer(i)}
                    disabled={
                      submittingAnswer ||
                      selectedAnswer !== null ||
                      timeLeft <= 0
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
        </div>
      </div>
    );
  }

  if (room) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.10),transparent_30%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <HeroHeader
            title="Who Wants to Be Beasty?"
            description="Lobby privata pronta. Condividi il codice della stanza e attendi gli altri giocatori."
          />

          {actionError ? (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {actionError}
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-3xl border border-amber-400/20 bg-slate-900/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
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
                    onClick={handleStartGame}
                  >
                    Avvia partita
                  </button>
                ) : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-400">
                    In attesa che l&apos;host avvii la partita.
                  </div>
                )}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                      <span className="font-semibold text-white">
                        {player.name}
                      </span>

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
                      <span className="font-semibold text-slate-200">
                        {player.score}
                      </span>
                    </div>

                    {player.id === room.hostId ? (
                      <div className="mt-2 text-xs uppercase tracking-[0.2em] text-amber-300">
                        Host
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
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
                        onChange={() => toggleCategory(category.id)}
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
                  onChange={(e) => setTotalQuestions(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
                <div className="mt-2 text-sm text-slate-400">
                  {totalQuestions} domande
                </div>
              </div>

              {isHost ? (
                <button
                  className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 font-semibold text-slate-100 transition hover:bg-slate-700 disabled:opacity-50"
                  onClick={handleSaveSettings}
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.10),transparent_30%)]" />
      <div className="relative mx-auto max-w-6xl px-6 py-12">
        <HeroHeader
          title="Who Wants to Be Beasty?"
          description="Crea una stanza oppure unisciti a una lobby esistente e sfidatevi a colpi di trivia su Age of Empires IV."
        />

        {actionError ? (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {actionError}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-amber-400/20 bg-slate-900/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
            {!landingMode ? (
              <div>
                <div className="grid gap-6 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActionError(null);
                      setLandingMode("create");
                    }}
                    className="group rounded-3xl border border-amber-400/20 bg-slate-950/40 p-6 text-left transition hover:border-amber-400/40 hover:bg-slate-900/70"
                  >
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-2xl text-amber-300">
                      +
                    </div>
                    <h2 className="mt-5 text-2xl font-black text-white">
                      Crea stanza
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      Apri una nuova lobby privata, scegli le categorie e invita
                      gli altri giocatori con un codice.
                    </p>
                    <div className="mt-5 text-sm font-semibold text-amber-300 transition group-hover:text-amber-200">
                      Vai alla creazione →
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionError(null);
                      setLandingMode("join");
                    }}
                    className="group rounded-3xl border border-slate-800 bg-slate-950/40 p-6 text-left transition hover:border-amber-400/40 hover:bg-slate-900/70"
                  >
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-2xl text-amber-300">
                      →
                    </div>
                    <h2 className="mt-5 text-2xl font-black text-white">
                      Unisciti a una stanza
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      Inserisci il codice della lobby ed entra subito nella
                      partita con gli altri giocatori.
                    </p>
                    <div className="mt-5 text-sm font-semibold text-amber-300 transition group-hover:text-amber-200">
                      Vai all’ingresso →
                    </div>
                  </button>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                    <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                      Lobby private
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
                      Ogni partita vive in una stanza dedicata con codice condivisibile.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                    <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                      Risposte visibili
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
                      Quando un giocatore risponde, compare la sua icona sotto la scelta fatta.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                    <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                      Riepilogo finale
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
                      A fine partita vedi statistiche complete e dettagli per ogni giocatore.
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
                    <p className="mt-2 text-sm text-slate-400">
                      Scegli il tuo nome e crea subito una lobby privata.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setLandingMode(null)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    ← Indietro
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                  <div className="space-y-3">
                    <input
                      placeholder="Nome giocatore"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20"
                    />

                    <button
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/90 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={handleCreateRoom}
                      disabled={!name.trim()}
                    >
                      Crea stanza
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                    <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                      Host
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
                      Sarai tu a far partire la partita e a gestire le impostazioni.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                    <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                      Codice lobby
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
                      Il server genererà automaticamente un codice da condividere.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                    <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                      Categorie
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
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
                    <p className="mt-2 text-sm text-slate-400">
                      Inserisci il tuo nome e il codice stanza per entrare subito.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setLandingMode(null)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    ← Indietro
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                  <div className="space-y-3">
                    <input
                      placeholder="Nome giocatore"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20"
                    />

                    <input
                      placeholder="Codice stanza"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20"
                    />

                    <button
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 font-semibold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={handleJoinRoom}
                      disabled={!name.trim() || !code.trim()}
                    >
                      Entra nella stanza
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                    <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                      Accesso rapido
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
                      Ti basta il codice lobby per entrare direttamente in partita.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                    <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                      Rejoin
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
                      Se eri già nella stanza, puoi rientrare con la tua sessione.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                    <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                      Subito pronto
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
                      Una volta dentro vedrai la lobby e aspetterai l’avvio dell’host.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-amber-400/20 bg-slate-900/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
            <h3 className="text-xl font-bold text-white">Categorie iniziali</h3>
            <p className="mt-2 text-sm text-slate-400">
              Queste impostazioni verranno usate quando crei una nuova stanza.
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
                      onChange={() => toggleCategory(category.id)}
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
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
              <div className="mt-2 text-sm text-slate-400">
                {totalQuestions} domande
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-4 text-sm text-slate-300">
              <div className="font-semibold text-white">Moltiplicatori difficoltà</div>
              <div className="mt-2 space-y-1">
                <div>Easy → x1</div>
                <div>Medium → x1.5</div>
                <div>Hard → x2</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}