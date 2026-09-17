import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "../app/page";

describe("Praxis foundation screen", () => {
  it("renders the Praxis heading, tagline, and supporting copy", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Praxis" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Turn what you learn into what you do."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Capture what matters. Turn useful knowledge into meaningful action.",
      ),
    ).toBeInTheDocument();
  });
});
