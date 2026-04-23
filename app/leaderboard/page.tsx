import { getItalianLeaderboardPageWithModeElos } from "@/app/lib/aoe4world";
import LeaderboardClient from "./LeaderboardClient";
import { Metadata } from "next";

type LeaderboardPageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};
export const metadata: Metadata = {
   title: "Classifica Italiana AoE4 | AoE4 Italia Legacy",
description: "Scopri i migliori giocatori italiani di Age of Empires 4. Ranking aggiornato 1v1, 2v2, 3v3 e 4v4."
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
