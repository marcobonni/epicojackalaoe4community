const TARGET_VOICE_CHANNEL_ID = 'VOCALE_ZOZZA_CHANNEL_ID';
const TWITCH_PARENT_DOMAINS = ['localhost'];
const TWITCH_STREAMER_PRIORITY = ['ScapoloCaldo667', 'IKasiya','Taffuz_Gg', 'RaionOn'];
const TWITCH_STREAMERS = TWITCH_STREAMER_PRIORITY;

const SERVER_CONFIG = {
  name: 'Age of Empires Hub',
  inviteUrl: 'https://discord.gg/7qdYf4vH8P',
  widgetServerId: '470883209614458881',
};

async function getDiscordWidgetData(serverId) {
  if (!serverId) return null;

  try {
    const response = await fetch(`https://discord.com/api/guilds/${serverId}/widget.json`, {
      next: { revalidate: 30 },
    });

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function getTwitchAppAccessToken() {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  try {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

async function getTwitchLiveMap(streamers) {
  const clientId = process.env.TWITCH_CLIENT_ID;
  if (!clientId || streamers.length === 0) {
    return {};
  }

  const accessToken = await getTwitchAppAccessToken();
  if (!accessToken) {
    return {};
  }

  const params = new URLSearchParams();
  streamers.forEach((streamer) => params.append('user_login', streamer));

  try {
    const response = await fetch(`https://api.twitch.tv/helix/streams?${params.toString()}`, {
      headers: {
        'Client-Id': clientId,
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    const liveEntries = Array.isArray(data.data) ? data.data : [];

    return liveEntries.reduce((acc, stream) => {
      acc[stream.user_login?.toLowerCase()] = {
        isLive: true,
        title: stream.title,
        gameName: stream.game_name,
        viewerCount: stream.viewer_count,
        startedAt: stream.started_at,
        thumbnailUrl: stream.thumbnail_url,
      };
      return acc;
    }, {});
  } catch {
    return {};
  }
}

function TwitchStatusBadge({ isLive }) {
  return (
    <div
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isLive
          ? 'border border-rose-400/30 bg-rose-400/10 text-rose-300'
          : 'border border-slate-700 bg-slate-800 text-slate-300'
      }`}
    >
      {isLive ? 'LIVE' : 'OFFLINE'}
    </div>
  );
}

export default async function AoeDiscordLandingPage() {
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
    };
  });

  const primaryStreamer =
    TWITCH_STREAMER_PRIORITY.map((priorityName) =>
      enrichedStreamers.find((streamer) => streamer.name.toLowerCase() === priorityName.toLowerCase() && streamer.isLive)
    ).find(Boolean) || enrichedStreamers.find((streamer) => streamer.isLive) || enrichedStreamers[0] || null;
  const secondaryStreamers = enrichedStreamers.filter((streamer) => streamer.name !== primaryStreamer?.name);

  const serverName = "EpicoJackal's Aoe4 Community";
  const inviteUrl = widgetData?.instant_invite || SERVER_CONFIG.inviteUrl;
  const onlineMembers = widgetData?.presence_count ?? null;
  const totalMembers = widgetData?.members?.length ?? null;
  const visibleChannels = (widgetData?.channels || []).slice(0, 5);
  const visibleMembers = (widgetData?.members || [])
    .filter((member) => member.channel_id === TARGET_VOICE_CHANNEL_ID)
    .slice(0, 12);

  const features = [
    {
      title: 'Partite e matchmaking',
      desc: 'Trova giocatori per ranked, custom, team game e serate casual nella community.',
    },
    {
      title: 'Tornei ed eventi',
      desc: 'Organizza o segui tornei, challenge e community night dedicate ad Age of Empires.',
    },
    {
      title: 'Guide e strategia',
      desc: 'Condividi build order, consigli, replay e discussioni sulle civiltà con altri appassionati.',
    },
    {
      title: 'Community italiana',
      desc: 'Un punto di ritrovo per chi vuole giocare, chiacchierare e crescere insieme nella scena italiana.',
    },
  ];

  const stats = [
    { value: '24/7', label: 'Community attiva' },
    { value: 'AoE', label: 'Focus totale' },
    { value: 'Eventi', label: 'Ogni settimana' },
  ];

  const liveStats = [
    { value: totalMembers ?? '—', label: 'Utenti visibili nel widget' },
    { value: onlineMembers ?? '—', label: 'Online ora' },
    { value: visibleChannels.length, label: 'Canali visibili' },
    { value: visibleMembers.length, label: 'Nella stanza' },
  ];

  const upcomingEvents = [
    {
      day: '12 MAR',
      title: 'Team Game Night 4v4',
      time: '21:30',
      type: 'Community Night',
      desc: 'Serata aperta a tutti con lobby bilanciate e voice channels dedicati.',
    },
    {
      day: '15 MAR',
      title: 'Torneo Weekend Bo3',
      time: '18:00',
      type: 'Torneo',
      desc: 'Mini torneo con bracket rapido per i membri della community.',
    },
    {
      day: '18 MAR',
      title: 'Coaching & Replay Review',
      time: '20:45',
      type: 'Strategia',
      desc: 'Analisi replay, build order e consigli pratici sulle civiltà.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <section className="relative overflow-hidden border-b border-amber-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-sm text-amber-300">
                Age of Empires Community Discord
              </div>
              <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
                La tua community Discord per vivere Age of Empires ogni giorno
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                Un server pensato per appassionati di Age of Empires: partite, eventi, tornei, consigli strategici e una community con cui giocare davvero.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://discord.gg/pjAakCz9"
                  className="rounded-2xl bg-amber-400 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5"
                >
                  Entra nel server
                </a>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="#events"
                  className="rounded-2xl border border-slate-700 bg-slate-900/70 px-6 py-3 text-base font-semibold text-slate-100 transition hover:border-slate-500"
                >
                  Vedi gli eventi
                </a>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://aoeitalia.com/classifiche/aoe4"
                  className="rounded-2xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
                >
                  <span className="inline-flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.369A19.791 19.791 0 0 0 15.126 3c-.23.41-.5.965-.684 1.396a18.27 18.27 0 0 0-4.884 0A13.87 13.87 0 0 0 8.873 3a19.736 19.736 0 0 0-5.19 1.369C.533 9.046-.32 13.579.099 18.057A19.9 19.9 0 0 0 6.13 21c.487-.667.92-1.372 1.294-2.11-.712-.27-1.39-.61-2.022-1.01.17-.125.337-.255.5-.389 3.905 1.82 8.14 1.82 12.001 0 .164.134.331.264.5.389-.633.4-1.312.74-2.025 1.01.375.738.808 1.443 1.295 2.11a19.86 19.86 0 0 0 6.03-2.943c.49-5.177-.84-9.67-3.386-13.688ZM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.954-2.418 2.156-2.418 1.211 0 2.175 1.095 2.156 2.418 0 1.334-.954 2.419-2.156 2.419Zm7.974 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.954-2.418 2.156-2.418 1.211 0 2.175 1.095 2.156 2.418 0 1.334-.945 2.419-2.156 2.419Z" />
                    </svg>
                    Iscriviti alle classifiche
                  </span>
                </a>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://discord.com/channels/470883209614458881/VOCALE_ZOZZA_CHANNEL_ID"
                  className="rounded-2xl bg-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
                >
                  Gioca una zozza con il nostro bot!
                </a>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://aoeitalia.com/ruota"
                  className="rounded-2xl bg-red-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
                >
                  Ruota delle civ
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-amber-300">{serverName}</p>
                  
                </div>
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
                  {widgetData ? 'Live' : 'Setup richiesto'}
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                  <p className="text-sm text-slate-400">Canali principali</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-200">
                    {visibleChannels.length > 0 ? (
                      visibleChannels.map((channel) => <div key={channel.id}># {channel.name}</div>)
                    ) : (
                      <div className="text-slate-500">Verifica server ID e widget Discord se non vedi ancora i canali.</div>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-center">
                      <div className="text-2xl font-bold text-amber-300">{stat.value}</div>
                      <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Live del Discord</p>
                
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
                  I dati qui sotto sono dei giocatori della nostra community!
                </p>
              </div>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={inviteUrl}
                className="hidden rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 md:inline-flex"
              >
                Apri Discord
              </a>
            </div>

            <div className="mt-6 flex h-[420px] items-center justify-center rounded-[1.5rem] border border-slate-800 bg-slate-950/70 text-slate-400 text-sm">
              Anteprima Discord disabilitata per privacy dei membri.
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 shadow-lg shadow-black/20">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Stato del server</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Numeri che danno fiducia</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              I dati qui sotto arrivano dal widget pubblico del server. Se il widget non è attivo, vedrai valori vuoti o di fallback.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {liveStats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
                  <div className="text-3xl font-bold text-amber-300">{item.value}</div>
                  <div className="mt-2 text-sm text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-300">Presenza live</p>
                  <p className="mt-1 text-sm text-slate-300">{onlineMembers ?? '—'} membri online in questo momento.</p>
                </div>
                <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
                  Live
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
              <p className="text-sm font-semibold text-white">Giocatori nella stanza selezionata</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {visibleMembers.length > 0 ? (
                  visibleMembers.map((member) => (
                    <div key={member.id} className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                      {member.username}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500">Nessun giocatore nella stanza selezionata.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Perché unirti</p>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Un server Discord costruito per chi ama davvero Age of Empires</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Live su Twitch</p>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Streamer in evidenza e canali secondari</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Lo streamer principale viene scelto in base alla tua lista di priorità: il primo live disponibile va in alto. Sotto trovi gli altri canali, con stato live rilevato dalla Twitch API. Per far funzionare il controllo online/offline imposta <code className="rounded bg-slate-800 px-1 py-0.5 text-slate-200">TWITCH_CLIENT_ID</code> e <code className="rounded bg-slate-800 px-1 py-0.5 text-slate-200">TWITCH_CLIENT_SECRET</code> nelle variabili ambiente di Next.js.
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-8">
          {primaryStreamer ? (
            <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/20">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Streamer in evidenza</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{primaryStreamer.name}</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                    <TwitchStatusBadge isLive={primaryStreamer.isLive} />
                    {primaryStreamer.gameName ? <span>{primaryStreamer.gameName}</span> : null}
                    {typeof primaryStreamer.viewerCount === 'number' ? <span>{primaryStreamer.viewerCount} spettatori</span> : null}
                  </div>
                  {primaryStreamer.title ? <p className="mt-3 text-sm text-slate-400">{primaryStreamer.title}</p> : null}
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
                  src={`https://player.twitch.tv/?channel=${primaryStreamer.name}&parent=${TWITCH_PARENT_DOMAINS.join('&parent=')}`}
                  height="560"
                  width="100%"
                  allowFullScreen
                />
              </div>
            </div>
          ) : null}

          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Streamer secondari</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Altri canali della community</h3>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {secondaryStreamers.length > 0 ? (
                secondaryStreamers.map((streamer) => (
                  <div key={streamer.name} className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 p-4 shadow-lg shadow-black/20">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-300">Twitch Stream</p>
                        <h3 className="mt-2 text-xl font-semibold text-white">{streamer.name}</h3>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                          <TwitchStatusBadge isLive={streamer.isLive} />
                          {streamer.gameName ? <span>{streamer.gameName}</span> : null}
                          {typeof streamer.viewerCount === 'number' ? <span>{streamer.viewerCount} spettatori</span> : null}
                        </div>
                        {streamer.title ? <p className="mt-3 text-sm text-slate-400">{streamer.title}</p> : null}
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
                        src={`https://player.twitch.tv/?channel=${streamer.name}&parent=${TWITCH_PARENT_DOMAINS.join('&parent=')}`}
                        height="320"
                        width="100%"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-sm text-slate-400 lg:col-span-2 xl:col-span-3">
                  Aggiungi altri streamer dentro <code className="rounded bg-slate-800 px-1 py-0.5 text-slate-200">TWITCH_STREAMERS</code> per mostrare qui le live secondarie della community.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="events" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Eventi AoE</p>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Prossimi appuntamenti della community</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Questa sezione è pronta per essere collegata a eventi automatici del tuo server, Google Calendar o foglio eventi della community.
            </p>
          </div>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={inviteUrl}
            className="inline-flex rounded-2xl border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
          >
            Partecipa agli eventi
          </a>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {upcomingEvents.map((event) => (
            <div key={event.title} className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">{event.day}</div>
                  <h3 className="mt-3 text-xl font-semibold text-white">{event.title}</h3>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-1 text-sm text-slate-300">{event.type}</div>
              </div>
              <p className="mt-4 text-sm text-slate-400">Ore {event.time}</p>
              <p className="mt-4 text-sm leading-7 text-slate-300">{event.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Cosa trovi dentro</p>
            <ul className="mt-6 space-y-4 text-slate-300">
              <li>Canali dedicati alle civiltà, alle strategie e ai replay (NO RAION)</li>
              <li>Eventi community per giocare insieme e conoscere nuovi player</li>
              <li>Spazio per creator, clip, meme e discussioni competitive (NO MARCOTAMBY)</li>
              <li>Organizzazione semplice per tornei, team game e serate speciali (NO ORGANIZZATI DA COOP)</li>
            </ul>
          </div>
          <div id="join" className="rounded-[2rem] border border-amber-400/30 bg-amber-400/10 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-200">Join now</p>
            <h3 className="mt-4 text-2xl font-bold text-white">Porta il tuo gameplay al livello successivo</h3>
            <p className="mt-4 text-sm leading-7 text-amber-50/90">
              Clicca qui e inizia a giocare subito!
            </p>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={inviteUrl}
              className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5"
            >
              Vai al Discord!
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-400">
        Produced by EpicoJackal™ , all right reserved. Ogni fatto o riferimenti a personaggi della vita vera sono puramente casuali. Sito per memare Aoe4italia
      </footer>
    </div>
  );
}
