// 📘 Tests for the subagents in .claude/agents. Two of them carry a promise that lives entirely in
// frontmatter, so one careless edit breaks it with no error anywhere:
//   - verifier is READ-ONLY because `tools: Read, Grep, Glob` says so. Add Bash, or add `memory`
//     (which quietly turns on Read, Write and Edit), and the skeptic can now change what it judges.
//   - implementer is SAFE TO RUN IN PARALLEL because `isolation: worktree` gives each copy its own
//     checkout, and `maxTurns` bounds a run that goes wrong.
// The .md files without frontmatter (ORCHESTRATION.md, PRIMER.md) are documentation that sits
// beside the agents. Claude Code skips them only as long as they stay that way.

import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { describe, test } from "node:test";
import { readFrontmatter, repoPath, toolList } from "./helpers.mjs";

const agentFiles = readdirSync(repoPath(".claude/agents")).filter((f) => f.endsWith(".md")).sort();
const agent = (name) => readFrontmatter(`.claude/agents/${name}.md`);

describe("every agent definition is well formed", () => {
  for (const file of agentFiles) {
    const { hasFrontmatter, data } = readFrontmatter(`.claude/agents/${file}`);
    if (!hasFrontmatter) continue; // documentation, checked below
    test(`${file}: name matches the file, description present`, () => {
      assert.equal(data.name, file.replace(/\.md$/, ""));
      assert.equal(typeof data.description, "string");
      assert.ok(data.description.trim());
    });
  }
});

describe("documentation beside the agents is not mistaken for an agent", () => {
  for (const doc of ["ORCHESTRATION.md", "PRIMER.md"]) {
    test(`${doc} has no frontmatter name`, () => {
      const { data } = readFrontmatter(`.claude/agents/${doc}`);
      assert.equal(data.name, undefined, `${doc} would load as an agent named "${data.name}"`);
    });
  }
});

describe("verifier stays read-only", () => {
  const { data } = agent("verifier");

  test("its tools are exactly Read, Grep and Glob", () => {
    assert.deepEqual(toolList(data.tools).sort(), ["Glob", "Grep", "Read"]);
  });

  test("it has no memory (memory turns on Write and Edit)", () => {
    assert.equal(data.memory, undefined);
  });
});

describe("implementer works in its own worktree, with a turn limit", () => {
  const { data } = agent("implementer");

  test("isolation is worktree", () => {
    assert.equal(data.isolation, "worktree");
  });

  test("maxTurns is a positive whole number", () => {
    assert.ok(Number.isInteger(data.maxTurns) && data.maxTurns > 0, `maxTurns is ${JSON.stringify(data.maxTurns)}`);
  });
});
