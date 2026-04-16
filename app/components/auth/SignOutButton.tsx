"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createSupabaseBrowserClient } from "@/app/lib/supabase/client";
import { useNavigationLoader } from "@/app/components/NavigationLoaderProvider";
import { useTranslations } from "@/app/components/LanguageProvider";

type SignOutButtonProps = {
  className?: string;
};

export default function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();
  const { startLoading } = useNavigationLoader();
  const [isPending, startTransition] = useTransition();
  const messages = useTranslations();

  async function handleSignOut() {
    startTransition(async () => {
      startLoading();
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className={`${
        className ??
        "cinematic-button-ghost"
      } ${isPending ? "cursor-not-allowed opacity-75 saturate-75" : ""}`}
    >
      {isPending ? messages.auth.signOutPending : messages.auth.signOut}
    </button>
  );
}
