import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ActionsPage from "../app/actions/page";
import InsightsPage from "../app/insights/page";
import ReviewPage from "../app/review/page";

afterEach(() => {
  cleanup();
});

describe("Insights page", () => {
  it("renders an honest empty state without fake data", () => {
    render(<InsightsPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Insights" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The knowledge that matters to you will live here."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Ideas, lessons, and highlights you capture will appear here, organized and ready to revisit when they matter most.",
      ),
    ).toBeInTheDocument();
  });
});

describe("Actions page", () => {
  it("renders an honest empty state without fake data", () => {
    render(<ActionsPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Actions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Turn useful knowledge into things you’ll actually do."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "The actions you commit to will live here, so the gap between knowing and doing stays visible.",
      ),
    ).toBeInTheDocument();
  });
});

describe("Review page", () => {
  it("renders an honest empty state without fake data", () => {
    render(<ReviewPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Review" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Reflect on what you’ve learned, applied, and discovered.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your reflections and reviews will live here, so you can see what is actually changing over time.",
      ),
    ).toBeInTheDocument();
  });
});
