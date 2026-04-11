"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/app/lib/supabase/client";

type SignOutButtonProps = {
  className?: string;
};

export default function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={
        className ??
        "rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-300 hover:text-amber-200"
      }
    >
      Logout
    </button>
  );
}
