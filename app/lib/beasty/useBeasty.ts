"use client";

import { useEffect, useState } from "react";
import { socket } from "./socket";
import type {
  AnswerMarker,
  FinalResult,
  Player,
  Question,
  QuestionCategory,
  Room,
  RoomSettings,
  RoundResult,
} from "./types";

type RevealState = {
  correctIndex: number;
  correctAnswer: string;
} | null;

const DEFAULT_CATEGORIES: QuestionCategory[] = [
  { id: "civilizations", label: "Civilizzazioni" },
  { id: "units", label: "Unità" },
  { id: "landmarks", label: "Landmark" },
  { id: "buildings", label: "Edifici" },
  { id: "ages", label: "Età" },
];

function getPlayerSessionId() {
  if (typeof window === "undefined") {
    return "server-session";
  }

  const existing = window.localStorage.getItem("beasty-player-session-id");
  if (existing) return existing;

  const next =
    typeof window.crypto !== "undefined" && "randomUUID" in window.crypto
      ? window.crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem("beasty-player-session-id", next);
  return next;
}

export function useBeasty() {
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [reveal, setReveal] = useState<RevealState>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [doublePoints, setDoublePoints] = useState(false);
  const [difficultyMultiplier, setDifficultyMultiplier] = useState(1);
  const [categories] = useState<QuestionCategory[]>(DEFAULT_CATEGORIES);
  const [answerMarkers, setAnswerMarkers] = useState<AnswerMarker[]>([]);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [revealStartedAt, setRevealStartedAt] = useState<number | null>(null);
  const [revealDurationMs, setRevealDurationMs] = useState(0);
  const [finalResults, setFinalResults] = useState<FinalResult[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [timerPhase, setTimerPhase] = useState<"question" | "reveal" | null>(
    null
  );
  const [resumeCountdownAt, setResumeCountdownAt] = useState<number | null>(null);

  useEffect(() => {
    socket.connect();

    const onConnect = () => {
      setConnected(true);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onRoomUpdated = (
      updatedRoom: Room & {
        isPaused?: boolean;
        remainingMs?: number | null;
      }
    ) => {
      setRoom(updatedRoom);
      setPlayers(updatedRoom.players);
      setIsPaused(Boolean(updatedRoom.isPaused));
      setRemainingMs(
        typeof updatedRoom.remainingMs === "number" ? updatedRoom.remainingMs : null
      );
    };

    const onGameQuestion = ({
      room: updatedRoom,
      question: nextQuestion,
      startedAt: nextStartedAt,
      doublePoints: nextDoublePoints,
      difficultyMultiplier: nextDifficultyMultiplier,
      answerMarkers: nextAnswerMarkers,
      isPaused: nextIsPaused,
      remainingMs: nextRemainingMs,
    }: {
      room: Room;
      question: Question;
      startedAt: number;
      doublePoints?: boolean;
      difficultyMultiplier?: number;
      answerMarkers?: AnswerMarker[];
      isPaused?: boolean;
      remainingMs?: number;
    }) => {
      setRoom(updatedRoom);
      setQuestion(nextQuestion);
      setPlayers(updatedRoom.players);
      setReveal(null);
      setStartedAt(nextStartedAt);
      setGameFinished(false);
      setDoublePoints(Boolean(nextDoublePoints));
      setDifficultyMultiplier(nextDifficultyMultiplier ?? 1);
      setAnswerMarkers(nextAnswerMarkers ?? []);
      setRoundResults([]);
      setRevealStartedAt(null);
      setRevealDurationMs(0);
      setFinalResults([]);
      setIsPaused(Boolean(nextIsPaused));
      setRemainingMs(
        typeof nextRemainingMs === "number"
          ? nextRemainingMs
          : nextQuestion.durationMs
      );
      setTimerPhase("question");
      setResumeCountdownAt(null);
    };

    const onAnswersUpdated = ({
      answerMarkers: nextAnswerMarkers,
    }: {
      answerMarkers: AnswerMarker[];
    }) => {
      setAnswerMarkers(nextAnswerMarkers);
    };

    const onScoreboardUpdated = ({
      players: updatedPlayers,
    }: {
      players: Player[];
    }) => {
      setPlayers(updatedPlayers);
    };

    const onGameReveal = ({
      room: updatedRoom,
      question: currentQuestion,
      correctIndex,
      correctAnswer,
      players: updatedPlayers,
      difficultyMultiplier: nextDifficultyMultiplier,
      answerMarkers: nextAnswerMarkers,
      roundResults: nextRoundResults,
      revealStartedAt: nextRevealStartedAt,
      revealDurationMs: nextRevealDurationMs,
      isPaused: nextIsPaused,
      remainingMs: nextRemainingMs,
    }: {
      room: Room;
      question: Question;
      correctIndex: number;
      correctAnswer: string;
      players: Player[];
      difficultyMultiplier?: number;
      answerMarkers?: AnswerMarker[];
      roundResults?: RoundResult[];
      revealStartedAt?: number;
      revealDurationMs?: number;
      isPaused?: boolean;
      remainingMs?: number;
    }) => {
      setRoom(updatedRoom);
      setQuestion(currentQuestion);
      setPlayers(updatedPlayers);
      setReveal({ correctIndex, correctAnswer });
      setStartedAt(null);
      setDifficultyMultiplier(nextDifficultyMultiplier ?? 1);
      setAnswerMarkers(nextAnswerMarkers ?? []);
      setRoundResults(nextRoundResults ?? []);
      setRevealStartedAt(nextRevealStartedAt ?? null);
      setRevealDurationMs(nextRevealDurationMs ?? 0);
      setIsPaused(Boolean(nextIsPaused));
      setRemainingMs(
        typeof nextRemainingMs === "number"
          ? nextRemainingMs
          : (nextRevealDurationMs ?? 0)
      );
      setTimerPhase("reveal");
      setResumeCountdownAt(null);
    };

    const onGameFinished = ({
      room: updatedRoom,
      players: updatedPlayers,
      finalResults: nextFinalResults,
    }: {
      room: Room;
      players: Player[];
      finalResults?: FinalResult[];
    }) => {
      setRoom(updatedRoom);
      setPlayers(updatedPlayers);
      setQuestion(null);
      setReveal(null);
      setStartedAt(null);
      setGameFinished(true);
      setDoublePoints(false);
      setDifficultyMultiplier(1);
      setAnswerMarkers([]);
      setRoundResults([]);
      setRevealStartedAt(null);
      setRevealDurationMs(0);
      setFinalResults(nextFinalResults ?? []);
      setIsPaused(false);
      setRemainingMs(null);
      setTimerPhase(null);
      setResumeCountdownAt(null);
    };

    const onGameTimer = ({
      phase,
      remainingMs: nextRemainingMs,
      isPaused: nextIsPaused,
    }: {
      phase: "question" | "reveal";
      remainingMs: number;
      isPaused: boolean;
    }) => {
      setTimerPhase(phase);
      setRemainingMs(nextRemainingMs);
      setIsPaused(nextIsPaused);
    };

    const onGamePaused = ({
      room: updatedRoom,
      isPaused: nextIsPaused,
      phase,
      remainingMs: nextRemainingMs,
    }: {
      room?: Room;
      isPaused?: boolean;
      phase?: "question" | "reveal";
      remainingMs?: number;
    }) => {
      if (updatedRoom) {
        setRoom(updatedRoom);
        setPlayers(updatedRoom.players);
      }

      setIsPaused(Boolean(nextIsPaused));

      if (phase) {
        setTimerPhase(phase);
      }

      if (typeof nextRemainingMs === "number") {
        setRemainingMs(nextRemainingMs);
      }

      setResumeCountdownAt(null);
    };

    const onResumeCountdown = ({
      phase,
      resumeAt,
    }: {
      phase?: "question" | "reveal";
      resumeAt: number;
    }) => {
      if (phase) {
        setTimerPhase(phase);
      }

      setResumeCountdownAt(resumeAt);
    };

    const onGameResumed = ({
      room: updatedRoom,
      isPaused: nextIsPaused,
      phase,
      remainingMs: nextRemainingMs,
    }: {
      room?: Room;
      isPaused?: boolean;
      phase?: "question" | "reveal";
      remainingMs?: number;
    }) => {
      if (updatedRoom) {
        setRoom(updatedRoom);
        setPlayers(updatedRoom.players);
      }

      setIsPaused(Boolean(nextIsPaused));

      if (phase) {
        setTimerPhase(phase);
      }

      if (typeof nextRemainingMs === "number") {
        setRemainingMs(nextRemainingMs);
      }

      setResumeCountdownAt(null);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room:updated", onRoomUpdated);
    socket.on("game:question", onGameQuestion);
    socket.on("answers:updated", onAnswersUpdated);
    socket.on("scoreboard:updated", onScoreboardUpdated);
    socket.on("game:reveal", onGameReveal);
    socket.on("game:finished", onGameFinished);
    socket.on("game:timer", onGameTimer);
    socket.on("game:paused", onGamePaused);
    socket.on("game:resume-countdown", onResumeCountdown);
    socket.on("game:resumed", onGameResumed);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room:updated", onRoomUpdated);
      socket.off("game:question", onGameQuestion);
      socket.off("answers:updated", onAnswersUpdated);
      socket.off("scoreboard:updated", onScoreboardUpdated);
      socket.off("game:reveal", onGameReveal);
      socket.off("game:finished", onGameFinished);
      socket.off("game:timer", onGameTimer);
      socket.off("game:paused", onGamePaused);
      socket.off("game:resume-countdown", onResumeCountdown);
      socket.off("game:resumed", onGameResumed);
      socket.disconnect();
    };
  }, []);

  const createRoom = (name: string, settings: RoomSettings) =>
    new Promise((resolve) => {
      socket.emit(
        "room:create",
        {
          name,
          playerSessionId: getPlayerSessionId(),
          settings,
        },
        resolve
      );
    });

  const joinRoom = (code: string, name: string) =>
    new Promise((resolve) => {
      socket.emit(
        "room:join",
        {
          code,
          name,
          playerSessionId: getPlayerSessionId(),
        },
        resolve
      );
    });

  const updateRoomSettings = (code: string, settings: RoomSettings) =>
    new Promise((resolve) => {
      socket.emit("room:update-settings", { code, settings }, resolve);
    });

  const startGame = (code: string) =>
    new Promise((resolve) => {
      socket.emit("game:start", { code }, resolve);
    });

  const pauseGame = (code: string) =>
    new Promise((resolve) => {
      socket.emit("game:pause", { code }, resolve);
    });

  const resumeGame = (code: string) =>
    new Promise((resolve) => {
      socket.emit("game:resume", { code }, resolve);
    });

  const submitAnswer = (code: string, answerIndex: number, questionId: string) =>
    new Promise((resolve) => {
      socket.emit("answer:submit", { code, answerIndex, questionId }, resolve);
    });

  const requestRematch = (code: string) =>
    new Promise((resolve) => {
      socket.emit("game:rematch", { code }, resolve);
    });

  return {
    connected,
    room,
    question,
    players,
    reveal,
    startedAt,
    gameFinished,
    doublePoints,
    difficultyMultiplier,
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
    createRoom,
    joinRoom,
    updateRoomSettings,
    startGame,
    pauseGame,
    resumeGame,
    submitAnswer,
    requestRematch,
  };
}