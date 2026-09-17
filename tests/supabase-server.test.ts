import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SUPABASE_PUBLISHABLE_KEY_ENV_VAR,
  SUPABASE_URL_ENV_VAR,
} from "../lib/supabase/env";
import { createClient } from "../lib/supabase/server";

const TEST_URL = "https://xyzcompany.supabase.co";
const TEST_KEY = "sb_publishable_TESTSECRET123";

// `next/headers` only works inside a real Next.js request, so the server
// client test stands in a minimal in-memory cookie store.
const { cookieStoreMock } = vi.hoisted(() => ({
  cookieStoreMock: {
    getAll: vi.fn((): Array<{ name: string; value: string }> => []),
    set: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({
  cookies: async () => cookieStoreMock,
}));

function clearSupabaseEnv() {
  delete process.env[SUPABASE_URL_ENV_VAR];
  delete process.env[SUPABASE_PUBLISHABLE_KEY_ENV_VAR];
}

afterEach(() => {
  vi.unstubAllEnvs();
  clearSupabaseEnv();
  cookieStoreMock.getAll.mockReturnValue([]);
  cookieStoreMock.set.mockClear();
});

describe("server Supabase client", () => {
  it("targets the configured project URL", async () => {
    vi.stubEnv(SUPABASE_URL_ENV_VAR, TEST_URL);
    vi.stubEnv(SUPABASE_PUBLISHABLE_KEY_ENV_VAR, TEST_KEY);

    const supabase = await createClient();

    // Query builders are lazy (no request is made); the built URL proves
    // the client points at the configured project.
    expect(supabase.from("placeholder").url.href).toBe(
      `${TEST_URL}/rest/v1/placeholder`,
    );
  });

  it("reads the session from request cookies", async () => {
    vi.stubEnv(SUPABASE_URL_ENV_VAR, TEST_URL);
    vi.stubEnv(SUPABASE_PUBLISHABLE_KEY_ENV_VAR, TEST_KEY);

    const supabase = await createClient();
    // No session is stored, so this resolves locally without any network
    // call — it only exercises the cookie-storage wiring.
    const { data, error } = await supabase.auth.getSession();

    expect(error).toBeNull();
    expect(data.session).toBeNull();
    expect(cookieStoreMock.getAll).toHaveBeenCalled();
  });

  it("fails clearly when configuration is missing", async () => {
    clearSupabaseEnv();

    await expect(createClient()).rejects.toThrow(
      "Missing required Supabase configuration",
    );
  });
});
