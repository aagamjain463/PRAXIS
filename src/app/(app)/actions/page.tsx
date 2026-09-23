import Link from "next/link";
import { CheckCircle2, FlaskConical, ListTodo, Repeat2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { requireUser } from "@/lib/auth";
import { relativeDue } from "@/lib/format";

export const metadata = { title: "Actions" };
export const dynamic = "force-dynamic";

export default async function ActionsPage({ searchParams }: { searchParams: Promise<{ status?: string; type?: string }> }) {
  const params = await searchParams;
  const { supabase, user } = await requireUser();
  let query = supabase.from("actions").select("id,title,description,action_type,status,priority,due_at,completed_at,insight:insights!actions_insight_id_fkey(title)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
  if (["active", "completed", "paused", "cancelled"].includes(params.status || "")) query = query.eq("status", params.status!);
  if (["task", "scheduled", "habit", "experiment", "decision_rule", "contextual"].includes(params.type || "")) query = query.eq("action_type", params.type!);
  const { data } = await query;
  const actions = data || [];
  const active = actions.filter(item => item.status === "active").length;
  const completed = actions.filter(item => item.status === "completed").length;
  const habits = actions.filter(item => item.action_type === "habit").length;
  const experiments = actions.filter(item => item.action_type === "experiment" && item.status === "active").length;
  return <main className="page-content"><header className="page-header"><div><h1>Actions</h1><p>Commitments created from what you learned.</p></div></header><div className="metric-strip"><div><ListTodo /><strong>{active}</strong><span>Active</span></div><div><CheckCircle2 /><strong>{completed}</strong><span>Completed</span></div><div><Repeat2 /><strong>{habits}</strong><span>Habits</span></div><div><FlaskConical /><strong>{experiments}</strong><span>Experiments</span></div></div><form className="filter-row"><select name="status" defaultValue={params.status || "active"}><option value="">All status</option><option value="active">Active</option><option value="completed">Completed</option><option value="paused">Paused</option><option value="cancelled">Cancelled</option></select><select name="type" defaultValue={params.type || ""}><option value="">All types</option><option value="task">Tasks</option><option value="scheduled">Scheduled</option><option value="habit">Habits</option><option value="experiment">Experiments</option><option value="decision_rule">Decision rules</option><option value="contextual">Contextual</option></select><button className="button button-ghost">Apply</button></form><div className="panel">{actions.length === 0 ? <EmptyState title="No actions here." body="Process an insight and decide what it changes. Specific commitments will appear here and on Today." action="Process Inbox" href="/inbox" /> : <div className="actions-table">{actions.map(item => { const insight = Array.isArray(item.insight) ? item.insight[0] : item.insight; return <Link href={`/actions/${item.id}`} key={item.id}><span className={`action-state ${item.status}`}><i />{item.status}</span><div><strong>{item.title}</strong><small>{insight?.title || item.description || "Independent action"}</small></div><span className="type-chip">{item.action_type.replaceAll("_", " ")}</span><time>{item.status === "completed" ? "Completed" : relativeDue(item.due_at)}</time></Link>; })}</div>}</div></main>;
}
