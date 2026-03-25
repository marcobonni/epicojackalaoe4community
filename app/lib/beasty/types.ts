export type Player = {
  id: string;
  name: string;
  score: number;
  connected: boolean;
};

export type RoomState = "lobby" | "question" | "reveal" | "finished";

export type Room = {
  code: string;
  hostId: string;
  state: RoomState;
  players: Player[];
  currentQuestionIndex: number;
};

export type Question = {
  id: string;
  text: string;
  options: string[];
  durationMs: number;
};