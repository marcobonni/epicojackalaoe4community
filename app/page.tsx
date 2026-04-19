import type { Metadata } from "next";
import CoachingSection from "./components/home/CoachingSection";
import DiscordOverviewSection from "./components/home/DiscordOverviewSection";
import EventsSection from "./components/home/EventsSection";
import FeaturesSection from "./components/home/FeaturesSection";
import HeroSection from "./components/home/HeroSection";
import JoinSection from "./components/home/JoinSection";
import PlayerLookupForm from "./components/home/PlayerLookupForm";
import TwitchSection from "./components/home/TwitchSection";
import { SERVER_CONFIG, TWITCH_STREAMERS } from "./config/site";
import { getDiscordWidgetData } from "./lib/discord";
import { getTranslations } from "./lib/i18n";
import { getTwitchLiveMap } from "./lib/twitch";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getTranslations();

  return {
    title: messages.metadata.homeTitle,
    description: messages.metadata.homeDescription,
  };
}

export default async function Page() {
  const { messages } = await getTranslations();
  const widgetData = await getDiscordWidgetData(SERVER_CONFIG.widgetServerId);

  const configuredStreamers = TWITCH_STREAMERS.filter((streamer) => streamer?.name);
  const twitchLiveMap = await getTwitchLiveMap(
    configuredStreamers.map((streamer) => streamer.name)
  );

  const enrichedStreamers = configuredStreamers.map((streamer) => {
    const liveData = twitchLiveMap[streamer.name.toLowerCase()];

    return {
      ...streamer,
      isLive: Boolean(liveData),
      title: liveData?.title ?? null,
      gameName: liveData?.gameName ?? null,
      viewerCount: liveData?.viewerCount ?? 0,
      startedAt: liveData?.startedAt ?? null,
      thumbnailUrl: liveData?.thumbnailUrl ?? null,
    };
  });

  const liveStreamers = enrichedStreamers
    .filter((streamer) => streamer.isLive)
    .sort((a, b) => b.viewerCount - a.viewerCount);

  const primaryStreamer = liveStreamers[0] ?? enrichedStreamers[0] ?? null;
  const secondaryStreamers = enrichedStreamers
    .filter((streamer) => streamer.name !== primaryStreamer?.name)
    .sort((a, b) => {
      if (a.isLive !== b.isLive) {
        return Number(b.isLive) - Number(a.isLive);
      }

      return (b.viewerCount ?? 0) - (a.viewerCount ?? 0);
    })
    .slice(0, 3);

  const inviteUrl = widgetData?.instant_invite || SERVER_CONFIG.inviteUrl;
  const onlineMembers = widgetData?.presence_count ?? null;
  const totalMembers = widgetData?.members?.length ?? null;
  const visibleChannels = widgetData?.channels || [];

  const liveStats = [
    { value: totalMembers ?? messages.common.noData, label: messages.home.liveStats[0] },
    { value: onlineMembers ?? messages.common.noData, label: messages.home.liveStats[1] },
    { value: visibleChannels.length, label: messages.home.liveStats[2] },
  ];

  const coaches = [
    {
      name: "EpicoJackal",
      badge: messages.home.coaching.coaches.EpicoJackal.badge,
      role: messages.home.coaching.coaches.EpicoJackal.role,
      description: messages.home.coaching.coaches.EpicoJackal.description,
      specialty: messages.home.coaching.coaches.EpicoJackal.specialty,
      price: null,
      availability: messages.home.coaching.coaches.EpicoJackal.availability,
      contactUrl: "https://discord.com/users/240210612582481922",
      profileUrl: "https://www.twitch.tv/epicojackal",
    },
    {
      name: "Daddu23",
      badge: messages.home.coaching.coaches.Daddu23.badge,
      role: messages.home.coaching.coaches.Daddu23.role,
      description: messages.home.coaching.coaches.Daddu23.description,
      specialty: messages.home.coaching.coaches.Daddu23.specialty,
      price: "1.000.000 Rial Iraniano",
      availability: messages.home.coaching.coaches.Daddu23.availability,
      contactUrl: "https://discord.com/users/257545506081734658",
      profileUrl: null,
    },
    {
      name: "Taffuz",
      badge: messages.home.coaching.coaches.Taffuz.badge,
      role: messages.home.coaching.coaches.Taffuz.role,
      description: messages.home.coaching.coaches.Taffuz.description,
      specialty: messages.home.coaching.coaches.Taffuz.specialty,
      price: null,
      availability: messages.home.coaching.coaches.Taffuz.availability,
      contactUrl: "https://discord.com/users/702542802432688270",
      profileUrl: "https://www.twitch.tv/taffuz_gg",
    },
    {
      name: "Kasiya",
      badge: messages.home.coaching.coaches.Kasiya.badge,
      role: messages.home.coaching.coaches.Kasiya.role,
      description: messages.home.coaching.coaches.Kasiya.description,
      specialty: messages.home.coaching.coaches.Kasiya.specialty,
      price: null,
      availability: messages.home.coaching.coaches.Kasiya.availability,
      contactUrl: "https://discord.com/users/725895228531146794",
      profileUrl: "https://www.twitch.tv/IKasiya",
    },
  ];

  return (
    <div className="home-scale-80 min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      <HeroSection />
      <TwitchSection
        primaryStreamer={primaryStreamer}
        secondaryStreamers={secondaryStreamers}
      />
      <PlayerLookupForm />
      <FeaturesSection />
      <DiscordOverviewSection
        inviteUrl={inviteUrl}
        onlineMembers={onlineMembers}
        liveStats={liveStats}
      />
      <CoachingSection coaches={coaches} />
      <EventsSection />
      <JoinSection />
    </div>
  );
}
