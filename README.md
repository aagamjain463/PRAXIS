# Praxis

Praxis is a **Knowledge-to-Action platform**. Its mission:

> **Turn what you learn into what you do.**

See [`PRODUCT.md`](./PRODUCT.md) for the long-term product direction and
[`AGENTS.md`](./AGENTS.md) for the rules all AI coding agents must follow.

## Current milestone

**Milestone 2 — Application Shell & Navigation.** The repository now contains
the shared Praxis application shell in addition to the Milestone 1 foundation:

- Next.js (App Router) + React + TypeScript + Tailwind CSS + ESLint
- Shared application shell: persistent desktop sidebar, mobile header plus
  bottom navigation, and a consistent content area
- Routes: `/` (Home), `/insights`, `/actions`, `/review` — honest empty
  states only, no product functionality yet
- Accessible active navigation state (`aria-current="page"`, not color alone)
- A lightweight test setup (Vitest + Testing Library) covering pages,
  navigation links, active state, and shell semantics
- `PRODUCT.md`, `AGENTS.md`, `.env.example`, and this README

No backend, database, auth, Insights, Actions, AI, reminders, or browser
extension functionality exists yet — that is intentional.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [ESLint](https://eslint.org/) (`eslint-config-next`)
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)

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
├── tests/
│   ├── setup.ts            # jest-dom matchers for Vitest
│   ├── navigation-state.ts # Mutable pathname for router mocks
│   ├── home.test.tsx       # Home page content
│   ├── pages.test.tsx      # Insights/Actions/Review content
│   ├── navigation.test.tsx # Links, active state, landmarks
│   └── app-shell.test.tsx  # Shared shell semantics
├── public/             # Static assets (currently empty)
├── PRODUCT.md          # Long-term product source of truth
├── AGENTS.md           # Rules for AI coding agents
├── .env.example        # Placeholder env vars (no secrets)
├── vitest.config.ts
├── package.json
└── tsconfig.json
```

## Environment variables

No backend exists yet, so no environment variables are required.
`.env.example` is a placeholder documenting that future variables will be
added as needed. Never commit real secrets — copy to `.env.local` when the
time comes:

```bash
cp .env.example .env.local
```

## What is intentionally NOT implemented

Supabase, database, authentication, Insights, Remember/Apply/Explore,
Actions, deadlines, reminders, outcomes, reflections, search, embeddings, AI
providers, social features, payments, analytics, and the Chrome extension all
belong to later milestones. The `/insights`, `/actions`, and `/review` routes
exist as empty states only — no product functionality lives behind them yet.
See `PRODUCT.md` — it describes direction only
and does not authorize building those features early.
