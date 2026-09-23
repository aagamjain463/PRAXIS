import Link from "next/link";
import { Logo } from "@/components/logo";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return <main className="legal-page"><header className="public-nav page-width"><Logo /><Link href="/">Back home</Link></header><article><span>Last updated {updated}</span><h1>{title}</h1>{children}</article></main>;
}
