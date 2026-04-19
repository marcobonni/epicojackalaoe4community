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
  /^(build spotlight|general|gameplay|balance|maps|mods|ai|ui|ux\/ui|general fixes|controls|campaign|ongoing|what'?s next|localization|release notes|download on|season|event|investigation|known issues|civilization balance and bugfixes|civilization specific changes|civilization improvements|balance - civilization specific|all civilizations)$/i;

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
  let currentCivilizations: CivilizationDefinition[] = [];

  lines.forEach((line) => {
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
    return "rework";
  }

  const joinedText = officialText.join(" ").toLowerCase();

  const nerfSignals = [
    "reduced",
    "decreased",
    "slower",
    "lower",
    "less",
    "limited",
    "fixed an exploit",
    "higher than intended",
    "no longer",
    "removed",
  ];

  const buffSignals = [
    "increased",
    "improved",
    "faster",
    "more",
    "added",
    "now show",
    "now reflects",
    "bonus",
  ];

  if (nerfSignals.some((signal) => joinedText.includes(signal))) {
    return "nerf";
  }

  if (buffSignals.some((signal) => joinedText.includes(signal))) {
    return "buff";
  }

  return "rework";
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
  const notesByCivilization = extractCivilizationNotes(post.content.rendered ?? "");

  return {
    patch,
    civilizations: buildCivilizationEntries(notesByCivilization),
  };
}
