"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { emailSchema, passwordSchema, safeRedirect } from "@/lib/validation";
import { hasSupabaseEnv, siteUrl } from "@/lib/env";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function login(formData: FormData) {
  if (!hasSupabaseEnv()) fail("/login", "Connect Supabase to enable accounts.");
  const email = emailSchema.safeParse(formData.get("email"));
  const password = passwordSchema.safeParse(formData.get("password"));
  const next = safeRedirect(formData.get("next"));
  if (!email.success || !password.success) fail("/login", email.error?.issues[0]?.message || password.error?.issues[0]?.message || "Check your details");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: email.data, password: password.data });
  if (error) fail("/login", "Email or password is incorrect.");
  redirect(next);
}

export async function signup(formData: FormData) {
  if (!hasSupabaseEnv()) fail("/signup", "Connect Supabase to enable accounts.");
  const email = emailSchema.safeParse(formData.get("email"));
  const password = passwordSchema.safeParse(formData.get("password"));
  const name = String(formData.get("name") || "").trim().slice(0, 80);
  if (!email.success || !password.success || name.length < 2) fail("/signup", email.error?.issues[0]?.message || password.error?.issues[0]?.message || "Enter your name");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: email.data,
    password: password.data,
    options: { emailRedirectTo: `${siteUrl()}/auth/callback?next=/onboarding`, data: { display_name: name } }
  });
  if (error) fail("/signup", error.message.includes("registered") ? "An account already exists for this email." : "Account could not be created.");
  redirect(data.session ? "/onboarding" : `/verify-email?email=${encodeURIComponent(email.data)}`);
}

export async function signInWithGoogle() {
  if (!hasSupabaseEnv()) fail("/login", "Connect Supabase to enable accounts.");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${siteUrl()}/auth/callback?next=/onboarding` } });
  if (error || !data.url) fail("/login", "Google sign-in is not configured.");
  redirect(data.url);
}

export async function forgotPassword(formData: FormData) {
  if (!hasSupabaseEnv()) fail("/forgot-password", "Connect Supabase to enable accounts.");
  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) fail("/forgot-password", email.error.issues[0].message);
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email.data, { redirectTo: `${siteUrl()}/auth/callback?next=/update-password` });
  redirect("/forgot-password?sent=1");
}

export async function updatePassword(formData: FormData) {
  const password = passwordSchema.safeParse(formData.get("password"));
  if (!password.success) fail("/update-password", password.error.issues[0].message);
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: password.data });
  if (error) fail("/update-password", "Password could not be updated. Request a new link.");
  redirect("/today?notice=password-updated");
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
