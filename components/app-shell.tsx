import Link from "next/link";
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

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-200 bg-white md:flex dark:border-zinc-800 dark:bg-zinc-950">
        <div className="px-5 pt-6 pb-5">
          <BrandLink className="text-lg font-semibold tracking-tight" />
        </div>
        <NavLinks variant="sidebar" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-zinc-200 bg-white px-4 py-3 md:hidden dark:border-zinc-800 dark:bg-zinc-950">
          <BrandLink className="text-base font-semibold tracking-tight" />
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
