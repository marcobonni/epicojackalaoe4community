import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export type PortalUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: "admin" | "user";
};

export type PortalSession = {
  user: PortalUser;
  accessToken: string | null;
};

function toPortalSession(params: {
  user: {
    id: string;
    email?: string | null;
    user_metadata?: {
      avatar_url?: string | null;
      full_name?: string | null;
      name?: string | null;
    };
  };
  accessToken: string | null;
  profileRole?: string | null;
}): PortalSession | null {
  const email = params.user.email?.trim().toLowerCase();

  if (!email) {
    return null;
  }

  const role = params.profileRole === "admin" ? "admin" : "user";

  return {
    user: {
      id: params.user.id,
      email,
      name:
        params.user.user_metadata?.full_name ??
        params.user.user_metadata?.name ??
        email.split("@")[0],
      image: params.user.user_metadata?.avatar_url ?? null,
      role,
    },
    accessToken: params.accessToken,
  };
}

export async function getOptionalSession() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    )
  ) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: userData }, { data: sessionData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);

  if (!userData.user) {
    return null;
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  return toPortalSession({
    user: userData.user,
    accessToken: sessionData.session?.access_token ?? null,
    profileRole: profileData?.role ?? null,
  });
}

export async function getRequiredSession() {
  const session = await getOptionalSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function getRequiredAdminSession() {
  const session = await getRequiredSession();

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return session;
}
