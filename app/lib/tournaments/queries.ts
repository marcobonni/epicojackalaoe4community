import type {
  TournamentDetailsResponse,
  TournamentMatch,
  TournamentRegistration,
} from "@/app/lib/tournaments/types";

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
