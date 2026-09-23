import { describe, expect, it } from "vitest";
import { actionSchema, captureSchema, safeRedirect, safeTimezone } from "./validation";

describe("safeRedirect", () => {
  it("accepts local paths and rejects open redirects", () => {
    expect(safeRedirect("/library?q=focus")).toBe("/library?q=focus");
    expect(safeRedirect("//evil.example")).toBe("/today");
    expect(safeRedirect("https://evil.example")).toBe("/today");
  });
});

describe("safeTimezone", () => {
  it("keeps IANA zones and rejects invalid database input", () => {
    expect(safeTimezone("Asia/Kolkata")).toBe("Asia/Kolkata");
    expect(safeTimezone("not/a-zone")).toBe("UTC");
  });
});

describe("actionSchema", () => {
  it("accepts native datetime-local input", () => {
    expect(actionSchema.safeParse({ insightId: "0193c2d1-a111-7ef2-8f20-111111111111", title: "Interview five users", description: "", actionType: "task", dueAt: "2030-09-27T17:00", priority: "high" }).success).toBe(true);
  });
});

describe("captureSchema", () => {
  it("rejects empty content and unsafe URL shapes", () => {
    expect(captureSchema.safeParse({ content: "", sourceUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(captureSchema.safeParse({ content: "Useful", sourceUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(captureSchema.safeParse({ content: "Talk to users", sourceUrl: "https://youtu.be/example" }).success).toBe(true);
  });
});
