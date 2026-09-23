import Link from "next/link";
import { Bookmark, CheckCircle2, Compass, HeartHandshake } from "lucide-react";
import { applyPublicInsight, savePublicInsight } from "@/app/(app)/actions";
import { EmptyState } from "@/components/empty-state";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { hasSupabaseEnv } from "@/lib/env";

export const metadata = { title: "Explore" };
export const dynamic = "force-dynamic";

const topics = ["Startups", "Productivity", "Career", "Learning", "Leadership", "Marketing", "Sales", "Health", "Finance", "Relationships", "Creativity"];

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ sort?: string; topic?: string }> }) {
  const params = await searchParams;
  if (!hasSupabaseEnv()) return <main className="public-explore"><header className="public-nav page-width"><Logo /><div><Link href="/login">Sign in</Link><Link href="/signup" className="button button-dark">Start free</Link></div></header><div className="page-content explore-page"><header className="page-header"><div><h1>Explore</h1><p>Applied knowledge, ranked by use and outcomes—not attention.</p></div></header><div className="panel"><EmptyState title="Public knowledge is still quiet." body="Connect Supabase to publish and discover Applied Insights. Praxis never substitutes invented community activity." action="Start your Praxis" href="/signup" /></div></div></main>;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  let query = supabase.from("insights").select("id,user_id,title,body,interpretation,slug,public_application,public_outcome,published_at,created_at").eq("visibility", "public").is("deleted_at", null).order("published_at", { ascending: false }).limit(60);
  if (params.topic) query = query.ilike("body", `%${params.topic.replace(/[%_]/g, "")}%`);
  const { data: raw } = await query;
  const insights = raw || [];
  const ids = insights.map(item => item.id);
  const userIds = [...new Set(insights.map(item => item.user_id))];
  const [{ data: profiles }, { data: interactions }] = await Promise.all([
    userIds.length ? supabase.from("profiles").select("id,username,display_name,avatar_url").in("id", userIds) : Promise.resolve({ data: [] }),
    ids.length ? supabase.from("public_interactions").select("insight_id,kind").in("insight_id", ids) : Promise.resolve({ data: [] })
  ]);
  const { data: followedRows } = auth.user ? await supabase.from("follows").select("followed_id").eq("follower_id", auth.user.id) : { data: [] };
  const followed = new Set((followedRows || []).map(item => item.followed_id));
  const profileMap = new Map((profiles || []).map(profile => [profile.id, profile]));
  const counts = new Map<string, Record<string, number>>();
  for (const interaction of interactions || []) { const entry = counts.get(interaction.insight_id) || {}; entry[interaction.kind] = (entry[interaction.kind] || 0) + 1; counts.set(interaction.insight_id, entry); }
  if (params.sort === "applied") insights.sort((a, b) => (counts.get(b.id)?.applied || 0) - (counts.get(a.id)?.applied || 0));
  if (params.sort === "helpful") insights.sort((a, b) => (counts.get(b.id)?.helpful || 0) - (counts.get(a.id)?.helpful || 0));
  if (!params.sort && followed.size) insights.sort((a, b) => Number(followed.has(b.user_id)) - Number(followed.has(a.user_id)));
  return <main className="public-explore"><header className="public-nav page-width"><Logo /><div>{auth.user ? <Link href="/today" className="button button-dark">Open Praxis</Link> : <><Link href="/login">Sign in</Link><Link href="/signup" className="button button-dark">Start free</Link></>}</div></header><div className="page-content explore-page"><header className="page-header"><div><h1>Explore</h1><p>Applied knowledge, ranked by use and outcomes—not attention.</p></div></header><div className="topic-scroll"><Link href="/explore" className={!params.topic ? "active" : ""}>All topics</Link>{topics.map(topic => <Link className={params.topic === topic ? "active" : ""} href={`/explore?topic=${encodeURIComponent(topic)}`} key={topic}>{topic}</Link>)}</div><div className="explore-sort"><Link href="/explore" className={!params.sort ? "active" : ""}>Latest</Link><Link href="/explore?sort=applied" className={params.sort === "applied" ? "active" : ""}>Most applied</Link><Link href="/explore?sort=helpful" className={params.sort === "helpful" ? "active" : ""}>Most helpful</Link></div>{insights.length === 0 ? <div className="panel"><EmptyState title="Public knowledge is still quiet." body="Praxis prioritizes thoughtful applied insights over an endless feed. Publish one from your Library when it has something useful to teach." action={auth.user ? "Open Library" : "Start your Praxis"} href={auth.user ? "/library" : "/signup"} /></div> : <div className="explore-grid">{insights.map(item => { const profile = profileMap.get(item.user_id); const signal = counts.get(item.id) || {}; return <article className="public-card" key={item.id}><div className="author-line"><div className="avatar">{profile?.display_name?.[0] || "P"}</div><div><Link href={profile?.username ? `/u/${profile.username}` : `/i/${item.slug}`}>{profile?.display_name || "Praxis member"}</Link><time>{formatDate(item.published_at)}</time></div></div><Link href={`/i/${item.slug}`}><h2>{item.title}</h2><p>{item.body}</p><blockquote>{item.interpretation}</blockquote>{item.public_outcome && <div className="outcome-signal"><CheckCircle2 size={15} /> {item.public_outcome}</div>}</Link><div className="signal-row"><span><Bookmark size={14} /> {signal.save || 0} saved</span><span><CheckCircle2 size={14} /> {signal.applied || 0} applied</span><span><HeartHandshake size={14} /> {signal.helpful || 0} helpful</span></div><div className="card-actions">{auth.user ? <><form action={savePublicInsight}><input type="hidden" name="insightId" value={item.id} /><button type="submit"><Bookmark size={15} /> Save to my Praxis</button></form><form action={applyPublicInsight}><input type="hidden" name="insightId" value={item.id} /><button type="submit"><Compass size={15} /> Apply this</button></form></> : <Link href="/signup">Save or apply in Praxis →</Link>}</div></article>; })}</div>}</div></main>;
}
