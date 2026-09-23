import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const alt = "Applied Insight on Praxis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_shared_insight", { shared_slug: slug });
  const insight = data as { title?: string; body?: string } | null;
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#f6f3eb", color: "#17251f", fontFamily: "Georgia" }}><div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "Arial", fontSize: 25, fontWeight: 700 }}><div style={{ width: 43, height: 43, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: "#214d3c", color: "white", fontFamily: "Georgia" }}>P</div>Praxis <span style={{ marginLeft: 12, color: "#b95f3c", fontSize: 16 }}>APPLIED INSIGHT</span></div><div><div style={{ maxWidth: 1020, fontSize: 68, lineHeight: 1.05, letterSpacing: -2 }}>{insight?.title || "Applied Insight"}</div><div style={{ maxWidth: 900, marginTop: 26, fontFamily: "Arial", fontSize: 22, lineHeight: 1.45, color: "#59655e" }}>{(insight?.body || "Knowledge, put into practice.").slice(0, 180)}</div></div></div>, size);
}
