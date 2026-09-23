import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return <LegalPage title="Privacy at Praxis" updated="23 September 2026"><h2>Private by default</h2><p>Your captures, interpretations, actions, outcomes, goals, AI conversations, and preferences are private unless you explicitly publish an insight or profile. Database Row Level Security enforces ownership independently of the interface.</p><h2>How data is used</h2><p>Praxis stores information needed to provide capture, retrieval, reminders, outcomes, and community features. We do not sell personal data. Public insight pages contain only content you chose to publish.</p><h2>AI processing</h2><p>If AI is enabled, Praxis sends the minimum retrieved fragments needed to answer your question to the configured AI provider. You can disable AI or private-knowledge AI in Settings. Generated synthesis is labeled and linked to stored evidence.</p><h2>Sources and copyright</h2><p>Praxis stores source metadata, links, short excerpts, and your own interpretation. Do not upload or publish complete third-party works without permission.</p><h2>Your controls</h2><p>You can export your data, revoke extension tokens, change publication settings, and permanently delete your account from Settings.</p></LegalPage>;
}
