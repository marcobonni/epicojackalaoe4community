import { getItalianTop100WithModeElos } from "@/app/lib/aoe4world";
import LeaderboardClient from "./LeaderboardClient";

export default async function LeaderboardPage() {
  const initialPlayers = await getItalianTop100WithModeElos();

  return <LeaderboardClient initialPlayers={initialPlayers} />;
}