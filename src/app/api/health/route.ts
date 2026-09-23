import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/env";

export function GET() {
  return NextResponse.json({ status: "ok", database_configured: hasSupabaseEnv(), ai_configured: Boolean(process.env.AI_API_KEY), email_configured: Boolean(process.env.RESEND_API_KEY) }, { headers: { "Cache-Control": "no-store" } });
}
