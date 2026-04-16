"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { useTranslations } from "@/app/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/app/lib/supabase/client";

type EmailPasswordLoginFormProps = {
  next?: string;
};

export default function EmailPasswordLoginForm({
  next = "/dashboard",
}: EmailPasswordLoginFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const messages = useTranslations();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        router.push(next);
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : messages.auth.loginGenericError
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label htmlFor="login-email" className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.26em] text-amber-200/88">
          {messages.auth.email}
        </span>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="cinematic-input text-sm"
        />
      </label>

      <label htmlFor="login-password" className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.26em] text-amber-200/88">
          {messages.auth.password}
        </span>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="cinematic-input text-sm"
        />
      </label>

      {errorMessage ? (
        <div className="cinematic-panel-soft rounded-[1.6rem] border border-rose-500/26 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="cinematic-button-primary flex w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? messages.auth.loginPending : messages.auth.loginSubmit}
      </button>
    </form>
  );
}
