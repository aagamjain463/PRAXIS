import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Eye, Lock, Target, Trash2, Zap } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import {
  addContextTrigger,
  createAction,
  deleteInsight,
  publishInsight,
} from "../../actions";
import { requireUser } from "@/lib/auth";
import { formatDate, relativeDue } from "@/lib/format";
import { searchTerms } from "@/lib/search";

export const dynamic = "force-dynamic";

export default async function InsightPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ processed?: string; saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const notices = await searchParams;
  const { supabase, user } = await requireUser();
  const { data: insight } = await supabase
    .from("insights")
    .select(
      "*,source_links:insight_sources(excerpt,source:sources(*)),actions:actions!actions_insight_id_fkey(*,outcomes(*)),triggers:context_triggers(*)",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();
  if (!insight) notFound();
  const actions = insight.actions || [];
  const sources = insight.source_links || [];
  const { data: relatedData } = await supabase.rpc("search_my_knowledge", {
    query_text: searchTerms(insight.title),
    query_embedding: insight.embedding,
    match_count: 5,
  });
  const related = (relatedData || [])
    .filter((item: { id: string }) => item.id !== insight.id)
    .slice(0, 4);
  return (
    <main className="page-content insight-page">
      <Link href="/library" className="back-link">
        ← Back to Library
      </Link>
      {notices.processed && (
        <div className="notice-bar">
          Insight processed. It is private unless you publish it.
        </div>
      )}
      {notices.saved && (
        <div className="notice-bar">
          Saved to your private library. Add your interpretation before applying
          it.
        </div>
      )}
      {notices.error && <div className="error-bar">{notices.error}</div>}
      <article className="insight-document">
        <header>
          <div>
            <span className={`visibility ${insight.visibility}`}>
              {insight.visibility === "private" ? (
                <Lock size={12} />
              ) : (
                <Eye size={12} />
              )}{" "}
              {insight.visibility}
            </span>
            <time>Processed {formatDate(insight.created_at)}</time>
          </div>
          <h1>{insight.title}</h1>
        </header>
        <section>
          <span className="document-label">THE INSIGHT</span>
          <p className="insight-body">{insight.body}</p>
        </section>
        <section className="interpretation-block">
          <span className="document-label">WHAT THIS MEANS TO ME</span>
          <p>{insight.interpretation || "No personal interpretation yet."}</p>
        </section>
        {sources.map(
          (link: {
            source:
              | {
                  id: string;
                  title: string;
                  creator: string;
                  url: string | null;
                  source_type: string;
                }
              | {
                  id: string;
                  title: string;
                  creator: string;
                  url: string | null;
                  source_type: string;
                }[];
          }) => {
            const source = Array.isArray(link.source)
              ? link.source[0]
              : link.source;
            return (
              source && (
                <section key={source.id} className="source-block">
                  <span className="document-label">
                    SOURCE · {source.source_type}
                  </span>
                  <strong>{source.title || "Untitled source"}</strong>
                  {source.creator && <small>{source.creator}</small>}
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open original <ArrowUpRight size={14} />
                    </a>
                  )}
                </section>
              )
            );
          },
        )}
      </article>
      {related.length > 0 && (
        <section className="related-strip">
          <div className="section-title">
            <h2>Related insights</h2>
            <span>From your library</span>
          </div>
          <div>
            {related.map(
              (item: { id: string; title: string; interpretation: string }) => (
                <Link href={`/library/${item.id}`} key={item.id}>
                  <strong>{item.title}</strong>
                  <small>{item.interpretation}</small>
                </Link>
              ),
            )}
          </div>
        </section>
      )}
      <div className="insight-columns">
        <section>
          <div className="section-title">
            <h2>Application</h2>
            <span>{actions.length} linked</span>
          </div>
          {actions.length ? (
            <div className="linked-actions">
              {actions.map(
                (action: {
                  id: string;
                  title: string;
                  status: string;
                  action_type: string;
                  due_at: string | null;
                  outcomes: {
                    description: string;
                    insight_helpfulness: string;
                  }[];
                }) => (
                  <Link href={`/actions/${action.id}`} key={action.id}>
                    <div>
                      <span>{action.action_type.replaceAll("_", " ")}</span>
                      <strong>{action.title}</strong>
                      <small>
                        {action.status === "completed"
                          ? "Completed"
                          : relativeDue(action.due_at)}
                      </small>
                    </div>
                    {action.outcomes?.[0] && (
                      <blockquote>{action.outcomes[0].description}</blockquote>
                    )}
                  </Link>
                ),
              )}
            </div>
          ) : (
            <div className="small-empty">No action linked yet.</div>
          )}
          <details className="form-drawer">
            <summary>
              <Zap size={15} /> Turn this into action
            </summary>
            <form action={createAction} className="stack-form">
              <input type="hidden" name="insightId" value={insight.id} />
              <label>
                What will you do?
                <input name="title" required maxLength={240} />
              </label>
              <label>
                Details
                <textarea name="description" maxLength={2000} />
              </label>
              <div className="form-columns">
                <label>
                  Type
                  <select name="actionType">
                    <option value="task">One-time task</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="habit">Habit</option>
                    <option value="experiment">Experiment</option>
                    <option value="decision_rule">Decision rule</option>
                    <option value="contextual">Contextual</option>
                  </select>
                </label>
                <label>
                  Priority
                  <select name="priority">
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                  </select>
                </label>
              </div>
              <label>
                Deadline
                <input type="datetime-local" name="dueAt" />
              </label>
              <SubmitButton>Create action</SubmitButton>
            </form>
          </details>
          <details className="form-drawer">
            <summary>
              <Target size={15} /> Add a context trigger
            </summary>
            <form action={addContextTrigger} className="stack-form">
              <input type="hidden" name="insightId" value={insight.id} />
              <label>
                Bring this back when…
                <input
                  name="label"
                  placeholder="I am preparing a customer interview"
                  required
                  maxLength={240}
                />
              </label>
              <SubmitButton>Add trigger</SubmitButton>
            </form>
          </details>
          {insight.triggers?.length > 0 && (
            <div className="trigger-list">
              {insight.triggers.map(
                (trigger: { id: string; label: string }) => (
                  <span key={trigger.id}>When {trigger.label}</span>
                ),
              )}
            </div>
          )}
        </section>
        <aside>
          <div className="section-title">
            <h2>Share</h2>
          </div>
          <div className="share-panel panel">
            <p>
              Private by default. Publishing exposes this insight and only the
              public-safe application and outcome summaries below.
            </p>
            <form action={publishInsight} className="stack-form">
              <input type="hidden" name="insightId" value={insight.id} />
              <label>
                Visibility
                <select name="selectedVisibility" defaultValue={insight.visibility}>
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted link</option>
                  <option value="public">Public</option>
                </select>
              </label>
              <label>
                Application summary
                <textarea
                  name="publicApplication"
                  defaultValue={insight.public_application}
                  maxLength={4000}
                  placeholder="What did you do?"
                />
              </label>
              <label>
                Outcome summary
                <textarea
                  name="publicOutcome"
                  defaultValue={insight.public_outcome}
                  maxLength={4000}
                  placeholder="What happened?"
                />
              </label>
              <SubmitButton className="button button-ghost">
                Save visibility
              </SubmitButton>
            </form>
            {insight.slug && insight.visibility !== "private" && (
              <Link className="public-link" href={`/i/${insight.slug}`}>
                View public page <ArrowUpRight size={14} />
              </Link>
            )}
          </div>
          <details className="danger-zone">
            <summary>Delete insight</summary>
            <p>This hides it immediately. Linked private actions remain.</p>
            <form action={deleteInsight}>
              <input type="hidden" name="insightId" value={insight.id} />
              <button className="danger-button" type="submit">
                <Trash2 size={14} /> Delete insight
              </button>
            </form>
          </details>
        </aside>
      </div>
    </main>
  );
}
