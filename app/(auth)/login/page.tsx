import type { Metadata } from "next";
import { LoginForm } from "../../../components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in — Praxis",
  description: "Log in to Praxis to turn what you learn into what you do.",
};

// Only fixed notice codes are honored; arbitrary query values are ignored,
// so nothing attacker-controlled is ever rendered.
const NOTICES: Record<string, string> = {
  "confirm-failed":
    "That confirmation link is invalid or expired. Log in if you already confirmed, or create your account again.",
  confirmed: "Email confirmed. Log in to continue.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const params = await searchParams;
  const notice =
    NOTICES[params.error ?? ""] ?? NOTICES[params.notice ?? ""] ?? undefined;

  return <LoginForm notice={notice} />;
}
