import Link from "next/link";
import { BarChart3, Bell, BookOpen, CheckSquare2, Compass, Goal, Inbox, Library, MessageCircleQuestion, Settings, Sun } from "lucide-react";
import { Logo } from "@/components/logo";
import { signout } from "@/app/(auth)/actions";

const primary = [
  ["Today", "/today", Sun],
  ["Inbox", "/inbox", Inbox],
  ["Library", "/library", Library],
  ["Actions", "/actions", CheckSquare2],
  ["Ask Praxis", "/ask", MessageCircleQuestion],
  ["Explore", "/explore", Compass]
] as const;

const secondary = [
  ["Goals", "/goals", Goal],
  ["Collections", "/collections", BookOpen],
  ["Progress", "/analytics", BarChart3],
  ["Notifications", "/notifications", Bell],
  ["Settings", "/settings", Settings]
] as const;

export function AppNav({ name, inboxCount }: { name: string; inboxCount: number }) {
  return <aside className="app-sidebar"><div className="sidebar-top"><Logo /></div><nav aria-label="Primary">{primary.map(([label, href, Icon]) => <Link href={href} key={href}><Icon size={17} /><span>{label}</span>{label === "Inbox" && inboxCount > 0 && <b>{inboxCount}</b>}</Link>)}</nav><div className="nav-rule" /><nav aria-label="Workspace">{secondary.map(([label, href, Icon]) => <Link href={href} key={href}><Icon size={16} /><span>{label}</span></Link>)}</nav><div className="sidebar-user"><div className="avatar">{name.slice(0, 1).toUpperCase()}</div><div><strong>{name}</strong><Link href="/profile">View profile</Link></div><form action={signout}><button type="submit" title="Sign out">↗</button></form></div></aside>;
}

export function MobileNav() {
  return <nav className="mobile-nav" aria-label="Mobile navigation">{primary.slice(0, 5).map(([label, href, Icon]) => <Link href={href} key={href}><Icon size={19} /><span>{label === "Ask Praxis" ? "Ask" : label}</span></Link>)}</nav>;
}
