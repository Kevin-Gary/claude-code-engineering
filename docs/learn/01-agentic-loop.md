<!-- 📘 Act 1 reference: how Claude Code actually works. Read it before the session; Claude reads it
     only if you point it here. Nothing in this file is specific to TypeScript or Next.js. -->

# How Claude Code works: the loop, the tools, and agentic search

## The loop

Every task runs the same loop: **gather context, take action, verify the result**, and repeat
until the task is done. A question might only gather. A bug fix cycles all three many times.

```
your prompt -> gather (search, read) -> act (edit, run) -> verify (tests, types, browser) -+
                  ^                                                                         |
                  +-------------------------- not done yet ---------------------------------+
```

Two parts power it:

- **The model** reasons and decides the next step. It has no memory between requests.
- **The harness** (Claude Code itself) gives the model tools, runs them, and manages what the model
  sees. Hooks, permissions, skills, MCP and subagents are all harness features.

You are in the loop too. Interrupt (Esc) to steer it at any time.

## The tools

| Category | Tools | What they are for |
| --- | --- | --- |
| Files | Read, Edit, Write | Read with line numbers, exact string replacement, create files |
| Search | Glob, Grep | Find files by name pattern; find text inside files (ripgrep) |
| Execution | Bash | Tests, builds, git, anything your shell can do |
| Web | WebFetch, WebSearch | Docs and error messages |
| Code intelligence | LSP (plugin) | Type errors after edits, go to definition |
| Orchestration | Agent, Skill, Task tools | Subagents, skills, task lists |
| Extensions | `mcp__<server>__<tool>` | Anything an MCP server provides (a browser, a database, a ticket system) |

Every tool result goes back into context and shapes the next decision. That is what makes it an
agent instead of autocomplete.

## Agentic search: how Claude finds things in your code

Claude Code does not build an embedding (vector) index of your repo. It searches the live files
the way you would, with tools, and chains searches based on what it finds:

1. **Glob** to find candidate files by name: `**/*waitlist*`, `app/src/app/api/**/route.ts`.
   (Glob does not skip gitignored files by default.)
2. **Grep** to find content: `planLabel`, `normalizePlan(`. It is ripgrep, so it is fast on large
   repos and skips gitignored files.
3. **Read** the hits, with line numbers. Large files come back as a first page with a
   `PARTIAL view` notice, and Claude reads more with `offset` and `limit`.
4. Repeat: a function name found in step 3 becomes the next Grep.

Why no index?
- **Always fresh.** It searches what is on disk right now, including the file you just edited.
- **Nothing to sync or host.** No background indexing, no stale results, no copy of your code elsewhere.
- **Precise.** Exact-match search does not return "similar" code that is wrong.

The cost: every search result costs tokens. Two habits keep that down:

- **The Explore subagent.** For broad questions, Claude delegates to Explore, a fast read-only
  agent with its own context window. Its dozens of searches stay out of your window; you get the
  conclusion. Explore skips your CLAUDE.md files to stay cheap.
- **Give it a head start.** Clear file and function names, a short map in CLAUDE.md, a nested
  `app/CLAUDE.md` that loads when Claude enters that folder, and `@path/to/file` in your prompt
  when you already know where to look.

If your company already runs a code search or RAG index, expose it as an MCP tool and Claude can
query it instead of reading files.

## Try it (Act 1 demo)

Ask: "Where is the waitlist confirmation text built, and where does the plan name come from?"

Watch the transcript: Glob, then Grep, then Read, maybe an Explore delegation. Each step uses
what the previous one found. Then open the context indicator to see what that search cost.

Any stack: Glob, Grep and Read work on any language. Nothing here depends on TypeScript.
