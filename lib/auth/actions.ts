// Auth Server Actions: the only place credentials are handled.
//
// Email/password are read from FormData, validated, and passed straight to
// Supabase Auth — never logged, never stored, never placed in client state.
// Raw Supabase errors are logged server-side (message only) while the UI
// receives only the safe mapped copy.

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";
import { toAuthErrorMessage } from "./errors";
import {
  firstValidationError,
  hasValidationErrors,
  validateLoginInput,
  validateSignupInput,
} from "./validation";

export type AuthActionState = {
  error?: string;
  confirmationRequired?: boolean;
  email?: string;
};

function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formString(formData, "email").trim();
  const password = formString(formData, "password");

  const validationErrors = validateLoginInput({ email, password });
  if (hasValidationErrors(validationErrors)) {
    return { error: firstValidationError(validationErrors) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error(`[auth] sign-in failed: ${error.message}`);
    return { error: toAuthErrorMessage(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formString(formData, "email").trim();
  const password = formString(formData, "password");
  const confirmPassword = formString(formData, "confirmPassword");

  const validationErrors = validateSignupInput({
    email,
    password,
    confirmPassword,
  });
  if (hasValidationErrors(validationErrors)) {
    return { error: firstValidationError(validationErrors) };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: origin ? { emailRedirectTo: `${origin}/auth/confirm` } : {},
  });

  if (error) {
    console.error(`[auth] sign-up failed: ${error.message}`);
    return { error: toAuthErrorMessage(error.message) };
  }

  if (data.session) {
    // Email confirmation is off: the new account is signed in immediately.
    revalidatePath("/", "layout");
    redirect("/");
  }

  // Email confirmation is on: Supabase emailed a link. The account must NOT
  // be treated as authenticated until the user completes that flow.
  return { confirmationRequired: true, email };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error(`[auth] sign-out failed: ${error.message}`);
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
