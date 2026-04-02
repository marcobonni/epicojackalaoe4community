export function getPlayerBadge(name: string) {
  const cleaned = name.trim();
  if (!cleaned) return "?";

  const parts = cleaned.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}