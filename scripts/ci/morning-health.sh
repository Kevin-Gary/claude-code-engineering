#!/usr/bin/env bash
# 📘 The TEAM-OWNED version of the morning-health check, for a scheduled CI pipeline. It runs the
# same committed skill a person would schedule on their own machine (`/morning-health`), but on a CI
# runner, on a schedule the repository owns, whether or not anyone's laptop is on.
# ci-examples/bitbucket-pipelines.yml runs it as `custom: nightly-health`. A pattern, not an
# official integration (same as claude-review.sh next to it).
#
# Inputs (environment):
#   ANTHROPIC_API_KEY   required. An ORGANIZATION key from a SECURED repository variable, so the run
#                       belongs to the team and its cost shows up on the team's account, not one
#                       person's subscription. Never commit it.
#
# How the run is bounded (compare claude-review.sh, which is fully read-only):
#   --tools "Read,Grep,Glob,Bash,Write"
#                     the only built-in tools this run has. No Edit. Write is there for the report.
#   --permission-mode dontAsk
#                     anything not pre-approved is denied instead of prompting. A CI run never
#                     waits for a human, and nothing outside the lists below can run.
#   --allowedTools "..."
#                     pre-approves exactly what the skill needs: the check, git reads, the date,
#                     and writes under reports/ (an Edit(path) rule also covers Write).
#   --disallowedTools "..."
#                     deny rules beat allow rules from every settings file, including this repo's
#                     .claude/settings.json (which allows Edit and git commit for people). So the
#                     run cannot commit, push, install, or write into app/ or e2e/.
#   --strict-mcp-config, --settings '{"disableAllHooks": true}'
#                     no MCP servers and no repo hooks on the runner, as in claude-review.sh.
#   --max-turns 30    a hard stop if something goes wrong.
#
# Not --bare: bare mode skips skill discovery, and the whole point is to run the committed skill.

set -euo pipefail

mkdir -p reports

# Keep going if claude exits non-zero (for example at --max-turns), so the log still shows what
# came back; exit with claude's status at the end.
status=0
claude -p "/morning-health" \
  --tools "Read,Grep,Glob,Bash,Write" \
  --permission-mode dontAsk \
  --allowedTools "Read,Grep,Glob,Bash(npm run check),Bash(git log *),Bash(git show *),Bash(git diff *),Bash(git rev-parse *),Bash(date *),Bash(mkdir -p reports),Edit(reports/**)" \
  --disallowedTools "Bash(git commit *),Bash(git push *),Bash(git add *),Bash(npm install *),Bash(npm ci *),Bash(npm update *),Bash(npm audit fix *),Edit(app/**),Edit(e2e/**)" \
  --strict-mcp-config \
  --settings '{"disableAllHooks": true}' \
  --max-turns 30 \
  --output-format json > reports/morning-health-run.json || status=$?

# Print the skill's 5-line summary (the final answer) into the CI log.
node -e '
  let r = {};
  try { r = JSON.parse(require("fs").readFileSync("reports/morning-health-run.json", "utf8")); } catch {}
  console.log(r.result ?? "(no result: see reports/morning-health-run.json)");
' || true
exit "$status"
