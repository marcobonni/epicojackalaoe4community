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

  const previousPhaseRef = useRef<string | null>(null);

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => b.score - a.score),
    [players]
  );

  const currentPlayer = useMemo(
    () =>
      room && players.find((player) => player.sessionId && player.id === room.hostId),
    [players, room]
  );

  const isHost = Boolean(currentPlayer);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedName = window.localStorage.getItem("beasty-player-name");
    const savedCode = window.localStorage.getItem("beasty-last-room-code");
    const savedCategories = window.localStorage.getItem("beasty-selected-categories");
    const savedTotalQuestions = window.localStorage.getItem(
      "beasty-total-questions"
    );

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

  const handleRematch = async () => {
    if (!room) return;

    setActionError(null);

    const response = (await requestRematch(room.code)) as {
      ok?: boolean;
      error?: string;
    };

    if (!response?.ok) {
      setActionError(response?.error ?? "Impossibile avviare la rivincita.");
    }
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

  const totalSeconds = question ? Math.ceil(question.durationMs / 1000) : 0;
  const remainingMs =
    question && startedAt
      ? Math.max(0, question.durationMs - (timerTick - startedAt))
      : 0;
  const timeLeft = Math.ceil(remainingMs / 1000);
  const timerPercent =
    question && question.durationMs > 0
      ? Math.max(0, (remainingMs / question.durationMs) * 100)
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
        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <div className="mb-10">
            <div className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              Partita conclusa
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
              Fine partita
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              Ecco la classifica finale della sfida.
            </p>
          </div>

          {actionError ? (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {actionError}
            </div>
          ) : null}

          <div className="rounded-3xl border border-amber-400/20 bg-slate-900/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                    {index === 0 ? "Vincitore della lobby" : "Sfida completata"}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                className="inline-flex items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/90 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
                onClick={handleRematch}
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
          <div className="mb-10">
            <div className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Reveal risposta
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
              Round concluso
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              Controlla subito la risposta corretta e guarda come cambia la
              classifica.
            </p>
          </div>

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

            <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-300/80">
                Risposta corretta
              </p>
              <div className="mt-3 text-2xl font-black text-emerald-200">
                {reveal.correctAnswer}
              </div>
            </div>

            <div className="mt-8">
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

            <div className="mt-6 text-sm text-slate-400">
              La prossima domanda partirà automaticamente tra pochi istanti.
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
          <div className="mb-10">
            <div className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              Party Game AoE4
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
              Who Wants to Be Beasty?
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              Sfida live in corso. Rispondi più velocemente degli altri e scala
              la classifica.
            </p>
          </div>

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
              {question.options.map((opt, i) => (
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
                  <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-sm text-amber-300">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              ))}
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
          <div className="mb-10">
            <div className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              Party Game AoE4
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
              Who Wants to Be Beasty?
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              Lobby privata pronta. Condividi il codice della stanza e attendi
              gli altri giocatori.
            </p>
          </div>

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

                <button
                  className="inline-flex items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/90 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleStartGame}
                >
                  Avvia partita
                </button>
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
                  Solo l'host può modificare le impostazioni.
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
        <div className="mb-10">
          <div className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
            Party Game AoE4
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
            Who Wants to Be Beasty?
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
            Crea una stanza, invita gli altri giocatori con un codice e
            sfidatevi a colpi di trivia su Age of Empires IV.
          </p>
        </div>

        {actionError ? (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {actionError}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-amber-400/20 bg-slate-900/70 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                <h2 className="text-lg font-bold text-white">Crea stanza</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Apri una lobby privata e condividi il codice con gli altri
                  giocatori.
                </p>

                <div className="mt-4 space-y-3">
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

              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                <h2 className="text-lg font-bold text-white">Entra con codice</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Inserisci il codice della lobby e unisciti subito alla partita.
                </p>

                <div className="mt-4 space-y-3">
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
                  Rejoin
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  Se rientri con lo stesso browser recuperi la tua sessione.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                <div className="text-sm uppercase tracking-[0.2em] text-amber-300/80">
                  Difficoltà
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  Le domande più difficili assegnano più punti.
                </p>
              </div>
            </div>
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