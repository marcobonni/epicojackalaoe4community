"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  MatchmakingErrorResponse,
  MatchmakingMode,
  MatchmakingPlayer,
  MatchmakingResult,
} from "@/app/lib/matchmaking";
import { parseNamesFromTextarea } from "@/app/lib/matchmaking";

const DEFAULT_PLAYERS = `EpicoJackal
Jeiden97
Massimi25
Tia`;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BEASTY_API_URL || "http://localhost:8080";

type RatingMode = "solo" | "team";

function isMatchmakingErrorResponse(
  data: MatchmakingResult | MatchmakingErrorResponse
): data is MatchmakingErrorResponse {
  return "error" in data;
}

function inferTeamModeFromCount(count: number): MatchmakingMode | null {
  if (count === 2) return "1v1";
  if (count === 4) return "2v2";
  if (count === 6) return "3v3";
  if (count === 8) return "4v4";
  return null;
}

function getEffectiveMode(
  ratingMode: RatingMode,
  playerCount: number
): MatchmakingMode | null {
  if (ratingMode === "solo") {
    return playerCount >= 2 && playerCount % 2 === 0 ? "1v1" : null;
  }

  return inferTeamModeFromCount(playerCount);
}

function getEffectiveModeLabel(
  ratingMode: RatingMode,
  playerCount: number
): string {
  const mode = getEffectiveMode(ratingMode, playerCount);

  if (!mode) {
    return ratingMode === "solo"
      ? "ELO solo · numero giocatori non valido"
      : "ELO team · servono 2, 4, 6 oppure 8 giocatori";
  }

  if (ratingMode === "solo") {
    return "ELO solo · rating 1v1";
  }

  return `ELO team · rating ${mode}`;
}

function getBalanceVerdict(diff: number) {
  if (diff <= 20) return "Perfetto";
  if (diff <= 50) return "Ottimo";
  if (diff <= 100) return "Buono";
  if (diff <= 180) return "Accettabile";
  return "Debole";
}

function HomeButton() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-slate-500"
    >
      ← Torna alla home
    </Link>
  );
}

export default function MatchmakingClient() {
  const [ratingMode, setRatingMode] = useState<RatingMode>("team");
  const [rawNames, setRawNames] = useState(DEFAULT_PLAYERS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchmakingResult | null>(null);
  const [error, setError] = useState("");
  const [unresolved, setUnresolved] = useState<
    Array<{ input: string; reason: string }>
  >([]);
  const [resolvedFallback, setResolvedFallback] = useState<MatchmakingPlayer[]>(
    []
  );

  const parsedNames = useMemo(() => parseNamesFromTextarea(rawNames), [rawNames]);

  const effectiveMode = useMemo(
    () => getEffectiveMode(ratingMode, parsedNames.length),
    [ratingMode, parsedNames.length]
  );

  const canSubmit =
    !!effectiveMode &&
    parsedNames.length >= 2 &&
    parsedNames.length % 2 === 0 &&
    (ratingMode === "solo" || [2, 4, 6, 8].includes(parsedNames.length));

  const visiblePlayers = result?.players?.length
    ? result.players
    : resolvedFallback;

  const sortedPlayers = useMemo(
    () => [...visiblePlayers].sort((a, b) => b.elo - a.elo),
    [visiblePlayers]
  );

  async function handleBalance() {
    if (!effectiveMode) {
      setError(
        ratingMode === "solo"
          ? "Con ELO solo servono almeno 2 giocatori e un numero pari."
          : "Con ELO team servono 2, 4, 6 oppure 8 giocatori."
      );
      return;
    }

    setLoading(true);
    setError("");
    setUnresolved([]);
    setResolvedFallback([]);
    setResult(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/matchmaking/balance-from-names`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: effectiveMode,
            names: parsedNames,
          }),
        }
      );

      const data: MatchmakingResult | MatchmakingErrorResponse =
        await response.json();

      if (!response.ok) {
        if (isMatchmakingErrorResponse(data)) {
          setError(data.error || "Errore nel matchmaking.");
          setUnresolved(data.unresolved || []);
          setResolvedFallback(data.resolvedPlayers || []);
        } else {
          setError("Errore nel matchmaking.");
        }
        return;
      }

      if (isMatchmakingErrorResponse(data)) {
        setError(data.error || "Errore nel matchmaking.");
        setUnresolved(data.unresolved || []);
        setResolvedFallback(data.resolvedPlayers || []);
        return;
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Errore di connessione verso il backend."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="mb-6">
        <HomeButton />
      </div>

      <div className="mb-10 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
          Matchmaking
        </p>

        <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
          Inserisci i nomi Steam e genera squadre bilanciate
        </h1>

        <p className="mt-4 text-base leading-8 text-slate-400">
          Scrivi un giocatore per riga. Il sistema cerca ogni nome su AoE4World,
          recupera il rating corretto e propone due team il più possibile
          equilibrati.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-lg shadow-black/20">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
            Configurazione
          </p>

          <div className="mt-6">
            <label className="mb-3 block text-sm font-semibold text-slate-200">
              Tipo di rating
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRatingMode("solo")}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  ratingMode === "solo"
                    ? "border-amber-400 bg-amber-400/10 text-amber-300"
                    : "border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500"
                }`}
              >
                ELO solo
              </button>

              <button
                type="button"
                onClick={() => setRatingMode("team")}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  ratingMode === "team"
                    ? "border-amber-400 bg-amber-400/10 text-amber-300"
                    : "border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500"
                }`}
              >
                ELO team
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <SummaryMiniCard
              label="Rating usato"
              value={getEffectiveModeLabel(ratingMode, parsedNames.length)}
            />
            <SummaryMiniCard
              label="Giocatori letti"
              value={String(parsedNames.length)}
            />
          </div>

          <div className="mt-6">
            <label className="mb-3 block text-sm font-semibold text-slate-200">
              Nomi Steam
            </label>

            <textarea
              value={rawNames}
              onChange={(e) => setRawNames(e.target.value)}
              className="min-h-[360px] w-full rounded-[1.5rem] border border-slate-700 bg-slate-950 px-5 py-5 text-white outline-none transition focus:border-amber-400"
              placeholder={`Un giocatore per riga
ScapoloCaldo
Paranoia
ZeneizeTV
Tia`}
            />

            <p className="mt-4 text-xs leading-6 text-slate-500">
              {ratingMode === "team"
                ? "In modalità ELO team sono validi solo 2, 4, 6 oppure 8 giocatori."
                : "In modalità ELO solo viene sempre usato il rating 1v1, purché i giocatori siano in numero pari."}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleBalance}
              disabled={loading || !canSubmit}
              className="rounded-2xl bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Bilanciamento in corso..." : "Bilancia squadre"}
            </button>

            <button
              type="button"
              onClick={() => {
                setResult(null);
                setError("");
                setUnresolved([]);
                setResolvedFallback([]);
              }}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
            >
              Pulisci risultato
            </button>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">
              <div className="font-semibold">{error}</div>

              {unresolved.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {unresolved.map((item) => (
                    <div key={`${item.input}-${item.reason}`}>
                      <span className="font-semibold">{item.input}</span>:{" "}
                      {item.reason}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-8">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-lg shadow-black/20">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
                  Riepilogo
                </p>
                <h2 className="mt-3 text-2xl font-bold text-white">
                  Stato del bilanciamento
                </h2>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
                {result ? getBalanceVerdict(result.diff) : "In attesa di input"}
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <SummaryBigCard label="Modalità" value={effectiveMode ?? "—"} />
              <SummaryBigCard
                label="Differenza"
                value={result ? `${result.diff} ELO` : "—"}
              />
              <SummaryBigCard
                label="Media Team A"
                value={result ? String(result.averageA) : "—"}
              />
              <SummaryBigCard
                label="Media Team B"
                value={result ? String(result.averageB) : "—"}
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
                  Giocatori trovati
                </p>
                <h3 className="mt-2 text-xl font-bold text-white">
                  Pool ordinato per rating
                </h3>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-400">
                {sortedPlayers.length} risultati
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-800">
              {sortedPlayers.length > 0 ? (
                <div className="divide-y divide-slate-800 bg-slate-950/70">
                  {sortedPlayers.map((player, index) => (
                    <div
                      key={`${player.profileId}-${player.input}-${index}`}
                      className="grid gap-3 px-5 py-4 sm:grid-cols-[56px_minmax(0,1fr)_110px]"
                    >
                      <div className="text-sm font-semibold text-amber-300">
                        #{index + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="truncate font-semibold text-white">
                          {player.name}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          input: {player.input} · ID {player.profileId}
                          {player.country
                            ? ` · ${player.country.toUpperCase()}`
                            : ""}
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="inline-flex rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm font-semibold text-amber-300">
                          {player.elo}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-950/70 p-5 text-sm text-slate-400">
                  Nessun risultato da mostrare.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {result ? (
        <>
          <div className="mt-8 grid gap-8 xl:grid-cols-2">
            <TeamCard
              title="Team A"
              players={result.teamA}
              average={result.averageA}
              total={result.totalA}
              accent="amber"
            />

            <TeamCard
              title="Team B"
              players={result.teamB}
              average={result.averageB}
              total={result.totalB}
              accent="blue"
            />
          </div>

          <div className="mt-8 rounded-[2rem] border border-emerald-400/20 bg-emerald-400/5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
                  Bilanciamento finale
                </p>

                <h3 className="mt-2 text-3xl font-bold text-white">
                  {getBalanceVerdict(result.diff)}
                </h3>

                <p className="mt-2 text-sm text-slate-300">
                  Differenza totale: {result.diff} ELO
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-400/20 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                Team A {result.totalA} · Team B {result.totalB}
              </div>
            </div>
          </div>
        </>
      ) : null}

      <div className="mt-12 flex justify-center">
        <HomeButton />
      </div>
    </section>
  );
}

function SummaryMiniCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-base font-semibold text-white">{value}</div>
    </div>
  );
}

function SummaryBigCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
        {label}
      </div>
      <div className="mt-3 text-3xl font-bold text-amber-300">{value}</div>
    </div>
  );
}

function TeamCard({
  title,
  players,
  average,
  total,
  accent,
}: {
  title: string;
  players: MatchmakingPlayer[];
  average: number;
  total: number;
  accent: "amber" | "blue";
}) {
  const badgeClasses =
    accent === "amber"
      ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
      : "border-blue-400/20 bg-blue-400/10 text-blue-300";

  return (
    <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
            Squadra
          </p>
          <h2 className="mt-2 text-4xl font-bold text-white">{title}</h2>
        </div>

        <div className={`rounded-2xl border px-4 py-3 text-right ${badgeClasses}`}>
          <div className="text-xs uppercase tracking-[0.2em]">Media</div>
          <div className="mt-1 text-2xl font-bold">{average}</div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {players.map((player) => (
          <div
            key={player.profileId}
            className="rounded-2xl border border-slate-800 bg-slate-950/80 px-5 py-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="truncate text-xl font-semibold text-white">
                  {player.name}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  ID {player.profileId}
                  {player.country ? ` · ${player.country.toUpperCase()}` : ""}
                </div>
              </div>

              <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm font-semibold text-amber-300">
                {player.elo}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
        <div className="text-sm text-slate-400">Totale team</div>
        <div className="mt-2 text-4xl font-bold text-white">{total}</div>
      </div>
    </div>
  );
}