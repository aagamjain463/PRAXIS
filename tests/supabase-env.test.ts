import { afterEach, describe, expect, it, vi } from "vitest";
import { createClient } from "../lib/supabase/client";
import {
  SUPABASE_PUBLISHABLE_KEY_ENV_VAR,
  SUPABASE_URL_ENV_VAR,
  getSupabasePublicConfig,
} from "../lib/supabase/env";

const TEST_URL = "https://xyzcompany.supabase.co";
const TEST_KEY = "sb_publishable_TESTSECRET123";

function clearSupabaseEnv() {
  delete process.env[SUPABASE_URL_ENV_VAR];
  delete process.env[SUPABASE_PUBLISHABLE_KEY_ENV_VAR];
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  clearSupabaseEnv();
});

describe("getSupabasePublicConfig", () => {
  it("names every missing variable when none are configured", () => {
    clearSupabaseEnv();

    expect(() => getSupabasePublicConfig()).toThrow(
      `Missing required Supabase configuration: ${SUPABASE_URL_ENV_VAR}, ${SUPABASE_PUBLISHABLE_KEY_ENV_VAR}.`,
    );
  });

  it("names only the variable that is actually missing", () => {
    clearSupabaseEnv();
    vi.stubEnv(SUPABASE_URL_ENV_VAR, TEST_URL);

    expect(() => getSupabasePublicConfig()).toThrow(
      `Missing required Supabase configuration: ${SUPABASE_PUBLISHABLE_KEY_ENV_VAR}.`,
    );
  });

  it("never includes secret values in the error message", () => {
    clearSupabaseEnv();
    vi.stubEnv(SUPABASE_URL_ENV_VAR, TEST_URL);

    try {
      getSupabasePublicConfig();
      expect.unreachable("expected getSupabasePublicConfig to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).not.toContain("TESTSECRET");
    }
  });

  it("returns the configured values when both are present", () => {
    vi.stubEnv(SUPABASE_URL_ENV_VAR, TEST_URL);
    vi.stubEnv(SUPABASE_PUBLISHABLE_KEY_ENV_VAR, TEST_KEY);

    expect(getSupabasePublicConfig()).toEqual({
      url: TEST_URL,
      publishableKey: TEST_KEY,
    });
  });
});

describe("browser Supabase client", () => {
  it("targets the configured project URL", () => {
    vi.stubEnv(SUPABASE_URL_ENV_VAR, TEST_URL);
    vi.stubEnv(SUPABASE_PUBLISHABLE_KEY_ENV_VAR, TEST_KEY);

    const supabase = createClient();

    // Query builders are lazy (no request is made); the built URL proves
    // the client points at the configured project.
    expect(supabase.from("placeholder").url.href).toBe(
      `${TEST_URL}/rest/v1/placeholder`,
    );
  });

  it("sends the configured publishable key on requests", async () => {
    vi.stubEnv(SUPABASE_URL_ENV_VAR, TEST_URL);
    vi.stubEnv(SUPABASE_PUBLISHABLE_KEY_ENV_VAR, TEST_KEY);
    const fetchMock = vi.fn<typeof fetch>(async () =>
      Response.json({ user: null }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const supabase = createClient();
    await supabase.auth.getUser("test-token");

    expect(fetchMock).toHaveBeenCalledOnce();
    const [requestUrl, init] = fetchMock.mock.calls[0];
    const url =
      typeof requestUrl === "string"
        ? requestUrl
        : requestUrl instanceof Request
          ? requestUrl.url
          : requestUrl.href;
    expect(url).toBe(`${TEST_URL}/auth/v1/user`);
    expect(new Headers(init?.headers).get("apikey")).toBe(TEST_KEY);
  });

  it("fails clearly when configuration is missing", () => {
    clearSupabaseEnv();

    expect(() => createClient()).toThrow(
      "Missing required Supabase configuration",
    );
  });
});
