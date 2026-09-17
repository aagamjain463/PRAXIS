"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = {
  href: string;
  label: string;
};

const LINKS: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/insights", label: "Insights" },
  { href: "/actions", label: "Actions" },
  { href: "/review", label: "Review" },
];

function isActiveLink(pathname: string, href: string): boolean {
  // Exact matching is deliberate: every Praxis route is a flat top-level
  // page, so the active destination is unambiguous.
  return pathname === href;
}

const linkBaseClassName =
  "rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100";

const sidebarLinkClassName = {
  active:
    "bg-zinc-900 font-semibold text-white dark:bg-zinc-100 dark:text-zinc-950",
  inactive:
    "font-normal text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
} as const;

const bottomLinkClassName = {
  active: "font-semibold text-zinc-950 dark:text-zinc-50",
  inactive: "font-normal text-zinc-500 dark:text-zinc-400",
} as const;

export function NavLinks({ variant }: { variant: "sidebar" | "bottom" }) {
  const pathname = usePathname();

  if (variant === "bottom") {
    return (
      <nav aria-label="Primary">
        <ul className="grid grid-cols-4">
          {LINKS.map((link) => {
            const active = isActiveLink(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`${linkBaseClassName} ${active ? bottomLinkClassName.active : bottomLinkClassName.inactive} flex min-h-14 flex-col items-center justify-center gap-1.5 px-2 py-2 text-xs`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-1 w-6 rounded-full ${active ? "bg-current" : "bg-transparent"}`}
                  />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="Primary">
      <ul className="space-y-1 px-3">
        {LINKS.map((link) => {
          const active = isActiveLink(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`${linkBaseClassName} ${active ? sidebarLinkClassName.active : sidebarLinkClassName.inactive} block px-3 py-2.5 text-sm`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
