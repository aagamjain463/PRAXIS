# Praxis Architecture

## System

Praxis is a single Next.js 16 application deployed on Vercel-compatible infrastructure. React Server Components render data-heavy screens; Server Actions own authenticated mutations; Route Handlers serve AI, extension, export, health, and scheduled reminder endpoints. Supabase provides Postgres, Auth, sessions, and Row Level Security.

## Data model

The primary relationship is:

`source → capture → insight + interpretation → action → occurrence → outcome`

Goals, triggers, tags, collections, reminders, notifications, and AI conversations connect to that spine. Community tables hold explicit public interactions, comments, follows, and reports. Flexible metadata and recurrence use JSONB; ownership, state, visibility, and relationships use typed columns and foreign keys.

The initial migration is `supabase/migrations/202609230001_initial.sql`. It creates extensions, enums, tables, indexes, transactional RPCs, triggers, and RLS policies. Apply migrations with Supabase CLI or the dashboard SQL editor. Never edit a migration already applied in production; add a new timestamped migration.

`supabase/tests/rls.sql` proves that a second user cannot read captures, private insights, or unlisted rows and cannot write actions for another owner. Run it with `supabase test db` against a disposable local Supabase instance.

## Authentication and authorization

Supabase Auth supports email/password, verification, reset, persistent SSR cookies, and optional Google OAuth. `src/proxy.ts` refreshes sessions and protects signed-in routes. Every private table has RLS ownership policies. Server Actions also constrain mutations by authenticated user ID. Service-role access exists only in server-only modules for extension tokens, reminder jobs, and account deletion.

## Search and AI

Insights have a generated Postgres full-text vector and optional pgvector embedding. `search_my_knowledge` returns owned insights with linked action and outcome evidence. `src/lib/ai/provider.ts` targets an OpenAI-compatible API configured by environment variables. Ask Praxis retrieves evidence first, then synthesizes with citation instructions. Without an AI key, the same endpoint returns grounded search results. Private AI access can be disabled per user.

## Extension

`extension/src` is a dependency-free Manifest V3 extension. `npm run extension:build` copies it to `extension/dist`. Users create a random capture token in Settings; only its SHA-256 hash is stored. The extension stores the raw token locally and calls `/api/extension/capture`. Tokens are capture-only, revocable, rate-limited, and never expose Supabase credentials.

## Notifications

Actions can create in-app or email reminders. Vercel Cron calls `/api/jobs/reminders` with `CRON_SECRET`. A Postgres claim function prevents concurrent jobs from sending the same reminder twice. In-app notifications work with Supabase alone; email requires Resend configuration. Timezone and quiet-hour preferences are stored for later scheduler expansion. `vercel.json` uses a Hobby-compatible daily sweep; Pro or an external scheduler can call the same route more frequently.

## Security decisions

- Private visibility is the default and enforced by RLS.
- Public action and outcome text is copied into explicit public-safe insight summary fields.
- Inputs are bounded and validated with Zod plus database constraints.
- Redirects accept only same-origin paths.
- Extension credentials are hashed, revocable, and isolated from sessions.
- AI, extension, and scheduled jobs sanitize errors and avoid logging private content.
- Public interactions and comments require authenticated users; reports support moderation workflows.

## Deployment

Required: public Supabase URL and anon key. Production operations additionally need service-role and cron secrets. AI and email are optional. Configure Supabase Site URL and redirects, apply migrations, set environment variables, then deploy. `/api/health` reports configuration presence without revealing values.

## Entitlements

Profiles carry a constrained `free` or `pro` plan. `src/lib/entitlements.ts` centralizes limits without implementing or simulating billing. Add a verified billing webhook before changing plans automatically.
