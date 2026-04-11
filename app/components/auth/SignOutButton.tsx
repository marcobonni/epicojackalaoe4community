"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createSupabaseBrowserClient } from "@/app/lib/supabase/client";
import { useNavigationLoader } from "@/app/components/NavigationLoaderProvider";

type SignOutButtonProps = {
  className?: string;
};

export default function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();
  const { startLoading } = useNavigationLoader();
  const [isPending, startTransition] = useTransition();

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
      className={
        `${
          className ??
          "rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-300 hover:text-amber-200"
        } ${isPending ? "cursor-not-allowed opacity-75 saturate-75" : ""}`
      }
    >
      {isPending ? "Logout in corso..." : "Logout"}
    </button>
  );
}
