"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Crown,
  ExternalLink,
  Loader2,
  Network,
  RefreshCw,
  Search,
  ShieldAlert,
  Swords,
  Trophy,
  Users,
} from "lucide-react";

/**
 * Robust taffuz number page.
 *
 * Goal:
 * - User inputs a player name or profile id
 * - Page resolves the player
 * - Page computes ONLY that player's shortest 1v1 ranked path to Taffuz
 * - Search is targeted, not limited to a prebuilt partial table UI flow
 *
 * Strategy:
 * 1) Resolve input -> profile id (by direct id or AoE4World search)
 * 2) Bidirectional BFS on the loss graph:
 *      A -> B means A lost to B, so B is closer to Taffuz
 * 3) Expand from both sides (input player and Taffuz) using ONLY 1v1 ranked matches
 * 4) Stop as soon as the frontiers meet, then reconstruct the shortest path
 *
 * Important:
 * - Still browser-side and API-driven, so limits are necessary
 * - This is much more robust than the previous â€œsearch inside preloaded graphâ€ approach
 */

type MatchEdge = {
  winnerId: number;
  winnerName: string;
  loserId: number;
  loserName: string;
};

type ResolvedPlayer = {
  profileId: number;
  name: string;
};

type SearchResult = {
  loading: boolean;
  resolving: boolean;
  error: string | null;
  resolvedPlayer: ResolvedPlayer | null;
  number: number | null;
  path: number[] | null;
  names: Record<number, string>;
  visitedFromInput: number;
  visitedFromTarget: number;
  totalRequests: number;
  meetingPlayerId: number | null;
};

const TARGET_ID = 10205181;
const TARGET_NAME = "[PsK]Taffuz_gg_TV";
const TARGET_SLUG = "taffuz_gg";
const TARGET_PROFILE_URL = "https://aoe4world.com/players/10205181";
const API_BASE = "https://aoe4world.com/api/v0";

const MAX_VISITED_PER_SIDE = 12000;
const MAX_TOTAL_REQUESTS = 40000;
const MAX_PAGES_PER_PLAYER = 999;
const GAMES_PER_PAGE = 50;
const AUTO_SEARCH_DEBOUNCE_MS = 500;

function getDistanceLabel(distance: number) {
  if (distance === 0) return "The Man Himself";
  if (distance === 1) return "Direct Slayer";
  if (distance === 2) return "Elite Hunter";
  if (distance === 3) return "Frontier Raider";
  if (distance <= 5) return "Battleline Veteran";
  return "Long-Chain Warrior";
}

function safeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizePlayer(raw: any) {
  const profileId =
    safeNumber(raw?.profile_id) ??
    safeNumber(raw?.profileId) ??
    safeNumber(raw?.id) ??
    safeNumber(raw?.player_id);

  const name =
    raw?.name ??
    raw?.nickname ??
    raw?.alias ??
    raw?.player_name ??
    (profileId ? `Player ${profileId}` : "Unknown player");

  const won =
    typeof raw?.won === "boolean"
      ? raw.won
      : typeof raw?.result === "string"
        ? raw.result.toLowerCase() === "win"
        : typeof raw?.outcome === "string"
          ? raw.outcome.toLowerCase() === "win"
          : null;

  return {
    profileId,
    name,
    won,
  };
}

function extractPlayersFromGame(game: any) {
  if (Array.isArray(game?.players)) {
    return game.players.map(normalizePlayer).filter((player: any) => player.profileId !== null);
  }

  if (Array.isArray(game?.teams)) {
    return game.teams
      .flatMap((team: any) => {
        const teamWon = typeof team?.won === "boolean" ? team.won : null;
        const teamPlayers = Array.isArray(team?.players) ? team.players : [];
        return teamPlayers.map((player: any) => {
          const normalized = normalizePlayer(player);
          return {
            ...normalized,
            won: normalized.won ?? teamWon,
          };
        });
      })
      .filter((player: any) => player.profileId !== null);
  }

  return [];
}

function extractGames(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.games)) return payload.games;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function isOneVsOneGame(game: any) {
  const players = extractPlayersFromGame(game);
  if (players.length !== 2) return false;

  const teams = Array.isArray(game?.teams) ? game.teams : [];
  if (teams.length > 0) {
    const teamSizes = teams
      .map((team: any) => (Array.isArray(team?.players) ? team.players.length : 0))
      .filter((size: number) => size > 0);

    if (teamSizes.length !== 2) return false;
    if (!teamSizes.every((size: number) => size === 1)) return false;
  }

  const leaderboard = String(game?.leaderboard ?? game?.leaderboard_id ?? "").toLowerCase();
  const kind = String(game?.kind ?? game?.game_type ?? game?.type ?? "").toLowerCase();
  const numPlayers = safeNumber(game?.num_players ?? game?.player_count);

  if (numPlayers !== null && numPlayers !== 2) return false;
  if (leaderboard && !leaderboard.includes("rm_solo")) return false;
  if (kind && (kind.includes("2v2") || kind.includes("3v3") || kind.includes("4v4") || kind.includes("ffa"))) {
    return false;
  }

  return true;
}

function dedupeEdges(edges: MatchEdge[]) {
  const seen = new Set<string>();
  const result: MatchEdge[] = [];

  for (const edge of edges) {
    const key = `${edge.winnerId}-${edge.loserId}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(edge);
    }
  }

  return result;
}

async function fetchJson(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`AoE4World API returned ${response.status}`);
  }
  return response.json();
}

async function resolvePlayer(query: string): Promise<ResolvedPlayer> {
  const trimmed = query.trim();
  const asId = safeNumber(trimmed);

  if (asId !== null) {
    return {
      profileId: asId,
      name: `Player ${asId}`,
    };
  }

  const payload = await fetchJson(`${API_BASE}/players/search?query=${encodeURIComponent(trimmed)}`);
  const candidates = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.players)
      ? payload.players
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

  const normalized = candidates
    .map((candidate: any) => ({
      profileId:
        safeNumber(candidate?.profile_id) ?? safeNumber(candidate?.profileId) ?? safeNumber(candidate?.id),
      name: candidate?.name ?? candidate?.nickname ?? candidate?.alias ?? null,
    }))
    .filter((candidate: any) => candidate.profileId !== null);

  if (!normalized.length) {
    throw new Error("Player not found on AoE4World.");
  }

  const exact = normalized.find((candidate: any) =>
    String(candidate.name ?? "").toLowerCase() === trimmed.toLowerCase()
  );

  const best = exact ?? normalized[0];

  return {
    profileId: best.profileId,
    name: best.name ?? `Player ${best.profileId}`,
  };
}

async function fetchGamesForPlayer(profileId: number) {
  const collectedGames: any[] = [];
  let requests = 0;

  for (let page = 1; page <= MAX_PAGES_PER_PLAYER; page += 1) {
    const url = `${API_BASE}/players/${profileId}/games?leaderboard=rm_solo&limit=${GAMES_PER_PAGE}&page=${page}`;
    const payload = await fetchJson(url);
    requests += 1;

    const games = extractGames(payload);
    if (!games.length) break;

    collectedGames.push(...games);
    if (games.length < GAMES_PER_PAGE) break;
  }

  return {
    games: collectedGames,
    requests,
  };
}

function extractNeighbors(profileId: number, games: any[]) {
  const winnerNeighbors: Array<{ profileId: number; name: string }> = [];
  const loserNeighbors: Array<{ profileId: number; name: string }> = [];

  for (const game of games) {
    if (!isOneVsOneGame(game)) continue;

    const players = extractPlayersFromGame(game);
    const me = players.find((player: any) => player.profileId === profileId);
    const opponent = players.find((player: any) => player.profileId !== profileId);

    if (!me || !opponent || opponent.profileId === null) continue;

    const meLost = me.won === false || (me.won === null && opponent.won === true);
    const meWon = me.won === true || (me.won === null && opponent.won === false);

    if (meLost) {
      winnerNeighbors.push({
        profileId: opponent.profileId,
        name: opponent.name,
      });
    }

    if (meWon) {
      loserNeighbors.push({
        profileId: opponent.profileId,
        name: opponent.name,
      });
    }
  }

  const dedupe = (items: Array<{ profileId: number; name: string }>) => {
    const seen = new Set<number>();
    return items.filter((item) => {
      if (seen.has(item.profileId)) return false;
      seen.add(item.profileId);
      return true;
    });
  };

  return {
    winnersOverMe: dedupe(winnerNeighbors),
    losersToMe: dedupe(loserNeighbors),
  };
}

function buildPath(
  meetingId: number,
  parentFromInput: Map<number, number | null>,
  parentFromTarget: Map<number, number | null>
) {
  const left: number[] = [];
  let current: number | null = meetingId;

  while (current !== null) {
    left.push(current);
    current = parentFromInput.get(current) ?? null;
  }

  left.reverse();

  const right: number[] = [];
  current = parentFromTarget.get(meetingId) ?? null;

  while (current !== null) {
    right.push(current);
    current = parentFromTarget.get(current) ?? null;
  }

  return [...left, ...right];
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-[#140c0d]/80 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-amber-300/70">{label}</div>
          <div className="mt-2 text-2xl font-bold text-[#f5ecdc]">{value}</div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-300">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function TaffuzNumberPage() {
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<SearchResult>({
    loading: false,
    resolving: false,
    error: null,
    resolvedPlayer: null,
    number: null,
    path: null,
    names: {
      [TARGET_ID]: TARGET_NAME,
    },
    visitedFromInput: 0,
    visitedFromTarget: 0,
    totalRequests: 0,
    meetingPlayerId: null,
  });

  const searchSeqRef = useRef(0);

  useEffect(() => {
    const trimmed = search.trim();
    if (!trimmed) {
      setResult({
        loading: false,
        resolving: false,
        error: null,
        resolvedPlayer: null,
        number: null,
        path: null,
        names: {
          [TARGET_ID]: TARGET_NAME,
        },
        visitedFromInput: 0,
        visitedFromTarget: 0,
        totalRequests: 0,
        meetingPlayerId: null,
      });
      return;
    }

    const seq = ++searchSeqRef.current;
    const timeout = window.setTimeout(() => {
      runRobustSearch(trimmed, seq);
    }, AUTO_SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [search, reloadKey]);

  async function runRobustSearch(rawQuery: string, seq: number) {
    setResult({
      loading: true,
      resolving: true,
      error: null,
      resolvedPlayer: null,
      number: null,
      path: null,
      names: {
        [TARGET_ID]: TARGET_NAME,
      },
      visitedFromInput: 0,
      visitedFromTarget: 0,
      totalRequests: 0,
      meetingPlayerId: null,
    });

    try {
      let totalRequests = 0;
      const names: Record<number, string> = {
        [TARGET_ID]: TARGET_NAME,
      };

      const resolved = await resolvePlayer(rawQuery);
      if (seq !== searchSeqRef.current) return;

      names[resolved.profileId] = resolved.name;

      if (resolved.profileId === TARGET_ID) {
        setResult({
          loading: false,
          resolving: false,
          error: null,
          resolvedPlayer: {
            profileId: TARGET_ID,
            name: TARGET_NAME,
          },
          number: 0,
          path: [TARGET_ID],
          names,
          visitedFromInput: 1,
          visitedFromTarget: 1,
          totalRequests,
          meetingPlayerId: TARGET_ID,
        });
        return;
      }

      const visitedFromInput = new Set<number>([resolved.profileId]);
      const visitedFromTarget = new Set<number>([TARGET_ID]);
      const parentFromInput = new Map<number, number | null>([[resolved.profileId, null]]);
      const parentFromTarget = new Map<number, number | null>([[TARGET_ID, null]]);
      let frontierFromInput = [resolved.profileId];
      let frontierFromTarget = [TARGET_ID];
      let meetingId: number | null = null;

      async function expandOneLayer(side: "input" | "target") {
        const isInputSide = side === "input";
        const frontier = isInputSide ? frontierFromInput : frontierFromTarget;
        const nextFrontier: number[] = [];
        const ownVisited = isInputSide ? visitedFromInput : visitedFromTarget;
        const otherVisited = isInputSide ? visitedFromTarget : visitedFromInput;
        const ownParents = isInputSide ? parentFromInput : parentFromTarget;

        for (const profileId of frontier) {
          if (totalRequests >= MAX_TOTAL_REQUESTS) {
            throw new Error("Request limit reached before finding a connection. Try again later or increase limits server-side.");
          }

          const { games, requests } = await fetchGamesForPlayer(profileId);
          totalRequests += requests;

          const neighbors = extractNeighbors(profileId, games);
         const nextNodes = isInputSide ? neighbors.losersToMe : neighbors.winnersOverMe;

          for (const neighbor of nextNodes) {
            names[neighbor.profileId] = neighbor.name;

            if (!ownVisited.has(neighbor.profileId)) {
              ownVisited.add(neighbor.profileId);
              ownParents.set(neighbor.profileId, profileId);
              nextFrontier.push(neighbor.profileId);
            }

            if (otherVisited.has(neighbor.profileId)) {
              meetingId = neighbor.profileId;
              break;
            }
          }

          if (seq !== searchSeqRef.current) return;
          if (meetingId !== null) break;
        }

        if (isInputSide) {
          frontierFromInput = nextFrontier;
        } else {
          frontierFromTarget = nextFrontier;
        }
      }

      while (frontierFromInput.length > 0 && frontierFromTarget.length > 0 && meetingId === null) {
        if (seq !== searchSeqRef.current) return;

        if (visitedFromInput.size > MAX_VISITED_PER_SIDE || visitedFromTarget.size > MAX_VISITED_PER_SIDE) {
          throw new Error("Visited-player limit reached before finding a connection. A server-side cache is recommended for deeper searches.");
        }

        if (frontierFromInput.length <= frontierFromTarget.length) {
          await expandOneLayer("input");
        } else {
          await expandOneLayer("target");
        }

        setResult((previous) => ({
          ...previous,
          loading: true,
          resolving: false,
          resolvedPlayer: resolved,
          names: { ...names },
          visitedFromInput: visitedFromInput.size,
          visitedFromTarget: visitedFromTarget.size,
          totalRequests,
        }));
      }

      if (seq !== searchSeqRef.current) return;

      if (meetingId === null) {
        setResult({
          loading: false,
          resolving: false,
          error: "No connection found within current browser limits.",
          resolvedPlayer: resolved,
          number: null,
          path: null,
          names: { ...names },
          visitedFromInput: visitedFromInput.size,
          visitedFromTarget: visitedFromTarget.size,
          totalRequests,
          meetingPlayerId: null,
        });
        return;
      }

      const path = buildPath(meetingId, parentFromInput, parentFromTarget);

      setResult({
        loading: false,
        resolving: false,
        error: null,
        resolvedPlayer: resolved,
        number: Math.max(path.length - 1, 0),
        path,
        names: { ...names },
        visitedFromInput: visitedFromInput.size,
        visitedFromTarget: visitedFromTarget.size,
        totalRequests,
        meetingPlayerId: meetingId,
      });
    } catch (error) {
      if (seq !== searchSeqRef.current) return;

      setResult((previous) => ({
        ...previous,
        loading: false,
        resolving: false,
        error: error instanceof Error ? error.message : "Unknown error while loading AoE4World data.",
      }));
    }
  }

  const resultPathNames = useMemo(() => {
    return (result.path ?? []).map((stepId) => ({
      id: stepId,
      name: result.names[stepId] ?? `Player ${stepId}`,
    }));
  }, [result.names, result.path]);

  const targetCardValue = result.number === null ? "â€”" : result.number;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0708] via-[#140c0d] to-[#070304] text-[#f5ecdc]">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[28px] border border-amber-500/20 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.12),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.96))] shadow-2xl">
          <div className="border-b border-amber-500/15 px-6 py-8 md:px-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-amber-300/85">
                  <Crown className="h-3.5 w-3.5" />
                  AoE4 Win Chain Â· Robust Search
                </div>
                <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                  {TARGET_SLUG} Number
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-[#d8cbb7] md:text-base">
                  Inserisci un giocatore e la pagina calcola il suo <strong className="text-amber-300">taffuz number</strong>
                  usando solo partite ranked 1v1 e una ricerca bidirezionale mirata verso <strong className="text-amber-300">{TARGET_NAME}</strong>.
                </p>
              </div>

              <div className="grid w-full max-w-xl grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-amber-300/70">
                    Player input
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#bcae9a]" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Inserisci nome player o profile id"
                      className="w-full rounded-2xl border border-amber-500/20 bg-[#0b0708]/70 py-3 pl-10 pr-4 text-sm text-[#f5ecdc] outline-none transition placeholder:text-[#8f7e69] focus:border-amber-400/50"
                    />
                  </div>
                </div>

                <div className="flex items-end gap-3">
                  <button
                    onClick={() => setReloadKey((value) => value + 1)}
                    className="inline-flex h-[46px] items-center gap-2 rounded-2xl border border-amber-400/15 bg-amber-500/10 px-4 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/15"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </button>

                  <a
                    href={TARGET_PROFILE_URL}
                    target="_blank"
                    rel="noreferrer"
className="inline-flex h-[46px] items-center gap-2 rounded-2xl border border-[#5a3a31] bg-[#0b0708]/70 px-4 text-sm font-semibold text-[#e8dcc8] transition hover:border-[#8c5a4c]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    AoE4World
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-4 md:px-8">
            <StatCard icon={<Trophy className="h-5 w-5" />} label="Taffuz Number" value={targetCardValue} />
            <StatCard icon={<Users className="h-5 w-5" />} label="Visited From Input" value={result.visitedFromInput} />
            <StatCard icon={<ShieldAlert className="h-5 w-5" />} label="Visited From Taffuz" value={result.visitedFromTarget} />
            <StatCard icon={<Network className="h-5 w-5" />} label="API Requests" value={result.totalRequests} />
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.85fr]">
          <section className="rounded-[28px] border border-amber-500/20 bg-[#140c0d]/80 p-5 shadow-xl md:p-6">
            <h2 className="text-xl font-bold text-white">Taffuz Number Checker</h2>
            <p className="mt-1 text-sm text-[#bcae9a]">
              La ricerca parte dal player inserito e da Taffuz contemporaneamente, poi si incontra nel mezzo.
            </p>

            <div className="mt-5 rounded-2xl border border-amber-500/15 bg-[#0b0708]/50 p-5">
              {!search.trim() ? (
                <div className="text-sm text-[#bcae9a]">Scrivi un nome o un profile id per cercare un giocatore.</div>
              ) : result.resolving ? (
                <div className="flex items-center gap-3 text-sm text-[#d8cbb7]">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
                  Sto risolvendo il giocatore su AoE4Worldâ€¦
                </div>
              ) : result.loading && !result.resolvedPlayer ? (
                <div className="flex items-center gap-3 text-sm text-[#d8cbb7]">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
                  Sto caricando i match reali da AoE4Worldâ€¦
                </div>
              ) : result.error ? (
                <div className="space-y-2 text-sm text-rose-300">
                  <div>{result.error}</div>
                  {result.resolvedPlayer && (
                    <div className="text-[#bcae9a]">
                      Ultimo player risolto: {result.resolvedPlayer.name} (ID {result.resolvedPlayer.profileId})
                    </div>
                  )}
                </div>
              ) : result.resolvedPlayer ? (
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.16em] text-amber-300/70">Matched player</div>
                      <div className="mt-2 text-2xl font-bold text-white">{result.resolvedPlayer.name}</div>
                      <div className="mt-1 text-sm text-[#bcae9a]">ID {result.resolvedPlayer.profileId}</div>
                    </div>
                    <div className="inline-flex min-w-[72px] items-center justify-center rounded-2xl border border-amber-400/15 bg-amber-500/10 px-4 py-3 text-3xl font-black text-amber-300">
                      {result.number ?? "â€”"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#3a2621] bg-[#140c0d]/80 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-[#bcae9a]">Tier</div>
                    <div className="mt-2 inline-flex rounded-full border border-[#5a3a31] bg-[#241618] px-3 py-1 text-xs font-medium text-[#d8cbb7]">
                      {getDistanceLabel(result.number ?? 99)}
                    </div>
                  </div>

                  {result.path ? (
                    <div>
                      <div className="mb-3 text-xs uppercase tracking-[0.16em] text-[#bcae9a]">Shortest path to Taffuz</div>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        {resultPathNames.map((step, index) => (
                          <React.Fragment key={`${step.id}-${index}`}>
                            <span
                              className={`${index === resultPathNames.length - 1 ? "border-amber-400/20 bg-amber-500/10 text-amber-300" : "border-[#5a3a31] bg-[#241618] text-[#e8dcc8]"} rounded-xl border px-3 py-2`}
                            >
                              {step.name}
                            </span>
                            {index < resultPathNames.length - 1 && <span className="text-[#8f7e69]">â†’</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-[#bcae9a]">Nessun path trovato entro i limiti attuali.</div>
                  )}
                </div>
              ) : null}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[28px] border border-amber-500/20 bg-[#140c0d]/80 p-5 shadow-xl md:p-6">
              <h3 className="text-lg font-bold text-white">How it works</h3>
              <div className="mt-4 space-y-3 text-sm leading-6 text-[#d8cbb7]">
                <p>
                  <strong className="text-amber-300">{TARGET_NAME}</strong> parte da <strong className="text-amber-300">0</strong>.
                </p>
                <p>
                  Il player inserito cerca chi lo ha battuto. Dal lato Taffuz si cercano i player che Taffuz ha battuto.
                </p>
                <p>
                  Quando i due fronti si incontrano, hai trovato il path minimo nella rete di match 1v1 ranked.
                </p>
                <p>
                  Questo approccio Ã¨ piÃ¹ robusto del vecchio crawl singolo perchÃ© cerca la connessione direttamente per il player richiesto.
                </p>
              </div>
            </section>

            <section className="rounded-[28px] border border-amber-500/20 bg-[#140c0d]/80 p-5 shadow-xl md:p-6">
              <h3 className="text-lg font-bold text-white">Search limits</h3>
              <div className="mt-4 space-y-3 text-sm leading-6 text-[#d8cbb7]">
                <p>
                  Max visited per side: <strong className="text-amber-300">{MAX_VISITED_PER_SIDE}</strong>
                </p>
                <p>
                  Max pages per player: <strong className="text-amber-300">{MAX_PAGES_PER_PLAYER}</strong>
                </p>
                <p>
                  Max total requests: <strong className="text-amber-300">{MAX_TOTAL_REQUESTS}</strong>
                </p>
                <p>
                  Meeting point: <strong className="text-amber-300">{result.meetingPlayerId ? (result.names[result.meetingPlayerId] ?? `Player ${result.meetingPlayerId}`) : "â€”"}</strong>
                </p>
                {result.loading && (
                  <div className="flex items-center gap-2 text-amber-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Search in corso
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

