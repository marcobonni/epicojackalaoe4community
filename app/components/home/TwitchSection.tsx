"use client";

import TwitchStatusBadge from "@/app/components/home/TwitchStatusBadge";
import { useTranslations } from "@/app/components/LanguageProvider";
import { TWITCH_PARENT_DOMAINS } from "@/app/config/site";

type TwitchStreamer = {
  name: string;
  isLive?: boolean;
  title?: string | null;
  gameName?: string | null;
  viewerCount?: number;
  startedAt?: string | null;
  thumbnailUrl?: string | null;
};

type TwitchSectionProps = {
  primaryStreamer: TwitchStreamer | null;
  secondaryStreamers: TwitchStreamer[];
};

export default function TwitchSection({
  primaryStreamer,
  secondaryStreamers,
}: TwitchSectionProps) {
  const messages = useTranslations();
  const section = messages.home.twitch;

  return (
    <section className="mx-auto max-w-[1500px] px-6 py-20 lg:px-10">
      <div className="max-w-2xl">
        <p className="cinematic-kicker">{section.badge}</p>
        <h2 className="cinematic-title mt-5 text-3xl sm:text-4xl">{section.title}</h2>
        <p className="cinematic-body mt-4 text-sm sm:text-base">{section.description}</p>
      </div>

      <div className="mt-10 space-y-8">
        {primaryStreamer ? (
          <div className="cinematic-panel-strong p-5 sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="cinematic-kicker text-[11px]">{section.featured}</p>
                <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
                  {primaryStreamer.name}
                </h3>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300/84">
                  <TwitchStatusBadge isLive={Boolean(primaryStreamer.isLive)} />
                  {primaryStreamer.gameName && <span>{primaryStreamer.gameName}</span>}
                  {typeof primaryStreamer.viewerCount === "number" ? (
                    <span>
                      {primaryStreamer.viewerCount} {messages.common.viewerCount}
                    </span>
                  ) : null}
                </div>

                {primaryStreamer.title ? (
                  <p className="cinematic-body mt-4 max-w-2xl text-sm">
                    {primaryStreamer.title}
                  </p>
                ) : null}
              </div>

              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.twitch.tv/${primaryStreamer.name}`}
                className="cinematic-button-secondary shrink-0"
              >
                {section.open}
              </a>
            </div>

            <div className="overflow-hidden rounded-[1.7rem] border border-white/8 bg-black">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  title={`Twitch player ${primaryStreamer.name}`}
                  src={`https://player.twitch.tv/?channel=${primaryStreamer.name}&parent=${TWITCH_PARENT_DOMAINS.join("&parent=")}`}
                  className="absolute inset-0 h-full w-full"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        ) : null}

        <div>
          <div className="mb-5">
            <p className="cinematic-kicker text-slate-300/74">{section.secondaryBadge}</p>
            <h3 className="cinematic-title mt-4 text-2xl">{section.secondaryTitle}</h3>
          </div>

          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {secondaryStreamers.length > 0 ? (
              secondaryStreamers.map((streamer) => (
                <div key={streamer.name} className="cinematic-panel p-4">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="cinematic-kicker text-[11px] text-purple-200/90">
                        Twitch Stream
                      </p>

                      <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">
                        {streamer.name}
                      </h3>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300/84">
                        <TwitchStatusBadge isLive={Boolean(streamer.isLive)} />
                        {streamer.gameName && <span>{streamer.gameName}</span>}
                        {typeof streamer.viewerCount === "number" ? (
                          <span>
                            {streamer.viewerCount} {messages.common.viewerCount}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://www.twitch.tv/${streamer.name}`}
                      className="cinematic-button-ghost"
                    >
                      {section.open}
                    </a>
                  </div>

                  <div className="overflow-hidden rounded-[1.5rem] border border-white/8 bg-black">
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        title={`Twitch player ${streamer.name}`}
                        src={`https://player.twitch.tv/?channel=${streamer.name}&parent=${TWITCH_PARENT_DOMAINS.join("&parent=")}`}
                        className="absolute inset-0 h-full w-full"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="cinematic-empty-state p-8 text-sm text-slate-300/74">
                {section.empty}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
