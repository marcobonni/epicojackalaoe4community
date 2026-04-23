"use client";

import { useTransition } from "react";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-[2rem] border border-rose-500/25 bg-[#0b0708]/80 p-8 shadow-2xl shadow-black/30">
      <p className="text-sm uppercase tracking-[0.3em] text-rose-200">
        Servizio non disponibile
      </p>
      <h2 className="mt-4 text-3xl font-semibold text-white">
        L&apos;area tornei non e riuscita a completare la richiesta.
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-[#d8cbb7]">
        Potrebbe trattarsi di un problema temporaneo. Riprova tra un attimo e,
        se il problema continua, torna piu tardi.
      </p>

      <button
        type="button"
        onClick={() => startTransition(() => reset())}
        disabled={isPending}
className={`mt-6 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-[#1a0d0c] transition hover:bg-amber-300 ${
          isPending ? "cursor-not-allowed opacity-75 saturate-75" : ""
        }`}
      >
        {isPending ? "Riprovo..." : "Riprova"}
      </button>
    </div>
  );
}

