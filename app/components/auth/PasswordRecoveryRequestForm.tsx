"use client";

import { FormEvent, useState, useTransition } from "react";
import { useTranslations } from "@/app/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/app/lib/supabase/client";

export default function PasswordRecoveryRequestForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [recoveryEmail, setRecoveryEmail] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const messages = useTranslations();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          "/reset-password"
        )}`;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        setSuccessMessage(messages.auth.recoverySuccess);
        setRecoveryEmail(email);
        form.reset();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : messages.auth.recoveryGenericError
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label htmlFor="recovery-email" className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.26em] text-amber-200/88">
          {messages.auth.accountEmail}
        </span>
        <input
          id="recovery-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="cinematic-input text-sm"
        />
      </label>

      {errorMessage ? (
        <div className="cinematic-panel-soft rounded-[1.6rem] border border-rose-500/26 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="cinematic-panel-soft rounded-[1.8rem] border border-[#d9b265]/28 bg-[#d9b265]/10 p-5 text-sm leading-6 text-[#f8edd7]">
          <p className="text-base font-semibold text-white">
            {messages.auth.recoverySuccessTitle}
          </p>
          <p className="mt-2">{successMessage}</p>
          {recoveryEmail ? (
          <p className="mt-3 rounded-2xl border border-[#d9b265]/20 bg-[#0b0708]/40 px-4 py-3 font-mono text-xs text-[#f8edd7]">
              {recoveryEmail}
            </p>
          ) : null}
          <div className="mt-4 space-y-2 text-sm">
            {messages.auth.recoverySteps.map((step, index) => (
              <p key={step}>
                {index + 1}. {step}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="cinematic-button-ghost flex w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? messages.auth.recoveryPending : messages.auth.recoverySubmit}
      </button>
    </form>
  );
}

