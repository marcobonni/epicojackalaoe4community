export type Player = {
  id: string;
  name: string;
  score: number;
  connected: boolean;
  sessionId?: string;
};

export type RoomState = "lobby" | "question" | "reveal" | "finished";

export type RoomSettings = {
  categories: string[];
  totalQuestions: number;
};

export type Room = {
  code: string;
  hostId: string;
  state: RoomState;
  players: Player[];
  currentQuestionIndex: number;
  settings: RoomSettings;
};

export type Question = {
  id: string;
  category: string;
  difficulty: string;
  text: string;
  options: string[];
  durationMs: number;
};

export type QuestionCategory = {
  id: string;
  label: string;
};

export type AnswerMarker = {
  playerId: string;
  playerName: string;
  answerIndex: number;
};

export type RoundResult = {
  playerId: string;
  playerName: string;
  answerIndex: number;
  selectedAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  totalScore: number;
};