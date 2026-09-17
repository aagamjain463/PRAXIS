import Link from "next/link";
import { SignOutButton } from "./auth/sign-out-button";
import { NavLinks } from "./nav-links";

function BrandLink({ className }: { className: string }) {
  return (
    <Link
      href="/"
      className={`${className} rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100`}
    >
      Praxis
    </Link>
  );
}

const signOutButtonClassName =
  "rounded-md text-sm text-zinc-500 underline-offset-4 hover:text-zinc-950 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:opacity-60 dark:text-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-100";

export function AppShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-200 bg-white md:flex dark:border-zinc-800 dark:bg-zinc-950">
        <div className="px-5 pt-6 pb-5">
          <BrandLink className="text-lg font-semibold tracking-tight" />
        </div>
        <NavLinks variant="sidebar" />
        <div className="mt-auto border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
          {userEmail ? (
            <p
              className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200"
              title={userEmail}
            >
              {userEmail}
            </p>
          ) : null}
          <SignOutButton className={`${signOutButtonClassName} mt-1`} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3 md:hidden dark:border-zinc-800 dark:bg-zinc-950">
          <BrandLink className="shrink-0 text-base font-semibold tracking-tight" />
          <div className="flex min-w-0 items-center gap-3">
            {userEmail ? (
              <p
                className="truncate text-sm text-zinc-600 dark:text-zinc-400"
                title={userEmail}
              >
                {userEmail}
              </p>
            ) : null}
            <SignOutButton
              className={`${signOutButtonClassName} shrink-0 text-sm`}
            />
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-8 pb-28 sm:px-6 md:px-8 md:pt-12 md:pb-16">
          {children}
        </main>

        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-zinc-800 dark:bg-zinc-950/95">
          <NavLinks variant="bottom" />
        </div>
      </div>
    </div>
  );
}
