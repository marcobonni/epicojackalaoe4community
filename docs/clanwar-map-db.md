# Clan Wars Map DB

La mappa `/clanwars/risiko` ora prova a leggere i dati da Supabase e, se le tabelle non esistono ancora o sono vuote, usa il fallback locale già presente nel progetto.

## Migration

Applica questa migration su Supabase:

`supabase/migrations/20260412_230000_clanwar_risiko_map.sql`

La migration crea e popola:

- `public.clanwar_factions`
- `public.clanwar_territories`
- `public.clanwar_territory_control`

## Cosa finisce nel DB

- fazioni con nome e colori
- territori con `id`, `name`, `short_name`, coordinate assiali `q/r`, `points`, `bonus`, `capital`
- ownership corrente per ogni territorio

## Lettura applicativa

La route [page.tsx](C:/Users/marco/Desktop/aoe4sito/epicojackalaoe4community/app/clanwars/risiko/page.tsx) carica i dati tramite:

- [getRisikoMapData.ts](C:/Users/marco/Desktop/aoe4sito/epicojackalaoe4community/app/clanwars/risiko/getRisikoMapData.ts)

Se Supabase risponde correttamente:

- la mappa usa i dati del DB
- il tabellone punti usa i dati del DB
- owner, punti, capitali e bonus arrivano dal DB

Se Supabase non risponde o il DB non è ancora pronto:

- la pagina continua a funzionare con i dati locali

## File locali che restano utili

- [mapData.ts](C:/Users/marco/Desktop/aoe4sito/epicojackalaoe4community/app/clanwars/risiko/mapData.ts)
  contiene geometria, outline e fallback
- [territoryOwnership.ts](C:/Users/marco/Desktop/aoe4sito/epicojackalaoe4community/app/clanwars/risiko/territoryOwnership.ts)
  resta una base leggibile per confrontare o rigenerare il seed
