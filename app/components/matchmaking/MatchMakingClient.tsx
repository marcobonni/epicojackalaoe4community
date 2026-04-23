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

const DEFAULT_PLAYERS = `ScapoloCaldo
Paranoia
ZeneizeTV
Tia`;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:8080";

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
      ? "ELO solo Â· numero giocatori non valido"
      : "ELO team Â· servono 2, 4, 6 oppure 8 giocatori";
  }

  if (ratingMode === "solo") {
    return "ELO solo Â· rating 1v1";
  }

  return `ELO team Â· rating ${mode}`;
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
      className="inline-flex items-center gap-2 rounded-2xl border border-[#4b312a] bg-[#0b0708]/70 px-4 py-2 text-sm font-semibold text-[#e8dcc8] transition hover:-translate-y-0.5 hover:border-[#7a5b4d]"
    >
      â† Torna alla home
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
          : "Non riusciamo a contattare il servizio matchmaking in questo momento."
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

        <p className="mt-4 text-base leading-8 text-[#bcae9a]">
          Scrivi un giocatore per riga. Il sistema cerca ogni nome su AoE4World,
          recupera il rating corretto e propone due team il piÃ¹ possibile
          equilibrati.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d]/90 p-8 shadow-lg shadow-black/20">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
            Preferenze
          </p>

          <div className="mt-6">
            <label className="mb-3 block text-sm font-semibold text-[#e8dcc8]">
              Tipo di rating
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRatingMode("solo")}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  ratingMode === "solo"
                    ? "border-amber-400 bg-amber-400/10 text-amber-300"
                    : "border-[#4b312a] bg-[#0b0708] text-[#e8dcc8] hover:border-[#7a5b4d]"
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
                    : "border-[#4b312a] bg-[#0b0708] text-[#e8dcc8] hover:border-[#7a5b4d]"
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
            <label className="mb-3 block text-sm font-semibold text-[#e8dcc8]">
              Nomi Steam
            </label>

            <textarea
              value={rawNames}
              onChange={(e) => setRawNames(e.target.value)}
              className="min-h-[360px] w-full rounded-[1.5rem] border border-[#4b312a] bg-[#0b0708] px-5 py-5 text-white outline-none transition focus:border-amber-400"
              placeholder={`Un giocatore per riga
ScapoloCaldo
Paranoia
ZeneizeTV
Tia`}
            />

            <p className="mt-4 text-xs leading-6 text-[#8f7e69]">
              {ratingMode === "team"
                ? "In modalitÃ  ELO team sono validi solo 2, 4, 6 oppure 8 giocatori."
                : "In modalitÃ  ELO solo viene sempre usato il rating 1v1, purchÃ© i giocatori siano in numero pari."}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleBalance}
              disabled={loading || !canSubmit}
className="rounded-2xl bg-amber-400 px-6 py-3 text-sm font-semibold text-[#1a0d0c] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
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
              className="rounded-2xl border border-[#4b312a] bg-[#0b0708] px-6 py-3 text-sm font-semibold text-[#f5ecdc] transition hover:border-[#7a5b4d]"
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
          <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d]/90 p-8 shadow-lg shadow-black/20">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
                  Riepilogo
                </p>
                <h2 className="mt-3 text-2xl font-bold text-white">
                  Stato del bilanciamento
                </h2>
              </div>

              <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 px-4 py-3 text-sm text-[#d8cbb7]">
                {result ? getBalanceVerdict(result.diff) : "In attesa di input"}
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <SummaryBigCard label="ModalitÃ " value={effectiveMode ?? "â€”"} />
              <SummaryBigCard
                label="Differenza"
                value={result ? `${result.diff} ELO` : "â€”"}
              />
              <SummaryBigCard
                label="Media Team A"
                value={result ? String(result.averageA) : "â€”"}
              />
              <SummaryBigCard
                label="Media Team B"
                value={result ? String(result.averageB) : "â€”"}
              />
            </div>

            {result ? (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <SummaryBigCard
                    label="ProbabilitÃ  Team A"
                    value={`${result.teamAWinProbability}%`}
                  />
                  <SummaryBigCard
                    label="ProbabilitÃ  Team B"
                    value={`${result.teamBWinProbability}%`}
                  />
                </div>

                <WinProbabilityBar
                  teamAProbability={result.teamAWinProbability}
                  teamBProbability={result.teamBWinProbability}
                />
              </>
            ) : null}
          </div>

          <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d]/90 p-8 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
                  Giocatori trovati
                </p>
                <h3 className="mt-2 text-xl font-bold text-white">
                  Pool ordinato per rating
                </h3>
              </div>

              <div className="rounded-xl border border-[#3a2621] bg-[#0b0708]/80 px-3 py-2 text-xs text-[#bcae9a]">
                {sortedPlayers.length} risultati
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#3a2621]">
              {sortedPlayers.length > 0 ? (
<div className="divide-y divide-[#3a2621] bg-[#0b0708]/70">
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
                        <div className="mt-1 text-xs text-[#8f7e69]">
                          input: {player.input} Â· ID {player.profileId}
                          {player.country
                            ? ` Â· ${player.country.toUpperCase()}`
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
                <div className="bg-[#0b0708]/70 p-5 text-sm text-[#bcae9a]">
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
              winProbability={result.teamAWinProbability}
              accent="amber"
            />

            <TeamCard
              title="Team B"
              players={result.teamB}
              average={result.averageB}
              total={result.totalB}
              winProbability={result.teamBWinProbability}
              accent="crimson"
            />
          </div>

<div className="mt-8 rounded-[2rem] border border-[#d9b265]/20 bg-[#d9b265]/[0.05] p-6">
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#f0d7a0]">
        Bilanciamento finale
      </p>

      <h3 className="mt-2 text-3xl font-bold text-white">
        {getBalanceVerdict(result.diff)}
      </h3>

      <p className="mt-2 text-sm text-[#d8cbb7]">
        Differenza totale: {result.diff} ELO
      </p>
    </div>

    <div className="rounded-2xl border border-[#d9b265]/20 bg-[#0b0708]/40 px-4 py-3 text-sm text-[#e8dcc8]">
      Team A {result.totalA} Â· Team B {result.totalB}
    </div>
  </div>

  {/* ðŸ”¥ NUOVA BARRA */}
  <div className="mt-6">
    <WinProbabilityBar
      teamAProbability={result.teamAWinProbability}
      teamBProbability={result.teamBWinProbability}
    />
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
    <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/70 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-[#8f7e69]">
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
    <div className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-5">
      <div className="text-xs uppercase tracking-[0.2em] text-[#8f7e69]">
        {label}
      </div>
      <div className="mt-3 text-3xl font-bold text-amber-300">{value}</div>
    </div>
  );
}

function WinProbabilityBar({
  teamAProbability,
  teamBProbability,
}: {
  teamAProbability: number;
  teamBProbability: number;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-5">
      <div className="flex items-center justify-between gap-4 text-sm font-semibold">
        <div className="text-amber-300">Team A {teamAProbability}%</div>
        <div className="text-[#f2c7bd]">Team B {teamBProbability}%</div>
      </div>

      <div className="mt-4 h-4 overflow-hidden rounded-full bg-[#241618]">
        <div className="flex h-full w-full">
          <div
            className="h-full bg-amber-400/90 transition-all duration-500"
            style={{ width: `${teamAProbability}%` }}
          />
          <div
            className="h-full bg-[#7f1517]/90 transition-all duration-500"
            style={{ width: `${teamBProbability}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function TeamCard({
  title,
  players,
  average,
  total,
  winProbability,
  accent,
}: {
  title: string;
  players: MatchmakingPlayer[];
  average: number;
  total: number;
  winProbability: number;
  accent: "amber" | "crimson";
}) {
  const badgeClasses =
    accent === "amber"
      ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
      : "border-[#aa221d]/20 bg-[#7f1517]/10 text-[#f2c7bd]";

  return (
    <div className="rounded-[2rem] border border-[#3a2621] bg-[#140c0d]/90 p-8 shadow-lg shadow-black/20">
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

      <div className="mt-4 rounded-2xl border border-[#3a2621] bg-[#0b0708]/70 p-4">
        <div className="text-xs uppercase tracking-[0.2em] text-[#8f7e69]">
          ProbabilitÃ  di vittoria
        </div>
        <div className="mt-2 text-2xl font-bold text-white">{winProbability}%</div>
      </div>

      <div className="mt-6 space-y-3">
        {players.map((player) => (
          <div
            key={player.profileId}
            className="rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 px-5 py-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="truncate text-xl font-semibold text-white">
                  {player.name}
                </div>
                <div className="mt-1 text-sm text-[#8f7e69]">
                  ID {player.profileId}
                  {player.country ? ` Â· ${player.country.toUpperCase()}` : ""}
                </div>
              </div>

              <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm font-semibold text-amber-300">
                {player.elo}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-[#3a2621] bg-[#0b0708]/80 p-5">
        <div className="text-sm text-[#bcae9a]">Totale team</div>
        <div className="mt-2 text-4xl font-bold text-white">{total}</div>
      </div>
    </div>
  );
}

