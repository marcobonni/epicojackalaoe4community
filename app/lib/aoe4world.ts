export type LeaderboardPlayer = {
  profile_id: number;
  name: string;
  rating: number;
  rank: number;
  rank_level?: string;
  country?: string;

  avatarSmall?: string | null;

  rating1v1?: number | null;
  rating2v2?: number | null;
  rating3v3?: number | null;
  rating4v4?: number | null;

  soloRankLevel?: string | null;
  teamRankLevel?: string | null;
};

type LeaderboardResponse =
  | LeaderboardPlayer[]
  | {
      players?: LeaderboardPlayer[];
      leaderboard?: LeaderboardPlayer[];
    };

type EloMode = {
  rating?: number | null;
  rank_level?: string | null;
};

type RankedMode = {
  rank_level?: string | null;
};

type PlayerProfileResponse = {
  profile_id?: number;
  name?: string;
  avatars?: {
    small?: string | null;
    medium?: string | null;
    full?: string | null;
  } | null;

  rm_solo?: RankedMode | null;
  rm_team?: RankedMode | null;

  rm_1v1_elo?: EloMode | null;
  rm_2v2_elo?: EloMode | null;
  rm_3v3_elo?: EloMode | null;
  rm_4v4_elo?: EloMode | null;
};

function normalizeLeaderboardResponse(data: LeaderboardResponse): LeaderboardPlayer[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.players)) return data.players;
  if (Array.isArray(data.leaderboard)) return data.leaderboard;
  return [];
}

function toNullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toNullableString(value: unknown): string | null {
  if (typeof value === "string" && value.trim() !== "") return value;
  return null;
}

export async function getItalianTop20(): Promise<LeaderboardPlayer[]> {
  const res = await fetch(
    "https://aoe4world.com/api/v0/leaderboards/rm_solo?page=1&country=it",
    {
      next: { revalidate: 300 },
    }
  );

  if (!res.ok) {
    throw new Error("Errore nel recupero leaderboard AoE4World");
  }

  const data: LeaderboardResponse = await res.json();
  const players = normalizeLeaderboardResponse(data);

  return players.slice(0, 20);
}

async function getPlayerProfileData(profileId: number): Promise<{
  avatarSmall: string | null;
  rating1v1: number | null;
  rating2v2: number | null;
  rating3v3: number | null;
  rating4v4: number | null;
  soloRankLevel: string | null;
  teamRankLevel: string | null;
}> {
  const res = await fetch(`https://aoe4worl bgdd.com/api/v0/players/${profileId}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return {
      avatarSmall: null,
      rating1v1: null,
      rating2v2: null,
      rating3v3: null,
      rating4v4: null,
      soloRankLevel: null,
      teamRankLevel: null,
    };
  }

  const data: PlayerProfileResponse = await res.json();

  return {
    avatarSmall: toNullableString(data.avatars?.small),
    rating1v1: toNullableNumber(data.rm_1v1_elo?.rating),
    rating2v2: toNullableNumber(data.rm_2v2_elo?.rating),
    rating3v3: toNullableNumber(data.rm_3v3_elo?.rating),
    rating4v4: toNullableNumber(data.rm_4v4_elo?.rating),
    soloRankLevel: toNullableString(data.rm_solo?.rank_level),
    teamRankLevel: toNullableString(data.rm_team?.rank_level),
  };
}

export async function getItalianTop20WithModeElos(): Promise<LeaderboardPlayer[]> {
  const top20 = await getItalianTop20();

  const playersWithProfiles = await Promise.all(
    top20.map(async (player) => {
      const profileData = await getPlayerProfileData(player.profile_id);

      return {
        ...player,
        avatarSmall: profileData.avatarSmall,
        rating1v1: profileData.rating1v1 ?? player.rating ?? null,
        rating2v2: profileData.rating2v2,
        rating3v3: profileData.rating3v3,
        rating4v4: profileData.rating4v4,
        soloRankLevel: profileData.soloRankLevel,
        teamRankLevel: profileData.teamRankLevel,
      };
    })
  );

  return playersWithProfiles;
}