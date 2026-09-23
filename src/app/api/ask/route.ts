import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAIProvider, type GroundingItem } from "@/lib/ai/provider";
import { searchTerms } from "@/lib/search";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({ question: z.string().trim().min(3).max(1000), scope: z.enum(["personal", "community"]).default("personal") });
const fallbackLimits = new Map<string, { count: number; expires: number }>();

async function withinLimit(userId: string) {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdminClient();
    const { data } = await admin.rpc("check_rate_limit", { rate_key: `ask:${userId}`, max_requests: 30, window_seconds: 3600 });
    return data !== false;
  }
  // ponytail: process-local fallback only; configure service role for multi-instance production limits.
  const now = Date.now();
  const current = fallbackLimits.get(userId);
  if (!current || current.expires < now) { fallbackLimits.set(userId, { count: 1, expires: now + 3_600_000 }); return true; }
  current.count += 1;
  return current.count <= 10;
}

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Ask a clear question under 1,000 characters." }, { status: 400 });
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (!(await withinLimit(user.id))) return NextResponse.json({ error: "You’ve reached the hourly question limit. Try again later." }, { status: 429 });
    const { data: preferences } = await supabase.from("user_preferences").select("ai_enabled,allow_private_ai").eq("user_id", user.id).single();
    if (preferences?.ai_enabled === false) return NextResponse.json({ error: "AI is disabled in Settings." }, { status: 403 });
    if (parsed.data.scope === "personal" && preferences?.allow_private_ai === false) return NextResponse.json({ error: "Private knowledge AI is disabled in Settings." }, { status: 403 });

    const provider = getAIProvider();
    const terms = searchTerms(parsed.data.question) || parsed.data.question;
    let evidence: GroundingItem[] = [];
    if (parsed.data.scope === "personal") {
      let embedding: number[] | null = null;
      if (provider) {
        try { embedding = await provider.embed(parsed.data.question); } catch { embedding = null; }
      }
      const { data } = await supabase.rpc("search_my_knowledge", { query_text: terms, query_embedding: embedding?.length === 1536 ? embedding : null, match_count: 8 });
      evidence = (data || []).map((item: Record<string, unknown>) => ({ id: item.id as string, title: item.title as string, body: item.body as string, interpretation: item.interpretation as string, action: item.action_title as string | null, outcome: item.outcome_text as string | null, href: `/library/${item.id}` }));
    } else {
      const { data } = await supabase.from("insights").select("id,title,body,interpretation,slug,public_application,public_outcome").eq("visibility", "public").is("deleted_at", null).textSearch("search_document", terms, { type: "websearch", config: "english" }).limit(8);
      const ids = (data || []).map(item => item.id);
      const { data: signals } = ids.length ? await supabase.from("public_interactions").select("insight_id,kind").in("insight_id", ids) : { data: [] };
      const signalCounts = new Map<string, Record<string, number>>();
      for (const signal of signals || []) { const current = signalCounts.get(signal.insight_id) || {}; current[signal.kind] = (current[signal.kind] || 0) + 1; signalCounts.set(signal.insight_id, current); }
      evidence = (data || []).map((item) => { const counts = signalCounts.get(item.id) || {}; return { id: item.id, title: item.title, body: item.body, interpretation: item.interpretation, action: item.public_application, outcome: item.public_outcome, metrics: `${counts.save || 0} saved, ${counts.applied || 0} applied, ${counts.helpful || 0} helpful, ${counts.did_not_work || 0} did not work`, href: `/i/${item.slug}` }; });
    }
    if (!evidence.length) return NextResponse.json({ answer: "I couldn’t find relevant evidence in this knowledge base. Try a broader topic or capture an insight first.", citations: [], generated: false });

    let answer: string;
    let generated = false;
    if (provider) {
      try { answer = await provider.answer(parsed.data.question, evidence, parsed.data.scope); generated = true; }
      catch { answer = `AI synthesis is temporarily unavailable. These ${evidence.length} grounded results are still relevant: ${evidence.map((item, index) => `[${index + 1}] ${item.title}`).join("; ")}.`; }
    } else {
      answer = `AI synthesis is not configured. Here are the strongest grounded matches: ${evidence.map((item, index) => `[${index + 1}] ${item.title}`).join("; ")}.`;
    }
    const { data: conversation } = await supabase.from("ai_conversations").insert({ user_id: user.id, title: parsed.data.question.slice(0, 80), scope: parsed.data.scope }).select("id").single();
    if (conversation) await supabase.from("ai_messages").insert([
      { user_id: user.id, conversation_id: conversation.id, role: "user", content: parsed.data.question },
      { user_id: user.id, conversation_id: conversation.id, role: "assistant", content: answer, citations: evidence.map(({ id, title, href }) => ({ id, title, href })) }
    ]);
    return NextResponse.json({ answer, citations: evidence.map(({ id, title, href }) => ({ id, title, href })), generated });
  } catch {
    return NextResponse.json({ error: "Praxis could not answer right now. Your data was not changed." }, { status: 500 });
  }
}
