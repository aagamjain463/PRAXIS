// Shared validation for the browser-safe Supabase configuration.
//
// Both the browser and server client factories read the same two public
// variables, so validation lives here instead of being duplicated.
//
// Design notes:
// - Validation is lazy: it runs only when a Supabase client is actually
//   created. Pages that never touch Supabase keep working (and building)
//   without any credentials configured.
// - Error messages name the missing variable but never print values,
//   so secrets can never leak through this path.

export const SUPABASE_URL_ENV_VAR = "NEXT_PUBLIC_SUPABASE_URL";
export const SUPABASE_PUBLISHABLE_KEY_ENV_VAR =
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

export function getSupabasePublicConfig(): SupabasePublicConfig {
  const url = process.env[SUPABASE_URL_ENV_VAR];
  const publishableKey = process.env[SUPABASE_PUBLISHABLE_KEY_ENV_VAR];

  if (!url || !publishableKey) {
    const missing: string[] = [];
    if (!url) {
      missing.push(SUPABASE_URL_ENV_VAR);
    }
    if (!publishableKey) {
      missing.push(SUPABASE_PUBLISHABLE_KEY_ENV_VAR);
    }
    throw new Error(
      `Missing required Supabase configuration: ${missing.join(", ")}. ` +
        `Copy .env.example to .env.local and fill in your project's browser-safe values. ` +
        `See README.md ("Supabase local setup").`,
    );
  }

  return { url, publishableKey };
}
