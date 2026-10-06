<!-- 📘 Short, dated, newest first. Read on demand (see README.md in this folder); not imported. -->

# Verdant - notes

## 2026-10-05 - Gotcha: keep vite as a direct devDependency of app/
Vitest pulls in vite only as a peer dependency, so npm (11.5.1) marked vite's optional native
builds (rolldown, lightningcss, fsevents) as `peer` and dropped them from the lockfile on the next
`npm install <anything>`. Vitest then failed with "Cannot find native binding". Listing `vite` in
`app/package.json` devDependencies (same version Vitest resolves) keeps those builds in the lock.
Do not remove it as "unused".

## 2026-10-05 - Memory: built-in memory plus this on-demand folder
The hand-built memory log (a MEMORY.md imported into every session, plus a Stop hook that nudged
Claude to append to it) is gone. Claude Code's auto memory covers personal notes, agent memory
covers what an agent learns, and this folder holds the team's notes, loaded only when needed.

## 2026-10-05 - Engineering-heavy teaching variant (its own repo, forked from claude-code-tutorial)
The repo root is an npm workspace (app/ is the package), with a real backend (waitlist and
care-guide API routes, care-schedule and plan domain logic), Vitest unit tests, Playwright E2E,
engineering skills and agents, control hooks, and a Playwright/docs MCP setup. The agent-teams flag
is not in committed settings (it turns named subagents into teammates). Full reasoning:
decisions.md 2026-10-05.

## 2026-07-08 - Gotcha: the plan-save Stop hook was leaking other projects' plans
Claude Code writes every plan-mode plan to one machine-wide folder (~/.claude/plans). The old Stop
hook copied the newest plan into ./plans, so a plan from another repo landed here. Fixed by scoping
to the session: a SessionStart hook drops .claude/.session-start, and Stop only copies plans newer
than that marker.

## 2026-06-24 - Freemium reverse-trial, not feature-unlock
The free tier gives away the magic moment (identify a plant, get a real care plan) to feed the
install funnel. Plus ($5.99/mo) is the revenue core. Full reasoning: decisions.md 2026-06-24.

## 2026-06-22 - Site copy runs through the brand-voice skill
Every user-facing string on the site is warm, second person, no hype words, no em-dashes. The
always-on guardrails are .claude/rules/brand-voice.md; the full recipe is the brand-voice skill.

## 2026-06-20 - Gotcha: design tokens are the source of truth
Never hand-write one-off colors or spacing in app/. Use the design tokens in globals.css. A
hardcoded hex slipped into the hero once and broke dark mode.
