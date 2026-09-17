import { describe, expect, it } from "vitest";
import { resolveSafeNext } from "../lib/auth/redirect";

describe("resolveSafeNext", () => {
  it("honors safe same-origin paths", () => {
    expect(resolveSafeNext("/actions")).toBe("/actions");
    expect(resolveSafeNext("/")).toBe("/");
    expect(resolveSafeNext("/insights?tab=x")).toBe("/insights?tab=x");
  });

  it("rejects external and protocol-relative targets", () => {
    expect(resolveSafeNext("https://evil.example")).toBe("/");
    expect(resolveSafeNext("//evil.example/actions")).toBe("/");
    expect(resolveSafeNext("javascript:alert(1)")).toBe("/");
  });

  it("rejects backslash tricks, control characters, and empties", () => {
    expect(resolveSafeNext("/\\evil.example")).toBe("/");
    expect(resolveSafeNext("/actions\r\nSet-Cookie: x")).toBe("/");
    expect(resolveSafeNext(null)).toBe("/");
    expect(resolveSafeNext("")).toBe("/");
  });
});
