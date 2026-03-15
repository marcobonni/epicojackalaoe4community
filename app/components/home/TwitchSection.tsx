import TwitchStatusBadge from "@/app/components/home/TwitchStatusBadge";
import { TWITCH_PARENT_DOMAINS } from "@/app/config/site";

export default function TwitchSection({
  primaryStreamer,
  secondaryStreamers,
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
            Live su Twitch
          </p>

          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            Streamer in evidenza e canali secondari
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            Lo streamer principale viene scelto automaticamente tra quelli live,
            dando priorità a chi ha più spettatori. Se nessuno è online, viene
            mostrato uno streamer di fallback.
          </p>
        </div>
      </div>

      <div className="mt-10 space-y-8">
        {primaryStreamer ? (
          <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                  Streamer in evidenza
                </p>

                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {primaryStreamer.name}
                </h3>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                  <TwitchStatusBadge isLive={primaryStreamer.isLive} />

                  {primaryStreamer.gameName && (
                    <span>{primaryStreamer.gameName}</span>
                  )}

                  {typeof primaryStreamer.viewerCount === "number" && (
                    <span>{primaryStreamer.viewerCount} spettatori</span>
                  )}
                </div>

                {primaryStreamer.title && (
                  <p className="mt-3 text-sm text-slate-400">
                    {primaryStreamer.title}
                  </p>
                )}
              </div>

              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.twitch.tv/${primaryStreamer.name}`}
                className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Apri su Twitch
              </a>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-slate-800 bg-black">
              <iframe
                title={`Twitch player ${primaryStreamer.name}`}
                src={`https://player.twitch.tv/?channel=${primaryStreamer.name}&parent=${TWITCH_PARENT_DOMAINS.join(
                  "&parent="
                )}`}
                height="560"
                width="100%"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        ) : null}

        <div>
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              Streamer secondari
            </p>

            <h3 className="mt-2 text-2xl font-semibold text-white">
              Altri canali della community
            </h3>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {secondaryStreamers.length > 0 ? (
              secondaryStreamers.map((streamer) => (
                <div
                  key={streamer.name}
                  className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 p-4 shadow-lg shadow-black/20"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-300">
                        Twitch Stream
                      </p>

                      <h3 className="mt-2 text-xl font-semibold text-white">
                        {streamer.name}
                      </h3>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                        <TwitchStatusBadge isLive={streamer.isLive} />

                        {streamer.gameName && <span>{streamer.gameName}</span>}

                        {typeof streamer.viewerCount === "number" && (
                          <span>{streamer.viewerCount} spettatori</span>
                        )}
                      </div>

                      {streamer.title && (
                        <p className="mt-3 text-sm text-slate-400">
                          {streamer.title}
                        </p>
                      )}
                    </div>

                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://www.twitch.tv/${streamer.name}`}
                      className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                    >
                      Apri su Twitch
                    </a>
                  </div>

                  <div className="overflow-hidden rounded-[1.5rem] border border-slate-800 bg-black">
                    <iframe
                      title={`Twitch player ${streamer.name}`}
                      src={`https://player.twitch.tv/?channel=${streamer.name}&parent=${TWITCH_PARENT_DOMAINS.join(
                        "&parent="
                      )}`}
                      height="320"
                      width="100%"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-sm text-slate-400">
                Nessuno streamer configurato.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}