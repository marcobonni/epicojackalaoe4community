import RegionalLeaderboardPage from "@/app/leaderboard/_components/RegionalLeaderboardPage";

export default async function CentroLeaderboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  return (
    <RegionalLeaderboardPage
      region="center"
      searchParams={searchParams}
    />
  );
}