import Link from "next/link";
import { Target } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { createGoal } from "../actions";
import { EmptyState } from "@/components/empty-state";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Goals" };
export const dynamic = "force-dynamic";

export default async function GoalsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("goals").select("id,title,description,status,target_date,actions(id,status),insight_goals(insight_id)").eq("user_id", user.id).order("created_at", { ascending: false });
  const goals = data || [];
  return <main className="page-content"><header className="page-header"><div><h1>Goals</h1><p>Context that helps Praxis surface the right knowledge.</p></div></header>{error && <div className="error-bar">{error}</div>}<div className="goal-layout"><section className="panel">{goals.length ? <div className="goal-list">{goals.map(goal => <Link href={`/goals/${goal.id}`} key={goal.id}><Target /><div><span>{goal.status}</span><h2>{goal.title}</h2><p>{goal.description || "No description"}</p><small>{goal.actions?.filter((item: { status: string }) => item.status === "active").length || 0} active actions · {goal.insight_goals?.length || 0} insights{goal.target_date ? ` · Target ${formatDate(goal.target_date)}` : ""}</small></div></Link>)}</div> : <EmptyState title="No goals yet." body="Goals help Praxis know why an insight matters. Keep the list short and current." />}</section><aside className="panel form-panel"><h2>Create a goal</h2><form action={createGoal} className="stack-form"><label>What matters now?<input name="title" placeholder="Launch my startup" required maxLength={240} /></label><label>Why?<textarea name="description" maxLength={2000} /></label><SubmitButton>Create goal</SubmitButton></form></aside></div></main>;
}
