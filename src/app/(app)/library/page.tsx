import Link from "next/link";
import { Filter, Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Library" };
export const dynamic = "force-dynamic";

type SearchResult = { id: string; title: string; body: string; interpretation: string; visibility: string; created_at: string; action_title?: string | null; outcome_text?: string | null };

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ q?: string; visibility?: string; view?: string }> }) {
  const params = await searchParams;
  const q = (params.q || "").trim().slice(0, 200);
  const { supabase, user } = await requireUser();
  let insights: SearchResult[] = [];
  if (q) {
    const { data } = await supabase.rpc("search_my_knowledge", { query_text: q, query_embedding: null, match_count: 50 });
    insights = (data || []) as SearchResult[];
  } else {
    let query = supabase.from("insights").select("id,title,body,interpretation,visibility,created_at,actions:actions!actions_insight_id_fkey(title,status),outcomes:actions!actions_insight_id_fkey(outcomes(description))").eq("user_id", user.id).is("deleted_at", null).order("created_at", { ascending: false }).limit(100);
    if (["private", "unlisted", "public"].includes(params.visibility || "")) query = query.eq("visibility", params.visibility!);
    const { data } = await query;
    insights = (data || []).map((item: Record<string, unknown>) => ({ id: item.id as string, title: item.title as string, body: item.body as string, interpretation: item.interpretation as string, visibility: item.visibility as string, created_at: item.created_at as string }));
  }
  return <main className="page-content"><header className="page-header"><div><h1>Library</h1><p>Processed knowledge, organized around use—not collection.</p></div><span className="count-badge">{insights.length} insights</span></header><form className="library-toolbar"><label><Search size={16} /><input name="q" defaultValue={q} placeholder="Search ideas, interpretations, actions, outcomes…" /></label><select name="visibility" defaultValue={params.visibility || ""} aria-label="Visibility filter"><option value="">All visibility</option><option value="private">Private</option><option value="unlisted">Unlisted</option><option value="public">Public</option></select><button type="submit" className="button button-ghost"><Filter size={15} /> Filter</button></form>{q && <p className="search-summary">Results for “{q}” — including linked actions and outcomes.</p>}<div className="panel">{insights.length === 0 ? <EmptyState title={q ? "Nothing matched." : "Your library is empty."} body={q ? "Try a broader phrase, a source topic, or words from your interpretation." : "Process an Inbox capture. Its insight, interpretation, action, and eventual outcome will live here."} action="Open Inbox" href="/inbox" /> : <div className="library-grid">{insights.map(item => <Link href={`/library/${item.id}`} key={item.id} className="insight-card"><div><span className={`visibility ${item.visibility}`}>{item.visibility}</span><time>{formatDate(item.created_at)}</time></div><h2>{item.title}</h2><p>{item.body}</p>{item.interpretation && <blockquote>{item.interpretation}</blockquote>}{item.action_title && <small>Action: {item.action_title}</small>}{item.outcome_text && <small>Outcome: {item.outcome_text}</small>}</Link>)}</div>}</div></main>;
}
