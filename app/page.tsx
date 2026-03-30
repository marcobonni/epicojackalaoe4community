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
  TWITCH_STREAMERS,
  COACHES,
} from "./config/site";

import { getDiscordWidgetData } from "./lib/discord";
import { getTwitchLiveMap } from "./lib/twitch";
import { Metadata } from "next";


export const metadata: Metadata = {
title: "Aoe4 Italia - Community, Classifica e Quiz",
description: "Unisciti alla community italiana AoE4. Classifica aggiornata, quiz e matchmaking automatico."
};

export default async function Page() {
  const widgetData = await getDiscordWidgetData(SERVER_CONFIG.widgetServerId);

  const configuredStreamers = TWITCH_STREAMERS.filter(
    (streamer) => streamer?.name
  );

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
    { value: totalMembers ?? "—", label: "Utenti visibili nel widget" },
    { value: onlineMembers ?? "—", label: "Online ora" },
    { value: visibleChannels.length, label: "Canali visibili" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <HeroSection />
      <TwitchSection
        primaryStreamer={primaryStreamer}
        secondaryStreamers={secondaryStreamers}
      />

      <FeaturesSection />

      <DiscordOverviewSection
        inviteUrl={inviteUrl}
        onlineMembers={onlineMembers}
        liveStats={liveStats}
      />

      <CoachingSection coaches={COACHES} />

      <EventsSection />

      <JoinSection />

      <FooterSection />
    </div>
  );
}