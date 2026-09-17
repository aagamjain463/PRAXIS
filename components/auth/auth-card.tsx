import Link from "next/link";

export const AUTH_MISSION = "Turn what you learn into what you do.";

export function AuthCard({
  heading,
  subheading,
  children,
}: {
  heading: string;
  subheading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="rounded-md text-2xl font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100"
        >
          Praxis
        </Link>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {AUTH_MISSION}
        </p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
        <p className="mt-1.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {subheading}
        </p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
