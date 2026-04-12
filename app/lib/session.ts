import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export type PortalUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: "admin" | "capoclan" | "user";
  roles: ("admin" | "capoclan" | "user")[];
  clanId: string | null;
  clanName: string | null;
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
  profileRoles?: string[] | null;
  clanId?: string | null;
  clanName?: string | null;
}): PortalSession | null {
  const email = params.user.email?.trim().toLowerCase();

  if (!email) {
    return null;
  }

  const normalizedRoles = Array.from(
    new Set(
      (params.profileRoles ?? [])
        .filter((role): role is "admin" | "capoclan" | "user" =>
          role === "admin" || role === "capoclan" || role === "user"
        )
        .concat(
          params.profileRole === "admin" || params.profileRole === "capoclan" || params.profileRole === "user"
            ? [params.profileRole]
            : []
        )
    )
  );

  if (!normalizedRoles.includes("user")) {
    normalizedRoles.unshift("user");
  }

  const role = normalizedRoles.includes("admin")
    ? "admin"
    : normalizedRoles.includes("capoclan")
      ? "capoclan"
      : "user";

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
      roles: normalizedRoles,
      clanId: params.clanId ?? null,
      clanName: params.clanName ?? null,
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
    .select("role, roles, clan_faction_id")
    .eq("id", userData.user.id)
    .maybeSingle();

  const clanId = profileData?.clan_faction_id ?? null;
  let clanName: string | null = null;

  if (clanId) {
    const { data: clanData } = await supabase
      .from("clanwar_factions")
      .select("name")
      .eq("id", clanId)
      .maybeSingle();

    clanName = clanData?.name ?? null;
  }

  return toPortalSession({
    user: userData.user,
    accessToken: sessionData.session?.access_token ?? null,
    profileRole: profileData?.role ?? null,
    profileRoles: profileData?.roles ?? null,
    clanId,
    clanName,
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
