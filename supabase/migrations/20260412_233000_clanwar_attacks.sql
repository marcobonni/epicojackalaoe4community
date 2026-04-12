-- Clan war attacks

create table if not exists public.clanwar_attacks (
  id uuid primary key default gen_random_uuid(),
  from_territory_id text not null references public.clanwar_territories(id) on delete cascade,
  target_territory_id text not null references public.clanwar_territories(id) on delete cascade,
  attacker_faction_id text not null references public.clanwar_factions(id),
  defender_faction_id text not null references public.clanwar_factions(id),
  attacker_user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'active',
  proclaimed_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint clanwar_attacks_status_check check (status in ('active', 'resolved', 'cancelled', 'expired')),
  constraint clanwar_attacks_distinct_territories_check check (from_territory_id <> target_territory_id)
);

create index if not exists clanwar_attacks_status_idx
  on public.clanwar_attacks (status, proclaimed_at desc);

create index if not exists clanwar_attacks_from_territory_idx
  on public.clanwar_attacks (from_territory_id);

create index if not exists clanwar_attacks_target_territory_idx
  on public.clanwar_attacks (target_territory_id);

alter table public.clanwar_attacks enable row level security;

drop policy if exists "Public can read clanwar attacks" on public.clanwar_attacks;
create policy "Public can read clanwar attacks"
  on public.clanwar_attacks
  for select
  using (true);
