<!-- 📘 Act 2 reference: every place Claude's "memory" can live, who writes it, and who shares it. -->

# Context and memory: the layers

Claude has no memory between sessions. Everything it "remembers" is a file that loads into the
context window. The question is always: **who writes it, where does it live, and who shares it?**

| Layer | File | Written by | Shared via git? | Loads |
| --- | --- | --- | --- | --- |
| Managed policy | OS-level `CLAUDE.md` set by IT | Your org | Pushed by IT | Every session |
| User | `~/.claude/CLAUDE.md` | You | No (your machine) | Every session, every project |
| Project | `CLAUDE.md` (or `.claude/CLAUDE.md`) | Your team | **Yes** | Every session |
| Project, imported | `@MEMORY.md` from CLAUDE.md | Your team, plus Claude when this repo's Stop hook nudges it | **Yes** | Every session |
| Local | `CLAUDE.local.md` | You | No (gitignored) | Every session |
| Nested | `app/CLAUDE.md` | Your team | **Yes** | When Claude reads files in `app/` |
| Rules | `.claude/rules/*.md` | Your team | **Yes** | Always, or when a `paths:` glob matches |
| Auto memory | `~/.claude/projects/<repo>/memory/` | **Claude** | No (your machine) | Every session (first 200 lines or 25 KB of its MEMORY.md) |
| Agent memory, project | `.claude/agent-memory/<agent>/` | **Claude** (that agent) | **Yes** | When that agent runs |
| Agent memory, local | `.claude/agent-memory-local/<agent>/` | Claude (that agent) | No (gitignored) | When that agent runs |
| Handoff | `HANDOFF.md` | Claude, when you run `/handoff` | No (gitignored) | When the next session reads it |
| Deep reference | `decisions.md`, `docs/` | Your team | **Yes** | Only when Claude reads them |

## "Agent memory is the only shared, committed kind." What that means

Claude Code has two **built-in** memory systems that Claude writes to on its own, with no hook and
no prompt from you. The difference is where the files land:

- **Auto memory** is Claude's notebook for the main session. It lives in your home folder
  (`~/.claude/projects/<repo>/memory/`). Your teammate never sees what Claude learned on your machine.
- **Agent memory with `memory: project`** is a notebook for one subagent. It lives **inside the
  repo** (`.claude/agent-memory/<agent>/`), so it gets committed, and every teammate's copy of that
  agent starts with the same notes.

So the precise version is: of the memory Claude Code manages for you, project-scope agent memory is
the only kind stored in the repo. Everything else that is shared (CLAUDE.md, rules, MEMORY.md) is a
plain file. People usually write those, and Claude edits them like any other file.

Two caveats, both visible in this repo:

- **This repo's MEMORY.md is a hand-built convention.** The Stop hook
  (`.claude/hooks/persist-memory.sh`) nudges Claude to append decisions to it, so Claude does write
  to a committed file without being asked. That is a hook you built, not a Claude Code feature, and
  it shows how a team can get "auto memory, but shared" today.
- **Agent memory rides on auto memory.** If auto memory is turned off (`autoMemoryEnabled: false`
  or `CLAUDE_CODE_DISABLE_AUTO_MEMORY`), the `memory` field on an agent does nothing.

In this repo, `code-reviewer` and `qa-explorer` have `memory: project`. Run the code-reviewer on a
diff, then `git diff .claude/agent-memory/code-reviewer/MEMORY.md`: that diff is the team's review
knowledge, up for review like any other change. `qa-explorer` does the same after a QA run: it
updates `.claude/agent-memory/qa-explorer/MEMORY.md` with selectors that work and known bugs.

## Which one should a fact go in?

- A rule everyone must follow in every session: **CLAUDE.md** (keep it under ~200 lines).
- A rule for one part of the code: a **path-scoped rule** or a **nested CLAUDE.md**.
- Something only true on your machine: **CLAUDE.local.md**.
- A decision and its reasoning: one line in **MEMORY.md**, the full story in **decisions.md**.
- Where the current task stands, for the next session: **HANDOFF.md** (`/handoff`).
- What a specialist agent keeps rediscovering: that agent's **memory**.
- A fact that changes every session (branch, recent commits): a **SessionStart hook**, not a file.

## Compaction and handoffs

`/compact` summarizes the conversation in place. A **handoff** ends the session on purpose: write
a short note (`/handoff`), start a fresh session, and the SessionStart hook tells Claude to read
`HANDOFF.md` first. Fresh context plus a crisp note often beats a long, compacted one.

## AGENTS.md

If your repo already has an `AGENTS.md` for other coding agents, Claude Code reads it when there is
no CLAUDE.md. Once a CLAUDE.md exists, Claude reads only the CLAUDE.md files by default. To keep one
source of truth for both, put `@AGENTS.md` at the top of CLAUDE.md (an import), or change the
**Project instructions** setting to read both.

Run `/memory` to see every CLAUDE.md, rule and memory file loaded in the current session.
