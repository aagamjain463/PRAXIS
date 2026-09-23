export function formatDate(value: string | null | undefined, options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en", options).format(new Date(value));
}

export function relativeDue(value: string | null | undefined, now = new Date()) {
  if (!value) return "Anytime";
  const due = new Date(value);
  const days = Math.ceil((due.getTime() - now.getTime()) / 86_400_000);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return formatDate(value, { month: "short", day: "numeric" });
}

export function actionScore(action: { due_at?: string | null; priority?: string; action_type?: string }, now = new Date()) {
  const priority = action.priority === "high" ? 30 : action.priority === "medium" ? 15 : 0;
  const type = action.action_type === "habit" ? 6 : action.action_type === "experiment" ? 4 : 0;
  if (!action.due_at) return priority + type;
  const hours = (new Date(action.due_at).getTime() - now.getTime()) / 3_600_000;
  const urgency = hours <= 0 ? 100 : hours <= 24 ? 60 : hours <= 72 ? 35 : Math.max(0, 20 - hours / 24);
  return priority + type + urgency;
}
