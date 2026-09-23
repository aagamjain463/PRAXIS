"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Praxis page error", error.digest || "unknown"); }, [error]);
  return <main className="status-page"><span>Something went wrong</span><h1>Praxis couldn’t load this page.</h1><p>Your data was not changed. Try again, or return after checking your connection.</p><button className="button button-primary" onClick={reset}>Try again</button></main>;
}
