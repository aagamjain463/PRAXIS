import { afterEach, describe, expect, it, vi } from "vitest";
import AuthGroupLayout from "../app/(auth)/layout";
import { getCurrentUser } from "../lib/auth/user";

vi.mock("../lib/auth/user", () => ({
  getCurrentUser: vi.fn(),
  requireUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

const mockGetCurrentUser = vi.mocked(getCurrentUser);

afterEach(() => {
  vi.clearAllMocks();
});

describe("(auth) group layout", () => {
  it("sends signed-in visitors into the app", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: "user-123",
      email: "aagam@example.com",
    } as never);

    await expect(AuthGroupLayout({ children: null })).rejects.toThrow(
      "REDIRECT:/",
    );
  });

  it("renders auth screens for logged-out visitors", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const element = await AuthGroupLayout({ children: "child-marker" });

    expect(element.props.children).toBe("child-marker");
  });
});
