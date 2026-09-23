import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Progress" };
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { supabase, user } = await requireUser();
  const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
  const [captures, processed, actions, completed, outcomes, applied] = await Promise.all([
    supabase.from("captures").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", start.toISOString()),
    supabase.from("insights").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", start.toISOString()).is("deleted_at", null),
    supabase.from("actions").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", start.toISOString()),
    supabase.from("actions").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed").gte("completed_at", start.toISOString()),
    supabase.from("outcomes").select("id,insight_helpfulness", { count: "exact" }).eq("user_id", user.id).gte("recorded_at", start.toISOString()),
    supabase.from("actions").select("insight_id", { count: "exact", head: true }).eq("user_id", user.id).not("insight_id", "is", null).gte("created_at", start.toISOString())
  ]);
  const positive = outcomes.data?.filter(item => item.insight_helpfulness === "helpful").length || 0;
  const completionRate = actions.count ? Math.round(((completed.count || 0) / actions.count) * 100) : 0;
  const applicationRate = processed.count ? Math.round(((applied.count || 0) / processed.count) * 100) : 0;
  return <main className="page-content analytics-page"><header className="page-header"><div><h1>Progress</h1><p>Measure whether learning changed something—not how many notes you collected.</p></div></header><section className="north-star"><BarChart3 /><div><span>THIS MONTH</span><h2>{completed.count || 0} things you learned changed something you actually did.</h2><p>{positive} outcomes marked helpful.</p></div></section><section className="analytics-grid">{[["Insights captured", captures.count || 0], ["Insights processed", processed.count || 0], ["Actions created", actions.count || 0], ["Actions completed", completed.count || 0], ["Outcomes recorded", outcomes.count || 0], ["Applied insights", applied.count || 0]].map(([label, value]) => <article className="panel" key={label}><span>{label}</span><strong>{value}</strong></article>)}</section><section className="rate-grid"><article className="panel"><div><span>Application rate</span><strong>{applicationRate}%</strong></div><div className="progress-track"><i style={{ width: `${applicationRate}%` }} /></div><p>Processed insights that became actions.</p></article><article className="panel"><div><span>Completion rate</span><strong>{completionRate}%</strong></div><div className="progress-track"><i style={{ width: `${completionRate}%` }} /></div><p>Created actions that reached an outcome.</p></article></section><Link href="/weekly-review" className="weekly-review-link panel"><div><span>WEEKLY REVIEW</span><h2>Turn activity into learning.</h2><p>Review what you captured, applied, and should carry forward.</p></div><ArrowRight /></Link></main>;
}
