<!-- 📘 CLAUDE.md is auto-loaded at the start of EVERY session in this folder. It is your contract
     with Claude: who you are, what you're building, how you want it to work. Claude also loads
     ~/.claude/CLAUDE.md and any parent CLAUDE.md, broad to narrow. Keep it tight: every line costs
     tokens in every session. Target under ~200 lines. -->

# Verdant

Verdant is a plant-care and plant-identification company. This repo holds the **marketing site**
(in `app/`) plus the Claude Code setup used to build, test and ship it. It doubles as a teaching
repo: the comments marked `<!-- 📘 ... -->` explain what each piece is and why it exists.

<!-- 📘 Nothing below is @imported: memory/ and docs/ load only when Claude reads them, so they cost
     zero context until a task needs them. This file carries the pointer; the knowledge lives one hop
     away. -->
## Reference (read on demand, not imported)
- `memory/`: the team's notes. `memory/notes.md` (dated gotchas and decisions) and
  `memory/decisions.md` (the full "why"). Check them before changing something that looks deliberate.
  How to add to them: `memory/README.md`.
- `docs/`: specs, the session's learning notes, automation guides. Pull one in with `@docs/...`.

## The engineering surface
A Next.js 15 marketing site in `app/`, plus a small backend for the testing and security lessons:
two API routes (`app/src/app/api/waitlist`, `app/src/app/api/care-guides/[slug]`) and pure domain
logic in `app/src/lib/care` and `app/src/lib/waitlist`, each with unit tests next to it.
Acceptance criteria live in `docs/features/`, test plans in `specs/`, E2E tests in `e2e/`.

## Commands (run from the repo root; it is an npm workspace)
- `npm run dev`: start the site at http://localhost:3000
- `npm run check`: lint + typecheck + unit tests (run it before you say "done"; CI runs it plus build and E2E)
- `npm test` / `npm run typecheck` / `npm run lint`: the pieces of `check`
- `npm run test:e2e`: Playwright end-to-end tests (starts the dev server for you)
- `npm run build`: production build

## Engineering conventions
- Business rules go in `app/src/lib/` as pure functions, each with a `*.test.ts` beside it. Route
  handlers and components stay thin.
- API routes validate and bound every input at the boundary, and return only the fields the caller
  needs. Never log or expose personal data beyond what a feature needs.
- Never render user-supplied text as HTML. React escapes text by default; keep it that way.
- Domain dates are ISO strings (`YYYY-MM-DD`) handled in UTC.
- Style `app/` with the design tokens in `globals.css`; never hardcode hex or pixel values.
- Server components by default; add `"use client"` only for state, effects or browser APIs.

## Testing rules
- A bug fix starts with a failing test that reproduces the bug.
- Never weaken, skip or delete an assertion to get to green. If a test looks wrong, ask first.
- Run `npm run check` before you say a change is done; run `npm run test:e2e` when the page changed.

## How to work here
- Match the existing patterns in `app/`; look before you build.
- Keep copy on-brand: warm, second person, short sentences, no hype words, no em-dashes (see the
  `brand-voice` skill and rule).
- Small, reviewable changes. Use plan mode for anything non-trivial.
- Never commit secrets. Personal, machine-specific context goes in `CLAUDE.local.md` (gitignored).

## Pricing and business model
Freemium: a free tier that feeds the install funnel, plus two paid tiers (the reasoning is in
`memory/decisions.md`, 2026-06-24). Prices shown on the site must match this table; if they disagree, this
file wins and the site is wrong.

| Tier | Monthly | Annual | For |
| --- | --- | --- | --- |
| Free | $0 | $0 | First few plants: ID up to 5/mo, reminders for up to 3, community. |
| Plus | $5.99 | $39.99 (save ~44%) | A growing collection: unlimited ID, smart reminders, photo diagnosis, light meter. |
| Family | $9.99 | $79.99 (save ~33%) | The household: everything in Plus, up to 5 members, shared library, priority help. |

## Project structure
- `app/`: the Verdant site (see `app/CLAUDE.md`, which loads when Claude works in there).
- `.claude/`: the Claude Code config (see `.claude/EXPLAIN.md`): settings, rules, skills, agents,
  agent-memory, hooks, workflows.
- `.mcp.json`: MCP servers (see `EXPLAIN-MCP.md`).
- `docs/`, `specs/`: reference, acceptance criteria, test plans.
- `memory/` (team notes, on demand), `plans/` (saved plan-mode plans).

## Compact instructions
When compacting, keep: the current task, the names of any failing tests, the files touched, and any
decision not yet written to memory/notes.md.

## Good to know
- This is a teaching repo. Clarity beats cleverness everywhere.
- The design system is the source of truth for colors, spacing and components.
