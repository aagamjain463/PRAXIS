import Link from "next/link";
import { Lightbulb } from "lucide-react";

export function EmptyState({ title, body, action, href }: { title: string; body: string; action?: string; href?: string }) {
  return <div className="empty-state"><div className="empty-icon"><Lightbulb size={22} /></div><h2>{title}</h2><p>{body}</p>{action && href && <Link className="button button-primary" href={href}>{action}</Link>}</div>;
}
