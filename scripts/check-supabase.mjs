// Developer-only Supabase connectivity check: `npm run supabase:check`.
//
// Reads `.env.local` (git-ignored; values are never printed) and performs a
// harmless read-only liveness probe against the Supabase Auth health
// endpoint. It creates nothing: no tables, no users, no data, and it never
// needs a service-role key.
//
// Exit codes:
//   0 — configured and the project is reachable
//   1 — configuration problem (missing/invalid values in `.env.local`)
//   2 — configuration looks valid but the project is unreachable

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const URL_VAR = "NEXT_PUBLIC_SUPABASE_URL";
const KEY_VAR = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const envLocalPath = join(projectRoot, ".env.local");

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

function unreachable(message) {
  console.error(`✖ ${message}`);
  process.exit(2);
}

// Minimal KEY=VALUE parser (comments and blank lines ignored, optional
// surrounding quotes stripped) so this script needs no dependencies.
function parseEnvFile(path) {
  const config = {};
  for (const rawLine of readFileSync(path, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const separator = line.indexOf("=");
    if (separator === -1) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^(['"])(.*)\1$/, "$2");
    if (key) {
      config[key] = value;
    }
  }
  return config;
}

function describeKeyFormat(key) {
  if (key.startsWith("sb_publishable_")) {
    return "publishable key (sb_publishable_…)";
  }
  if (/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key)) {
    return "legacy anon JWT";
  }
  return "unrecognized format";
}

if (!existsSync(envLocalPath)) {
  fail(
    "No .env.local found. Copy .env.example to .env.local and fill in your " +
      "project's browser-safe values (see README.md “Supabase local setup”).",
  );
}

const config = parseEnvFile(envLocalPath);
const url = config[URL_VAR];
const publishableKey = config[KEY_VAR];

if (!url || !publishableKey) {
  const missing = [URL_VAR, KEY_VAR].filter((name) => !config[name]);
  fail(`Missing required configuration in .env.local: ${missing.join(", ")}.`);
}

let projectUrl;
try {
  projectUrl = new URL(url);
} catch {
  fail(`${URL_VAR} in .env.local is not a valid URL.`);
}

if (
  projectUrl.protocol !== "https:" &&
  projectUrl.hostname !== "localhost" &&
  projectUrl.hostname !== "127.0.0.1"
) {
  fail(`${URL_VAR} must use https (non-localhost URL detected).`);
}

const keyFormat = describeKeyFormat(publishableKey);
if (keyFormat === "unrecognized format") {
  console.warn(
    `⚠ ${KEY_VAR} has an unrecognized format; continuing with the live probe.`,
  );
}

console.log("Supabase connectivity check");
console.log(`  Project URL: ${projectUrl.origin} (public value, safe to show)`);
console.log(`  Key: set (${publishableKey.length} chars, ${keyFormat})`);

let response;
try {
  response = await fetch(`${projectUrl.origin}/auth/v1/health`, {
    signal: AbortSignal.timeout(10000),
  });
} catch (error) {
  unreachable(
    `Could not reach ${projectUrl.origin}/auth/v1/health (${error.cause?.message ?? error.message}). ` +
      "Check the URL and your network connection.",
  );
}

if (!response.ok) {
  unreachable(
    `Health endpoint returned HTTP ${response.status}; expected 200. ` +
      "Check that the project URL is correct and the project is running.",
  );
}

console.log(`✔ Project reachable (Auth health: HTTP ${response.status}).`);
