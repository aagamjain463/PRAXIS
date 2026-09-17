// Safe redirect targets for auth flows (open-redirect protection).
//
// Only same-origin absolute paths are honored: anything else — external
// URLs, protocol-relative URLs, backslash tricks, control characters —
// falls back to the default. Login/signup always land on `/`; this helper
// exists for flows where the target can arrive via URL (email confirmation).

export function resolveSafeNext(
  value: string | null,
  fallback = "/",
): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  if (value.includes("\\") || /[\r\n\t]/.test(value)) {
    return fallback;
  }
  try {
    const parsed = new URL(value, "https://praxis.local");
    if (parsed.origin !== "https://praxis.local") {
      return fallback;
    }
  } catch {
    return fallback;
  }
  return value;
}
