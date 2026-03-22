export type RegionalCategory =
  | "switzerland"
  | "north"
  | "center"
  | "south";

export type PlayerRegionEntry = {
  profile_id: number;
  macroRegion: RegionalCategory;
};

export function getRegionLabel(region: RegionalCategory) {
  switch (region) {
    case "switzerland":
      return "Classifica Elvetica";
    case "north":
      return "Classifica Nord";
    case "center":
      return "Classifica Centro";
    case "south":
      return "Classifica Sud";
    default:
      return "Classifica";
  }
}

export function filterProfileIdsByRegion(
  entries: PlayerRegionEntry[],
  region: RegionalCategory
) {
  return entries
    .filter((entry) => entry.macroRegion === region)
    .map((entry) => entry.profile_id);
}