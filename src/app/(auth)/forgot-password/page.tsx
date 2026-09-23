import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { forgotPassword } from "../actions";

export const metadata = { title: "Reset password" };

export default async function ForgotPage({ searchParams }: { searchParams: Promise<{ error?: string; sent?: string }> }) {
  const params = await searchParams;
  return <section className="auth-card"><h1>Reset your password.</h1><p>We’ll send a secure link if an account exists for that address.</p>{params.error && <div className="form-error" role="alert">{params.error}</div>}{params.sent ? <div className="form-success">Check your email for a reset link.</div> : <form action={forgotPassword} className="stack-form"><label>Email<input name="email" type="email" autoComplete="email" required /></label><SubmitButton pendingLabel="Sending…">Send reset link</SubmitButton></form>}<p className="auth-switch"><Link href="/login">Return to sign in</Link></p></section>;
}
