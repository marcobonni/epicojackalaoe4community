"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
  eyebrow?: string;
  title?: string;
  basePath?: string;
  icon?: string;
  background?: string;
  anthem?: string;
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
  mode?: "1v1" | "2v2" | "3v3" | "4v4",
  small?: boolean
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

  return <span className={`${small ? "text-sm" : "text-xl"} font-bold ${className}`}>{value}</span>;
}

function getSoloLeagueIcon(rankLevel?: string | null) {
  if (!rankLevel) return "/images/icon/solo_icon/solo_unranked.svg";

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

    unranked: "/images/icon/solo_icon/solo_unranked.svg",
  };

  return map[rankLevel.toLowerCase()] ?? map["unranked"];
}

function getTeamLeagueIcon(rankLevel?: string | null) {
  if (!rankLevel) return "/images/icon/team_icon/team_unranked.svg";

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

    unranked: "/images/icon/team_icon/team_unranked.svg",
  };

  return map[rankLevel.toLowerCase()] ?? map["unranked"];
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

function getCivilizationIcon(civ: string) {
  const map: Record<string, string> = {
    abbasid_dynasty: "/images/civs/ab.png",
    ayyubids: "/images/civs/ay.png",
    byzantines: "/images/civs/by.png",
    chinese: "/images/civs/ch.png",
    delhi_sultanate: "/images/civs/de.png",
    english: "/images/civs/en.png",
    french: "/images/civs/fr.png",
    golden_horde: "/images/civs/gh.png",
    holy_roman_empire: "/images/civs/hre.png",
    house_of_lancaster: "/images/civs/hl.png",
    japanese: "/images/civs/jap.png",
    jeanne_darc: "/images/civs/jd.png",
    knights_templar: "/images/civs/kt.png",
    macedonian_dynasty: "/images/civs/mac.png",
    malians: "/images/civs/ma.png",
    mongols: "/images/civs/mo.png",
    order_of_the_dragon: "/images/civs/ootd.png",
    ottomans: "/images/civs/ot.png",
    rus: "/images/civs/ru.png",
    sengoku_daimyo: "/images/civs/sen.png",
    tughlaq_dynasty: "/images/civs/tugh.png",
    zhu_xis_legacy: "/images/civs/zhu.png",
  };

  return map[civ] ?? "/images/civs/generic_flag.png";
}

function formatCivilizationName(civ: string) {
  return civ
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function LeaderboardClient({
  initialPlayers,
  currentPage,
  hasNextPage,
  eyebrow = "Leaderboard italiana",
  title = "Classifica AoE4 Italia",
  basePath = "/leaderboard",
  icon,
  background,
  anthem,
}: LeaderboardClientProps) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("rating1v1");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pageInput, setPageInput] = useState(String(currentPage));
  const [activeBackground, setActiveBackground] = useState(background);
  const dollarPressesRef = useRef<number[]>([]);
  const anthemAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
  if (!anthem || !anthemAudioRef.current) return;

  const audio = anthemAudioRef.current;
  audio.volume = 0.35;

  audio.play().catch(() => {
    // alcuni browser bloccano autoplay con audio
  });
}, [anthem]);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    setActiveBackground(background);
  }, [background]);

  useEffect(() => {
    if (!background) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "$") return;

      const now = Date.now();

      dollarPressesRef.current = [...dollarPressesRef.current, now].filter(
        (timestamp) => now - timestamp <= 30_000
      );

      if (dollarPressesRef.current.length >= 3) {
        setActiveBackground("/images/icon/flags/israel.gif");
        dollarPressesRef.current = [];
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [background]);

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
    router.push(`${basePath}?page=${currentPage - 1}`);
  }

  function goToNextPage() {
    if (!hasNextPage) return;
    router.push(`${basePath}?page=${currentPage + 1}`);
  }

  function goToPage(page: number) {
    if (page < 1) return;
    router.push(`${basePath}?page=${page}`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      {anthem && <audio ref={anthemAudioRef} src={anthem} preload="auto" hidden />}
      {activeBackground && (
        <div className="absolute inset-0 z-0">
          <img
            src={activeBackground}
            alt="background"
            className="h-full w-full object-cover brightness-200 saturate-200"
          />
          <div className="absolute inset-0 bg-[#020b26]/80" />
        </div>
      )}

      {!activeBackground && <div className="absolute inset-0 bg-[#020b26]" />}

      <section className="relative z-10 mx-auto max-w-[1800px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {icon && (
              <img
                src={icon}
                alt="flag"
                className="h-12 w-12 rounded-lg object-cover shadow-[0_0_12px_rgba(255,255,255,0.15)]"
              />
            )}

            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8d99b3]">
                {eyebrow}
              </div>
              <h1 className="mt-1 text-3xl font-bold text-white md:text-4xl">
                {title}
              </h1>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-[#111d3a] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-[#16264a]"
          >
            ← Torna alla home
          </Link>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-[#0f1a36]/95 p-4 sm:p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          {/* Mobile card view */}
          <div className="block md:hidden space-y-3">
            {sortedPlayers.map((player, index) => {
              const absoluteIndex = (currentPage - 1) * 50 + index + 1;
              const pos1v1 = getPositionByMode(player.profile_id, top1v1Ids);
              const pos2v2 = getPositionByMode(player.profile_id, top2v2Ids);
              const pos3v3 = getPositionByMode(player.profile_id, top3v3Ids);
              const pos4v4 = getPositionByMode(player.profile_id, top4v4Ids);

              return (
                <div
                  key={player.profile_id}
                  className="rounded-2xl bg-[#07122d] px-4 py-3 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${getRankBadgeClass(absoluteIndex)}`}
                    >
                      {absoluteIndex}
                    </div>

                    <img
                      src={player.avatarSmall ?? "/images/placeholder_pic.avif"}
                      alt={player.name}
                      className="h-10 w-10 shrink-0 rounded-xl border border-white/10 object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-white text-sm">
                        {player.name}
                      </div>
                      <div className="text-xs text-[#8d99b3]">
                        Rank Globale: {player.rank}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <div className={`inline-flex items-center justify-center ${getLeagueGlow(player.soloRankLevel)}`}>
                        <img
                          src={getSoloLeagueIcon(player.soloRankLevel)}
                          alt={player.soloRankLevel ?? "unranked"}
                          className="h-8 w-8"
                        />
                      </div>
                      <div className={`inline-flex items-center justify-center ${getLeagueGlow(player.teamRankLevel)}`}>
                        <img
                          src={getTeamLeagueIcon(player.teamRankLevel)}
                          alt={player.teamRankLevel ?? "unranked"}
                          className="h-8 w-8"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-4 gap-1 text-center text-xs">
                    <div>
                      <div className="text-[#7f8aa3] font-semibold">1v1</div>
                      <div>{formatRating(player.rating1v1, pos1v1, "1v1", true)}</div>
                    </div>
                    <div>
                      <div className="text-[#7f8aa3] font-semibold">2v2</div>
                      <div>{formatRating(player.rating2v2, pos2v2, "2v2", true)}</div>
                    </div>
                    <div>
                      <div className="text-[#7f8aa3] font-semibold">3v3</div>
                      <div>{formatRating(player.rating3v3, pos3v3, "3v3", true)}</div>
                    </div>
                    <div>
                      <div className="text-[#7f8aa3] font-semibold">4v4</div>
                      <div>{formatRating(player.rating4v4, pos4v4, "4v4", true)}</div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-1">
                      {player.topCivilizations && player.topCivilizations.length > 0 ? (
                        player.topCivilizations.map((civ) => (
                          <img
                            key={civ}
                            src={getCivilizationIcon(civ)}
                            alt={formatCivilizationName(civ)}
                            className="h-7 w-7 object-contain"
                            title={formatCivilizationName(civ)}
                          />
                        ))
                      ) : (
                        <img
                          src="/images/civs/generic_flag.png"
                          alt="unknown"
                          className="h-7 w-7 object-contain opacity-70"
                        />
                      )}
                    </div>

                    <a
                      href={`https://aoe4world.com/players/${player.profile_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-xl border border-[#f0b90b]/25 bg-[#f0b90b]/10 px-3 py-1.5 text-xs font-semibold text-[#f7cf59] transition hover:bg-[#f0b90b]/20"
                    >
                      View
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[1650px] border-separate border-spacing-y-3">
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
                  <th className="px-4 py-2">Top 3 Civ</th>
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

                      <td className="min-w-[320px] px-4 py-4">
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
                        <div
                          className={`inline-flex items-center justify-center ${getLeagueGlow(
                            player.soloRankLevel
                          )}`}
                        >
                          <img
                            src={getSoloLeagueIcon(player.soloRankLevel)}
                            alt={player.soloRankLevel ?? "unranked"}
                            className="h-10 w-10"
                          />
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <div
                          className={`inline-flex items-center justify-center ${getLeagueGlow(
                            player.teamRankLevel
                          )}`}
                        >
                          <img
                            src={getTeamLeagueIcon(player.teamRankLevel)}
                            alt={player.teamRankLevel ?? "unranked"}
                            className="h-10 w-10"
                          />
                        </div>
                      </td>

                      <td className="min-w-[220px] px-4 py-4">
                        <div className="flex gap-2">
                          {player.topCivilizations &&
                          player.topCivilizations.length > 0 ? (
                            player.topCivilizations.map((civ) => {
                              const icon = getCivilizationIcon(civ);

                              return (
                                <img
                                  key={civ}
                                  src={icon}
                                  alt={formatCivilizationName(civ)}
                                  className="h-10 w-10 object-contain"
                                  title={formatCivilizationName(civ)}
                                />
                              );
                            })
                          ) : (
                            <img
                              src="/images/civs/generic_flag.png"
                              alt="unknown"
                              className="h-10 w-10 object-contain opacity-70"
                            />
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <a
                          href={`https://aoe4community.vercel.app/player/${player.profile_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-w-[88px] items-center justify-center rounded-xl border border-[#f0b90b]/25 bg-[#f0b90b]/10 px-4 py-2 text-sm font-semibold text-[#f7cf59] transition hover:-translate-y-0.5 hover:border-[#f0b90b]/40 hover:bg-[#f0b90b]/20 hover:text-[#ffe082]"
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
          {/* End desktop table view */}

          <div className="mt-8 rounded-[24px] border border-white/8 bg-[#0b1430] px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                <Link
                  href="/"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-[#111d3a] px-4 text-sm font-semibold text-white transition hover:bg-[#16264a]"
                >
                  ← Home
                </Link>

                <div className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-[#0f1f45] px-3">
                  <span className="text-sm font-semibold text-[#b8c7e6]">
                    Pagina
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pageInput}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setPageInput(value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const page = Number(pageInput);
                        if (!Number.isNaN(page) && page > 0) goToPage(page);
                      }
                    }}
                    className="h-8 w-14 rounded-lg border border-white/10 bg-[#07122d] px-2 text-center text-sm font-bold text-white outline-none transition focus:border-[#4f7edc] focus:bg-[#0a1733]"
                    placeholder="1"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const page = Number(pageInput);
                      if (!Number.isNaN(page) && page > 0) goToPage(page);
                    }}
                    className="h-8 rounded-lg bg-[#16305f] px-3 text-sm font-semibold text-white transition hover:bg-[#1b3d79]"
                  >
                    Vai
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <button
                  type="button"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="h-11 rounded-xl border border-white/10 bg-[#111d3a] px-5 text-sm font-semibold text-white transition hover:bg-[#16264a] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Precedente
                </button>

                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={!hasNextPage}
                  className="h-11 rounded-xl border border-[#1f3b72] bg-[#16305f] px-5 text-sm font-semibold text-white transition hover:bg-[#1b3d79] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Successiva
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}