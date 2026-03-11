export default function TwitchStatusBadge({ isLive }) {
  return (
    <div
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isLive
          ? "border border-rose-400/30 bg-rose-400/10 text-rose-300"
          : "border border-slate-700 bg-slate-800 text-slate-300"
      }`}
    >
      {isLive ? "LIVE" : "OFFLINE"}
    </div>
  );
}