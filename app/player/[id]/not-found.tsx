export default function PlayerNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-6 text-white">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl shadow-black/30">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
          Player dashboard
        </p>

        <h1 className="mt-4 text-3xl font-bold text-white">
          Giocatore non trovato
        </h1>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          Controlla l&apos;ID del profilo AoE4World e riprova.
        </p>
      </div>
    </main>
  );
}