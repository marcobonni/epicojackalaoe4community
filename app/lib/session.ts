import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";
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

export function hasRole(
  session: PortalSession | null | undefined,
  role: "admin" | "capoclan" | "user"
) {
  return session?.user.roles.includes(role) === true;
}

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

  console.log("[clanwars-session][server] auth state", {
    hasUser: Boolean(userData.user),
    userId: userData.user?.id ?? null,
    email: userData.user?.email ?? null,
    hasAccessToken: Boolean(sessionData.session?.access_token),
  });

  if (!userData.user) {
    return null;
  }

  let profileData:
    | {
        role: string | null;
        roles: string[] | null;
        clan_faction_id: string | null;
      }
    | null = null;
  let profileErrorMessage: string | null = null;

  try {
    const adminSupabase = createSupabaseAdminClient();
    const { data, error } = await adminSupabase
      .from("profiles")
      .select("role, roles, clan_faction_id")
      .eq("id", userData.user.id)
      .maybeSingle();

    profileData = data;
    profileErrorMessage = error?.message ?? null;
  } catch (error) {
    profileErrorMessage = error instanceof Error ? error.message : "Unknown admin profile lookup error";
  }

  if (!profileData) {
    const { data, error } = await supabase
      .from("profiles")
      .select("role, roles, clan_faction_id")
      .eq("id", userData.user.id)
      .maybeSingle();

    profileData = data;
    profileErrorMessage = profileErrorMessage ?? error?.message ?? null;
  }

  const clanId = profileData?.clan_faction_id ?? null;
  let clanName: string | null = null;

  if (clanId) {
    try {
      const adminSupabase = createSupabaseAdminClient();
      const { data: clanData } = await adminSupabase
        .from("clanwar_factions")
        .select("name")
        .eq("id", clanId)
        .maybeSingle();

      clanName = clanData?.name ?? null;
    } catch {
      const { data: clanData } = await supabase
        .from("clanwar_factions")
        .select("name")
        .eq("id", clanId)
        .maybeSingle();

      clanName = clanData?.name ?? null;
    }
  }

  console.log("[clanwars-session][server] profile state", {
    userId: userData.user.id,
    profileRole: profileData?.role ?? null,
    profileRoles: profileData?.roles ?? null,
    clanId,
    clanName,
    profileErrorMessage,
  });

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

  if (!hasRole(session, "admin")) {
    redirect("/dashboard");
  }

  return session;
}
