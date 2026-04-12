"use server";

import { revalidatePath } from "next/cache";
import { getRequiredSession } from "@/app/lib/session";
import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";
import { territories } from "./mapData";

const ATTACK_DURATION_HOURS = 72;
const MAX_CONCURRENT_ATTACKS_PER_FACTION_PAIR = 3;

async function syncExpiredAttacks() {
  const supabase = createSupabaseAdminClient();
  const nowIso = new Date().toISOString();

  const { error } = await supabase
    .from("clanwar_attacks")
    .update({
      status: "expired",
      updated_at: nowIso,
    })
    .eq("status", "active")
    .lt("expires_at", nowIso);

  if (error) {
    throw new Error(error.message);
  }

  return supabase;
}

async function getCurrentTerritoryOwners(supabase: ReturnType<typeof createSupabaseAdminClient>, territoryIds: string[]) {
  const { data, error } = await supabase
    .from("clanwar_territory_control")
    .select("territory_id, faction_id")
    .in("territory_id", territoryIds);

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((row) => [row.territory_id, row.faction_id]));
}

export async function proclaimAttackAction(formData: FormData) {
  const session = await getRequiredSession();

  if (!session.user.roles.includes("capoclan")) {
    throw new Error("Solo i capoclan possono proclamare un attacco.");
  }

  if (!session.user.clanId) {
    throw new Error("Il capoclan deve essere associato a un clan per poter attaccare.");
  }

  const fromTerritoryId = `${formData.get("fromTerritoryId") ?? ""}`.trim();
  const targetTerritoryId = `${formData.get("targetTerritoryId") ?? ""}`.trim();

  if (!fromTerritoryId || !targetTerritoryId) {
    throw new Error("Territorio di partenza e bersaglio sono obbligatori.");
  }

  const territoryById = new Map(territories.map((territory) => [territory.id, territory]));
  const fromTerritory = territoryById.get(fromTerritoryId);
  const targetTerritory = territoryById.get(targetTerritoryId);

  if (!fromTerritory || !targetTerritory) {
    throw new Error("Attacco non valido: territorio non trovato.");
  }

  const supabase = await syncExpiredAttacks();
  const territoryOwners = await getCurrentTerritoryOwners(supabase, [fromTerritory.id, targetTerritory.id]);
  const fromOwner = territoryOwners.get(fromTerritory.id) ?? fromTerritory.owner;
  const targetOwner = territoryOwners.get(targetTerritory.id) ?? targetTerritory.owner;

  if (fromOwner !== session.user.clanId) {
    throw new Error("Puoi attaccare solo partendo da un territorio del tuo clan.");
  }

  if (targetOwner === session.user.clanId) {
    throw new Error("Non puoi attaccare un territorio del tuo stesso clan.");
  }

  if (!fromTerritory.neighbors.includes(targetTerritory.id)) {
    throw new Error("Puoi attaccare solo territori confinanti.");
  }

  const { data: existingAttack, error: existingAttackError } = await supabase
    .from("clanwar_attacks")
    .select("id, attacker_faction_id, defender_faction_id, from_territory_id, target_territory_id")
    .eq("status", "active")
    .or(
      [
        `target_territory_id.eq.${fromTerritory.id}`,
        `target_territory_id.eq.${targetTerritory.id}`,
        `and(from_territory_id.eq.${fromTerritory.id},target_territory_id.eq.${targetTerritory.id})`,
      ].join(",")
    )
    .limit(10);

  if (existingAttackError) {
    throw new Error(existingAttackError.message);
  }

  const exactRouteAlreadyActive = (existingAttack ?? []).some(
    (attack) =>
      attack.from_territory_id === fromTerritory.id &&
      attack.target_territory_id === targetTerritory.id
  );
  const defendingRouteBusy = (existingAttack ?? []).some(
    (attack) =>
      attack.target_territory_id === targetTerritory.id ||
      attack.target_territory_id === fromTerritory.id
  );

  if (exactRouteAlreadyActive) {
    throw new Error("Questo attacco e gia attivo.");
  }

  if (defendingRouteBusy) {
    throw new Error("Il territorio bersaglio e gia coinvolto in un attacco attivo.");
  }

  const { count: pairAttackCount, error: pairAttackCountError } = await supabase
    .from("clanwar_attacks")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .eq("attacker_faction_id", session.user.clanId)
    .eq("defender_faction_id", targetOwner);

  if (pairAttackCountError) {
    throw new Error(pairAttackCountError.message);
  }

  if ((pairAttackCount ?? 0) >= MAX_CONCURRENT_ATTACKS_PER_FACTION_PAIR) {
    throw new Error("Il tuo clan ha gia 3 attacchi attivi contro questo clan. Devi colpire anche altri fronti.");
  }

  const proclaimedAt = new Date();
  const expiresAt = new Date(proclaimedAt.getTime() + ATTACK_DURATION_HOURS * 60 * 60 * 1000);

  const { error } = await supabase.from("clanwar_attacks").insert({
    from_territory_id: fromTerritory.id,
    target_territory_id: targetTerritory.id,
    attacker_faction_id: session.user.clanId,
    defender_faction_id: targetOwner,
    attacker_user_id: session.user.id,
    proclaimed_at: proclaimedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    status: "active",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/clanwars/risiko");
}

export async function cancelAttackAction(formData: FormData) {
  const session = await getRequiredSession();
  const attackId = `${formData.get("attackId") ?? ""}`.trim();

  if (!attackId) {
    throw new Error("Attacco non valido.");
  }

  const supabase = await syncExpiredAttacks();
  const { data: attack, error: attackError } = await supabase
    .from("clanwar_attacks")
    .select("id, status, attacker_faction_id, attacker_user_id")
    .eq("id", attackId)
    .maybeSingle();

  if (attackError) {
    throw new Error(attackError.message);
  }

  if (!attack || attack.status !== "active") {
    throw new Error("Questo attacco non e piu attivo.");
  }

  const canCancelAsAdmin = session.user.roles.includes("admin");
  const canCancelAsClanLeader =
    session.user.roles.includes("capoclan") && session.user.clanId === attack.attacker_faction_id;

  if (!canCancelAsAdmin && !canCancelAsClanLeader) {
    throw new Error("Non hai i permessi per annullare questo attacco.");
  }

  const { error } = await supabase
    .from("clanwar_attacks")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", attackId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/clanwars/risiko");
}

export async function resolveAttackAction(formData: FormData) {
  const session = await getRequiredSession();

  if (!session.user.roles.includes("admin")) {
    throw new Error("Solo un admin puo risolvere un attacco.");
  }

  const attackId = `${formData.get("attackId") ?? ""}`.trim();
  const outcome = `${formData.get("outcome") ?? ""}`.trim();

  if (!attackId || (outcome !== "attacker_win" && outcome !== "defender_hold")) {
    throw new Error("Risoluzione attacco non valida.");
  }

  const supabase = await syncExpiredAttacks();
  const { data: attack, error: attackError } = await supabase
    .from("clanwar_attacks")
    .select("id, status, target_territory_id, attacker_faction_id")
    .eq("id", attackId)
    .maybeSingle();

  if (attackError) {
    throw new Error(attackError.message);
  }

  if (!attack || attack.status !== "active") {
    throw new Error("Questo attacco non e piu attivo.");
  }

  if (outcome === "attacker_win") {
    const { error: controlError } = await supabase
      .from("clanwar_territory_control")
      .update({
        faction_id: attack.attacker_faction_id,
        updated_at: new Date().toISOString(),
      })
      .eq("territory_id", attack.target_territory_id);

    if (controlError) {
      throw new Error(controlError.message);
    }
  }

  const { error } = await supabase
    .from("clanwar_attacks")
    .update({
      status: "resolved",
      updated_at: new Date().toISOString(),
    })
    .eq("id", attackId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/clanwars/risiko");
}
