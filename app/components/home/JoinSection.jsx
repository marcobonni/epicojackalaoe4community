import { SERVER_CONFIG } from "@/app/config/site";

export default function JoinSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-3">

        <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 lg:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
            Cosa trovi dentro
          </p>

          <ul className="mt-6 space-y-4 text-slate-300">
            <li>Canali dedicati alle civiltà, alle strategie e ai replay (NO RAION)</li>
            <li>Eventi community per giocare insieme e conoscere nuovi player</li>
            <li>Spazio per creator, clip, meme e discussioni competitive (NO MARCOTAMBY)</li>
            <li>Organizzazione semplice per tornei, team game e serate speciali (NO ORGANIZZATI DA COOP)</li>
          </ul>
        </div>

        <div
          id="join"
          className="rounded-[2rem] border border-amber-400/30 bg-amber-400/10 p-8"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-200">
            Join now
          </p>

          <h3 className="mt-4 text-2xl font-bold text-white">
            Porta il tuo gameplay al livello successivo
          </h3>

          <p className="mt-4 text-sm leading-7 text-amber-50/90">
            Clicca qui e inizia a giocare subito!
          </p>

          <a
            target="_blank"
            rel="noopener noreferrer"
            href={SERVER_CONFIG.inviteUrl}
            className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5"
          >
            Vai al Discord!
          </a>
        </div>

      </div>
    </section>
  );
}