import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Home from "../app/(app)/page";

afterEach(() => {
  cleanup();
});

describe("Home page", () => {
  it("renders the Home heading, tagline, and supporting copy", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Home" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Turn what you learn into what you do."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Praxis will help you capture what matters, understand why it matters, and turn useful knowledge into meaningful action.",
      ),
    ).toBeInTheDocument();
  });
});
