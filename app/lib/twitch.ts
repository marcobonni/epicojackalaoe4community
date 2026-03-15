type TwitchLiveEntry = {
  isLive: boolean;
  title: string;
  gameName: string;
  viewerCount: number;
  startedAt: string;
  thumbnailUrl: string;
};

type TwitchStream = {
  user_login: string;
  title: string;
  game_name: string;
  viewer_count: number;
  started_at: string;
  thumbnail_url: string;
};

async function getTwitchAppAccessToken() {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  try {
    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

export async function getTwitchLiveMap(streamers: string[]) {
  const clientId = process.env.TWITCH_CLIENT_ID;

  if (!clientId || streamers.length === 0) {
    return {} as Record<string, TwitchLiveEntry>;
  }

  const accessToken = await getTwitchAppAccessToken();

  if (!accessToken) {
    return {} as Record<string, TwitchLiveEntry>;
  }

  const params = new URLSearchParams();

  streamers.forEach((streamer) => {
    params.append("user_login", streamer);
  });

  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/streams?${params.toString()}`,
      {
        headers: {
          "Client-Id": clientId,
          Authorization: `Bearer ${accessToken}`,
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      return {} as Record<string, TwitchLiveEntry>;
    }

    const data = await response.json();

    const liveEntries: TwitchStream[] = Array.isArray(data.data)
      ? data.data
      : [];

    return liveEntries.reduce<Record<string, TwitchLiveEntry>>(
      (acc, stream) => {
        acc[stream.user_login.toLowerCase()] = {
          isLive: true,
          title: stream.title ?? "",
          gameName: stream.game_name ?? "",
          viewerCount: Number(stream.viewer_count ?? 0),
          startedAt: stream.started_at ?? "",
          thumbnailUrl: stream.thumbnail_url ?? "",
        };

        return acc;
      },
      {}
    );
  } catch {
    return {} as Record<string, TwitchLiveEntry>;
  }
}