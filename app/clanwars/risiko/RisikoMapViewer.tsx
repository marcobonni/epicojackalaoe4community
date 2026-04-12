"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import type { PortalSession } from "@/app/lib/session";
import { cancelAttackAction, proclaimAttackAction, resolveAttackAction } from "./actions";
import {
  type ClanWarAttack,
  HEX_SIZE,
  capitals as defaultCapitals,
  clans as defaultClans,
  isolatedTerritories as defaultIsolatedTerritories,
  outlinePaths,
  territories as defaultTerritories,
  hexPath,
  type Clan,
  type ClanId,
  type Territory,
} from "./mapData";

const MIN_SCALE = 0.55;
const BASE_SCALE = 2.21;
const MAX_SCALE = 5.6;
const INITIAL_SCALE = BASE_SCALE;
const INITIAL_OFFSET = { x: -870, y: -690 };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getDistance(a: PointerEvent | React.PointerEvent, b: PointerEvent | React.PointerEvent) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function curvedAttackPath(from: Territory, to: Territory) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy) || 1;
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const normalX = -dy / distance;
  const normalY = dx / distance;
  const curve = Math.min(22, distance * 0.18);

  return `M ${from.x} ${from.y} Q ${midX + normalX * curve} ${midY + normalY * curve} ${to.x} ${to.y}`;
}

function attackArrowHead(from: Territory, to: Territory) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy) || 1;
  const ux = dx / distance;
  const uy = dy / distance;
  const baseX = to.x - ux * 16;
  const baseY = to.y - uy * 16;
  const nx = -uy;
  const ny = ux;

  return `${to.x},${to.y} ${baseX + nx * 7},${baseY + ny * 7} ${baseX - nx * 7},${baseY - ny * 7}`;
}

type RisikoMapViewerProps = {
  clans?: Record<ClanId, Clan>;
  territories?: Territory[];
  capitals?: Territory[];
  isolatedTerritories?: Territory[];
  attacks?: ClanWarAttack[];
  session?: PortalSession | null;
};

function formatCountdown(expiresAt: string, now: number) {
  const remainingMs = new Date(expiresAt).getTime() - now;

  if (remainingMs <= 0) {
    return "Scaduto";
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
}

export function RisikoMapViewer({
  clans = defaultClans,
  territories = defaultTerritories,
  capitals = defaultCapitals,
  isolatedTerritories = defaultIsolatedTerritories,
  attacks = [],
  session = null,
}: RisikoMapViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const panOriginRef = useRef<{ x: number; y: number } | null>(null);
  const pinchOriginRef = useRef<{ distance: number; scale: number } | null>(null);
  const [scale, setScale] = useState(INITIAL_SCALE);
  const [offset, setOffset] = useState(INITIAL_OFFSET);
  const [hovered, setHovered] = useState<Territory | null>(null);
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const visibleTerritories = hovered
    ? [
        ...territories.filter((territory) => territory.id !== hovered.id),
        hovered,
      ]
    : territories;
  const scoreboard = Object.values(clans)
    .map((clan) => {
      const ownedTerritories = territories.filter((territory) => territory.owner === clan.id);
      const territoryCount = ownedTerritories.length;
      const totalPoints = ownedTerritories.reduce((sum, territory) => sum + territory.points, 0);
      const capitalCount = ownedTerritories.filter((territory) => territory.capital).length;

      return {
        ...clan,
        territoryCount,
        totalPoints,
        capitalCount,
      };
    })
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return b.territoryCount - a.territoryCount;
    });
  const territoryById = new Map(territories.map((territory) => [territory.id, territory]));
  const selectedTerritory = selectedTerritoryId ? territoryById.get(selectedTerritoryId) ?? null : null;
  const canProclaimAttack =
    session?.user.roles.includes("capoclan") === true && Boolean(session.user.clanId);
  const isAdmin = session?.user.roles.includes("admin") === true;
  const validAttackTargets = useMemo(() => {
    if (!selectedTerritory || !canProclaimAttack || selectedTerritory.owner !== session?.user.clanId) {
      return [];
    }

    return selectedTerritory.neighbors
      .map((neighborId) => territoryById.get(neighborId))
      .filter((territory): territory is Territory => Boolean(territory))
      .filter((territory) => territory.owner !== selectedTerritory.owner);
  }, [canProclaimAttack, selectedTerritory, session?.user.clanId, territoryById]);
  const activeAttackTerritoryIds = new Set(
    attacks.flatMap((attack) => [attack.fromTerritoryId, attack.targetTerritoryId])
  );
  const attackRoutes = attacks
    .map((attack) => {
      const from = territoryById.get(attack.fromTerritoryId);
      const to = territoryById.get(attack.targetTerritoryId);

      if (!from || !to) return null;

      return {
        ...attack,
        key: attack.id,
        from,
        to,
        color: clans[attack.attackerFactionId].solidColor,
        glow: clans[attack.attackerFactionId].glow,
        d: curvedAttackPath(from, to),
        countdown: formatCountdown(attack.expiresAt, now),
      };
    })
    .filter(
      (
        route
      ): route is ClanWarAttack & {
        key: string;
        from: Territory;
        to: Territory;
        color: string;
        glow: string;
        d: string;
        countdown: string;
      } => Boolean(route)
    );

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      const activeNode = containerRef.current;
      if (!activeNode) return;

      const rect = activeNode.getBoundingClientRect();
      const cursorX = event.clientX - rect.left;
      const cursorY = event.clientY - rect.top;
      const zoomFactor = event.deltaY > 0 ? 0.92 : 1.08;

      setScale((currentScale) => {
        const nextScale = clamp(currentScale * zoomFactor, MIN_SCALE, MAX_SCALE);
        const ratio = nextScale / currentScale;

        setOffset((currentOffset) => ({
          x: cursorX - (cursorX - currentOffset.x) * ratio,
          y: cursorY - (cursorY - currentOffset.y) * ratio,
        }));

        return nextScale;
      });
    }

    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => node.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  function resetView() {
    setScale(INITIAL_SCALE);
    setOffset(INITIAL_OFFSET);
  }

  function zoomBy(factor: number) {
    setScale((currentScale) => clamp(currentScale * factor, MIN_SCALE, MAX_SCALE));
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const node = containerRef.current;
    if (!node) return;

    node.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size === 1) {
      panOriginRef.current = {
        x: event.clientX - offset.x,
        y: event.clientY - offset.y,
      };
    }

    if (pointersRef.current.size === 2) {
      const [first, second] = Array.from(pointersRef.current.values());
      pinchOriginRef.current = {
        distance: getDistance(
          { clientX: first.x, clientY: first.y } as PointerEvent,
          { clientX: second.x, clientY: second.y } as PointerEvent
        ),
        scale,
      };
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) return;

    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size === 1 && panOriginRef.current) {
      setOffset({
        x: event.clientX - panOriginRef.current.x,
        y: event.clientY - panOriginRef.current.y,
      });
    }

    if (pointersRef.current.size === 2 && pinchOriginRef.current) {
      const [first, second] = Array.from(pointersRef.current.values());
      const nextDistance = getDistance(
        { clientX: first.x, clientY: first.y } as PointerEvent,
        { clientX: second.x, clientY: second.y } as PointerEvent
      );
      const nextScale = clamp(
        pinchOriginRef.current.scale * (nextDistance / pinchOriginRef.current.distance),
        MIN_SCALE,
        MAX_SCALE
      );
      setScale(nextScale);
    }
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId);

    if (pointersRef.current.size < 2) {
      pinchOriginRef.current = null;
    }

    if (pointersRef.current.size === 0) {
      panOriginRef.current = null;
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_360px]">
      <div className="overflow-hidden rounded-[2.4rem] border border-[#f2dbb0]/12 bg-[linear-gradient(180deg,_rgba(50,33,19,0.98),_rgba(22,15,11,0.98))] p-3 shadow-[0_28px_90px_rgba(0,0,0,0.5)] sm:p-4">
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="relative h-[72vh] min-h-[760px] overflow-hidden rounded-[2rem] border border-[#f0dfbf]/10 bg-[radial-gradient(circle_at_top,_rgba(255,236,197,0.08),_rgba(0,0,0,0)_42%),linear-gradient(180deg,_rgba(59,40,25,0.82)_0%,_rgba(31,23,17,0.74)_100%)] touch-none sm:h-[78vh] xl:h-[84vh]"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22220%22 height=%22220%22 viewBox=%220 0 220 220%22%3E%3Cg fill=%22none%22 stroke=%22rgba(255,240,216,0.05)%22 stroke-width=%221%22%3E%3Cpath d=%22M0 55h220M0 110h220M0 165h220M55 0v220M110 0v220M165 0v220%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
          <div className="absolute inset-[2.8%] z-0 rounded-[1.6rem] border border-white/6 bg-[radial-gradient(circle_at_30%_24%,rgba(124,145,120,0.16),rgba(0,0,0,0)_24%),radial-gradient(circle_at_64%_30%,rgba(103,123,155,0.12),rgba(0,0,0,0)_22%),radial-gradient(circle_at_52%_62%,rgba(161,132,88,0.14),rgba(0,0,0,0)_28%),linear-gradient(180deg,rgba(225,212,184,0.08),rgba(225,212,184,0.02))]" />

          <div className="absolute right-4 top-4 z-30 flex gap-2">
            <button
              type="button"
              onClick={() => zoomBy(1.12)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f0dfbf]/12 bg-[#120d09]/80 text-[#f7ecd8] transition hover:border-[#f0dfbf]/30"
              aria-label="Zoom in"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => zoomBy(0.9)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f0dfbf]/12 bg-[#120d09]/80 text-[#f7ecd8] transition hover:border-[#f0dfbf]/30"
              aria-label="Zoom out"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={resetView}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f0dfbf]/12 bg-[#120d09]/80 text-[#f7ecd8] transition hover:border-[#f0dfbf]/30"
              aria-label="Reset view"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <div className="absolute bottom-4 left-4 z-30 rounded-2xl border border-[#f0dfbf]/12 bg-[#120d09]/80 px-4 py-3 text-sm text-[#e8dcc8] backdrop-blur-sm">
            <p className="font-semibold text-[#fbf4e7]">Trascina per muovere</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#bda376]">
              Rotella o pinch per zoom • Scala {(scale / BASE_SCALE).toFixed(2)}x
            </p>
          </div>

          {hovered ? (
            <div className="absolute left-4 top-4 z-30 max-w-[320px] rounded-[1.5rem] border border-[#f0dfbf]/12 bg-[#120d09]/88 p-4 text-sm text-[#e8dcc8] backdrop-blur-sm">
              <p className="text-lg font-semibold text-[#fbf4e7]">{hovered.name}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#bda376]">
                {clans[hovered.owner].name}
              </p>
              <p className="mt-3">Punti territorio: {hovered.points}</p>
              <p className="mt-1">Modificatore: {hovered.bonus}</p>
              <p className="mt-1">Confini: {hovered.neighbors.length}</p>
              {hovered.capital ? <p className="mt-1">Capitale: {hovered.capital}</p> : null}
            </div>
          ) : null}

          <svg
            viewBox="0 0 1500 1500"
            className="absolute inset-0 z-10 h-full w-full"
            role="img"
            aria-label="Mappa Clan Wars stile Foxhole da oltre 100 territori"
          >
            <g transform={`translate(${offset.x} ${offset.y}) scale(${scale})`}>
              <defs>
                <filter id="hexShadow" x="-25%" y="-25%" width="150%" height="150%">
                  <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#000000" floodOpacity="0.45" />
                </filter>
                <filter id="labelShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.45" />
                </filter>
              </defs>

              {outlinePaths.map((path) => (
                <path
                  key={path}
                  d={path}
                  fill="rgba(43,33,24,0.24)"
                  stroke="rgba(250,234,203,0.18)"
                  strokeWidth="14"
                  strokeLinejoin="round"
                />
              ))}

              {visibleTerritories.map((territory) => {
                const owner = clans[territory.owner];

                return (
                  <g
                    key={territory.id}
                    onClick={() => setSelectedTerritoryId(territory.id)}
                    onMouseEnter={() => setHovered(territory)}
                    onMouseLeave={() => setHovered((current) => (current?.id === territory.id ? null : current))}
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "center",
                      transform:
                        hovered?.id === territory.id
                          ? "translateY(-4px) scale(1.03)"
                          : "translateY(0px) scale(1)",
                      transition: "transform 180ms ease-in-out",
                    }}
                  >
                    <path
                      d={hexPath(territory.x, territory.y, HEX_SIZE)}
                      fill={hovered?.id === territory.id ? owner.solidColor : owner.color}
                      stroke={
                        selectedTerritoryId === territory.id || validAttackTargets.some((target) => target.id === territory.id)
                          ? "rgba(255, 221, 145, 0.95)"
                          : "rgba(247,230,198,0.58)"
                      }
                      strokeWidth={
                        selectedTerritoryId === territory.id || validAttackTargets.some((target) => target.id === territory.id)
                          ? "5"
                          : hovered?.id === territory.id
                            ? "4.5"
                            : "3"
                      }
                      filter="url(#hexShadow)"
                      style={{
                        filter: `drop-shadow(0 0 ${hovered?.id === territory.id ? 26 : 14}px ${owner.glow})`,
                        transition:
                          "stroke-width 180ms ease-in-out, filter 180ms ease-in-out, fill 180ms ease-in-out",
                      }}
                    />

                    <text
                      x={territory.x}
                      y={territory.y - 8}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="700"
                      fill="#fff4de"
                      filter="url(#labelShadow)"
                      style={{
                        letterSpacing: "0.04em",
                        transition: "transform 180ms ease-in-out, opacity 180ms ease-in-out",
                      }}
                    >
                      {territory.shortName}
                    </text>

                    <text
                      x={territory.x}
                      y={territory.y + 16}
                      textAnchor="middle"
                      fontSize="16"
                      fontWeight="700"
                      fill="#fff4de"
                      filter="url(#labelShadow)"
                      style={{ transition: "transform 180ms ease-in-out, opacity 180ms ease-in-out" }}
                    >
                      {territory.points}
                    </text>
                  </g>
                );
              })}

              {attackRoutes.map((route) => (
                <g key={route.key}>
                  <path
                    d={route.d}
                    fill="none"
                    stroke="rgba(255, 244, 222, 0.44)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d={route.d}
                    fill="none"
                    stroke={route.color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="14 12"
                    style={{
                      filter: `drop-shadow(0 0 10px ${route.glow})`,
                      opacity: 0.74,
                      animation: "clanwar-arrow-flow 1.2s linear infinite",
                    }}
                  />
                  <polygon
                    points={attackArrowHead(route.from, route.to)}
                    fill={route.color}
                    stroke="rgba(255, 244, 222, 0.58)"
                    strokeWidth="2"
                    style={{
                      filter: `drop-shadow(0 0 10px ${route.glow})`,
                      opacity: 0.78,
                      transformBox: "fill-box",
                      transformOrigin: "center",
                      animation: "clanwar-arrow-pulse 1.2s ease-in-out infinite",
                    }}
                  />
                  <text
                    x={(route.from.x + route.to.x) / 2}
                    y={(route.from.y + route.to.y) / 2 - 14}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="#fff4de"
                    filter="url(#labelShadow)"
                  >
                    {route.countdown}
                  </text>
                </g>
              ))}

              {capitals.map((territory) => (
                <g key={`capital-${territory.id}`}>
                  <circle
                    cx={territory.x}
                    cy={territory.y - 28}
                    r="13"
                    fill="#1b130f"
                    stroke="#f6d38f"
                    strokeWidth="3.5"
                    style={{ filter: "drop-shadow(0 0 10px rgba(246, 211, 143, 0.55))" }}
                  />
                  <text
                    x={territory.x}
                    y={territory.y - 23}
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="700"
                    fill="#f8dfa6"
                  >
                    *
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-[2rem] border border-[#f0dfbf]/10 bg-[#1b140f] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#bda376]">Stato mappa</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.3rem] border border-[#f0dfbf]/8 bg-[#120d09] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-[#a58e69]">Territori</p>
              <p className="mt-2 text-3xl font-semibold text-[#fbf4e7]">{territories.length}</p>
            </div>
            <div className="rounded-[1.3rem] border border-[#f0dfbf]/8 bg-[#120d09] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-[#a58e69]">Capitali</p>
              <p className="mt-2 text-3xl font-semibold text-[#fbf4e7]">{capitals.length}</p>
            </div>
            <div className="rounded-[1.3rem] border border-[#f0dfbf]/8 bg-[#120d09] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-[#a58e69]">Territori isolati</p>
              <p className="mt-2 text-3xl font-semibold text-[#fbf4e7]">
                {isolatedTerritories.length}
              </p>
            </div>
            <div className="rounded-[1.3rem] border border-[#f0dfbf]/8 bg-[#120d09] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-[#a58e69]">Adj minima</p>
              <p className="mt-2 text-3xl font-semibold text-[#fbf4e7]">
                {Math.min(...territories.map((territory) => territory.neighbors.length))}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#f0dfbf]/10 bg-[#1b140f] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#bda376]">Comando attacco</p>
          <div className="mt-4 space-y-3 text-sm text-[#d7c7af]">
            <p>
              Ruolo: <span className="font-semibold text-[#fbf4e7]">{session?.user.role ?? "ospite"}</span>
            </p>
            <p>
              Clan: <span className="font-semibold text-[#fbf4e7]">{session?.user.clanName ?? "nessuno"}</span>
            </p>
            <p className="text-[#bda376]">
              Solo i capoclan possono proclamare un attacco da un proprio territorio verso un confinante nemico. Il timer
              dura 72 ore.
            </p>

            {selectedTerritory ? (
              <div className="rounded-[1.3rem] border border-[#f0dfbf]/8 bg-[#120d09] px-4 py-4">
                <p className="font-semibold text-[#fbf4e7]">Origine selezionata: {selectedTerritory.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#a58e69]">
                  Owner {clans[selectedTerritory.owner].name}
                </p>
              </div>
            ) : (
              <div className="rounded-[1.3rem] border border-[#f0dfbf]/8 bg-[#120d09] px-4 py-4">
                Seleziona una casella per vedere gli attacchi disponibili.
              </div>
            )}

            {selectedTerritory && canProclaimAttack && selectedTerritory.owner === session?.user.clanId ? (
              validAttackTargets.length > 0 ? (
                validAttackTargets.map((target) => {
                  const routeBusy = activeAttackTerritoryIds.has(selectedTerritory.id) || activeAttackTerritoryIds.has(target.id);

                  return (
                    <form
                      key={`${selectedTerritory.id}-${target.id}`}
                      action={proclaimAttackAction}
                      className="rounded-[1.3rem] border border-[#f0dfbf]/8 bg-[#120d09] px-4 py-4"
                    >
                      <input type="hidden" name="fromTerritoryId" value={selectedTerritory.id} />
                      <input type="hidden" name="targetTerritoryId" value={target.id} />
                      <p className="font-semibold text-[#fbf4e7]">
                        {selectedTerritory.name} → {target.name}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#a58e69]">
                        Difensore {clans[target.owner].name}
                      </p>
                      <button
                        type="submit"
                        disabled={routeBusy}
                        className="mt-3 inline-flex rounded-full border border-amber-300/20 bg-amber-300 px-4 py-2 text-sm font-semibold text-[#120d09] transition hover:bg-[#f6d38f] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-[#a58e69]"
                      >
                        {routeBusy ? "Territorio gia coinvolto" : "Proclama attacco"}
                      </button>
                    </form>
                  );
                })
              ) : (
                <div className="rounded-[1.3rem] border border-[#f0dfbf]/8 bg-[#120d09] px-4 py-4">
                  Nessun bersaglio nemico confinante disponibile da questo territorio.
                </div>
              )
            ) : null}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#f0dfbf]/10 bg-[#1b140f] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#bda376]">Fazioni</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {Object.values(clans).map((clan) => (
              <div key={clan.id} className="rounded-[1.35rem] border border-[#f6e7c8]/10 bg-[#17110d]/80 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full border border-white/25"
                    style={{ backgroundColor: clan.color, boxShadow: `0 0 16px ${clan.glow}` }}
                  />
                  <span className="text-sm font-semibold text-[#f7ecd8]">{clan.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#f0dfbf]/10 bg-[#1b140f] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#bda376]">Tabellone punti</p>
          <div className="mt-4 space-y-3">
            {scoreboard.map((entry, index) => (
              <div
                key={entry.id}
                className="rounded-[1.35rem] border border-[#f6e7c8]/10 bg-[#17110d]/80 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/20 text-sm font-semibold text-[#fbf4e7]">
                      {index + 1}
                    </span>
                    <span
                      className="h-4 w-4 rounded-full border border-white/25"
                      style={{ backgroundColor: entry.color, boxShadow: `0 0 16px ${entry.glow}` }}
                    />
                    <div>
                      <p className="font-semibold text-[#f7ecd8]">{entry.name}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#a58e69]">
                        Territori {entry.territoryCount} • Capitali {entry.capitalCount}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-semibold text-[#fbf4e7]">{entry.totalPoints}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#a58e69]">Punti</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#f0dfbf]/10 bg-[#1b140f] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#bda376]">Attacchi attivi</p>
          <div className="mt-4 space-y-3">
            {attackRoutes.length > 0 ? (
              attackRoutes.map((attack) => (
                <div
                  key={attack.id}
                  className="rounded-[1.35rem] border border-[#f6e7c8]/10 bg-[#17110d]/80 px-4 py-4"
                >
                  <p className="font-semibold text-[#f7ecd8]">
                    {attack.from.name} → {attack.to.name}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#a58e69]">
                    {clans[attack.attackerFactionId].name} vs {clans[attack.defenderFactionId].name}
                  </p>
                  <p className="mt-2 text-sm text-[#fbf4e7]">Timer: {attack.countdown}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(isAdmin || (session?.user.roles.includes("capoclan") && session.user.clanId === attack.attackerFactionId)) ? (
                      <form action={cancelAttackAction}>
                        <input type="hidden" name="attackId" value={attack.id} />
                        <button
                          type="submit"
                          className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-[#f7ecd8] transition hover:border-[#f0dfbf]/30 hover:bg-white/15"
                        >
                          Annulla attacco
                        </button>
                      </form>
                    ) : null}

                    {isAdmin ? (
                      <>
                        <form action={resolveAttackAction}>
                          <input type="hidden" name="attackId" value={attack.id} />
                          <input type="hidden" name="outcome" value="attacker_win" />
                          <button
                            type="submit"
                            className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400 px-3 py-2 text-xs font-semibold text-[#120d09] transition hover:bg-emerald-300"
                          >
                            Vince attaccante
                          </button>
                        </form>
                        <form action={resolveAttackAction}>
                          <input type="hidden" name="attackId" value={attack.id} />
                          <input type="hidden" name="outcome" value="defender_hold" />
                          <button
                            type="submit"
                            className="inline-flex rounded-full border border-amber-300/20 bg-amber-300 px-3 py-2 text-xs font-semibold text-[#120d09] transition hover:bg-[#f6d38f]"
                          >
                            Difesa riuscita
                          </button>
                        </form>
                      </>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.3rem] border border-[#f0dfbf]/8 bg-[#120d09] px-4 py-4 text-sm text-[#d7c7af]">
                Nessun attacco attivo al momento.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#f0dfbf]/10 bg-[#1b140f] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#bda376]">Capitali</p>
          <div className="mt-4 space-y-3">
            {capitals.map((territory) => (
              <div key={territory.id} className="rounded-[1.3rem] border border-[#f0dfbf]/8 bg-[#120d09] px-4 py-3">
                <p className="font-semibold text-[#fbf4e7]">{territory.name}</p>
                <p className="mt-1 text-sm text-[#d7c7af]">Capitale: {territory.capital}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
