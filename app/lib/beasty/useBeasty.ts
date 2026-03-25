"use client";

import { useEffect, useState } from "react";
import { socket } from "./socket";
import type { Player, Question, Room } from "./types";

type RevealState = {
  correctIndex: number;
  correctAnswer: string;
} | null;

export function useBeasty() {
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [reveal, setReveal] = useState<RevealState>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [doublePoints, setDoublePoints] = useState(false);

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
    }: {
      room: Room;
      question: Question;
      startedAt: number;
      doublePoints?: boolean;
    }) => {
      setRoom(updatedRoom);
      setQuestion(nextQuestion);
      setPlayers(updatedRoom.players);
      setReveal(null);
      setStartedAt(nextStartedAt);
      setGameFinished(false);
      setDoublePoints(Boolean(nextDoublePoints));
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
    }: {
      room: Room;
      question: Question;
      correctIndex: number;
      correctAnswer: string;
      players: Player[];
    }) => {
      setRoom(updatedRoom);
      setQuestion(currentQuestion);
      setPlayers(updatedPlayers);
      setReveal({ correctIndex, correctAnswer });
      setStartedAt(null);
    };

    const onGameFinished = ({
      room: updatedRoom,
      players: updatedPlayers,
    }: {
      room: Room;
      players: Player[];
    }) => {
      setRoom(updatedRoom);
      setPlayers(updatedPlayers);
      setQuestion(null);
      setReveal(null);
      setStartedAt(null);
      setGameFinished(true);
      setDoublePoints(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room:updated", onRoomUpdated);
    socket.on("game:question", onGameQuestion);
    socket.on("scoreboard:updated", onScoreboardUpdated);
    socket.on("game:reveal", onGameReveal);
    socket.on("game:finished", onGameFinished);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room:updated", onRoomUpdated);
      socket.off("game:question", onGameQuestion);
      socket.off("scoreboard:updated", onScoreboardUpdated);
      socket.off("game:reveal", onGameReveal);
      socket.off("game:finished", onGameFinished);
      socket.disconnect();
    };
  }, []);

  const createRoom = (name: string) =>
    new Promise((resolve) => {
      socket.emit("room:create", { name }, resolve);
    });

  const joinRoom = (code: string, name: string) =>
    new Promise((resolve) => {
      socket.emit("room:join", { code, name }, resolve);
    });

  const startGame = (code: string) =>
    new Promise((resolve) => {
      socket.emit("game:start", { code }, resolve);
    });

  const submitAnswer = (code: string, answerIndex: number) =>
    new Promise((resolve) => {
      socket.emit("answer:submit", { code, answerIndex }, resolve);
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
    createRoom,
    joinRoom,
    startGame,
    submitAnswer,
    requestRematch,
  };
}