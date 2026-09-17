import { cleanup, render, screen, within } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "../components/app-shell";
import { navigationMockState } from "./navigation-state";

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMockState.pathname,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: ReactNode;
  } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
  navigationMockState.pathname = "/";
});

describe("AppShell", () => {
  it("renders shared navigation, branding, and page content", () => {
    navigationMockState.pathname = "/";
    render(
      <AppShell userEmail="aagam@example.com">
        <p>Test page content</p>
      </AppShell>,
    );

    // Sidebar (desktop) and bottom bar (mobile) navigation landmarks.
    const navigations = screen.getAllByRole("navigation", { name: "Primary" });
    expect(navigations).toHaveLength(2);
    for (const nav of navigations) {
      expect(within(nav).getAllByRole("link")).toHaveLength(4);
    }

    // Text-based brand mark links back home.
    const brandLinks = screen.getAllByRole("link", { name: "Praxis" });
    expect(brandLinks).toHaveLength(2);
    for (const brand of brandLinks) {
      expect(brand).toHaveAttribute("href", "/");
    }

    // Page content renders inside the main landmark.
    const main = screen.getByRole("main");
    expect(
      within(main).getByText("Test page content"),
    ).toBeInTheDocument();
  });

  it("shows the signed-in identity with a logout control", () => {
    navigationMockState.pathname = "/";
    render(
      <AppShell userEmail="aagam@example.com">
        <p>Test page content</p>
      </AppShell>,
    );

    // Sidebar footer and mobile header both surface the account.
    expect(screen.getAllByText("aagam@example.com")).toHaveLength(2);
    const logoutButtons = screen.getAllByRole("button", { name: "Log out" });
    expect(logoutButtons).toHaveLength(2);
  });

  it("marks Home as current on the root pathname", () => {
    navigationMockState.pathname = "/";
    render(
      <AppShell userEmail="aagam@example.com">
        <p>Test page content</p>
      </AppShell>,
    );

    const homeLinks = screen.getAllByRole("link", { name: "Home" });
    expect(homeLinks).toHaveLength(2);
    for (const link of homeLinks) {
      expect(link).toHaveAttribute("aria-current", "page");
    }
  });
});
