import HeroSection from "./components/home/HeroSection";
import DiscordOverviewSection from "./components/home/DiscordOverviewSection";
import FeaturesSection from "./components/home/FeaturesSection";
import TwitchSection from "./components/home/TwitchSection";
import CoachingSection from "./components/home/CoachingSection";
import EventsSection from "./components/home/EventsSection";
import JoinSection from "./components/home/JoinSection";
import FooterSection from "./components/home/FooterSection";

import {
  SERVER_CONFIG,
  TARGET_VOICE_CHANNEL_ID,
  TWITCH_STREAMER_PRIORITY,
  TWITCH_STREAMERS,
  COACHES
} from "./config/site";

import { getDiscordWidgetData } from "./lib/discord";
import { getTwitchLiveMap } from "./lib/twitch";

export default async function Page() {
  const widgetData = await getDiscordWidgetData(SERVER_CONFIG.widgetServerId);

  const configuredStreamers = TWITCH_STREAMERS.filter(Boolean);
  const twitchLiveMap = await getTwitchLiveMap(configuredStreamers);

  const enrichedStreamers = configuredStreamers.map((streamer) => {
    const liveData = twitchLiveMap[streamer.toLowerCase()];

    return {
      name: streamer,
      isLive: Boolean(liveData?.isLive),
      title: liveData?.title ?? null,
      gameName: liveData?.gameName ?? null,
      viewerCount: liveData?.viewerCount ?? null,
      startedAt: liveData?.startedAt ?? null,
      thumbnailUrl: liveData?.thumbnailUrl ?? null,
    };
  });

  const primaryStreamer =
    TWITCH_STREAMER_PRIORITY.map((priorityName) =>
      enrichedStreamers.find(
        (streamer) =>
          streamer.name.toLowerCase() === priorityName.toLowerCase() &&
          streamer.isLive
      )
    ).find(Boolean) ||
    enrichedStreamers.find((streamer) => streamer.isLive) ||
    enrichedStreamers[0] ||
    null;

  const secondaryStreamers = enrichedStreamers.filter(
    (streamer) => streamer.name !== primaryStreamer?.name
  );

  const inviteUrl = widgetData?.instant_invite || SERVER_CONFIG.inviteUrl;
  const onlineMembers = widgetData?.presence_count ?? null;
  const totalMembers = widgetData?.members?.length ?? null;
  const visibleChannels = widgetData?.channels || [];

  const liveStats = [
    { value: totalMembers ?? "—", label: "Utenti visibili nel widget" },
    { value: onlineMembers ?? "—", label: "Online ora" },
    { value: visibleChannels.length, label: "Canali visibili" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <HeroSection />

      <DiscordOverviewSection
        inviteUrl={inviteUrl}
        onlineMembers={onlineMembers}
        liveStats={liveStats}
      />

      <FeaturesSection />

      <TwitchSection
        primaryStreamer={primaryStreamer}
        secondaryStreamers={secondaryStreamers}
      />
      <CoachingSection coaches={COACHES} />

      <EventsSection />

      <JoinSection />

      <FooterSection />
    </div>
  );
}