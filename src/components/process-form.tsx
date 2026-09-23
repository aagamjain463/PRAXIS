"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { processCapture } from "@/app/(app)/actions";

type Capture = { id: string; content: string; quick_note: string };

export function ProcessForm({ capture }: { capture: Capture }) {
  const [actionability, setActionability] = useState("yes");
  const [actionTitle, setActionTitle] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState("");
  const suggestedTitle = capture.content.length > 90 ? `${capture.content.slice(0, 87)}…` : capture.content;
  async function suggest() {
    if (actionTitle.trim().length < 2) { setSuggestionError("Write the rough intention first."); return; }
    setSuggesting(true); setSuggestionError("");
    try {
      const response = await fetch("/api/ai/suggest-action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ insight: capture.content, intention: actionTitle }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setActionTitle(data.suggestion);
    } catch (error) { setSuggestionError(error instanceof Error ? error.message : "Suggestion unavailable."); }
    finally { setSuggesting(false); }
  }
  return <form action={processCapture} className="process-form"><input type="hidden" name="captureId" value={capture.id} /><section><span>STEP 1</span><h2>What is the real insight?</h2><p>Distill what is worth carrying forward. Keep the original meaning; remove the noise.</p><label>Insight title<input name="title" defaultValue={suggestedTitle} maxLength={240} required /></label><label>The insight<textarea name="body" defaultValue={capture.content} rows={5} maxLength={10000} required /></label></section><section><span>STEP 2</span><h2>What does this mean to you?</h2><p>Connect the idea to your situation. Praxis is most valuable when the interpretation is yours.</p><label>My interpretation<textarea name="interpretation" defaultValue={capture.quick_note} rows={5} placeholder="I tend to… This changes… In my situation…" maxLength={10000} required /></label></section><section><span>STEP 3</span><h2>Does this change anything you should do?</h2><div className="radio-cards">{[["yes", "Yes", "Turn it into a commitment"], ["not_now", "Not now", "Keep it ready for later"], ["no_action", "No action needed", "Useful understanding on its own"], ["maybe_later", "Maybe later", "Revisit when context changes"]].map(([value, label, copy]) => <label key={value}><input type="radio" name="actionability" value={value} checked={actionability === value} onChange={() => setActionability(value)} /><span><strong>{label}</strong><small>{copy}</small></span></label>)}</div>{actionability === "yes" && <div className="action-builder"><h3>Make it executable</h3><label>What will you do?<input name="actionTitle" value={actionTitle} onChange={event => setActionTitle(event.target.value)} placeholder="Interview 5 potential users before redesigning onboarding" maxLength={240} required /></label><button className="suggest-button" type="button" onClick={suggest} disabled={suggesting}>{suggesting ? "Making it specific…" : "Make this action more specific with AI"}</button>{suggestionError && <p className="suggestion-error">{suggestionError}</p>}<div className="form-columns"><label>Type<select name="actionType" defaultValue="task"><option value="task">One-time task</option><option value="scheduled">Scheduled action</option><option value="habit">Habit</option><option value="experiment">Experiment</option><option value="decision_rule">Decision rule</option><option value="contextual">Contextual trigger</option></select></label><label>When<input name="dueAt" type="datetime-local" /></label></div><p className="assistive-copy">Suggestions stay editable. Praxis never commits a deadline for you.</p></div>}</section><div className="process-submit"><span>You remain in control. Praxis will not publish this.</span><SubmitButton pendingLabel="Processing…">Create applied insight</SubmitButton></div></form>;
}
