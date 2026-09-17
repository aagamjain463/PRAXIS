// Maps Supabase Auth failures to safe, user-facing messages.
//
// The raw Supabase message is never shown: it can leak implementation
// details and varies by project configuration. Callers log the raw error
// server-side (never the password or tokens) and display only these strings.

const FRIENDLY_MESSAGES: ReadonlyArray<readonly [RegExp, string]> = [
  [/invalid login credentials/i, "Incorrect email or password."],
  [/email not confirmed/i, "Confirm your email first, then log in."],
  [/user already registered/i, "An account with this email already exists."],
  [/password should be at least/i, "Use a longer password and try again."],
  [/signup requires a valid password/i, "Use a stronger password."],
  [/email address .* is invalid/i, "Enter a valid email address."],
  [/unable to validate email address/i, "Enter a valid email address."],
  [/email rate limit exceeded/i, "Too many attempts. Wait a bit and retry."],
  [/over email send rate limit/i, "Too many attempts. Wait a bit and retry."],
  [/token has expired or is invalid/i, "That link expired. Request a new one."],
];

export const FALLBACK_AUTH_ERROR_MESSAGE =
  "Something went wrong. Please try again.";

export function toAuthErrorMessage(rawMessage: string): string {
  for (const [pattern, friendly] of FRIENDLY_MESSAGES) {
    if (pattern.test(rawMessage)) {
      return friendly;
    }
  }
  return FALLBACK_AUTH_ERROR_MESSAGE;
}
