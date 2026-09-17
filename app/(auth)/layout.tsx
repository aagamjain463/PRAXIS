import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth/user";

// Logged-in visitors never need these pages: send them into the app.
// Logged-out visitors fall through to the auth screens below.
export default async function AuthGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 font-sans text-zinc-950 sm:px-6 dark:bg-black dark:text-zinc-50">
      {children}
    </div>
  );
}
