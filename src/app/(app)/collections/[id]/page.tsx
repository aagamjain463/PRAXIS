import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { SubmitButton } from "@/components/submit-button";
import { requireUser } from "@/lib/auth";
import { addInsightToCollection } from "../../actions";

export const dynamic = "force-dynamic";

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const { data: collection } = await supabase.from("collections").select("*,collection_items(position,insight:insights(id,title,body,interpretation))").eq("id", id).eq("user_id", user.id).single();
  if (!collection) notFound();
  const { data: insights } = await supabase.from("insights").select("id,title").eq("user_id", user.id).is("deleted_at", null).order("created_at", { ascending: false }).limit(200);
  return <main className="page-content"><Link href="/collections" className="back-link">← Back to Collections</Link><header className="page-header"><div><span className="section-label">{collection.visibility}</span><h1>{collection.title}</h1><p>{collection.description}</p></div></header>{insights?.length ? <form action={addInsightToCollection} className="add-inline panel"><input type="hidden" name="collectionId" value={collection.id} /><label>Add an insight<select name="insightId">{insights.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><SubmitButton>Add</SubmitButton></form> : null}<div className="panel">{collection.collection_items?.length ? <div className="library-grid">{collection.collection_items.sort((a: { position: number }, b: { position: number }) => a.position - b.position).map((item: { insight: { id: string; title: string; body: string; interpretation: string } | { id: string; title: string; body: string; interpretation: string }[] }) => { const insight = Array.isArray(item.insight) ? item.insight[0] : item.insight; return insight && <Link className="insight-card" href={`/library/${insight.id}`} key={insight.id}><h2>{insight.title}</h2><p>{insight.body}</p><blockquote>{insight.interpretation}</blockquote></Link>; })}</div> : <EmptyState title="This collection is empty." body="Add a processed insight above when it belongs in this playbook." action="Browse Library" href="/library" />}</div></main>;
}
