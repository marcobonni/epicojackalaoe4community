"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

const leaderboardTabs = [
  {
    label: "Italia",
    href: "/leaderboard",
    accent: "from-amber-300/70 via-amber-200/24 to-transparent",
    activeClass:
      "border-amber-200/35 border-b-transparent bg-[linear-gradient(180deg,rgba(110,76,6,0.98),rgba(56,38,6,0.98))] text-[#fff3c6] shadow-[0_22px_46px_rgba(112,76,10,0.34)]",
    inactiveClass:
      "translate-y-3 border-amber-200/16 bg-[linear-gradient(180deg,rgba(76,55,10,0.72),rgba(38,28,7,0.8))] text-[#f8df96] shadow-[0_16px_32px_rgba(86,61,8,0.2)] hover:-translate-y-0.5 hover:border-amber-200/28 hover:bg-[linear-gradient(180deg,rgba(94,67,13,0.82),rgba(46,33,8,0.88))] hover:text-[#fff4cf]",
    dotClass:
      "bg-amber-200 shadow-[0_0_14px_rgba(243,200,107,0.85)]",
    dotInactiveClass: "bg-amber-200/45 group-hover:bg-amber-200/75",
  },
  {
    label: "Nord",
    href: "/leaderboard/nord",
    accent: "from-[#d9b265]/70 via-[#d9b265]/24 to-transparent",
    activeClass:
      "border-[#d9b265]/34 border-b-transparent bg-[linear-gradient(180deg,rgba(94,67,13,0.98),rgba(46,33,8,0.98))] text-[#fff3d4] shadow-[0_22px_46px_rgba(112,76,10,0.3)]",
    inactiveClass:
      "translate-y-3 border-[#d9b265]/16 bg-[linear-gradient(180deg,rgba(76,55,10,0.76),rgba(38,28,7,0.82))] text-[#f0d7a0] shadow-[0_16px_32px_rgba(86,61,8,0.2)] hover:-translate-y-0.5 hover:border-[#d9b265]/28 hover:bg-[linear-gradient(180deg,rgba(94,67,13,0.84),rgba(46,33,8,0.88))] hover:text-[#fff4cf]",
    dotClass:
      "bg-[#f0d7a0] shadow-[0_0_14px_rgba(217,178,101,0.8)]",
    dotInactiveClass: "bg-[#f0d7a0]/45 group-hover:bg-[#f0d7a0]/75",
  },
  {
    label: "Centro",
    href: "/leaderboard/centro",
    accent: "from-[#d8c4a6]/68 via-[#f5ecdc]/18 to-transparent",
    activeClass:
      "border-[#d8cbb7]/34 border-b-transparent bg-[linear-gradient(180deg,rgba(131,100,72,0.98),rgba(64,42,28,0.98))] text-[#f8edd7] shadow-[0_22px_46px_rgba(92,63,34,0.28)]",
    inactiveClass:
      "translate-y-3 border-[#d8cbb7]/16 bg-[linear-gradient(180deg,rgba(109,81,58,0.76),rgba(58,38,27,0.84))] text-[#eadac0] shadow-[0_16px_32px_rgba(86,60,39,0.18)] hover:-translate-y-0.5 hover:border-[#d8cbb7]/28 hover:bg-[linear-gradient(180deg,rgba(130,96,69,0.84),rgba(69,46,32,0.9))] hover:text-white",
    dotClass:
      "bg-[#f0c86e] shadow-[0_0_14px_rgba(240,200,110,0.72)]",
    dotInactiveClass: "bg-[#f0c86e]/45 group-hover:bg-[#f0c86e]/75",
  },
  {
    label: "Sud",
    href: "/leaderboard/sud",
    accent: "from-rose-400/70 via-rose-300/24 to-transparent",
    activeClass:
      "border-rose-300/34 border-b-transparent bg-[linear-gradient(180deg,rgba(116,23,61,0.98),rgba(74,14,41,0.98))] text-[#ffe3ee] shadow-[0_22px_46px_rgba(136,26,72,0.28)]",
    inactiveClass:
      "translate-y-3 border-rose-300/16 bg-[linear-gradient(180deg,rgba(96,19,51,0.78),rgba(56,11,31,0.84))] text-[#f3bdd2] shadow-[0_16px_32px_rgba(109,22,59,0.2)] hover:-translate-y-0.5 hover:border-rose-300/28 hover:bg-[linear-gradient(180deg,rgba(116,23,61,0.86),rgba(68,13,37,0.9))] hover:text-[#fff0f6]",
    dotClass:
      "bg-rose-200 shadow-[0_0_14px_rgba(251,182,206,0.78)]",
    dotInactiveClass: "bg-rose-200/45 group-hover:bg-rose-200/75",
  },
  {
    label: "Elvetica",
    href: "/leaderboard/switzerland",
    accent: "from-[#aa221d]/70 via-[#d9b265]/24 to-transparent",
    activeClass:
      "border-[#aa221d]/34 border-b-transparent bg-[linear-gradient(180deg,rgba(127,21,23,0.98),rgba(70,12,14,0.98))] text-[#fde8e1] shadow-[0_22px_46px_rgba(127,21,23,0.28)]",
    inactiveClass:
      "translate-y-3 border-[#aa221d]/16 bg-[linear-gradient(180deg,rgba(103,18,20,0.78),rgba(58,11,13,0.84))] text-[#f2c7bd] shadow-[0_16px_32px_rgba(103,18,20,0.18)] hover:-translate-y-0.5 hover:border-[#aa221d]/28 hover:bg-[linear-gradient(180deg,rgba(127,21,23,0.86),rgba(70,12,14,0.9))] hover:text-[#fff0ec]",
    dotClass:
      "bg-[#f2c7bd] shadow-[0_0_14px_rgba(242,199,189,0.78)]",
    dotInactiveClass: "bg-[#f2c7bd]/45 group-hover:bg-[#f2c7bd]/75",
  },
] as const;

function getRankBadgeClass(position: number) {
  if (position === 1) return "bg-[#f0b90b] text-[#1a0d0c]";
  if (position === 2) return "bg-[#d8c4a6] text-[#1a0d0c]";
  if (position === 3) return "bg-[#b97745] text-white";
  return "bg-[#1c1013] text-white";
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
    else if (position === 3) className = "text-[#d8c4a6]";
    else if (position === 4) className = "text-[#b97745]";
  } else {
    if (position === 1) className = "text-[#ffd54a]";
    else if (position === 2) className = "text-[#d8c4a6]";
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
  const pathname = usePathname();
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
      return <span className="ml-2 text-[#8f7e69]">â†•</span>;
    }

    return (
      <span className="ml-2 text-[#f0b90b]">
        {sortDirection === "asc" ? "â†‘" : "â†“"}
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
          <div className="absolute inset-0 bg-[#050409]/82" />
        </div>
      )}

      {!activeBackground && <div className="absolute inset-0 bg-[#050409]" />}

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
              <div className="flex items-center gap-3">
                <div className="h-px w-10 bg-gradient-to-r from-amber-200/60 to-transparent" />
                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-[#c6b498]">
                  {eyebrow}
                </div>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
                {title}
              </h1>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-[#aa221d]/28 bg-[linear-gradient(135deg,rgba(127,21,23,0.96),rgba(70,12,14,0.96))] px-5 py-3 text-sm font-semibold text-[#fde8e1] shadow-[0_14px_36px_rgba(103,18,20,0.24)] transition hover:-translate-y-0.5 hover:border-[#d04b44]/40 hover:bg-[linear-gradient(135deg,rgba(145,27,30,0.98),rgba(80,14,16,0.98))] hover:text-white"
          >
            â† Torna alla home
          </Link>
        </div>

        <div className="mt-8">
          <div className="relative z-10 flex items-end gap-2 overflow-x-auto px-2 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {leaderboardTabs.map((tab, index) => {
              const isActive = pathname === tab.href;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  style={{ zIndex: isActive ? 40 : 30 - index }}
                  className={`group relative inline-flex min-h-[58px] shrink-0 items-center gap-2 overflow-hidden rounded-t-[1.55rem] rounded-b-[0.95rem] border px-5 py-3 text-sm font-semibold tracking-[0.01em] transition duration-300 ${
                    isActive ? tab.activeClass : tab.inactiveClass
                  }`}
                >
                  <span
                    className={`pointer-events-none absolute inset-0 ${
                      isActive
                        ? "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_42%)]"
                        : "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.07),transparent_44%)]"
                    }`}
                  />
                  <span
                    className={`pointer-events-none absolute inset-x-4 top-0 h-[2px] bg-gradient-to-r ${tab.accent}`}
                  />
                  {isActive ? (
                    <span className="pointer-events-none absolute inset-x-4 bottom-[-1px] h-[3px] rounded-full bg-[#1a0d0c]" />
                  ) : null}
                  <span
                    className={`relative h-2.5 w-2.5 rounded-full transition ${
                      isActive ? tab.dotClass : tab.dotInactiveClass
                    }`}
                  />
                  <span className="relative">{tab.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-x-8 top-5 h-full rounded-[32px] border border-white/[0.04] bg-[linear-gradient(180deg,rgba(26,14,16,0.68),rgba(12,7,9,0.5))]" />
            <div className="pointer-events-none absolute inset-x-3 top-2.5 h-full rounded-[32px] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(21,12,15,0.84),rgba(11,7,9,0.72))]" />

            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,11,14,0.98),rgba(10,6,8,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.38)] sm:p-6 md:p-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/34 to-transparent" />

          {/* Mobile card view */}
          <div className="relative block space-y-3 md:hidden">
            {sortedPlayers.map((player, index) => {
              const absoluteIndex = (currentPage - 1) * 50 + index + 1;
              const pos1v1 = getPositionByMode(player.profile_id, top1v1Ids);
              const pos2v2 = getPositionByMode(player.profile_id, top2v2Ids);
              const pos3v3 = getPositionByMode(player.profile_id, top3v3Ids);
              const pos4v4 = getPositionByMode(player.profile_id, top4v4Ids);

              return (
                <div
                  key={player.profile_id}
                  className="rounded-2xl border border-white/5 bg-[#1a0d0c] px-4 py-3"
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
                      <div className="text-xs text-[#bcae9a]">
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
                      <div className="text-[#a58e69] font-semibold">1v1</div>
                      <div>{formatRating(player.rating1v1, pos1v1, "1v1", true)}</div>
                    </div>
                    <div>
                      <div className="text-[#a58e69] font-semibold">2v2</div>
                      <div>{formatRating(player.rating2v2, pos2v2, "2v2", true)}</div>
                    </div>
                    <div>
                      <div className="text-[#a58e69] font-semibold">3v3</div>
                      <div>{formatRating(player.rating3v3, pos3v3, "3v3", true)}</div>
                    </div>
                    <div>
                      <div className="text-[#a58e69] font-semibold">4v4</div>
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
                    className="inline-flex items-center justify-center rounded-xl border border-[#d9b265]/25 bg-[#d9b265]/10 px-3 py-1.5 text-xs font-semibold text-[#f8edd7] transition hover:bg-[#d9b265]/20"
                    >
                      View
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table view */}
          <div className="relative hidden md:block overflow-x-auto">
            <table className="w-full min-w-[1360px] border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm uppercase tracking-[0.22em] text-[#a58e69]">
                  <th className="px-3 py-2">Pos IT</th>

                  <th className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => sortPlayers("name")}
                      className="inline-flex items-center uppercase tracking-[0.22em] hover:text-white"
                    >
                      Player {getSortArrow("name")}
                    </button>
                  </th>

                  <th className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => sortPlayers("rating1v1")}
                      className="inline-flex items-center uppercase tracking-[0.22em] hover:text-white"
                    >
                      1v1 {getSortArrow("rating1v1")}
                    </button>
                  </th>

                  <th className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => sortPlayers("rating2v2")}
                      className="inline-flex items-center uppercase tracking-[0.22em] hover:text-white"
                    >
                      2v2 {getSortArrow("rating2v2")}
                    </button>
                  </th>

                  <th className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => sortPlayers("rating3v3")}
                      className="inline-flex items-center uppercase tracking-[0.22em] hover:text-white"
                    >
                      3v3 {getSortArrow("rating3v3")}
                    </button>
                  </th>

                  <th className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => sortPlayers("rating4v4")}
                      className="inline-flex items-center uppercase tracking-[0.22em] hover:text-white"
                    >
                      4v4 {getSortArrow("rating4v4")}
                    </button>
                  </th>

                  <th className="px-3 py-2">Solo</th>
                  <th className="px-3 py-2">Team</th>
                  <th className="px-3 py-2">Top 3 Civ</th>
                  <th className="px-3 py-2">Profile</th>
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
                    <tr key={player.profile_id} className="bg-[#1a0d0c]">
                      <td className="px-3 py-4">
                        <div
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl font-bold ${getRankBadgeClass(
                            absoluteIndex
                          )}`}
                        >
                          {absoluteIndex}
                        </div>
                      </td>

                      <td className="min-w-[280px] px-3 py-4">
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
                            <div className="mt-1 text-sm text-[#bcae9a]">
                              Profile ID: {player.profile_id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        {formatRating(player.rating1v1, pos1v1, "1v1")}
                      </td>

                      <td className="px-3 py-4">
                        {formatRating(player.rating2v2, pos2v2, "2v2")}
                      </td>

                      <td className="px-3 py-4">
                        {formatRating(player.rating3v3, pos3v3, "3v3")}
                      </td>

                      <td className="px-3 py-4">
                        {formatRating(player.rating4v4, pos4v4, "4v4")}
                      </td>

                      <td className="px-3 py-4 text-center">
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

                      <td className="px-3 py-4 text-center">
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

                      <td className="min-w-[180px] px-3 py-4">
                        <div className="flex gap-1.5">
                          {player.topCivilizations &&
                          player.topCivilizations.length > 0 ? (
                            player.topCivilizations.map((civ) => {
                              const icon = getCivilizationIcon(civ);

                              return (
                                <img
                                  key={civ}
                                  src={icon}
                                  alt={formatCivilizationName(civ)}
                                  className="h-9 w-9 object-contain"
                                  title={formatCivilizationName(civ)}
                                />
                              );
                            })
                          ) : (
                            <img
                              src="/images/civs/generic_flag.png"
                              alt="unknown"
                              className="h-9 w-9 object-contain opacity-70"
                            />
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-4">
                    <a
                          href={`https://aoe4community.vercel.app/player/${player.profile_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-w-[76px] items-center justify-center rounded-xl border border-[#d9b265]/25 bg-[#d9b265]/10 px-3 py-2 text-sm font-semibold text-[#f8edd7] transition hover:-translate-y-0.5 hover:border-[#f0c86e]/40 hover:bg-[#d9b265]/20 hover:text-[#fff3d4]"
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

          <div className="relative mt-8 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,10,13,0.96),rgba(8,5,7,0.96))] px-5 py-4 shadow-[0_14px_36px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                <Link
                  href="/"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-[#aa221d]/28 bg-[linear-gradient(135deg,rgba(127,21,23,0.96),rgba(70,12,14,0.96))] px-4 text-sm font-semibold text-[#fde8e1] shadow-[0_12px_28px_rgba(103,18,20,0.2)] transition hover:-translate-y-0.5 hover:border-[#d04b44]/40 hover:bg-[linear-gradient(135deg,rgba(145,27,30,0.98),rgba(80,14,16,0.98))] hover:text-white"
                >
                  â† Home
                </Link>

                <div className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#d9b265]/18 bg-[linear-gradient(135deg,rgba(42,24,17,0.88),rgba(20,12,10,0.88))] px-3 shadow-[0_12px_28px_rgba(42,24,17,0.18)]">
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
                    className="h-8 w-14 rounded-lg border border-white/10 bg-[#12090b] px-2 text-center text-sm font-bold text-white outline-none transition focus:border-[#d9b265] focus:bg-[#1a0d0c]"
                    placeholder="1"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const page = Number(pageInput);
                      if (!Number.isNaN(page) && page > 0) goToPage(page);
                    }}
                    className="h-8 rounded-lg border border-amber-200/28 bg-[linear-gradient(135deg,rgba(226,168,37,0.98),rgba(181,120,12,0.98))] px-3 text-sm font-semibold text-[#1b1405] shadow-[0_10px_24px_rgba(184,127,15,0.2)] transition hover:-translate-y-0.5 hover:border-amber-100/36 hover:bg-[linear-gradient(135deg,rgba(240,186,52,1),rgba(198,132,12,1))]"
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
                  className="h-11 rounded-xl border border-[#aa221d]/24 bg-[linear-gradient(135deg,rgba(120,28,30,0.96),rgba(71,18,20,0.96))] px-5 text-sm font-semibold text-[#ffe6ef] shadow-[0_12px_28px_rgba(107,23,24,0.18)] transition hover:-translate-y-0.5 hover:border-[#d04b44]/34 hover:bg-[linear-gradient(135deg,rgba(141,33,36,0.98),rgba(84,20,22,0.98))] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Precedente
                </button>

                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={!hasNextPage}
                  className="h-11 rounded-xl border border-[#d9b265]/24 bg-[linear-gradient(135deg,rgba(185,133,95,0.96),rgba(120,82,52,0.96))] px-5 text-sm font-semibold text-[#fff3d4] shadow-[0_12px_28px_rgba(120,82,52,0.2)] transition hover:-translate-y-0.5 hover:border-[#f0c86e]/34 hover:bg-[linear-gradient(135deg,rgba(205,147,104,0.98),rgba(142,97,61,0.98))] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Successiva
                </button>
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>
      </section>
    </main>
  );
}

