import type { MatchStatus } from "@/app/lib/tournaments/types";

export function getMatchStatusTone(status: MatchStatus) {
  switch (status) {
    case "ready":
      return "border-[#d9b265]/40 bg-[#d9b265]/10 text-[#f8edd7]";
    case "awaiting_confirmation":
      return "border-amber-400/40 bg-amber-400/10 text-amber-100";
    case "disputed":
      return "border-rose-500/40 bg-rose-500/10 text-rose-100";
    case "admin_review":
      return "border-[#aa221d]/40 bg-[#7f1517]/10 text-[#fde8e1]";
    case "completed":
    case "forfeited":
      return "border-[#4b312a] bg-[#140c0d] text-[#e8dcc8]";
    default:
      return "border-[#4b312a] bg-[#140c0d] text-[#d8cbb7]";
  }
}

