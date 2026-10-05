#!/usr/bin/env bash
# 📘 Headless AI code review for ANY CI system: the pattern behind ci-examples/bitbucket-pipelines.yml.
# It is not an official integration. It is plain `claude -p` (headless mode) in a pipeline step:
#   1. compute the diff of this pull request
#   2. ask Claude to review it with READ-ONLY tools and answer in a fixed JSON shape (--json-schema)
#   3. save the result as a build artifact (and optionally post it as a PR comment)
#
# Inputs (environment):
#   ANTHROPIC_API_KEY   required, from a secured CI variable. Never commit it.
#   BASE_BRANCH         branch to diff against (Bitbucket sets BITBUCKET_PR_DESTINATION_BRANCH)
#
# Read-only means RESTRICTED, not just pre-approved. These flags are easy to mix up:
#   --tools "Read,Grep,Glob"   the ONLY built-in tools this run has. No Edit, no Bash. This is the
#                              flag that makes the review read-only.
#   --allowedTools "..."       pre-approves tools so they never prompt. On its own it restricts
#                              nothing: the project settings.json still allows Edit and git commit.
#   --strict-mcp-config        load no MCP servers (none were passed with --mcp-config), so the
#                              Playwright servers in .mcp.json do not start on the CI runner.
#   --settings '{"disableAllHooks": true}'
#                              skip the repo's hooks for this run. Local hooks (typecheck, plan
#                              saving) would only waste turns here.
#
# Without --bare, `claude -p` still loads this repo's CLAUDE.md and skills, which is what you want
# for "review against our standards". Without the flags above it would also run the repo's hooks
# and MCP servers with no trust prompt, which means a pull request could change what runs in CI.
# Review .claude/ changes like CI config either way. (--bare skips all repo config instead; then
# pass the standards in the prompt.)

set -euo pipefail

BASE_BRANCH="${BASE_BRANCH:-${BITBUCKET_PR_DESTINATION_BRANCH:-main}}"
# The explicit refspec creates origin/$BASE_BRANCH even on a single-branch CI clone.
git fetch --quiet origin "+refs/heads/$BASE_BRANCH:refs/remotes/origin/$BASE_BRANCH" || true
DIFF="$(git diff "origin/$BASE_BRANCH...HEAD")"

if [ -z "$DIFF" ]; then
  echo "No changes against origin/$BASE_BRANCH. Nothing to review."
  exit 0
fi

SCHEMA='{
  "type": "object",
  "properties": {
    "verdict": { "type": "string", "enum": ["ready", "fix-first", "needs-another-pass"] },
    "findings": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "severity": { "type": "string", "enum": ["blocker", "should-fix", "nit"] },
          "file": { "type": "string" },
          "line": { "type": "integer" },
          "issue": { "type": "string" },
          "fix": { "type": "string" }
        },
        "required": ["severity", "file", "issue", "fix"]
      }
    }
  },
  "required": ["verdict", "findings"]
}'

PROMPT="Review this pull request diff against the checklist in .claude/skills/verdant-review/checklist.md.
Open full files where the diff is not enough. Report only problems you can point at.

$DIFF"

claude -p "$PROMPT" \
  --tools "Read,Grep,Glob" \
  --allowedTools "Read,Grep,Glob" \
  --strict-mcp-config \
  --settings '{"disableAllHooks": true}' \
  --max-turns 15 \
  --output-format json \
  --json-schema "$SCHEMA" > claude-review.json

node -e '
  const r = JSON.parse(require("fs").readFileSync("claude-review.json", "utf8"));
  const out = r.structured_output ?? {};
  console.log(`Verdict: ${out.verdict}`);
  for (const f of out.findings ?? []) console.log(`- [${f.severity}] ${f.file}:${f.line ?? "?"} ${f.issue}`);
  if (out.verdict === "needs-another-pass") process.exitCode = 1;
'

# Optional: post the summary as a pull request comment (Bitbucket Cloud REST API).
# curl -s -X POST -u "$BB_USER:$BB_APP_PASSWORD" \
#   -H "Content-Type: application/json" \
#   "https://api.bitbucket.org/2.0/repositories/$BITBUCKET_REPO_FULL_NAME/pullrequests/$BITBUCKET_PR_ID/comments" \
#   -d "$(node -e 'const r=require("./claude-review.json").structured_output;console.log(JSON.stringify({content:{raw:"AI review: "+r.verdict+"\n"+r.findings.map(f=>"- ["+f.severity+"] "+f.file+": "+f.issue).join("\n")}}))')"
