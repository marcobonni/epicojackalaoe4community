import LoadingLink from "@/app/components/LoadingLink";
import SignOutButton from "@/app/components/auth/SignOutButton";
import { getTranslations } from "@/app/lib/i18n";
import { hasRole, type PortalSession } from "@/app/lib/session";

type PortalShellProps = {
  session: PortalSession | null;
  children: React.ReactNode;
};

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <LoadingLink href={href} prefetch={false} className="cinematic-pill">
      {children}
    </LoadingLink>
  );
}

export default async function PortalShell({
  session,
  children,
}: PortalShellProps) {
  const { messages } = await getTranslations();
  const shell = messages.portalShell;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_20%),linear-gradient(180deg,#030611_0%,#09101f_48%,#030611_100%)] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(4,7,18,0.72)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-4 py-4 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <LoadingLink
                href="/"
                className="inline-flex items-center rounded-full border border-amber-300/18 bg-amber-300/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.38em] text-amber-200"
              >
                AoE4 Community
              </LoadingLink>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300/78">
                {shell.tagline}
              </p>
            </div>

            <div className="cinematic-panel-soft flex items-center gap-3 rounded-[1.7rem] px-4 py-3">
              {session?.user ? (
                <>
                  <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200 sm:block">
                    {session.user.name}
                  </div>
                  <SignOutButton />
                </>
              ) : (
                <>
                  <NavLink href="/register">{shell.register}</NavLink>
                  <LoadingLink href="/login" prefetch={false} className="cinematic-button-primary">
                    {shell.login}
                  </LoadingLink>
                </>
              )}
            </div>
          </div>

          <nav className="flex flex-wrap gap-3">
            <NavLink href="/tournaments">{shell.tournaments}</NavLink>
            <NavLink href="/clanwars/risiko">{shell.clanWars}</NavLink>
            {session?.user ? <NavLink href="/dashboard">{shell.dashboard}</NavLink> : null}
            {hasRole(session, "admin") ? <NavLink href="/admin">{shell.admin}</NavLink> : null}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
        {children}
      </main>
    </div>
  );
}
