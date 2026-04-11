# Deploy Ready Checklist

## 1. Database

Esegui lo script schema nel progetto Supabase:

[tournament_schema.sql](C:/Users/marco/Desktop/aoe4community-backend/aoe4community-backend/supabase/tournament_schema.sql)

Verifica che esistano almeno queste tabelle:

- `profiles`
- `tournaments`
- `tournament_registrations`
- `tournament_matches`

## 2. Supabase Auth

In `Authentication`:

- abilita `Email`
- lascia attiva la conferma email
- imposta `Site URL` sul dominio frontend reale
- aggiungi `Redirect URL` con `https://tuodominio.it/auth/callback`

## 3. Frontend Env

Nel frontend Next.js configura:

```env
NEXT_PUBLIC_BACKEND_URL=https://api.tuodominio.it
NEXT_PUBLIC_REALTIME_URL=https://api.tuodominio.it
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-key
TOURNAMENT_ADMIN_KEY=the-same-secret-used-by-the-backend
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

## 4. Backend Env

Nel backend Express configura:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TOURNAMENT_ADMIN_KEY=the-same-secret-used-by-next-server
ADMIN_EMAILS=admin1@example.com,admin2@example.com
ALLOWED_ORIGINS=https://tuodominio.it,https://www.tuodominio.it
JSON_BODY_LIMIT=200kb
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=120
TRUST_PROXY=true
PORT=8080
```

## 5. Sicurezza Minima Già Implementata

- rotte admin protette sia da `x-admin-key` sia da utente autenticato
- admin valido solo se l'email e nella lista `ADMIN_EMAILS`
- endpoint protetti bloccati se l'email non e verificata
- CORS configurabile via `ALLOWED_ORIGINS`
- rate limiting in-memory sulla API torneo
- header base di hardening su Express
- error boundary frontend nell'area portale

## 6. Verifiche Prima Del Go-Live

- `npm run build` sul frontend
- `node -c routes/tournament-routes.js` sul backend
- registrazione utente reale con conferma email
- login utente
- reset password
- creazione torneo admin
- iscrizione utente al torneo
- generazione bracket
- submit risultato
- conferma risultato

## 7. Raccomandazioni Finali

- ruota i segreti che sono stati esposti durante i test locali
- non esporre mai `SUPABASE_SERVICE_ROLE_KEY` nel frontend
- usa HTTPS sia per frontend sia per backend in produzione
- monitora i log backend su errori `403`, `429` e `500`
