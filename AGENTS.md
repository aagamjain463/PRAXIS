# Praxis Agent Context

Praxis turns useful knowledge into actions and measured outcomes. The primary data spine is source → capture → insight/interpretation → action → outcome. Preserve that loop before adding breadth.

## Stack and commands

- Next.js 16, React 19, TypeScript, Supabase/Postgres/Auth/RLS.
- `npm run dev`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`, `npm run extension:build`.
- One initial migration lives in `supabase/migrations`. Add new timestamped migrations; never rewrite an applied production migration.

## Critical rules

- Private by default. Never bypass RLS or expose service-role credentials client-side.
- AI answers must retrieve evidence first and cite stored insights. Never invent user knowledge or outcomes.
- Publication, commitments, deadlines, and deletion require explicit user action.
- Keep source excerpts conservative and preserve attribution links.
- Every visible control works or clearly states its unavailable state.
- Production dashboards show only stored user data.
- Validate trust-boundary input in server code and database constraints.

## Design

Calm, editorial, focused, accessible, responsive. Prefer strong typography and quiet surfaces over gradients, giant cards, and animation. Optimize capture speed and thoughtful processing.

## Testing

Run focused tests while editing, then the full `npm run check`. Browser-test desktop and mobile. Supabase-backed golden-path and RLS tests require a configured test project; never point destructive tests at production.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
