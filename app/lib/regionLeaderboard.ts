import leaderboardRegions from "@/app/data/leaderboardRegions.json";
import type { LeaderboardPlayer } from "@/app/lib/aoe4world";
import { getPlayersByProfileIdsWithModeElos } from "@/app/lib/aoe4world";
import {
  filterProfileIdsByRegion,
  type PlayerRegionEntry,
  type RegionalCategory,
} from "@/app/lib/leaderboardRegions";

const PAGE_SIZE = 50;

export async function getRegionalLeaderboardPage(
  region: RegionalCategory,
  page: number
): Promise<{
  players: LeaderboardPlayer[];
  currentPage: number;
  hasNextPage: boolean;
}> {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;

  const allProfileIds = filterProfileIdsByRegion(
    leaderboardRegions as PlayerRegionEntry[],
    region
  );
console.log("REGION", region);
console.log("JSON", leaderboardRegions);
console.log("ALL PROFILE IDS", allProfileIds);

  const start = (safePage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const pageProfileIds = allProfileIds.slice(start, end);
  const hasNextPage = end < allProfileIds.length;

  if (pageProfileIds.length === 0) {
    return {
      players: [],
      currentPage: safePage,
      hasNextPage: false,
    };
  }

  const players = await getPlayersByProfileIdsWithModeElos(pageProfileIds);

  const orderMap = new Map(
    pageProfileIds.map((profileId, index) => [profileId, index])
  );

  const orderedPlayers = [...players].sort((a, b) => {
    const aIndex = orderMap.get(a.profile_id) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = orderMap.get(b.profile_id) ?? Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex;
  });

  return {
    players: orderedPlayers,
    currentPage: safePage,
    hasNextPage,
  };
}