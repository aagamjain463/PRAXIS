import Link from "next/link";
import { Settings } from "lucide-react";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { supabase, user } = await requireUser();
  const [{ data: profile }, { data: insights }, { count: applied }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("insights").select("id,title,body,slug,published_at").eq("user_id", user.id).eq("visibility", "public").is("deleted_at", null).order("published_at", { ascending: false }),
    supabase.from("actions").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed").not("insight_id", "is", null)
  ]);
  return <main className="page-content profile-page"><header className="profile-header"><div className="profile-avatar">{profile?.display_name?.[0] || "P"}</div><div><h1>{profile?.display_name}</h1><span>@{profile?.username || "choose-a-username"}</span><p>{profile?.bio || "Add a short bio in Settings."}</p><div><strong>{insights?.length || 0}</strong> public insights <strong>{applied || 0}</strong> applied insights</div></div><Link href="/settings" className="button button-ghost"><Settings size={15} /> Edit profile</Link></header><div className="section-title"><h2>Public Applied Insights</h2>{profile?.username && <Link href={`/u/${profile.username}`}>View public profile →</Link>}</div><div className="library-grid">{insights?.map(item => <Link href={`/i/${item.slug}`} className="insight-card" key={item.id}><h2>{item.title}</h2><p>{item.body}</p></Link>)}</div></main>;
}
