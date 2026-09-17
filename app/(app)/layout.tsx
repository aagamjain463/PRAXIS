import { AppShell } from "../../components/app-shell";
import { requireUser } from "../../lib/auth/user";

// Authenticated product space. `requireUser()` redirects logged-out visitors
// to `/login` during server rendering, so protected UI is never rendered
// for them — no client-side gating, no content flash.
export default async function AppGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return <AppShell userEmail={user.email ?? ""}>{children}</AppShell>;
}
