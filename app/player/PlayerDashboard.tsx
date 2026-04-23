"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import PlayerLookupForm from "@/app/components/home/PlayerLookupForm";
import type { PlayerProfileResponse } from "@/app/lib/aoe4world";
import PlayerAdvancedInsights from "@/app/player/PlayerAdvancedInsights";
import PlayerSummaryDownloadButton from "@/app/player/PlayerSummaryDownloadButton";

type CivilizationStat = {
  civilization: string;
  win_rate?: number;
  pick_rate?: number;
  games_count?: number;
};

type PreviousSeason = {
  season: number;
  rating?: number;
  rank?: number | null;
  rank_level?: string | null;
  streak?: number | null;
  games_count?: number;
  wins_count?: number;
  losses_count?: number;
  win_rate?: number;
  last_game_at?: string;
};

type PerformanceRow = {
  key: string;
  label: string;
  rating: number | null;
  maxRating: number | null;
  winRate: number | null;
  rank: number | null;
  streak: number | null;
  games: number | null;
  wins: number | null;
  losses: number | null;
  lastGameAt: string | null;
  history: Array<{ ts: number; rating: number }>;
};

type PlayerDashboardProps = {
  player: PlayerProfileResponse;
  civIcons?: Record<string, string>;
};

const DEFAULT_CIV_ICON = "/images/civs/generic.png";

function formatNumber(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "â€”";
  return new Intl.NumberFormat("it-IT").format(value);
}

function formatPercent(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "â€”";
  return `${value.toFixed(1)}%`;
}

function formatDate(value?: string | null) {
  if (!value) return "â€”";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "â€”";

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatShortDate(value?: string | null) {
  if (!value) return "â€”";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "â€”";

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function prettifyCivilizationName(value: string) {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getRankLabel(rankLevel?: string | null) {
  if (!rankLevel) return "Unranked";

  return rankLevel
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getWinRateTone(winRate: number | null) {
  if (winRate === null) return "border-[#5a3a31] bg-[#0b0708]/70 text-[#d8cbb7]";
  if (winRate >= 85) return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  if (winRate >= 70) return "border-[#d9b265]/30 bg-[#d9b265]/10 text-[#f8edd7]";
  if (winRate >= 50) return "border-[#aa221d]/30 bg-[#7f1517]/10 text-[#fde8e1]";
  return "border-rose-400/30 bg-rose-400/10 text-rose-200";
}

function getStreakTone(streak: number | null) {
  if (streak === null || streak === 0) return "text-[#d8cbb7]";
  if (streak > 0) return "text-[#f0d7a0]";
  return "text-rose-300";
}

function getModeRows(player: PlayerProfileResponse): PerformanceRow[] {
  const mapping = [
    { key: "rm_1v1_elo", label: "1v1" },
    { key: "rm_2v2_elo", label: "2v2" },
    { key: "rm_3v3_elo", label: "3v3" },
    { key: "rm_4v4_elo", label: "4v4" },
  ] as const;

  return mapping.map(({ key, label }) => {
    const mode = player.modes?.[key];

    const history = Object.entries(mode?.rating_history ?? {})
      .map(([ts, point]) => ({
        ts: Number(ts),
        rating: typeof point?.rating === "number" ? point.rating : NaN,
      }))
      .filter((item) => Number.isFinite(item.ts) && Number.isFinite(item.rating))
      .sort((a, b) => a.ts - b.ts);

    return {
      key,
      label,
      rating: typeof mode?.rating === "number" ? mode.rating : null,
      maxRating:
        typeof mode?.max_rating === "number"
          ? mode.max_rating
          : history.length > 0
          ? Math.max(...history.map((point) => point.rating))
          : null,
      winRate: typeof mode?.win_rate === "number" ? mode.win_rate : null,
      rank: typeof mode?.rank === "number" ? mode.rank : null,
      streak: typeof mode?.streak === "number" ? mode.streak : null,
      games: typeof mode?.games_count === "number" ? mode.games_count : null,
      wins: typeof mode?.wins_count === "number" ? mode.wins_count : null,
      losses: typeof mode?.losses_count === "number" ? mode.losses_count : null,
      lastGameAt: mode?.last_game_at ?? null,
      history,
    };
  });
}

function getCurrentSoloSummary(player: PlayerProfileResponse) {
  const rankedSolo = player.modes?.rm_solo;
  const eloSolo = player.modes?.rm_1v1_elo;

  return {
    rankLevel: getRankLabel(rankedSolo?.rank_level),
    currentRank:
      typeof eloSolo?.rank === "number"
        ? eloSolo.rank
        : typeof rankedSolo?.rank === "number"
        ? rankedSolo.rank
        : null,
    currentRating:
      typeof eloSolo?.rating === "number"
        ? eloSolo.rating
        : typeof rankedSolo?.rating === "number"
        ? rankedSolo.rating
        : null,
    totalGames:
      typeof eloSolo?.games_count === "number"
        ? eloSolo.games_count
        : typeof rankedSolo?.games_count === "number"
        ? rankedSolo.games_count
        : null,
    streak:
      typeof eloSolo?.streak === "number"
        ? eloSolo.streak
        : typeof rankedSolo?.streak === "number"
        ? rankedSolo.streak
        : null,
    lastGameAt: eloSolo?.last_game_at ?? rankedSolo?.last_game_at ?? null,
  };
}

function getBestMode(rows: PerformanceRow[]): PerformanceRow | null {
  const rowsWithWinRate = rows.filter(
    (row) => typeof row.winRate === "number" && typeof row.rating === "number"
  );

  if (rowsWithWinRate.length === 0) return null;

  return [...rowsWithWinRate].sort((a, b) => {
    const wrDiff = (b.winRate ?? 0) - (a.winRate ?? 0);
    if (wrDiff !== 0) return wrDiff;
    return (b.rating ?? 0) - (a.rating ?? 0);
  })[0];
}

function getWorstRecentDrop(history: Array<{ ts: number; rating: number }>): number | null {
  if (history.length < 2) return null;

  let worstDrop = 0;

  for (let i = 1; i < history.length; i += 1) {
    const delta = history[i].rating - history[i - 1].rating;
    if (delta < worstDrop) worstDrop = delta;
  }

  return worstDrop === 0 ? null : worstDrop;
}

function getPeakRating(
  rows: PerformanceRow[]
): { mode: string; rating: number } | null {
  let peak: { mode: string; rating: number } | null = null;

  for (const row of rows) {
    const rowPeak =
      row.history.length > 0
        ? Math.max(...row.history.map((point) => point.rating))
        : row.rating;

    if (typeof rowPeak !== "number") {
      continue;
    }

    if (peak === null || rowPeak > peak.rating) {
      peak = {
        mode: row.label,
        rating: rowPeak,
      };
    }
  }

  return peak;
}

function getTeamVsSoloInsight(rows: PerformanceRow[]) {
  const solo = rows.find((row) => row.label === "1v1");
  const teamRows = rows.filter((row) => row.label !== "1v1" && row.winRate !== null);

  if (solo?.winRate === null || solo?.winRate === undefined || teamRows.length === 0) {
    return null;
  }

  const teamAvg =
    teamRows.reduce((sum, row) => sum + (row.winRate ?? 0), 0) / teamRows.length;

  if (teamAvg - solo.winRate >= 8) return "Player piÃ¹ forte in team game che in solo.";
  if (solo.winRate - teamAvg >= 8) return "Player piÃ¹ forte in solo queue che in team game.";

  return "Performance abbastanza equilibrata tra solo e team game.";
}

function getAllSeasons(player: PlayerProfileResponse): PreviousSeason[] {
  const seasonMap = new Map<number, PreviousSeason>();
  const modes = player.modes ? Object.values(player.modes) : [];

  modes.forEach((mode) => {
    if (!mode || !("previous_seasons" in mode) || !Array.isArray(mode.previous_seasons)) {
      return;
    }

    mode.previous_seasons.forEach((season) => {
      if (!season || typeof season.season !== "number") return;

      const normalizedSeason: PreviousSeason = {
        season: season.season,
        rating: typeof season.rating === "number" ? season.rating : undefined,
        rank: typeof season.rank === "number" ? season.rank : null,
        rank_level: season.rank_level ?? null,
        streak: typeof season.streak === "number" ? season.streak : null,
        games_count:
          typeof season.games_count === "number" ? season.games_count : undefined,
        wins_count:
          typeof season.wins_count === "number" ? season.wins_count : undefined,
        losses_count:
          typeof season.losses_count === "number" ? season.losses_count : undefined,
        win_rate: typeof season.win_rate === "number" ? season.win_rate : undefined,
        last_game_at: season.last_game_at ?? undefined,
      };

      const existing = seasonMap.get(season.season);

      if (!existing) {
        seasonMap.set(season.season, normalizedSeason);
        return;
      }

      const existingScore = existing.rating ?? -1;
      const nextScore = normalizedSeason.rating ?? -1;

      if (nextScore > existingScore) {
        seasonMap.set(season.season, normalizedSeason);
      }
    });
  });

  return [...seasonMap.values()].sort((a, b) => a.season - b.season);
}

function getTopCivs(player: PlayerProfileResponse): CivilizationStat[] {
  const teamMode = player.modes?.rm_team;
  const soloMode = player.modes?.rm_solo;

  const civs =
    teamMode && "civilizations" in teamMode && Array.isArray(teamMode.civilizations)
      ? teamMode.civilizations
      : soloMode && "civilizations" in soloMode && Array.isArray(soloMode.civilizations)
      ? soloMode.civilizations
      : [];

  return civs
    .filter(
      (civ): civ is NonNullable<typeof civ> =>
        Boolean(civ) &&
        typeof civ.civilization === "string" &&
        civ.civilization.trim() !== ""
    )
    .map((civ) => ({
      civilization: civ.civilization as string,
      win_rate: typeof civ.win_rate === "number" ? civ.win_rate : undefined,
      pick_rate: typeof civ.pick_rate === "number" ? civ.pick_rate : undefined,
      games_count: typeof civ.games_count === "number" ? civ.games_count : undefined,
    }))
    .sort((a, b) => (b.games_count ?? 0) - (a.games_count ?? 0))
    .slice(0, 5);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

function formatSignedNumber(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return `${value > 0 ? "+" : ""}${formatNumber(value)}`;
}

function getModeColor(label: string) {
  switch (label) {
    case "1v1":
      return {
        solid: "rgb(245 158 11)",
        fill: "rgba(245,158,11,0.18)",
        className: "bg-amber-400",
      };
    case "2v2":
      return {
        solid: "rgb(59 130 246)",
      fill: "rgba(127,21,23,0.18)",
      className: "bg-[#7f1517]",
      };
    case "3v3":
      return {
        solid: "rgb(34 197 94)",
        fill: "rgba(34,197,94,0.18)",
      className: "bg-[#b9855f]",
      };
    case "4v4":
      return {
        solid: "rgb(236 72 153)",
        fill: "rgba(236,72,153,0.18)",
        className: "bg-pink-500",
      };
    default:
      return {
        solid: "rgb(148 163 184)",
        fill: "rgba(148,163,184,0.18)",
        className: "bg-[#b9855f]",
      };
  }
}

function getRecentRatingDeltas(history: Array<{ ts: number; rating: number }>) {
  if (history.length < 2) return [];

  const deltas = [];

  for (let index = 1; index < history.length; index += 1) {
    deltas.push({
      ts: history[index].ts,
      rating: history[index].rating,
      delta: history[index].rating - history[index - 1].rating,
    });
  }

  return deltas.slice(-12);
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}

function EloLineChart({
  data,
  title,
}: {
  data: Array<{ ts: number; rating: number }>;
  title: string;
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-[#3a2621] bg-[#0b0708]/70 p-6 text-sm text-[#bcae9a]">
        Nessuno storico rating disponibile per {title}.
      </div>
    );
  }

  const width = 1000;
  const height = 260;
  const padding = 32;

  const minY = Math.min(...data.map((point) => point.rating));
  const maxY = Math.max(...data.map((point) => point.rating));
  const yRange = Math.max(maxY - minY, 1);

  const points = data.map((point, index) => {
    const x =
      padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y =
      height -
      padding -
      ((point.rating - minY) / yRange) * (height - padding * 2);

    return `${x},${y}`;
  });

  const polylinePoints = points.join(" ");
  const first = data[0];
  const last = data[data.length - 1];

  return (
    <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Progressione ELO
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{title}</h3>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.2em] text-[#8f7e69]">Inizio</div>
            <div className="mt-1 text-sm font-semibold text-white">
              {formatNumber(first.rating)}
            </div>
          </div>

          <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.2em] text-[#8f7e69]">Fine</div>
            <div className="mt-1 text-sm font-semibold text-white">
              {formatNumber(last.rating)}
            </div>
          </div>

          <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.2em] text-[#8f7e69]">Delta</div>
            <div
              className={`mt-1 text-sm font-semibold ${
    last.rating - first.rating >= 0 ? "text-[#f0d7a0]" : "text-rose-300"
              }`}
            >
              {last.rating - first.rating >= 0 ? "+" : ""}
              {formatNumber(last.rating - first.rating)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#3a2621] bg-[#0b0708]/80 p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
          {[0, 0.25, 0.5, 0.75, 1].map((step) => {
            const y = padding + step * (height - padding * 2);
            const label = Math.round(maxY - step * yRange);

            return (
              <g key={step}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  className="stroke-[#3a2621]"
                  strokeWidth="1"
                />
                <text x={8} y={y + 4} className="fill-[#8f7e69] text-[12px]">
                  {label}
                </text>
              </g>
            );
          })}

          <polyline
            fill="none"
            points={polylinePoints}
            stroke="rgb(251 191 36)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {data.map((point, index) => {
            const [x, y] = points[index].split(",").map(Number);

            return (
              <g key={`${point.ts}-${index}`}>
                <circle cx={x} cy={y} r="4" fill="white" />
                <title>
                  {`${formatShortDate(
                    new Date(point.ts * 1000).toISOString()
                  )} â€¢ ${point.rating} ELO`}
                </title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function MiniSparkline({
  data,
  title,
  color,
}: {
  data: Array<{ ts: number; rating: number }>;
  title: string;
  color: string;
}) {
  if (data.length < 2) {
    return (
      <div className="mt-5 rounded-2xl border border-[#3a2621] bg-[#140c0d]/70 px-4 py-3 text-xs text-[#8f7e69]">
        Storico insufficiente per {title.toLowerCase()}.
      </div>
    );
  }

  const width = 240;
  const height = 64;
  const padding = 6;
  const minY = Math.min(...data.map((point) => point.rating));
  const maxY = Math.max(...data.map((point) => point.rating));
  const yRange = Math.max(maxY - minY, 1);

  const points = data.map((point, index) => {
    const x =
      padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y =
      height -
      padding -
      ((point.rating - minY) / yRange) * (height - padding * 2);

    return { x, y };
  });

  const lastPoint = points[points.length - 1];
  const firstPoint = data[0];
  const lastDataPoint = data[data.length - 1];

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-[#3a2621] bg-[#140c0d]/70 p-3">
      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-[#8f7e69]">
        <span>{title}</span>
        <span
          className={
            lastDataPoint.rating - firstPoint.rating >= 0
      ? "text-[#f0d7a0]"
              : "text-rose-300"
          }
        >
          {formatSignedNumber(lastDataPoint.rating - firstPoint.rating)}
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-16 w-full">
        <polyline
          fill="none"
          points={points.map((point) => `${point.x},${point.y}`).join(" ")}
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="4" fill="white" />
      </svg>
    </div>
  );
}

function ModeShareDonutChart({ rows }: { rows: PerformanceRow[] }) {
  const validRows = rows.filter(
    (row): row is PerformanceRow & { games: number } =>
      typeof row.games === "number" && row.games > 0
  );

  if (validRows.length === 0) {
    return (
      <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
          Distribuzione volume
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">
          Dove gioca di piu
        </h3>
        <div className="mt-6 rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4 text-sm text-[#bcae9a]">
          Nessun volume partite disponibile.
        </div>
      </div>
    );
  }

  const totalGames = validRows.reduce((sum, row) => sum + row.games, 0);
  const slices = validRows.map((row, index) => {
    const share = row.games / totalGames;
    const startAngle = validRows
      .slice(0, index)
      .reduce((sum, item) => sum + (item.games / totalGames) * 360, 0);
    const sweep = Math.max(share * 360, 6);

    return {
      ...row,
      share,
      startAngle,
      endAngle:
        startAngle + (share >= 0.999 ? 359.99 : Math.min(sweep, 359.99)),
      color: getModeColor(row.label),
    };
  });

  return (
    <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
        Distribuzione volume
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-white">
        Dove gioca di piu
      </h3>

      <div className="mt-6 space-y-5">
        <div className="overflow-hidden rounded-[1.5rem] border border-[#3a2621] bg-[#0b0708]/80 p-4">
          <svg viewBox="0 0 240 240" className="mx-auto w-full max-w-[240px]">
            <circle
              cx="120"
              cy="120"
              r="86"
              fill="none"
              stroke="rgb(30 41 59)"
              strokeWidth="24"
            />

            {slices.map((slice) => (
              <path
                key={slice.label}
                d={describeArc(120, 120, 86, slice.startAngle, slice.endAngle)}
                fill="none"
                stroke={slice.color.solid}
                strokeWidth="24"
                strokeLinecap="round"
              />
            ))}

            <text
              x="120"
              y="114"
              textAnchor="middle"
              className="fill-[#bcae9a] text-[12px] uppercase tracking-[0.2em]"
            >
              Totale
            </text>
            <text
              x="120"
              y="138"
              textAnchor="middle"
              className="fill-white text-[26px] font-bold"
            >
              {formatNumber(totalGames)}
            </text>
          </svg>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {slices.map((slice) => (
            <div
              key={slice.label}
              className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`h-3 w-3 rounded-full ${slice.color.className}`}
                  />
                  <span className="text-sm font-semibold text-white">
                    {slice.label}
                  </span>
                </div>

                <div className="text-sm text-[#d8cbb7]">
                  {slice.share * 100 >= 10
                    ? `${slice.share.toLocaleString("it-IT", {
                        style: "percent",
                        maximumFractionDigits: 0,
                      })}`
                    : `${slice.share.toLocaleString("it-IT", {
                        style: "percent",
                        maximumFractionDigits: 1,
                      })}`}
                </div>
              </div>

              <div className="mt-2 text-sm text-[#bcae9a]">
                {formatNumber(slice.games)} partite nella modalita {slice.label}.
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WinLossSplitChart({ rows }: { rows: PerformanceRow[] }) {
  const validRows = rows.filter(
    (row): row is PerformanceRow & { wins: number; losses: number } =>
      typeof row.wins === "number" &&
      typeof row.losses === "number" &&
      row.wins + row.losses > 0
  );

  if (validRows.length === 0) {
    return (
      <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
          Match outcome
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">
          Wins vs losses
        </h3>
        <div className="mt-6 rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4 text-sm text-[#bcae9a]">
          Nessun dato di vittorie e sconfitte disponibile.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
        Match outcome
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Wins vs losses</h3>

      <div className="mt-6 space-y-5">
        {validRows.map((row) => {
          const total = row.wins + row.losses;
          const winsWidth = `${(row.wins / total) * 100}%`;
          const lossesWidth = `${(row.losses / total) * 100}%`;

          return (
            <div key={row.key}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="font-semibold text-white">{row.label}</span>
                <span className="text-[#d8cbb7]">
                  {formatNumber(row.wins)}W / {formatNumber(row.losses)}L
                </span>
              </div>

              <div className="flex h-4 overflow-hidden rounded-full border border-[#3a2621] bg-[#0b0708]/80">
                <div
              className="h-full bg-[#b9855f]"
                  style={{ width: winsWidth }}
                />
                <div
                  className="h-full bg-rose-500"
                  style={{ width: lossesWidth }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[#bcae9a]">
                <span>{formatPercent((row.wins / total) * 100)}</span>
                <span>{formatNumber(total)} match tracciati</span>
                <span>{formatPercent((row.losses / total) * 100)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModeRatingRangeChart({ rows }: { rows: PerformanceRow[] }) {
  const validRows = rows.filter(
    (row): row is PerformanceRow & { rating: number; maxRating: number } =>
      typeof row.rating === "number" &&
      typeof row.maxRating === "number" &&
      Number.isFinite(row.rating) &&
      Number.isFinite(row.maxRating)
  );

  if (validRows.length === 0) {
    return (
      <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
          Rating envelope
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">
          Current vs peak
        </h3>
        <div className="mt-6 rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4 text-sm text-[#bcae9a]">
          Nessun confronto rating disponibile.
        </div>
      </div>
    );
  }

  const maxPeak = Math.max(...validRows.map((row) => row.maxRating), 1);

  return (
    <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
        Rating envelope
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-white">
        Current vs peak
      </h3>

      <div className="mt-6 space-y-4">
        {validRows.map((row) => {
          const currentWidth = `${(row.rating / maxPeak) * 100}%`;
          const peakWidth = `${(row.maxRating / maxPeak) * 100}%`;
          const deltaToPeak = row.rating - row.maxRating;
          const color = getModeColor(row.label);

          return (
            <div key={row.key}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">{row.label}</div>
                  <div className="mt-1 text-xs text-[#bcae9a]">
                    Gap dal peak {formatSignedNumber(deltaToPeak)}
                  </div>
                </div>

                <div className="text-right text-sm text-[#d8cbb7]">
                  <div>Now {formatNumber(row.rating)}</div>
                  <div className="text-xs text-[#8f7e69]">
                    Peak {formatNumber(row.maxRating)}
                  </div>
                </div>
              </div>

              <div className="relative h-5 overflow-hidden rounded-full border border-[#3a2621] bg-[#0b0708]/80">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white/10"
                  style={{ width: peakWidth }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: currentWidth,
                    background: `linear-gradient(90deg, ${color.fill}, ${color.solid})`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentDeltaChart({
  history,
  title,
}: {
  history: Array<{ ts: number; rating: number }>;
  title: string;
}) {
  const deltas = getRecentRatingDeltas(history);

  if (deltas.length === 0) {
    return (
      <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
          Momentum
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">{title}</h3>
        <div className="mt-6 rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4 text-sm text-[#bcae9a]">
          Servono almeno due punti di storico per mostrare i delta recenti.
        </div>
      </div>
    );
  }

  const width = 900;
  const height = 260;
  const padding = 36;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const baseline = padding + chartHeight / 2;
  const maxAbsDelta = Math.max(...deltas.map((item) => Math.abs(item.delta)), 1);
  const barWidth = chartWidth / deltas.length - 10;

  return (
    <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
        Momentum
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-white">{title}</h3>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#3a2621] bg-[#0b0708]/80 p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
          <line
            x1={padding}
            y1={baseline}
            x2={width - padding}
            y2={baseline}
            className="stroke-[#5a3a31]"
            strokeWidth="1.5"
          />

          {deltas.map((item, index) => {
            const x = padding + index * (barWidth + 10);
            const normalized = Math.abs(item.delta) / maxAbsDelta;
            const barHeight = normalized * (chartHeight / 2 - 12);
            const y = item.delta >= 0 ? baseline - barHeight : baseline;

            return (
              <g key={`${item.ts}-${index}`}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 4)}
                  rx="8"
                  fill={item.delta >= 0 ? "rgb(34 197 94)" : "rgb(244 63 94)"}
                />
                <title>{`${formatShortDate(
                  new Date(item.ts * 1000).toISOString()
                )} | ${formatSignedNumber(item.delta)} ELO`}</title>

                {index % 3 === 0 || index === deltas.length - 1 ? (
                  <text
                    x={x + barWidth / 2}
                    y={height - 10}
                    textAnchor="middle"
                    className="fill-[#8f7e69] text-[11px]"
                  >
                    {formatShortDate(new Date(item.ts * 1000).toISOString())}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function SeasonActivityChart({ seasons }: { seasons: PreviousSeason[] }) {
  const validSeasons = seasons.filter(
    (
      season
    ): season is PreviousSeason & { season: number; games_count: number } =>
      typeof season.season === "number" &&
      typeof season.games_count === "number" &&
      Number.isFinite(season.games_count)
  );

  if (validSeasons.length === 0) {
    return (
      <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
          Season activity
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">
          Volume e winrate
        </h3>
        <div className="mt-6 rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4 text-sm text-[#bcae9a]">
          Nessuna season con volume partite disponibile.
        </div>
      </div>
    );
  }

  const width = 900;
  const height = 280;
  const padding = 40;
  const maxGames = Math.max(...validSeasons.map((season) => season.games_count), 1);
  const barSlot = (width - padding * 2) / validSeasons.length;
  const barWidth = Math.min(barSlot * 0.5, 54);
  const validWinRateSeasons = validSeasons.filter(
    (season): season is PreviousSeason & {
      season: number;
      games_count: number;
      win_rate: number;
    } => typeof season.win_rate === "number" && Number.isFinite(season.win_rate)
  );
  const winRatePolyline = validWinRateSeasons
    .map((season) => {
      const x =
        padding +
        validSeasons.findIndex((item) => item.season === season.season) * barSlot +
        barSlot / 2;
      const y =
        height -
        padding -
        (season.win_rate / 100) * (height - padding * 2);

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
        Season activity
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-white">
        Volume e winrate
      </h3>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#3a2621] bg-[#0b0708]/80 p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
          {[0, 0.25, 0.5, 0.75, 1].map((step) => {
            const y = padding + step * (height - padding * 2);

            return (
              <line
                key={step}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                className="stroke-[#3a2621]"
                strokeWidth="1"
              />
            );
          })}

          {validSeasons.map((season, index) => {
            const x = padding + index * barSlot + (barSlot - barWidth) / 2;
            const barHeight =
              (season.games_count / maxGames) * (height - padding * 2);
            const y = height - padding - barHeight;

            return (
              <g key={season.season}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 6)}
                  rx="12"
                  fill="rgba(245,158,11,0.75)"
                />
                <text
                  x={x + barWidth / 2}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-[#bcae9a] text-[12px]"
                >
                  S{season.season}
                </text>
                <title>{`Season ${season.season} | ${season.games_count} match`}</title>
              </g>
            );
          })}

          {winRatePolyline ? (
            <>
              <polyline
                fill="none"
                points={winRatePolyline}
                stroke="rgb(96 165 250)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {validWinRateSeasons.map((season) => {
                const index = validSeasons.findIndex(
                  (item) => item.season === season.season
                );
                const x = padding + index * barSlot + barSlot / 2;
                const y =
                  height -
                  padding -
                  (season.win_rate / 100) * (height - padding * 2);

                return (
                  <g key={`${season.season}-wr`}>
                    <circle cx={x} cy={y} r="5" fill="white" />
                    <title>{`Season ${season.season} | WR ${formatPercent(
                      season.win_rate
                    )}`}</title>
                  </g>
                );
              })}
            </>
          ) : null}
        </svg>
      </div>
    </div>
  );
}

function CivilizationScatterChart({ civs }: { civs: CivilizationStat[] }) {
  const validCivs = civs.filter(
    (
      civ
    ): civ is CivilizationStat & {
      civilization: string;
      games_count: number;
      pick_rate: number;
      win_rate: number;
    } =>
      typeof civ.civilization === "string" &&
      typeof civ.games_count === "number" &&
      typeof civ.pick_rate === "number" &&
      typeof civ.win_rate === "number"
  );

  if (validCivs.length === 0) {
    return (
      <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
          Civilization map
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">
          Pick rate vs winrate
        </h3>
        <div className="mt-6 rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4 text-sm text-[#bcae9a]">
          Servono pick rate e winrate validi per mostrare la mappa civ.
        </div>
      </div>
    );
  }

  const width = 620;
  const height = 360;
  const padding = 52;
  const maxGames = Math.max(...validCivs.map((civ) => civ.games_count), 1);

  return (
    <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
        Civilization map
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-white">
        Pick rate vs winrate
      </h3>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#3a2621] bg-[#0b0708]/80 p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
          {[0, 25, 50, 75, 100].map((step) => {
            const y =
              height - padding - (step / 100) * (height - padding * 2);
            const x = padding + (step / 100) * (width - padding * 2);

            return (
              <g key={step}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  className="stroke-[#3a2621]"
                  strokeWidth="1"
                />
                <line
                  x1={x}
                  y1={padding}
                  x2={x}
                  y2={height - padding}
                  className="stroke-[#140c0d]"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {validCivs.map((civ) => {
            const x =
              padding + (civ.pick_rate / 100) * (width - padding * 2);
            const y =
              height - padding - (civ.win_rate / 100) * (height - padding * 2);
            const radius = 10 + (civ.games_count / maxGames) * 16;
            const label = prettifyCivilizationName(civ.civilization)
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 3)
              .toUpperCase();

            return (
              <g key={civ.civilization}>
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill="rgba(245,158,11,0.22)"
                  stroke="rgb(245 158 11)"
                  strokeWidth="2.5"
                />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  className="fill-white text-[10px] font-semibold"
                >
                  {label}
                </text>
                <title>
                  {`${prettifyCivilizationName(civ.civilization)} | Pick ${formatPercent(
                    civ.pick_rate
                  )} | WR ${formatPercent(civ.win_rate)} | ${formatNumber(
                    civ.games_count
                  )} partite`}
                </title>
              </g>
            );
          })}

          <text
            x={width / 2}
            y={height - 8}
            textAnchor="middle"
            className="fill-[#bcae9a] text-[12px]"
          >
            Pick rate
          </text>
          <text
            x={18}
            y={height / 2}
            transform={`rotate(-90 18 ${height / 2})`}
            textAnchor="middle"
            className="fill-[#bcae9a] text-[12px]"
          >
            Winrate
          </text>
        </svg>
      </div>
    </div>
  );
}

function ComparisonBarChart({
  title,
  subtitle,
  items,
  suffix = "",
  decimals = 0,
  maxValue,
}: {
  title: string;
  subtitle: string;
  items: Array<{ label: string; value: number | null }>;
  suffix?: string;
  decimals?: number;
  maxValue?: number;
}) {
  const validItems = items.filter(
    (item): item is { label: string; value: number } =>
      typeof item.value === "number" && Number.isFinite(item.value)
  );

  if (validItems.length === 0) {
    return (
      <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
          {title}
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">{subtitle}</h3>
        <div className="mt-6 rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4 text-sm text-[#bcae9a]">
          Nessun dato disponibile.
        </div>
      </div>
    );
  }

  const chartMax =
    typeof maxValue === "number" && Number.isFinite(maxValue)
      ? maxValue
      : Math.max(...validItems.map((item) => item.value), 1);

  return (
    <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
        {title}
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-white">{subtitle}</h3>

      <div className="mt-6 space-y-4">
        {validItems.map((item) => {
          const width = `${Math.max((item.value / chartMax) * 100, 3)}%`;

          return (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="font-semibold text-white">{item.label}</span>
                <span className="text-[#d8cbb7]">
                  {item.value.toFixed(decimals)}
                  {suffix}
                </span>
              </div>

              <div className="h-4 overflow-hidden rounded-full border border-[#3a2621] bg-[#0b0708]/80">
                <div
                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(127,21,23,0.92),rgba(217,178,101,0.95))]"
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SeasonsRatingChart({ seasons }: { seasons: PreviousSeason[] }) {
  const validSeasons = seasons.filter(
    (season): season is PreviousSeason & { rating: number } =>
      typeof season.rating === "number" && Number.isFinite(season.rating)
  );

  if (validSeasons.length === 0) {
    return (
      <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
          Trend stagioni
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Rating per season</h3>
        <div className="mt-6 rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4 text-sm text-[#bcae9a]">
          Nessuna season con rating disponibile.
        </div>
      </div>
    );
  }

  const width = 900;
  const height = 260;
  const padding = 40;
  const minY = Math.min(...validSeasons.map((season) => season.rating));
  const maxY = Math.max(...validSeasons.map((season) => season.rating));
  const yRange = Math.max(maxY - minY, 1);

  const points = validSeasons.map((season, index) => {
    const x =
      padding + (index / Math.max(validSeasons.length - 1, 1)) * (width - padding * 2);
    const y =
      height -
      padding -
      ((season.rating - minY) / yRange) * (height - padding * 2);

    return { x, y, season: season.season, rating: season.rating };
  });

  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
        Trend stagioni
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Rating per season</h3>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#3a2621] bg-[#0b0708]/80 p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
          {[0, 0.25, 0.5, 0.75, 1].map((step) => {
            const y = padding + step * (height - padding * 2);
            const label = Math.round(maxY - step * yRange);

            return (
              <g key={step}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  className="stroke-[#3a2621]"
                  strokeWidth="1"
                />
                <text x={6} y={y + 4} className="fill-[#8f7e69] text-[12px]">
                  {label}
                </text>
              </g>
            );
          })}

          <polyline
            fill="none"
            points={polyline}
            stroke="rgb(96 165 250)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point) => (
            <g key={point.season}>
              <circle cx={point.x} cy={point.y} r="5" fill="rgb(251 191 36)" />
              <text
                x={point.x}
                y={height - 10}
                textAnchor="middle"
                className="fill-[#bcae9a] text-[12px]"
              >
                S{point.season}
              </text>
              <title>{`Season ${point.season} â€¢ ${point.rating}`}</title>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function CivilizationRadarChart({
  civs,
}: {
  civs: CivilizationStat[];
}) {
  const validCivs = civs.filter(
    (civ): civ is CivilizationStat & { civilization: string; games_count: number } =>
      typeof civ.civilization === "string" &&
      civ.civilization.trim() !== "" &&
      typeof civ.games_count === "number" &&
      Number.isFinite(civ.games_count)
  );

  if (validCivs.length < 3) {
    return (
      <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
          Aerogramma civ
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-white">
          Civilizzazioni piÃ¹ giocate
        </h3>
        <div className="mt-6 rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4 text-sm text-[#bcae9a]">
          Servono almeno 3 civiltÃ  con statistiche valide per mostrare l&apos;aerogramma.
        </div>
      </div>
    );
  }

  const width = 520;
  const height = 520;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 170;
  const levels = 4;
  const maxValue = Math.max(...validCivs.map((civ) => civ.games_count), 1);

  const getPoint = (index: number, ratio: number) => {
    const angle = (Math.PI * 2 * index) / validCivs.length - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * radius * ratio,
      y: cy + Math.sin(angle) * radius * ratio,
    };
  };

  const levelPolygons = Array.from({ length: levels }, (_, i) => {
    const ratio = (i + 1) / levels;
    return validCivs
      .map((_, index) => {
        const point = getPoint(index, ratio);
        return `${point.x},${point.y}`;
      })
      .join(" ");
  });

  const valuePolygon = validCivs
    .map((civ, index) => {
      const ratio = civ.games_count / maxValue;
      const point = getPoint(index, ratio);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  return (
    <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
        Aerogramma civ
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-white">
        Civilizzazioni piÃ¹ giocate
      </h3>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="overflow-hidden rounded-[1.5rem] border border-[#3a2621] bg-[#0b0708]/80 p-4">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
            {levelPolygons.map((polygon, index) => (
              <polygon
                key={index}
                points={polygon}
                fill="none"
                stroke="rgb(51 65 85)"
                strokeWidth="1"
              />
            ))}

            {validCivs.map((civ, index) => {
              const outer = getPoint(index, 1);
              const inner = getPoint(index, 0);

              return (
                <g key={civ.civilization}>
                  <line
                    x1={inner.x}
                    y1={inner.y}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="rgb(51 65 85)"
                    strokeWidth="1"
                  />
                  <text
                    x={getPoint(index, 1.14).x}
                    y={getPoint(index, 1.14).y}
                    textAnchor="middle"
                    className="fill-[#d8cbb7] text-[12px]"
                  >
                    {prettifyCivilizationName(civ.civilization)}
                  </text>
                </g>
              );
            })}

            <polygon
              points={valuePolygon}
              fill="rgba(245,158,11,0.22)"
              stroke="rgb(245 158 11)"
              strokeWidth="3"
            />

            {validCivs.map((civ, index) => {
              const point = getPoint(index, civ.games_count / maxValue);

              return (
                <g key={`${civ.civilization}-point`}>
                  <circle cx={point.x} cy={point.y} r="5" fill="white" />
                  <title>{`${prettifyCivilizationName(civ.civilization)} â€¢ ${civ.games_count} partite`}</title>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="space-y-3">
          {validCivs.map((civ) => (
            <div
              key={civ.civilization}
              className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4"
            >
              <div className="text-sm font-semibold text-white">
                {prettifyCivilizationName(civ.civilization)}
              </div>
              <div className="mt-2 text-sm text-[#bcae9a]">
                Partite: {formatNumber(civ.games_count)}
              </div>
              <div className="mt-1 text-sm text-[#bcae9a]">
                Pick rate: {formatPercent(civ.pick_rate)}
              </div>
              <div className="mt-1 text-sm text-[#bcae9a]">
                Winrate: {formatPercent(civ.win_rate)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PlayerDashboard({
  player,
  civIcons = {},
}: PlayerDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isRefreshingPage, startRefreshTransition] = useTransition();
  const [advancedRefreshKey, setAdvancedRefreshKey] = useState(0);
  const rows = getModeRows(player);
  const summary = getCurrentSoloSummary(player);
  const bestMode = getBestMode(rows);
  const peak = getPeakRating(rows);
  const soloHistory = rows.find((row) => row.label === "1v1")?.history ?? [];
  const worstDrop = getWorstRecentDrop(soloHistory);
  const teamVsSoloInsight = getTeamVsSoloInsight(rows);
  const seasons = getAllSeasons(player);
  const topCivs = getTopCivs(player);
  const downloadRows = rows.map((row) => ({
    label: row.label,
    rating: row.rating,
    maxRating: row.maxRating,
    rank: row.rank,
    winRate: row.winRate,
    games: row.games,
    wins: row.wins,
    losses: row.losses,
    streak: row.streak,
  }));
  const downloadTopCivs = topCivs.map((civ) => ({
    name: prettifyCivilizationName(civ.civilization),
    games: civ.games_count ?? null,
    winRate: civ.win_rate ?? null,
    pickRate: civ.pick_rate ?? null,
  }));

  const insights = [
    bestMode
      ? `ModalitÃ  migliore: ${bestMode.label} (${formatPercent(bestMode.winRate)} winrate).`
      : null,
    peak !== null
      ? `Peak rating registrato: ${formatNumber(peak.rating)} in ${peak.mode}.`
      : null,
    worstDrop !== null
      ? `Peggior calo recente in 1v1: ${formatNumber(worstDrop)} ELO.`
      : null,
    summary.totalGames !== null && summary.totalGames >= 500
      ? `Profilo molto rodato: ${formatNumber(summary.totalGames)} partite in 1v1.`
      : null,
    teamVsSoloInsight,
  ].filter((value): value is string => Boolean(value));

  function handleRefreshPage() {
    setAdvancedRefreshKey((value) => value + 1);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("refresh", Date.now().toString());

    startRefreshTransition(() => {
      router.replace(`${pathname}?${nextParams.toString()}`, {
        scroll: false,
      });
    });
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="space-y-8">
        <div className="grid gap-4 xl:grid-cols-[auto_minmax(0,1fr)] xl:items-start">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex rounded-2xl border border-[#5a3a31] bg-[#140c0d]/80 px-5 py-3 text-sm font-semibold text-[#f5ecdc] transition hover:-translate-y-0.5 hover:border-[#8c5a4c]"
            >
              â† Torna alla home
            </Link>

            <Link
              href="/leaderboard"
              className="inline-flex rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-[#1a0d0c] transition hover:-translate-y-0.5"
            >
              Vai alla leaderboard
            </Link>

            <PlayerSummaryDownloadButton
              playerName={player.name ?? "Giocatore"}
              country={player.country ?? null}
              rankLevel={summary.rankLevel}
              currentRank={summary.currentRank}
              currentRating={summary.currentRating}
              totalGames={summary.totalGames}
              streak={summary.streak}
              lastGameAt={summary.lastGameAt}
              peakRating={peak?.rating ?? null}
              rows={downloadRows}
              topCivs={downloadTopCivs}
            />

            <button
              type="button"
              onClick={handleRefreshPage}
              disabled={isRefreshingPage}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#5a3a31] bg-[#140c0d]/80 px-5 py-3 text-sm font-semibold text-[#f5ecdc] transition hover:-translate-y-0.5 hover:border-[#8c5a4c] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isRefreshingPage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Aggiorno pagina...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Aggiorna pagina
                </>
              )}
            </button>
          </div>

          <PlayerLookupForm variant="compact" />
        </div>

        <div className="rounded-[2rem] border border-amber-500/20 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.12),transparent_35%),#140c0d] p-8 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              {player.avatars?.full || player.avatars?.medium || player.avatars?.small ? (
                <img
                  src={player.avatars.full || player.avatars.medium || player.avatars.small || ""}
                  alt={player.name ?? "Player avatar"}
                  className="h-20 w-20 rounded-2xl border border-[#5a3a31] object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#5a3a31] bg-[#140c0d] text-2xl font-bold text-amber-300">
                  {getInitials(player.name ?? "Player")}
                </div>
              )}

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
                  Player Dashboard
                </p>

                <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                  {player.name ?? "Giocatore"}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#d8cbb7]">
                  <span className="rounded-full border border-[#5a3a31] bg-[#140c0d] px-3 py-1">
                    {summary.rankLevel}
                  </span>

                  <span className="rounded-full border border-[#5a3a31] bg-[#140c0d] px-3 py-1">
                    Rank #{formatNumber(summary.currentRank)}
                  </span>

                  <span className="rounded-full border border-[#5a3a31] bg-[#140c0d] px-3 py-1">
                    1v1 ELO {formatNumber(summary.currentRating)}
                  </span>

                  {player.country ? (
                    <span className="rounded-full border border-[#5a3a31] bg-[#140c0d] px-3 py-1 uppercase">
                      {player.country}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4 text-center">
                <div className={`text-2xl font-bold ${getStreakTone(summary.streak ?? null)}`}>
                  {typeof summary.streak === "number"
                    ? `${summary.streak > 0 ? "+" : ""}${summary.streak}`
                    : "â€”"}
                </div>
                <div className="mt-1 text-sm text-[#bcae9a]">Streak</div>
              </div>

              <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4 text-center">
                <div className="text-2xl font-bold text-amber-300">
                  {formatNumber(summary.totalGames)}
                </div>
                <div className="mt-1 text-sm text-[#bcae9a]">Partite 1v1</div>
              </div>

              <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4 text-center">
                <div className="text-2xl font-bold text-white">{formatDate(summary.lastGameAt)}</div>
                <div className="mt-1 text-sm text-[#bcae9a]">Ultima partita</div>
              </div>

              <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4 text-center">
                <div className="text-2xl font-bold text-amber-300">
                  {peak !== null ? formatNumber(peak.rating) : "â€”"}
                </div>
                <div className="mt-1 text-sm text-[#bcae9a]">Peak ELO</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
                Performance
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white">Prestazioni per modalitÃ </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {rows.map((row) => (
              <div
                key={row.key}
                className="rounded-[1.75rem] border border-[#3a2621] bg-[#0b0708]/80 p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold text-white">{row.label}</h3>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getWinRateTone(
                      row.winRate
                    )}`}
                  >
                    {formatPercent(row.winRate)}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#3a2621] bg-[#140c0d] px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-[#8f7e69]">ELO</div>
                    <div className="mt-1 text-lg font-bold text-white">{formatNumber(row.rating)}</div>
                  </div>

                  <div className="rounded-2xl border border-[#3a2621] bg-[#140c0d] px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-[#8f7e69]">Rank</div>
                    <div className="mt-1 text-lg font-bold text-white">#{formatNumber(row.rank)}</div>
                  </div>

                  <div className="rounded-2xl border border-[#3a2621] bg-[#140c0d] px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-[#8f7e69]">Streak</div>
                    <div className={`mt-1 text-lg font-bold ${getStreakTone(row.streak)}`}>
                      {typeof row.streak === "number"
                        ? `${row.streak > 0 ? "+" : ""}${row.streak}`
                        : "â€”"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#3a2621] bg-[#140c0d] px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-[#8f7e69]">Partite</div>
                    <div className="mt-1 text-lg font-bold text-white">{formatNumber(row.games)}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-[#5a3a31] bg-[#140c0d] px-3 py-1 text-[#d8cbb7]">
                    Peak {formatNumber(row.maxRating)}
                  </span>
                  {row.wins !== null ? (
              <span className="rounded-full border border-[#d9b265]/20 bg-[#d9b265]/10 px-3 py-1 text-[#f8edd7]">
                      {formatNumber(row.wins)}W
                    </span>
                  ) : null}
                  {row.losses !== null ? (
                    <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-rose-200">
                      {formatNumber(row.losses)}L
                    </span>
                  ) : null}
                </div>

                <MiniSparkline
                  data={row.history}
                  title={`Trend ${row.label}`}
                  color={getModeColor(row.label).solid}
                />

                <p className="mt-4 text-sm text-[#bcae9a]">
                  Ultima partita: {formatDate(row.lastGameAt)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <ModeShareDonutChart rows={rows} />
          <WinLossSplitChart rows={rows} />
          <ModeRatingRangeChart rows={rows} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <EloLineChart data={soloHistory} title="Storico 1v1" />
          <RecentDeltaChart history={soloHistory} title="Delta recenti 1v1" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ComparisonBarChart
            title="Confronto modalitÃ "
            subtitle="Winrate per modalitÃ "
            items={rows.map((row) => ({
              label: row.label,
              value: row.winRate,
            }))}
            suffix="%"
            decimals={1}
            maxValue={100}
          />

          <ComparisonBarChart
            title="Volume di gioco"
            subtitle="Partite per modalitÃ "
            items={rows.map((row) => ({
              label: row.label,
              value: row.games,
            }))}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <SeasonsRatingChart seasons={seasons} />
          <SeasonActivityChart seasons={seasons} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <CivilizationRadarChart civs={topCivs} />
          <CivilizationScatterChart civs={topCivs} />
        </div>

        <PlayerAdvancedInsights
          player={player}
          refreshKey={advancedRefreshKey}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
              Analisi
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">Insight automatici</h2>

            <div className="mt-6 space-y-3">
              {insights.length > 0 ? (
                insights.map((insight, index) => (
                  <div
                    key={`${insight}-${index}`}
                    className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4 text-sm leading-7 text-[#d8cbb7]"
                  >
                    {insight}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4 text-sm text-[#bcae9a]">
                  Dati insufficienti per generare insight.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
              Playstyle
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">Profilo giocatore</h2>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4">
                <div className="text-sm font-semibold text-white">
                  {bestMode?.label !== "1v1" ? "Stratega da team game" : "Specialista del solo"}
                </div>
                <p className="mt-2 text-sm leading-7 text-[#bcae9a]">
                  {teamVsSoloInsight ?? "Profilo in definizione."}
                </p>
              </div>

              <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4">
                <div className="text-sm font-semibold text-white">
                  {summary.totalGames !== null && summary.totalGames >= 500
                    ? "Grinder esperto"
                    : "Sample ridotto"}
                </div>
                <p className="mt-2 text-sm leading-7 text-[#bcae9a]">
                  {summary.totalGames !== null && summary.totalGames >= 500
                    ? "Grande volume di partite, dati molto piÃ¹ affidabili della media."
                    : "Servono piÃ¹ partite per descrivere il profilo con precisione."}
                </p>
              </div>

              <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4">
                <div className="text-sm font-semibold text-white">
                  {worstDrop !== null && worstDrop <= -100
                    ? "Rischio tilt recente"
                    : "Andamento abbastanza stabile"}
                </div>
                <p className="mt-2 text-sm leading-7 text-[#bcae9a]">
                  {worstDrop !== null && worstDrop <= -100
                    ? `Nello storico 1v1 compare un calo brusco di ${formatNumber(worstDrop)} ELO.`
                    : "Non emergono crolli recenti particolarmente pesanti nello storico disponibile."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
              Stagioni
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">Storico ranked</h2>

            <div className="mt-6 space-y-3">
              {seasons.length > 0 ? (
                seasons.map((season) => (
                  <div
                    key={season.season}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Season {season.season}
                      </div>
                      <div className="mt-1 text-sm text-[#bcae9a]">
                        {getRankLabel(season.rank_level)} â€¢ Ultima partita{" "}
                        {formatDate(season.last_game_at)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="rounded-full border border-[#5a3a31] bg-[#140c0d] px-3 py-1 text-[#e8dcc8]">
                        Rating {formatNumber(season.rating)}
                      </span>
                      <span className="rounded-full border border-[#5a3a31] bg-[#140c0d] px-3 py-1 text-[#e8dcc8]">
                        Rank #{formatNumber(season.rank)}
                      </span>
                      <span className="rounded-full border border-[#5a3a31] bg-[#140c0d] px-3 py-1 text-[#e8dcc8]">
                        WR {formatPercent(season.win_rate)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4 text-sm text-[#bcae9a]">
                  Nessuna season storica disponibile.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d] p-6 shadow-lg shadow-black/20">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
              Civilizzazioni
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">Top civ</h2>

            <div className="mt-6 space-y-3">
              {topCivs.length > 0 ? (
                topCivs.map((civ) => {
                  const icon = civIcons[civ.civilization] || DEFAULT_CIV_ICON;

                  return (
                    <div
                      key={civ.civilization}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={icon}
                          alt={civ.civilization}
                          className="h-12 w-12 rounded-xl border border-[#3a2621] bg-[#140c0d] object-contain p-1"
                        />

                        <div>
                          <div className="text-sm font-semibold text-white">
                            {prettifyCivilizationName(civ.civilization)}
                          </div>
                          <div className="mt-1 text-sm text-[#bcae9a]">
                            {formatNumber(civ.games_count)} partite
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="rounded-full border border-[#5a3a31] bg-[#140c0d] px-3 py-1 text-[#e8dcc8]">
                          WR {formatPercent(civ.win_rate)}
                        </span>
                        <span className="rounded-full border border-[#5a3a31] bg-[#140c0d] px-3 py-1 text-[#e8dcc8]">
                          Pick {formatPercent(civ.pick_rate)}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-4 text-sm text-[#bcae9a]">
                  Nessuna statistica civ disponibile.
                </div>
              )}
            </div>
          </div>
        </div>

        {player.site_url ? (
          <div className="flex justify-end">
            <a
              href={player.site_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-[#1a0d0c] transition hover:-translate-y-0.5"
            >
              Apri profilo AoE4World
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}

