import RegionalLeaderboardPage from "@/app/leaderboard/_components/RegionalLeaderboardPage";

export default async function SouthLeaderboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  return (
    <RegionalLeaderboardPage
      region="south"
      searchParams={searchParams}
    />
  );
}