import { cleanup, render, screen, within } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NavLinks } from "../components/nav-links";
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

const EXPECTED_LINKS: ReadonlyArray<readonly [string, string]> = [
  ["Home", "/"],
  ["Insights", "/insights"],
  ["Actions", "/actions"],
  ["Review", "/review"],
];

describe("NavLinks (sidebar)", () => {
  it("uses a navigation landmark with the four primary destinations", () => {
    navigationMockState.pathname = "/";
    render(<NavLinks variant="sidebar" />);

    const nav = screen.getByRole("navigation", { name: "Primary" });
    const links = within(nav).getAllByRole("link");

    expect(links).toHaveLength(4);
    expect(
      links.map((link) => [
        link.textContent,
        link.getAttribute("href"),
      ]),
    ).toEqual(EXPECTED_LINKS);
  });

  it.each(EXPECTED_LINKS)(
    "marks only %s as the current page when the pathname is %s",
    (label, href) => {
      navigationMockState.pathname = href;
      render(<NavLinks variant="sidebar" />);

      const nav = screen.getByRole("navigation", { name: "Primary" });
      const links = within(nav).getAllByRole("link");

      for (const link of links) {
        if (link.textContent === label) {
          expect(link).toHaveAttribute("aria-current", "page");
        } else {
          expect(link).not.toHaveAttribute("aria-current");
        }
      }
    },
  );
});

describe("NavLinks (bottom)", () => {
  it("exposes the same four destinations with accessible active state", () => {
    navigationMockState.pathname = "/actions";
    render(<NavLinks variant="bottom" />);

    const nav = screen.getByRole("navigation", { name: "Primary" });
    const links = within(nav).getAllByRole("link");

    expect(
      links.map((link) => [
        link.textContent,
        link.getAttribute("href"),
      ]),
    ).toEqual(EXPECTED_LINKS);

    const active = within(nav).getByRole("link", { name: "Actions" });
    expect(active).toHaveAttribute("aria-current", "page");

    for (const link of links) {
      if (link !== active) {
        expect(link).not.toHaveAttribute("aria-current");
      }
    }
  });
});
