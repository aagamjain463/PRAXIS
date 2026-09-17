import { describe, expect, it } from "vitest";
import {
  firstValidationError,
  hasValidationErrors,
  validateEmail,
  validateLoginInput,
  validatePassword,
  validateSignupInput,
} from "../lib/auth/validation";

describe("auth email validation", () => {
  it("requires an email", () => {
    expect(validateEmail("")).toBe("Enter your email address.");
    expect(validateEmail("   ")).toBe("Enter your email address.");
  });

  it("rejects malformed addresses", () => {
    expect(validateEmail("not-an-email")).toBe("Enter a valid email address.");
    expect(validateEmail("aagam@")).toBe("Enter a valid email address.");
    expect(validateEmail("@example.com")).toBe("Enter a valid email address.");
  });

  it("accepts a normal address", () => {
    expect(validateEmail("aagam@example.com")).toBeUndefined();
  });
});

describe("auth password validation", () => {
  it("requires a password of reasonable length", () => {
    expect(validatePassword("")).toBe("Enter your password.");
    expect(validatePassword("12345")).toBe("Use at least 6 characters.");
    expect(validatePassword("123456")).toBeUndefined();
  });
});

describe("login input validation", () => {
  it("reports missing fields without inventing password rules", () => {
    const errors = validateLoginInput({ email: "", password: "" });
    expect(hasValidationErrors(errors)).toBe(true);
    expect(errors.email).toBe("Enter your email address.");
    expect(errors.password).toBe("Enter your password.");
  });

  it("passes valid input", () => {
    const errors = validateLoginInput({
      email: "aagam@example.com",
      password: "anything",
    });
    expect(hasValidationErrors(errors)).toBe(false);
    expect(firstValidationError(errors)).toBeUndefined();
  });
});

describe("signup input validation", () => {
  it("requires matching confirmation", () => {
    expect(
      validateSignupInput({
        email: "aagam@example.com",
        password: "secret1",
        confirmPassword: "",
      }).confirmPassword,
    ).toBe("Repeat your password.");

    expect(
      validateSignupInput({
        email: "aagam@example.com",
        password: "secret1",
        confirmPassword: "secret2",
      }).confirmPassword,
    ).toBe("Passwords do not match.");
  });

  it("passes matching input and surfaces the first problem", () => {
    const errors = validateSignupInput({
      email: "bad",
      password: "short",
      confirmPassword: "different",
    });
    expect(hasValidationErrors(errors)).toBe(true);
    expect(firstValidationError(errors)).toBe("Enter a valid email address.");

    expect(
      hasValidationErrors(
        validateSignupInput({
          email: "aagam@example.com",
          password: "secret12",
          confirmPassword: "secret12",
        }),
      ),
    ).toBe(false);
  });
});
