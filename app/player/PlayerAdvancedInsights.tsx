"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Loader2,
  Search,
  Swords,
} from "lucide-react";
import type { PlayerProfileResponse } from "@/app/lib/aoe4world";

const API_BASE = "https://aoe4world.com/api/v0";
const RECENT_GAMES_LIMIT = 100;
const HEAD_TO_HEAD_LIMIT = 100;
const AUTOCOMPLETE_MIN_CHARS = 3;
const AUTOCOMPLETE_LIMIT = 6;
const AUTOCOMPLETE_DEBOUNCE_MS = 220;

type SearchCandidate = {
  profile_id?: number | string | null;
  profileId?: number | string | null;
  id?: number | string | null;
  name?: string | null;
  nickname?: string | null;
  alias?: string | null;
};

type ResolvedPlayer = {
  profileId: number;
  name: string | null;
};

type NormalizedGamePlayer = {
  profileId: number | null;
  name: string | null;
  won: boolean | null;
  civilization: string | null;
};

type PerspectiveMatch = {
  id: string;
  startedAt: string | null;
  mapName: string | null;
  won: boolean | null;
  myCiv: string | null;
  opponentCiv: string | null;
  opponentName: string | null;
};

type AggregatedStat = {
  label: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number | null;
  lastPlayedAt: string | null;
};

type ProfileSummary = {
  profileId: number | null;
  name: string;
  country: string | null;
  rankLevel: string;
  rating: number | null;
  winRate: number | null;
  games: number | null;
  streak: number | null;
  trendDelta: number | null;
  peakRating: number | null;
  topCiv: string | null;
  topCivGames: number | null;
  lastGameAt: string | null;
};

type RecentMatchesState = {
  loading: boolean;
  error: string | null;
  matches: PerspectiveMatch[];
  fetchedAt: string | null;
};

type CompareState = {
  loading: boolean;
  error: string | null;
  profile: PlayerProfileResponse | null;
  headToHead: PerspectiveMatch[];
  fetchedAt: string | null;
};

type PlayerAdvancedInsightsProps = {
  player: PlayerProfileResponse;
  refreshKey?: number;
};

function toNullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toNullableString(value: unknown): string | null {
  if (typeof value === "string" && value.trim() !== "") return value;
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }

  return null;
}

function formatNumber(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return new Intl.NumberFormat("it-IT").format(value);
}

function formatPercent(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return `${value.toFixed(1)}%`;
}

function formatSignedNumber(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return `${value > 0 ? "+" : ""}${formatNumber(value)}`;
}

function formatDate(value?: string | null) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value?: string | null) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function prettifyLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getRankLabel(rankLevel?: string | null) {
  if (!rankLevel) return "Unranked";
  return prettifyLabel(rankLevel);
}

function getSearchCandidates(payload: unknown): SearchCandidate[] {
  if (Array.isArray(payload)) return payload as SearchCandidate[];
  if (payload && typeof payload === "object") {
    const typedPayload = payload as {
      players?: SearchCandidate[];
      data?: SearchCandidate[];
    };

    if (Array.isArray(typedPayload.players)) return typedPayload.players;
    if (Array.isArray(typedPayload.data)) return typedPayload.data;
  }

  return [];
}

function normalizeSearchResults(payload: unknown): ResolvedPlayer[] {
  const normalized = getSearchCandidates(payload)
    .map((candidate) => ({
      profileId:
        toNullableNumber(candidate.profile_id) ??
        toNullableNumber(candidate.profileId) ??
        toNullableNumber(candidate.id),
      name: candidate.name ?? candidate.nickname ?? candidate.alias ?? null,
    }))
    .filter(
      (candidate): candidate is ResolvedPlayer => candidate.profileId !== null
    );

  return Array.from(
    new Map(normalized.map((candidate) => [candidate.profileId, candidate]))
      .values()
  );
}

function pickBestSearchResult(
  query: string,
  candidates: ResolvedPlayer[]
): ResolvedPlayer | null {
  if (candidates.length === 0) return null;

  const loweredQuery = query.trim().toLowerCase();
  const exactMatch = candidates.find(
    (candidate) => candidate.name?.toLowerCase() === loweredQuery
  );

  if (exactMatch) return exactMatch;

  const prefixMatch = candidates.find((candidate) =>
    candidate.name?.toLowerCase().startsWith(loweredQuery)
  );

  return prefixMatch ?? candidates[0];
}

async function fetchJson(url: string, signal?: AbortSignal) {
  const response = await fetch(url, { cache: "no-store", signal });

  if (!response.ok) {
    throw new Error(`AoE4World ha risposto con ${response.status}.`);
  }

  return response.json();
}

async function fetchPlayerSearchResults(
  query: string,
  signal?: AbortSignal
): Promise<ResolvedPlayer[]> {
  const trimmed = query.trim();

  if (trimmed.length < AUTOCOMPLETE_MIN_CHARS) {
    return [];
  }

  const payload = await fetchJson(
    `${API_BASE}/players/search?query=${encodeURIComponent(trimmed)}`,
    signal
  );

  return normalizeSearchResults(payload);
}

function extractGames(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const typedPayload = payload as {
      games?: unknown[];
      data?: unknown[];
      items?: unknown[];
    };

    if (Array.isArray(typedPayload.games)) return typedPayload.games;
    if (Array.isArray(typedPayload.data)) return typedPayload.data;
    if (Array.isArray(typedPayload.items)) return typedPayload.items;
  }

  return [];
}

function normalizeGamePlayer(
  raw: Record<string, unknown>,
  teamWon?: boolean | null
): NormalizedGamePlayer {
  const won =
    typeof raw?.won === "boolean"
      ? raw.won
      : typeof raw?.result === "string"
      ? raw.result.toLowerCase() === "win"
      : typeof raw?.outcome === "string"
      ? raw.outcome.toLowerCase() === "win"
      : typeof teamWon === "boolean"
      ? teamWon
      : null;

  return {
    profileId:
      toNullableNumber(raw?.profile_id) ??
      toNullableNumber(raw?.profileId) ??
      toNullableNumber(raw?.id) ??
      toNullableNumber(raw?.player_id),
    name:
      toNullableString(raw?.name) ??
      toNullableString(raw?.nickname) ??
      toNullableString(raw?.alias) ??
      toNullableString(raw?.player_name),
    won,
    civilization:
      toNullableString(raw?.civilization) ??
      toNullableString(raw?.civilization_name) ??
      toNullableString(raw?.civ) ??
      toNullableString(raw?.civ_name),
  };
}

function extractPlayersFromGame(game: Record<string, unknown>): NormalizedGamePlayer[] {
  const directPlayers = Array.isArray(game.players) ? game.players : [];
  if (directPlayers.length > 0) {
    return directPlayers
      .map((player) => asRecord(player))
      .filter((player): player is Record<string, unknown> => player !== null)
      .map((player) => normalizeGamePlayer(player))
      .filter((player: NormalizedGamePlayer) => player.profileId !== null);
  }

  const teams = Array.isArray(game.teams) ? game.teams : [];
  if (teams.length > 0) {
    return teams
      .map((team) => asRecord(team))
      .filter((team): team is Record<string, unknown> => team !== null)
      .flatMap((team) => {
        const teamWon = typeof team.won === "boolean" ? team.won : null;
        const teamPlayers = Array.isArray(team.players) ? team.players : [];

        return teamPlayers
          .map((player) => asRecord(player))
          .filter((player): player is Record<string, unknown> => player !== null)
          .map((player) =>
          normalizeGamePlayer(player, teamWon)
        );
      })
      .filter((player: NormalizedGamePlayer) => player.profileId !== null);
  }

  return [];
}

function isOneVsOneGame(game: Record<string, unknown>) {
  const players = extractPlayersFromGame(game);
  if (players.length !== 2) return false;

  const teams = Array.isArray(game.teams) ? game.teams : [];
  if (teams.length > 0) {
    const sizes = teams
      .map((team) => asRecord(team))
      .filter((team): team is Record<string, unknown> => team !== null)
      .map((team) =>
        Array.isArray(team.players) ? team.players.length : 0
      )
      .filter((size: number) => size > 0);

    if (sizes.length !== 2) return false;
    if (!sizes.every((size: number) => size === 1)) return false;
  }

  const leaderboard = String(
    game?.leaderboard ?? game?.leaderboard_id ?? ""
  ).toLowerCase();
  const kind = String(game?.kind ?? game?.game_type ?? game?.type ?? "").toLowerCase();
  const numPlayers = toNullableNumber(game?.num_players ?? game?.player_count);

  if (numPlayers !== null && numPlayers !== 2) return false;
  if (leaderboard && !leaderboard.includes("rm_solo") && !leaderboard.includes("rm_1v1")) {
    return false;
  }

  if (
    kind &&
    (kind.includes("2v2") ||
      kind.includes("3v3") ||
      kind.includes("4v4") ||
      kind.includes("ffa"))
  ) {
    return false;
  }

  return true;
}

function getMapName(game: Record<string, unknown>) {
  const mapObject = asRecord(game.map);
  const mapFromObject =
    toNullableString(mapObject?.name) ??
    toNullableString(mapObject?.display_name) ??
    toNullableString(mapObject?.english_name) ??
    toNullableString(mapObject?.map_name);

  const rawMap =
    mapFromObject ??
    toNullableString(game.map_name) ??
    toNullableString(game.mapName) ??
    toNullableString(game.map);

  const mapId =
    toNullableNumber(mapObject?.map_id) ??
    toNullableNumber(mapObject?.id) ??
    toNullableNumber(game.map_id);

  if (rawMap) return prettifyLabel(rawMap);
  if (mapId !== null) return `Map ${mapId}`;
  return null;
}

function normalizePerspectiveMatch(
  profileId: number,
  rawGame: unknown
): PerspectiveMatch | null {
  const game = asRecord(rawGame);
  if (!game) return null;
  if (!isOneVsOneGame(game)) return null;

  const players = extractPlayersFromGame(game);
  const me = players.find((player) => player.profileId === profileId);
  const opponent = players.find((player) => player.profileId !== profileId);

  if (!me || !opponent) return null;

  const won =
    typeof me.won === "boolean"
      ? me.won
      : typeof opponent.won === "boolean"
      ? !opponent.won
      : null;

  const matchId =
    toNullableNumber(game?.game_id) ??
    toNullableNumber(game?.id) ??
    `${profileId}-${game?.started_at ?? game?.updated_at ?? Math.random()}`;

  return {
    id: String(matchId),
    startedAt:
      toNullableString(game?.started_at) ??
      toNullableString(game?.finished_at) ??
      toNullableString(game?.completed_at) ??
      toNullableString(game?.updated_at),
    mapName: getMapName(game),
    won,
    myCiv: me.civilization ? prettifyLabel(me.civilization) : null,
    opponentCiv: opponent.civilization
      ? prettifyLabel(opponent.civilization)
      : null,
    opponentName: opponent.name,
  };
}

function getTrendDelta(
  history?: Record<string, { rating?: number | null }> | null
) {
  const points = Object.entries(history ?? {})
    .map(([ts, point]) => ({
      ts: Number(ts),
      rating: toNullableNumber(point?.rating),
    }))
    .filter(
      (
        point
      ): point is {
        ts: number;
        rating: number;
      } => Number.isFinite(point.ts) && point.rating !== null
    )
    .sort((a, b) => a.ts - b.ts);

  if (points.length < 2) return null;
  return points[points.length - 1].rating - points[0].rating;
}

function getProfileSummary(profile: PlayerProfileResponse): ProfileSummary {
  const solo = profile.modes?.rm_solo;
  const elo = profile.modes?.rm_1v1_elo;
  const civilizations = Array.isArray(solo?.civilizations)
    ? [...solo.civilizations]
        .filter(
          (civ): civ is NonNullable<typeof civ> =>
            Boolean(civ) &&
            typeof civ.civilization === "string" &&
            civ.civilization.trim() !== ""
        )
        .sort((a, b) => (b.games_count ?? 0) - (a.games_count ?? 0))
    : [];
  const topCiv = civilizations[0];

  return {
    profileId: toNullableNumber(profile.profile_id),
    name: profile.name ?? "Giocatore",
    country: profile.country ?? null,
    rankLevel: getRankLabel(solo?.rank_level),
    rating: toNullableNumber(elo?.rating) ?? toNullableNumber(solo?.rating),
    winRate: toNullableNumber(elo?.win_rate) ?? toNullableNumber(solo?.win_rate),
    games:
      toNullableNumber(elo?.games_count) ?? toNullableNumber(solo?.games_count),
    streak:
      toNullableNumber(elo?.streak) ?? toNullableNumber(solo?.streak),
    trendDelta: getTrendDelta(elo?.rating_history),
    peakRating: toNullableNumber(elo?.max_rating),
    topCiv: topCiv?.civilization ? prettifyLabel(topCiv.civilization) : null,
    topCivGames: toNullableNumber(topCiv?.games_count),
    lastGameAt: elo?.last_game_at ?? solo?.last_game_at ?? null,
  };
}

function aggregateStats(
  matches: PerspectiveMatch[],
  getLabel: (match: PerspectiveMatch) => string | null
): AggregatedStat[] {
  const buckets = new Map<
    string,
    {
      label: string;
      games: number;
      wins: number;
      losses: number;
      lastPlayedAt: string | null;
    }
  >();

  matches.forEach((match) => {
    const label = getLabel(match);
    if (!label) return;

    const existing = buckets.get(label) ?? {
      label,
      games: 0,
      wins: 0,
      losses: 0,
      lastPlayedAt: null,
    };

    existing.games += 1;
    if (match.won === true) existing.wins += 1;
    if (match.won === false) existing.losses += 1;

    if (
      match.startedAt &&
      (!existing.lastPlayedAt ||
        new Date(match.startedAt).getTime() >
          new Date(existing.lastPlayedAt).getTime())
    ) {
      existing.lastPlayedAt = match.startedAt;
    }

    buckets.set(label, existing);
  });

  return [...buckets.values()]
    .map((bucket) => {
      const decidedGames = bucket.wins + bucket.losses;

      return {
        ...bucket,
        winRate:
          decidedGames > 0 ? (bucket.wins / decidedGames) * 100 : null,
      };
    })
    .sort((a, b) => {
      if (b.games !== a.games) return b.games - a.games;
      return (b.winRate ?? -1) - (a.winRate ?? -1);
    });
}

function pickStatLeader(
  stats: AggregatedStat[],
  direction: "best" | "worst",
  minGames = 2
) {
  const eligible = stats.filter((stat) => stat.games >= minGames);
  const source = eligible.length > 0 ? eligible : stats;

  if (source.length === 0) return null;

  return [...source].sort((a, b) => {
    const aValue = a.winRate ?? -1;
    const bValue = b.winRate ?? -1;

    if (aValue === bValue) return b.games - a.games;
    return direction === "best" ? bValue - aValue : aValue - bValue;
  })[0];
}

function getReliabilityTier(games: number | null) {
  if (games === null || games <= 0) {
    return {
      label: "Assente",
      tone:
        "border-slate-700 bg-slate-950/70 text-slate-300",
      description: "Nessun campione utile.",
    };
  }

  if (games >= 80) {
    return {
      label: "Alta",
      tone:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
      description: "Campione molto solido.",
    };
  }

  if (games >= 35) {
    return {
      label: "Buona",
      tone: "border-blue-500/30 bg-blue-500/10 text-blue-200",
      description: "Trend gia abbastanza leggibile.",
    };
  }

  if (games >= 12) {
    return {
      label: "Media",
      tone:
        "border-amber-500/30 bg-amber-500/10 text-amber-200",
      description: "Serve ancora contesto.",
    };
  }

  return {
    label: "Bassa",
    tone: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    description: "Troppo pochi match per conclusioni forti.",
  };
}

function getHeadToHeadSummary(matches: PerspectiveMatch[]) {
  const wins = matches.filter((match) => match.won === true).length;
  const losses = matches.filter((match) => match.won === false).length;
  const ordered = [...matches]
    .filter((match) => match.startedAt)
    .sort(
      (a, b) =>
        new Date(b.startedAt as string).getTime() -
        new Date(a.startedAt as string).getTime()
    );

  return {
    wins,
    losses,
    total: matches.length,
    latestAt: ordered[0]?.startedAt ?? null,
  };
}

function ReliabilityChip({ games }: { games: number | null }) {
  const tier = getReliabilityTier(games);

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${tier.tone}`}
    >
      {tier.label}
    </span>
  );
}

export default function PlayerAdvancedInsights({
  player,
  refreshKey = 0,
}: PlayerAdvancedInsightsProps) {
  const currentSummary = useMemo(() => getProfileSummary(player), [player]);
  const profileId = currentSummary.profileId;

  const [recentState, setRecentState] = useState<RecentMatchesState>({
    loading: false,
    error: null,
    matches: [],
    fetchedAt: null,
  });

  const compareInputId = useId();
  const suggestionsId = `${compareInputId}-compare-suggestions`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [compareQuery, setCompareQuery] = useState("");
  const [compareSearchError, setCompareSearchError] = useState<string | null>(
    null
  );
  const [compareSuggestions, setCompareSuggestions] = useState<ResolvedPlayer[]>(
    []
  );
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [compareState, setCompareState] = useState<CompareState>({
    loading: false,
    error: null,
    profile: null,
    headToHead: [],
    fetchedAt: null,
  });

  useEffect(() => {
    if (profileId === null) return;
    const currentProfileId = profileId;

    let isCancelled = false;

    async function loadRecentMatches() {
      setRecentState((current) => ({
        ...current,
        loading: true,
        error: null,
      }));

      try {
        const payload = await fetchJson(
          `${API_BASE}/players/${currentProfileId}/games?leaderboard=rm_solo&limit=${RECENT_GAMES_LIMIT}`
        );

        if (isCancelled) return;

        const matches = extractGames(payload)
          .map((game) => normalizePerspectiveMatch(currentProfileId, game))
          .filter(
            (match): match is PerspectiveMatch => match !== null
          );

        setRecentState({
          loading: false,
          error: null,
          matches,
          fetchedAt: new Date().toISOString(),
        });
      } catch (error) {
        if (isCancelled) return;

        setRecentState({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Errore durante il caricamento delle partite recenti.",
          matches: [],
          fetchedAt: new Date().toISOString(),
        });
      }
    }

    void loadRecentMatches();

    return () => {
      isCancelled = true;
    };
  }, [profileId, refreshKey]);

  useEffect(() => {
    const trimmed = compareQuery.trim();

    if (trimmed.length < AUTOCOMPLETE_MIN_CHARS) {
      setCompareSuggestions([]);
      setHighlightedIndex(-1);
      setIsAutocompleteLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsAutocompleteLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const nextSuggestions = await fetchPlayerSearchResults(
          trimmed,
          controller.signal
        );

        setCompareSuggestions(nextSuggestions.slice(0, AUTOCOMPLETE_LIMIT));
        setHighlightedIndex(nextSuggestions.length > 0 ? 0 : -1);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setCompareSuggestions([]);
        setHighlightedIndex(-1);
      } finally {
        if (!controller.signal.aborted) {
          setIsAutocompleteLoading(false);
        }
      }
    }, AUTOCOMPLETE_DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [compareQuery]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsAutocompleteOpen(false);
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const mapStats = useMemo(
    () => aggregateStats(recentState.matches, (match) => match.mapName),
    [recentState.matches]
  );
  const ownCivStats = useMemo(
    () => aggregateStats(recentState.matches, (match) => match.myCiv),
    [recentState.matches]
  );
  const opponentCivStats = useMemo(
    () => aggregateStats(recentState.matches, (match) => match.opponentCiv),
    [recentState.matches]
  );
  const bestMap = useMemo(() => pickStatLeader(mapStats, "best"), [mapStats]);
  const hardestEnemyCiv = useMemo(
    () => pickStatLeader(opponentCivStats, "worst"),
    [opponentCivStats]
  );
  const mostPlayedOwnCiv = ownCivStats[0] ?? null;
  const headToHeadSummary = useMemo(
    () => getHeadToHeadSummary(compareState.headToHead),
    [compareState.headToHead]
  );
  const compareSummary = useMemo(
    () => (compareState.profile ? getProfileSummary(compareState.profile) : null),
    [compareState.profile]
  );

  const shouldShowAutocomplete =
    isAutocompleteOpen &&
    compareQuery.trim().length >= AUTOCOMPLETE_MIN_CHARS &&
    (isAutocompleteLoading ||
      compareSuggestions.length > 0 ||
      !compareSearchError);

  async function handleCompareSelection(selectedPlayer: ResolvedPlayer) {
    if (profileId === null) return;
    const currentProfileId = profileId;

    if (selectedPlayer.profileId === currentProfileId) {
      setCompareSearchError("Questo e gia il player aperto in pagina.");
      return;
    }

    setCompareQuery(selectedPlayer.name ?? `Player ${selectedPlayer.profileId}`);
    setCompareSearchError(null);
    setIsAutocompleteOpen(false);
    setCompareSuggestions([]);
    setHighlightedIndex(-1);
    setCompareState((current) => ({
      ...current,
      loading: true,
      error: null,
    }));

    try {
      const [profilePayload, headToHeadPayload] = await Promise.all([
        fetchJson(`${API_BASE}/players/${selectedPlayer.profileId}`),
        fetchJson(
          `${API_BASE}/players/${currentProfileId}/games?leaderboard=rm_solo&opponent_profile_id=${selectedPlayer.profileId}&limit=${HEAD_TO_HEAD_LIMIT}`
        ),
      ]);

      const profileResponse =
        profilePayload && typeof profilePayload === "object"
          ? (profilePayload as PlayerProfileResponse)
          : null;

      const headToHeadMatches = extractGames(headToHeadPayload)
        .map((game) => normalizePerspectiveMatch(currentProfileId, game))
        .filter(
          (match): match is PerspectiveMatch => match !== null
        );

      setCompareState({
        loading: false,
        error: null,
        profile: profileResponse,
        headToHead: headToHeadMatches,
        fetchedAt: new Date().toISOString(),
      });
    } catch (error) {
      setCompareState({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Errore durante il confronto del player.",
        profile: null,
        headToHead: [],
        fetchedAt: new Date().toISOString(),
      });
    }
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isAutocompleteOpen || compareSuggestions.length === 0) {
      if (event.key === "ArrowDown" && compareSuggestions.length > 0) {
        event.preventDefault();
        setIsAutocompleteOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((currentIndex) =>
        Math.min(currentIndex + 1, compareSuggestions.length - 1)
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((currentIndex) => Math.max(currentIndex - 1, 0));
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsAutocompleteOpen(false);
      setHighlightedIndex(-1);
    }

    if (event.key === "Enter" && highlightedIndex >= 0) {
      event.preventDefault();
      void handleCompareSelection(compareSuggestions[highlightedIndex]);
    }
  }

  async function handleCompareSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = compareQuery.trim();
    if (trimmed.length < AUTOCOMPLETE_MIN_CHARS) {
      setCompareSearchError("Inserisci almeno 3 caratteri.");
      return;
    }

    setCompareSearchError(null);

    try {
      const results = await fetchPlayerSearchResults(trimmed);
      const bestCandidate = pickBestSearchResult(trimmed, results);

      if (!bestCandidate) {
        setCompareSearchError("Nessun player trovato con questo nome.");
        return;
      }

      await handleCompareSelection(bestCandidate);
    } catch (error) {
      setCompareSearchError(
        error instanceof Error
          ? error.message
          : "Errore nella ricerca del player."
      );
    }
  }

  const compareMetrics = compareSummary
    ? [
        {
          label: "1v1 ELO",
          current: formatNumber(currentSummary.rating),
          other: formatNumber(compareSummary.rating),
        },
        {
          label: "Winrate",
          current: formatPercent(currentSummary.winRate),
          other: formatPercent(compareSummary.winRate),
        },
        {
          label: "Partite",
          current: formatNumber(currentSummary.games),
          other: formatNumber(compareSummary.games),
        },
        {
          label: "Trend",
          current: formatSignedNumber(currentSummary.trendDelta),
          other: formatSignedNumber(compareSummary.trendDelta),
        },
        {
          label: "Peak ELO",
          current: formatNumber(currentSummary.peakRating),
          other: formatNumber(compareSummary.peakRating),
        },
        {
          label: "Top civ",
          current: currentSummary.topCiv ?? "--",
          other: compareSummary.topCiv ?? "--",
        },
      ]
    : [];

  const soloReliability = getReliabilityTier(currentSummary.games);
  const mapReliability = getReliabilityTier(bestMap?.games ?? null);
  const ownCivReliability = getReliabilityTier(mostPlayedOwnCiv?.games ?? null);
  const enemyCivReliability = getReliabilityTier(
    hardestEnemyCiv?.games ?? null
  );

  return (
    <div className="space-y-6">
      {recentState.loading ? (
        <div className="flex items-center gap-3 rounded-[1.75rem] border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
          Aggiornamento partite recenti in corso...
        </div>
      ) : null}

      {recentState.error ? (
        <div className="rounded-[1.75rem] border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {recentState.error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-1">
        <section className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
            Affidabilita
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            Qualita del campione
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Qui separiamo i numeri molto leggibili dai numeri ancora fragili:
            piu match hai dietro, piu il dato e realmente utile.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {[
              {
                title: "1v1 overall",
                games: currentSummary.games,
                description: soloReliability.description,
              },
              {
                title: "Mappe",
                games: bestMap?.games ?? null,
                description: mapReliability.description,
              },
              {
                title: "Civ giocata",
                games: mostPlayedOwnCiv?.games ?? null,
                description: ownCivReliability.description,
              },
              {
                title: "Matchup civ",
                games: hardestEnemyCiv?.games ?? null,
                description: enemyCivReliability.description,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-semibold text-white">
                    {item.title}
                  </div>
                  <ReliabilityChip games={item.games} />
                </div>
                <div className="mt-2 text-sm text-slate-400">
                  {formatNumber(item.games)} match utili
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm leading-7 text-slate-400">
            Regola pratica: sotto le 5-10 partite una lettura forte su mappe o
            matchup puo essere fuorviante. Sopra le 30 inizia a diventare molto
            piu credibile.
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
              Compare
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              Confronta con un altro player
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              Cerca un secondo player e confronta subito ELO, winrate,
              volume, trend, top civ e scontri diretti.
            </p>
          </div>

          <form
            onSubmit={handleCompareSubmit}
            className="w-full xl:max-w-3xl"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <div
                ref={containerRef}
                role="combobox"
                aria-expanded={shouldShowAutocomplete}
                aria-haspopup="listbox"
                aria-controls={suggestionsId}
                className="relative flex-1"
              >
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id={compareInputId}
                  type="text"
                  value={compareQuery}
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-activedescendant={
                    highlightedIndex >= 0
                      ? `${compareInputId}-option-${compareSuggestions[highlightedIndex]?.profileId}`
                      : undefined
                  }
                  onChange={(event) => {
                    setCompareQuery(event.target.value);
                    setIsAutocompleteOpen(true);
                    if (compareSearchError) {
                      setCompareSearchError(null);
                    }
                  }}
                  onFocus={() => {
                    if (compareQuery.trim().length >= AUTOCOMPLETE_MIN_CHARS) {
                      setIsAutocompleteOpen(true);
                    }
                  }}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Cerca un player da confrontare..."
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 py-3.5 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/50 focus:bg-slate-950"
                />

                {isAutocompleteLoading ? (
                  <Loader2 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-amber-300" />
                ) : null}

                {shouldShowAutocomplete ? (
                  <div
                    id={suggestionsId}
                    role="listbox"
                    className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-20 overflow-hidden rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,12,24,0.98),rgba(12,19,33,0.98))] shadow-[0_22px_60px_rgba(2,6,23,0.55)]"
                  >
                    {compareSuggestions.length > 0 ? (
                      compareSuggestions.map((suggestion, index) => {
                        const isHighlighted = index === highlightedIndex;

                        return (
                          <button
                            key={suggestion.profileId}
                            id={`${compareInputId}-option-${suggestion.profileId}`}
                            type="button"
                            role="option"
                            aria-selected={isHighlighted}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() =>
                              void handleCompareSelection(suggestion)
                            }
                            className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition ${
                              isHighlighted
                                ? "bg-amber-400/10 text-white"
                                : "text-slate-200 hover:bg-white/5"
                            }`}
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">
                                {suggestion.name ?? `Player ${suggestion.profileId}`}
                              </span>
                              <span className="mt-1 block text-xs text-slate-400">
                                Profile ID {suggestion.profileId}
                              </span>
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-amber-300">
                              Confronta
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-4 text-sm text-slate-400">
                        Nessun suggerimento trovato per{" "}
                        <span className="text-slate-200">
                          {compareQuery.trim()}
                        </span>
                        .
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={compareState.loading}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(180deg,#facc15,#f59e0b)] px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_30px_rgba(245,158,11,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(245,158,11,0.32)] disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-[156px]"
              >
                {compareState.loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carico...
                  </>
                ) : (
                  "Confronta"
                )}
              </button>
            </div>

            {compareSearchError ? (
              <p className="mt-3 text-sm text-rose-300">{compareSearchError}</p>
            ) : null}
          </form>
        </div>

        {compareState.error ? (
          <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
            {compareState.error}
          </div>
        ) : null}

        {compareSummary ? (
          <div className="mt-8 space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              {[currentSummary, compareSummary].map((summary, index) => (
                <div
                  key={`${summary.name}-${index}`}
                  className={`rounded-[1.75rem] border p-5 ${
                    index === 0
                      ? "border-amber-500/25 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.12),transparent_36%),#020617]"
                      : "border-slate-800 bg-slate-950/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
                        {index === 0 ? "Player attuale" : "Player confrontato"}
                      </div>
                      <div className="mt-3 text-2xl font-bold text-white">
                        {summary.name}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1">
                          {summary.rankLevel}
                        </span>
                        {summary.country ? (
                          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 uppercase">
                            {summary.country}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-right">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        1v1 ELO
                      </div>
                      <div className="mt-1 text-2xl font-bold text-white">
                        {formatNumber(summary.rating)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
                  Metriche a confronto
                </div>
                <div className="mt-5 space-y-3">
                  {compareMetrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:grid-cols-[1fr_1fr_1fr]"
                    >
                      <div className="text-sm font-semibold text-white">
                        {metric.label}
                      </div>
                      <div className="text-sm text-slate-300">
                        {currentSummary.name}:{" "}
                        <span className="font-semibold text-white">
                          {metric.current}
                        </span>
                      </div>
                      <div className="text-sm text-slate-300">
                        {compareSummary.name}:{" "}
                        <span className="font-semibold text-white">
                          {metric.other}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
                  <Swords className="h-4 w-4" />
                  Head to head
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-emerald-300">
                      Wins
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      {formatNumber(headToHeadSummary.wins)}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-rose-300">
                      Losses
                    </div>
                    <div className="mt-2 text-2xl font-bold text-white">
                      {formatNumber(headToHeadSummary.losses)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
                  <div>
                    Match trovati:{" "}
                    <span className="font-semibold text-white">
                      {formatNumber(headToHeadSummary.total)}
                    </span>
                  </div>
                  <div className="mt-2">
                    Ultimo incrocio:{" "}
                    <span className="font-semibold text-white">
                      {formatDate(headToHeadSummary.latestAt)}
                    </span>
                  </div>
                  <div className="mt-2">
                    Sync confronto:{" "}
                    <span className="font-semibold text-white">
                      {formatDateTime(compareState.fetchedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 text-sm leading-7 text-slate-400">
            Nessun player confrontato ancora. Cerca un nome Steam e apri il
            confronto diretto su ELO, winrate, volume, trend e scontri
            incrociati.
          </div>
        )}
      </section>
    </div>
  );
}
