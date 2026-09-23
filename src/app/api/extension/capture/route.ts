import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeUrlSchema } from "@/lib/validation";

const schema = z.object({
  content: z.string().trim().min(1).max(10_000),
  note: z.string().trim().max(2_000).default(""),
  url: z.union([z.literal(""), safeUrlSchema]).default(""),
  title: z.string().trim().max(500).default(""),
  timestamp: z.number().int().min(0).max(604_800).optional()
});

const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin?.startsWith("chrome-extension://") ? origin : "null",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
  "Cache-Control": "no-store"
});

export function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: cors(request.headers.get("origin")) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const headers = cors(origin);
  try {
    const rawToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!rawToken?.startsWith("px_")) return NextResponse.json({ error: "Invalid capture token." }, { status: 401, headers });
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400, headers });
    const admin = createAdminClient();
    const hash = createHash("sha256").update(rawToken).digest("hex");
    const { data: token } = await admin.from("extension_tokens").select("id,user_id,expires_at,revoked_at").eq("token_hash", hash).single();
    if (!token || token.revoked_at || (token.expires_at && token.expires_at < new Date().toISOString())) return NextResponse.json({ error: "Capture token is expired or revoked." }, { status: 401, headers });
    const { data: allowed } = await admin.rpc("check_rate_limit", { rate_key: `extension:${token.id}`, max_requests: 120, window_seconds: 3600 });
    if (allowed === false) return NextResponse.json({ error: "Capture limit reached. Try again later." }, { status: 429, headers });
    const url = parsed.data.url || null;
    const host = url ? new URL(url).hostname : "";
    const sourceType = /(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(host) ? "youtube" : url ? "article" : "other";
    let sourceId: string | null = null;
    if (url) {
      const { data: source, error } = await admin.from("sources").insert({ user_id: token.user_id, source_type: sourceType, title: parsed.data.title, url, metadata: parsed.data.timestamp === undefined ? {} : { timestamp: parsed.data.timestamp } }).select("id").single();
      if (error) throw error;
      sourceId = source.id;
    }
    const { data: capture, error } = await admin.from("captures").insert({ user_id: token.user_id, source_id: sourceId, content: parsed.data.content, quick_note: parsed.data.note }).select("id").single();
    if (error) throw error;
    await admin.from("extension_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", token.id);
    return NextResponse.json({ id: capture.id }, { status: 201, headers });
  } catch {
    return NextResponse.json({ error: "Capture could not be saved." }, { status: 500, headers });
  }
}
