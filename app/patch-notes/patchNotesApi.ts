import {
  civilizationDefinitions,
  getCivilizationBannerSrc,
  type CivilizationDefinition,
  type CivilizationId,
  type CivilizationPatchEntry,
  type PatchArchiveItem,
  type PatchBannerState,
  type PatchDetail,
} from "@/app/patch-notes/patchNotesData";

type WordPressRendered = {
  rendered?: string;
};

type WordPressPostListItem = {
  slug: string;
  link: string;
  date: string;
  title: WordPressRendered;
};

type WordPressPostDetail = WordPressPostListItem & {
  content: WordPressRendered;
};

const AOE4_RELEASES_API =
  "https://www.ageofempires.com/wp-json/wp/v2/posts?game=164&categories=36&per_page=100&_fields=slug,link,date,title";

const AOE4_POST_BY_SLUG_API =
  "https://www.ageofempires.com/wp-json/wp/v2/posts?per_page=1&_fields=slug,link,date,title,content&slug=";

const PATCH_TITLE_PATTERN =
  /(?:patch|update|hotfix|server-side patch|season .* patch|season .* update|minor patch|season one update)/i;

const EXCLUDED_PATCH_TITLE_PATTERN =
  /(pre-order|available now|everything in the expansion|public update preview|pup available|event|deep dive|rundown|what'?s coming|celebrating|corrections coming|content preview)/i;

const MAJOR_SECTION_PATTERN =
  /^(build spotlight|general|gameplay|balance|balance & bugfixes|maps|mods|ai|ui|ux\/ui|general fixes|controls|campaign|ongoing|what'?s next|localization|release notes|download on|season|event|investigation|known issues|civilization-specific changes|civilization balance and bugfixes|civilization specific changes|civilization improvements|balance - civilization specific|all civilizations)$/i;

const CIVILIZATION_NOTES_SECTION_PATTERN =
  /^(civilization-specific changes|civilization balance and bugfixes|civilization specific changes|civilization improvements|balance - civilization specific)$/i;

const GENERAL_CHANGES_SECTION_PATTERN =
  /^(general changes & bugfixes|general changes and bugfixes|general changes|general bugfixes|general fixes)$/i;

const GENERAL_CHANGES_STOP_SECTION_PATTERN =
  /^(design update\/rework|balance and gameplay changes(?: \(all civilizations\))?|civilization-specific changes|civilization balance and bugfixes|civilization specific changes|civilization improvements|balance - civilization specific|all civilizations|maps|ongoing|what'?s on the horizon|what'?s next|build spotlight|gameplay|ai update|hotkeys|ux\/ui.*|localization|investigation|known issues)$/i;

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(value: string) {
  return decodeHtmlEntities(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|figure|blockquote|ul|ol|table|tr|h1|h2|h3|h4|h5|h6)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeTitle(renderedTitle: string) {
  return decodeHtmlEntities(renderedTitle).replace(/\s+/g, " ").trim();
}

function formatPublishedAt(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function isPatchReleasePost(post: WordPressPostListItem) {
  const title = normalizeTitle(post.title.rendered ?? "");
  return PATCH_TITLE_PATTERN.test(title) && !EXCLUDED_PATCH_TITLE_PATTERN.test(title);
}

function getPatchPriority(title: string) {
  const lowerTitle = title.toLowerCase();

  if (!lowerTitle.includes("preview") && !lowerTitle.includes("now live") && !lowerTitle.includes("live!")) {
    return 0;
  }

  if (lowerTitle.includes("preview")) {
    return 1;
  }

  return 2;
}

function getVersionKey(title: string, slug: string) {
  const titleVersion = title.match(/\b\d+(?:\.\d+)+(?:\.\d+)?\b/);
  if (titleVersion) return titleVersion[0];

  const slugVersion = slug.match(/\b\d+(?:-\d+)+(?:-\d+)?\b/);
  if (slugVersion) return slugVersion[0];

  return slug;
}

function toArchiveItem(post: WordPressPostListItem): PatchArchiveItem {
  const title = normalizeTitle(post.title.rendered ?? "");
  const versionMatch = title.match(/\b\d+(?:\.\d+)+(?:\.\d+)?\b/);
  const versionLabel = versionMatch
    ? versionMatch[0]
    : title.replace(/^Age of Empires IV\s+[–-]\s+/i, "");

  return {
    slug: post.slug,
    title,
    url: post.link,
    publishedAt: formatPublishedAt(post.date),
    versionLabel,
    sourceLabel: "Age of Empires Official",
  };
}

function splitIntoLines(renderedHtml: string) {
  return stripTags(renderedHtml)
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function normalizeForComparison(value: string) {
  return value
    .toLowerCase()
    .replace(/\u2019/g, "'")
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9&' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchCivilizations(line: string) {
  const normalizedLine = normalizeForComparison(line);

  return civilizationDefinitions.filter((civilization) =>
    civilization.aliases.some((alias) => {
      const normalizedAlias = normalizeForComparison(alias);

      return (
        normalizedLine === normalizedAlias ||
        normalizedLine.startsWith(`${normalizedAlias} (`) ||
        normalizedLine.startsWith(`${normalizedAlias} & `) ||
        normalizedLine.startsWith(`${normalizedAlias} and `) ||
        normalizedLine.includes(` ${normalizedAlias} & `) ||
        normalizedLine.includes(` ${normalizedAlias} and `) ||
        normalizedLine === normalizedAlias.replace("holy roman empire", "hre")
      );
    })
  );
}

function appendLines(
  map: Map<CivilizationId, string[]>,
  ids: CivilizationId[],
  line: string
) {
  ids.forEach((id) => {
    const current = map.get(id) ?? [];
    current.push(line);
    map.set(id, current);
  });
}

function extractCivilizationNotes(renderedHtml: string) {
  const lines = splitIntoLines(renderedHtml);
  const notesByCivilization = new Map<CivilizationId, string[]>();
  const hasDedicatedCivilizationSection = lines.some((line) =>
    CIVILIZATION_NOTES_SECTION_PATTERN.test(line)
  );
  let isCivilizationNotesSectionActive = !hasDedicatedCivilizationSection;
  let currentCivilizations: CivilizationDefinition[] = [];

  lines.forEach((line) => {
    if (CIVILIZATION_NOTES_SECTION_PATTERN.test(line)) {
      isCivilizationNotesSectionActive = true;
      currentCivilizations = [];
      return;
    }

    if (
      hasDedicatedCivilizationSection &&
      isCivilizationNotesSectionActive &&
      MAJOR_SECTION_PATTERN.test(line) &&
      !CIVILIZATION_NOTES_SECTION_PATTERN.test(line)
    ) {
      isCivilizationNotesSectionActive = false;
      currentCivilizations = [];
      return;
    }

    if (!isCivilizationNotesSectionActive) {
      return;
    }

    const matchedCivilizations = matchCivilizations(line);

    if (matchedCivilizations.length > 0 && !line.startsWith("- ")) {
      currentCivilizations = matchedCivilizations;
      return;
    }

    if (MAJOR_SECTION_PATTERN.test(line)) {
      currentCivilizations = [];
      return;
    }

    if (currentCivilizations.length > 0) {
      appendLines(
        notesByCivilization,
        currentCivilizations.map((civilization) => civilization.id),
        line
      );
      return;
    }

    if (line.startsWith("- ")) {
      const fallbackMatches = matchCivilizations(line);
      if (fallbackMatches.length > 0) {
        appendLines(
          notesByCivilization,
          fallbackMatches.map((civilization) => civilization.id),
          line
        );
      }
    }
  });

  return notesByCivilization;
}

function extractGeneralChanges(renderedHtml: string) {
  const lines = splitIntoLines(renderedHtml);
  const generalChanges: string[] = [];
  let isGeneralChangesSectionActive = false;

  lines.forEach((line) => {
    if (GENERAL_CHANGES_SECTION_PATTERN.test(line)) {
      isGeneralChangesSectionActive = true;
      return;
    }

    if (!isGeneralChangesSectionActive) {
      return;
    }

    if (GENERAL_CHANGES_STOP_SECTION_PATTERN.test(line)) {
      isGeneralChangesSectionActive = false;
      return;
    }

    if (line.startsWith("- ")) {
      generalChanges.push(line);
    }
  });

  return generalChanges;
}

function buildCivilizationEntries(
  notesByCivilization: Map<CivilizationId, string[]>
): CivilizationPatchEntry[] {
  return civilizationDefinitions.map((civilization) => {
    const officialText = notesByCivilization.get(civilization.id) ?? [];
    const hasOfficialText = officialText.length > 0;
    const state = classifyPatchState(officialText, hasOfficialText);

    return {
      id: civilization.id,
      name: civilization.name,
      bannerSrc: getCivilizationBannerSrc(civilization.id),
      state,
      hasOfficialEntry: hasOfficialText,
      subtitle: hasOfficialText
        ? "This civilization has dedicated notes in this patch."
        : "This civilization does not have dedicated notes in this patch.",
      officialText: hasOfficialText
        ? officialText
        : ["This civilization does not have dedicated notes in this patch."],
    };
  });
}

function classifyPatchState(
  officialText: string[],
  hasOfficialText: boolean
): PatchBannerState {
  if (!hasOfficialText) {
    return "none";
  }

  const joinedText = officialText.join(" ").toLowerCase();

  const impact = officialText.reduce(
    (score, line) => {
      const lineImpact = classifyPatchLineImpact(line);
      score.buff += lineImpact.buff;
      score.nerf += lineImpact.nerf;
      score.rework += lineImpact.rework;
      return score;
    },
    { buff: 0, nerf: 0, rework: 0 }
  );

  if (
    [
      "rework",
      "reworked",
      "redesigned",
      "revamped",
      "overhauled",
      "replaced",
      "changed to",
      "changed from",
      "converted",
      "renamed",
      "rebalance",
      "rebalanced",
      "instead",
    ].some((signal) => joinedText.includes(signal))
  ) {
    impact.rework += 2;
  }

  if (
    [
      "reworked",
      "redesigned",
      "revamped",
      "overhauled",
      "changed from",
      "changed to",
    ].some((signal) => joinedText.includes(signal))
  ) {
    return "rework";
  }

  if (impact.buff > impact.nerf && impact.buff > impact.rework) {
    return "buff";
  }

  if (impact.nerf > impact.buff && impact.nerf > impact.rework) {
    return "nerf";
  }

  if (impact.rework > 0 || (impact.buff > 0 && impact.nerf > 0)) {
    return "rework";
  }

  return "rework";
}

function classifyPatchLineImpact(line: string) {
  const text = line.replace(/^- /, "").toLowerCase();
  const score = { buff: 0, nerf: 0, rework: 0 };

  const buffSignals = [
    "trained instantly",
    "improved",
    "more accurately",
    "now correctly grants",
    "now properly works",
    "now benefit",
    "would not benefit",
    "now produces",
    "now grants",
    "now increases",
    "spawns an extra",
    "can now",
    "immediately",
  ];

  const nerfSignals = [
    "fixed an exploit",
    "higher than intended",
    "larger than intended",
    "more than intended",
    "less likely",
    "more slowly",
    "no longer receives",
    "no longer grants",
    "can no longer",
    "removed",
  ];

  const reworkSignals = [
    "reworked",
    "replaced",
    "instead",
    "changed from",
    "changed to",
    "moved from",
    "moved to",
    "now generated",
  ];

  if (buffSignals.some((signal) => text.includes(signal))) {
    score.buff += 1;
  }

  if (nerfSignals.some((signal) => text.includes(signal))) {
    score.nerf += 1;
  }

  if (reworkSignals.some((signal) => text.includes(signal))) {
    score.rework += 1;
  }

  if (/\b(cost|costs|production time|train time|training time|research time)\b.*\b(reduced|decreased)\b/.test(text)) {
    score.buff += 1;
  }

  if (/\b(reduced|decreased)\b.*\b(cost|costs|production time|train time|training time|research time)\b/.test(text)) {
    score.buff += 1;
  }

  if (/\b(health|damage|armor|range|bonus|income|generation|garrison slots|starting wood|movement speed|attack speed|projectiles|space)\b.*\b(reduced|decreased|lowered)\b/.test(text)) {
    score.nerf += 1;
  }

  if (/\b(reduced|decreased|lowered)\b.*\b(health|damage|armor|range|bonus|income|generation|garrison slots|starting wood|movement speed|attack speed|projectiles|space)\b/.test(text)) {
    score.nerf += 1;
  }

  if (/\b(health|damage|armor|range|movement speed|attack speed|income|generation|number of sheep|units spawned)\b.*\b(increased|improved)\b/.test(text)) {
    score.buff += 1;
  }

  if (/\b(increased|improved)\b.*\b(health|damage|armor|range|movement speed|attack speed|income|generation|number of sheep|units spawned)\b/.test(text)) {
    score.buff += 1;
  }

  if (/\b(cost|costs|production time|train time|training time|research time|cooldown)\b.*\bincreased\b/.test(text)) {
    score.nerf += 1;
  }

  if (/\bincreased\b.*\b(cost|costs|production time|train time|training time|research time|cooldown)\b/.test(text)) {
    score.nerf += 1;
  }

  if (/\bcooldown\b.*\b(reduced|decreased)\b/.test(text) || /\b(reduced|decreased)\b.*\bcooldown\b/.test(text)) {
    score.buff += 1;
  }

  if (
    ["increased", "faster", "added", "bonus"].some((signal) =>
      text.includes(signal)
    ) &&
    score.buff === 0 &&
    score.nerf === 0
  ) {
    score.buff += 1;
  }

  if (
    ["reduced", "decreased", "slower", "lower", "limited", "no longer"].some(
      (signal) => text.includes(signal)
    ) &&
    score.buff === 0 &&
    score.nerf === 0
  ) {
    score.nerf += 1;
  }

  return score;
}

export async function getPatchArchive(): Promise<PatchArchiveItem[]> {
  const response = await fetch(AOE4_RELEASES_API, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch the Age of Empires IV patch archive.");
  }

  const posts = (await response.json()) as WordPressPostListItem[];

  const filteredPosts = posts.filter(isPatchReleasePost);
  const dedupedByVersion = new Map<string, WordPressPostListItem>();

  filteredPosts.forEach((post) => {
    const title = normalizeTitle(post.title.rendered ?? "");
    const key = getVersionKey(title, post.slug);
    const existing = dedupedByVersion.get(key);

    if (!existing) {
      dedupedByVersion.set(key, post);
      return;
    }

    const existingTitle = normalizeTitle(existing.title.rendered ?? "");
    if (getPatchPriority(title) < getPatchPriority(existingTitle)) {
      dedupedByVersion.set(key, post);
    }
  });

  return [...dedupedByVersion.values()]
    .sort((left, right) => right.date.localeCompare(left.date))
    .map(toArchiveItem);
}

export async function getPatchDetail(slug: string): Promise<PatchDetail | null> {
  const response = await fetch(`${AOE4_POST_BY_SLUG_API}${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch the selected Age of Empires IV patch.");
  }

  const posts = (await response.json()) as WordPressPostDetail[];
  const post = posts[0];

  if (!post) {
    return null;
  }

  const patch = toArchiveItem(post);
  const generalChanges = extractGeneralChanges(post.content.rendered ?? "");
  const notesByCivilization = extractCivilizationNotes(post.content.rendered ?? "");

  return {
    patch,
    generalChanges,
    civilizations: buildCivilizationEntries(notesByCivilization),
  };
}
