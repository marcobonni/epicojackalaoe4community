import RegionalLeaderboardPage from "@/app/leaderboard/_components/RegionalLeaderboardPage";

export default async function NorthLeaderboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  return (
    <RegionalLeaderboardPage
      region="north"
      searchParams={searchParams}
    />
  );
}