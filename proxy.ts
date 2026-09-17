// Next.js 16 session-refresh entry point (the `proxy.ts` convention
// replaces the older `middleware.ts` file convention; the Supabase logic
// inside is unchanged).
//
// Runs before rendering to keep the Supabase session alive. It never
// redirects — see `lib/supabase/middleware.ts` and the route-group layouts
// for why protection lives elsewhere.

import type { NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
