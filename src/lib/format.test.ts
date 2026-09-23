import { describe, expect, it } from "vitest";
import { actionScore, relativeDue } from "./format";

describe("actionScore", () => {
  const now = new Date("2026-09-23T10:00:00Z");
  it("puts overdue work ahead of undated work", () => {
    expect(actionScore({ due_at: "2026-09-22T10:00:00Z", priority: "low" }, now)).toBeGreaterThan(actionScore({ due_at: null, priority: "high" }, now));
  });
  it("keeps priority meaningful", () => {
    expect(actionScore({ priority: "high" }, now)).toBeGreaterThan(actionScore({ priority: "low" }, now));
  });
  it("formats due dates", () => expect(relativeDue("2026-09-24T10:00:00Z", now)).toBe("Tomorrow"));
});
