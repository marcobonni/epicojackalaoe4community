"use client";

import { useTranslations } from "@/app/components/LanguageProvider";
import { getMatchStatusTone } from "@/app/lib/tournaments/engine";
import type { MatchStatus, TournamentStatus } from "@/app/lib/tournaments/types";

type StatusBadgeProps =
  | {
      kind: "tournament";
      status: TournamentStatus;
    }
  | {
      kind: "match";
      status: MatchStatus;
    };

export default function StatusBadge(props: StatusBadgeProps) {
  const messages = useTranslations();

  if (props.kind === "match") {
    return (
      <span
        className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ${getMatchStatusTone(
          props.status
        )}`}
      >
        {messages.tournamentsPage.matchStatuses[props.status]}
      </span>
    );
  }

  const palette: Record<TournamentStatus, string> = {
    draft: "border-[#4b312a] bg-[#140c0d] text-[#e8dcc8]",
    registration_open: "border-[#d9b265]/40 bg-[#d9b265]/10 text-[#f8edd7]",
    check_in: "border-[#aa221d]/40 bg-[#7f1517]/10 text-[#fde8e1]",
    seeding: "border-[#b9855f]/40 bg-[#b9855f]/10 text-[#f8e3d7]",
    live: "border-amber-400/40 bg-amber-400/10 text-amber-100",
  paused: "border-[#7a5b4d]/40 bg-[#8f7e69]/10 text-[#e8dcc8]",
    completed: "border-[#4b312a] bg-[#140c0d] text-[#e8dcc8]",
    cancelled: "border-rose-500/40 bg-rose-500/10 text-rose-100",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ${palette[props.status]}`}
    >
      {messages.tournamentsPage.tournamentStatuses[props.status]}
    </span>
  );
}

