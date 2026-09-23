import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Bookmark, CheckCircle2, HeartHandshake, MessageCircle } from "lucide-react";
import { Logo } from "@/components/logo";
import { SubmitButton } from "@/components/submit-button";
import { addComment, applyPublicInsight, interactWithInsight, reportContent, savePublicInsight } from "@/app/(app)/actions";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

type SharedInsight = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  interpretation: string;
  slug: string;
  public_application: string;
  public_outcome: string;
  published_at: string;
  visibility: "public" | "unlisted";
  source_links: { excerpt: string; source: { title: string; creator: string; url: string | null; source_type: string } }[];
};

async function getInsight(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_shared_insight", { shared_slug: slug });
  return { supabase, insight: data as SharedInsight | null };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { insight } = await getInsight(slug);
  if (!insight) return { title: "Insight unavailable", robots: { index: false, follow: false } };
  const description = insight.interpretation || insight.body;
  return {
    title: insight.title,
    description: description.slice(0, 160),
    alternates: insight.visibility === "public" ? { canonical: `/i/${slug}` } : undefined,
    robots: insight.visibility === "unlisted" ? { index: false, follow: false } : undefined,
    openGraph: { title: insight.title, description: description.slice(0, 180), type: "article" }
  };
}

export const dynamic = "force-dynamic";

export default async function PublicInsightPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { supabase, insight } = await getInsight(slug);
  if (!insight) notFound();
  const isPublic = insight.visibility === "public";
  const [{ data: profile }, commentsResult, interactionsResult, { data: auth }] = await Promise.all([
    supabase.from("profiles").select("id,username,display_name,bio,avatar_url").eq("id", insight.user_id).single(),
    isPublic ? supabase.from("comments").select("id,user_id,body,created_at,deleted_at").eq("insight_id", insight.id).order("created_at").limit(100) : Promise.resolve({ data: [] }),
    isPublic ? supabase.from("public_interactions").select("kind").eq("insight_id", insight.id) : Promise.resolve({ data: [] }),
    supabase.auth.getUser()
  ]);
  const comments = commentsResult.data || [];
  const commenterIds = [...new Set(comments.map(item => item.user_id))];
  const { data: commenters } = commenterIds.length ? await supabase.from("profiles").select("id,display_name,username").in("id", commenterIds) : { data: [] };
  const commenterMap = new Map((commenters || []).map(item => [item.id, item]));
  const counts = (interactionsResult.data || []).reduce<Record<string, number>>((map, item) => ({ ...map, [item.kind]: (map[item.kind] || 0) + 1 }), {});
  const source = insight.source_links?.[0]?.source;

  return <main className="public-insight-page">
    <header className="public-nav page-width"><Logo /><div><Link href="/explore">Explore</Link>{auth.user ? <Link href="/today" className="button button-dark">Open Praxis</Link> : <><Link href="/login">Sign in</Link><Link href="/signup" className="button button-dark">Start free</Link></>}</div></header>
    <article className="public-article">
      <div className="public-topic">{isPublic ? "APPLIED INSIGHT" : "UNLISTED APPLIED INSIGHT"}</div>
      <h1>{insight.title}</h1>
      <div className="public-author"><div className="avatar">{profile?.display_name?.[0] || "P"}</div><div><Link href={profile?.username ? `/u/${profile.username}` : "#"}>{profile?.display_name || "Praxis member"}</Link><span>Published {formatDate(insight.published_at)}</span></div></div>
      <section><span>THE INSIGHT</span><p className="lead">{insight.body}</p></section>
      <section className="public-interpretation"><span>WHAT IT MEANT IN PRACTICE</span><p>{insight.interpretation}</p></section>
      {insight.public_application && <section><span>APPLICATION</span><h2>What they did</h2><p>{insight.public_application}</p></section>}
      {insight.public_outcome && <section className="public-outcome"><CheckCircle2 /><div><span>OUTCOME</span><p>{insight.public_outcome}</p></div></section>}
      {source && <section className="public-source"><span>ORIGINAL SOURCE · {source.source_type}</span><h2>{source.title || "Original source"}</h2>{source.creator && <p>{source.creator}</p>}{source.url && <a href={source.url} target="_blank" rel="noopener noreferrer">Visit source <ArrowUpRight size={14} /></a>}</section>}
      {isPublic ? <>
        <div className="public-signals"><span><Bookmark /> {counts.save || 0}<small>saved</small></span><span><CheckCircle2 /> {counts.applied || 0}<small>applied</small></span><span><HeartHandshake /> {counts.helpful || 0}<small>helpful</small></span></div>
        {auth.user ? <div className="public-actions"><form action={savePublicInsight}><input type="hidden" name="insightId" value={insight.id} /><button className="button button-primary"><Bookmark size={16} /> Save to my Praxis</button></form><form action={applyPublicInsight}><input type="hidden" name="insightId" value={insight.id} /><button className="button button-ghost"><CheckCircle2 size={16} /> Apply this</button></form><form action={interactWithInsight}><input type="hidden" name="insightId" value={insight.id} /><input type="hidden" name="kind" value="helpful" /><button className="button button-ghost"><HeartHandshake size={16} /> This helped</button></form></div> : <div className="apply-cta"><h2>Make this useful in your context.</h2><p>Save it privately, add your interpretation, and turn it into something you will do.</p><Link className="button button-primary" href="/signup">Start free</Link></div>}
        <section className="comments-section"><h2><MessageCircle /> Discussion</h2>{auth.user && <form action={addComment} className="comment-form"><input type="hidden" name="insightId" value={insight.id} /><input type="hidden" name="path" value={`/i/${slug}`} /><textarea name="body" placeholder="Add useful context or share what happened when you applied this…" maxLength={2000} required /><SubmitButton>Comment</SubmitButton></form>}<div>{comments.map(comment => { const author = commenterMap.get(comment.user_id); return <article key={comment.id}><div className="avatar">{author?.display_name?.[0] || "P"}</div><div><strong>{author?.display_name || "Praxis member"}</strong><time>{formatDate(comment.created_at)}</time><p>{comment.body}</p></div></article>; })}{!comments.length && <p className="small-empty">No discussion yet.</p>}</div></section>
        {auth.user && <details className="report-form"><summary>Report this insight</summary><form action={reportContent} className="stack-form"><input type="hidden" name="insightId" value={insight.id} /><input type="hidden" name="path" value={`/i/${slug}`} /><label>Reason<select name="reason"><option value="spam">Spam</option><option value="harassment">Harassment</option><option value="copyright">Copyright</option><option value="misinformation">Misinformation</option><option value="other">Other</option></select></label><label>Details<textarea name="details" maxLength={2000} /></label><SubmitButton className="button button-ghost">Submit report</SubmitButton></form></details>}
      </> : <div className="apply-cta"><h2>Shared privately by link.</h2><p>This insight is not listed in Explore and cannot receive community interactions.</p></div>}
    </article>
  </main>;
}
