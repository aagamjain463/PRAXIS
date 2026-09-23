import Link from "next/link";
import { BookOpen } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { createCollection } from "../actions";
import { EmptyState } from "@/components/empty-state";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Collections" };
export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("collections").select("id,title,description,visibility,collection_items(insight_id)").eq("user_id", user.id).order("created_at", { ascending: false });
  const collections = data || [];
  return <main className="page-content"><header className="page-header"><div><h1>Collections</h1><p>Small, purposeful groups of insights. Not another folder graveyard.</p></div></header><div className="goal-layout"><section className="panel">{collections.length ? <div className="collection-grid">{collections.map(collection => <Link href={`/collections/${collection.id}`} key={collection.id}><BookOpen /><span>{collection.visibility}</span><h2>{collection.title}</h2><p>{collection.description || "No description"}</p><small>{collection.collection_items?.length || 0} insights</small></Link>)}</div> : <EmptyState title="No collections yet." body="Create one when a group of insights supports a real outcome, project, or recurring situation." />}</section><aside className="panel form-panel"><h2>Create collection</h2><form action={createCollection} className="stack-form"><label>Title<input name="title" placeholder="Startup fundamentals" required maxLength={240} /></label><label>Description<textarea name="description" placeholder="What is this collection for?" maxLength={2000} /></label><SubmitButton>Create collection</SubmitButton></form></aside></div></main>;
}
