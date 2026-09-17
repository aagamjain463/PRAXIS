import { afterEach, describe, expect, it, vi } from "vitest";
import {
  loginAction,
  signOutAction,
  signUpAction,
} from "../lib/auth/actions";
import { createClient } from "../lib/supabase/server";

vi.mock("../lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) =>
      name === "origin" ? "http://localhost:3000" : null,
  }),
}));

const mockCreateClient = vi.mocked(createClient);

function stubAuthApi(api: Record<string, unknown>) {
  mockCreateClient.mockResolvedValue({ auth: api } as never);
}

function formData(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    data.append(key, value);
  }
  return data;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("loginAction", () => {
  it("rejects invalid input before touching Supabase", async () => {
    const state = await loginAction(
      {},
      formData({ email: "bad", password: "secret12" }),
    );

    expect(state.error).toBe("Enter a valid email address.");
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("redirects into the app on success", async () => {
    const signInWithPassword = vi
      .fn()
      .mockResolvedValue({ data: { session: {} }, error: null });
    stubAuthApi({ signInWithPassword });

    await expect(
      loginAction(
        {},
        formData({ email: "  aagam@example.com ", password: "secret12" }),
      ),
    ).rejects.toThrow("REDIRECT:/");
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "aagam@example.com",
      password: "secret12",
    });
  });

  it("maps Supabase failures to safe messages", async () => {
    stubAuthApi({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { session: null },
        error: { message: "Invalid login credentials" },
      }),
    });

    const state = await loginAction(
      {},
      formData({ email: "aagam@example.com", password: "wrongpassword" }),
    );

    expect(state.error).toBe("Incorrect email or password.");
  });
});

describe("signUpAction", () => {
  it("returns a confirmation state when no session is issued", async () => {
    stubAuthApi({
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: "u1" }, session: null },
        error: null,
      }),
    });

    const state = await signUpAction(
      {},
      formData({
        email: "aagam@example.com",
        password: "secret12",
        confirmPassword: "secret12",
      }),
    );

    expect(state).toEqual({
      confirmationRequired: true,
      email: "aagam@example.com",
    });
  });

  it("redirects into the app when a session is issued immediately", async () => {
    stubAuthApi({
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: "u1" }, session: {} },
        error: null,
      }),
    });

    await expect(
      signUpAction(
        {},
        formData({
          email: "aagam@example.com",
          password: "secret12",
          confirmPassword: "secret12",
        }),
      ),
    ).rejects.toThrow("REDIRECT:/");
  });

  it("rejects mismatched passwords before touching Supabase", async () => {
    const state = await signUpAction(
      {},
      formData({
        email: "aagam@example.com",
        password: "secret12",
        confirmPassword: "secret34",
      }),
    );

    expect(state.error).toBe("Passwords do not match.");
    expect(mockCreateClient).not.toHaveBeenCalled();
  });
});

describe("signOutAction", () => {
  it("signs out and returns to login", async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });
    stubAuthApi({ signOut });

    await expect(signOutAction()).rejects.toThrow("REDIRECT:/login");
    expect(signOut).toHaveBeenCalledOnce();
  });
});
