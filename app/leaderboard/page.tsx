import { getItalianLeaderboardPageWithModeElos } from "@/app/lib/aoe4world";
import LeaderboardClient from "./LeaderboardClient";

type LeaderboardPageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

export default async function LeaderboardPage({
  searchParams,
}: LeaderboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const pageParam = Number(resolvedSearchParams?.page ?? "1");
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const result = await getItalianLeaderboardPageWithModeElos(currentPage);

  return (
    <LeaderboardClient
      initialPlayers={result.players}
      currentPage={result.currentPage}
      hasNextPage={result.hasNextPage}
    />
  );
}