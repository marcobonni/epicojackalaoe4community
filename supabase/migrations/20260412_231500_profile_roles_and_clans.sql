-- Extend profiles with multi-role support and clan membership

alter table public.profiles
  add column if not exists roles text[] not null default array['user']::text[],
  add column if not exists clan_faction_id text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_roles_allowed_check'
  ) then
    alter table public.profiles
      add constraint profiles_roles_allowed_check
      check (
        cardinality(roles) >= 1
        and roles <@ array['user', 'admin', 'capoclan']::text[]
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_clan_faction_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_clan_faction_id_fkey
      foreign key (clan_faction_id)
      references public.clanwar_factions(id)
      on delete set null;
  end if;
end $$;

create index if not exists profiles_roles_gin_idx
  on public.profiles
  using gin (roles);

create index if not exists profiles_clan_faction_id_idx
  on public.profiles (clan_faction_id);

update public.profiles
set roles = case
  when role = 'admin' then array['user', 'admin']::text[]
  when role = 'capoclan' then array['user', 'capoclan']::text[]
  else array['user']::text[]
end
where roles is null
   or roles = '{}'::text[]
   or roles = array['user']::text[];

update public.profiles
set role = case
  when 'admin' = any(roles) then 'admin'
  when 'capoclan' = any(roles) then 'capoclan'
  else 'user'
end
where role is distinct from case
  when 'admin' = any(roles) then 'admin'
  when 'capoclan' = any(roles) then 'capoclan'
  else 'user'
end;
