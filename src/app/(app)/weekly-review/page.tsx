import Link from "next/link";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Weekly review" };
export const dynamic = "force-dynamic";

export default async function WeeklyReviewPage() {
  const { supabase, user } = await requireUser();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const since = weekAgo.toISOString();
  const [insights, actions, outcomes, inbox] = await Promise.all([
    supabase.from("insights").select("id,title").eq("user_id", user.id).gte("created_at", since).is("deleted_at", null),
    supabase.from("actions").select("id,title,status").eq("user_id", user.id).gte("created_at", since),
    supabase.from("outcomes").select("id,description,insight_helpfulness,action:actions(title)").eq("user_id", user.id).gte("recorded_at", since),
    supabase.from("captures").select("id,content").eq("user_id", user.id).is("processed_at", null).is("archived_at", null).lt("created_at", since)
  ]);
  return <main className="page-content review-page"><Link href="/analytics" className="back-link">← Back to Progress</Link><header><span className="section-label">YOUR LAST 7 DAYS</span><h1>Weekly review</h1><p>Keep what changed your behavior. Release what no longer matters.</p></header><div className="review-grid"><section className="panel"><span>WHAT DID YOU LEARN?</span><h2>{insights.data?.length || 0} new insights</h2>{insights.data?.map(item => <Link href={`/library/${item.id}`} key={item.id}>{item.title}</Link>)}</section><section className="panel"><span>WHAT DID YOU APPLY?</span><h2>{actions.data?.filter(item => item.status === "completed").length || 0} actions completed</h2>{actions.data?.map(item => <Link href={`/actions/${item.id}`} key={item.id}>{item.title}<small>{item.status}</small></Link>)}</section><section className="panel"><span>WHAT WORKED?</span><h2>{outcomes.data?.filter(item => item.insight_helpfulness === "helpful").length || 0} positive outcomes</h2>{outcomes.data?.map(item => <p key={item.id}>{item.description || "Outcome recorded without notes."}</p>)}</section><section className="panel"><span>WHAT DID YOU IGNORE?</span><h2>{inbox.data?.length || 0} older captures</h2>{inbox.data?.slice(0, 5).map(item => <Link href={`/inbox/${item.id}`} key={item.id}>{item.content}</Link>)}</section></div></main>;
}
