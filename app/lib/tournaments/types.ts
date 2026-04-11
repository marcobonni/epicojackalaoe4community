export type UserRole = "admin" | "user";

export type TournamentFormat =
  | "single_elimination"
  | "double_elimination"
  | "round_robin"
  | "swiss"
  | "groups_playoff"
  | "league_season"
  | "ladder"
  | "king_of_the_hill"
  | "gsl_group";

export type SignupMode =
  | "public"
  | "approval"
  | "invite_only"
  | "manual_roster"
  | "hybrid";

export type ParticipantMode = "1v1" | "2v2" | "team" | "solo_with_subs";
export type SeedingMode =
  | "random"
  | "manual"
  | "ranking_based"
  | "previous_season"
  | "protected";

export type TournamentVisibility = "public" | "members_only" | "hidden";

export type TournamentStatus =
  | "draft"
  | "registration_open"
  | "check_in"
  | "seeding"
  | "live"
  | "paused"
  | "completed"
  | "cancelled";

export type SchedulingMode = "free" | "deadline" | "fixed_slots";

export type ResultConfirmationMode =
  | "dual_confirmation"
  | "auto_on_same_report"
  | "admin_only";

export type TieBreakerMode =
  | "head_to_head"
  | "map_difference"
  | "point_difference"
  | "buchholz"
  | "playoff"
  | "initial_seed";

export type MatchStatus =
  | "pending"
  | "ready"
  | "awaiting_confirmation"
  | "disputed"
  | "admin_review"
  | "completed"
  | "forfeited"
  | "cancelled";

export type RegistrationStatus =
  | "pending"
  | "registered"
  | "rejected"
  | "withdrawn";

export interface TournamentProfile {
  id: string;
  email: string | null;
  display_name: string;
  discord_name: string | null;
  steam_name: string | null;
  avatar_url: string | null;
}

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  user_id: string;
  seed: number | null;
  status: RegistrationStatus;
  source: "signup" | "manual";
  requested_at: string;
  approved_at: string | null;
  updated_at: string;
  profile?: TournamentProfile | null;
}

export interface TournamentMatch {
  id: string;
  tournament_id: string;
  round_number: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  pending_winner_id: string | null;
  status: MatchStatus;
  next_match_id: string | null;
  next_match_slot: 1 | 2 | null;
  player1_wins: number | null;
  player2_wins: number | null;
  reported_by_id: string | null;
  confirmed_by_id: string | null;
  report_evidence: string | null;
  dispute_reason: string | null;
  admin_notes: string | null;
  resolution_type: string | null;
  reported_at: string | null;
  completed_at: string | null;
  player1?: TournamentProfile | null;
  player2?: TournamentProfile | null;
  winner?: TournamentProfile | null;
  pending_winner?: TournamentProfile | null;
}

export interface TournamentSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: TournamentStatus;
  format: TournamentFormat;
  signup_mode: SignupMode;
  visibility: TournamentVisibility;
  participant_mode: ParticipantMode;
  seeding_mode: SeedingMode;
  max_participants: number;
  min_participants: number;
  best_of: number;
  registration_opens_at: string | null;
  registration_closes_at: string | null;
  starts_at: string | null;
  created_at: string;
  updated_at: string;
  bracket_generated_at: string | null;
  map_rules: string;
  prize_summary: string;
  notes: string;
  scheduling_mode: SchedulingMode;
  tie_breaker: TieBreakerMode;
  result_confirmation_mode: ResultConfirmationMode;
  evidence_mode: "optional" | "required";
  participant_count?: number;
  pending_registrations?: number;
  match_count?: number;
  pending_registration_entries?: TournamentRegistration[];
  my_registration_status?: RegistrationStatus | null;
  my_registration_source?: "signup" | "manual" | null;
  my_registration_seed?: number | null;
}

export interface TournamentDetailsResponse {
  tournament: TournamentSummary | null;
  matches: TournamentMatch[];
  participants: TournamentRegistration[];
  myRegistration: TournamentRegistration | null;
  nextMatch: TournamentMatch | null;
}

export interface MyTournamentEntry {
  tournament: TournamentSummary;
  registration: TournamentRegistration;
  nextMatch: TournamentMatch | null;
}

export interface TournamentMeResponse {
  user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  };
  profile: TournamentProfile | null;
}

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  description: string;
};

export const tournamentFormatOptions: SelectOption<TournamentFormat>[] = [
  {
    value: "single_elimination",
    label: "Single elimination",
    description:
      "Bracket classico a eliminazione diretta, pienamente automatizzato in questa prima integrazione.",
  },
  {
    value: "double_elimination",
    label: "Double elimination",
    description: "Tabellone winners e losers bracket.",
  },
  {
    value: "round_robin",
    label: "Round robin",
    description: "Tutti contro tutti, ideale per gruppi piccoli.",
  },
  {
    value: "swiss",
    label: "Swiss",
    description: "Accoppiamenti per score, utile con molti giocatori.",
  },
  {
    value: "groups_playoff",
    label: "Groups + playoff",
    description: "Gironi iniziali con fase finale a eliminazione.",
  },
  {
    value: "league_season",
    label: "League season",
    description: "Stagione a punti e classifica persistente.",
  },
  {
    value: "ladder",
    label: "Ladder",
    description: "Sistema sfide continue.",
  },
  {
    value: "king_of_the_hill",
    label: "King of the hill",
    description: "Il vincitore resta in cima finche non perde.",
  },
  {
    value: "gsl_group",
    label: "GSL group",
    description: "Formato gruppi stile esports.",
  },
];

export const signupModeOptions: SelectOption<SignupMode>[] = [
  {
    value: "public",
    label: "Public",
    description: "Iscrizione diretta finche ci sono slot.",
  },
  {
    value: "approval",
    label: "Approval based",
    description: "L'admin approva le richieste di iscrizione.",
  },
  {
    value: "invite_only",
    label: "Invite only",
    description: "Solo utenti invitati manualmente.",
  },
  {
    value: "manual_roster",
    label: "Manual roster",
    description: "Solo l'admin costruisce il roster.",
  },
  {
    value: "hybrid",
    label: "Hybrid",
    description: "Iscrizione pubblica piu wildcard manuali.",
  },
];

export const participantModeOptions: SelectOption<ParticipantMode>[] = [
  {
    value: "1v1",
    label: "1v1",
    description: "Formato singolo.",
  },
  {
    value: "2v2",
    label: "2v2",
    description: "Team da due giocatori.",
  },
  {
    value: "team",
    label: "Team based",
    description: "Roster o clan con piu giocatori.",
  },
  {
    value: "solo_with_subs",
    label: "Solo con sostituti",
    description: "Giocatori singoli con possibili backup.",
  },
];

export const seedingModeOptions: SelectOption<SeedingMode>[] = [
  {
    value: "random",
    label: "Random",
    description: "Sorteggio casuale.",
  },
  {
    value: "manual",
    label: "Manual",
    description: "Seed impostati dall'admin.",
  },
  {
    value: "ranking_based",
    label: "Ranking based",
    description: "Seed da classifica o elo.",
  },
  {
    value: "previous_season",
    label: "Previous season",
    description: "Seed dai risultati della stagione precedente.",
  },
  {
    value: "protected",
    label: "Protected",
    description: "Evita accoppiamenti iniziali indesiderati.",
  },
];

export const visibilityOptions: SelectOption<TournamentVisibility>[] = [
  {
    value: "public",
    label: "Pubblico",
    description: "Visibile a tutti sul sito.",
  },
  {
    value: "members_only",
    label: "Solo iscritti",
    description: "Visibile agli utenti autenticati o partecipanti.",
  },
  {
    value: "hidden",
    label: "Nascosto",
    description: "Bozza privata finche non la pubblichi.",
  },
];

export const schedulingModeOptions: SelectOption<SchedulingMode>[] = [
  {
    value: "free",
    label: "Scheduling libero",
    description: "I giocatori si organizzano da soli.",
  },
  {
    value: "deadline",
    label: "Deadline round",
    description: "Ogni round ha una scadenza.",
  },
  {
    value: "fixed_slots",
    label: "Slot fissi",
    description: "Orari prestabiliti per i match.",
  },
];

export const tieBreakerOptions: SelectOption<TieBreakerMode>[] = [
  {
    value: "head_to_head",
    label: "Scontri diretti",
    description: "Primo tie-break classico.",
  },
  {
    value: "map_difference",
    label: "Differenza mappe",
    description: "Usa lo scarto mappe.",
  },
  {
    value: "point_difference",
    label: "Differenza punti",
    description: "Per leghe e gruppi.",
  },
  {
    value: "buchholz",
    label: "Buchholz",
    description: "Tipico degli Swiss.",
  },
  {
    value: "playoff",
    label: "Spareggio",
    description: "Partita extra di spareggio.",
  },
  {
    value: "initial_seed",
    label: "Seed iniziale",
    description: "Ultimo criterio di fallback.",
  },
];

export const resultConfirmationOptions: SelectOption<ResultConfirmationMode>[] = [
  {
    value: "dual_confirmation",
    label: "Doppia conferma",
    description: "Un player invia il risultato e l'altro lo conferma.",
  },
  {
    value: "auto_on_same_report",
    label: "Auto report uguale",
    description: "Pensato per chiudere il match quando i report coincidono.",
  },
  {
    value: "admin_only",
    label: "Solo admin",
    description: "Il risultato passa sempre da revisione admin.",
  },
];

export const tournamentStatusLabels: Record<TournamentStatus, string> = {
  draft: "Bozza",
  registration_open: "Iscrizioni aperte",
  check_in: "Check-in",
  seeding: "Seeding",
  live: "Live",
  paused: "In pausa",
  completed: "Concluso",
  cancelled: "Annullato",
};

export const matchStatusLabels: Record<MatchStatus, string> = {
  pending: "In attesa",
  ready: "Da giocare",
  awaiting_confirmation: "In attesa di conferma",
  disputed: "Contestata",
  admin_review: "Revisione admin",
  completed: "Completata",
  forfeited: "Forfeit",
  cancelled: "Annullata",
};

export const tournamentFormatLabels: Record<TournamentFormat, string> = {
  single_elimination: "Single elimination",
  double_elimination: "Double elimination",
  round_robin: "Round robin",
  swiss: "Swiss",
  groups_playoff: "Groups + playoff",
  league_season: "League season",
  ladder: "Ladder",
  king_of_the_hill: "King of the hill",
  gsl_group: "GSL group",
};
