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
    <section className="mx-auto max-w-[1720px] px-8 py-16 lg:px-14 lg:py-20 xl:px-16">
      <div className="max-w-3xl">
        <p className="cinematic-kicker">{section.badge}</p>
        <h2 className="cinematic-title mt-5 text-3xl sm:text-4xl xl:text-[3.4rem]">
          {section.title}
        </h2>
        {section.description ? (
          <p className="cinematic-body mt-4 max-w-2xl text-sm sm:text-base">
            {section.description}
          </p>
        ) : null}
      </div>

      <div className="mt-9 space-y-7 lg:space-y-8">
        {primaryStreamer ? (
          <div className="cinematic-panel-strong overflow-hidden p-6 sm:p-7 lg:p-8 xl:p-10">
            <div className="max-w-4xl">
              <p className="cinematic-kicker text-[11px]">{section.featured}</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl xl:text-[3.35rem]">
                {primaryStreamer.name}
              </h3>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#d8cbb7]/84 sm:text-base">
                <TwitchStatusBadge isLive={Boolean(primaryStreamer.isLive)} />
                {primaryStreamer.gameName && <span>{primaryStreamer.gameName}</span>}
                {typeof primaryStreamer.viewerCount === "number" ? (
                  <span>
                    {primaryStreamer.viewerCount} {messages.common.viewerCount}
                  </span>
                ) : null}
              </div>

              {primaryStreamer.title ? (
                <p className="cinematic-body mt-5 max-w-3xl text-sm sm:text-base">
                  {primaryStreamer.title}
                </p>
              ) : null}

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://www.twitch.tv/${primaryStreamer.name}`}
                  className="cinematic-button-secondary"
                >
                  {section.open}
                </a>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/8 bg-black shadow-[0_24px_70px_rgba(2,6,23,0.3)]">
              <div className="relative w-full" style={{ paddingBottom: "48%" }}>
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
          <div className="mb-4">
            <p className="cinematic-kicker text-[#d8cbb7]/74">{section.secondaryBadge}</p>
            <h3 className="cinematic-title mt-3 text-2xl sm:text-[2rem]">
              {section.secondaryTitle}
            </h3>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {secondaryStreamers.length > 0 ? (
              secondaryStreamers.map((streamer) => (
                <div key={streamer.name} className="cinematic-panel p-5 sm:p-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="cinematic-kicker text-[11px] text-purple-200/90">
                        Twitch Stream
                      </p>

                      <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">
                        {streamer.name}
                      </h3>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#d8cbb7]/84">
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
                    <div className="relative w-full" style={{ paddingBottom: "46%" }}>
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
              <div className="cinematic-empty-state p-8 text-sm text-[#d8cbb7]/74">
                {section.empty}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

