import LoadingLink from "@/app/components/LoadingLink";
import SignOutButton from "@/app/components/auth/SignOutButton";
import { getTranslations } from "@/app/lib/i18n";
import { hasRole, type PortalSession } from "@/app/lib/session";

type PortalShellProps = {
  session: PortalSession | null;
  children: React.ReactNode;
};

export default async function PortalShell({
  session,
  children,
}: PortalShellProps) {
  const { messages } = await getTranslations();
  const shell = messages.portalShell;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#111827_100%)] text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <LoadingLink href="/" className="text-sm uppercase tracking-[0.35em] text-amber-300">
              EpicoJackal AoE4
            </LoadingLink>
            <p className="mt-2 text-sm text-slate-400">{shell.tagline}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LoadingLink
              href="/tournaments"
              prefetch={false}
              className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-amber-300 hover:text-amber-200"
            >
              {shell.tournaments}
            </LoadingLink>

            <LoadingLink
              href="/clanwars/risiko"
              prefetch={false}
              className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-amber-300 hover:text-amber-200"
            >
              {shell.clanWars}
            </LoadingLink>

            {session?.user ? (
              <>
                <LoadingLink
                  href="/dashboard"
                  prefetch={false}
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-amber-300 hover:text-amber-200"
                >
                  {shell.dashboard}
                </LoadingLink>

                {hasRole(session, "admin") ? (
                  <LoadingLink
                    href="/admin"
                    prefetch={false}
                    className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
                  >
                    {shell.admin}
                  </LoadingLink>
                ) : null}

                <div className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-200">
                  {session.user.name}
                </div>

                <SignOutButton />
              </>
            ) : (
              <>
                <LoadingLink
                  href="/register"
                  prefetch={false}
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-amber-300 hover:text-amber-200"
                >
                  {shell.register}
                </LoadingLink>

                <LoadingLink
                  href="/login"
                  prefetch={false}
                  className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
                >
                  {shell.login}
                </LoadingLink>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
