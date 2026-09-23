import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="logo" aria-label="Praxis home">
      <span className="logo-mark" aria-hidden="true">P</span>
      {!compact && <span>Praxis</span>}
    </Link>
  );
}
