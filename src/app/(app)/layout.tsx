import { AppNav, MobileNav } from "@/components/app-nav";
import { CommandCenter } from "@/components/command-center";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser();
  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from("profiles").select("display_name,onboarding_completed_at").eq("id", user.id).single(),
    supabase.from("captures").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("processed_at", null).is("archived_at", null)
  ]);
  return <div className="app-shell"><AppNav name={profile?.display_name || user.email?.split("@")[0] || "You"} inboxCount={count || 0} /><div className="app-main"><header className="app-topbar"><CommandCenter /></header>{children}</div><MobileNav /></div>;
}
