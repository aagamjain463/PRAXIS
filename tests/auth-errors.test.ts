import { describe, expect, it } from "vitest";
import {
  FALLBACK_AUTH_ERROR_MESSAGE,
  toAuthErrorMessage,
} from "../lib/auth/errors";

describe("toAuthErrorMessage", () => {
  it("maps known failures to safe copy", () => {
    expect(toAuthErrorMessage("Invalid login credentials")).toBe(
      "Incorrect email or password.",
    );
    expect(toAuthErrorMessage("Email not confirmed")).toBe(
      "Confirm your email first, then log in.",
    );
    expect(toAuthErrorMessage("User already registered")).toBe(
      "An account with this email already exists.",
    );
    expect(
      toAuthErrorMessage("Password should be at least 6 characters"),
    ).toBe("Use a longer password and try again.");
  });

  it("falls back without leaking raw internals", () => {
    const raw = "Unexpected database fault ssl-cert=/etc/secret (code 42)";
    const mapped = toAuthErrorMessage(raw);
    expect(mapped).toBe(FALLBACK_AUTH_ERROR_MESSAGE);
    expect(mapped).not.toContain("/etc/secret");
  });
});
