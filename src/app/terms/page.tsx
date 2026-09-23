import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return <LegalPage title="Praxis Terms" updated="23 September 2026"><h2>Using Praxis</h2><p>Use Praxis lawfully and only for content you may store and share. Keep account and extension credentials secure. Do not use public features for abuse, spam, harassment, or unauthorized copying.</p><h2>Your content</h2><p>You retain ownership of your original content. Publishing grants Praxis the limited permission required to display and distribute that public insight until you make it private or delete it.</p><h2>Community evidence</h2><p>Community signals and outcomes are user reports, not guaranteed facts or professional advice. Evaluate any insight in your own context.</p><h2>Availability</h2><p>Praxis may change while it develops. We work to preserve your data and disclose material limitations, but the service is provided without guarantees beyond applicable law.</p><h2>Account termination</h2><p>You may delete your account from Settings. Praxis may restrict accounts used for abuse or security threats.</p></LegalPage>;
}
