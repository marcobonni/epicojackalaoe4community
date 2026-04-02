export function formatChatTime(timestamp: number) {
  const date = new Date(timestamp);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}