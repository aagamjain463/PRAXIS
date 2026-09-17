import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { resolveSafeNext } from "../../../lib/auth/redirect";
import { createClient } from "../../../lib/supabase/server";

// Landing target for Supabase email-confirmation links
// (`/auth/confirm?token_hash=…&type=…`). Verifies the one-time token and
// signs the user in via cookies, then sends them into the app. Anything
// missing or invalid falls back to `/login` with a fixed error code.
const ALLOWED_OTP_TYPES: ReadonlySet<string> = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = resolveSafeNext(requestUrl.searchParams.get("next"));

  if (token_hash && type && ALLOWED_OTP_TYPES.has(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=confirm-failed", request.url),
  );
}
