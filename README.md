# Claude Code Tutorial

A clean, fully-commented reference repo that shows **every core Claude Code building block in one
place**, built around a real, runnable app. Clone it, read it, steal the patterns.

The example product is **Verdant**, a fictional plant-care company. Its marketing site is a real
Next.js app in [`app/`](./app), with a small backend (two API routes, some domain logic) so the
testing, review and security lessons have real code to work on. Every file carries `<!-- 📘 -->`
teaching notes in the raw source.

> This repo is language-agnostic by design. The code is TypeScript and Next.js, but the lessons are
> about concepts, tooling and patterns. [`docs/learn/stack-translation.md`](./docs/learn/stack-translation.md)
> maps every artifact to Python, Go, Java and Ruby.

---

## Quickstart

```bash
git clone https://github.com/Kevin-Gary/claude-code-engineering.git
cd claude-code-engineering
npm install            # the repo root is an npm workspace; app/ is the package
npm run check          # lint + typecheck + unit tests
npm run dev            # http://localhost:3000
claude                 # start Claude Code and poke around
```

E2E tests: `npm run test:e2e` (needs a browser: `npx playwright install chromium` once). Build: `npm run build`.

---

## The map

### Context and memory
| Path | Teaches |
| --- | --- |
| [`CLAUDE.md`](./CLAUDE.md) | The project contract Claude auto-loads every session. Scopes, inheritance, `@`-imports, compact instructions. |
| [`app/CLAUDE.md`](./app/CLAUDE.md) | A nested CLAUDE.md that loads only when Claude works in `app/`. |
| [`memory/`](./memory) | The team's notes (`notes.md`) and decision records (`decisions.md`). NOT imported: CLAUDE.md points here and Claude reads them on demand. `memory/README.md` says what goes in. |
| [`CLAUDE.local.md.example`](./CLAUDE.local.md.example) | Personal, gitignored overrides. |
| [`.claude/rules/`](./.claude/rules) | Modular instructions: always-on, or path-scoped via `paths:` globs. |
| [`.claude/agent-memory/`](./.claude/agent-memory) | Notes an agent writes for itself, committed and shared (of Claude Code's built-in memory systems, the only one stored in the repo). |

### Teaching Claude your codebase
| Path | Teaches |
| --- | --- |
| [`.claude/skills/`](./.claude/skills) | Skills: `verdant-review`, `write-tests`, `verify`, `handoff`, `security-checklist`, `brand-voice`, `ship-update`. See `skills/EXPLAIN.md`. |
| [`.claude/agents/`](./.claude/agents) | Subagents: `security-reviewer`, `code-reviewer`, `test-writer`, `qa-explorer`, plus Playwright's test agents. See `agents/PRIMER.md`. |
| [`.claude/workflows/`](./.claude/workflows) | A dynamic workflow that orchestrates many subagents, run as `/verdant-design-audit`. |

### Control
| Path | Teaches |
| --- | --- |
| [`.claude/settings.json`](./.claude/settings.json) | Permissions (allow/ask/deny), hooks, plugins, marketplaces. |
| [`.claude/hooks/`](./.claude/hooks) | A PreToolUse guard, typecheck-on-edit, SessionStart context, a notification. |

### Connect and automate
| Path | Teaches |
| --- | --- |
| [`.mcp.json`](./.mcp.json) | MCP servers: Playwright, the Playwright test server, the Claude Code docs. See `EXPLAIN-MCP.md`. |
| [`.github/workflows/`](./.github/workflows) | CI (deterministic, no AI) and AI PR review with the official action. |
| [`ci-examples/`](./ci-examples) + [`scripts/ci/`](./scripts/ci) | Headless `claude -p` review for any CI (a pattern). |
| [`REVIEW.md`](./REVIEW.md) | Tunes Anthropic's managed Code Review for this repo. |

### Quality and QA
| Path | Teaches |
| --- | --- |
| [`app/src/lib/**/*.test.ts`](./app/src/lib) | Vitest unit tests next to the code they cover. |
| [`e2e/`](./e2e) | Playwright E2E tests. |
| [`docs/features/`](./docs/features) | Acceptance criteria, the input to the QA chain. |
| [`specs/`](./specs) | Test plans: acceptance criteria to Markdown plan to tests. |

### Reference
| Path | Teaches |
| --- | --- |
| [`docs/learn/`](./docs/learn) | The agentic loop and search, tokens and context, memory layers, control (modes, rules, hooks), stack translation. |
| [`docs/automation/`](./docs/automation) | `/loop`, Desktop and cloud routines, worktrees, Remote Control. |
| [`docs/team-practices.md`](./docs/team-practices.md) | What to commit, PR conventions for AI-assisted code. |
| [`app/`](./app) | The real app to operate on. |

---

## The two JSON configs (JSON can't carry comments)

### `.mcp.json`
MCP ("Model Context Protocol") lets Claude talk to outside tools through a consistent interface.
This repo wires up four servers: `claude_design` (the design system, via `/design-sync`),
`claude-code-docs` (searches the official docs, no auth), `playwright` (a real browser Claude can
drive) and `playwright-test` (tools for Playwright's test agents). Pin versions in a team file;
reference secrets as `${VAR}`, never values. Full notes in [`EXPLAIN-MCP.md`](./EXPLAIN-MCP.md).

### `.claude/settings.json`
- **`permissions`**: `allow` / `ask` / `deny`. This repo allows the test and check commands, asks
  before `git push` and dependency changes, and denies `.env` reads.
  A `Read` deny rule also covers Bash file commands it recognizes (`cat`, `head`, `sed`). It cannot
  see a `grep -r .` that never names the file, or a script that opens it; the guard hook
  (`guard.mjs`) catches some of those, and the sandbox is the real wall. Modes and precedence are
  in [`docs/learn/04-control.md`](./docs/learn/04-control.md).
  "Yes, don't ask again" writes the new rule to `settings.local.json`.
- **`hooks`**: SessionStart context (also after `/compact`), a PreToolUse guard, typecheck after
  every edit, a notification, and the Stop hooks that save plans and nudge memory.
- **`extraKnownMarketplaces` + `enabledPlugins`**: register the `anthropics/skills` marketplace for
  the team and enable `example-skills`.

---

## The 3-hour session

This repo is the artifact for a "Claude Code in depth" session. The public learning notes are in
[`docs/learn/`](./docs/learn) and [`docs/automation/`](./docs/automation). The code has a few
deliberate bugs and security issues for the review, security and QA demos. Finding them is the
exercise, so there's no answer key in this repo.

Built at [Claude Camp](https://claudecamp.ai).
