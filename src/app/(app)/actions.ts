"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { actionSchema, captureSchema, safeTimezone } from "@/lib/validation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAIProvider } from "@/lib/ai/provider";
import { siteUrl } from "@/lib/env";

const idSchema = z.uuid();
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

async function withinMutationLimit(userId: string, area: string, maxRequests: number) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return true;
  const admin = createAdminClient();
  const { data } = await admin.rpc("check_rate_limit", { rate_key: `${area}:${userId}`, max_requests: maxRequests, window_seconds: 3600 });
  return data !== false;
}

export async function createCapture(formData: FormData) {
  const parsed = captureSchema.safeParse({
    content: formData.get("content"),
    note: formData.get("note") || "",
    sourceUrl: formData.get("sourceUrl") || "",
    sourceTitle: formData.get("sourceTitle") || "",
    sourceType: formData.get("sourceType") || "other"
  });
  if (!parsed.success) redirect(`/inbox?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  const { supabase } = await requireUser();
  const url = parsed.data.sourceUrl || null;
  let title = parsed.data.sourceTitle || (url ? new URL(url).hostname.replace(/^www\./, "") : "");
  const sourceType = url && /(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(new URL(url).hostname) ? "youtube" : parsed.data.sourceType;
  const metadata: Record<string, string> = {};
  if (url && sourceType === "youtube") {
    const timestamp = new URL(url).searchParams.get("t");
    if (timestamp) metadata.timestamp = timestamp;
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`, { signal: AbortSignal.timeout(3_000) });
      if (response.ok) {
        const details = await response.json() as { title?: string; author_name?: string; thumbnail_url?: string };
        title = details.title?.slice(0, 500) || title;
        if (details.author_name) metadata.creator = details.author_name.slice(0, 240);
        if (details.thumbnail_url) metadata.thumbnail_url = details.thumbnail_url.slice(0, 2048);
      }
    } catch {
      // User-entered content still saves when optional metadata is unavailable.
    }
  }
  const { error } = await supabase.rpc("create_capture", {
    capture_content: parsed.data.content,
    capture_note: parsed.data.note,
    capture_source_type: sourceType,
    capture_source_url: url,
    capture_source_title: title,
    capture_metadata: metadata
  });
  if (error) redirect(`/inbox?error=${encodeURIComponent("Capture could not be saved.")}`);
  revalidatePath("/inbox");
  revalidatePath("/today");
  redirect("/inbox?captured=1");
}

export async function completeOnboarding(formData: FormData) {
  const improvements = formData.getAll("improvements").map(String).slice(0, 8);
  const contentTypes = formData.getAll("contentTypes").map(String).slice(0, 10);
  const friction = formData.getAll("friction").map(String).slice(0, 5);
  const goals = String(formData.get("goals") || "").split("\n").map((item) => item.trim()).filter(Boolean).slice(0, 5);
  const timezone = safeTimezone(formData.get("timezone"));
  const { supabase, user } = await requireUser();
  const now = new Date().toISOString();
  const [{ error: prefError }, { error: profileError }] = await Promise.all([
    supabase.from("user_preferences").update({ improvement_areas: improvements, content_types: contentTypes, friction, timezone }).eq("user_id", user.id),
    supabase.from("profiles").update({ interests: improvements, onboarding_completed_at: now }).eq("id", user.id)
  ]);
  if (prefError || profileError) redirect("/onboarding?error=Your%20answers%20could%20not%20be%20saved.");
  if (goals.length) await supabase.from("goals").insert(goals.map((title) => ({ user_id: user.id, title })));
  redirect("/inbox?welcome=1");
}

export async function archiveCapture(formData: FormData) {
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return;
  const { supabase, user } = await requireUser();
  await supabase.from("captures").update({ archived_at: new Date().toISOString() }).eq("id", id.data).eq("user_id", user.id);
  revalidatePath("/inbox");
}

export async function processCapture(formData: FormData) {
  const captureId = idSchema.safeParse(formData.get("captureId"));
  const title = z.string().trim().min(1).max(240).safeParse(formData.get("title"));
  const body = z.string().trim().min(1).max(10_000).safeParse(formData.get("body"));
  const interpretation = z.string().trim().min(1, "Write what this means to you").max(10_000).safeParse(formData.get("interpretation"));
  const actionability = z.enum(["yes", "not_now", "no_action", "maybe_later"]).safeParse(formData.get("actionability"));
  const actionType = z.enum(["task", "scheduled", "habit", "experiment", "decision_rule", "contextual"]).safeParse(formData.get("actionType") || "task");
  const actionTitle = String(formData.get("actionTitle") || "").trim().slice(0, 240);
  if (!captureId.success || !title.success || !body.success || !interpretation.success || !actionability.success || !actionType.success) {
    const message = title.error?.issues[0]?.message || body.error?.issues[0]?.message || interpretation.error?.issues[0]?.message || "Check the form";
    redirect(`/inbox/${String(formData.get("captureId") || "")}?error=${encodeURIComponent(message)}`);
  }
  if (actionability.data === "yes" && actionTitle.length < 3) redirect(`/inbox/${captureId.data}?error=${encodeURIComponent("Describe the action you will take")}`);
  const due = String(formData.get("dueAt") || "");
  const dueAt = due ? new Date(due).toISOString() : null;
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("process_capture", {
    target_capture_id: captureId.data,
    insight_title: title.data,
    insight_body: body.data,
    personal_interpretation: interpretation.data,
    selected_actionability: actionability.data,
    action_title: actionTitle || null,
    selected_action_type: actionType.data,
    action_due_at: dueAt
  });
  if (error) redirect(`/inbox/${captureId.data}?error=${encodeURIComponent("This capture could not be processed.")}`);
  const [{ data: preferences }, provider] = await Promise.all([
    supabase.from("user_preferences").select("ai_enabled,allow_private_ai").single(),
    Promise.resolve(getAIProvider())
  ]);
  if (provider && preferences?.ai_enabled && preferences.allow_private_ai) {
    try {
      const embedding = await provider.embed(`${title.data}\n${body.data}\n${interpretation.data}`);
      if (embedding.length === 1536) await supabase.from("insights").update({ embedding }).eq("id", data);
    } catch {
      // AI enrichment is optional; the human-created insight is already saved.
    }
  }
  revalidatePath("/inbox");
  revalidatePath("/library");
  revalidatePath("/today");
  redirect(`/library/${data}?processed=1`);
}

export async function createAction(formData: FormData) {
  const parsed = actionSchema.safeParse({
    insightId: formData.get("insightId"),
    title: formData.get("title"),
    description: formData.get("description") || "",
    actionType: formData.get("actionType"),
    dueAt: formData.get("dueAt") || "",
    priority: formData.get("priority") || "medium"
  });
  if (!parsed.success) redirect(`/library/${String(formData.get("insightId") || "")}?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase.from("actions").insert({
    user_id: user.id,
    insight_id: parsed.data.insightId,
    title: parsed.data.title,
    description: parsed.data.description,
    action_type: parsed.data.actionType,
    due_at: parsed.data.dueAt ? new Date(parsed.data.dueAt).toISOString() : null,
    priority: parsed.data.priority
  }).select("id").single();
  if (error) redirect(`/library/${parsed.data.insightId}?error=${encodeURIComponent("Action could not be created.")}`);
  if (data && parsed.data.dueAt) await supabase.from("action_reminders").insert({ user_id: user.id, action_id: data.id, remind_at: new Date(parsed.data.dueAt).toISOString(), channel: "in_app" });
  revalidatePath("/today");
  revalidatePath("/actions");
  redirect(`/actions/${data.id}`);
}

export async function scheduleReminder(formData: FormData) {
  const actionId = idSchema.safeParse(formData.get("actionId"));
  const remindAt = z.string().min(1).safeParse(formData.get("remindAt"));
  const channel = z.enum(["in_app", "email"]).safeParse(formData.get("channel") || "in_app");
  if (!actionId.success || !remindAt.success || !channel.success) return;
  const date = new Date(remindAt.data);
  if (Number.isNaN(date.getTime()) || date <= new Date()) redirect(`/actions/${actionId.data}?error=Choose%20a%20future%20reminder%20time.`);
  const { supabase, user } = await requireUser();
  await supabase.from("action_reminders").insert({ user_id: user.id, action_id: actionId.data, remind_at: date.toISOString(), channel: channel.data });
  revalidatePath(`/actions/${actionId.data}`);
}

export async function completeAction(formData: FormData) {
  const id = idSchema.safeParse(formData.get("actionId"));
  const execution = z.enum(["yes", "partial", "no"]).safeParse(formData.get("execution"));
  const helpfulness = z.enum(["helpful", "neutral", "unhelpful", "unclear"]).safeParse(formData.get("helpfulness"));
  const again = z.enum(["yes", "maybe", "no"]).safeParse(formData.get("applyAgain"));
  const description = z.string().trim().max(10_000).safeParse(formData.get("description") || "");
  if (!id.success || !execution.success || !helpfulness.success || !again.success || !description.success) redirect(`/actions/${String(formData.get("actionId") || "")}?error=Check%20the%20outcome%20form.`);
  const { supabase, user } = await requireUser();
  const { error } = await supabase.rpc("complete_action_with_outcome", {
    target_action_id: id.data,
    execution_state: execution.data,
    outcome_description: description.data,
    helpfulness_state: helpfulness.data,
    apply_again_state: again.data
  });
  if (error) redirect(`/actions/${id.data}?error=Outcome%20could%20not%20be%20saved.`);
  const { data: action } = await supabase.from("actions").select("origin_public_insight_id").eq("id", id.data).single();
  if (action?.origin_public_insight_id && execution.data !== "no") {
    const kinds = helpfulness.data === "helpful" ? ["applied", "helpful"] : ["applied"];
    await Promise.all(kinds.map((kind) => supabase.from("public_interactions").upsert({ user_id: user.id, insight_id: action.origin_public_insight_id, kind })));
  }
  revalidatePath("/today");
  revalidatePath("/actions");
  revalidatePath(`/actions/${id.data}`);
  redirect(`/actions/${id.data}?completed=1`);
}

export async function publishInsight(formData: FormData) {
  const id = idSchema.safeParse(formData.get("insightId"));
  const visibility = z.enum(["private", "unlisted", "public"]).safeParse(formData.get("selectedVisibility"));
  if (!id.success || !visibility.success) return;
  const { supabase, user } = await requireUser();
  const { data: insight } = await supabase.from("insights").select("title,slug").eq("id", id.data).eq("user_id", user.id).single();
  if (!insight) return;
  const slug = visibility.data === "private" ? null : visibility.data === "unlisted"
    ? (insight.slug?.startsWith("share-") ? insight.slug : `share-${randomBytes(18).toString("base64url")}`)
    : (insight.slug && !insight.slug.startsWith("share-") ? insight.slug : `${slugify(insight.title)}-${id.data.slice(0, 8)}`);
  const publicApplication = String(formData.get("publicApplication") || "").trim().slice(0, 4000);
  const publicOutcome = String(formData.get("publicOutcome") || "").trim().slice(0, 4000);
  const { error } = await supabase.from("insights").update({ visibility: visibility.data, slug, published_at: visibility.data === "private" ? null : new Date().toISOString(), public_application: publicApplication, public_outcome: publicOutcome }).eq("id", id.data).eq("user_id", user.id).select("id").single();
  if (error) redirect(`/library/${id.data}?error=Visibility%20could%20not%20be%20saved.`);
  revalidatePath(`/library/${id.data}`);
  revalidatePath("/explore");
  redirect(`/library/${id.data}?visibility=${visibility.data}`);
}

export async function addContextTrigger(formData: FormData) {
  const insightId = idSchema.safeParse(formData.get("insightId"));
  const label = z.string().trim().min(2).max(240).safeParse(formData.get("label"));
  if (!insightId.success || !label.success) return;
  const { supabase, user } = await requireUser();
  await supabase.from("context_triggers").insert({ user_id: user.id, insight_id: insightId.data, trigger_type: "user", label: label.data });
  revalidatePath(`/library/${insightId.data}`);
}

export async function deleteInsight(formData: FormData) {
  const id = idSchema.safeParse(formData.get("insightId"));
  if (!id.success) return;
  const { supabase, user } = await requireUser();
  await supabase.from("insights").update({ deleted_at: new Date().toISOString(), visibility: "private", published_at: null }).eq("id", id.data).eq("user_id", user.id);
  revalidatePath("/library");
  redirect("/library");
}

export async function interactWithInsight(formData: FormData) {
  const insightId = idSchema.safeParse(formData.get("insightId"));
  const kind = z.enum(["save", "applied", "helpful", "did_not_work"]).safeParse(formData.get("kind"));
  if (!insightId.success || !kind.success) return;
  const { supabase, user } = await requireUser();
  await supabase.from("public_interactions").upsert({ user_id: user.id, insight_id: insightId.data, kind: kind.data });
  revalidatePath("/explore");
}

export async function savePublicInsight(formData: FormData) {
  const insightId = idSchema.safeParse(formData.get("insightId"));
  if (!insightId.success) return;
  const { supabase, user } = await requireUser();
  const { data: original } = await supabase.from("insights").select("title,body,interpretation,slug").eq("id", insightId.data).eq("visibility", "public").single();
  if (!original) return;
  const { data: source } = await supabase.from("sources").insert({ user_id: user.id, source_type: "other", title: `Applied Insight: ${original.title}`, url: `${siteUrl()}/i/${original.slug}`, metadata: { origin_insight_id: insightId.data } }).select("id").single();
  const { data: saved } = await supabase.from("insights").insert({ user_id: user.id, title: original.title, body: original.body, interpretation: "", actionability: "not_now", visibility: "private" }).select("id").single();
  if (saved && source) await supabase.from("insight_sources").insert({ insight_id: saved.id, source_id: source.id, is_primary: true });
  await supabase.from("public_interactions").upsert({ user_id: user.id, insight_id: insightId.data, kind: "save" });
  revalidatePath("/library");
  if (saved) redirect(`/library/${saved.id}?saved=1`);
}

export async function applyPublicInsight(formData: FormData) {
  const insightId = idSchema.safeParse(formData.get("insightId"));
  if (!insightId.success) return;
  const { supabase, user } = await requireUser();
  const { data: original } = await supabase.from("insights").select("title,body,slug,public_application").eq("id", insightId.data).eq("visibility", "public").single();
  if (!original) return;
  const { data: source } = await supabase.from("sources").insert({ user_id: user.id, source_type: "other", title: `Applied Insight: ${original.title}`, url: `${siteUrl()}/i/${original.slug}`, metadata: { origin_insight_id: insightId.data } }).select("id").single();
  const { data: saved } = await supabase.from("insights").insert({ user_id: user.id, title: original.title, body: original.body, interpretation: "", actionability: "yes", visibility: "private" }).select("id").single();
  if (!saved) return;
  if (source) await supabase.from("insight_sources").insert({ insight_id: saved.id, source_id: source.id, is_primary: true });
  const title = original.public_application || `Apply: ${original.title}`;
  const { data: action } = await supabase.from("actions").insert({ user_id: user.id, insight_id: saved.id, origin_public_insight_id: insightId.data, title: title.slice(0, 240), action_type: "task" }).select("id").single();
  await supabase.from("public_interactions").upsert({ user_id: user.id, insight_id: insightId.data, kind: "save" });
  revalidatePath("/today");
  revalidatePath("/library");
  if (action) redirect(`/actions/${action.id}`);
}

export async function addComment(formData: FormData) {
  const insightId = idSchema.safeParse(formData.get("insightId"));
  const body = z.string().trim().min(1).max(2000).safeParse(formData.get("body"));
  if (!insightId.success || !body.success) return;
  const { supabase, user } = await requireUser();
  if (!(await withinMutationLimit(user.id, "comment", 30))) return;
  await supabase.from("comments").insert({ user_id: user.id, insight_id: insightId.data, body: body.data });
  revalidatePath(String(formData.get("path") || "/explore"));
}

export async function deleteComment(formData: FormData) {
  const id = idSchema.safeParse(formData.get("commentId"));
  if (!id.success) return;
  const { supabase, user } = await requireUser();
  await supabase.from("comments").update({ deleted_at: new Date().toISOString(), body: "[deleted]" }).eq("id", id.data).eq("user_id", user.id);
  revalidatePath(String(formData.get("path") || "/explore"));
}

export async function reportContent(formData: FormData) {
  const insightId = idSchema.safeParse(formData.get("insightId"));
  const commentId = idSchema.safeParse(formData.get("commentId"));
  const reason = z.enum(["spam", "harassment", "copyright", "misinformation", "other"]).safeParse(formData.get("reason"));
  if ((!insightId.success && !commentId.success) || !reason.success) return;
  const { supabase, user } = await requireUser();
  if (!(await withinMutationLimit(user.id, "report", 10))) return;
  await supabase.from("reports").insert({ reporter_id: user.id, insight_id: insightId.success ? insightId.data : null, comment_id: commentId.success ? commentId.data : null, reason: reason.data, details: String(formData.get("details") || "").slice(0, 2000) });
  revalidatePath(String(formData.get("path") || "/explore"));
}

export async function followProfile(formData: FormData) {
  const followedId = idSchema.safeParse(formData.get("followedId"));
  if (!followedId.success) return;
  const { supabase, user } = await requireUser();
  if (followedId.data === user.id) return;
  await supabase.from("follows").upsert({ follower_id: user.id, followed_id: followedId.data });
  revalidatePath(String(formData.get("path") || "/explore"));
}

export async function createGoal(formData: FormData) {
  const title = z.string().trim().min(2).max(240).safeParse(formData.get("title"));
  const description = z.string().trim().max(2000).safeParse(formData.get("description") || "");
  if (!title.success || !description.success) redirect("/goals?error=Describe%20the%20goal.");
  const { supabase, user } = await requireUser();
  await supabase.from("goals").insert({ user_id: user.id, title: title.data, description: description.data });
  revalidatePath("/goals");
}

export async function updateProfile(formData: FormData) {
  const displayName = z.string().trim().min(2).max(80).safeParse(formData.get("displayName"));
  const username = z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,30}$/).safeParse(formData.get("username"));
  const bio = z.string().trim().max(500).safeParse(formData.get("bio") || "");
  if (!displayName.success || !username.success || !bio.success) redirect("/settings?error=Check%20your%20profile%20details.");
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("profiles").update({ display_name: displayName.data, username: username.data, bio: bio.data, profile_visibility: formData.get("profileVisibility") === "private" ? "private" : "public" }).eq("id", user.id);
  if (error) redirect("/settings?error=That%20username%20may%20already%20be%20in%20use.");
  revalidatePath("/settings");
  revalidatePath("/profile");
}

export async function updatePreferences(formData: FormData) {
  const timezone = safeTimezone(formData.get("timezone"));
  const { supabase, user } = await requireUser();
  await supabase.from("user_preferences").update({
    timezone,
    default_visibility: formData.get("defaultVisibility") === "public" ? "public" : "private",
    ai_enabled: formData.get("aiEnabled") === "on",
    allow_private_ai: formData.get("allowPrivateAi") === "on",
    email_reminders: formData.get("emailReminders") === "on",
    in_app_notifications: formData.get("inAppNotifications") === "on",
    quiet_hours_start: String(formData.get("quietStart") || "") || null,
    quiet_hours_end: String(formData.get("quietEnd") || "") || null
  }).eq("user_id", user.id);
  revalidatePath("/settings");
}

export async function createCollection(formData: FormData) {
  const title = z.string().trim().min(2).max(240).safeParse(formData.get("title"));
  const description = z.string().trim().max(2000).safeParse(formData.get("description") || "");
  if (!title.success || !description.success) return;
  const { supabase, user } = await requireUser();
  await supabase.from("collections").insert({ user_id: user.id, title: title.data, description: description.data });
  revalidatePath("/collections");
}

export async function addInsightToCollection(formData: FormData) {
  const collectionId = idSchema.safeParse(formData.get("collectionId"));
  const insightId = idSchema.safeParse(formData.get("insightId"));
  if (!collectionId.success || !insightId.success) return;
  const { supabase, user } = await requireUser();
  const [{ data: collection }, { data: insight }] = await Promise.all([
    supabase.from("collections").select("id").eq("id", collectionId.data).eq("user_id", user.id).single(),
    supabase.from("insights").select("id").eq("id", insightId.data).eq("user_id", user.id).single()
  ]);
  if (!collection || !insight) return;
  await supabase.from("collection_items").upsert({ collection_id: collection.id, insight_id: insight.id });
  revalidatePath(`/collections/${collection.id}`);
}

export async function linkInsightToGoal(formData: FormData) {
  const goalId = idSchema.safeParse(formData.get("goalId"));
  const insightId = idSchema.safeParse(formData.get("insightId"));
  if (!goalId.success || !insightId.success) return;
  const { supabase, user } = await requireUser();
  const [{ data: goal }, { data: insight }] = await Promise.all([
    supabase.from("goals").select("id").eq("id", goalId.data).eq("user_id", user.id).single(),
    supabase.from("insights").select("id").eq("id", insightId.data).eq("user_id", user.id).single()
  ]);
  if (!goal || !insight) return;
  await supabase.from("insight_goals").upsert({ goal_id: goal.id, insight_id: insight.id });
  revalidatePath(`/goals/${goal.id}`);
}

export async function linkActionToGoal(formData: FormData) {
  const goalId = idSchema.safeParse(formData.get("goalId"));
  const actionId = idSchema.safeParse(formData.get("actionId"));
  if (!goalId.success || !actionId.success) return;
  const { supabase, user } = await requireUser();
  await supabase.from("actions").update({ goal_id: goalId.data }).eq("id", actionId.data).eq("user_id", user.id);
  revalidatePath(`/goals/${goalId.data}`);
}

export async function deleteAccount(formData: FormData) {
  if (formData.get("confirmation") !== "DELETE") redirect("/settings?error=Type%20DELETE%20to%20confirm.");
  const { user } = await requireUser();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) redirect("/settings?error=Account%20could%20not%20be%20deleted.");
  redirect("/?account=deleted");
}

export async function createExtensionToken() {
  const { supabase, user } = await requireUser();
  const raw = `px_${randomBytes(24).toString("base64url")}`;
  const hash = createHash("sha256").update(raw).digest("hex");
  const { error } = await supabase.from("extension_tokens").insert({ user_id: user.id, token_hash: hash, last_four: raw.slice(-4) });
  if (error) return { error: "Token could not be created." };
  revalidatePath("/settings");
  return { token: raw };
}

export async function revokeExtensionToken(formData: FormData) {
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return;
  const { supabase, user } = await requireUser();
  await supabase.from("extension_tokens").update({ revoked_at: new Date().toISOString() }).eq("id", id.data).eq("user_id", user.id);
  revalidatePath("/settings");
}

export async function markNotificationsRead() {
  const { supabase, user } = await requireUser();
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
  revalidatePath("/notifications");
}

export async function moderateReport(formData: FormData) {
  const reportId = idSchema.safeParse(formData.get("reportId"));
  const decision = z.enum(["resolved", "dismissed", "hide"]).safeParse(formData.get("decision"));
  if (!reportId.success || !decision.success) return;
  const { user } = await requireUser();
  const admins = (process.env.ADMIN_USER_IDS || "").split(",").map(item => item.trim()).filter(Boolean);
  if (!admins.includes(user.id)) return;
  const admin = createAdminClient();
  const { data: report } = await admin.from("reports").select("insight_id,comment_id").eq("id", reportId.data).single();
  if (!report) return;
  if (decision.data === "hide" && report.insight_id) await admin.from("insights").update({ visibility: "private", published_at: null }).eq("id", report.insight_id);
  if (decision.data === "hide" && report.comment_id) await admin.from("comments").update({ body: "[removed by moderation]", deleted_at: new Date().toISOString() }).eq("id", report.comment_id);
  await admin.from("reports").update({ status: decision.data === "dismissed" ? "dismissed" : "resolved" }).eq("id", reportId.data);
  revalidatePath("/admin/moderation");
}
