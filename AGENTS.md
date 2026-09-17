# AGENTS.md — Rules for AI Coding Agents Working on Praxis

This file governs all AI coding agents working in this repository. Follow it strictly.

## Before coding

Every agent must:

1. Read `PRODUCT.md`.
2. Read `AGENTS.md`.
3. Read the current task completely.
4. Inspect the existing implementation before modifying it.
5. Inspect Git status (`git status`) before and after the work.
6. Understand the existing architecture before adding another system.

## Scope discipline

- Implement ONLY the requested milestone.
- Do not implement future features because they seem useful.
- Do not perform unrelated large refactors.
- Do not replace working systems without justification.
- Do not create duplicate architectures.
- Prefer modifying existing appropriate abstractions over introducing parallel ones.
- `PRODUCT.md` describes long-term direction. It does NOT authorize implementing
  future functionality unless the current milestone explicitly requests it.

## Engineering principles

Prefer:

- simple solutions,
- standard framework conventions (Next.js App Router, TypeScript, Tailwind CSS),
- strict TypeScript,
- small reusable components when justified,
- explicit error handling,
- accessibility (semantic HTML, labels, focus states, contrast),
- responsive layouts (must work at narrow/mobile widths),
- maintainability,
- minimal dependencies.

Avoid:

- premature abstraction,
- speculative architecture,
- giant files,
- unnecessary dependencies,
- hidden global state,
- placeholder systems pretending to be implemented.

## Security

Never:

- expose secrets,
- commit `.env` files containing secrets (only `.env.example` with placeholders),
- place server secrets in client code,
- disable security mechanisms merely to make something work.

Future authentication/database features must use proper authorization and
Row Level Security when Supabase is introduced.

## Verification

An agent may NOT claim a task is complete merely because code was written.

Before completion, run all relevant checks, including:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

Fix failures caused by the implementation. Do not hide failures.
Do not describe something as tested if it was not actually tested.

## Completion report

Every implementation task should finish with:

1. Summary of what changed.
2. Important files changed.
3. Tests/checks executed.
4. Results.
5. Manual verification instructions.
6. Known limitations.
7. Explicit confirmation of anything intentionally NOT implemented.
8. Git status (branch, commit hash if committed, final `git status` output).

Do not begin the next milestone unless explicitly requested.
