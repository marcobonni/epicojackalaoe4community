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
    draft: "border-slate-700 bg-slate-900 text-slate-200",
    registration_open: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
    check_in: "border-sky-500/40 bg-sky-500/10 text-sky-100",
    seeding: "border-violet-500/40 bg-violet-500/10 text-violet-100",
    live: "border-amber-400/40 bg-amber-400/10 text-amber-100",
    paused: "border-slate-500/40 bg-slate-500/10 text-slate-200",
    completed: "border-slate-700 bg-slate-900 text-slate-200",
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
