import LeaderboardClient from "@/app/leaderboard/LeaderboardClient";
import { getRegionalLeaderboardPage } from "@/app/lib/regionLeaderboard";
import type { RegionalCategory } from "@/app/lib/leaderboardRegions";

type RegionalLeaderboardPageProps = {
  region: RegionalCategory;
  searchParams?: Promise<{ page?: string }>;
};

function getRegionalTexts(region: RegionalCategory) {
  switch (region) {
    case "switzerland":
      return {
        eyebrow: "Leaderboard regionale",
        title: "Classifica Elvetica",
        basePath: "/leaderboard/switzerland",
        icon: "/images/icon/flags/swit.gif",
        background: "/images/icon/flags/swit.gif", 
        anthem: "/audio/inno_svizzero.mp3",
      };
    case "north":
      return {
        eyebrow: "Leaderboard regionale",
        title: "Classifica Nord",
        basePath: "/leaderboard/north",
        icon: "/images/icon/flags/padania.gif",
      };
    case "center":
      return {
        eyebrow: "Leaderboard regionale",
        title: "Classifica Centro",
        basePath: "/leaderboard/center",
        icon: "/images/icon/flags/papal.gif",
      };
    case "south":
      return {
        eyebrow: "Leaderboard regionale",
        title: "Classifica Sud",
        basePath: "/leaderboard/south",
        icon: "/images/icon/flags/2sicilie.gif",
      };
  }
}

export default async function RegionalLeaderboardPage({
  region,
  searchParams,
}: RegionalLeaderboardPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const page = Number(resolvedSearchParams?.page ?? "1");

  const { players, currentPage, hasNextPage } =
    await getRegionalLeaderboardPage(region, page);

  const { eyebrow, title, basePath, icon, background, anthem } = getRegionalTexts(region);

  return (
    <LeaderboardClient
      initialPlayers={players}
      currentPage={currentPage}
      hasNextPage={hasNextPage}
      eyebrow={eyebrow}
      title={title}
      basePath={basePath}
      icon={icon}
      background={background}
      anthem={anthem}
    />
  );
}