"use client";

type RatingPoint = {
  rating: number;
  games_count?: number;
  wins_count?: number;
  streak?: number | null;
  orig_rating?: number;
};

type RatingHistory = Record<string, RatingPoint>;

type CivilizationStat = {
  civilization: string;
  win_rate?: number;
  pick_rate?: number;
  games_count?: number;
};

type ModeStats = {
  rating?: number;
  max_rating?: number;
  rank?: number | null;
  rank_level?: string | null;
  streak?: number | null;
  games_count?: number;
  wins_count?: number;
  losses_count?: number;
  disputes_count?: number;
  drops_count?: number;
  last_game_at?: string;
  win_rate?: number;
  rating_history?: RatingHistory;
  civilizations?: CivilizationStat[];
  previous_seasons?: PreviousSeason[];
  season?: number;
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

type PlayerProfile = {
  name: string;
  profile_id: number;
  country?: string;
  site_url?: string;
  avatars?: {
    small?: string;
    medium?: string;
    full?: string;
  };
  modes: {
    rm_solo?: ModeStats;
    rm_1v1_elo?: ModeStats;
    rm_2v2_elo?: ModeStats;
    rm_3v3_elo?: ModeStats;
    rm_4v4_elo?: ModeStats;
    rm_team?: ModeStats;
    [key: string]: ModeStats | undefined;
  };
};

type PlayerDashboardProps = {
  player: PlayerProfile;
  civIcons?: Record<string, string>;
};

type PerformanceRow = {
  key: string;
  label: string;
  rating: number | null;
  winRate: number | null;
  rank: number | null;
  streak: number | null;
  games: number | null;
  lastGameAt: string | null;
  history: Array<{ ts: number; rating: number }>;
};

const DEFAULT_CIV_ICON = "/images/civs/generic.png";

function formatNumber(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("it-IT").format(value);
}

function formatPercent(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}%`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatShortDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function getRankLabel(rankLevel?: string | null) {
  if (!rankLevel) return "Unranked";

  return rankLevel
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getWinRateTone(winRate: number | null) {
  if (winRate === null) return "border-slate-700 bg-slate-950/70 text-slate-300";
  if (winRate >= 85) return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  if (winRate >= 70) return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
  if (winRate >= 50) return "border-blue-400/30 bg-blue-400/10 text-blue-200";
  return "border-rose-400/30 bg-rose-400/10 text-rose-200";
}

function getStreakTone(streak: number | null) {
  if (streak === null || streak === 0) return "text-slate-300";
  if (streak > 0) return "text-emerald-300";
  return "text-rose-300";
}

function getModeRows(player: PlayerProfile): PerformanceRow[] {
  const mapping = [
    { key: "rm_1v1_elo", label: "1v1" },
    { key: "rm_2v2_elo", label: "2v2" },
    { key: "rm_3v3_elo", label: "3v3" },
    { key: "rm_4v4_elo", label: "4v4" },
  ];

  return mapping.map(({ key, label }) => {
    const mode = player.modes[key];
    const history = Object.entries(mode?.rating_history ?? {})
      .map(([ts, point]) => ({
        ts: Number(ts),
        rating: point.rating,
      }))
      .filter((item) => Number.isFinite(item.ts) && Number.isFinite(item.rating))
      .sort((a, b) => a.ts - b.ts);

    return {
      key,
      label,
      rating: typeof mode?.rating === "number" ? mode.rating : null,
      winRate: typeof mode?.win_rate === "number" ? mode.win_rate : null,
      rank: typeof mode?.rank === "number" ? mode.rank : null,
      streak: typeof mode?.streak === "number" ? mode.streak : null,
      games: typeof mode?.games_count === "number" ? mode.games_count : null,
      lastGameAt: mode?.last_game_at ?? null,
      history,
    };
  });
}

function getCurrentSoloSummary(player: PlayerProfile) {
  const rankedSolo = player.modes.rm_solo;
  const eloSolo = player.modes.rm_1v1_elo;

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

function getBestMode(rows: PerformanceRow[]) {
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

function getWorstRecentDrop(history: Array<{ ts: number; rating: number }>) {
  if (history.length < 2) return null;

  let worstDrop = 0;

  for (let i = 1; i < history.length; i += 1) {
    const delta = history[i].rating - history[i - 1].rating;
    if (delta < worstDrop) worstDrop = delta;
  }

  return worstDrop === 0 ? null : worstDrop;
}

function getPeakRating(rows: PerformanceRow[]) {
  let peak: { mode: string; rating: number } | null = null;

  rows.forEach((row) => {
    const rowPeak =
      row.history.length > 0
        ? Math.max(...row.history.map((point) => point.rating))
        : row.rating;

    if (typeof rowPeak !== "number") return;

    if (!peak || rowPeak > peak.rating) {
      peak = { mode: row.label, rating: rowPeak };
    }
  });

  return peak;
}

function getTeamVsSoloInsight(rows: PerformanceRow[]) {
  const solo = rows.find((row) => row.label === "1v1");
  const teamRows = rows.filter((row) => row.label !== "1v1" && row.winRate !== null);

  if (!solo?.winRate || teamRows.length === 0) return null;

  const teamAvg =
    teamRows.reduce((sum, row) => sum + (row.winRate ?? 0), 0) / teamRows.length;

  if (teamAvg - solo.winRate >= 8) return "Player più forte in team game che in solo.";
  if (solo.winRate - teamAvg >= 8) return "Player più forte in solo queue che in team game.";

  return "Performance abbastanza equilibrata tra solo e team game.";
}

function getAllSeasons(player: PlayerProfile): PreviousSeason[] {
  const seasonMap = new Map<number, PreviousSeason>();

  Object.values(player.modes).forEach((mode) => {
    (mode?.previous_seasons ?? []).forEach((season) => {
      const existing = seasonMap.get(season.season);

      if (!existing) {
        seasonMap.set(season.season, season);
        return;
      }

      const existingScore = existing.rating ?? -1;
      const nextScore = season.rating ?? -1;

      if (nextScore > existingScore) {
        seasonMap.set(season.season, season);
      }
    });
  });

  return [...seasonMap.values()].sort((a, b) => a.season - b.season);
}

function getTopCivs(player: PlayerProfile): CivilizationStat[] {
  const civs =
    player.modes.rm_team?.civilizations?.length
      ? player.modes.rm_team.civilizations
      : player.modes.rm_solo?.civilizations?.length
      ? player.modes.rm_solo.civilizations
      : [];

  return [...civs].sort((a, b) => (b.games_count ?? 0) - (a.games_count ?? 0)).slice(0, 3);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
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
      <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950/70 p-6 text-sm text-slate-400">
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
    <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
            Progressione ELO
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{title}</h3>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Inizio</div>
            <div className="mt-1 text-sm font-semibold text-white">{formatNumber(first.rating)}</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Fine</div>
            <div className="mt-1 text-sm font-semibold text-white">{formatNumber(last.rating)}</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Delta</div>
            <div
              className={`mt-1 text-sm font-semibold ${
                last.rating - first.rating >= 0 ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {last.rating - first.rating >= 0 ? "+" : ""}
              {formatNumber(last.rating - first.rating)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-950/80 p-4">
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
                  className="stroke-slate-800"
                  strokeWidth="1"
                />
                <text
                  x={8}
                  y={y + 4}
                  className="fill-slate-500 text-[12px]"
                >
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
                  {`${formatShortDate(new Date(point.ts * 1000).toISOString())} • ${point.rating} ELO`}
                </title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function PlayerDashboard({
  player,
  civIcons = {},
}: PlayerDashboardProps) {
  const rows = getModeRows(player);
  const summary = getCurrentSoloSummary(player);
  const bestMode = getBestMode(rows);
  const peak = getPeakRating(rows);
  const soloHistory = rows.find((row) => row.label === "1v1")?.history ?? [];
  const worstDrop = getWorstRecentDrop(soloHistory);
  const teamVsSoloInsight = getTeamVsSoloInsight(rows);
  const seasons = getAllSeasons(player);
  const topCivs = getTopCivs(player);

  const insights = [
    bestMode
      ? `Modalità migliore: ${bestMode.label} (${formatPercent(bestMode.winRate)} winrate).`
      : null,
    peak ? `Peak rating registrato: ${formatNumber(peak.rating)} in ${peak.mode}.` : null,
    worstDrop ? `Peggior calo recente in 1v1: ${formatNumber(worstDrop)} ELO.` : null,
    summary.totalGames && summary.totalGames >= 500
      ? `Profilo molto rodato: ${formatNumber(summary.totalGames)} partite in 1v1.`
      : null,
    teamVsSoloInsight,
  ].filter(Boolean) as string[];

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="space-y-8">
        <div className="rounded-[2rem] border border-amber-500/20 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.12),transparent_35%),#0f172a] p-8 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              {player.avatars?.full || player.avatars?.medium || player.avatars?.small ? (
                <img
                  src={player.avatars.full || player.avatars.medium || player.avatars.small}
                  alt={player.name}
                  className="h-20 w-20 rounded-2xl border border-slate-700 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-2xl font-bold text-amber-300">
                  {getInitials(player.name)}
                </div>
              )}

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
                  Player Dashboard
                </p>

                <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                  {player.name}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                  <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1">
                    {summary.rankLevel}
                  </span>

                  <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1">
                    Rank #{formatNumber(summary.currentRank)}
                  </span>

                  <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1">
                    1v1 ELO {formatNumber(summary.currentRating)}
                  </span>

                  {player.country ? (
                    <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 uppercase">
                      {player.country}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-center">
                <div className={`text-2xl font-bold ${getStreakTone(summary.streak ?? null)}`}>
                  {typeof summary.streak === "number"
                    ? `${summary.streak > 0 ? "+" : ""}${summary.streak}`
                    : "—"}
                </div>
                <div className="mt-1 text-sm text-slate-400">Streak</div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-center">
                <div className="text-2xl font-bold text-amber-300">
                  {formatNumber(summary.totalGames)}
                </div>
                <div className="mt-1 text-sm text-slate-400">Partite 1v1</div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-center">
                <div className="text-2xl font-bold text-white">{formatDate(summary.lastGameAt)}</div>
                <div className="mt-1 text-sm text-slate-400">Ultima partita</div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-center">
                <div className="text-2xl font-bold text-amber-300">
                  {peak ? formatNumber(peak.rating) : "—"}
                </div>
                <div className="mt-1 text-sm text-slate-400">Peak ELO</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
                Performance
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white">Prestazioni per modalità</h2>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {rows.map((row) => (
              <div
                key={row.key}
                className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-5"
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
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">ELO</div>
                    <div className="mt-1 text-lg font-bold text-white">{formatNumber(row.rating)}</div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Rank</div>
                    <div className="mt-1 text-lg font-bold text-white">#{formatNumber(row.rank)}</div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Streak</div>
                    <div className={`mt-1 text-lg font-bold ${getStreakTone(row.streak)}`}>
                      {typeof row.streak === "number"
                        ? `${row.streak > 0 ? "+" : ""}${row.streak}`
                        : "—"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Partite</div>
                    <div className="mt-1 text-lg font-bold text-white">{formatNumber(row.games)}</div>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-400">
                  Ultima partita: {formatDate(row.lastGameAt)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <EloLineChart data={soloHistory} title="Storico 1v1" />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
              Analisi
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">Insight automatici</h2>

            <div className="mt-6 space-y-3">
              {insights.length > 0 ? (
                insights.map((insight, index) => (
                  <div
                    key={`${insight}-${index}`}
                    className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm leading-7 text-slate-300"
                  >
                    {insight}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-400">
                  Dati insufficienti per generare insight.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
              Playstyle
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">Profilo giocatore</h2>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="text-sm font-semibold text-white">
                  {bestMode?.label !== "1v1" ? "Stratega da team game" : "Specialista del solo"}
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  {teamVsSoloInsight ?? "Profilo in definizione."}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="text-sm font-semibold text-white">
                  {summary.totalGames && summary.totalGames >= 500 ? "Grinder esperto" : "Sample ridotto"}
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  {summary.totalGames && summary.totalGames >= 500
                    ? "Grande volume di partite, dati molto più affidabili della media."
                    : "Servono più partite per descrivere il profilo con precisione."}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="text-sm font-semibold text-white">
                  {worstDrop && worstDrop <= -100 ? "Rischio tilt recente" : "Andamento abbastanza stabile"}
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  {worstDrop && worstDrop <= -100
                    ? `Nello storico 1v1 compare un calo brusco di ${formatNumber(worstDrop)} ELO.`
                    : "Non emergono crolli recenti particolarmente pesanti nello storico disponibile."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
              Stagioni
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">Storico ranked</h2>

            <div className="mt-6 space-y-3">
              {seasons.length > 0 ? (
                seasons.map((season) => (
                  <div
                    key={season.season}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Season {season.season}
                      </div>
                      <div className="mt-1 text-sm text-slate-400">
                        {getRankLabel(season.rank_level)} • Ultima partita {formatDate(season.last_game_at)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200">
                        Rating {formatNumber(season.rating)}
                      </span>
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200">
                        Rank #{formatNumber(season.rank)}
                      </span>
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200">
                        WR {formatPercent(season.win_rate)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-400">
                  Nessuna season storica disponibile.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
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
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={icon}
                          alt={civ.civilization}
                          className="h-12 w-12 rounded-xl border border-slate-800 bg-slate-900 object-contain p-1"
                        />

                        <div>
                          <div className="text-sm font-semibold text-white">
                            {civ.civilization.replaceAll("_", " ")}
                          </div>
                          <div className="mt-1 text-sm text-slate-400">
                            {formatNumber(civ.games_count)} partite
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200">
                          WR {formatPercent(civ.win_rate)}
                        </span>
                        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200">
                          Pick {formatPercent(civ.pick_rate)}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-400">
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
              className="inline-flex rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
            >
              Apri profilo AoE4World
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}