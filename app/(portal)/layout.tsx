import PortalShell from "@/app/components/portal/PortalShell";
import { getOptionalSession } from "@/app/lib/session";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getOptionalSession();

  return <PortalShell session={session}>{children}</PortalShell>;
}
