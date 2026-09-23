# Security

Report vulnerabilities privately to the repository owner. Do not open a public issue containing exploit details or personal data.

Praxis relies on Supabase Row Level Security as the primary data boundary. Service-role credentials must remain server-only. Never commit `.env` files, access tokens, extension tokens, OAuth secrets, cron secrets, or provider keys.

Before deployment, verify RLS in a non-production Supabase project with two users, configure exact Auth redirect URLs, rotate any credential exposed outside approved secret stores, and review public insight output for data minimization.
