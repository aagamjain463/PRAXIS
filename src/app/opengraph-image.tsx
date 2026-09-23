import { ImageResponse } from "next/og";

export const alt = "Praxis — Turn what you learn into what you do";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#f6f3eb", color: "#17251f", fontFamily: "Georgia" }}><div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "Arial", fontSize: 28, fontWeight: 700 }}><div style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 13, background: "#214d3c", color: "white", fontFamily: "Georgia", fontSize: 32 }}>P</div>Praxis</div><div style={{ display: "flex", flexDirection: "column" }}><div style={{ display: "flex", fontSize: 82, lineHeight: 1.03, letterSpacing: -3 }}>Turn what you learn</div><div style={{ display: "flex", fontSize: 82, lineHeight: 1.03, letterSpacing: -3 }}>into what you&nbsp;<span style={{ color: "#b95f3c", fontStyle: "italic" }}>do.</span></div><div style={{ display: "flex", marginTop: 28, fontFamily: "Arial", fontSize: 24, color: "#59655e" }}>Capture useful ideas. Apply them. Remember them when they matter.</div></div></div>, size);
}
