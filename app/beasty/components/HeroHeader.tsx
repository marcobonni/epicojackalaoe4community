export default function HeroHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-10">
      <div className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
        Party Game AoE4
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() => {
            window.open(
              "https://discord.com/users/240210612582481922",
              "_blank"
            );
          }}
          className="inline-flex items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:border-amber-400/60 hover:bg-amber-400/15"
        >
          💬 Feedback
        </button>

        <button
          onClick={() => {
            window.localStorage.removeItem("beasty-landing-mode");
            window.location.href = "/";
          }}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-amber-400/50 hover:text-amber-300"
        >
          ← Home
        </button>
      </div>

      <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-5xl">
        {title}
      </h1>

      <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
        {description}
      </p>
    </div>
  );
}