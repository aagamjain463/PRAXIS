// Browser-side Supabase client factory (official `@supabase/ssr` pattern).
//
// For use in Client Components only. Uses browser-safe public configuration;
// never pass service-role or other privileged secrets here. `createClient`
// may be called from any Client Component — `@supabase/ssr` keeps a single
// shared browser instance internally.

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "./env";

export function createClient() {
  const { url, publishableKey } = getSupabasePublicConfig();
  return createBrowserClient(url, publishableKey);
}
