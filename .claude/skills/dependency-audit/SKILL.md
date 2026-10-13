---
name: dependency-audit
description: Report-only weekly dependency audit for Verdant. Summarizes npm outdated and npm audit (counts by severity, direct vs transitive, which fixes need a major version bump) into reports/dependency-audit-<date>.md. Never installs, updates or edits package files.
when_to_use: Use as the prompt of a weekly scheduled run (Desktop scheduled task, cloud routine or CI schedule), or when the user asks "are our dependencies out of date", "any vulnerable packages", or "what would an upgrade involve".
allowed-tools: Bash(npm outdated *) Bash(npm audit --json *) Bash(date *) Bash(mkdir -p reports) Edit(reports/**)
disallowed-tools: AskUserQuestion
---
<!-- 📘 The second SCHEDULABLE skill (see morning-health for the pattern). Weekly is the right cadence:
     advisories and releases do not change by the hour, and a report nobody reads daily is noise.
     It reports and stops. Upgrading is a decision with trade-offs (a major bump, a framework
     migration), so a person makes it, in a normal session, with tests.
     Note `Bash(npm audit --json *)` rather than `Bash(npm audit *)`: the broader rule would also
     pre-approve `npm audit fix`, which rewrites package files.
     Like morning-health, it must stay invocable by Claude (no `disable-model-invocation`) so a
     scheduled `/dependency-audit` runs it. -->

# Dependency audit

You produce a report. You change nothing.

## Guard rails

- Never run `npm install`, `npm update`, `npm ci` or `npm audit fix`.
- Never edit `package.json`, `app/package.json` or `package-lock.json`. The only file you write is
  the report.
- Never commit or push.

## Steps

1. Run `date +%F` and `mkdir -p reports`. The report is `reports/dependency-audit-<date>.md`.
2. **Outdated.** Run `npm outdated --json` at the repo root. It covers the root and the `app`
   workspace. Exit code 1 only means "something is outdated", not a failure. Each entry has
   `current`, `wanted` and `latest`; an entry can be an array when several workspaces depend on the
   package. Sort packages into:
   - **patch or minor behind**: `wanted` or `latest` shares `current`'s major version
   - **major behind**: `latest` has a higher major version than `current`
   If `node_modules` is missing, `current` is empty: say so in the report and do not install.
3. **Audit.** Run `npm audit --json`. Exit code 1 only means "advisories found". From the output:
   - totals by severity: `metadata.vulnerabilities` (critical, high, moderate, low, info)
   - for each package under `vulnerabilities`: severity, `isDirect` (a dependency we declare) or
     transitive (pulled in by something else: follow `effects` up the chain to the direct
     dependency that brings it in), and `fixAvailable`
   - **needs a major bump** when `fixAvailable.isSemVerMajor` is true. Name the package and the
     version npm suggests, and check it: the suggested version can be LOWER than what is installed.
   - `fixAvailable: false` means no fix exists yet.
4. **Triage note.** Some findings come from packages a framework bundles or pins. Triage each one:
   is the vulnerable code reachable in this app, and does the fix require upgrading the framework
   itself? Say what you can tell and what a person needs to decide. Do not guess at exploitability.

## Report file

```markdown
# Dependency audit: <date>

## Vulnerabilities: <total> (critical <n>, high <n>, moderate <n>, low <n>)
| Package | Severity | Direct? | Brought in by | Fix | Major bump? |

## Outdated
### Major behind (<n>)
| Package | Current | Latest | Workspace |
### Patch or minor behind (<n>)
| Package | Current | Wanted | Latest | Workspace |

## Needs a decision
<each fix that needs a major bump or a framework upgrade, one line each, with why>
```

## Final answer (at most 5 lines)

```
Vulnerabilities: <total> (critical <n>, high <n>, moderate <n>, low <n>); <n> direct
Fixes needing a major bump: <n>
Outdated: <n> major behind, <n> patch/minor behind
Needs a decision: <the single most important item, or "nothing">
Report: reports/dependency-audit-<date>.md
```
