"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import {
  signUpAction,
  type AuthActionState,
} from "../../lib/auth/actions";
import {
  firstValidationError,
  hasValidationErrors,
  validateSignupInput,
  type AuthValidationError,
} from "../../lib/auth/validation";
import { AuthCard } from "./auth-card";
import { AuthField, authSubmitClassName } from "./auth-field";

const initialState: AuthActionState = {};
const noFieldErrors: AuthValidationError = {};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    signUpAction,
    initialState,
  );
  const [clientError, setClientError] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] =
    useState<AuthValidationError>(noFieldErrors);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const errors = validateSignupInput({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    });
    if (hasValidationErrors(errors)) {
      event.preventDefault();
      setFieldErrors(errors);
      setClientError(firstValidationError(errors));
    } else {
      setFieldErrors(noFieldErrors);
      setClientError(undefined);
    }
  }

  if (state.confirmationRequired) {
    return (
      <AuthCard
        heading="Check your email"
        subheading="Your account is almost ready."
      >
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          We sent a confirmation link to{" "}
          <span className="font-medium text-zinc-950 dark:text-zinc-50">
            {state.email}
          </span>
          . Click it to finish creating your account, then log in.
        </p>
        <Link href="/login" className={`${authSubmitClassName} mt-6`}>
          Go to log in
        </Link>
      </AuthCard>
    );
  }

  const error = state.error ?? clientError;

  return (
    <AuthCard
      heading="Create your Praxis account"
      subheading="Start turning what you learn into what you do."
    >
      <form action={formAction} onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          <AuthField
            id="email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            disabled={isPending}
            error={fieldErrors.email}
          />
          <AuthField
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            required
            minLength={6}
            disabled={isPending}
            error={fieldErrors.password}
          />
          <AuthField
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            required
            disabled={isPending}
            error={fieldErrors.confirmPassword}
          />
          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-6 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            >
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isPending}
            className={authSubmitClassName}
          >
            {isPending ? "Creating account…" : "Create account"}
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-zinc-950 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:text-zinc-50 dark:focus-visible:outline-zinc-100"
        >
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
