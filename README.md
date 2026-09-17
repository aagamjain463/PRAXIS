# Praxis

Praxis is a **Knowledge-to-Action platform**. Its mission:

> **Turn what you learn into what you do.**

See [`PRODUCT.md`](./PRODUCT.md) for the long-term product direction and
[`AGENTS.md`](./AGENTS.md) for the rules all AI coding agents must follow.

## Current milestone

**Milestone 4 — Authentication & User Foundation.** The repository now has
real email/password authentication on top of the earlier milestones:

- Next.js (App Router) + React + TypeScript + Tailwind CSS + ESLint
- Email/password signup, login, and logout via real Supabase Auth
  (no OAuth yet)
- Routes: `/login`, `/signup`, `/auth/confirm` (email-confirmation
  callback), plus the authenticated product space `/` (Home), `/insights`,
  `/actions`, `/review` — still honest empty states, no product
  functionality yet
- Server-enforced route protection: logged-out visitors are redirected to
  `/login` during server rendering; logged-in visitors are redirected away
  from `/login` and `/signup`
- Cookie-based SSR sessions with proxy session refresh, so logins survive
  browser refreshes
- Minimal signed-in identity (email) plus logout in the sidebar and mobile
  header; no profiles table, no profile system
- Shared application shell: persistent desktop sidebar, mobile header plus
  bottom navigation, and a consistent content area
- Supabase client infrastructure (`@supabase/supabase-js` + `@supabase/ssr`):
  browser client factory (`lib/supabase/client.ts`), cookie-aware server
  client factory (`lib/supabase/server.ts`), and session-refresh proxy
  (`proxy.ts` + `lib/supabase/middleware.ts`)
- Clear missing-configuration errors; no service-role key anywhere
- Developer connectivity check via `npm run supabase:check`
- A lightweight test setup (Vitest + Testing Library) covering pages,
  navigation, shell semantics, Supabase configuration, and auth behavior
  (validation, error mapping, redirect safety, actions, route protection)
- `PRODUCT.md`, `AGENTS.md`, `.env.example`, and this README

No database tables, Insights, Actions, AI, reminders, or browser extension
functionality exists yet — that is intentional.

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
│   ├── (app)/              # Authenticated product space (server-protected)
│   │   ├── layout.tsx      # requireUser + AppShell with identity/logout
│   │   ├── page.tsx        # Home empty state
│   │   ├── actions/page.tsx
│   │   ├── insights/page.tsx
│   │   └── review/page.tsx
│   ├── (auth)/             # Logged-out auth screens (no app shell)
│   │   ├── layout.tsx      # Redirects signed-in users into the app
│   │   ├── login/page.tsx  # Login screen (supports ?error=/notice codes)
│   │   └── signup/page.tsx # Signup screen + confirmation state
│   ├── auth/confirm/route.ts # Email-confirmation callback (verifyOtp)
│   ├── layout.tsx          # Root layout + metadata + fonts
│   ├── globals.css         # Tailwind + theme tokens
│   └── favicon.ico
├── components/
│   ├── app-shell.tsx       # Shared shell: sidebar, mobile header/nav, main
│   ├── nav-links.tsx       # Client nav links with active state (sidebar/bottom)
│   ├── page-header.tsx     # Consistent page heading rhythm
│   └── auth/
│       ├── auth-card.tsx       # Shared auth branding + card layout
│       ├── auth-field.tsx      # Labeled input + field error wiring
│       ├── login-form.tsx      # Login form (useActionState, pending state)
│       ├── signup-form.tsx     # Signup form + check-email state
│       ├── sign-out-button.tsx # Server-rendered logout form
│       └── sign-out-submit.tsx # Logout pending label (client island)
├── lib/
│   ├── auth/
│   │   ├── actions.ts      # login/signup/logout Server Actions
│   │   ├── user.ts         # getCurrentUser (authoritative) + requireUser
│   │   ├── validation.ts   # Shared email/password rules (client + server)
│   │   ├── errors.ts       # Supabase errors → safe user-facing copy
│   │   └── redirect.ts     # Same-origin redirect sanitizer
│   └── supabase/
│       ├── client.ts       # Browser Supabase client factory
│       ├── server.ts       # Cookie-aware server Supabase client factory
│       ├── middleware.ts   # Session-refresh (used by proxy.ts)
│       └── env.ts          # Public config validation (names vars, never values)
├── proxy.ts                # Next.js 16 session-refresh entry point
├── scripts/
│   └── check-supabase.mjs  # Harmless connectivity check (npm run supabase:check)
├── tests/
│   ├── setup.ts            # jest-dom matchers for Vitest
│   ├── navigation-state.ts # Mutable pathname for router mocks
│   ├── home.test.tsx       # Home page content
│   ├── pages.test.tsx      # Insights/Actions/Review content
│   ├── navigation.test.tsx # Links, active state, landmarks
│   ├── app-shell.test.tsx  # Shared shell semantics + identity/logout
│   ├── supabase-env.test.ts    # Config validation + browser client wiring
│   ├── supabase-server.test.ts # Server client wiring (mocked cookies)
│   ├── auth-validation.test.ts # Email/password/confirm rules
│   ├── auth-errors.test.ts     # Safe error mapping
│   ├── auth-redirect.test.ts   # Open-redirect sanitizer
│   ├── auth-forms.test.tsx     # Form rendering, validation, error/confirm states
│   ├── auth-actions.test.ts    # Login/signup/logout action behavior (mocked)
│   ├── auth-user.test.ts       # getCurrentUser/requireUser behavior (mocked)
│   ├── auth-layout.test.tsx    # Auth-group redirect behavior (mocked)
│   └── auth-confirm.test.ts    # Confirm-route verify/fallback/redirects (mocked)
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

### Supabase dashboard settings for auth

In the Supabase dashboard for this project, verify:

1. **Authentication → URL Configuration → Site URL** is the app origin
   (e.g. `http://localhost:3000` for local development). Confirmation links
   are built from this when no explicit redirect is passed.
2. **Additional Redirect URLs** includes the same origin (e.g.
   `http://localhost:3000/**`), so `/auth/confirm` callbacks are accepted.
3. **Authentication → Sign In / Sign Up → Confirm email**: leave this ON
   (the default). Praxis handles both outcomes — immediate session or
   emailed confirmation link — so no change is needed either way. Do not
   disable security features just to simplify testing.
4. No service-role key is needed anywhere in Praxis. Never add one to
   `.env.local` or the dashboard's exposed configuration.

## What is intentionally NOT implemented

Database tables, Insights, Remember/Apply/Explore,
Actions, deadlines, reminders, outcomes, reflections, search, embeddings, AI
providers, social features, payments, analytics, and the Chrome extension all
belong to later milestones. Only real email/password authentication and the
Supabase connection infrastructure exist — no product tables, no OAuth, no
product functionality.
The `/insights`, `/actions`, and `/review` routes
exist as empty states only — no product functionality lives behind them yet.
See `PRODUCT.md` — it describes direction only
and does not authorize building those features early.
