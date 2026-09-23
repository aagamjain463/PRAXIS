import Link from "next/link";
import { CheckCircle2, Clock3, Inbox, RefreshCcw, Sparkles, Target } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { requireUser } from "@/lib/auth";
import { actionScore, formatDate, relativeDue } from "@/lib/format";

export const metadata = { title: "Today" };
export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const { supabase, user } = await requireUser();
  const now = new Date().toISOString();
  const [actionsResult, capturesResult, insightsResult, triggersResult] = await Promise.all([
    supabase.from("actions").select("id,title,action_type,priority,due_at,insight:insights!actions_insight_id_fkey(title)").eq("user_id", user.id).eq("status", "active").order("due_at", { ascending: true, nullsFirst: false }).limit(30),
    supabase.from("captures").select("id,content,captured_at").eq("user_id", user.id).is("processed_at", null).is("archived_at", null).order("captured_at", { ascending: false }).limit(3),
    supabase.from("insights").select("id,title,body,last_used_at,created_at").eq("user_id", user.id).is("deleted_at", null).order("last_used_at", { ascending: true, nullsFirst: true }).limit(1),
    supabase.from("context_triggers").select("id,label,insight:insights(id,title)").eq("user_id", user.id).eq("active", true).order("created_at", { ascending: false }).limit(3)
  ]);
  const actions = [...(actionsResult.data || [])].sort((a, b) => actionScore(b) - actionScore(a));
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const due = actions.filter(a => !a.due_at || a.due_at <= tomorrow.toISOString()).slice(0, 5);
  const habits = actions.filter(a => a.action_type === "habit").slice(0, 3);
  const experiments = actions.filter(a => a.action_type === "experiment").slice(0, 2);
  const inbox = capturesResult.data || [];
  const resurfaced = insightsResult.data?.[0];
  const triggers = triggersResult.data || [];
  const greeting = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date());

  return <main className="page-content today-page"><header className="page-header"><div><span className="section-label">{greeting}</span><h1>What deserves attention?</h1><p>A calm view of the knowledge and commitments that matter now.</p></div></header>{due.length === 0 && inbox.length === 0 && !resurfaced ? <div className="panel"><EmptyState title="Nothing needs your attention." body="Capture something useful. Praxis will help you turn it into action without creating another endless task list." action="Open Inbox" href="/inbox" /></div> : <><section className="today-grid"><div className="today-primary panel"><div className="panel-heading"><div><CheckCircle2 size={18} /><h2>Actions due</h2></div><Link href="/actions">View all</Link></div>{due.length ? <div className="action-list">{due.map(action => <Link href={`/actions/${action.id}`} key={action.id} className="action-row"><span className="check-ring" /><div><strong>{action.title}</strong><small>{(action.insight as unknown as { title?: string } | null)?.title || "Independent action"}</small></div><time className={action.due_at && action.due_at < now ? "overdue" : ""}>{relativeDue(action.due_at)}</time></Link>)}</div> : <div className="small-empty">No actions due. Your list is clear.</div>}</div><div className="today-secondary panel"><div className="panel-heading"><div><Inbox size={18} /><h2>Inbox</h2></div><span>{inbox.length} waiting</span></div>{inbox.length ? inbox.map(item => <Link className="capture-row" href={`/inbox/${item.id}`} key={item.id}><p>{item.content}</p><small>{formatDate(item.captured_at)}</small></Link>) : <div className="small-empty">Nothing to process.</div>}<Link href="/inbox" className="panel-link">Process Inbox →</Link></div></section>{resurfaced && <section className="resurface-card"><div className="resurface-icon"><Sparkles /></div><div><span>RESURFACED FROM YOUR LIBRARY</span><h2>{resurfaced.title}</h2><p>{resurfaced.body}</p><Link href={`/library/${resurfaced.id}`}>Open insight →</Link></div></section>}<section className="today-bottom">{habits.length > 0 && <div className="panel compact-panel"><div className="panel-heading"><div><RefreshCcw size={17} /><h2>Habits</h2></div></div>{habits.map(item => <Link href={`/actions/${item.id}`} key={item.id}><strong>{item.title}</strong><small>Continue today</small></Link>)}</div>}{experiments.length > 0 && <div className="panel compact-panel"><div className="panel-heading"><div><Target size={17} /><h2>Experiments running</h2></div></div>{experiments.map(item => <Link href={`/actions/${item.id}`} key={item.id}><strong>{item.title}</strong><small>{item.due_at ? `Review ${relativeDue(item.due_at)}` : "No conclusion date"}</small></Link>)}</div>}{triggers.length > 0 && <div className="panel compact-panel"><div className="panel-heading"><div><Sparkles size={17} /><h2>Relevant contexts</h2></div></div>{triggers.map(trigger => { const insight = trigger.insight as unknown as { id: string; title: string } | null; return insight && <Link href={`/library/${insight.id}`} key={trigger.id}><strong>When {trigger.label}</strong><small>{insight.title}</small></Link>; })}</div>}{actions.some(a => a.due_at && a.due_at < now) && <div className="panel compact-panel attention-panel"><div className="panel-heading"><div><Clock3 size={17} /><h2>Follow-up</h2></div></div><p>One or more commitments are overdue. Complete them honestly—even “partially” and “no” are useful outcomes.</p></div>}</section></>}</main>;
}
