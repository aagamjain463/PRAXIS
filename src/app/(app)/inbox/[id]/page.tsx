import Link from "next/link";
import { notFound } from "next/navigation";
import { ProcessForm } from "@/components/process-form";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Process capture" };

export default async function ProcessCapturePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;
  const { supabase, user } = await requireUser();
  const { data: capture } = await supabase.from("captures").select("id,content,quick_note,captured_at,processed_at,source:sources(title,url,source_type,creator)").eq("id", id).eq("user_id", user.id).single();
  if (!capture || capture.processed_at) notFound();
  const source = Array.isArray(capture.source) ? capture.source[0] : capture.source;
  return <main className="page-content process-page"><Link href="/inbox" className="back-link">← Back to Inbox</Link><header className="process-source"><span>{source?.source_type || "captured thought"} · {formatDate(capture.captured_at)}</span><blockquote>{capture.content}</blockquote>{source?.url && <a href={source.url} target="_blank" rel="noopener noreferrer">Open original source ↗</a>}</header>{error && <div className="error-bar">{error}</div>}<ProcessForm capture={capture} /></main>;
}
