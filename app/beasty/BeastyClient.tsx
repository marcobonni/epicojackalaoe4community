"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useBeasty } from "@/app/lib/beasty/useBeasty";
import HeroHeader from "./components/HeroHeader";
import LobbyView from "./components/LobbyView";
import QuestionView from "./components/QuestionView";
import RevealView from "./components/RevealView";
import FinalResultsView from "./components/FinalResultView";
import LandingView from "./components/LandingView";

const DEFAULT_CATEGORY_IDS = [
  "civilizations",
  "units",
  "landmarks",
  "buildings",
  "ages",
];

type LandingMode = "create" | "join" | null;

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
    pauseGame,
    resumeGame,
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
    isPaused,
    remainingMs,
    timerPhase,
    resumeCountdownAt,
    chatMessages,
    sendChatMessage,
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
  const [togglingPause, setTogglingPause] = useState(false);

  const previousPhaseRef = useRef<string | null>(null);
  const previousResumeSecondRef = useRef<number | null>(null);

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
    const shouldTickQuestion =
      room?.state === "question" && question && startedAt && !isPaused;
    const shouldTickReveal =
      room?.state === "reveal" && revealStartedAt && revealDurationMs && !isPaused;
    const shouldTickResumeCountdown = Boolean(resumeCountdownAt);

    if (!shouldTickQuestion && !shouldTickReveal && !shouldTickResumeCountdown) {
      return;
    }

    const interval = setInterval(() => {
      setTimerTick(Date.now());
    }, 100);

    return () => clearInterval(interval);
  }, [
    room?.state,
    question,
    startedAt,
    revealStartedAt,
    revealDurationMs,
    isPaused,
    resumeCountdownAt,
  ]);

  useEffect(() => {
    setSelectedAnswer(null);
    setSubmittingAnswer(false);
  }, [question?.id, room?.state]);

  useEffect(() => {
    setTogglingPause(false);
  }, [isPaused, room?.state, resumeCountdownAt]);

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

    if (room?.state === "question") currentPhase = isPaused ? "paused" : "question";
    if (room?.state === "reveal") currentPhase = isPaused ? "paused" : "reveal";
    if (room?.state === "finished" || gameFinished) currentPhase = "finished";

    if (previousPhaseRef.current !== currentPhase) {
      if (currentPhase === "question") {
        playTone(660, 120, "square");
      } else if (currentPhase === "reveal") {
        playTone(880, 140, "triangle");
      } else if (currentPhase === "paused") {
        playTone(440, 120, "sine");
      } else if (currentPhase === "finished") {
        playTone(523, 120, "sine");
        setTimeout(() => playTone(659, 120, "sine"), 140);
        setTimeout(() => playTone(784, 180, "sine"), 280);
      }
    }

    previousPhaseRef.current = currentPhase;
  }, [room?.state, gameFinished, isPaused]);

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
      gainValue = 0.04
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

    if (!resumeCountdownAt) {
      previousResumeSecondRef.current = null;
      return;
    }

    const remainingCountdownMs = Math.max(0, resumeCountdownAt - timerTick);
    const seconds = Math.ceil(remainingCountdownMs / 1000);

    if (remainingCountdownMs <= 0) {
      if (previousResumeSecondRef.current !== 0) {
        playTone(900, 180, "triangle", 0.05);
        setTimeout(() => playTone(1200, 180, "triangle", 0.05), 120);
      }
      previousResumeSecondRef.current = 0;
      return;
    }

    if (previousResumeSecondRef.current !== seconds) {
      playTone(520 + seconds * 80, 120, "square", 0.04);
      previousResumeSecondRef.current = seconds;
    }
  }, [resumeCountdownAt, timerTick]);

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

  const handlePauseToggle = async () => {
    if (!room || !isHost || togglingPause || resumeCountdownAt) return;

    setActionError(null);
    setTogglingPause(true);

    const response = (await (isPaused
      ? resumeGame(room.code)
      : pauseGame(room.code))) as {
      ok?: boolean;
      error?: string;
    };

    if (!response?.ok) {
      setActionError(
        response?.error ??
          (isPaused
            ? "Impossibile riprendere la partita."
            : "Impossibile mettere in pausa la partita.")
      );
      setTogglingPause(false);
    }
  };

  const handleSubmitAnswer = async (answerIndex: number) => {
    if (
      !room ||
      !question ||
      submittingAnswer ||
      selectedAnswer !== null ||
      reveal ||
      isPaused ||
      resumeCountdownAt
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
    if (!room || !isHost) return;

    setActionError(null);

    const response = (await requestRematch(room.code)) as {
      ok?: boolean;
      error?: string;
    };

    if (!response?.ok) {
      setActionError(response?.error ?? "Impossibile tornare in lobby.");
      return;
    }

    setSelectedAnswer(null);
    setSubmittingAnswer(false);
  };

  const handleSendChat = async (text: string) => {
    if (!room) return;

    const response = (await sendChatMessage(room.code, text)) as {
      ok?: boolean;
      error?: string;
    };

    if (!response?.ok) {
      setActionError(response?.error ?? "Impossibile inviare il messaggio.");
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

  const computedQuestionRemainingMs =
    question && startedAt
      ? Math.max(0, question.durationMs - (timerTick - startedAt))
      : 0;

  const activeQuestionRemainingMs =
    room?.state === "question"
      ? typeof remainingMs === "number"
        ? remainingMs
        : computedQuestionRemainingMs
      : 0;

  const timeLeft = Math.ceil(activeQuestionRemainingMs / 1000);
  const timerPercent =
    question && question.durationMs > 0
      ? Math.max(0, (activeQuestionRemainingMs / question.durationMs) * 100)
      : 0;

  const computedRevealRemainingMs =
    revealStartedAt && revealDurationMs
      ? Math.max(0, revealDurationMs - (timerTick - revealStartedAt))
      : 0;

  const activeRevealRemainingMs =
    room?.state === "reveal"
      ? typeof remainingMs === "number"
        ? remainingMs
        : computedRevealRemainingMs
      : 0;

  const revealTimeLeft = Math.ceil(activeRevealRemainingMs / 1000);
  const revealTimerPercent =
    revealDurationMs > 0
      ? Math.max(0, (activeRevealRemainingMs / revealDurationMs) * 100)
      : 0;

  const resumeCountdownRemainingMs = resumeCountdownAt
    ? Math.max(0, resumeCountdownAt - timerTick)
    : 0;
  const resumeCountdownSeconds = Math.ceil(resumeCountdownRemainingMs / 1000);
  const isResumeCountdownActive = Boolean(
    resumeCountdownAt && resumeCountdownRemainingMs > 0
  );

  const multiplierBadge = `x${difficultyMultiplier}`;
  const pauseLabel =
    timerPhase === "reveal" ? "Round in pausa" : "Partita in pausa";

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#050409] text-[#f5ecdc]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.10),transparent_30%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl border border-amber-400/20 bg-[#140c0d]/70 px-8 py-10 text-center shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400" />
            <h2 className="text-2xl font-bold text-white">
              Connessione al server
            </h2>
            <p className="mt-2 text-[#bcae9a]">
              Sto preparando la lobby multiplayer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (room && gameFinished) {
    return (
      <div className="min-h-screen bg-[#050409] text-[#f5ecdc]">
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

          <FinalResultsView
            room={room}
            finalResults={finalResults}
            isHost={isHost}
            currentPlayerName={name}
            chatMessages={chatMessages}
            onSendChat={handleSendChat}
            onRematch={handleRematch}
            onExit={() => {
              window.localStorage.removeItem("beasty-landing-mode");
              window.location.reload();
            }}
          />
        </div>
      </div>
    );
  }

  if (room && room.state === "reveal" && question && reveal) {
    return (
      <div className="min-h-screen bg-[#050409] text-[#f5ecdc]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.10),transparent_30%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <HeroHeader
            title="Round concluso"
            description="Risposta corretta, scelte dei giocatori e punti ottenuti in questo round."
          />

          {actionError ? (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {actionError}
            </div>
          ) : null}

          <RevealView
            room={room}
            question={question}
            reveal={reveal}
            roundResults={roundResults}
            answerMarkers={answerMarkers}
            multiplierBadge={multiplierBadge}
            isPaused={isPaused}
            isHost={isHost}
            togglingPause={togglingPause}
            isResumeCountdownActive={isResumeCountdownActive}
            resumeCountdownSeconds={resumeCountdownSeconds}
            pauseLabel={pauseLabel}
            revealTimeLeft={revealTimeLeft}
            revealTimerPercent={revealTimerPercent}
            chatMessages={chatMessages}
            currentPlayerName={name}
            onSendChat={handleSendChat}
            onPauseToggle={handlePauseToggle}
          />
        </div>
      </div>
    );
  }

  if (room && question) {
    return (
      <div className="min-h-screen bg-[#050409] text-[#f5ecdc]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.10),transparent_30%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <HeroHeader
            title="Who Wants to Be Beasty?"
            description="Sfida live i tuoi amici. Rispondi piÃ¹ velocemente degli altri e scala la classifica."
          />

          {actionError ? (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {actionError}
            </div>
          ) : null}

          <QuestionView
            room={room}
            question={question}
            sortedPlayers={sortedPlayers}
            answerMarkers={answerMarkers}
            multiplierBadge={multiplierBadge}
            doublePoints={doublePoints}
            selectedAnswer={selectedAnswer}
            submittingAnswer={submittingAnswer}
            isPaused={isPaused}
            isHost={isHost}
            togglingPause={togglingPause}
            isResumeCountdownActive={isResumeCountdownActive}
            resumeCountdownSeconds={resumeCountdownSeconds}
            pauseLabel={pauseLabel}
            timeLeft={timeLeft}
            timerPercent={timerPercent}
            chatMessages={chatMessages}
            currentPlayerName={name}
            onSendChat={handleSendChat}
            onPauseToggle={handlePauseToggle}
            onSubmitAnswer={handleSubmitAnswer}
          />
        </div>
      </div>
    );
  }

  if (room) {
    return (
      <div className="min-h-screen bg-[#050409] text-[#f5ecdc]">
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

          <LobbyView
            room={room}
            players={players}
            categories={categories}
            selectedCategories={selectedCategories}
            totalQuestions={totalQuestions}
            savingSettings={savingSettings}
            isHost={isHost}
            currentPlayerName={name}
            chatMessages={chatMessages}
            onSendChat={handleSendChat}
            onStartGame={handleStartGame}
            onSaveSettings={handleSaveSettings}
            onToggleCategory={toggleCategory}
            onTotalQuestionsChange={setTotalQuestions}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050409] text-[#f5ecdc]">
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

        <LandingView
          landingMode={landingMode}
          setLandingMode={setLandingMode}
          name={name}
          setName={setName}
          code={code}
          setCode={setCode}
          categories={categories}
          selectedCategories={selectedCategories}
          totalQuestions={totalQuestions}
          onToggleCategory={toggleCategory}
          onTotalQuestionsChange={setTotalQuestions}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      </div>
    </div>
  );
}
