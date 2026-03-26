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

  useEffect(() => {
    socket.connect();

    const onConnect = () => {
      setConnected(true);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onRoomUpdated = (updatedRoom: Room) => {
      setRoom(updatedRoom);
      setPlayers(updatedRoom.players);
    };

    const onGameQuestion = ({
      room: updatedRoom,
      question: nextQuestion,
      startedAt: nextStartedAt,
      doublePoints: nextDoublePoints,
      difficultyMultiplier: nextDifficultyMultiplier,
      answerMarkers: nextAnswerMarkers,
    }: {
      room: Room;
      question: Question;
      startedAt: number;
      doublePoints?: boolean;
      difficultyMultiplier?: number;
      answerMarkers?: AnswerMarker[];
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
      setRevealStartedAt(null);
      setRevealDurationMs(0);
      setFinalResults(nextFinalResults ?? []);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room:updated", onRoomUpdated);
    socket.on("game:question", onGameQuestion);
    socket.on("answers:updated", onAnswersUpdated);
    socket.on("scoreboard:updated", onScoreboardUpdated);
    socket.on("game:reveal", onGameReveal);
    socket.on("game:finished", onGameFinished);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room:updated", onRoomUpdated);
      socket.off("game:question", onGameQuestion);
      socket.off("answers:updated", onAnswersUpdated);
      socket.off("scoreboard:updated", onScoreboardUpdated);
      socket.off("game:reveal", onGameReveal);
      socket.off("game:finished", onGameFinished);
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
    createRoom,
    joinRoom,
    updateRoomSettings,
    startGame,
    submitAnswer,
    requestRematch,
  };
}