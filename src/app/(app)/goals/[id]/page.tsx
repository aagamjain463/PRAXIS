import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { relativeDue } from "@/lib/format";
import { SubmitButton } from "@/components/submit-button";
import { linkActionToGoal, linkInsightToGoal } from "../../actions";

export const dynamic = "force-dynamic";

export default async function GoalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const { data: goal } = await supabase.from("goals").select("*,actions(*),insight_goals(insight:insights(id,title,body))").eq("id", id).eq("user_id", user.id).single();
  if (!goal) notFound();
  const [{ data: insights }, { data: actions }] = await Promise.all([
    supabase.from("insights").select("id,title").eq("user_id", user.id).is("deleted_at", null).order("created_at", { ascending: false }).limit(200),
    supabase.from("actions").select("id,title").eq("user_id", user.id).eq("status", "active").order("created_at", { ascending: false }).limit(200)
  ]);
  return <main className="page-content"><Link href="/goals" className="back-link">← Back to Goals</Link><header className="page-header"><div><span className="section-label">{goal.status}</span><h1>{goal.title}</h1><p>{goal.description}</p></div></header><div className="goal-linkers">{actions?.length ? <form action={linkActionToGoal} className="add-inline panel"><input type="hidden" name="goalId" value={goal.id} /><label>Link an action<select name="actionId">{actions.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><SubmitButton>Link</SubmitButton></form> : null}{insights?.length ? <form action={linkInsightToGoal} className="add-inline panel"><input type="hidden" name="goalId" value={goal.id} /><label>Link an insight<select name="insightId">{insights.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><SubmitButton>Link</SubmitButton></form> : null}</div><div className="goal-detail-grid"><section className="panel"><div className="panel-heading"><h2>Active actions</h2></div>{goal.actions?.filter((item: { status: string }) => item.status === "active").map((item: { id: string; title: string; due_at: string | null }) => <Link className="action-row" href={`/actions/${item.id}`} key={item.id}><span className="check-ring" /><strong>{item.title}</strong><time>{relativeDue(item.due_at)}</time></Link>)}{!goal.actions?.length && <div className="small-empty">Link an action above.</div>}</section><section className="panel"><div className="panel-heading"><h2>Related insights</h2></div>{goal.insight_goals?.map((item: { insight: { id: string; title: string; body: string } | { id: string; title: string; body: string }[] }) => { const insight = Array.isArray(item.insight) ? item.insight[0] : item.insight; return insight && <Link className="capture-row" href={`/library/${insight.id}`} key={insight.id}><strong>{insight.title}</strong><p>{insight.body}</p></Link>; })}{!goal.insight_goals?.length && <div className="small-empty">Link an insight above.</div>}</section></div></main>;
}
