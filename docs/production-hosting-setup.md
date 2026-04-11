# Produzione: Frontend, Backend, Supabase

## Architettura consigliata

- Frontend Next.js: `Vercel`
- Backend Express + Socket.IO: `Render Web Service`
- Database + Auth: `Supabase`

Questa separazione e la piu pulita per il tuo progetto attuale:

- Vercel gestisce bene Next.js
- il backend resta un processo Node persistente
- Supabase continua a fare auth, email confirmation e database

## Domini consigliati

Sostituisci i placeholder con i tuoi domini reali:

- frontend: `https://YOUR_FRONTEND_DOMAIN`
- backend: `https://api.YOUR_FRONTEND_DOMAIN`

Esempio reale:

- frontend: `https://aoe4community.it`
- backend: `https://api.aoe4community.it`

## 1. Frontend su Vercel

Repository / root:

- progetto: [epicojackalaoe4community](C:/Users/marco/Desktop/aoe4sito/epicojackalaoe4community)
- framework: `Next.js`
- build command: default Vercel
- output: default Vercel

Environment variables:

```env
NEXT_PUBLIC_BACKEND_URL=https://api.YOUR_FRONTEND_DOMAIN
NEXT_PUBLIC_REALTIME_URL=https://api.YOUR_FRONTEND_DOMAIN
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLIC_KEY
TOURNAMENT_ADMIN_KEY=YOUR_LONG_RANDOM_ADMIN_SECRET
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

Note:

- `TOURNAMENT_ADMIN_KEY` non e `NEXT_PUBLIC`, quindi resta lato server Next.js
- se il tuo progetto Supabase mostra `publishable key`, puoi usare anche quella

## 2. Backend su Render

Repository / root:

- progetto backend: `C:\Users\marco\Desktop\aoe4community-backend\aoe4community-backend`
- tipo servizio: `Web Service`
- runtime: `Node`
- build command: `npm install`
- start command: `npm start`

Environment variables:

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
TOURNAMENT_ADMIN_KEY=YOUR_LONG_RANDOM_ADMIN_SECRET
ADMIN_EMAILS=admin1@example.com,admin2@example.com
ALLOWED_ORIGINS=https://YOUR_FRONTEND_DOMAIN,https://www.YOUR_FRONTEND_DOMAIN
JSON_BODY_LIMIT=200kb
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=120
TRUST_PROXY=true
```

Note:

- su Render `PORT` viene gestita automaticamente
- se non usi `www`, togli la seconda origin
- `TOURNAMENT_ADMIN_KEY` deve essere identica a quella del frontend

## 3. Supabase Auth

Nel progetto Supabase:

### Authentication > Providers

- abilita `Email`
- lascia attivo `Confirm email`

### Authentication > URL Configuration

Imposta:

- `Site URL` = `https://YOUR_FRONTEND_DOMAIN`

Redirect URLs:

- `https://YOUR_FRONTEND_DOMAIN/auth/callback`
- `http://localhost:3000/**`
- opzionale per preview Vercel:
  - `https://*-YOUR_VERCEL_TEAM.vercel.app/**`

## 4. Schema database

Prima del go-live esegui lo script:

[tournament_schema.sql](C:/Users/marco/Desktop/aoe4community-backend/aoe4community-backend/supabase/tournament_schema.sql)

## 5. Ordine corretto di deploy

1. Applica schema Supabase
2. Configura Supabase Auth
3. Deploy backend su Render
4. Prendi il dominio backend Render
5. Inserisci quel dominio nelle env del frontend su Vercel
6. Deploy frontend su Vercel
7. Aggiorna `Site URL` e `Redirect URLs` finali in Supabase
8. Test finale end-to-end

## 6. Test finale

Verifica in produzione:

1. registrazione account
2. conferma email
3. login
4. recupero password
5. accesso dashboard
6. creazione torneo admin
7. iscrizione utente
8. generazione bracket
9. submit risultato
10. conferma risultato

## 7. Segreti da ruotare

Prima del deploy finale ruota questi segreti se sono stati esposti nei test:

- `TWITCH_CLIENT_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TOURNAMENT_ADMIN_KEY`

## Fonti ufficiali

- [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Render Web Services](https://render.com/docs/web-services)
- [Render WebSockets](https://render.com/docs/websocket)
- [Supabase Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
