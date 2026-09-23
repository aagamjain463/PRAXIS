import { AskPraxis } from "@/components/ask-praxis";

export const metadata = { title: "Ask Praxis" };

export default function AskPage() {
  return <main className="page-content ask-page"><header className="page-header"><div><h1>Ask Praxis</h1><p>Grounded answers from knowledge you saved—or evidence people publicly applied.</p></div></header><AskPraxis /></main>;
}
