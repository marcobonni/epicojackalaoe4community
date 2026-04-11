"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRequiredAdminSession, getRequiredSession } from "@/app/lib/session";
import { postTournamentApi } from "@/app/lib/tournaments/store";

function refreshTournamentViews(slug?: string | null) {
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/tournaments");

  if (slug) {
    revalidatePath(`/tournaments/${slug}`);
  }
}

function optionalString(formData: FormData, key: string) {
  const value = `${formData.get(key) ?? ""}`.trim();
  return value || null;
}

function requiredString(formData: FormData, key: string) {
  const value = optionalString(formData, key);

  if (!value) {
    throw new Error(`Missing required field: ${key}`);
  }

  return value;
}

function numberValue(formData: FormData, key: string, fallback: number) {
  const raw = Number(formData.get(key) ?? fallback);
  return Number.isFinite(raw) ? raw : fallback;
}

function booleanValue(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export async function createTournamentAction(formData: FormData) {
  const session = await getRequiredAdminSession();
  const manualRoster = `${formData.get("manualRoster") ?? ""}`.trim();

  const payload = await postTournamentApi<{
    ok: boolean;
    tournament: {
      slug: string;
    };
  }>("/admin/create-tournament", {
    accessToken: session.accessToken,
    admin: true,
    body: {
      title: requiredString(formData, "name"),
      slug: optionalString(formData, "slug"),
      description: optionalString(formData, "description"),
      format: requiredString(formData, "format"),
      participant_mode: requiredString(formData, "participantMode"),
      signup_mode: requiredString(formData, "signupMode"),
      visibility: requiredString(formData, "visibility"),
      seeding_mode: requiredString(formData, "seedingMode"),
      result_confirmation_mode: requiredString(
        formData,
        "resultConfirmationMode"
      ),
      scheduling_mode: requiredString(formData, "schedulingMode"),
      tie_breaker: requiredString(formData, "tieBreaker"),
      best_of: numberValue(formData, "bestOf", 3),
      min_participants: numberValue(formData, "minParticipants", 2),
      max_participants: numberValue(formData, "maxParticipants", 8),
      prize_summary: optionalString(formData, "prizeSummary"),
      registration_opens_at: optionalString(formData, "registrationsOpenAt"),
      registration_closes_at: optionalString(formData, "registrationsCloseAt"),
      starts_at: optionalString(formData, "startsAt"),
      map_rules: optionalString(formData, "mapRules"),
      notes: optionalString(formData, "notes"),
      requires_check_in: booleanValue(formData, "requiresCheckIn"),
      requires_evidence: booleanValue(formData, "requiresEvidence"),
      auto_generate_bracket: booleanValue(formData, "autoGenerateBracket"),
      manual_roster: manualRoster,
      admin_email: session.user.email,
    },
  });

  refreshTournamentViews(payload.tournament.slug);
  redirect("/admin");
}

export async function requestTournamentJoinAction(formData: FormData) {
  const session = await getRequiredSession();
  const tournamentId = requiredString(formData, "tournamentId");
  const slug = optionalString(formData, "slug");

  await postTournamentApi("/register", {
    accessToken: session.accessToken,
    body: {
      tournament_id: tournamentId,
    },
  });

  refreshTournamentViews(slug);
}

export async function approveRegistrationAction(formData: FormData) {
  const session = await getRequiredAdminSession();
  const tournamentId = requiredString(formData, "tournamentId");
  const registrationId = requiredString(formData, "registrationId");
  const slug = optionalString(formData, "slug");

  await postTournamentApi("/admin/approve-registration", {
    accessToken: session.accessToken,
    admin: true,
    body: {
      tournament_id: tournamentId,
      registration_id: registrationId,
    },
  });

  refreshTournamentViews(slug);
}

export async function addManualParticipantAction(formData: FormData) {
  const session = await getRequiredAdminSession();
  const tournamentId = requiredString(formData, "tournamentId");
  const slug = optionalString(formData, "slug");

  await postTournamentApi("/admin/add-participant", {
    accessToken: session.accessToken,
    admin: true,
    body: {
      tournament_id: tournamentId,
      display_name: requiredString(formData, "displayName"),
      email: optionalString(formData, "email"),
    },
  });

  refreshTournamentViews(slug);
}

export async function updateTournamentStatusAction(formData: FormData) {
  const session = await getRequiredAdminSession();
  const tournamentId = requiredString(formData, "tournamentId");
  const slug = optionalString(formData, "slug");

  await postTournamentApi("/admin/update-status", {
    accessToken: session.accessToken,
    admin: true,
    body: {
      tournament_id: tournamentId,
      status: requiredString(formData, "status"),
    },
  });

  refreshTournamentViews(slug);
}

export async function generateBracketAction(formData: FormData) {
  const session = await getRequiredAdminSession();
  const tournamentId = requiredString(formData, "tournamentId");
  const slug = optionalString(formData, "slug");

  await postTournamentApi("/admin/generate-bracket", {
    accessToken: session.accessToken,
    admin: true,
    body: {
      tournament_id: tournamentId,
    },
  });

  refreshTournamentViews(slug);
}

export async function submitMatchResultAction(formData: FormData) {
  const session = await getRequiredSession();
  const slug = optionalString(formData, "slug");

  await postTournamentApi("/submit-result", {
    accessToken: session.accessToken,
    body: {
      match_id: requiredString(formData, "matchId"),
      player1_wins: numberValue(formData, "playerOneWins", 0),
      player2_wins: numberValue(formData, "playerTwoWins", 0),
      evidence_note: optionalString(formData, "evidenceNote"),
    },
  });

  refreshTournamentViews(slug);
}

export async function confirmMatchResultAction(formData: FormData) {
  const session = await getRequiredSession();
  const slug = optionalString(formData, "slug");

  await postTournamentApi("/confirm-result", {
    accessToken: session.accessToken,
    body: {
      match_id: requiredString(formData, "matchId"),
    },
  });

  refreshTournamentViews(slug);
}

export async function disputeMatchResultAction(formData: FormData) {
  const session = await getRequiredSession();
  const slug = optionalString(formData, "slug");

  await postTournamentApi("/dispute-result", {
    accessToken: session.accessToken,
    body: {
      match_id: requiredString(formData, "matchId"),
      dispute_reason: optionalString(formData, "disputeReason"),
    },
  });

  refreshTournamentViews(slug);
}

export async function resolveDisputedMatchAction(formData: FormData) {
  const session = await getRequiredAdminSession();
  const slug = optionalString(formData, "slug");

  await postTournamentApi("/admin/resolve-match", {
    accessToken: session.accessToken,
    admin: true,
    body: {
      match_id: requiredString(formData, "matchId"),
      winner_side: requiredString(formData, "winnerSide"),
      resolution: requiredString(formData, "resolution"),
      player1_wins: numberValue(formData, "playerOneWins", 0),
      player2_wins: numberValue(formData, "playerTwoWins", 0),
      admin_notes: optionalString(formData, "adminNotes"),
    },
  });

  refreshTournamentViews(slug);
}
