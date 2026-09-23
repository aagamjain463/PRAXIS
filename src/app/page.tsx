import Link from "next/link";
import { ArrowRight, BookOpen, Brain, Check, Compass, LockKeyhole, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";

const sourceTypes = ["YouTube", "Books", "Podcasts", "Articles", "Newsletters", "Conversations", "Courses", "PDFs"];

export default function LandingPage() {
  return (
    <main className="marketing">
      <header className="marketing-nav page-width">
        <Logo />
        <nav aria-label="Marketing navigation">
          <a href="#how">How it works</a>
          <a href="#privacy">Privacy</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="nav-actions">
          <Link href="/login" className="text-link">Sign in</Link>
          <Link href="/signup" className="button button-dark">Start free</Link>
        </div>
      </header>

      <section className="hero page-width">
        <div className="eyebrow"><Sparkles size={14} /> Knowledge, put into practice</div>
        <h1>Turn what you learn<br />into what you <em>do.</em></h1>
        <p className="hero-copy">Capture useful ideas from anywhere. Turn them into action. Let Praxis bring them back when they matter—and learn what actually helped.</p>
        <div className="hero-actions">
          <Link href="/signup" className="button button-primary">Start free <ArrowRight size={17} /></Link>
          <a href="#how" className="button button-ghost">See how it works</a>
        </div>
        <p className="fine-print">Private by default · No credit card required</p>

        <div className="hero-product" aria-label="Example Praxis workflow">
          <div className="product-sidebar">
            <Logo compact />
            {['Today', 'Inbox', 'Library', 'Actions', 'Ask Praxis'].map((item, index) => (
              <span className={index === 0 ? 'active' : ''} key={item}>{item}</span>
            ))}
          </div>
          <div className="product-canvas">
            <div className="canvas-heading"><span>Good morning, Maya.</span><small>Tuesday, 23 September</small></div>
            <div className="focus-card">
              <div><small>INSIGHT FOR RIGHT NOW</small><h3>Talk to users before building features.</h3><p>You tend to start implementing before verifying the problem matters.</p></div>
              <div className="action-preview"><span>Today</span><strong>Interview 5 prospective users</strong><small>Linked to: Validate onboarding problem</small><div className="demo-control">Mark complete</div></div>
            </div>
            <div className="mini-grid">
              <div><span>2</span><small>Actions due</small></div>
              <div><span>1</span><small>Insight resurfaced</small></div>
              <div><span>3</span><small>Waiting in Inbox</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className="problem-section page-width">
        <p className="section-kicker">The gap is not information.</p>
        <h2>You save more than ever.<br /><em>Use almost none of it.</em></h2>
        <p>Bookmarks pile up. Notes disappear. Great advice arrives at the wrong moment. Praxis closes the loop between knowing and doing.</p>
      </section>

      <section id="how" className="how-section page-width">
        <div className="section-heading"><span>01 — THE LOOP</span><h2>From useful idea<br />to lived experience.</h2></div>
        <div className="steps">
          {[
            ["Capture", "Save a line, link, thought, or source in seconds. Reflection can wait."],
            ["Understand", "Distill the real insight and write what it means in your context."],
            ["Apply", "Turn it into a task, habit, experiment, decision rule, or reminder."],
            ["Remember", "Resurface knowledge when your goals, actions, and context make it useful."],
            ["Measure", "Record what happened. Keep the advice that survives contact with reality."]
          ].map(([title, copy], index) => (
            <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
      </section>

      <section className="capture-section">
        <div className="page-width split-section">
          <div><span className="section-label">CAPTURE WITHOUT FRICTION</span><h2>Keep the idea.<br />Not the clutter.</h2><p>Send useful fragments to one quiet Inbox. Process them when you have attention—not while you are reading, listening, or thinking.</p><div className="source-pills">{sourceTypes.map(type => <span key={type}>{type}</span>)}</div></div>
          <div className="capture-demo"><div className="browser-bar"><i /><i /><i /><span>youtube.com/watch</span></div><blockquote>“Before writing code, verify this is one of your customer’s top three problems.”</blockquote><div className="capture-popover"><strong>Save to Praxis</strong><div className="demo-field">Selected text<div className="demo-input demo-textarea">Before writing code, verify this is one of your customer’s top three problems.</div></div><div className="demo-field">Quick note<div className="demo-input">This changes our onboarding plan.</div></div><div className="demo-control">Save to Inbox</div></div></div>
        </div>
      </section>

      <section className="features page-width">
        <div className="feature-card feature-large"><div className="icon-box"><Brain /></div><span>ASK PRAXIS</span><h3>Your knowledge, ready to answer.</h3><p>Ask what you have learned about pricing, customer research, or focus. Every answer links back to your actual insights and outcomes.</p><div className="answer-demo"><p>What should I remember before tomorrow’s sales calls?</p><div><strong>Lead with the problem language customers used.</strong><small>Based on 3 of your insights · 2 positive outcomes</small></div></div></div>
        <div className="feature-card"><div className="icon-box"><Compass /></div><span>COLLECTIVE INTELLIGENCE</span><h3>Find advice people actually applied.</h3><p>Explore public insights ranked by application and outcomes—not empty popularity.</p></div>
        <div id="privacy" className="feature-card dark-card"><div className="icon-box"><LockKeyhole /></div><span>PRIVATE BY DEFAULT</span><h3>Your thoughts are yours.</h3><p>Captures, interpretations, actions, and outcomes stay private until you explicitly publish an insight.</p></div>
      </section>

      <section id="pricing" className="pricing page-width">
        <div><span className="section-label">SIMPLE PRICING</span><h2>Start closing the gap.</h2><p>Core knowledge-to-action tools stay free. Upgrade when Praxis becomes part of how you work.</p></div>
        <article><span>FREE</span><h3>$0 <small>forever</small></h3>{["Unlimited captures and insights", "Actions and outcomes", "Core search", "Public participation"].map(x => <p key={x}><Check size={16} /> {x}</p>)}<Link href="/signup" className="button button-ghost">Start free</Link></article>
        <article className="pro-plan"><span>PRO · COMING SOON</span><h3>$12 <small>/ month</small></h3>{["Expanded grounded AI", "Advanced retrieval", "Contextual resurfacing", "Advanced analytics"].map(x => <p key={x}><Check size={16} /> {x}</p>)}<button className="button button-dark" disabled>Join waitlist soon</button></article>
      </section>

      <section className="final-cta"><BookOpen size={30} /><h2>Learning only matters<br />when it changes something.</h2><p>Capture what matters. Put it into practice.</p><Link href="/signup" className="button button-light">Start using Praxis <ArrowRight size={17} /></Link></section>
      <footer className="page-width"><Logo /><p>© {new Date().getFullYear()} Praxis. Knowledge, put into practice.</p><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></footer>
    </main>
  );
}
