import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const tables = ["profiles", "user_preferences", "goals", "sources", "captures", "insights", "actions", "action_reminders", "action_occurrences", "outcomes", "context_triggers", "tags", "collections", "notifications", "ai_conversations", "ai_messages"] as const;

export async function GET() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const entries = await Promise.all(tables.map(async table => {
    const column = table === "profiles" ? "id" : table === "user_preferences" ? "user_id" : "user_id";
    const { data } = await supabase.from(table).select("*").eq(column, auth.user!.id);
    return [table, data || []] as const;
  }));
  const base = Object.fromEntries(entries) as Record<string, Record<string, unknown>[]>;
  const insightIds = (base.insights || []).map(item => String(item.id));
  const collectionIds = (base.collections || []).map(item => String(item.id));
  const [insightSources, insightGoals, insightTags, collectionItems, interactions, comments, following, followers, reports] = await Promise.all([
    insightIds.length ? supabase.from("insight_sources").select("*").in("insight_id", insightIds) : Promise.resolve({ data: [] }),
    insightIds.length ? supabase.from("insight_goals").select("*").in("insight_id", insightIds) : Promise.resolve({ data: [] }),
    insightIds.length ? supabase.from("insight_tags").select("*").in("insight_id", insightIds) : Promise.resolve({ data: [] }),
    collectionIds.length ? supabase.from("collection_items").select("*").in("collection_id", collectionIds) : Promise.resolve({ data: [] }),
    supabase.from("public_interactions").select("*").eq("user_id", auth.user.id),
    supabase.from("comments").select("*").eq("user_id", auth.user.id),
    supabase.from("follows").select("*").eq("follower_id", auth.user.id),
    supabase.from("follows").select("*").eq("followed_id", auth.user.id),
    supabase.from("reports").select("*").eq("reporter_id", auth.user.id)
  ]);
  Object.assign(base, { insight_sources: insightSources.data || [], insight_goals: insightGoals.data || [], insight_tags: insightTags.data || [], collection_items: collectionItems.data || [], public_interactions: interactions.data || [], comments: comments.data || [], following: following.data || [], followers: followers.data || [], reports: reports.data || [] });
  return new NextResponse(JSON.stringify({ exported_at: new Date().toISOString(), user: { id: auth.user.id, email: auth.user.email }, data: base }, null, 2), {
    headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="praxis-export-${new Date().toISOString().slice(0, 10)}.json"`, "Cache-Control": "private, no-store" }
  });
}
