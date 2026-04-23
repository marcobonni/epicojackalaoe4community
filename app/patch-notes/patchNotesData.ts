import { civIcons } from "@/app/lib/aoe4world";

export type CivilizationId =
  | "abbasid_dynasty"
  | "ayyubids"
  | "byzantines"
  | "chinese"
  | "delhi_sultanate"
  | "english"
  | "french"
  | "golden_horde"
  | "holy_roman_empire"
  | "house_of_lancaster"
  | "japanese"
  | "jeanne_darc"
  | "knights_templar"
  | "macedonian_dynasty"
  | "malians"
  | "mongols"
  | "order_of_the_dragon"
  | "ottomans"
  | "rus"
  | "sengoku_daimyo"
  | "tughlaq_dynasty"
  | "zhu_xis_legacy";

export type PatchBannerState = "buff" | "nerf" | "rework";

export type CivilizationDefinition = {
  id: CivilizationId;
  name: string;
  aliases: string[];
};

export type PatchArchiveItem = {
  slug: string;
  title: string;
  url: string;
  publishedAt: string;
  versionLabel: string;
  sourceLabel: string;
};

export type CivilizationPatchEntry = {
  id: CivilizationId;
  name: string;
  bannerSrc: string;
  state: PatchBannerState;
  hasOfficialEntry: boolean;
  subtitle: string;
  officialText: string[];
};

export type PatchDetail = {
  patch: PatchArchiveItem;
  civilizations: CivilizationPatchEntry[];
};

export const civilizationDefinitions: CivilizationDefinition[] = [
  {
    id: "abbasid_dynasty",
    name: "Abbasid Dynasty",
    aliases: ["Abbasid Dynasty", "Abbasid"],
  },
  {
    id: "ayyubids",
    name: "Ayyubids",
    aliases: ["Ayyubids", "Ayyubid"],
  },
  {
    id: "byzantines",
    name: "Byzantines",
    aliases: ["Byzantines", "Byzantine"],
  },
  {
    id: "chinese",
    name: "Chinese",
    aliases: ["Chinese"],
  },
  {
    id: "delhi_sultanate",
    name: "Delhi Sultanate",
    aliases: ["Delhi Sultanate", "Delhi"],
  },
  {
    id: "english",
    name: "English",
    aliases: ["English"],
  },
  {
    id: "french",
    name: "French",
    aliases: ["French"],
  },
  {
    id: "golden_horde",
    name: "Golden Horde",
    aliases: ["Golden Horde"],
  },
  {
    id: "holy_roman_empire",
    name: "Holy Roman Empire",
    aliases: ["Holy Roman Empire", "HRE"],
  },
  {
    id: "house_of_lancaster",
    name: "House of Lancaster",
    aliases: ["House of Lancaster"],
  },
  {
    id: "japanese",
    name: "Japanese",
    aliases: ["Japanese"],
  },
  {
    id: "jeanne_darc",
    name: "Jeanne d'Arc",
    aliases: ["Jeanne d'Arc", "Jeanne dâ€™Arc"],
  },
  {
    id: "knights_templar",
    name: "Knights Templar",
    aliases: ["Knights Templar"],
  },
  {
    id: "macedonian_dynasty",
    name: "Macedonian Dynasty",
    aliases: ["Macedonian Dynasty"],
  },
  {
    id: "malians",
    name: "Malians",
    aliases: ["Malians", "Malian"],
  },
  {
    id: "mongols",
    name: "Mongols",
    aliases: ["Mongols", "Mongol"],
  },
  {
    id: "order_of_the_dragon",
    name: "Order of the Dragon",
    aliases: ["Order of the Dragon"],
  },
  {
    id: "ottomans",
    name: "Ottomans",
    aliases: ["Ottomans", "Ottoman"],
  },
  {
    id: "rus",
    name: "Rus",
    aliases: ["Rus"],
  },
  {
    id: "sengoku_daimyo",
    name: "Sengoku Daimyo",
    aliases: ["Sengoku Daimyo"],
  },
  {
    id: "tughlaq_dynasty",
    name: "Tughlaq Dynasty",
    aliases: ["Tughlaq Dynasty", "Tughluq Dynasty", "Tughlaq", "Tughluq"],
  },
  {
    id: "zhu_xis_legacy",
    name: "Zhu Xi's Legacy",
    aliases: ["Zhu Xi's Legacy", "Zhu Xiâ€™s Legacy"],
  },
];

export const patchBannerStateConfig: Record<
  PatchBannerState,
  {
    label: string;
    badge: string;
    glow: string;
    accent: string;
  }
> = {
  buff: {
    label: "Buff",
    badge: "border-[#d9b265]/24 bg-[#d9b265]/10 text-[#f8edd7]",
    glow: "bg-[#d9b265]/18 text-[#f8edd7] ring-1 ring-inset ring-[#d9b265]/28",
    accent: "from-[#d9b265]/70 via-[#f0d7a0]/24 to-transparent",
  },
  nerf: {
    label: "Nerf",
    badge: "border-rose-300/24 bg-rose-300/10 text-rose-100",
    glow: "bg-rose-300/18 text-rose-100 ring-1 ring-inset ring-rose-300/28",
    accent: "from-rose-300/70 via-red-200/24 to-transparent",
  },
  rework: {
    label: "No Mention",
    badge: "border-[#d8cbb7]/18 bg-[#d8cbb7]/10 text-[#f5ecdc]",
    glow: "bg-[#d8cbb7]/14 text-[#f5ecdc] ring-1 ring-inset ring-[#d8cbb7]/22",
    accent: "from-[#d8cbb7]/50 via-[#f0c86e]/16 to-transparent",
  },
};

export function getCivilizationBannerSrc(civilizationId: CivilizationId) {
  return civIcons[civilizationId] ?? "/images/civs/generic_flag.png";
}

