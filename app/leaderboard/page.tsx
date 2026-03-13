import { getItalianTop20WithModeElos } from "@/app/lib/aoe4world";

function getLeagueLabel(rankLevel?: string | null) {
  if (!rankLevel) return "Unranked";

  return rankLevel
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getRankBadgeClass(index: number) {
  if (index === 0) return "bg-[#f0b90b] text-[#07122d]";
  if (index === 1) return "bg-[#c7d2e0] text-[#07122d]";
  if (index === 2) return "bg-[#b97745] text-white";
  return "bg-[#111d3a] text-white";
}

function formatRating(value?: number | null) {
  return value ?? "-";
}

function getLeaguePillClass(rankLevel?: string | null) {
  const normalized = (rankLevel ?? "").toLowerCase();

  if (normalized.startsWith("conqueror")) {
    return "border-[#f0b90b]/40 bg-[#f0b90b]/15 text-[#ffd54a]";
  }

  if (normalized.startsWith("diamond")) {
    return "border-[#7dd3fc]/40 bg-[#7dd3fc]/15 text-[#bae6fd]";
  }

  if (normalized.startsWith("platinum")) {
    return "border-[#67e8f9]/40 bg-[#67e8f9]/15 text-[#cffafe]";
  }

  if (normalized.startsWith("gold")) {
    return "border-[#facc15]/40 bg-[#facc15]/15 text-[#fde68a]";
  }

  if (normalized.startsWith("silver")) {
    return "border-[#cbd5e1]/40 bg-[#cbd5e1]/15 text-[#e2e8f0]";
  }

  if (normalized.startsWith("bronze")) {
    return "border-[#d97745]/40 bg-[#d97745]/15 text-[#fdba74]";
  }

  return "border-white/10 bg-white/5 text-[#c2cbe0]";
}

export default async function LeaderboardPage() {
  const players = await getItalianTop20WithModeElos();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020b26] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#ff9b2f]/10 blur-[140px]" />
        <div className="absolute right-0 top-20 h-[420px] w-[420px] rounded-full bg-[#0d2f6b]/20 blur-[140px]" />
      </div>

      <section className="relative z-10 mx-auto max-w-[1800px] px-8 py-16">
        <div className="rounded-[28px] border border-white/8 bg-[#0f1a36]/95 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[#f0b90b]">
                Leaderboard
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white">
                Ranked Matchmaking Elo
              </h2>
              <p className="mt-2 text-[#9eabc4]">Fonte dati: AoE4World API</p>
            </div>

            <a
              href="https://aoe4world.com/leaderboard/rm_solo?country=it"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center justify-center rounded-2xl bg-[#f0b90b] px-5 py-3 font-semibold text-[#07122d] transition hover:brightness-110"
            >
              Apri su AoE4World
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1500px] border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm uppercase tracking-[0.22em] text-[#7f8aa3]">
                  <th className="px-4 py-2">Rank</th>
                  <th className="px-4 py-2">Player</th>
                  <th className="px-4 py-2">1v1</th>
                  <th className="px-4 py-2">2v2</th>
                  <th className="px-4 py-2">3v3</th>
                  <th className="px-4 py-2">4v4</th>
                  <th className="px-4 py-2">Solo League</th>
                  <th className="px-4 py-2">Team League</th>
                  <th className="px-4 py-2 min-w-[120px]">Profile</th>
                </tr>
              </thead>

              <tbody>
                {players.map((player, index) => {
                  const isTop3 = index < 3;

                  return (
                    <tr key={player.profile_id} className="bg-[#07122d]">
                      <td className="rounded-l-2xl border-y border-l border-white/8 px-4 py-4">
                        <div
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl font-bold ${getRankBadgeClass(
                            index
                          )}`}
                        >
                          {index + 1}
                        </div>
                      </td>

                      <td className="border-y border-white/8 px-4 py-4 min-w-[320px]">
                        <div className="flex items-center gap-4">
                          <img
                            src={player.avatarSmall ?? "https://placehold.co/48x48/png"}
                            alt={player.name}
                            className="h-12 w-12 rounded-xl border border-white/10 object-cover"
                          />

                          <div className="min-w-0">
                            <div className="truncate font-semibold text-white">
                              {player.name}
                            </div>
                            <div className="mt-1 text-sm text-[#8d99b3]">
                              Profile ID: {player.profile_id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="border-y border-white/8 px-4 py-4">
                        <span
                          className={`text-xl font-bold ${
                            isTop3 ? "text-[#ffd54a]" : "text-white"
                          }`}
                        >
                          {formatRating(player.rating1v1)}
                        </span>
                      </td>

                      <td className="border-y border-white/8 px-4 py-4 text-white">
                        {formatRating(player.rating2v2)}
                      </td>

                      <td className="border-y border-white/8 px-4 py-4 text-white">
                        {formatRating(player.rating3v3)}
                      </td>

                      <td className="border-y border-white/8 px-4 py-4 text-white">
                        {formatRating(player.rating4v4)}
                      </td>

                      <td className="border-y border-white/8 px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${getLeaguePillClass(
                            player.soloRankLevel
                          )}`}
                        >
                          {getLeagueLabel(player.soloRankLevel)}
                        </span>
                      </td>

                      <td className="border-y border-white/8 px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${getLeaguePillClass(
                            player.teamRankLevel
                          )}`}
                        >
                          {getLeagueLabel(player.teamRankLevel)}
                        </span>
                      </td>

                      <td className="rounded-r-2xl border-y border-r border-white/8 px-4 py-4 min-w-[120px]">
                        <a
                          href={`https://aoe4world.com/players/${player.profile_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-xl border border-[#f0b90b]/30 bg-[#141c34] px-4 py-2 font-medium text-[#f0b90b] transition hover:bg-[#1a2544]"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}