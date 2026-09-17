import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "../app/auth/confirm/route";
import { createClient } from "../lib/supabase/server";

vi.mock("../lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const mockCreateClient = vi.mocked(createClient);
const mockVerifyOtp = vi.fn();

function stubVerifyOtp(result: { error: { message: string } | null }) {
  mockVerifyOtp.mockResolvedValue(result);
  mockCreateClient.mockResolvedValue({
    auth: { verifyOtp: mockVerifyOtp },
  } as unknown as SupabaseClient);
}

afterEach(() => {
  vi.clearAllMocks();
});

function confirmUrl(params: string) {
  return `http://localhost:3000/auth/confirm${params}`;
}

describe("GET /auth/confirm", () => {
  it("signs the user in and honors a safe next target", async () => {
    stubVerifyOtp({ error: null });

    const response = await GET(
      new Request(confirmUrl("?token_hash=abc&type=signup&next=/actions")),
    );

    expect(mockVerifyOtp).toHaveBeenCalledWith({
      type: "signup",
      token_hash: "abc",
    });
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/actions",
    );
  });

  it("defaults to the app home when no next target is given", async () => {
    stubVerifyOtp({ error: null });

    const response = await GET(
      new Request(confirmUrl("?token_hash=abc&type=signup")),
    );

    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("sends failures back to login without verifying", async () => {
    stubVerifyOtp({ error: null });

    const response = await GET(new Request(confirmUrl("")));

    expect(mockVerifyOtp).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=confirm-failed",
    );
  });

  it("rejects unknown otp types and failed verifications", async () => {
    stubVerifyOtp({ error: null });

    const badType = await GET(
      new Request(confirmUrl("?token_hash=abc&type=nonsense")),
    );
    expect(mockVerifyOtp).not.toHaveBeenCalled();
    expect(badType.headers.get("location")).toBe(
      "http://localhost:3000/login?error=confirm-failed",
    );

    stubVerifyOtp({ error: { message: "Token has expired or is invalid" } });
    const badToken = await GET(
      new Request(confirmUrl("?token_hash=stale&type=signup")),
    );
    expect(badToken.headers.get("location")).toBe(
      "http://localhost:3000/login?error=confirm-failed",
    );
  });

  it("never redirects to an external target", async () => {
    stubVerifyOtp({ error: null });

    const response = await GET(
      new Request(
        confirmUrl("?token_hash=abc&type=signup&next=https://evil.example"),
      ),
    );

    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });
});
