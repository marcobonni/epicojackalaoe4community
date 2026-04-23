"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { useTranslations } from "@/app/components/LanguageProvider";
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
  const messages = useTranslations();

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

        setSuccessMessage(messages.auth.registerSuccess);
        setRegisteredEmail(email);
        form.reset();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : messages.auth.registerGenericError
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label htmlFor="register-email" className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.26em] text-amber-200/88">
          {messages.auth.email}
        </span>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="cinematic-input text-sm"
        />
      </label>

      <label htmlFor="register-password" className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.26em] text-amber-200/88">
          {messages.auth.password}
        </span>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          className="cinematic-input text-sm"
        />
        <span className="mt-2 block text-xs leading-6 text-[#bcae9a]/74">
          {messages.auth.passwordRequirementsPrefix}: {passwordPolicyItems.join(", ")}.
        </span>
      </label>

      <label htmlFor="register-steam" className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.26em] text-amber-200/88">
          {messages.auth.steamName}
        </span>
        <input
          id="register-steam"
          name="steamName"
          type="text"
          autoComplete="nickname"
          required
          className="cinematic-input text-sm"
        />
      </label>

      <label htmlFor="register-discord" className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.26em] text-amber-200/88">
          {messages.auth.discordName}
        </span>
        <input
          id="register-discord"
          name="discordName"
          type="text"
          autoComplete="nickname"
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
            {messages.auth.registerSuccessTitle}
          </p>
          <p className="mt-2">{successMessage}</p>
          {registeredEmail ? (
          <p className="mt-3 rounded-2xl border border-[#d9b265]/20 bg-[#0b0708]/40 px-4 py-3 font-mono text-xs text-[#f8edd7]">
              {registeredEmail}
            </p>
          ) : null}
          <div className="mt-4 space-y-2 text-sm">
            {messages.auth.registerSteps.map((step, index) => (
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
        className="cinematic-button-primary flex w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? messages.auth.registerPending : messages.auth.registerSubmit}
      </button>
    </form>
  );
}

