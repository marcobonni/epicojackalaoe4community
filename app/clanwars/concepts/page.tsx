import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Concept Mappe Clan Wars | AoE4 Community Italia",
  description:
    "Quattro concept per la mappa interattiva Clan Wars: regioni reali, territori custom, macro-aree e board game fantasy.",
};

type Territory = {
  id: string;
  label: string;
  fill: string;
  points: string;
  modifier: string;
};

type Concept = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  vibe: string;
  strengths: string[];
  territories: Territory[];
};

const clanPalette = {
  wolves: "#d84b45",
  lions: "#f0b64f",
  ravens: "#4c79d8",
  neutral: "#344257",
};

const baseItalyOutline =
  "M280 28 L318 44 L336 76 L330 108 L356 135 L390 160 L383 192 L397 225 L365 250 L354 292 L337 330 L308 362 L296 398 L274 432 L246 470 L238 512 L220 546 L188 566 L156 560 L142 530 L147 488 L165 454 L169 421 L157 397 L133 373 L125 337 L141 300 L154 270 L178 246 L196 216 L215 178 L237 144 L254 108 L261 72 Z";

const concepts: Concept[] = [
  {
    slug: "regioni-reali",
    eyebrow: "Concept 01",
    title: "Italia divisa per regioni reali",
    description:
      "La penisola resta immediatamente riconoscibile: ogni area corrisponde a una regione e diventa leggibile anche per chi entra per la prima volta.",
    vibe: "Chiaro, istituzionale, facilissimo da capire per la community.",
    strengths: [
      "Perfetto per un MVP veloce e leggibile.",
      "Ogni territorio ha già un nome familiare.",
      "Molto semplice da spiegare in stream e su Discord.",
    ],
    territories: [
      {
        id: "valle-aosta",
        label: "Valle d'Aosta",
        fill: clanPalette.lions,
        modifier: "Mappa forzata: Dry Arabia",
        points: "252,82 280,65 284,101 250,110",
      },
      {
        id: "nord-ovest",
        label: "Piemonte/Liguria",
        fill: clanPalette.wolves,
        modifier: "Ban civ: English",
        points: "221,101 286,104 278,160 235,183 201,154",
      },
      {
        id: "lombardia",
        label: "Lombardia",
        fill: clanPalette.ravens,
        modifier: "Bonus difesa +1 veto",
        points: "287,99 332,114 321,158 279,161",
      },
      {
        id: "triveneto",
        label: "Triveneto",
        fill: clanPalette.lions,
        modifier: "Mappa scelta: Four Lakes",
        points: "331,77 379,101 361,161 321,159 334,117",
      },
      {
        id: "emilia",
        label: "Emilia-Romagna",
        fill: clanPalette.wolves,
        modifier: "No water maps",
        points: "245,183 360,164 346,197 259,210",
      },
      {
        id: "centro",
        label: "Toscana/Umbria/Marche",
        fill: clanPalette.neutral,
        modifier: "Territorio neutrale",
        points: "227,212 347,198 333,261 257,271 213,244",
      },
      {
        id: "lazio-abruzzo",
        label: "Lazio/Abruzzo/Molise",
        fill: clanPalette.ravens,
        modifier: "Ban civ: Mongols",
        points: "214,245 333,262 306,313 230,322 199,286",
      },
      {
        id: "sud",
        label: "Campania/Puglia/Basilicata",
        fill: clanPalette.wolves,
        modifier: "Mappa scelta: Lipany",
        points: "199,286 308,314 292,381 221,396 173,344",
      },
      {
        id: "calabria",
        label: "Calabria",
        fill: clanPalette.ravens,
        modifier: "Bo5 obbligatorio",
        points: "221,396 293,382 265,475 216,512 190,468",
      },
      {
        id: "isole",
        label: "Sicilia e Sardegna",
        fill: clanPalette.lions,
        modifier: "Ban civ: Rus",
        points: "102,463 144,436 159,485 120,510 58,552 155,550 211,547 228,582 196,617 119,607 86,581",
      },
    ],
  },
  {
    slug: "territori-custom",
    eyebrow: "Concept 02",
    title: "Territori custom competitivi",
    description:
      "La silhouette italiana resta sullo sfondo, ma le zone sono ridisegnate per creare fronti sensati, connessioni bilanciate e partite più interessanti.",
    vibe: "Più game design, meno geografia scolastica.",
    strengths: [
      "Libertà totale per bilanciare attacco e difesa.",
      "Ogni confine può essere pensato per il meta AoE4.",
      "Ideale se vuoi una stagione lunga con vera strategia.",
    ],
    territories: [
      {
        id: "alpino",
        label: "Bastione Alpino",
        fill: clanPalette.ravens,
        modifier: "Difesa fortificata",
        points: "231,88 323,59 371,111 346,165 259,162",
      },
      {
        id: "tirreno-nord",
        label: "Tirreno Nord",
        fill: clanPalette.wolves,
        modifier: "Ban civ: French",
        points: "192,145 258,162 245,242 184,241 158,192",
      },
      {
        id: "adriatico-nord",
        label: "Adriatico Nord",
        fill: clanPalette.lions,
        modifier: "Mappa: Golden Pit",
        points: "257,163 347,165 338,242 245,242",
      },
      {
        id: "cuore",
        label: "Cuore Imperiale",
        fill: clanPalette.neutral,
        modifier: "Senza bonus",
        points: "184,241 339,242 315,320 210,320 183,281",
      },
      {
        id: "corridor",
        label: "Corridoio Appenninico",
        fill: "#5f4bbd",
        modifier: "Ban civ: Delhi",
        points: "210,321 314,321 291,398 228,415 196,372",
      },
      {
        id: "tallone",
        label: "Tallone del Sud",
        fill: clanPalette.wolves,
        modifier: "Bo3 rapido",
        points: "314,322 292,400 261,469 232,439 241,387",
      },
      {
        id: "punta",
        label: "Punta della Penisola",
        fill: clanPalette.ravens,
        modifier: "King's Palace only",
        points: "198,371 229,415 218,510 183,554 149,520 163,454",
      },
      {
        id: "isole",
        label: "Arcipelaghi",
        fill: clanPalette.lions,
        modifier: "Ban civ: Byzantines",
        points: "66,470 132,442 155,487 119,520 89,563 145,554 224,551 218,594 161,618 98,602 79,575",
      },
    ],
  },
  {
    slug: "macro-aree",
    eyebrow: "Concept 03",
    title: "Macro-aree leggibili",
    description:
      "Pochi territori, fronti grandi e identità pulita. La mappa è meno dettagliata ma molto più leggibile da mobile e in live stream.",
    vibe: "Diretta, elegante, facile da seguire durante eventi e guerre lampo.",
    strengths: [
      "Pochi territori = onboarding immediato.",
      "Ottima leggibilità su telefono.",
      "Molto adatta a stagioni brevi o eventi weekend.",
    ],
    territories: [
      {
        id: "north",
        label: "Nord",
        fill: clanPalette.lions,
        modifier: "Map pool alpino",
        points: "214,63 372,68 391,181 188,182",
      },
      {
        id: "center-west",
        label: "Centro Ovest",
        fill: clanPalette.wolves,
        modifier: "Ban civ: Abbasid",
        points: "184,182 293,182 285,319 170,311",
      },
      {
        id: "center-east",
        label: "Centro Est",
        fill: clanPalette.ravens,
        modifier: "Mappa scelta: Frisian Marshes",
        points: "294,182 390,181 336,319 286,320",
      },
      {
        id: "south",
        label: "Sud",
        fill: clanPalette.neutral,
        modifier: "Zona contesa",
        points: "171,312 336,319 279,475 196,515 145,422",
      },
      {
        id: "islands",
        label: "Isole",
        fill: "#5f4bbd",
        modifier: "Ban civ: Ottoman",
        points: "68,455 161,434 165,484 128,515 83,566 168,545 236,545 231,585 171,616 110,602 81,579",
      },
    ],
  },
  {
    slug: "board-game",
    eyebrow: "Concept 04",
    title: "Board game fantasy",
    description:
      "Qui la mappa smette di sembrare una carta politica e diventa un teatro di guerra: territori più netti, nomi evocativi e forte identità visiva.",
    vibe: "Più epico, più evento, più memorabile.",
    strengths: [
      "Visivamente la più forte.",
      "Perfetta per stream, promo e stagioni narrative.",
      "Trasforma il sito in una vera campagna strategica.",
    ],
    territories: [
      {
        id: "crown",
        label: "Corona del Nord",
        fill: clanPalette.lions,
        modifier: "Reliquia contesa",
        points: "222,92 316,44 388,110 342,168 252,163",
      },
      {
        id: "forge",
        label: "Forgia Tirrenica",
        fill: clanPalette.wolves,
        modifier: "Ban civ: HRE",
        points: "179,162 252,163 243,251 183,252 151,207",
      },
      {
        id: "marsh",
        label: "Marche del Sale",
        fill: clanPalette.ravens,
        modifier: "Mappa: Dry Arabia",
        points: "243,164 342,168 333,249 244,251",
      },
      {
        id: "spire",
        label: "Spina Appennina",
        fill: "#5f4bbd",
        modifier: "No siege start",
        points: "184,252 332,250 308,349 214,353 183,317",
      },
      {
        id: "heel",
        label: "Tallone del Re",
        fill: clanPalette.lions,
        modifier: "Bo5 finale",
        points: "308,250 350,253 321,362 278,396 253,347",
      },
      {
        id: "ash",
        label: "Terre di Cenere",
        fill: clanPalette.wolves,
        modifier: "Ban civ: Malians",
        points: "214,354 278,396 250,485 204,539 168,509 176,431",
      },
      {
        id: "deep",
        label: "Isole del Profondo",
        fill: clanPalette.ravens,
        modifier: "Mappa: Archipelago",
        points: "71,470 142,438 161,489 118,520 86,563 160,548 222,545 232,586 171,620 108,603 78,578",
      },
    ],
  },
];

function TerritoryChip({ territory }: { territory: Territory }) {
  return (
    <div className="rounded-full border border-white/12 bg-white/6 px-3 py-2 text-xs text-slate-200">
      <span className="font-semibold text-white">{territory.label}</span>
      <span className="ml-2 text-slate-400">{territory.modifier}</span>
    </div>
  );
}

function MapPreview({
  territories,
  title,
}: {
  territories: Territory[];
  title: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_rgba(9,13,24,0)_38%),linear-gradient(180deg,_rgba(17,24,39,0.96),_rgba(4,9,18,0.98))] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_45%,rgba(255,255,255,0.04)_100%)]" />
      <svg
        viewBox="0 0 460 660"
        className="relative z-10 h-auto w-full"
        role="img"
        aria-label={title}
      >
        <defs>
          <filter id="mapShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000814" floodOpacity="0.5" />
          </filter>
        </defs>

        <path
          d={baseItalyOutline}
          fill="#0f172a"
          stroke="rgba(226,232,240,0.18)"
          strokeWidth="8"
          filter="url(#mapShadow)"
        />

        {territories.map((territory) => (
          <g key={territory.id}>
            <polygon
              points={territory.points}
              fill={territory.fill}
              stroke="rgba(248,250,252,0.42)"
              strokeWidth="4"
              strokeLinejoin="round"
              className="transition duration-300 hover:brightness-110"
            />
          </g>
        ))}

        <circle cx="115" cy="583" r="22" fill="rgba(255,255,255,0.08)" />
        <circle cx="155" cy="595" r="11" fill="rgba(255,255,255,0.05)" />
      </svg>
    </div>
  );
}

export default function ClanWarsConceptsPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <section className="relative overflow-hidden border-b border-white/8 bg-[radial-gradient(circle_at_top,_rgba(86,123,255,0.18),_rgba(5,8,22,0)_36%),linear-gradient(180deg,_#09101f_0%,_#050816_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
        <div className="relative mx-auto max-w-7xl px-6 py-18 sm:px-8 lg:px-10 lg:py-24">
          <p className="text-sm uppercase tracking-[0.32em] text-[#9fb6ff]">
            Clan Wars Concepts
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Quattro modi diversi di trasformare l&apos;Italia in una campagna di conquista AoE4.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            Ho preparato quattro direzioni visive già leggibili dentro il sito:
            una più realistica, una più competitiva, una super accessibile e una
            più epica da evento. Possiamo sceglierne una oppure fonderne due.
          </p>

          <div className="mt-10 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-[#d84b45]/35 bg-[#d84b45]/12 px-4 py-2 text-[#ffb7b3]">
              Clan Lupi
            </span>
            <span className="rounded-full border border-[#f0b64f]/35 bg-[#f0b64f]/12 px-4 py-2 text-[#ffe0a1]">
              Clan Leoni
            </span>
            <span className="rounded-full border border-[#4c79d8]/35 bg-[#4c79d8]/12 px-4 py-2 text-[#c9d8ff]">
              Clan Corvi
            </span>
            <span className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-slate-300">
              Viola = territorio speciale / evento
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="grid gap-10">
          {concepts.map((concept) => (
            <article
              key={concept.slug}
              className="grid gap-8 rounded-[2.25rem] border border-white/8 bg-white/[0.03] p-5 backdrop-blur-sm sm:p-7 xl:grid-cols-[1.05fr_0.95fr]"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
                  {concept.eyebrow}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {concept.title}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                  {concept.description}
                </p>

                <div className="mt-6 rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                    Vibe
                  </p>
                  <p className="mt-3 text-lg text-slate-100">{concept.vibe}</p>
                </div>

                <div className="mt-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                    Perché funziona
                  </p>
                  <div className="mt-4 space-y-3">
                    {concept.strengths.map((strength) => (
                      <div
                        key={strength}
                        className="rounded-[1.2rem] border border-white/8 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-slate-200"
                      >
                        {strength}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {concept.territories.slice(0, 5).map((territory) => (
                    <TerritoryChip key={territory.id} territory={territory} />
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <MapPreview territories={concept.territories} title={concept.title} />

                <div className="mt-5 rounded-[1.6rem] border border-white/8 bg-[#0a1020] p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                    Lettura rapida
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Territori
                      </span>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {concept.territories.length}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Uso ideale
                      </span>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        {concept.slug === "regioni-reali" && "MVP e leggibilità immediata"}
                        {concept.slug === "territori-custom" && "Competizione bilanciata"}
                        {concept.slug === "macro-aree" && "Eventi rapidi e mobile"}
                        {concept.slug === "board-game" && "Stagioni narrative e stream"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
