import { notFound } from "next/navigation";
import { SubmitButton } from "@/components/submit-button";
import { moderateReport } from "../../actions";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Moderation" };
export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const { user } = await requireUser();
  const admins = (process.env.ADMIN_USER_IDS || "").split(",").map(item => item.trim()).filter(Boolean);
  if (!admins.includes(user.id)) notFound();
  const admin = createAdminClient();
  const { data } = await admin.from("reports").select("id,reporter_id,insight_id,comment_id,reason,details,status,created_at").in("status", ["open", "reviewing"]).order("created_at").limit(100);
  return <main className="page-content"><header className="page-header"><div><span className="section-label">ADMIN</span><h1>Moderation</h1><p>Review user reports. Hiding removes public access without destroying owner data.</p></div></header><div className="panel moderation-list">{data?.length ? data.map(report => <article key={report.id}><div><span>{report.reason}</span><strong>{report.insight_id ? `Insight ${report.insight_id}` : `Comment ${report.comment_id}`}</strong><p>{report.details || "No additional details."}</p><small>Reported {formatDate(report.created_at)}</small></div><form action={moderateReport}><input type="hidden" name="reportId" value={report.id} /><button name="decision" value="dismissed">Dismiss</button><button name="decision" value="resolved">Resolve</button><SubmitButton className="danger-button">Hide content</SubmitButton><input type="hidden" name="decision" value="hide" /></form></article>) : <div className="small-empty">No open reports.</div>}</div></main>;
}
