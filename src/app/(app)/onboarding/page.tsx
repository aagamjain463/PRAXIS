import { SubmitButton } from "@/components/submit-button";
import { TimezoneInput } from "@/components/timezone-input";
import { completeOnboarding } from "../actions";

const improvements = ["Career", "Startups", "Studies", "Productivity", "Health", "Relationships", "Finance", "Leadership", "Creativity"];
const content = ["YouTube", "Books", "Podcasts", "X", "Instagram", "Newsletters", "Articles", "Courses"];
const friction = ["I forget useful ideas", "I save but never revisit", "I understand but don’t act", "My notes are scattered", "I can’t find them when needed"];

export const metadata = { title: "Personalize Praxis" };

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <div className="onboarding page-content"><header><span className="eyebrow">Make Praxis useful immediately</span><h1>What should your knowledge help you change?</h1><p>Three quick prompts. You can change everything later.</p></header>{error && <div className="error-bar">{error}</div>}<form action={completeOnboarding}><fieldset><legend>What are you trying to improve?</legend><div className="choice-grid">{improvements.map(item => <label key={item}><input type="checkbox" name="improvements" value={item.toLowerCase()} /><span>{item}</span></label>)}</div></fieldset><fieldset><legend>What content do you consume?</legend><div className="choice-grid compact">{content.map(item => <label key={item}><input type="checkbox" name="contentTypes" value={item.toLowerCase()} /><span>{item}</span></label>)}</div></fieldset><fieldset><legend>What usually happens to useful ideas?</legend><div className="choice-list">{friction.map(item => <label key={item}><input type="checkbox" name="friction" value={item} /><span>{item}</span></label>)}</div></fieldset><fieldset><legend>What goals matter most right now?</legend><p>One per line. Two or three is plenty.</p><textarea name="goals" rows={4} placeholder={'Launch my startup\nGet better at customer research'} /></fieldset><TimezoneInput /><div className="onboarding-submit"><p>Next: capture your first useful idea.</p><SubmitButton pendingLabel="Saving…">Finish and capture an idea</SubmitButton></div></form></div>;
}
