import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="auth-shell"><div className="auth-brand"><Logo /><Link href="/">Back to site</Link></div>{children}<p className="auth-trust">Private by default. Your knowledge is never public unless you publish it.</p></main>;
}
