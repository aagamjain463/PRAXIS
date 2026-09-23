import "server-only";

export type GroundingItem = { id: string; title: string; body: string; interpretation?: string; action?: string | null; outcome?: string | null; metrics?: string | null; href: string };

export type AIProvider = {
  embed(text: string): Promise<number[]>;
  answer(question: string, evidence: GroundingItem[], scope: "personal" | "community"): Promise<string>;
  suggestAction(insight: string, intention: string): Promise<string>;
};

export function getAIProvider(): AIProvider | null {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_API_URL?.replace(/\/$/, "") || "https://api.openai.com/v1";
  if (!apiKey) return null;

  const request = async (path: string, body: object) => {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000)
    });
    if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
    return response.json();
  };

  return {
    async embed(text) {
      const data = await request("/embeddings", { model: process.env.AI_EMBEDDING_MODEL || "text-embedding-3-small", input: text.slice(0, 8_000) });
      return data.data?.[0]?.embedding || [];
    },
    async answer(question, evidence, scope) {
      const sources = evidence.map((item, index) => `[${index + 1}] ${item.title}\nInsight: ${item.body}\nInterpretation: ${item.interpretation || "Not provided"}\nAction: ${item.action || "None"}\nOutcome: ${item.outcome || "None"}\nEvidence signals: ${item.metrics || "Not available"}`).join("\n\n");
      const data = await request("/chat/completions", {
        model: process.env.AI_CHAT_MODEL || "gpt-4.1-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: `You are Praxis, a careful knowledge-to-action assistant. Answer only from supplied ${scope} evidence. Distinguish stored facts from your synthesis. Cite claims with [n]. If evidence is insufficient, say so. Prefer concise, executable guidance. Never invent outcomes or experiences.` },
          { role: "user", content: `Question: ${question}\n\nEvidence:\n${sources || "No matching evidence."}` }
        ]
      });
      return data.choices?.[0]?.message?.content || "No answer was returned.";
    },
    async suggestAction(insight, intention) {
      const data = await request("/chat/completions", {
        model: process.env.AI_CHAT_MODEL || "gpt-4.1-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: "Turn a vague intention into one observable, editable action. Preserve the user's intent. Use a clear verb, realistic scope, and finish line. Return only the action sentence. Do not invent a deadline." },
          { role: "user", content: `Insight: ${insight.slice(0, 4000)}\nCurrent intention: ${intention.slice(0, 1000)}` }
        ]
      });
      return data.choices?.[0]?.message?.content?.trim() || intention;
    }
  };
}
