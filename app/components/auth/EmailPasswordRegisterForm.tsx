"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/app/lib/supabase/client";
import {
  passwordPolicyItems,
  validatePasswordStrength,
} from "@/app/lib/auth/passwordPolicy";

type EmailPasswordRegisterFormProps = {
  next?: string;
};

function buildDisplayName(params: {
  email: string;
  steamName: string;
  discordName: string;
}) {
  return (
    params.steamName.trim() ||
    params.discordName.trim() ||
    params.email.split("@")[0]
  );
}

export default function EmailPasswordRegisterForm({
  next = "/dashboard",
}: EmailPasswordRegisterFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const steamName = String(formData.get("steamName") ?? "").trim();
    const discordName = String(formData.get("discordName") ?? "").trim();

    const passwordValidationError = validatePasswordStrength(password);

    if (passwordValidationError) {
      setErrorMessage(passwordValidationError);
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          next
        )}`;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo,
            data: {
              full_name: buildDisplayName({
                email,
                steamName,
                discordName,
              }),
              steam_name: steamName,
              discord_name: discordName,
            },
          },
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        if (data.session) {
          router.push(next);
          router.refresh();
          return;
        }

        setSuccessMessage(
          "Registrazione completata. Controlla la tua email e clicca il link di conferma per entrare nella dashboard."
        );
        setRegisteredEmail(email);
        form.reset();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Registrazione non riuscita. Riprova."
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label htmlFor="register-email" className="block">
        <span className="mb-2 block text-sm font-medium text-slate-200">Email</span>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
        />
      </label>

      <label htmlFor="register-password" className="block">
        <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
        />
        <span className="mt-2 block text-xs leading-6 text-slate-500">
          Requisiti password: {passwordPolicyItems.join(", ")}.
        </span>
      </label>

      <label htmlFor="register-steam" className="block">
        <span className="mb-2 block text-sm font-medium text-slate-200">
          Nome Steam
        </span>
        <input
          id="register-steam"
          name="steamName"
          type="text"
          autoComplete="nickname"
          required
          className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
        />
      </label>

      <label htmlFor="register-discord" className="block">
        <span className="mb-2 block text-sm font-medium text-slate-200">
          Nome Discord
        </span>
        <input
          id="register-discord"
          name="discordName"
          type="text"
          autoComplete="nickname"
          required
          className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
        />
      </label>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm leading-6 text-emerald-100">
          <p className="text-base font-semibold text-white">Email di conferma inviata</p>
          <p className="mt-2">{successMessage}</p>
          {registeredEmail ? (
            <p className="mt-3 rounded-2xl border border-emerald-400/20 bg-slate-950/40 px-4 py-3 font-mono text-xs text-emerald-100">
              {registeredEmail}
            </p>
          ) : null}
          <div className="mt-4 space-y-2 text-sm">
            <p>1. Apri la tua casella email.</p>
            <p>2. Cerca il messaggio di conferma di Supabase.</p>
            <p>3. Clicca il link e verrai mandato alla dashboard.</p>
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center rounded-2xl bg-amber-400 px-4 py-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Registrazione in corso..." : "Crea account"}
      </button>
    </form>
  );
}
