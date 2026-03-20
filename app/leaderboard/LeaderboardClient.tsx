"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { LeaderboardPlayer } from "@/app/lib/aoe4world";

type SortKey =
  | "rank"
  | "name"
  | "rating1v1"
  | "rating2v2"
  | "rating3v3"
  | "rating4v4";

type SortDirection = "asc" | "desc";

type LeaderboardClientProps = {
  initialPlayers: LeaderboardPlayer[];
  currentPage: number;
  hasNextPage: boolean;
};

function getRankBadgeClass(position: number) {
  if (position === 1) return "bg-[#f0b90b] text-[#07122d]";
  if (position === 2) return "bg-[#c7d2e0] text-[#07122d]";
  if (position === 3) return "bg-[#b97745] text-white";
  return "bg-[#111d3a] text-white";
}

function formatRating(
  value?: number | null,
  position?: number,
  mode?: "1v1" | "2v2" | "3v3" | "4v4"
) {
  if (value == null) {
    return <span>-</span>;
  }

  let className = "text-white";

  if (mode === "4v4") {
    if (position === 1) className = "text-red-400";
    else if (position === 2) className = "text-[#ffd54a]";
    else if (position === 3) className = "text-[#c7d2e0]";
    else if (position === 4) className = "text-[#b97745]";
  } else {
    if (position === 1) className = "text-[#ffd54a]";
    else if (position === 2) className = "text-[#c7d2e0]";
    else if (position === 3) className = "text-[#b97745]";
  }

  return <span className={`text-xl font-bold ${className}`}>{value}</span>;
}

function getSoloLeagueIcon(rankLevel?: string | null) {
  if (!rankLevel) return null;

  const map: Record<string, string> = {
    conqueror_1: "/images/icon/solo_icon/solo_conq1.svg",
    conqueror_2: "/images/icon/solo_icon/solo_conq2.svg",
    conqueror_3: "/images/icon/solo_icon/solo_conq3.svg",

    diamond_1: "/images/icon/solo_icon/solo_diam1.svg",
    diamond_2: "/images/icon/solo_icon/solo_diam2.svg",
    diamond_3: "/images/icon/solo_icon/solo_diam3.svg",

    platinum_1: "/images/icon/solo_icon/solo_plat1.svg",
    platinum_2: "/images/icon/solo_icon/solo_plat2.svg",
    platinum_3: "/images/icon/solo_icon/solo_plat3.svg",

    gold_1: "/images/icon/solo_icon/solo_gold1.svg",
    gold_2: "/images/icon/solo_icon/solo_gold2.svg",
    gold_3: "/images/icon/solo_icon/solo_gold3.svg",

    silver_1: "/images/icon/solo_icon/solo_silv1.svg",
    silver_2: "/images/icon/solo_icon/solo_silv2.svg",
    silver_3: "/images/icon/solo_icon/solo_silv3.svg",

    bronze_1: "/images/icon/solo_icon/solo_bron1.svg",
    bronze_2: "/images/icon/solo_icon/solo_bron2.svg",
    bronze_3: "/images/icon/solo_icon/solo_bron3.svg",
  };

  return map[rankLevel.toLowerCase()] ?? null;
}

function getTeamLeagueIcon(rankLevel?: string | null) {
  if (!rankLevel) return null;

  const map: Record<string, string> = {
    conqueror_1: "/images/icon/team_icon/team_conq1.svg",
    conqueror_2: "/images/icon/team_icon/team_conq2.svg",
    conqueror_3: "/images/icon/team_icon/team_conq3.svg",

    diamond_1: "/images/icon/team_icon/team_diam1.svg",
    diamond_2: "/images/icon/team_icon/team_diam2.svg",
    diamond_3: "/images/icon/team_icon/team_diam3.svg",

    platinum_1: "/images/icon/team_icon/team_plat1.svg",
    platinum_2: "/images/icon/team_icon/team_plat2.svg",
    platinum_3: "/images/icon/team_icon/team_plat3.svg",

    gold_1: "/images/icon/team_icon/team_gold1.svg",
    gold_2: "/images/icon/team_icon/team_gold2.svg",
    gold_3: "/images/icon/team_icon/team_gold3.svg",

    silver_1: "/images/icon/team_icon/team_silv1.svg",
    silver_2: "/images/icon/team_icon/team_silv2.svg",
    silver_3: "/images/icon/team_icon/team_silv3.svg",

    bronze_1: "/images/icon/team_icon/team_bron1.svg",
    bronze_2: "/images/icon/team_icon/team_bron2.svg",
    bronze_3: "/images/icon/team_icon/team_bron3.svg",
  };

  return map[rankLevel.toLowerCase()] ?? null;
}

function getLeagueGlow(rankLevel?: string | null) {
  if (!rankLevel) return "";

  const level = rankLevel.toLowerCase();

  if (level.startsWith("conqueror")) return "league-glow-conqueror";
  if (level.startsWith("diamond")) return "league-glow-diamond";
  if (level.startsWith("platinum")) return "league-glow-platinum";
  if (level.startsWith("gold")) return "league-glow-gold";
  if (level.startsWith("silver")) return "league-glow-silver";
  if (level.startsWith("bronze")) return "league-glow-bronze";

  return "";
}

export default function LeaderboardClient({
  initialPlayers,
  currentPage,
  hasNextPage,
}: LeaderboardClientProps) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("rating1v1");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  function sortPlayers(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection(key === "name" ? "asc" : "desc");
    }
  }

  function getSortArrow(key: SortKey) {
    if (sortKey !== key) {
      return <span className="ml-2 text-[#4c5875]">↕</span>;
    }

    return (
      <span className="ml-2 text-[#f0b90b]">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  }

  const sortedPlayers = useMemo(() => {
    return [...initialPlayers].sort((a, b) => {
      let aValue: string | number | null | undefined =
        a[sortKey as keyof LeaderboardPlayer] as
          | string
          | number
          | null
          | undefined;
      let bValue: string | number | null | undefined =
        b[sortKey as keyof LeaderboardPlayer] as
          | string
          | number
          | null
          | undefined;

      if (sortKey === "rank") {
        aValue = a.rank;
        bValue = b.rank;
      }

      if (typeof aValue === "string" || typeof bValue === "string") {
        const aString = String(aValue ?? "");
        const bString = String(bValue ?? "");

        return sortDirection === "asc"
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      }

      const aNumber = aValue ?? -1;
      const bNumber = bValue ?? -1;

      return sortDirection === "asc"
        ? Number(aNumber) - Number(bNumber)
        : Number(bNumber) - Number(aNumber);
    });
  }, [initialPlayers, sortKey, sortDirection]);

  const top1v1Ids = useMemo(
    () =>
      [...initialPlayers]
        .sort((a, b) => (b.rating1v1 ?? -1) - (a.rating1v1 ?? -1))
        .map((player) => player.profile_id),
    [initialPlayers]
  );

  const top2v2Ids = useMemo(
    () =>
      [...initialPlayers]
        .sort((a, b) => (b.rating2v2 ?? -1) - (a.rating2v2 ?? -1))
        .map((player) => player.profile_id),
    [initialPlayers]
  );

  const top3v3Ids = useMemo(
    () =>
      [...initialPlayers]
        .sort((a, b) => (b.rating3v3 ?? -1) - (a.rating3v3 ?? -1))
        .map((player) => player.profile_id),
    [initialPlayers]
  );

  const top4v4Ids = useMemo(
    () =>
      [...initialPlayers]
        .sort((a, b) => (b.rating4v4 ?? -1) - (a.rating4v4 ?? -1))
        .map((player) => player.profile_id),
    [initialPlayers]
  );

  function getPositionByMode(profileId: number, ids: number[]) {
    const index = ids.indexOf(profileId);
    return index >= 0 ? index + 1 : undefined;
  }

  function goToPreviousPage() {
    if (currentPage <= 1) return;
    router.push(`/leaderboard?page=${currentPage - 1}`);
  }

  function goToNextPage() {
    if (!hasNextPage) return;
    router.push(`/leaderboard?page=${currentPage + 1}`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020b26] text-white">
      <section className="relative z-10 mx-auto max-w-[1800px] px-8 py-16">
        <div className="rounded-[28px] border border-white/8 bg-[#0f1a36]/95 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1500px] border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm uppercase tracking-[0.22em] text-[#7f8aa3]">
                  <th className="px-4 py-2">Pos IT</th>

                  <th className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => sortPlayers("rank")}
                      className="inline-flex items-center uppercase tracking-[0.22em] hover:text-white"
                    >
                      Rank Globale {getSortArrow("rank")}
                    </button>
                  </th>

                  <th className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => sortPlayers("name")}
                      className="inline-flex items-center uppercase tracking-[0.22em] hover:text-white"
                    >
                      Player {getSortArrow("name")}
                    </button>
                  </th>

                  <th className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => sortPlayers("rating1v1")}
                      className="inline-flex items-center uppercase tracking-[0.22em] hover:text-white"
                    >
                      1v1 {getSortArrow("rating1v1")}
                    </button>
                  </th>

                  <th className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => sortPlayers("rating2v2")}
                      className="inline-flex items-center uppercase tracking-[0.22em] hover:text-white"
                    >
                      2v2 {getSortArrow("rating2v2")}
                    </button>
                  </th>

                  <th className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => sortPlayers("rating3v3")}
                      className="inline-flex items-center uppercase tracking-[0.22em] hover:text-white"
                    >
                      3v3 {getSortArrow("rating3v3")}
                    </button>
                  </th>

                  <th className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => sortPlayers("rating4v4")}
                      className="inline-flex items-center uppercase tracking-[0.22em] hover:text-white"
                    >
                      4v4 {getSortArrow("rating4v4")}
                    </button>
                  </th>

                  <th className="px-4 py-2">Solo</th>
                  <th className="px-4 py-2">Team</th>
                  <th className="px-4 py-2">Profile</th>
                </tr>
              </thead>

              <tbody>
                {sortedPlayers.map((player, index) => {
                  const absoluteIndex = (currentPage - 1) * 50 + index + 1;

                  const pos1v1 = getPositionByMode(
                    player.profile_id,
                    top1v1Ids
                  );
                  const pos2v2 = getPositionByMode(
                    player.profile_id,
                    top2v2Ids
                  );
                  const pos3v3 = getPositionByMode(
                    player.profile_id,
                    top3v3Ids
                  );
                  const pos4v4 = getPositionByMode(
                    player.profile_id,
                    top4v4Ids
                  );

                  return (
                    <tr key={player.profile_id} className="bg-[#07122d]">
                      <td className="px-4 py-4">
                        <div
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl font-bold ${getRankBadgeClass(
                            absoluteIndex
                          )}`}
                        >
                          {absoluteIndex}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="inline-flex min-w-[64px] items-center justify-center rounded-xl bg-[#111d3a] px-3 py-2 font-bold text-white">
                          {player.rank}
                        </div>
                      </td>

                      <td className="px-4 py-4 min-w-[320px]">
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              player.avatarSmall ??
                              "/images/placeholder_pic.avif"
                            }
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

                      <td className="px-4 py-4">
                        {formatRating(player.rating1v1, pos1v1, "1v1")}
                      </td>

                      <td className="px-4 py-4">
                        {formatRating(player.rating2v2, pos2v2, "2v2")}
                      </td>

                      <td className="px-4 py-4">
                        {formatRating(player.rating3v3, pos3v3, "3v3")}
                      </td>

                      <td className="px-4 py-4">
                        {formatRating(player.rating4v4, pos4v4, "4v4")}
                      </td>

                      <td className="px-4 py-4 text-center">
                        {getSoloLeagueIcon(player.soloRankLevel) ? (
                          <div
                            className={`inline-flex items-center justify-center ${getLeagueGlow(
                              player.soloRankLevel
                            )}`}
                          >
                            <img
                              src={getSoloLeagueIcon(player.soloRankLevel)!}
                              alt={player.soloRankLevel ?? "rank"}
                              className="h-10 w-10"
                            />
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-4 py-4 text-center">
                        {getTeamLeagueIcon(player.teamRankLevel) ? (
                          <div
                            className={`inline-flex items-center justify-center ${getLeagueGlow(
                              player.teamRankLevel
                            )}`}
                          >
                            <img
                              src={getTeamLeagueIcon(player.teamRankLevel)!}
                              alt={player.teamRankLevel ?? "rank"}
                              className="h-10 w-10"
                            />
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <a
                          href={`https://aoe4world.com/players/${player.profile_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#f0b90b] hover:underline"
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

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="text-sm text-[#8d99b3]">Pagina {currentPage}</div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="rounded-xl border border-white/10 bg-[#111d3a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#16264a] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Precedente
              </button>

              <button
                type="button"
                onClick={goToNextPage}
                disabled={!hasNextPage}
                className="rounded-xl border border-white/10 bg-[#111d3a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#16264a] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Successiva
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}