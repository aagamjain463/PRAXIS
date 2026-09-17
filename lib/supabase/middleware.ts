// Supabase session refresh for the Next.js proxy layer.
//
// Official `@supabase/ssr` pattern: every request gets a fresh server client
// bound to the request cookies, and `getClaims()` refreshes an expiring
// session (verifying the JWT in the process). Refreshed cookies — plus the
// accompanying no-cache headers, which prevent a CDN from serving one user's
// session to another — are written onto the outgoing response.
//
// This middleware deliberately performs NO redirects: route protection lives
// in the `(app)` / `(auth)` layouts, so this layer cannot cause redirect
// loops or lock out the auth pages.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "./env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { url, publishableKey } = getSupabasePublicConfig();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value),
        );
      },
    },
  });

  // Refreshes the session when needed. The user value is intentionally
  // unused here — this layer only keeps the session alive.
  await supabase.auth.getClaims();

  return supabaseResponse;
}
