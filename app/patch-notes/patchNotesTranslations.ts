import type { Locale } from "@/app/lib/i18n-schema";

type RegexRule = {
  pattern: RegExp;
  replace: string | ((...args: string[]) => string);
};

const exactLineTranslations: Partial<Record<Locale, Record<string, string>>> = {
  it: {
    "This civilization does not have dedicated notes in this patch.":
      "Questa civilta non ha note dedicate in questa patch.",
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
  [/\btrain time\b/gi, "tempo di addestramento"],
  [/\bresearch time\b/gi, "tempo di ricerca"],
  [/\bmovement speed\b/gi, "velocita di movimento"],
  [/\bmove speed\b/gi, "velocita di movimento"],
  [/\battack speed\b/gi, "velocita d'attacco"],
  [/\breload time\b/gi, "tempo di ricarica"],
  [/\bgather rate\b/gi, "velocita di raccolta"],
  [/\bresource trickle\b/gi, "flusso di risorse"],
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
    .replace(/\bto\b/gi, "a");

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

export function normalizePatchDisplayLine(line: string) {
  return normalizeLine(line);
}
