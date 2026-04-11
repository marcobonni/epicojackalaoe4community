"use client";

import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/app/lib/supabase/client";

type DiscordAuthButtonProps = {
  next?: string;
  variant?: "login" | "register";
};

export default function DiscordAuthButton({
  next = "/dashboard",
  variant = "login",
}: DiscordAuthButtonProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDiscordAuth() {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          next
        )}`;

        const { error } = await supabase.auth.signInWithOAuth({
          provider: "discord",
          options: {
            redirectTo,
            scopes: "identify email",
          },
        });

        if (error) {
          setErrorMessage(error.message);
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Accesso con Discord non riuscito. Riprova."
        );
      }
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleDiscordAuth}
        disabled={isPending}
        className="flex w-full items-center justify-center rounded-2xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-4 text-sm font-semibold text-indigo-50 transition hover:border-indigo-400 hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending
          ? "Reindirizzamento a Discord..."
          : variant === "register"
            ? "Crea account con Discord"
            : "Accedi con Discord"}
      </button>

      <p className="text-xs leading-6 text-slate-500">
        Discord deve restituire un&apos;email valida, altrimenti il backend torneo
        non puo creare la sessione completa.
      </p>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}
