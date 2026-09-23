import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { signup } from "../actions";

export const metadata = { title: "Create account" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <section className="auth-card"><span className="eyebrow">Start with one useful idea</span><h1>Turn learning into action.</h1><p>Core capture, insights, actions, and outcomes are free.</p>{error && <div className="form-error" role="alert">{error}</div>}<form action={signup} className="stack-form"><label>Name<input name="name" autoComplete="name" minLength={2} maxLength={80} required /></label><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required /><small>At least 8 characters</small></label><SubmitButton pendingLabel="Creating account…">Create account</SubmitButton></form><p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p></section>;
}
