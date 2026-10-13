// 📘 Shared helpers for the REPO SETUP tests (`npm run test:setup`). Those tests guard the Claude Code
// setup itself (.claude/, scripts/, ci-examples/, docs/automation/), which no other test covers:
// Vitest only looks inside app/, and Playwright only drives the site.
//
// Why Node's built-in test runner (`node --test`) and not Vitest? These files check YAML, Markdown,
// shell scripts and workflow scripts at the repo root, not app code, so they need no bundler and
// no new dependency. The two parsers used here are already installed with ESLint:
//   - js-yaml (via @eslint/eslintrc) reads frontmatter and CI YAML
//   - acorn   (via espree)           reads the workflow scripts as an AST
// If either goes missing after a dependency change, the error below says so in plain words.
// Any stack: the same idea works with pytest + PyYAML, or a Go test reading the same files.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Absolute path of the repository root (two levels above this file). */
export const ROOT = fileURLToPath(new URL("../..", import.meta.url));

/** Absolute path for a repo-relative path. */
export const repoPath = (...parts) => path.join(ROOT, ...parts);

async function loadInstalled(name) {
  try {
    return await import(name);
  } catch {
    throw new Error(
      `${name} is not installed. It arrives with ESLint (npm ci at the repo root). ` +
        `If ESLint stopped depending on it, add it to the root devDependencies.`,
    );
  }
}

export const yaml = (await loadInstalled("js-yaml")).default;
export const acorn = await loadInstalled("acorn");

/**
 * Reads the YAML frontmatter at the top of a Markdown file (skills, agents).
 * Returns { hasFrontmatter: false } for plain Markdown, and throws with the file name when the
 * YAML does not parse, because Claude Code would fail to read the same block.
 */
export function readFrontmatter(relPath) {
  const text = readFileSync(repoPath(relPath), "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { hasFrontmatter: false, data: {}, body: text };
  let data;
  try {
    data = yaml.load(match[1]);
  } catch (error) {
    throw new Error(`${relPath}: frontmatter is not valid YAML: ${error.message.split("\n")[0]}`);
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`${relPath}: frontmatter must be a YAML mapping (key: value lines)`);
  }
  return { hasFrontmatter: true, data, body: text.slice(match[0].length) };
}

/** Reads and parses a YAML file, with the file name in any error. */
export function readYaml(relPath) {
  try {
    return yaml.load(readFileSync(repoPath(relPath), "utf8"));
  } catch (error) {
    throw new Error(`${relPath}: not valid YAML: ${error.message.split("\n")[0]}`);
  }
}

/** Claude Code reads frontmatter booleans as true for true, yes, on and 1, in any letter case. */
export function isTruthyFlag(value) {
  return ["true", "yes", "on", "1"].includes(String(value).trim().toLowerCase());
}

/**
 * Splits a tool list the way Claude Code accepts it: a YAML list, or a string separated by spaces
 * or commas. Separators inside parentheses stay put, so "Bash(npm run check)" is ONE entry.
 */
export function toolList(value) {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.map((entry) => String(entry).trim()).filter(Boolean);
  const entries = [];
  let current = "";
  let depth = 0;
  for (const ch of String(value)) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (depth === 0 && (ch === "," || /\s/.test(ch))) {
      if (current) entries.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current) entries.push(current);
  return entries;
}

/** "Bash(git log *)" -> { tool: "Bash", spec: "git log *" }; "Read" -> { tool: "Read", spec: undefined }. */
export function parseRule(rule) {
  const match = String(rule).match(/^([A-Za-z_][\w-]*)(?:\((.*)\))?$/s);
  if (!match) return { tool: String(rule), spec: undefined };
  return { tool: match[1], spec: match[2] };
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Would this permission rule pre-approve this shell command?
 * `*` matches anything, and a trailing " *" (or the older ":*") also matches the bare command,
 * so "Bash(npm ci *)" covers "npm ci". (Claude Code allows the bare match only when that trailing
 * `*` is the rule's only wildcard; this helper always allows it.) So it errs on the side of saying
 * "yes, it matches", the safe direction for the checks that use it: a rule must NEVER cover X.
 */
export function bashRuleMatches(rule, command) {
  const { tool, spec } = parseRule(rule);
  if (tool !== "Bash") return false;
  if (spec === undefined || spec.trim() === "*") return true;
  let pattern = spec.trim();
  let tail = "";
  if (pattern.endsWith(":*") || pattern.endsWith(" *")) {
    pattern = pattern.slice(0, -2);
    tail = "(?: .*)?";
  }
  const body = pattern.split("*").map(escapeRegExp).join(".*");
  return new RegExp(`^${body}${tail}$`, "s").test(command.trim());
}

/** Tools that write files. A rule naming one of these, scoped or not, grants writes. */
export const WRITE_TOOLS = ["Edit", "Write", "MultiEdit", "NotebookEdit"];

/** The skill folders under .claude/skills (each holds a SKILL.md). */
export function skillNames() {
  return listDir(".claude/skills").filter((name) => existsSync(repoPath(".claude/skills", name, "SKILL.md")));
}

/** The agent definition names under .claude/agents (files with frontmatter only). */
export function agentNames() {
  return listDir(".claude/agents")
    .filter((file) => file.endsWith(".md"))
    .filter((file) => readFrontmatter(`.claude/agents/${file}`).hasFrontmatter)
    .map((file) => file.replace(/\.md$/, ""));
}

function listDir(relPath) {
  return readdirSync(repoPath(relPath)).sort();
}
