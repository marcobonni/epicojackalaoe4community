import type {
  TournamentDetailsResponse,
  TournamentMatch,
  TournamentRegistration,
  TournamentSummary,
} from "@/app/lib/tournaments/types";

export type TournamentStandingRow = {
  participantId: string;
  displayName: string;
  seed: number | null;
  matchWins: number;
  matchLosses: number;
  mapWins: number;
  mapLosses: number;
  pointsFor: number;
  pointsAgainst: number;
  buchholz: number;
};

export function getUserActionableMatch(
  matches: TournamentMatch[],
  userId: string | null | undefined
) {
  if (!userId) {
    return null;
  }

  return (
    matches.find((match) => {
      const isParticipant = match.player1_id === userId || match.player2_id === userId;
      const isActionable =
        match.status === "ready" ||
        match.status === "awaiting_confirmation" ||
        match.status === "disputed" ||
        match.status === "admin_review";

      return isParticipant && isActionable;
    }) ?? null
  );
}

export function getUpcomingOpponentLabel(
  match: TournamentMatch | null,
  userId: string | null | undefined
) {
  if (!match || !userId) {
    return null;
  }

  if (match.player1_id === userId) {
    return match.player2?.display_name ?? "In attesa di avversario";
  }

  if (match.player2_id === userId) {
    return match.player1?.display_name ?? "In attesa di avversario";
  }

  return null;
}

export function getTournamentSummaryForUser(
  payload: Pick<TournamentDetailsResponse, "participants" | "matches" | "myRegistration">,
  userId: string | null | undefined
) {
  const participant =
    payload.myRegistration ??
    payload.participants.find((entry) => entry.user_id === userId) ??
    null;
  const nextMatch = getUserActionableMatch(payload.matches, userId);

  return {
    participant,
    nextMatch,
    nextOpponent: getUpcomingOpponentLabel(nextMatch, userId),
  };
}

export function getMatchPerspective(match: TournamentMatch) {
  const playerOneName = match.player1?.display_name ?? "TBD";
  const playerTwoName = match.player2?.display_name ?? "TBD";
  const winnerName = match.winner?.display_name ?? "TBD";

  return {
    playerOneName,
    playerTwoName,
    winnerName,
  };
}

export function getParticipantSeedLabel(participant: TournamentRegistration) {
  return participant.seed ?? "TBD";
}

function isCompletedMatch(match: TournamentMatch) {
  return ["completed", "forfeited", "cancelled"].includes(match.status);
}

function compareNullableNumber(left: number | null | undefined, right: number | null | undefined) {
  const normalizedLeft = Number.isFinite(left) ? Number(left) : Number.MAX_SAFE_INTEGER;
  const normalizedRight = Number.isFinite(right) ? Number(right) : Number.MAX_SAFE_INTEGER;
  return normalizedLeft - normalizedRight;
}

function standingsComparator(
  tieBreaker: TournamentSummary["tie_breaker"]
) {
  return (left: TournamentStandingRow, right: TournamentStandingRow) => {
    const winDelta = right.matchWins - left.matchWins;

    if (winDelta !== 0) {
      return winDelta;
    }

    if (tieBreaker === "map_difference") {
      const mapDiffDelta =
        right.mapWins - right.mapLosses - (left.mapWins - left.mapLosses);

      if (mapDiffDelta !== 0) {
        return mapDiffDelta;
      }
    }

    if (tieBreaker === "point_difference") {
      const pointDiffDelta =
        right.pointsFor - right.pointsAgainst - (left.pointsFor - left.pointsAgainst);

      if (pointDiffDelta !== 0) {
        return pointDiffDelta;
      }
    }

    if (tieBreaker === "buchholz") {
      const buchholzDelta = right.buchholz - left.buchholz;

      if (buchholzDelta !== 0) {
        return buchholzDelta;
      }
    }

    const fallbackMapDiffDelta =
      right.mapWins - right.mapLosses - (left.mapWins - left.mapLosses);

    if (fallbackMapDiffDelta !== 0) {
      return fallbackMapDiffDelta;
    }

    const seedDelta = compareNullableNumber(left.seed, right.seed);

    if (seedDelta !== 0) {
      return seedDelta;
    }

    return left.displayName.localeCompare(right.displayName);
  };
}

export function getTournamentStandings(
  tournament: Pick<TournamentSummary, "tie_breaker">,
  participants: TournamentRegistration[],
  matches: TournamentMatch[]
) {
  const participantIds = new Set(participants.map((participant) => participant.user_id));
  const standings = new Map<string, TournamentStandingRow>(
    participants.map((participant) => [
      participant.user_id,
      {
        participantId: participant.user_id,
        displayName: participant.profile?.display_name ?? "Player",
        seed: participant.seed,
        matchWins: 0,
        matchLosses: 0,
        mapWins: 0,
        mapLosses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        buchholz: 0,
      },
    ])
  );
  const opponentMap = new Map<string, string[]>(
    participants.map((participant) => [participant.user_id, []])
  );

  for (const match of matches) {
    if (
      !isCompletedMatch(match) ||
      !match.player1_id ||
      !match.player2_id ||
      !participantIds.has(match.player1_id) ||
      !participantIds.has(match.player2_id)
    ) {
      continue;
    }

    const playerOne = standings.get(match.player1_id);
    const playerTwo = standings.get(match.player2_id);

    if (!playerOne || !playerTwo) {
      continue;
    }

    const playerOneWins = match.player1_wins ?? 0;
    const playerTwoWins = match.player2_wins ?? 0;
    const playerOneWon = match.winner_id === match.player1_id;
    const playerTwoWon = match.winner_id === match.player2_id;

    playerOne.matchWins += playerOneWon ? 1 : 0;
    playerOne.matchLosses += playerOneWon ? 0 : 1;
    playerOne.mapWins += playerOneWins;
    playerOne.mapLosses += playerTwoWins;
    playerOne.pointsFor += playerOneWins;
    playerOne.pointsAgainst += playerTwoWins;

    playerTwo.matchWins += playerTwoWon ? 1 : 0;
    playerTwo.matchLosses += playerTwoWon ? 0 : 1;
    playerTwo.mapWins += playerTwoWins;
    playerTwo.mapLosses += playerOneWins;
    playerTwo.pointsFor += playerTwoWins;
    playerTwo.pointsAgainst += playerOneWins;

    opponentMap.get(match.player1_id)?.push(match.player2_id);
    opponentMap.get(match.player2_id)?.push(match.player1_id);
  }

  for (const standing of standings.values()) {
    standing.buchholz =
      opponentMap.get(standing.participantId)?.reduce((total, opponentId) => {
        const opponent = standings.get(opponentId);
        return total + (opponent?.matchWins ?? 0);
      }, 0) ?? 0;
  }

  return [...standings.values()].sort(standingsComparator(tournament.tie_breaker));
}

export function formatSupportsStandings(format: TournamentSummary["format"]) {
  return [
    "round_robin",
    "championship",
    "swiss",
    "groups_playoff",
    "international_style",
    "league_season",
    "ladder",
    "gsl_group",
  ].includes(format);
}
