import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return <main className="status-page"><Logo /><span>404</span><h1>This knowledge is no longer here.</h1><p>The insight may be private, deleted, or moved.</p><Link href="/" className="button button-primary">Return to Praxis</Link></main>;
}
