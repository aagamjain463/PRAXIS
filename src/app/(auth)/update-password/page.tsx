import { SubmitButton } from "@/components/submit-button";
import { updatePassword } from "../actions";

export const metadata = { title: "Choose a new password" };

export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <section className="auth-card"><h1>Choose a new password.</h1>{error && <div className="form-error" role="alert">{error}</div>}<form action={updatePassword} className="stack-form"><label>New password<input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required /></label><SubmitButton pendingLabel="Updating…">Update password</SubmitButton></form></section>;
}
