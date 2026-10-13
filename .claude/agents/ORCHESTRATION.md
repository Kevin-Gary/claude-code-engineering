# Orchestration: who talks to whom

<!-- 📘 This file has no frontmatter, so Claude Code treats it as documentation kept beside the agents,
     not as an agent. It explains how the agents in this folder combine, and gives prompts you can
     paste. Facts checked against the Claude Code docs (sub-agents, agent-teams, workflows, worktrees)
     on 2026-10-12. -->

## 1. Four words, one sentence each

- **Agent**: a Claude loop with tools. Your main session is one: it reads, runs tools, reads the
  results, and decides the next step until the task is done.
- **Subagent**: a worker your session spawns for one task. It runs in its own context window with
  its own system prompt and tool allowlist, and returns only its final report.
- **Agent team** (experimental): a lead session plus teammates, each a separate Claude Code
  instance with its own context, sharing a task list and a mailbox so they can message each other.
- **Dynamic workflow**: a JavaScript script that the runtime executes in the background; the script
  spawns the agents, holds the loop and the intermediate results, and hands Claude only the final
  result.

## 2. Lines of communication

**Subagents report to the session that spawned them, and only to it.**

```
        you
         │
   main session ──spawns──► security-reviewer ──final report──► main session
         │
         └──spawns──► verifier ──final report──► main session
```

- A subagent starts fresh. It does not see your conversation, the files Claude already read, or the
  skills already loaded. It gets its own system prompt (the agent file's body), the task message
  Claude writes, the CLAUDE.md files, a git status snapshot and any skills its `skills:` field
  preloads. (Explore and Plan skip CLAUDE.md and git status.)
- Only the final report comes back. The reading, searching and dead ends stay in the subagent's
  context, which is the point.
- Claude can continue a finished subagent (it resumes with its history) by messaging it, and a
  subagent can spawn subagents of its own, up to three layers below your session by default. The
  results still flow up the same line: each one reports to whoever spawned it.
- `/subtask` starts a fork instead: a subagent that inherits the whole conversation.

**Teammates message each other, and you can message any of them.**

```
        you ──────────────┬────────────┬────────────┐
         │                │            │            │
       lead ◄──────► teammate A ◄──► teammate B ◄──► teammate C
         │                └──────── shared task list ┘
```

- The lead spawns teammates and creates tasks; teammates claim tasks, message each other by name,
  and notify the lead when they finish. You can open any teammate's transcript and talk to it.
- Teammates load CLAUDE.md, MCP servers and skills like a normal session, plus the spawn prompt.
  They do not get the lead's conversation history.

**Workflow agents report to the script. Only the final result reaches Claude.**

```
   Claude ──launches──► workflow script ──agent()──► reviewer 1 ─┐
                             │          ──agent()──► reviewer 2 ─┼─► script variables
                             │          ──agent()──► verifier N ─┘
                             └──return value──► Claude
```

- Each `agent()` call returns its result to the script, not to Claude. The script filters, ranks
  and returns one value. Claude's context holds that value and nothing else.

## 3. The orchestration loop

Every pattern below is some version of these five steps:

1. **Split**: turn the job into independent pieces (one per file, per route, per hypothesis).
2. **Fan out**: give each piece to a worker with a complete brief and the fewest tools it needs.
3. **Collect**: gather the reports in one place (your session, the lead, or script variables).
4. **Verify**: have a different agent try to refute each finding before anyone acts on it.
5. **Synthesize**: merge, dedupe and rank what survived into one answer a person can act on.

## 4. Subagents, agent team or workflow?

| | Subagents | Agent team | Dynamic workflow |
| --- | --- | --- | --- |
| Who decides what runs next | Claude, turn by turn | The lead, turn by turn | The script |
| Where intermediate results live | Claude's context window | Each teammate's context, the shared task list and mailbox | Script variables |
| Scale | A few delegated tasks per turn | A handful of long-running peers (start with 3 to 5) | Dozens of agents per run (runtime caps: up to 16 at once, 1,000 per run) |
| What is repeatable | The agent definition (a file in this folder) | The teammate roles (agent definitions) | The orchestration itself (`.claude/workflows/*.js`) |
| If interrupted | The turn restarts | Teammates keep running | Resumable in the same session |
| Cost | Lowest: only summaries return to the main context | Highest: every teammate is a full Claude instance | High: many agents per run. Try it on one folder first |
| Workers talk to each other | Not by design: each reports to its spawner (subagents Claude names can message each other) | Yes, directly | No: each reports to the script |
| Where it runs | Everywhere, including `claude -p` | Interactive CLI sessions, and cloud sessions with the flag | CLI, Desktop, IDE, `claude -p` |

Rule of thumb: start with subagents. Reach for a team when the workers need to argue with each
other. Reach for a workflow when you want the same fan-out and verification every time, or the job
needs more agents than a conversation can hold.

## 5. Copy-paste prompts using this repo's agents

**Parallel research (three Explore agents).** Read-only, cheap, and it keeps the file dumps out of
your context.

```text
Use three Explore agents in parallel, medium thoroughness:
1. map the API routes under app/src/app/api (inputs, outputs, what each calls)
2. map the domain logic under app/src/lib (exported functions and their tests)
3. map the test suites: app/src/**/*.test.ts and e2e/
Each returns at most 15 lines with file paths. Then give me a one-page map of how they connect.
```

**Writer plus reviewer.** The reviewer has a fresh context, so it does not share the writer's
assumptions.

```text
Use the implementer agent to make this change: <one small, well-defined change, with the file>.
When it reports, use the code-reviewer agent to review the commit on the implementer's branch
against .claude/skills/verdant-review/checklist.md. Show me both reports. Do not merge anything.
```

**Chain: find, verify, fix, review.**

```text
1. Use the security-reviewer agent on app/src/app/api.
2. For each finding, use the verifier agent to try to disprove it. Paste the full finding
   (file, line, claim, exploit) into each verifier's task, because it cannot see this chat.
3. For each CONFIRMED finding, use the implementer agent to fix it in its own worktree, with a
   failing test first. Run the implementers in parallel; worktrees keep their edits apart.
4. Use the code-reviewer agent on each implementer branch.
Finish with a table: finding, verdict, branch, check result, review verdict. Do not merge or push.
```

**Fan-out plus verify, as a workflow.** The saved version of this is
`.claude/workflows/api-input-audit.js`, so you can also just run `/api-input-audit`.

```text
ultracode: for every route.ts under app/src/app/api, run one security-reviewer agent looking for
unvalidated user input, then one verifier per finding that must show a concrete request that
triggers it or drop it. Return only the confirmed findings, ranked high to low.
```

## 6. An agent team (CLI only, experimental)

Turn it on for your machine only, in `.claude/settings.local.json` or your shell
(`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`; see `CLAUDE.local.md.example`). This repo keeps it out of
the committed settings because, while it is on, any subagent Claude names launches as a teammate.

```text
Create an agent team to review app/src/app/api. Spawn three teammates, named and typed:
- "reviewer", using the security-reviewer agent type: audit each route.ts and post every finding
  (file, line, claim, concrete request) to the task list. Apply the checklist in
  .claude/skills/security-checklist/SKILL.md.
- "skeptic", using the verifier agent type: take each finding as it lands, try to disprove it, and
  message "reviewer" directly when you refute one, with your evidence.
- "tests", using the test-writer agent type: for each finding the skeptic confirms, write a failing
  test. Edit only *.test.ts files and e2e/. Nobody else edits files.
Wait for all three to finish, then give me the confirmed findings with their failing tests.
```

Caveats, from the agent teams docs:

- Experimental and off by default. Interactive sessions only: not `claude -p`, not the Desktop app.
  A cloud session can enable it with the same variable on its cloud environment.
- Teammates are not isolated in worktrees. Partition the files (above: only "tests" writes).
- One team per session, no nested teams, and `/resume` does not bring in-process teammates back.
- A teammate spawned from an agent definition gets that file's `tools`, `model` and instructions,
  but not its `skills`, which is why the prompt names the checklist.
- Every teammate is a full Claude instance, so the bill scales with the head count.

## 7. Best practices

- **Brief the worker fully.** It cannot see your chat. Paste the finding, the file, the line, the
  constraint and what "done" looks like into the task.
- **Least privilege.** Give each agent only the tools its job needs. A read-only allowlist
  (`verifier`, `security-reviewer`) is a guarantee; a rule in the prompt is a request.
- **Isolate writers.** Anything that edits in parallel gets `isolation: worktree` (`implementer`),
  or a strict split of which files each writer owns.
- **Verify before you trust.** A finding is a claim until a different agent fails to refute it.
- **Start small to see the cost.** Run the pattern on one folder, check `/workflows` or the agent
  panel for token use, then widen it.
- **A person merges.** Agents produce branches and reports. Merging, pushing and deploying stay
  with a human.
