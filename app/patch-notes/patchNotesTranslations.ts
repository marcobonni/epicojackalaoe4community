import type { Locale } from "@/app/lib/i18n-schema";

type RegexRule = {
  pattern: RegExp;
  replace: string | ((...args: string[]) => string);
};

const googleTranslateEndpoint = "https://translate.googleapis.com/translate_a/single";
const remoteTranslationChunkSize = 2800;

const exactLineTranslations: Partial<Record<Locale, Record<string, string>>> = {
  it: {
    "This civilization does not have dedicated notes in this patch.":
      "Questa civilta non ha note dedicate in questa patch.",
    "Now has a new widget to indicate progression towards the next tier.":
      "Ora ha un nuovo indicatore per mostrare l'avanzamento verso il livello successivo.",
    "Ongoing...": "In corso...",
    "Ongoingâ€¦": "In corso...",
    "Ongoing…": "In corso...",
  },
  fr: {
    "This civilization does not have dedicated notes in this patch.":
      "Cette civilisation n'a pas de notes dediees dans ce patch.",
  },
  de: {
    "This civilization does not have dedicated notes in this patch.":
      "Diese Zivilisation hat in diesem Patch keine eigenen Notizen.",
  },
  es: {
    "This civilization does not have dedicated notes in this patch.":
      "Esta civilizacion no tiene notas dedicadas en este parche.",
  },
  pl: {
    "This civilization does not have dedicated notes in this patch.":
      "Ta cywilizacja nie ma osobnych notatek w tej latce.",
  },
};

const italianLiteralRules: Array<[RegExp, string]> = [
  [/\bEconomic Wing\b/gi, "Ala economica"],
  [/\bTrade Wing\b/gi, "Ala commerciale"],
  [/\bMilitary Wing\b/gi, "Ala militare"],
  [/\bCulture Wing\b/gi, "Ala culturale"],
  [/\bFeudal Age resources\b/gi, "risorse dell'Eta Feudale"],
  [/\bCastle Age resources\b/gi, "risorse dell'Eta dei Castelli"],
  [/\bImperial Age resources\b/gi, "risorse dell'Eta Imperiale"],
  [/\bon kill effect duration\b/gi, "durata dell'effetto all'uccisione"],
  [/\bbuild time\b/gi, "tempo di costruzione"],
  [/\bproduction time\b/gi, "tempo di produzione"],
  [/\btrain time\b/gi, "tempo di addestramento"],
  [/\bresearch time\b/gi, "tempo di ricerca"],
  [/\bmovement speed\b/gi, "velocita di movimento"],
  [/\bmove speed\b/gi, "velocita di movimento"],
  [/\battack speed\b/gi, "velocita d'attacco"],
  [/\breload time\b/gi, "tempo di ricarica"],
  [/\bgather rate\b/gi, "velocita di raccolta"],
  [/\bresource trickle\b/gi, "flusso di risorse"],
  [/\bbatch size\b/gi, "dimensione del gruppo"],
  [/\bresource\b/gi, "risorsa"],
  [/\bresources\b/gi, "risorse"],
  [/\bhealth\b/gi, "salute"],
  [/\bhitpoints\b/gi, "punti vita"],
  [/\bdamage\b/gi, "danno"],
  [/\bbonus damage\b/gi, "danno bonus"],
  [/\brange\b/gi, "raggio"],
  [/\barmor\b/gi, "armatura"],
  [/\bmelee armor\b/gi, "armatura corpo a corpo"],
  [/\branged armor\b/gi, "armatura a distanza"],
  [/\bcost\b/gi, "costo"],
  [/\bpopulation\b/gi, "popolazione"],
  [/\bseconds\b/gi, "secondi"],
  [/\bsecond\b/gi, "secondo"],
  [/\bWood\b/g, "Legno"],
  [/\bStone\b/g, "Pietra"],
  [/\bGold\b/g, "Oro"],
  [/\bFood\b/g, "Cibo"],
  [/\bFeudal Age\b/gi, "Eta Feudale"],
  [/\bCastle Age\b/gi, "Eta dei Castelli"],
  [/\bImperial Age\b/gi, "Eta Imperiale"],
  [/\bDark Age\b/gi, "Eta Oscura"],
  [/\btechnology\b/gi, "tecnologia"],
  [/\btechnologies\b/gi, "tecnologie"],
  [/\bvillagers\b/gi, "villici"],
  [/\bvillager\b/gi, "villico"],
  [/\boutposts\b/gi, "avamposti"],
  [/\boutpost\b/gi, "avamposto"],
  [/\btown centers\b/gi, "centri cittadini"],
  [/\btown center\b/gi, "centro cittadino"],
  [/\bkeeps\b/gi, "fortezze"],
  [/\bkeep\b/gi, "fortezza"],
  [/\bmosque\b/gi, "moschea"],
  [/\bmadrasah\b/gi, "madrasa"],
  [/\btrader\b/gi, "mercante"],
  [/\btraders\b/gi, "mercanti"],
  [/\bmounted\b/gi, "a cavallo"],
  [/\bGolden Age\b/g, "Eta dell'Oro"],
  [/\bGrand Bazaar\b/g, "Gran Bazar"],
  [/\bSpice Roads\b/g, "Vie delle Spezie"],
  [/\bMarket\b/g, "Mercato"],
  [/\bnext tier\b/gi, "livello successivo"],
  [/\bprogression\b/gi, "avanzamento"],
  [/\bplayer\b/gi, "giocatore"],
  [/\bcollecting\b/gi, "raccogliere"],
  [/\bcollected\b/gi, "raccolto"],
  [/\bcollect\b/gi, "raccogliere"],
  [/\busing\b/gi, "usando"],
  [/\bif\b/gi, "se"],
  [/\balso\b/gi, "anche"],
  [/\bbeen researched\b/gi, "stata ricercata"],
  [/\bhad\b/gi, "era"],
  [/\bthe\b/gi, "il"],
  [/\ba new\b/gi, "un nuovo"],
  [/\bincrease\b/gi, "aumentare"],
  [/\bincreases\b/gi, "aumenta"],
  [/\bincreased\b/gi, "aumentato"],
  [/\breduce\b/gi, "ridurre"],
  [/\breduces\b/gi, "riduce"],
  [/\breduced\b/gi, "ridotto"],
  [/\bdecrease\b/gi, "ridurre"],
  [/\bdecreases\b/gi, "riduce"],
  [/\bdecreased\b/gi, "ridotto"],
];

const italianRegexRules: RegexRule[] = [
  {
    pattern: /^Fixed an exploit where (.+)\.$/i,
    replace: (_full, rest) => `Corretto un exploit per cui ${lowercaseFirst(rest)}.`,
  },
  {
    pattern: /^Fixed an issue where (.+)\.$/i,
    replace: (_full, rest) => `Corretto un problema per cui ${lowercaseFirst(rest)}.`,
  },
  {
    pattern: /^Fixed a bug where (.+)\.$/i,
    replace: (_full, rest) => `Corretto un bug per cui ${lowercaseFirst(rest)}.`,
  },
  {
    pattern: /^Fixed a bug which prevented the player from (.+)\.$/i,
    replace: (_full, rest) => `Corretto un bug che impediva al giocatore di ${lowercaseFirst(rest)}.`,
  },
  {
    pattern: /^(.+?) increased from (.+?) → (.+?)\.$/i,
    replace: (_full, subject, from, to) =>
      `${translateItalianTerms(subject)} aumentato da ${from} → ${to}.`,
  },
  {
    pattern: /^(.+?) decreased from (.+?) → (.+?)\.$/i,
    replace: (_full, subject, from, to) =>
      `${translateItalianTerms(subject)} ridotto da ${from} → ${to}.`,
  },
  {
    pattern: /^(.+?) reduced from (.+?) → (.+?)\.$/i,
    replace: (_full, subject, from, to) =>
      `${translateItalianTerms(subject)} ridotto da ${from} → ${to}.`,
  },
  {
    pattern: /^(.+?) increased by (.+?)\.$/i,
    replace: (_full, subject, amount) =>
      `${translateItalianTerms(subject)} aumentato di ${amount}.`,
  },
  {
    pattern: /^(.+?) decreased by (.+?)\.$/i,
    replace: (_full, subject, amount) =>
      `${translateItalianTerms(subject)} ridotto di ${amount}.`,
  },
  {
    pattern: /^(.+?) reduced by (.+?)\.$/i,
    replace: (_full, subject, amount) =>
      `${translateItalianTerms(subject)} ridotto di ${amount}.`,
  },
  {
    pattern: /^(.+?) now (.+)\.$/i,
    replace: (_full, subject, rest) =>
      `${translateItalianTerms(subject)} ora ${translateItalianTerms(lowercaseFirst(rest))}.`,
  },
  {
    pattern: /^(.+?) no longer (.+)\.$/i,
    replace: (_full, subject, rest) =>
      `${translateItalianTerms(subject)} non ${translateItalianTerms(lowercaseFirst(rest))} piu.`,
  },
];

function lowercaseFirst(value: string) {
  if (!value) return value;
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function normalizeLine(line: string) {
  return line.replace(/^- /, "").trim();
}

function applyRegexRules(value: string, rules: RegexRule[]) {
  for (const rule of rules) {
    if (rule.pattern.test(value)) {
      rule.pattern.lastIndex = 0;
      return value.replace(rule.pattern, rule.replace as never);
    }
  }

  return value;
}

function translateItalianTerms(value: string) {
  let translated = value;

  italianLiteralRules.forEach(([pattern, replacement]) => {
    translated = translated.replace(pattern, replacement);
  });

  translated = translated
    .replace(/\bavailable at\b/gi, "disponibile presso")
    .replace(/\bhigher than intended\b/gi, "piu alto del previsto")
    .replace(/\blower than intended\b/gi, "piu basso del previsto")
    .replace(/\bit was possible to\b/gi, "era possibile")
    .replace(/\bfrom\b/gi, "da")
    .replace(/\bto\b/gi, "a")
    .replace(/\bda il\b/gi, "dal")
    .replace(/\bda la\b/gi, "dalla")
    .replace(/\busando il Gran Bazar tecnologia\b/gi, "usando la tecnologia Gran Bazar");

  return translated;
}

function translateItalianLine(line: string) {
  const exactMatch = exactLineTranslations.it?.[line];
  if (exactMatch) {
    return exactMatch;
  }

  const regexTranslated = applyRegexRules(line, italianRegexRules);
  if (regexTranslated !== line) {
    return translateItalianTerms(regexTranslated);
  }

  return translateItalianTerms(line);
}

export function translatePatchLine(line: string, locale: Locale) {
  const normalizedLine = normalizeLine(line);

  if (locale === "en") {
    return normalizedLine;
  }

  const exactMatch = exactLineTranslations[locale]?.[normalizedLine];
  if (exactMatch) {
    return exactMatch;
  }

  if (locale === "it") {
    return translateItalianLine(normalizedLine);
  }

  return normalizedLine;
}

export async function translatePatchLines(lines: string[], locale: Locale) {
  const normalizedLines = lines.map(normalizeLine);

  if (locale !== "it") {
    return normalizedLines.map((line) => translatePatchLine(line, locale));
  }

  const uniqueLines = [...new Set(normalizedLines)];
  const translatedByLine = new Map<string, string>();
  const linesForRemoteTranslation: string[] = [];

  uniqueLines.forEach((line) => {
    const exactMatch = exactLineTranslations.it?.[line];
    if (exactMatch) {
      translatedByLine.set(line, exactMatch);
      return;
    }

    linesForRemoteTranslation.push(line);
  });

  const remoteTranslations = await translateItalianLinesRemotely(linesForRemoteTranslation);

  linesForRemoteTranslation.forEach((line, index) => {
    translatedByLine.set(line, remoteTranslations[index] ?? translateItalianLine(line));
  });

  return normalizedLines.map((line) => translatedByLine.get(line) ?? translateItalianLine(line));
}

export function normalizePatchDisplayLine(line: string) {
  return normalizeLine(line);
}

async function translateItalianLinesRemotely(lines: string[]) {
  if (lines.length === 0) {
    return [];
  }

  const chunks = chunkLinesForRemoteTranslation(lines);
  const translatedChunks = await Promise.all(
    chunks.map(async (chunk) => {
      try {
        return await translateItalianChunkRemotely(chunk);
      } catch {
        return chunk.map(translateItalianLine);
      }
    })
  );

  return translatedChunks.flat();
}

function chunkLinesForRemoteTranslation(lines: string[]) {
  const chunks: string[][] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;

  lines.forEach((line) => {
    const lineLength = line.length + 1;

    if (currentChunk.length > 0 && currentLength + lineLength > remoteTranslationChunkSize) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentLength = 0;
    }

    currentChunk.push(line);
    currentLength += lineLength;
  });

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

async function translateItalianChunkRemotely(lines: string[]) {
  const params = new URLSearchParams({
    client: "gtx",
    sl: "en",
    tl: "it",
    dt: "t",
    q: lines.join("\n"),
  });

  const response = await fetch(`${googleTranslateEndpoint}?${params.toString()}`, {
    next: { revalidate: 60 * 60 * 24 * 7 },
  });

  if (!response.ok) {
    throw new Error("Failed to translate patch notes.");
  }

  const payload = (await response.json()) as unknown;
  const translatedText = extractGoogleTranslatedText(payload);
  const translatedLines = translatedText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (translatedLines.length !== lines.length) {
    return lines.map(translateItalianLine);
  }

  return translatedLines;
}

function extractGoogleTranslatedText(payload: unknown) {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    throw new Error("Unexpected translation response.");
  }

  return payload[0]
    .map((entry) => {
      if (!Array.isArray(entry) || typeof entry[0] !== "string") {
        return "";
      }

      return entry[0];
    })
    .join("");
}
