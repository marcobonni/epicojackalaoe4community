import "server-only";

import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";
import {
  type ClanWarAttack,
  capitals as fallbackCapitals,
  clans as fallbackClans,
  isolatedTerritories as fallbackIsolatedTerritories,
  territories as fallbackTerritories,
  type Clan,
  type ClanId,
  type Territory,
} from "./mapData";

type FactionRow = {
  id: ClanId;
  name: string;
  color: string;
  solid_color: string;
  glow: string;
  display_order: number | null;
};

type TerritoryRow = {
  id: string;
  name: string;
  short_name: string;
  points: number;
  bonus: string;
  capital: string | null;
};

type ControlRow = {
  territory_id: string;
  faction_id: ClanId;
};

type AttackRow = {
  id: string;
  from_territory_id: string;
  target_territory_id: string;
  attacker_faction_id: ClanId;
  defender_faction_id: ClanId;
  proclaimed_at: string;
  expires_at: string;
  status: "active" | "resolved" | "cancelled" | "expired";
  attacker_user_id: string | null;
};

export type RisikoMapData = {
  clans: Record<ClanId, Clan>;
  territories: Territory[];
  capitals: Territory[];
  isolatedTerritories: Territory[];
  attacks: ClanWarAttack[];
};

const fallbackMapData: RisikoMapData = {
  clans: fallbackClans,
  territories: fallbackTerritories,
  capitals: fallbackCapitals,
  isolatedTerritories: fallbackIsolatedTerritories,
  attacks: [],
};

function buildClanMap(rows: FactionRow[]) {
  const nextClans = { ...fallbackClans };

  for (const row of rows) {
    if (!(row.id in nextClans)) continue;

    nextClans[row.id] = {
      id: row.id,
      name: row.name,
      color: row.color,
      solidColor: row.solid_color,
      glow: row.glow,
    };
  }

  return nextClans;
}

function buildTerritories(territoryRows: TerritoryRow[], controlRows: ControlRow[]) {
  const territoryById = new Map(territoryRows.map((territory) => [territory.id, territory]));
  const controlByTerritoryId = new Map(controlRows.map((control) => [control.territory_id, control.faction_id]));

  return fallbackTerritories.map((territory) => {
    const dbTerritory = territoryById.get(territory.id);
    const dbOwner = controlByTerritoryId.get(territory.id);

    return {
      ...territory,
      name: dbTerritory?.name ?? territory.name,
      shortName: dbTerritory?.short_name ?? territory.shortName,
      points: dbTerritory?.points ?? territory.points,
      bonus: dbTerritory?.bonus ?? territory.bonus,
      capital: dbTerritory?.capital ?? territory.capital,
      owner: dbOwner ?? territory.owner,
    };
  });
}

export async function getRisikoMapData(): Promise<RisikoMapData> {
  try {
    try {
      const adminClient = createSupabaseAdminClient();
      await adminClient
        .from("clanwar_attacks")
        .update({
          status: "expired",
          updated_at: new Date().toISOString(),
        })
        .eq("status", "active")
        .lt("expires_at", new Date().toISOString());
    } catch {
      // Keep public read path working even when the service role key is not configured.
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return fallbackMapData;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const [factionsResult, territoriesResult, controlResult, attacksResult] = await Promise.all([
      supabase
        .from("clanwar_factions")
        .select("id, name, color, solid_color, glow, display_order")
        .order("display_order", { ascending: true }),
      supabase.from("clanwar_territories").select("id, name, short_name, points, bonus, capital"),
      supabase.from("clanwar_territory_control").select("territory_id, faction_id"),
      supabase
        .from("clanwar_attacks")
        .select(
          "id, from_territory_id, target_territory_id, attacker_faction_id, defender_faction_id, proclaimed_at, expires_at, status, attacker_user_id"
        )
        .eq("status", "active")
        .order("proclaimed_at", { ascending: false }),
    ]);

    if (factionsResult.error || territoriesResult.error || controlResult.error) {
      console.error("Failed to load clan war map data from Supabase.", {
        factionsError: factionsResult.error?.message,
        territoriesError: territoriesResult.error?.message,
        controlError: controlResult.error?.message,
      });

      return fallbackMapData;
    }

    const factionRows = factionsResult.data ?? [];
    const territoryRows = territoriesResult.data ?? [];
    const controlRows = controlResult.data ?? [];
    const attackRows = attacksResult.error ? [] : attacksResult.data ?? [];

    if (factionRows.length === 0 || territoryRows.length === 0 || controlRows.length === 0) {
      return fallbackMapData;
    }

    const clans = buildClanMap(factionRows);
    const territories = buildTerritories(territoryRows, controlRows);

    return {
      clans,
      territories,
      capitals: territories.filter((territory) => territory.capital),
      isolatedTerritories: territories.filter((territory) => territory.neighbors.length === 0),
      attacks: attackRows.map((attack): ClanWarAttack => ({
        id: attack.id,
        fromTerritoryId: attack.from_territory_id,
        targetTerritoryId: attack.target_territory_id,
        attackerFactionId: attack.attacker_faction_id,
        defenderFactionId: attack.defender_faction_id,
        proclaimedAt: attack.proclaimed_at,
        expiresAt: attack.expires_at,
        status: attack.status,
        attackerUserId: attack.attacker_user_id,
      })),
    };
  } catch (error) {
    console.error("Unexpected error while loading clan war map data.", error);
    return fallbackMapData;
  }
}
