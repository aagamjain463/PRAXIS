# Praxis

Praxis is a **Knowledge-to-Action platform**. Its mission:

> **Turn what you learn into what you do.**

See [`PRODUCT.md`](./PRODUCT.md) for the long-term product direction and
[`AGENTS.md`](./AGENTS.md) for the rules all AI coding agents must follow.

## Current milestone

**Milestone 3 — Supabase Foundation.** The repository now contains the secure
Supabase connection infrastructure in addition to the earlier milestones:

- Next.js (App Router) + React + TypeScript + Tailwind CSS + ESLint
- Shared application shell: persistent desktop sidebar, mobile header plus
  bottom navigation, and a consistent content area
- Routes: `/` (Home), `/insights`, `/actions`, `/review` — honest empty
  states only, no product functionality yet
- Supabase client infrastructure (`@supabase/supabase-js` + `@supabase/ssr`):
  browser client factory (`lib/supabase/client.ts`) and cookie-aware server
  client factory (`lib/supabase/server.ts`), ready for future authentication
- Clear missing-configuration errors; no service-role key anywhere
- Developer connectivity check via `npm run supabase:check`
- A lightweight test setup (Vitest + Testing Library) covering pages,
  navigation links, active state, shell semantics, and Supabase configuration
- `PRODUCT.md`, `AGENTS.md`, `.env.example`, and this README

No authentication, database tables, Insights, Actions, AI, reminders, or
browser extension functionality exists yet — that is intentional.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [ESLint](https://eslint.org/) (`eslint-config-next`)
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)
- [Supabase](https://supabase.com/) (`@supabase/supabase-js` + `@supabase/ssr`)
  — connection infrastructure only; no tables or auth yet

## Prerequisites

- Node.js 20+ (check with `node --version`)
- npm (ships with Node.js)

## Installation

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Then open the URL printed by the dev server (usually
[http://localhost:3000](http://localhost:3000)).

## Lint

```bash
npm run lint
```

## Typecheck

```bash
npm run typecheck
```

Runs `tsc --noEmit` (type checking without emitting build artifacts).

## Tests

```bash
npm test
```

Runs the Vitest suite once (`vitest run`).

## Production build

```bash
npm run build
npm run start
```

## Repository structure

```text
Praxis/
├── app/
│   ├── actions/page.tsx    # Actions empty state
│   ├── insights/page.tsx   # Insights empty state
│   ├── review/page.tsx     # Review empty state
│   ├── layout.tsx          # Root layout + metadata + AppShell
│   ├── page.tsx            # Home empty state
│   ├── globals.css         # Tailwind + theme tokens
│   └── favicon.ico
├── components/
│   ├── app-shell.tsx       # Shared shell: sidebar, mobile header/nav, main
│   ├── nav-links.tsx       # Client nav links with active state (sidebar/bottom)
│   └── page-header.tsx     # Consistent page heading rhythm
├── lib/
│   └── supabase/
│       ├── client.ts       # Browser Supabase client factory
│       ├── server.ts       # Cookie-aware server Supabase client factory
│       └── env.ts          # Public config validation (names vars, never values)
├── scripts/
│   └── check-supabase.mjs  # Harmless connectivity check (npm run supabase:check)
├── tests/
│   ├── setup.ts            # jest-dom matchers for Vitest
│   ├── navigation-state.ts # Mutable pathname for router mocks
│   ├── home.test.tsx       # Home page content
│   ├── pages.test.tsx      # Insights/Actions/Review content
│   ├── navigation.test.tsx # Links, active state, landmarks
│   ├── app-shell.test.tsx  # Shared shell semantics
│   ├── supabase-env.test.ts    # Config validation + browser client wiring
│   └── supabase-server.test.ts # Server client wiring (mocked cookies)
├── public/             # Static assets (currently empty)
├── PRODUCT.md          # Long-term product source of truth
├── AGENTS.md           # Rules for AI coding agents
├── .env.example        # Placeholder env vars (no secrets)
├── vitest.config.ts
├── package.json
└── tsconfig.json
```

## Environment variables

Supabase connection settings live in a git-ignored `.env.local` file.
The existing pages build and render without these variables; they are only
required when code actually creates a Supabase client.

```bash
cp .env.example .env.local
```

Never commit real secrets.

## Supabase local setup

1. Create (or select) a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open the project, go to **Project Settings → API** (or the project's
   **Connect** dialog) and copy the two browser-safe values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Publishable key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Create `.env.local` from the example and fill in those two values:

   ```bash
   cp .env.example .env.local
   ```

   ```text
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

   (Placeholders shown — use your project's real values.)
4. Never commit `.env.local` (it is git-ignored; verify with
   `git check-ignore .env.local`).
5. Never put a service-role key, secret key, or database password in a
   `NEXT_PUBLIC_*` variable — or anywhere in this milestone. No privileged
   key is required.
6. Start Praxis normally (`npm run dev`) and verify the check below.

### Verify Supabase connectivity

```bash
npm run supabase:check
```

This performs a harmless read-only probe (Auth health endpoint — no tables,
no users, no data, no service-role key) and never prints secret values.

- Success looks like: `✔ Project reachable (Auth health: HTTP 200).`
- Without `.env.local` it exits with a clear message telling you which
  configuration is missing.

Unit tests and the production build do not need live credentials.

### Deferred to the authentication milestone

The session-refresh proxy (`proxy.ts`) and any signup/login/logout UI are
intentionally not part of this milestone. They will be added when
authentication is implemented.

## What is intentionally NOT implemented

Authentication, database tables, Insights, Remember/Apply/Explore,
Actions, deadlines, reminders, outcomes, reflections, search, embeddings, AI
providers, social features, payments, analytics, and the Chrome extension all
belong to later milestones. Only the Supabase connection infrastructure
exists — no product tables, no auth flows, no product functionality.
The `/insights`, `/actions`, and `/review` routes
exist as empty states only — no product functionality lives behind them yet.
See `PRODUCT.md` — it describes direction only
and does not authorize building those features early.
