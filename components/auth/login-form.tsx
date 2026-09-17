"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import {
  loginAction,
  type AuthActionState,
} from "../../lib/auth/actions";
import {
  firstValidationError,
  hasValidationErrors,
  validateLoginInput,
  type AuthValidationError,
} from "../../lib/auth/validation";
import { AuthCard } from "./auth-card";
import { AuthField, authSubmitClassName } from "./auth-field";

const initialState: AuthActionState = {};
const noFieldErrors: AuthValidationError = {};

export function LoginForm({ notice }: { notice?: string }) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );
  const [clientError, setClientError] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] =
    useState<AuthValidationError>(noFieldErrors);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const errors = validateLoginInput({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
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

  const error = state.error ?? clientError;

  return (
    <AuthCard
      heading="Welcome back"
      subheading="Log in to continue turning what you learn into what you do."
    >
      <form action={formAction} onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          {notice ? (
            <p
              role="status"
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm leading-6 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              {notice}
            </p>
          ) : null}
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
            autoComplete="current-password"
            placeholder="Your password"
            required
            disabled={isPending}
            error={fieldErrors.password}
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
            {isPending ? "Logging in…" : "Log in"}
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        New to Praxis?{" "}
        <Link
          href="/signup"
          className="font-medium text-zinc-950 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:text-zinc-50 dark:focus-visible:outline-zinc-100"
        >
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
