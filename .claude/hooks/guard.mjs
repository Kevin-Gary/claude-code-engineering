#!/usr/bin/env node
// 📘 PreToolUse GUARD hook. Claude Code runs this BEFORE every Bash, Edit and Write call (see the
// "PreToolUse" entry in .claude/settings.json). It reads the planned tool call as JSON on stdin and
// can stop it, ask you first, or stay silent and let the normal permission rules decide.
//
// It shows the three ways a hook can answer:
//   1. exit 2 + a message on stderr  -> the call is BLOCKED and Claude reads the message as the reason.
//   2. JSON permissionDecision "deny" -> also blocked, with a reason, but the hook itself exits 0.
//   3. JSON permissionDecision "ask"  -> you get a permission prompt, even in a permissive mode.
//   (4. print nothing and exit 0     -> no opinion; settings.json allow/ask/deny rules apply.)
//
// Why a hook AND permission rules? Rules match strings: "Bash(rm -rf *)" does not match "rm -r -f".
// A hook is code, so it can parse. Use rules for the simple cases and a hook for the slippery ones.
// It is written in Node (not bash + jq) so it runs the same on macOS, Linux and Windows.
// Any stack: the hook is language-agnostic. Swap the patterns for your own dangerous commands.

import { readFileSync } from "node:fs";
import path from "node:path";

const input = JSON.parse(readFileSync(0, "utf8"));
const tool = input.tool_name;
const args = input.tool_input ?? {};
const projectDir = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd();

// --- Bash: block dangerous commands with exit 2 ------------------------------------------------
const DANGEROUS_BASH = [
  {
    pattern: /\brm\s+(-[a-z]*r[a-z]*\s+-[a-z]*f|-[a-z]*f[a-z]*\s+-[a-z]*r|-[a-z]*(rf|fr)[a-z]*)\s+(\/|~|\.|\.\.|\*|\$HOME)(\/)?(\s|$)/i,
    reason: "Recursive force-delete of /, ~, ., .. or * is blocked. Delete the specific folder by name instead.",
  },
  {
    pattern: /\bgit\s+push\b.*\s(--force\b|--force-with-lease\b|-f\b)/,
    reason: "Force-pushing is blocked. Push normally, or ask a human to force-push if history really must change.",
  },
  {
    pattern: /\bgit\s+reset\s+--hard\b/,
    reason: "git reset --hard throws away uncommitted work. Use `git stash` or commit first.",
  },
  {
    pattern: /\b(curl|wget)\b[^|]*\|\s*(sudo\s+)?(sh|bash|zsh)\b/,
    reason: "Piping a download straight into a shell is blocked. Download it, read it, then run it.",
  },
  {
    pattern: /(^|[\s"'=/])\.env(?!\.example)(\.[\w-]+)?\b/,
    reason: "Commands that touch .env files are blocked. Secrets stay out of the session; use .env.example.",
  },
];

if (tool === "Bash") {
  const command = String(args.command ?? "");
  for (const { pattern, reason } of DANGEROUS_BASH) {
    if (pattern.test(command)) {
      process.stderr.write(`Blocked by .claude/hooks/guard.mjs: ${reason}\n`);
      process.exit(2);
    }
  }
  process.exit(0);
}

// --- Edit / Write: deny protected paths, ask on sensitive ones (JSON output) ------------------
if (tool === "Edit" || tool === "Write") {
  const filePath = String(args.file_path ?? "");
  const relative = path.relative(projectDir, path.resolve(projectDir, filePath)).split(path.sep).join("/");
  const base = path.basename(relative);

  const decide = (permissionDecision, permissionDecisionReason) => {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision, permissionDecisionReason },
      }),
    );
    process.exit(0);
  };

  if (base.startsWith(".env") && base !== ".env.example") {
    decide("deny", "Writing to .env files is blocked. Add the variable name to .env.example and tell the human.");
  }
  if (base === "package-lock.json") {
    decide("ask", "This edits the lockfile by hand. Dependency changes usually belong in npm install. Allow it?");
  }
  if (relative.startsWith(".github/workflows/")) {
    decide("ask", "This changes a CI workflow that runs with repository secrets. Review before allowing.");
  }
}

process.exit(0);
