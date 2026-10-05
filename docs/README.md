<!-- 📘 docs/ is the on-demand reference library. This README is for humans. -->

# `docs/`: on-demand reference material

This folder is Verdant's reference library: specs, research, notes, anything Claude might need
occasionally but should NOT carry in context every session.

The pattern that makes it work is **on-demand loading**:

- **Do not `@import` these files** in `CLAUDE.md`. An `@import` loads the file in full at launch, so
  importing this folder would put every doc in context every session.
- Instead, **point Claude at the folder** (CLAUDE.md says "check `docs/` when relevant"), or **pull
  one doc into a single prompt** with `@docs/features/waitlist-signup.md`.

| Mechanism | Cost |
| --- | --- |
| `@import` in CLAUDE.md | Loads in full **every** session |
| A file in `docs/`, read on demand | Costs context **only when used** |

## What's here

- [`features/`](./features): acceptance criteria per feature. `waitlist-signup.md` drives the QA demo.
- [`learn/`](./learn): the session's reference notes.
  - `01-agentic-loop.md`: the loop, the tools, agentic search.
  - `02-tokens-and-context.md`: tokens in and out, the context window, prompt caching, compaction.
  - `03-memory-layers.md`: every kind of memory, who writes it, who shares it.
  - `04-control.md`: permission modes, allow/ask/deny rules, and how hooks combine with them.
  - `stack-translation.md`: how each artifact maps to Python, Go, Java and Ruby.
- [`automation/`](./automation): `/loop`, Desktop routines, cloud routines, CI, worktrees.
- [`team-practices.md`](./team-practices.md): what to commit, PR conventions for AI-assisted code.
- [`examples/mcp-with-secrets.json`](./examples/mcp-with-secrets.json): the `${VAR}` pattern for MCP secrets.
- [`verdant-market-research.md`](./verdant-market-research.md): pricing research behind the freemium model.
