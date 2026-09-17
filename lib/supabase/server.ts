// Server-side Supabase client factory (official `@supabase/ssr` pattern).
//
// For use in Server Components, Server Actions, and Route Handlers only.
// Reads the session from request cookies so future authenticated server code
// works; `setAll` is wrapped in try/catch because Server Components cannot
// write cookies — cookie writes are handled by the session-refresh proxy,
// which belongs to the authentication milestone (not this one).
//
// Deliberately async: Next.js 16 exposes cookies via an async API.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicConfig } from "./env";

export async function createClient() {
  const { url, publishableKey } = getSupabasePublicConfig();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component, which cannot set cookies.
          // Safe to ignore here; the auth proxy refreshes the session.
        }
      },
    },
  });
}
