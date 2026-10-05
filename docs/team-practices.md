<!-- 📘 Act 7 reference: how a team shares one Claude Code setup without stepping on each other. -->

# Team practices for Claude Code in a shared repo

## Commit vs keep personal

| Commit (the team shares it) | Keep personal (gitignored or in your home folder) |
| --- | --- |
| `CLAUDE.md`, nested `CLAUDE.md`, `.claude/rules/` | `CLAUDE.local.md` |
| `.claude/settings.json` (permissions, hooks) | `.claude/settings.local.json` |
| `.claude/skills/`, `.claude/agents/`, `.claude/workflows/` | `~/.claude/` (your personal skills, agents, CLAUDE.md) |
| `.claude/agent-memory/` (agents with `memory: project`) | Auto memory (`~/.claude/projects/<repo>/memory/`) |
| `.mcp.json` (servers, with `${VAR}` for secrets) | The secrets themselves, in your environment or `.env.local` |
| `REVIEW.md`, `specs/`, `docs/` | `HANDOFF.md`, `plans/` drafts you do not want to share |

Rule of thumb: if a teammate would be confused or blocked without it, commit it. If it is true
only for you or only today, keep it personal.

## Changes to the shared setup are code changes

- `.claude/settings.json` and `.claude/hooks/` run on everyone's machine, and in CI. Review them
  like CI config. A hook is a shell script with your permissions.
- Repo hooks and `.mcp.json` servers run in headless `claude -p` and in CI **without a trust
  prompt**. A pull request that edits them changes what runs in your pipeline.
- Skills can pre-approve tools for themselves (`allowed-tools`). Read third-party skills and
  plugins before enabling them.
- Keep `CLAUDE.md` short (under ~200 lines). Every line loads into every session for every teammate.

## Pull requests with AI-assisted code

1. **A human owns the diff.** You read every line before you open the PR. "Claude wrote it" is not
   a review.
2. **Tests ship in the same PR.** New behavior gets a test; a bug fix gets a test that failed first.
3. **Never weaken a test to go green.** Deleting, skipping or loosening an assertion needs a reason
   in the PR description.
4. **Say what you verified.** "Ran `npm run check` and `npm run test:e2e`; checked the form in the
   browser" beats "LGTM".
5. **Attribute it.** Keep the `Co-Authored-By: Claude ...` trailer Claude adds to commits. It tells
   reviewers where to look harder and makes the history honest.
6. **Small PRs.** Claude makes big diffs cheap to write, not cheap to review.

## Reviewing AI-assisted PRs

- Review with **fresh context**: a second session (or `/verdant-review`, or the GitHub Action)
  that did not write the code catches what the author session talked itself into.
- Look hardest at boundaries: input handling, auth, file paths, outbound requests, migrations.
- Check that the tests test the behavior, not the implementation, and that they would fail if the
  feature broke.

## Working in parallel

- One task per session. Use `/clear` between unrelated tasks.
- Parallel sessions on the same repo use **git worktrees** so they never edit the same files.
- Use `/handoff` (this repo's skill) when a task moves to another session or another person.
