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

type PlayerProfileData = {
  avatarSmall: string | null;
  rating1v1: number | null;
  rating2v2: number | null;
  rating3v3: number | null;
  rating4v4: number | null;
  soloRankLevel: string | null;
  teamRankLevel: string | null;
  topCivilizations: string[];
};

export type ItalianLeaderboardPageResult = {
  players: LeaderboardPlayer[];
  currentPage: number;
  hasNextPage: boolean;
};

const PAGE_SIZE = 50;
const SOURCE_PAGE_COUNT = 10;

function getSourcePages(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index + 1);
}

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

const profileCache = new Map<number, Promise<PlayerProfileData>>();

async function fetchPlayerProfileData(
  profileId: number
): Promise<PlayerProfileData> {
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

async function getPlayerProfileData(
  profileId: number
): Promise<PlayerProfileData> {
  const cached = profileCache.get(profileId);
  if (cached) {
    return cached;
  }

  const promise = fetchPlayerProfileData(profileId).catch((error) => {
    profileCache.delete(profileId);
    throw error;
  });

  profileCache.set(profileId, promise);
  return promise;
}

async function getItalianLeaderboardBase(): Promise<LeaderboardPlayer[]> {
  const sourcePages = getSourcePages(SOURCE_PAGE_COUNT);

  const leaderboardResponses = await Promise.all(
    sourcePages.map(async (page) => {
      const res = await fetch(
        `https://aoe4world.com/api/v0/leaderboards/rm_solo?country=it&page=${page}`,
        {
          next: { revalidate: 300 },
        }
      );

      if (!res.ok) {
        throw new Error("Errore nel recupero leaderboard italiana AoE4World");
      }

      const data: LeaderboardResponse = await res.json();
      return normalizeLeaderboardResponse(data);
    })
  );

  const mergedPlayers = leaderboardResponses.flat();

  const dedupedPlayers = Array.from(
    new Map(
      mergedPlayers.map((player) => [player.profile_id, player])
    ).values()
  );

  return dedupedPlayers.filter((player) => isWesternName(player.name));
}

export async function getItalianLeaderboardPageWithModeElos(
  page: number = 1
): Promise<ItalianLeaderboardPageResult> {
  const safePage = Math.max(1, page);

  const basePlayers = await getItalianLeaderboardBase();

  const playersWithProfiles = await Promise.all(
    basePlayers.map(async (player) => {
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

  const sortedPlayers = [...playersWithProfiles].sort((a, b) => {
    const aElo = a.rating1v1 ?? -Infinity;
    const bElo = b.rating1v1 ?? -Infinity;
    return bElo - aElo;
  });

  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;

  return {
    players: sortedPlayers.slice(startIndex, endIndex),
    currentPage: safePage,
    hasNextPage: endIndex < sortedPlayers.length,
  };
}

export async function getPlayersByProfileIdsWithModeElos(
  profileIds: number[]
): Promise<LeaderboardPlayer[]> {
  const uniqueProfileIds = Array.from(
    new Set(
      profileIds.filter(
        (id): id is number => typeof id === "number" && Number.isFinite(id)
      )
    )
  );

  if (uniqueProfileIds.length === 0) {
    return [];
  }

  const players = await Promise.all(
    uniqueProfileIds.map(async (profileId) => {
      const res = await fetch(
        `https://aoe4world.com/api/v0/players/${profileId}`,
        {
          next: { revalidate: 300 },
        }
      );

      if (!res.ok) {
        return null;
      }

      const data: PlayerProfileResponse = await res.json();
      const profileData = await getPlayerProfileData(profileId);

      const rating1v1 =
        profileData.rating1v1 ?? toNullableNumber(data.modes?.rm_1v1_elo?.rating);

      return {
        profile_id: profileId,
        name: toNullableString(data.name) ?? `Player ${profileId}`,
        rating: rating1v1 ?? 0,
        rank: 0,
        avatarSmall: profileData.avatarSmall,
        rating1v1,
        rating2v2: profileData.rating2v2,
        rating3v3: profileData.rating3v3,
        rating4v4: profileData.rating4v4,
        soloRankLevel: profileData.soloRankLevel,
        teamRankLevel: profileData.teamRankLevel,
        topCivilizations: profileData.topCivilizations,
      } satisfies LeaderboardPlayer;
    })
  );

  return players.filter(
    (player): player is LeaderboardPlayer => player !== null
  );
}