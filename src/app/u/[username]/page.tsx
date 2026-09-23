import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { followProfile } from "@/app/(app)/actions";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}`, description: `Applied insights from @${username} on Praxis.` };
}

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("id,username,display_name,bio,interests,created_at").eq("username", username).eq("profile_visibility", "public").single();
  if (!profile) notFound();
  const { data: insights } = await supabase.from("insights").select("id,title,body,interpretation,slug,published_at,public_outcome").eq("user_id", profile.id).eq("visibility", "public").is("deleted_at", null).order("published_at", { ascending: false });
  const [{ data: auth }, { count: followerCount }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("follows").select("follower_id", { count: "exact", head: true }).eq("followed_id", profile.id)
  ]);
  const { data: relationship } = auth.user ? await supabase.from("follows").select("followed_id").eq("follower_id", auth.user.id).eq("followed_id", profile.id).maybeSingle() : { data: null };
  return <main className="public-profile"><header className="public-nav page-width"><Logo /><div><Link href="/explore">Explore</Link>{auth.user ? <Link href="/today" className="button button-dark">Open Praxis</Link> : <Link href="/signup" className="button button-dark">Start free</Link>}</div></header><section className="public-profile-header page-width"><div className="profile-avatar">{profile.display_name?.[0] || "P"}</div><span>@{profile.username}</span><h1>{profile.display_name}</h1><p>{profile.bio}</p><div>{(profile.interests as string[] | null)?.map((item: string) => <span key={item}>{item}</span>)}</div><small>{followerCount || 0} followers · Practicing since {formatDate(profile.created_at, { month: "long", year: "numeric" })}</small>{auth.user && auth.user.id !== profile.id && (relationship ? <button className="button button-ghost" disabled>Following</button> : <form action={followProfile}><input type="hidden" name="followedId" value={profile.id} /><input type="hidden" name="path" value={`/u/${username}`} /><button className="button button-primary">Follow</button></form>)}</section><section className="public-profile-insights page-width"><h2>Applied Insights</h2><div className="explore-grid">{insights?.map(item => <Link href={`/i/${item.slug}`} className="public-card" key={item.id}><time>{formatDate(item.published_at)}</time><h2>{item.title}</h2><p>{item.body}</p><blockquote>{item.interpretation}</blockquote>{item.public_outcome && <small>Outcome: {item.public_outcome}</small>}</Link>)}</div></section></main>;
}
