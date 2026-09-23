import Link from "next/link";
import { SubmitButton } from "@/components/submit-button";
import { login } from "../actions";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string; setup?: string }> }) {
  const params = await searchParams;
  return <section className="auth-card"><span className="eyebrow">Welcome back</span><h1>Continue putting knowledge into practice.</h1><p>Sign in to your private Praxis workspace.</p>{params.setup && <div className="form-notice">Supabase configuration is required. See <code>.env.example</code>.</div>}{params.error && <div className="form-error" role="alert">{params.error}</div>}<form action={login} className="stack-form"><input type="hidden" name="next" value={params.next || "/today"} /><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label><div className="form-row"><Link href="/forgot-password">Forgot password?</Link></div><SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton></form><p className="auth-switch">New to Praxis? <Link href="/signup">Create an account</Link></p></section>;
}
