"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowUp, BookOpen, Sparkles } from "lucide-react";
import { createCapture } from "@/app/(app)/actions";

type Answer = { answer: string; citations: { id: string; title: string; href: string }[]; generated: boolean };

export function AskPraxis() {
  const [question, setQuestion] = useState("");
  const [scope, setScope] = useState<"personal" | "community">("personal");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError(""); setAnswer(null);
    try {
      const response = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, scope }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Question failed");
      setAnswer(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Question failed"); }
    finally { setLoading(false); }
  }
  return <div className="ask-workspace"><div className="scope-switch"><button className={scope === "personal" ? "active" : ""} onClick={() => setScope("personal")} type="button">My knowledge</button><button className={scope === "community" ? "active" : ""} onClick={() => setScope("community")} type="button">Community evidence</button></div><form onSubmit={submit} className="ask-box"><textarea value={question} onChange={event => setQuestion(event.target.value)} placeholder={scope === "personal" ? "What have I learned about customer research?" : "What customer research principles have people actually applied?"} minLength={3} maxLength={1000} required /><button type="submit" disabled={loading || question.trim().length < 3} aria-label="Ask Praxis"><ArrowUp /></button></form>{error && <div className="error-bar">{error}</div>}{loading && <div className="thinking"><Sparkles /> Retrieving evidence from {scope === "personal" ? "your library" : "public applied insights"}…</div>}{answer && <article className="ai-answer panel"><header><Sparkles size={18} /><div><strong>Praxis synthesis</strong><small>{answer.generated ? "Generated from retrieved evidence" : "Retrieval only · AI provider not configured"}</small></div></header><div className="answer-copy">{answer.answer}</div><section><span>EVIDENCE</span>{answer.citations.map((citation, index) => <Link href={citation.href} key={citation.id}><b>{index + 1}</b><span>{citation.title}</span><BookOpen size={14} /></Link>)}</section><form action={createCapture}><input type="hidden" name="content" value={answer.answer} /><input type="hidden" name="note" value={`Praxis synthesis for: ${question}`} /><input type="hidden" name="sourceType" value="other" /><button className="button button-ghost">Save synthesis to Inbox</button></form></article>}<div className="question-starters"><span>TRY ASKING</span>{["What have I learned about focus?", "What should I remember before a sales call?", "Which ideas led to positive outcomes?"].map(item => <button key={item} onClick={() => setQuestion(item)}>{item}</button>)}</div></div>;
}
