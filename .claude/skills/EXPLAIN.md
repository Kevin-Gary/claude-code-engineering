# What a skill is

A skill is a reusable recipe. Instead of re-explaining the same thing every time, you capture it
once in a `SKILL.md` file. Claude sees each skill's short description all the time and loads the
full skill only when it is relevant (or when you type `/skill-name`).

## The skills in this repo

| Skill | Who invokes it | What it teaches |
| --- | --- | --- |
| `brand-voice` | You or Claude | The simplest skill: guidance only. |
| `verdant-review` | You or Claude | Team review checklist. `` !`git diff HEAD` `` injects the real diff before Claude reads the skill. Checklist in a supporting file. |
| `write-tests` | You or Claude | A recipe plus two supporting pattern files (Vitest, Playwright). |
| `verify` | You or Claude | The special name: Claude runs it before each commit (v2.1.286+). |
| `security-checklist` | Claude only (`user-invocable: false`) | Background knowledge. Preloaded by the `security-reviewer` agent. |
| `handoff` | You only (`disable-model-invocation: true`) | Writes HANDOFF.md for a fresh session. |
| `ship-update` | You only | A former custom command, now a skill. |

## Anatomy

```
skills/verdant-review/
├── SKILL.md        # frontmatter + short instructions (keep it under ~500 lines)
└── checklist.md    # supporting file: loaded only when the skill runs
```

Frontmatter fields used here: `description` (what and when; this is what Claude matches on),
`when_to_use` (trigger phrases), `argument-hint`, `allowed-tools` (pre-approved for that turn),
`disable-model-invocation`, `user-invocable`.

## Dynamic context: `` !`command` ``

A line starting with `` !`git diff HEAD` `` runs BEFORE the skill reaches Claude, and the output
replaces it. The review starts from the real diff instead of a guess. The command must be allowed
by your permissions or the skill's `allowed-tools`, or the skill aborts.

## Names matter

A project skill with the same name as a bundled skill replaces it. That is why the team review
is `verdant-review` (so `/code-review` stays Anthropic's), and why `verify` is named `verify` on
purpose (to plug into the run-before-commit behavior).

## Team skills vs open-source skills

- **Team skills** live here and are committed. They encode YOUR conventions.
- **Open-source skills** come as plugins from a marketplace. `settings.json` registers the
  `anthropics/skills` marketplace (`extraKnownMarketplaces`) and enables `example-skills`, which
  includes `skill-creator` (writes and evaluates new skills) and `webapp-testing` (Playwright
  scripts for local web apps). Plugin skills are namespaced: `/example-skills:skill-creator`.
  Read a third-party skill before you enable it: a skill can pre-approve tools for itself.

## Build them as you go

Did some work you will repeat? Say "turn that into a skill" and Claude writes the file. A skill is
guidance applied with judgment, not a script. If you want a fixed sequence with no judgment,
that is a hook or a shell script.
