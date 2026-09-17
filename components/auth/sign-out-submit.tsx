"use client";

import { useFormStatus } from "react-dom";

export function SignOutSubmit({ className }: { className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}
