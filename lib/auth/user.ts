// Server-side access to the authenticated user.
//
// `getUser()` asks the Supabase Auth server to validate the session, so the
// returned user is authoritative — unlike locally decoded session data,
// which must never be trusted for protection decisions. `requireUser()`
// backs the `(app)` group layout: logged-out visitors never reach protected
// UI because the redirect happens during server rendering.

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
