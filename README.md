# Praxis

Turn what you learn into what you do.

Praxis captures useful ideas, helps you interpret them, turns them into concrete actions, resurfaces them at the right time, and records whether they helped.

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Configure a Supabase project and apply `supabase/migrations/202609230001_initial.sql` before using authenticated features. See [ARCHITECTURE.md](ARCHITECTURE.md) for the system design and [PRODUCT.md](PRODUCT.md) for product scope.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run extension:build
# With Supabase CLI + Docker available:
npx supabase test db
```

## Browser extension

Run `npm run extension:build`, then load `extension/dist` as an unpacked Chrome/Chromium extension. Create a revocable capture token in Praxis Settings and paste it into the extension.

## Deployment

1. Create a Supabase project and apply migrations.
2. Set variables from `.env.example` in Vercel.
3. Set Supabase Auth Site URL and redirect URLs to the deployed domain.
4. Deploy with `vercel --prod` or connect this repository in Vercel.

No secrets belong in Git. Private data is protected by Postgres Row Level Security and server-side ownership checks.
