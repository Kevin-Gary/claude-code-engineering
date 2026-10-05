<!-- 📘 decisions.md is the DEEP archive of durable decisions (ADR style: Context / Decision /
     Consequences). Unlike MEMORY.md, it is deliberately NOT @imported by CLAUDE.md, so it does NOT
     load into context automatically. Claude reads it ON DEMAND (it greps or opens it when it needs
     the full reasoning), or you pull a single entry into one prompt with @decisions.md.
     Why split it out: @import does not save context (imported files load in full at launch), so the
     way you keep the always-on context lean is to leave the deep history UN-imported and read it
     only when it matters. MEMORY.md holds the one-line "what"; this file holds the full "why". -->

# Verdant - decision records

Durable, ADR-style decisions. Append new entries at the bottom. Keep MEMORY.md's one-liner in sync.

---

## 2026-06-24 - Freemium reverse-trial over feature-unlock

**Context.** Verdant is a plant-care app whose growth loop is App Store installs, driven by the
marketing site in `app/`. We debated two monetization shapes: a hard paywall on the core magic
(identify a plant, get a care plan), versus a free tier that gives that magic away and charges for
depth (unlimited ID, smart reminders, photo diagnosis).

**Decision.** Free tier gives away the magic moment. Plus ($5.99/mo, $39.99/yr) is the revenue core.
Family ($9.99/mo, $79.99/yr) lifts ARPU on multi-person households. Annual is discounted to nudge
toward it for better LTV and lower churn.

**Consequences.** The site's whole job is installs, so removing friction at the aha moment is the
cheapest growth we have (trust plus word of mouth). We accept lower immediate conversion in exchange
for funnel volume and retention. Pricing is benchmarked mid-market against Planta and PictureThis
(~$30 to $40/yr). Revisit if free-to-paid conversion sits below ~3% after launch.

---

## 2026-06-18 - Native iOS app, marketing site on the web

**Context.** Verdant needs a camera-driven identify-and-diagnose experience (live camera, on-device
speed, offline care reminders, notifications). The marketing surface needs SEO, fast first paint,
and easy iteration.

**Decision.** Ship the product as a native iOS app; keep the marketing/acquisition surface as this
Next.js site in `app/`. The site's only job is to turn a plant-curious visitor into an install.

**Consequences.** Two codebases, two rhythms: the app optimizes for camera and reliability, the site
optimizes for load speed and conversion. This repo is the SITE plus its Claude Code setup, not the
app. A web-wrapper would have been faster to ship but could not deliver the camera and offline
experience the product promise depends on, so we took the native cost on purpose.

---

## 2026-10-05 - Engineering-heavy teaching variant for the in-depth session

**Context.** The base repo is a deliberately lightweight skeleton for the regular cohorts. A
separate 3-hour "Claude Code in depth" session for an engineering team needs the same repo to carry
real engineering surface area: an app with logic and endpoints to test, review and secure, plus
every native Claude Code construct demonstrated on it. Verdant stays the example and the brand. The
session teaches concepts and patterns, not a language, so the additions are explained to transfer to
any stack even though the code is TypeScript and Next.js.

**Decision.** In a separate repo (`claude-code-engineering`, forked from `claude-code-tutorial`), add:
- A workspace root (`package.json` with `workspaces: ["app"]`, one lockfile) so sessions, hooks, MCP
  servers and Playwright all run from the repo root.
- An app backend: `waitlist` and `care-guides/[slug]` API routes, pure domain logic in
  `app/src/lib/care` and `app/src/lib/waitlist`, each with Vitest tests, and a waitlist UI section.
- Testing as a system: Vitest config and scripts, `npm run check`, Playwright config plus E2E specs,
  a `verify` project skill (runs before each commit), and the Playwright test agents from
  `init-agents`. Acceptance criteria in `docs/features/`, test plans in `specs/`.
- Control: a PreToolUse guard hook (block/deny/ask), typecheck-on-edit, a SessionStart context hook
  matching `compact`, a notification hook; permissions that allow checks, ask on push and dependency
  changes, deny `.env`.
- Skills (`verdant-review`, `write-tests`, `security-checklist`, `verify`, `handoff`) and agents
  (read-only `security-reviewer`, `code-reviewer` and `qa-explorer` with project memory, `test-writer`).
- MCP: Playwright MCP (pinned), the Playwright test server, and the no-auth Claude Code docs server.
- Automation and CI: GitHub Actions (deterministic CI + AI review with the official action), a
  Bitbucket headless-`claude -p` pattern, `REVIEW.md`, and `docs/automation` + `docs/team-practices`.
- Deliberate exercises for the review, security and QA demos. They are not documented in this repo,
  so the demos stay honest: the instructor keeps the answer key and run of show privately.

**Consequences.** The repo is heavier than the base skeleton on purpose; this variant lives in its
own repo so the lightweight cohort repo is unaffected. The agent-teams env flag is removed from the
committed `.claude/settings.json`, because while it is on a subagent Claude names launches as a
teammate, which would break the subagent demos; it moves to `CLAUDE.local.md.example` as a personal
opt-in. The answer key for the exercises lives outside this public repo: a permission rule can't
reliably hide a file from Claude (Read rules are best-effort for search tools and do not see
`grep -r .`), and anyone can read a public repo. Pinned versions verified against npm
and the cached docs on 2026-10-05.
