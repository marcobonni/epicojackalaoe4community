import type { MatchStatus } from "@/app/lib/tournaments/types";

export function getMatchStatusTone(status: MatchStatus) {
  switch (status) {
    case "ready":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
    case "awaiting_confirmation":
      return "border-amber-400/40 bg-amber-400/10 text-amber-100";
    case "disputed":
      return "border-rose-500/40 bg-rose-500/10 text-rose-100";
    case "admin_review":
      return "border-sky-500/40 bg-sky-500/10 text-sky-100";
    case "completed":
    case "forfeited":
      return "border-slate-700 bg-slate-900 text-slate-200";
    default:
      return "border-slate-700 bg-slate-900 text-slate-300";
  }
}
