# Sistema Tornei Automatico

## Obiettivo

Costruire un sistema torneo con due ruoli principali:

- `standard user`: si registra, entra nei tornei, vede il proprio percorso, segnala risultati e conferma partite.
- `admin`: crea e gestisce i tornei, definisce regole e puo intervenire manualmente su iscrizioni, seeding e risultati.

## Esperienza utente standard

### Login e home personale

La home utente deve mostrare subito:

- torneo o tornei a cui e iscritto
- prossima partita assegnata
- avversario della prossima partita
- stato della partita: `da giocare`, `risultato inviato`, `in attesa di conferma`, `contestata`, `risolta`
- scadenza entro cui giocare o confermare
- notifiche importanti

### Pagina torneo

Ogni utente deve poter aprire il torneo e vedere:

- tabellone aggiornato in tempo reale
- round corrente
- storico delle partite giocate
- dettagli torneo
- regole e formato
- elenco partecipanti
- propria posizione nel bracket o nel girone

### Flusso risultato partita

Flusso consigliato:

1. Un giocatore apre la pagina partita.
2. Inserisce il risultato.
3. Facoltativamente allega prova: screenshot, replay, link stream.
4. Il sistema notifica l'altro giocatore.
5. L'altro giocatore puo:
   - confermare
   - rifiutare
   - aprire contestazione
6. Se confermato, il match si chiude.
7. Il bracket si aggiorna in automatico e genera il match successivo.
8. Se contestato, entra in coda admin.

### Azioni disponibili per lo standard user

- iscriversi a un torneo aperto
- ritirarsi prima dell'inizio se permesso
- vedere avversario successivo
- proporre orario partita
- inserire risultato
- confermare o contestare il risultato ricevuto
- vedere storico personale nel torneo

## Esperienza admin

### Dashboard admin

L'admin deve avere una dashboard con:

- lista tornei
- stato di ogni torneo
- numero iscritti
- partite aperte
- partite in contestazione
- partite da assegnare o avanzare
- filtri per stato e formato

### Poteri admin

- creare torneo
- modificare torneo prima dell'avvio
- aggiungere o rimuovere giocatori manualmente
- approvare iscrizioni se il torneo non e pubblico
- decidere seed manuali
- generare bracket
- forzare vittoria o sconfitta
- risolvere contestazioni
- chiudere, annullare, riaprire un match
- avanzare o rollback di un round se necessario
- pubblicare annunci o note torneo

## Modello dati consigliato

Entita minime:

- `users`
- `roles`
- `tournaments`
- `tournament_stages`
- `registrations`
- `participants`
- `rounds`
- `matches`
- `match_games`
- `match_reports`
- `disputes`
- `notifications`
- `audit_logs`

Campi importanti del torneo:

- nome
- slug
- descrizione
- stato
- formato
- modalita iscrizione
- dimensione massima
- seed mode
- check-in richiesto
- struttura round
- regole match
- policy no-show
- policy conferma risultati
- visibilita
- premi

## Stati principali

### Stato torneo

- `draft`
- `registration_open`
- `check_in`
- `seeding`
- `live`
- `paused`
- `completed`
- `cancelled`

### Stato match

- `pending`
- `ready`
- `scheduled`
- `result_submitted`
- `awaiting_confirmation`
- `disputed`
- `admin_review`
- `completed`
- `forfeited`
- `cancelled`

## Opzioni di creazione torneo

### 1. Formato torneo

Opzioni utili:

- `single elimination`
- `double elimination`
- `round robin`
- `swiss`
- `groups + playoff`
- `league season`
- `ladder/challenge`
- `king of the hill`
- `gsl group`

### 2. Modalita partecipazione

- `public`: chiunque si iscrive finche ci sono slot
- `approval based`: l'admin approva le iscrizioni
- `invite only`: solo utenti invitati
- `manual roster`: solo admin inserisce i giocatori
- `hybrid`: iscrizione pubblica + wildcard admin

### 3. Tipo partecipante

- `1v1`
- `2v2`
- `team based`
- `solo con sostituti`

### 4. Seeding

- `random`
- `manual`
- `ranking based`
- `previous season based`
- `protected seeding` per evitare match iniziali tra clan o regioni simili

### 5. Dimensione torneo

- bracket fisso: 4, 8, 16, 32, 64
- bracket flessibile con bye automatici
- limite minimo per avvio
- lista attesa

### 6. Regole del match

- `bo1`
- `bo3`
- `bo5`
- `bo7`
- map pool fisso
- map veto
- side pick
- civilta limitate o libere
- regole remake
- timeout massimo per giocare

### 7. Gestione iscrizioni

- apertura e chiusura iscrizioni
- check-in obbligatorio
- auto rimozione dei non confermati
- lista d'attesa con promozione automatica

### 8. Gestione risultati

- auto conferma se entrambi inviano lo stesso risultato
- conferma a due step: un utente invia, l'altro approva
- prova obbligatoria o facoltativa
- timeout di conferma
- auto escalation ad admin
- override admin sempre disponibile

### 9. Scheduling

- match con scadenza round
- match con slot orario
- scheduling libero tra i due utenti
- deadline con reminder automatici

### 10. Tie-breaker

Per round robin, swiss e gironi:

- scontri diretti
- differenza mappe
- differenza punti
- buchholz
- spareggio extra
- seed iniziale come ultimo criterio

### 11. Visibilita

- pubblico sul sito
- visibile solo agli iscritti
- nascosto fino alla pubblicazione

### 12. Premi e avanzamento

- premi top 3
- badge profilo
- punti classifica
- qualificazione a torneo successivo

## Flusso automatico consigliato

1. Admin crea il torneo.
2. Sceglie formato, capienza, regole match e modalita iscrizione.
3. Gli utenti si iscrivono o vengono aggiunti.
4. Il check-in chiude la lista finale.
5. Il sistema genera seeding e bracket.
6. Ogni utente vede in home il prossimo avversario.
7. Dopo il match, un utente inserisce il risultato.
8. L'altro conferma o contesta.
9. Alla conferma, il sistema aggiorna bracket, round e home di entrambi.
10. In caso di disputa, l'admin decide.

## MVP consigliato

Per partire bene senza complicare troppo:

- login con ruoli `user` e `admin`
- un solo formato iniziale: `single elimination`
- tornei solo `1v1`
- seeding `manual` o `random`
- risultato con conferma a due step
- override admin
- dashboard utente con prossimo avversario
- pagina torneo con bracket, stato e storico match
- notifiche base in app

## Fase 2 consigliata

- double elimination
- round robin
- check-in automatico
- screenshot/replay obbligatori
- dispute center admin
- scheduling e reminder
- lista attesa

## Fase 3 consigliata

- swiss
- gruppi + playoff
- team tournaments
- punti ranking stagionali
- premi e qualificazioni
- notifiche email o Discord

## Scelta pratica consigliata per questo progetto

Visto che il progetto attuale e un frontend Next.js senza area auth e senza backend torneo, la base migliore da costruire e:

1. autenticazione con ruoli
2. database relazionale
3. modello dati torneo e match
4. dashboard utente
5. dashboard admin
6. motore di avanzamento bracket

## Decisione migliore per partire

Se vuoi un sistema stabile e veloce da sviluppare, la combinazione piu sensata per la prima versione e:

- `1v1`
- `single elimination`
- `manual or random seeding`
- `public o approval based signup`
- `bo3`
- `dual confirmation result flow`
- `admin dispute resolution`

Questa versione copre il flusso che hai descritto e prepara bene il terreno per aggiungere gli altri formati dopo.
