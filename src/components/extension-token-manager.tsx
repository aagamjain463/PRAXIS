"use client";

import { useState, useTransition } from "react";
import { Check, Copy, KeyRound } from "lucide-react";
import { createExtensionToken } from "@/app/(app)/actions";

export function ExtensionTokenManager() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  function create() { startTransition(async () => { const result = await createExtensionToken(); if (result?.token) setToken(result.token); else setError(result?.error || "Token could not be created."); }); }
  async function copy() { await navigator.clipboard.writeText(token); setCopied(true); }
  return <div className="token-manager"><button type="button" className="button button-ghost" onClick={create} disabled={pending}><KeyRound size={15} /> {pending ? "Creating…" : "Create capture token"}</button>{error && <div className="form-error">{error}</div>}{token && <div className="token-reveal"><strong>Copy this token now. It will not be shown again.</strong><code>{token}</code><button onClick={copy} type="button">{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied" : "Copy"}</button></div>}</div>;
}
