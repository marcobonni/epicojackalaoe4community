import RegionalLeaderboardPage from "@/app/leaderboard/_components/RegionalLeaderboardPage";

export default async function SwitzerlandLeaderboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  return (
    <RegionalLeaderboardPage
      region="switzerland"
      searchParams={searchParams}
    />
  );
}