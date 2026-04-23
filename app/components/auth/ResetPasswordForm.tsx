"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/app/lib/supabase/client";
import {
  passwordPolicyItems,
  validatePasswordStrength,
} from "@/app/lib/auth/passwordPolicy";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    const passwordValidationError = validatePasswordStrength(password);

    if (passwordValidationError) {
      setErrorMessage(passwordValidationError);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Le due password non coincidono.");
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.updateUser({
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        await supabase.auth.signOut();
        router.push("/login?message=password_updated");
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Aggiornamento password non riuscito. Riprova."
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label htmlFor="reset-password" className="block">
        <span className="mb-2 block text-sm font-medium text-[#e8dcc8]">
          Nuova password
        </span>
        <input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          className="w-full rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
        />
        <span className="mt-2 block text-xs leading-6 text-[#8f7e69]">
          Requisiti password: {passwordPolicyItems.join(", ")}.
        </span>
      </label>

      <label htmlFor="reset-password-confirm" className="block">
        <span className="mb-2 block text-sm font-medium text-[#e8dcc8]">
          Conferma nuova password
        </span>
        <input
          id="reset-password-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          className="w-full rounded-2xl border border-[#4b312a] bg-[#140c0d] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
        />
      </label>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
className="flex w-full items-center justify-center rounded-2xl bg-amber-400 px-4 py-4 text-sm font-semibold text-[#1a0d0c] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Salvataggio..." : "Imposta nuova password"}
      </button>
    </form>
  );
}

