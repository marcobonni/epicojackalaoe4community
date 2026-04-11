# Setup Login Email/Password Con Supabase

## Variabili frontend

Nel file `.env.local` del frontend:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_REALTIME_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=optional-same-public-key-if-your-project-uses-publishable
TOURNAMENT_ADMIN_KEY=copy-the-same-key-used-by-the-express-backend
ADMIN_EMAILS=admin@example.com
```

## Variabili backend

Nel file `.env` del backend devono restare attive:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TOURNAMENT_ADMIN_KEY=the-same-key-used-on-frontend-server
PORT=8080
```

Il frontend accetta sia `NEXT_PUBLIC_SUPABASE_ANON_KEY` sia `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Email/password in Supabase

1. Apri il progetto Supabase.
2. Vai in `Authentication`.
3. Nella sezione provider verifica che `Email` sia attivo.
4. Tieni abilitata la conferma email, cosi l'utente deve validare davvero l'indirizzo prima di entrare.

## Redirect URL

Nelle impostazioni email di Supabase configura:

```txt
http://localhost:3000/auth/callback
```

In produzione usa il dominio reale, ad esempio:

```txt
https://tuodominio.it/auth/callback
```

## Campi registrazione

La registrazione frontend raccoglie:

- `email`
- `password`
- `steam_name`
- `discord_name`

Questi dati vengono salvati come metadata auth e poi sincronizzati nel profilo torneo.

## Admin

Gli admin del frontend vengono riconosciuti tramite `ADMIN_EMAILS`.

Esempio:

```env
ADMIN_EMAILS=admin1@gmail.com,admin2@gmail.com
```

## Schema torneo

Prima di usare i tornei sul DB reale applica lo script:

[tournament_schema.sql](C:/Users/marco/Desktop/aoe4community-backend/aoe4community-backend/supabase/tournament_schema.sql)
