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
  topCivilizations?: string[];
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

type CivilizationStat = {
  civilization?: string | null;
  games_count?: number | null;
  pick_rate?: number | null;
  win_rate?: number | null;
};

type RankedMode = {
  rank_level?: string | null;
  civilizations?: CivilizationStat[] | null;
};

type PlayerProfileResponse = {
  profile_id?: number;
  name?: string;
  avatars?: {
    small?: string | null;
    medium?: string | null;
    full?: string | null;
  } | null;
  modes?: {
    rm_solo?: RankedMode | null;
    rm_team?: RankedMode | null;
    rm_1v1_elo?: EloMode | null;
    rm_2v2_elo?: EloMode | null;
    rm_3v3_elo?: EloMode | null;
    rm_4v4_elo?: EloMode | null;
  };
};

export type ItalianLeaderboardPageResult = {
  players: LeaderboardPlayer[];
  currentPage: number;
  hasNextPage: boolean;
};

const PAGE_SIZE = 50;

function normalizeLeaderboardResponse(
  data: LeaderboardResponse
): LeaderboardPlayer[] {
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

function isWesternName(name: string): boolean {
  return /^[\x00-\x7F]+$/.test(name);
}

function getTopCivilizations(
  civilizations?: CivilizationStat[] | null
): string[] {
  if (!Array.isArray(civilizations)) return [];

  return [...civilizations]
    .filter(
      (civ) =>
        typeof civ.civilization === "string" &&
        civ.civilization.trim() !== "" &&
        typeof civ.games_count === "number"
    )
    .sort((a, b) => (b.games_count ?? 0) - (a.games_count ?? 0))
    .slice(0, 3)
    .map((civ) => civ.civilization as string);
}

async function getPlayerProfileData(profileId: number): Promise<{
  avatarSmall: string | null;
  rating1v1: number | null;
  rating2v2: number | null;
  rating3v3: number | null;
  rating4v4: number | null;
  soloRankLevel: string | null;
  teamRankLevel: string | null;
  topCivilizations: string[];
}> {
  const res = await fetch(`https://aoe4world.com/api/v0/players/${profileId}`, {
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
      topCivilizations: [],
    };
  }

  const data: PlayerProfileResponse = await res.json();

  return {
    avatarSmall: toNullableString(data.avatars?.small),
    rating1v1: toNullableNumber(data.modes?.rm_1v1_elo?.rating),
    rating2v2: toNullableNumber(data.modes?.rm_2v2_elo?.rating),
    rating3v3: toNullableNumber(data.modes?.rm_3v3_elo?.rating),
    rating4v4: toNullableNumber(data.modes?.rm_4v4_elo?.rating),
    soloRankLevel: toNullableString(data.modes?.rm_solo?.rank_level),
    teamRankLevel: toNullableString(data.modes?.rm_team?.rank_level),
    topCivilizations: getTopCivilizations(data.modes?.rm_solo?.civilizations),
  };
}

export async function getItalianLeaderboardPageWithModeElos(
  page: number = 1
): Promise<ItalianLeaderboardPageResult> {
  const safePage = Math.max(1, page);

  const res = await fetch(
    `https://aoe4world.com/api/v0/leaderboards/rm_solo?country=it&page=${safePage}`,
    {
      next: { revalidate: 300 },
    }
  );

  if (!res.ok) {
    throw new Error("Errore nel recupero leaderboard italiana AoE4World");
  }

  const data: LeaderboardResponse = await res.json();
  const rawPlayers = normalizeLeaderboardResponse(data);
  const players = rawPlayers.filter((player) => isWesternName(player.name));

  const nextRes = await fetch(
    `https://aoe4world.com/api/v0/leaderboards/rm_solo?country=it&page=${safePage + 1}`,
    {
      next: { revalidate: 300 },
    }
  );

  let hasNextPage = false;

  if (nextRes.ok) {
    const nextData: LeaderboardResponse = await nextRes.json();
    const nextPlayers = normalizeLeaderboardResponse(nextData).filter((player) =>
      isWesternName(player.name)
    );
    hasNextPage = nextPlayers.length > 0;
  }

  const playersWithProfiles = await Promise.all(
    players.map(async (player) => {
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
        topCivilizations: profileData.topCivilizations,
      };
    })
  );

  return {
    players: playersWithProfiles.slice(0, PAGE_SIZE),
    currentPage: safePage,
    hasNextPage,
  };
}