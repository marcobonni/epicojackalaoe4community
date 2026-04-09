import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PlayerDashboard from "@/app/player/PlayerDashboard";
import { civIcons, getPlayerProfileById } from "@/app/lib/aoe4world";

type PlayerPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    refresh?: string;
  }>;
};

export async function generateMetadata({
  params,
}: PlayerPageProps): Promise<Metadata> {
  const { id } = await params;
  const player = await getPlayerProfileById(id);

  if (!player) {
    return {
      title: "Giocatore non trovato | Aoe4Community",
      description: "Il profilo richiesto non è disponibile.",
    };
  }

  return {
    title: `${player.name} | Dashboard giocatore AoE4`,
    description: `Statistiche, andamento ELO, ranked history e civiltà di ${player.name}.`,
  };
}

export default async function PlayerPage({
  params,
  searchParams,
}: PlayerPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const player = await getPlayerProfileById(id, {
    forceFresh: Boolean(resolvedSearchParams?.refresh),
  });

  if (!player) {
    notFound();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.10),transparent_28%)]" />
      <div className="relative">
        <PlayerDashboard player={player} civIcons={civIcons} />
      </div>
    </main>
  );
}
