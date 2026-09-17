import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser, requireUser } from "../lib/auth/user";
import { createClient } from "../lib/supabase/server";

vi.mock("../lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

const mockCreateClient = vi.mocked(createClient);

function stubSignedInUser() {
  const user = { id: "user-123", email: "aagam@example.com" };
  mockCreateClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
  } as unknown as SupabaseClient);
  return user;
}

function stubSignedOut() {
  mockCreateClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
  } as unknown as SupabaseClient);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("getCurrentUser", () => {
  it("returns the validated user when a session exists", async () => {
    const user = stubSignedInUser();

    await expect(getCurrentUser()).resolves.toEqual(user);
  });

  it("returns null without a session", async () => {
    stubSignedOut();

    await expect(getCurrentUser()).resolves.toBeNull();
  });
});

describe("requireUser", () => {
  it("passes the user through when authenticated", async () => {
    const user = stubSignedInUser();

    await expect(requireUser()).resolves.toEqual(user);
  });

  it("redirects logged-out visitors to login", async () => {
    stubSignedOut();

    await expect(requireUser()).rejects.toThrow("REDIRECT:/login");
  });
});
