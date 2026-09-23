import Link from "next/link";
import { Archive } from "lucide-react";
import { archiveCapture } from "../actions";
import { EmptyState } from "@/components/empty-state";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Inbox" };
export const dynamic = "force-dynamic";

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ captured?: string; welcome?: string; error?: string }> }) {
  const params = await searchParams;
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("captures").select("id,content,quick_note,captured_at,source:sources(title,source_type,url)").eq("user_id", user.id).is("processed_at", null).is("archived_at", null).order("captured_at", { ascending: false }).limit(100);
  const captures = data || [];
  return <main className="page-content"><header className="page-header"><div><h1>Inbox</h1><p>Capture fast. Process thoughtfully when you have attention.</p></div><span className="count-badge">{captures.length} unprocessed</span></header>{params.welcome && <div className="notice-bar">You’re ready. Capture your first useful idea with the Capture button above.</div>}{params.captured && <div className="notice-bar">Saved. Decide what it means when you’re ready.</div>}{params.error && <div className="error-bar">{params.error}</div>}<div className="panel">{captures.length === 0 ? <EmptyState title="Nothing to process." body="When you capture something useful, it appears here until you decide what it means and whether you want to act on it." action="Browse your library" href="/library" /> : <div className="inbox-list">{captures.map(item => { const source = Array.isArray(item.source) ? item.source[0] : item.source; return <article key={item.id}><Link href={`/inbox/${item.id}`}><div className="source-line"><span>{source?.source_type || "thought"}</span><time>{formatDate(item.captured_at)}</time></div><p>{item.content}</p>{item.quick_note && <small>Note: {item.quick_note}</small>}{source?.title && <div className="source-meta">{source.title}</div>}</Link><form action={archiveCapture}><input type="hidden" name="id" value={item.id} /><button type="submit" aria-label="Archive capture" title="Archive"><Archive size={15} /></button></form></article>; })}</div>}</div></main>;
}
