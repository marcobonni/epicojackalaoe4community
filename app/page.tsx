import type { Metadata } from "next";
import CoachingSection from "./components/home/CoachingSection";
import DiscordOverviewSection from "./components/home/DiscordOverviewSection";
import EventsSection from "./components/home/EventsSection";
import FeaturesSection from "./components/home/FeaturesSection";
import HeroSection from "./components/home/HeroSection";
import JoinSection from "./components/home/JoinSection";
import PlayerLookupForm from "./components/home/PlayerLookupForm";
import TwitchSection from "./components/home/TwitchSection";
import { COACHES, SERVER_CONFIG, TWITCH_STREAMERS } from "./config/site";
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

  const coaches = COACHES.map((coach) => {
    const translatedCoach = messages.home.coaching.coaches[coach.name];

    return {
      ...coach,
      badge: translatedCoach?.badge ?? coach.badge,
      role: translatedCoach?.role ?? coach.role,
      description: translatedCoach?.description ?? coach.description,
      specialty: translatedCoach?.specialty ?? coach.specialty,
      availability: translatedCoach?.availability ?? coach.availability,
    };
  });

  return (
    <div className="home-scale-80 min-h-screen overflow-x-hidden bg-[#050409] text-[#f5ecdc]">
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
