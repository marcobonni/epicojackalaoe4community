# Profili, Ruoli e Clan

Il progetto ora e pronto per supportare:

- ruoli multipli per utente
- nuovo ruolo `capoclan`
- appartenenza di un utente a un clan della mappa

## Migration

Applica dopo la migration della mappa:

- [20260412_230000_clanwar_risiko_map.sql](C:/Users/marco/Desktop/aoe4sito/epicojackalaoe4community/supabase/migrations/20260412_230000_clanwar_risiko_map.sql)
- [20260412_231500_profile_roles_and_clans.sql](C:/Users/marco/Desktop/aoe4sito/epicojackalaoe4community/supabase/migrations/20260412_231500_profile_roles_and_clans.sql)

## Nuovi campi in `profiles`

- `roles text[] not null default {'user'}`
- `clan_faction_id text null`

`clan_faction_id` punta a `public.clanwar_factions.id`.

## Ruoli ammessi

- `user`
- `admin`
- `capoclan`

## Compatibilita col codice attuale

Il vecchio campo `profiles.role` resta ancora usato come ruolo principale di compatibilita:

- se `roles` contiene `admin`, allora `role = 'admin'`
- altrimenti se `roles` contiene `capoclan`, allora `role = 'capoclan'`
- altrimenti `role = 'user'`

## Esempi utili

Utente normale:

```sql
update public.profiles
set roles = array['user']::text[],
    role = 'user',
    clan_faction_id = null
where id = 'USER_ID';
```

Utente admin:

```sql
update public.profiles
set roles = array['user', 'admin']::text[],
    role = 'admin'
where id = 'USER_ID';
```

Utente capoclan di `wolves`:

```sql
update public.profiles
set roles = array['user', 'capoclan']::text[],
    role = 'capoclan',
    clan_faction_id = 'wolves'
where id = 'USER_ID';
```

Utente admin e capoclan:

```sql
update public.profiles
set roles = array['user', 'admin', 'capoclan']::text[],
    role = 'admin',
    clan_faction_id = 'wolves'
where id = 'USER_ID';
```

## Lettura sessione

La sessione applicativa ora espone anche:

- `session.user.roles`
- `session.user.clanId`
- `session.user.clanName`

Il controllo admin esistente continua a funzionare.
