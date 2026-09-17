import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "../components/auth/login-form";
import { SignupForm } from "../components/auth/signup-form";
import {
  loginAction,
  signUpAction,
  type AuthActionState,
} from "../lib/auth/actions";

vi.mock("../lib/auth/actions", () => ({
  loginAction: vi.fn(),
  signUpAction: vi.fn(),
  signOutAction: vi.fn(),
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

const mockLoginAction = vi.mocked(loginAction);
const mockSignUpAction = vi.mocked(signUpAction);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function fillAndSubmit(values: Record<string, string>) {
  for (const [name, value] of Object.entries(values)) {
    const field = document.querySelector(
      `input[name="${name}"]`,
    ) as HTMLInputElement;
    fireEvent.change(field, { target: { value } });
  }
  const form = document.querySelector("form") as HTMLFormElement;
  fireEvent.submit(form);
}

describe("LoginForm", () => {
  it("renders accessible fields, submit, and signup link", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
    expect(
      screen.getByRole("button", { name: "Log in" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create an account" }),
    ).toHaveAttribute("href", "/signup");
  });

  it("blocks invalid input locally without calling the server", () => {
    render(<LoginForm />);
    fillAndSubmit({ email: "not-an-email", password: "secret12" });

    const emailInput = screen.getByLabelText("Email");
    expect(emailInput).toHaveAttribute("aria-describedby", "email-error");
    expect(document.getElementById("email-error")).toHaveTextContent(
      "Enter a valid email address.",
    );
    expect(mockLoginAction).not.toHaveBeenCalled();
  });

  it("shows server errors safely", async () => {
    mockLoginAction.mockResolvedValue({
      error: "Incorrect email or password.",
    } satisfies AuthActionState);
    render(<LoginForm />);
    fillAndSubmit({ email: "aagam@example.com", password: "wrongpassword" });

    expect(await screen.findByText("Incorrect email or password."))
      .toBeInTheDocument();
  });

  it("shows a fixed notice when provided", () => {
    render(<LoginForm notice="Email confirmed. Log in to continue." />);

    expect(
      screen.getByRole("status"),
    ).toHaveTextContent("Email confirmed. Log in to continue.");
  });
});

describe("SignupForm", () => {
  it("renders accessible fields including confirmation, and a login link", () => {
    render(<SignupForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("blocks mismatched passwords locally", () => {
    render(<SignupForm />);
    fillAndSubmit({
      email: "aagam@example.com",
      password: "secret12",
      confirmPassword: "secret34",
    });

    const confirmInput = screen.getByLabelText("Confirm password");
    expect(confirmInput).toHaveAttribute(
      "aria-describedby",
      "confirmPassword-error",
    );
    expect(document.getElementById("confirmPassword-error")).toHaveTextContent(
      "Passwords do not match.",
    );
    expect(mockSignUpAction).not.toHaveBeenCalled();
  });

  it("shows the confirmation state instead of pretending to log in", async () => {
    mockSignUpAction.mockResolvedValue({
      confirmationRequired: true,
      email: "aagam@example.com",
    } satisfies AuthActionState);
    render(<SignupForm />);
    fillAndSubmit({
      email: "aagam@example.com",
      password: "secret12",
      confirmPassword: "secret12",
    });

    expect(await screen.findByText("Check your email")).toBeInTheDocument();
    expect(screen.getByText("aagam@example.com")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Create account" }),
    ).not.toBeInTheDocument();
  });
});
