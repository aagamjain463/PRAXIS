import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(new URL("../../supabase/migrations/202609230001_initial.sql", import.meta.url), "utf8");
const privateTables = ["user_preferences", "goals", "sources", "captures", "actions", "action_occurrences", "action_reminders", "outcomes", "context_triggers", "tags", "notifications", "ai_conversations", "ai_messages", "extension_tokens"];

describe("initial migration security", () => {
  it.each(privateTables)("enables RLS for %s", table => {
    expect(sql).toContain(`alter table public.${table} enable row level security;`);
  });
  it("defaults insights to private", () => {
    expect(sql).toMatch(/visibility public\.insight_visibility not null default 'private'/);
  });
  it("does not expose unlisted insights to collection queries", () => {
    expect(sql).toContain("visibility = 'public' and published_at is not null");
    expect(sql).not.toContain("visibility in ('public', 'unlisted') and published_at is not null and deleted_at is null)\n);");
  });
  it("keeps sensitive functions off public roles", () => {
    expect(sql).toContain("revoke all on function public.check_rate_limit");
    expect(sql).toContain("revoke all on function public.claim_due_reminders");
  });
});
