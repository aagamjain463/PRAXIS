import { NextResponse } from "next/server";
import { z } from "zod";
import { getAIProvider } from "@/lib/ai/provider";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ insight: z.string().trim().min(3).max(10_000), intention: z.string().trim().min(2).max(1_000) });

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Describe the action you want to make specific." }, { status: 400 });
    const { data: preferences } = await supabase.from("user_preferences").select("ai_enabled,allow_private_ai").eq("user_id", auth.user.id).single();
    if (!preferences?.ai_enabled || !preferences.allow_private_ai) return NextResponse.json({ error: "Private AI assistance is disabled in Settings." }, { status: 403 });
    const provider = getAIProvider();
    if (!provider) return NextResponse.json({ error: "AI suggestions are not configured." }, { status: 503 });
    const suggestion = await provider.suggestAction(parsed.data.insight, parsed.data.intention);
    return NextResponse.json({ suggestion });
  } catch {
    return NextResponse.json({ error: "Suggestion is temporarily unavailable." }, { status: 500 });
  }
}
