#!/usr/bin/env bash
# 📘 See tokens and prompt caching with your own eyes (Act 1 exercise).
#
# Runs the same read-only question twice in headless mode (`claude -p`) and prints the token usage
# of each run. Things to look for:
#   - input_tokens: new, uncached input processed on this run
#   - cache_creation_input_tokens: input written to the cache (the first time a prefix is seen)
#   - cache_read_input_tokens: input read FROM the cache. Run 2 should show a big number here:
#     the system prompt, tools and CLAUDE.md are the same prefix, so they are not reprocessed.
#   - output_tokens: what Claude wrote (answer, tool calls, thinking)
#   - total_cost_usd: a client-side estimate
# Requires: the claude CLI, logged in. Each run costs a few cents.
#
# The flags keep the two runs comparable: --tools limits Claude to read-only tools,
# --strict-mcp-config skips MCP servers, and disableAllHooks keeps the repo's hooks from adding
# extra context or turns in the middle of a measurement.

set -euo pipefail
cd "$(dirname "$0")/.."

QUESTION="In two sentences: where is the waitlist confirmation text built, and where does the plan name in it come from?"

for run in 1 2; do
  echo "=== Run $run"
  claude -p "$QUESTION" --output-format json \
    --tools "Read,Grep,Glob" --allowedTools "Read,Grep,Glob" \
    --strict-mcp-config --settings '{"disableAllHooks": true}' |
    node -e '
      let s = "";
      process.stdin.on("data", (d) => (s += d)).on("end", () => {
        const r = JSON.parse(s);
        const u = r.usage ?? {};
        console.log("answer:", String(r.result ?? "").trim());
        console.table({
          input_tokens: u.input_tokens,
          cache_creation_input_tokens: u.cache_creation_input_tokens,
          cache_read_input_tokens: u.cache_read_input_tokens,
          output_tokens: u.output_tokens,
          turns: r.num_turns,
          total_cost_usd: r.total_cost_usd,
        });
      });'
done
