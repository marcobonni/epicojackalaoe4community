export type MatchmakingMode = "1v1" | "2v2" | "3v3" | "4v4";

export type MatchmakingPlayer = {
  input: string;
  profileId: number;
  name: string;
  elo: number;
  country?: string | null;
  avatarUrl?: string | null;
};

export type MatchmakingResult = {
  mode: MatchmakingMode;
  players: MatchmakingPlayer[];
  teamA: MatchmakingPlayer[];
  teamB: MatchmakingPlayer[];
  totalA: number;
  totalB: number;
  averageA: number;
  averageB: number;
  diff: number;
  teamAWinProbability: number;
  teamBWinProbability: number;
};

export type MatchmakingErrorResponse = {
  error: string;
  unresolved?: Array<{
    input: string;
    reason: string;
  }>;
  resolvedPlayers?: MatchmakingPlayer[];
};

export function parseNamesFromTextarea(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}