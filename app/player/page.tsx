import PlayerDashboard from "@/app/player/PlayerDashboard";

const civIcons: Record<string, string> = {
  abbasid_dynasty: "/images/civs/ab.png",
  ayyubids: "/images/civs/ay.png",
  byzantines: "/images/civs/by.png",
  chinese: "/images/civs/ch.png",
  delhi_sultanate: "/images/civs/de.png",
  english: "/images/civs/en.png",
  french: "/images/civs/fr.png",
  golden_horde: "/images/civs/gh.png",
  holy_roman_empire: "/images/civs/hre.png",
  house_of_lancaster: "/images/civs/hl.png",
  japanese: "/images/civs/jap.png",
  jeanne_darc: "/images/civs/jd.png",
  knights_templar: "/images/civs/kt.png",
  macedonian_dynasty: "/images/civs/mac.png",
  malians: "/images/civs/ma.png",
  mongols: "/images/civs/mo.png",
  order_of_the_dragon: "/images/civs/ootd.png",
  ottomans: "/images/civs/ot.png",
  rus: "/images/civs/ru.png",
  sengoku_daimyo: "/images/civs/sen.png",
  tughlaq_dynasty: "/images/civs/tugh.png",
  zhu_xis_legacy: "/images/civs/zhu.png",
};

export default function PlayerDemoPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.10),transparent_28%)]" />
      <PlayerDashboard player={player} civIcons={civIcons} />
    </main>
  );
}