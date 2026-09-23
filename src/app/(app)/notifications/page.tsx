import Link from "next/link";
import { Bell } from "lucide-react";
import { markNotificationsRead } from "../actions";
import { EmptyState } from "@/components/empty-state";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
  const notifications = data || [];
  return <main className="page-content"><header className="page-header"><div><h1>Notifications</h1><p>Only reminders and follow-ups that help you apply knowledge.</p></div>{notifications.some(item => !item.read_at) && <form action={markNotificationsRead}><button className="button button-ghost">Mark all read</button></form>}</header><div className="panel">{notifications.length ? <div className="notification-list">{notifications.map(item => <Link href={item.href || "/today"} key={item.id} className={item.read_at ? "" : "unread"}><div><Bell size={16} /></div><span><strong>{item.title}</strong><p>{item.body}</p><time>{formatDate(item.created_at, { dateStyle: "medium", timeStyle: "short" })}</time></span></Link>)}</div> : <EmptyState title="You’re all caught up." body="Action reminders, outcome check-ins, and useful contextual resurfacing appear here. Praxis keeps this list quiet on purpose." />}</div></main>;
}
