export const metadata = { title: "Verify email" };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return <section className="auth-card"><span className="eyebrow">One more step</span><h1>Check your inbox.</h1><p>We sent a verification link{email ? <> to <strong>{email}</strong></> : null}. Open it to continue onboarding.</p><div className="form-notice">The link expires for your protection. You can request a new account email by signing up again.</div></section>;
}
