import { territoryOwnership } from "./territoryOwnership";

export type Clan = {
  id: string;
  name: string;
  color: string;
  solidColor: string;
  glow: string;
};

export type ClanId = "wolves" | "lions" | "ravens" | "trawlers" | "neutral";

export type Territory = {
  id: string;
  name: string;
  shortName: string;
  q: number;
  r: number;
  x: number;
  y: number;
  owner: ClanId;
  bonus: string;
  points: number;
  neighbors: string[];
  capital?: string;
};

export type AttackStatus = "active" | "resolved" | "cancelled" | "expired";

export type ClanWarAttack = {
  id: string;
  fromTerritoryId: string;
  targetTerritoryId: string;
  attackerFactionId: ClanId;
  defenderFactionId: ClanId;
  proclaimedAt: string;
  expiresAt: string;
  status: AttackStatus;
  attackerUserId: string | null;
};

export const clans = {
  wolves: {
    id: "wolves",
    name: "aoeitalia",
    color: "rgb(210, 72, 72)",
    solidColor: "rgb(210, 72, 72)",
    glow: "rgba(210,72,72,0.34)",
  },
  lions: {
    id: "lions",
    name: "discord dei pezzenti",
    color: "rgb(72, 166, 96)",
    solidColor: "rgb(72, 166, 96)",
    glow: "rgba(72,166,96,0.34)",
  },
  ravens: {
    id: "ravens",
    name: "bimbe di kasiya",
    color: "rgb(72, 112, 210)",
    solidColor: "rgb(72, 112, 210)",
    glow: "rgba(72,112,210,0.34)",
  },
  trawlers: {
    id: "trawlers",
    name: "la pescheria di taffuz",
    color: "rgb(214, 158, 68)",
    solidColor: "rgb(214, 158, 68)",
    glow: "rgba(214,158,68,0.34)",
  },
  neutral: {
    id: "neutral",
    name: "amedeoITA",
    color: "rgb(110, 120, 138)",
    solidColor: "rgb(110, 120, 138)",
    glow: "rgba(110,120,138,0.18)",
  },
} satisfies Record<string, Clan>;

export const bonuses = [
  "Ban civ: English",
  "Ban civ: Mongols",
  "Ban civ: Rus",
  "Mappa fissa: Dry Arabia",
  "Mappa fissa: Lipany",
  "Mappa fissa: Four Lakes",
  "Bonus difesa +1 veto",
  "Assedio rapido: BO3",
  "Fortezza: +1 punto dominio",
  "Zona sacra: blind civ pick",
];

const ownerNameToClanId = {
  aoeitalia: "wolves",
  "discord dei pezzenti": "lions",
  "bimbe di kasiya": "ravens",
  "la pescheria di taffuz": "trawlers",
  amedeoITA: "neutral",
} as const;

export const HEX_SIZE = 30;
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const ORIGIN_X = 760;
const ORIGIN_Y = 710;
const BOARD_RADIUS = 6;

function hexToPixel(q: number, r: number) {
  return {
    x: ORIGIN_X + HEX_WIDTH * (q + r / 2),
    y: ORIGIN_Y + HEX_SIZE * 1.5 * r,
  };
}

export function hexPath(x: number, y: number, size: number) {
  const points = Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 180) * (60 * index - 30);
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    return `${px.toFixed(2)},${py.toFixed(2)}`;
  });

  return `M${points.join(" L")} Z`;
}

const largeHexPoints = Array.from({ length: 6 }, (_, index) => {
  const angle = (Math.PI / 180) * (60 * index - 30);
  const size = HEX_SIZE * (BOARD_RADIUS + 1.25) * 1.72;
  return {
    x: ORIGIN_X + size * Math.cos(angle),
    y: ORIGIN_Y + size * Math.sin(angle),
  };
});

export const outlinePaths = [
  `M ${largeHexPoints.map((point) => `${point.x} ${point.y}`).join(" L ")} Z`,
];

function keyFor(q: number, r: number) {
  return `${q}:${r}`;
}

function ringIndex(q: number, r: number) {
  const s = -q - r;
  return Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
}

function roman(value: number) {
  const numerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return numerals[(value - 1) % numerals.length];
}

function provinceAbbreviation(label: string) {
  return label
    .split(/\s+/)
    .slice(0, 2)
    .map((chunk) => chunk.slice(0, 3).toUpperCase())
    .join(".");
}

const capitalByCell: Record<string, { capital: string }> = {
  [keyFor(0, 0)]: { capital: "Ascoli Piceno" },
  [keyFor(-4, 0)]: { capital: "Torino" },
  [keyFor(4, 0)]: { capital: "Venezia" },
  [keyFor(0, -4)]: { capital: "Milano" },
  [keyFor(0, 4)]: { capital: "Napoli" },
};

const excludedCells = new Set<string>();

const rawCells: Territory[] = [];

for (let q = -BOARD_RADIUS; q <= BOARD_RADIUS; q += 1) {
  for (let r = -BOARD_RADIUS; r <= BOARD_RADIUS; r += 1) {
    const s = -q - r;
    if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) > BOARD_RADIUS) continue;
    if (excludedCells.has(keyFor(q, r))) continue;

    const { x, y } = hexToPixel(q, r);
    const cellKey = keyFor(q, r);
    const special = capitalByCell[cellKey];
    const ring = ringIndex(q, r);
    const nextCount = rawCells.length + 1;
    const ownershipEntry = territoryOwnership[nextCount - 1];
    const displayName = ownershipEntry?.name ?? `Provincia ${roman(nextCount)}`;
    const cellId = ownershipEntry?.id ?? `territory-${nextCount}`;

    const basePoints = ring <= 1 ? 4 : ring <= 3 ? 3 : ring <= 5 ? 2 : 1;
    const totalPoints = ownershipEntry?.points ?? (special ? basePoints + 1 : basePoints);
    const territoryBonus =
      ownershipEntry?.bonus ??
      (special?.capital === "Ascoli Piceno"
        ? "Massimi +3 attacco +3 difesa"
        : bonuses[(Math.abs(q) + Math.abs(r) + nextCount) % bonuses.length]);

    rawCells.push({
      id: cellId,
      name: displayName,
      shortName: provinceAbbreviation(displayName),
      q,
      r,
      x,
      y,
      owner: ownershipEntry ? ownerNameToClanId[ownershipEntry.owner] : "neutral",
      bonus: territoryBonus,
      points: totalPoints,
      neighbors: [],
      capital: special?.capital,
    });
  }
}

const cellMap = new Map(rawCells.map((cell) => [keyFor(cell.q, cell.r), cell]));
const axialNeighbors = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
] as const;

export const maritimeLinks: readonly [string, string][] = [];

export const territories: Territory[] = rawCells.map((cell) => ({
  ...cell,
  neighbors: axialNeighbors
    .map(([dq, dr]) => cellMap.get(keyFor(cell.q + dq, cell.r + dr)))
    .filter((entry): entry is Territory => Boolean(entry))
    .map((entry) => entry.id),
}));

export const capitals = territories.filter((territory) => territory.capital);
export const isolatedTerritories = territories.filter((territory) => territory.neighbors.length === 0);
