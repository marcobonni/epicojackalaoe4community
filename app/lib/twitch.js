async function getTwitchAppAccessToken() {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

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

    if (!response.ok) return null;

    const data = await response.json();
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

export async function getTwitchLiveMap(streamers) {
  const clientId = process.env.TWITCH_CLIENT_ID;
  if (!clientId || streamers.length === 0) return {};

  const accessToken = await getTwitchAppAccessToken();
  if (!accessToken) return {};

  const params = new URLSearchParams();
  streamers.forEach((s) => params.append('user_login', s));

  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/streams?${params.toString()}`,
      {
        headers: {
          'Client-Id': clientId,
          Authorization: `Bearer ${accessToken}`,
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) return {};

    const data = await response.json();

    const liveEntries = Array.isArray(data.data) ? data.data : [];

    return liveEntries.reduce((acc, stream) => {
      acc[stream.user_login.toLowerCase()] = {
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