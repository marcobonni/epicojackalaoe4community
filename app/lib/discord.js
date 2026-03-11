export async function getDiscordWidgetData(serverId) {
  if (!serverId) return null;

  try {
    const response = await fetch(
      `https://discord.com/api/guilds/${serverId}/widget.json`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) return null;

    return await response.json();
  } catch {
    return null;
  }
}