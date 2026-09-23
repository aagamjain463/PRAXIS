import { z } from "zod";

export const emailSchema = z.string().trim().email("Enter a valid email address").max(254);
export const passwordSchema = z.string().min(8, "Use at least 8 characters").max(128);
export const safeUrlSchema = z.url("Enter a valid URL").max(2_048).refine(value => ["http:", "https:"].includes(new URL(value).protocol), "Use an http or https URL");

export function safeRedirect(value: FormDataEntryValue | string | null | undefined, fallback = "/today") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export function safeTimezone(value: unknown) {
  if (typeof value !== "string" || value.length > 80) return "UTC";
  try { new Intl.DateTimeFormat("en", { timeZone: value }).format(); return value; }
  catch { return "UTC"; }
}

export const captureSchema = z.object({
  content: z.string().trim().min(1, "Add something worth remembering").max(10_000),
  sourceUrl: z.union([z.literal(""), safeUrlSchema]).default(""),
  sourceType: z.enum(["article", "book", "podcast", "youtube", "newsletter", "x", "instagram", "course", "pdf", "conversation", "other"]).default("other"),
  sourceTitle: z.string().trim().max(500).default(""),
  note: z.string().trim().max(2_000).default("")
});

export const actionSchema = z.object({
  insightId: z.uuid(),
  title: z.string().trim().min(3).max(240),
  description: z.string().trim().max(2_000).default(""),
  actionType: z.enum(["task", "scheduled", "habit", "experiment", "decision_rule", "contextual"]),
  dueAt: z.union([z.literal(""), z.iso.datetime({ local: true })]).default(""),
  priority: z.enum(["low", "medium", "high"]).default("medium")
});
