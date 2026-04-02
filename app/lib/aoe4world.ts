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

type RatingHistoryPoint = {
  rating?: number | null;
  games_count?: number | null;
  wins_count?: number | null;
  streak?: number | null;
  orig_rating?: number | null;
};

type DetailedEloMode = EloMode & {
  rank?: number | null;
  streak?: number | null;
  games_count?: number | null;
  wins_count?: number | null;
  losses_count?: number | null;
  disputes_count?: number | null;
  drops_count?: number | null;
  last_game_at?: string | null;
  win_rate?: number | null;
  max_rating?: number | null;
  max_rating_7d?: number | null;
  max_rating_1m?: number | null;
  rating_history?: Record<string, RatingHistoryPoint> | null;
};

type DetailedRankedMode = RankedMode & {
  rank?: number | null;
  rating?: number | null;
  streak?: number | null;
  games_count?: number | null;
  wins_count?: number | null;
  losses_count?: number | null;
  disputes_count?: number | null;
  drops_count?: number | null;
  last_game_at?: string | null;
  win_rate?: number | null;
  season?: number | null;
  previous_seasons?: PreviousSeason[] | null;
};

type PreviousSeason = {
  season?: number | null;
  rating?: number | null;
  rank?: number | null;
  rank_level?: string | null;
  streak?: number | null;
  games_count?: number | null;
  wins_count?: number | null;
  losses_count?: number | null;
  disputes_count?: number | null;
  drops_count?: number | null;
  last_game_at?: string | null;
  win_rate?: number | null;
};

export type PlayerProfileResponse = {
  profile_id?: number;
  name?: string;
  steam_id?: string;
  country?: string;
  site_url?: string;
  avatars?: {
    small?: string | null;
    medium?: string | null;
    full?: string | null;
  } | null;
  modes?: {
    rm_solo?: DetailedRankedMode | null;
    rm_team?: DetailedRankedMode | null;
    rm_1v1_elo?: DetailedEloMode | null;
    rm_2v2_elo?: DetailedEloMode | null;
    rm_3v3_elo?: DetailedEloMode | null;
    rm_4v4_elo?: DetailedEloMode | null;
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

export const civIcons: Record<string, string> = {
  abbasid_dynasty: "/images/civs/ab.png",
  ayyubids: "/images/civs/ay.png",
  byzantines: "/images/civs/by.png",
  chinese: "/images/civs/ch.png",
  delhi_sultanate: "/images/civs/de.png",
  english: "/images/civs/en.png",
  french: "/images/civs/fr.png",
  golden_horde: "/images/civs/gh.png",
  holy_roman_empire: "/images/civs/hre.png",
  house_of_lancaster: "/images/civs/hl.png",
  japanese: "/images/civs/jap.png",
  jeanne_darc: "/images/civs/jd.png",
  knights_templar: "/images/civs/kt.png",
  macedonian_dynasty: "/images/civs/mac.png",
  malians: "/images/civs/ma.png",
  mongols: "/images/civs/mo.png",
  order_of_the_dragon: "/images/civs/ootd.png",
  ottomans: "/images/civs/ot.png",
  rus: "/images/civs/ru.png",
  sengoku_daimyo: "/images/civs/sen.png",
  tughlaq_dynasty: "/images/civs/tugh.png",
  zhu_xis_legacy: "/images/civs/zhu.png",
};

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

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

const profileCache = new Map<number, Promise<PlayerProfileData>>();
const fullProfileCache = new Map<number, Promise<PlayerProfileResponse | null>>();

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
    new Map(mergedPlayers.map((player) => [player.profile_id, player])).values()
  );

  return dedupedPlayers.filter((player) => isWesternName(player.name));
}

export async function getItalianLeaderboardPageWithModeElos(
  page: number = 1
): Promise<ItalianLeaderboardPageResult> {
  const safePage = Math.max(1, page);

  const basePlayers = await getItalianLeaderboardBase();

  const playersWithProfiles: LeaderboardPlayer[] = await Promise.all(
    basePlayers.map(async (player): Promise<LeaderboardPlayer> => {
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

  const players: Array<LeaderboardPlayer | null> = await Promise.all(
    uniqueProfileIds.map(
      async (profileId): Promise<LeaderboardPlayer | null> => {
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
          profileData.rating1v1 ??
          toNullableNumber(data.modes?.rm_1v1_elo?.rating);

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
        };
      }
    )
  );

  return players.filter(isNotNull);
}

export async function getPlayerProfileById(
  profileId: number | string
): Promise<PlayerProfileResponse | null> {
  const normalizedId =
    typeof profileId === "number" ? profileId : Number(String(profileId).trim());

  if (!Number.isFinite(normalizedId)) {
    return null;
  }

  const cached = fullProfileCache.get(normalizedId);
  if (cached) {
    return cached;
  }

  const promise = fetch(
    `https://aoe4world.com/api/v0/players/${normalizedId}`,
    {
      next: { revalidate: 300 },
    }
  )
    .then(async (res) => {
      if (!res.ok) {
        return null;
      }

      const data: PlayerProfileResponse = await res.json();

      if (!data || typeof data !== "object" || !data.profile_id) {
        return null;
      }

      return data;
    })
    .catch((error) => {
      fullProfileCache.delete(normalizedId);
      throw error;
    });

  fullProfileCache.set(normalizedId, promise);
  return promise;
}