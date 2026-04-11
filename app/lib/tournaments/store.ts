import "server-only";

import type {
  MyTournamentEntry,
  TournamentDetailsResponse,
  TournamentMatch,
  TournamentRegistration,
  TournamentSummary,
} from "@/app/lib/tournaments/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_REALTIME_URL ||
  "http://localhost:8080";

type FetchOptions = {
  accessToken?: string | null;
  admin?: boolean;
  method?: "GET" | "POST";
  body?: Record<string, unknown> | null;
  cache?: RequestCache;
};

async function fetchTournamentApi<T>(path: string, options: FetchOptions = {}) {
  const headers = new Headers({
    Accept: "application/json",
  });

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  if (options.admin) {
    const adminKey = process.env.TOURNAMENT_ADMIN_KEY;

    if (!adminKey) {
      throw new Error(
        "Missing TOURNAMENT_ADMIN_KEY in the frontend server env."
      );
    }

    headers.set("x-admin-key", adminKey);
  }

  const response = await fetch(`${API_BASE_URL}/api/tournament${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: options.cache ?? "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload?.error || `Tournament API request failed for ${path}.`
    );
  }

  return payload as T;
}

export async function listTournaments(accessToken?: string | null) {
  const payload = await fetchTournamentApi<{
    tournaments: TournamentSummary[];
  }>("/list", {
    accessToken,
  });

  return payload.tournaments ?? [];
}

export async function getTournamentBySlug(
  slug: string,
  accessToken?: string | null
) {
  const payload = await fetchTournamentApi<TournamentDetailsResponse>(
    `/details/by-slug/${slug}`,
    {
      accessToken,
    }
  );

  return payload;
}

export async function getMyTournaments(accessToken: string) {
  const payload = await fetchTournamentApi<{
    tournaments: MyTournamentEntry[];
  }>("/my-tournaments", {
    accessToken,
  });

  return payload.tournaments ?? [];
}

export async function getAdminTournaments(accessToken: string) {
  const payload = await fetchTournamentApi<{
    tournaments: TournamentSummary[];
  }>("/admin/tournaments", {
    accessToken,
    admin: true,
  });

  return payload.tournaments ?? [];
}

export async function postTournamentApi<T>(
  path: string,
  options: {
    accessToken?: string | null;
    admin?: boolean;
    body: Record<string, unknown>;
  }
) {
  return fetchTournamentApi<T>(path, {
    method: "POST",
    accessToken: options.accessToken,
    admin: options.admin,
    body: options.body,
  });
}

export function findParticipantByEmail(
  participants: TournamentRegistration[],
  email: string | null | undefined
) {
  if (!email) {
    return null;
  }

  return (
    participants.find(
      (participant) => participant.profile?.email?.toLowerCase() === email.toLowerCase()
    ) ?? null
  );
}

export function findRegistrationByEmail(
  participants: TournamentRegistration[],
  email: string | null | undefined
) {
  return findParticipantByEmail(participants, email);
}

export function getParticipantDisplayName(
  participants: TournamentRegistration[],
  participantId: string | null
) {
  if (!participantId) {
    return "TBD";
  }

  return (
    participants.find((participant) => participant.user_id === participantId)?.profile
      ?.display_name ?? "TBD"
  );
}

export function getMatchParticipant(
  match: TournamentMatch,
  side: 1 | 2
) {
  return side === 1 ? match.player1 : match.player2;
}
