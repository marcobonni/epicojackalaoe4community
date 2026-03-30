import MatchmakingClient from "@/app/components/matchmaking/MatchMakingClient";

export default function MatchmakingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.10),transparent_30%)]" />
      <div className="relative">
        <MatchmakingClient />
      </div>
    </main>
  );
}