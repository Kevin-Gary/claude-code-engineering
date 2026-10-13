// 📘 Tests for the skills in .claude/skills, with extra rules for the SCHEDULABLE ones: the skills a
// Desktop scheduled task, a cloud routine, `/loop` or a CI schedule runs by name (`/morning-health`).
// A scheduled run has nobody watching, so a frontmatter mistake fails silently at 9 AM:
//   - `disable-model-invocation: true` makes the scheduler's `/name` arrive as plain text
//   - without `disallowed-tools: AskUserQuestion` the run can stop and wait for an answer forever
//   - a report-only skill that pre-approves broad writes or `git push` is no longer report-only
// These are the same checks a reviewer would do by eye, written down so they run every time.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { describe, test } from "node:test";
import { ROOT, WRITE_TOOLS, bashRuleMatches, isTruthyFlag, parseRule, readFrontmatter, skillNames, toolList } from "./helpers.mjs";

/** Skills a schedule runs by name. Each must stay invocable by Claude and never stop to ask. */
const SCHEDULED = ["morning-health", "dependency-audit", "bug-hunter", "nightly-check", "pr-check"];

/** Scheduled skills that only write a report. Their guard rails say: change nothing else. */
const REPORT_ONLY = ["morning-health", "dependency-audit", "nightly-check"];

/** Commands no report-only skill may pre-approve, with the guard rail each one would break. */
const NEVER_PREAPPROVED = {
  "git push origin main": "pushes",
  "git push": "pushes",
  "git commit -m wip": "commits",
  "git commit": "commits",
  "npm install left-pad": "changes package files",
  "npm update": "changes package files",
  "npm audit fix": "changes package files",
};

/** Listing cap from the docs: description + when_to_use beyond this is cut from the skill list. */
const LISTING_CAP = 1536;

const skill = (name) => readFrontmatter(`.claude/skills/${name}/SKILL.md`);

describe("the permission-rule matcher these tests rely on", () => {
  // If this helper were wrong, every "must never pre-approve" check below would pass for nothing.
  test("a broad rule covers the commands it should", () => {
    assert.ok(bashRuleMatches("Bash", "git push origin main"));
    assert.ok(bashRuleMatches("Bash(*)", "npm audit fix"));
    assert.ok(bashRuleMatches("Bash(git push *)", "git push origin main"));
    assert.ok(bashRuleMatches("Bash(npm ci *)", "npm ci"), "a trailing ' *' also covers the bare command");
    assert.ok(bashRuleMatches("Bash(npm audit *)", "npm audit fix"));
    assert.ok(bashRuleMatches("Bash(git:*)", "git commit -m x"));
  });

  test("a narrow rule does not, which is why dependency-audit uses `npm audit --json *`", () => {
    assert.ok(!bashRuleMatches("Bash(npm audit --json *)", "npm audit fix"));
    assert.ok(!bashRuleMatches("Bash(git log *)", "git push"));
    assert.ok(!bashRuleMatches("Bash(npm run check)", "npm run check && git push"));
    assert.ok(!bashRuleMatches("Edit(reports/**)", "git push"));
  });

  test("tool lists split on spaces and commas, but never inside parentheses", () => {
    assert.deepEqual(toolList("Bash(npm run check) Read, Edit(reports/**)"), ["Bash(npm run check)", "Read", "Edit(reports/**)"]);
    assert.deepEqual(toolList(["Read", "Bash(git log *)"]), ["Read", "Bash(git log *)"]);
    assert.deepEqual(toolList(undefined), []);
  });
});

describe("every skill has frontmatter Claude Code can read", () => {
  for (const name of skillNames()) {
    test(`${name}: frontmatter parses, has a description, and any name matches the folder`, () => {
      const { hasFrontmatter, data } = skill(name);
      assert.ok(hasFrontmatter, `${name}/SKILL.md has no frontmatter block`);
      assert.equal(typeof data.description, "string");
      assert.ok(data.description.trim(), `${name}: empty description`);
      if (data.name !== undefined) assert.equal(data.name, name, "name must match the folder name");
      const listing = `${data.description} ${data.when_to_use ?? ""}`;
      assert.ok(listing.length <= LISTING_CAP, `${name}: description + when_to_use is ${listing.length} chars (cap ${LISTING_CAP})`);
    });
  }
});

describe("schedulable skills can run unattended", () => {
  for (const name of SCHEDULED) {
    describe(name, () => {
      const { data } = skill(name);

      test("declares a name that matches its folder", () => {
        assert.equal(data.name, name);
      });

      test("stays invocable by Claude (no disable-model-invocation), so a scheduled `/name` runs it", () => {
        assert.ok(!isTruthyFlag(data["disable-model-invocation"]), "a scheduled fire cannot run this skill");
      });

      test("stays invocable by name (user-invocable is not false)", () => {
        const value = String(data["user-invocable"] ?? "true").trim().toLowerCase();
        assert.ok(!["false", "no", "off", "0"].includes(value), "a scheduled `/name` prompt would not run it");
      });

      test("removes AskUserQuestion, so it never stops to wait for an answer", () => {
        assert.ok(toolList(data["disallowed-tools"]).includes("AskUserQuestion"));
      });
    });
  }
});

describe("report-only skills write the report and nothing else", () => {
  for (const name of REPORT_ONLY) {
    describe(name, () => {
      const allowed = toolList(skill(name).data["allowed-tools"]);

      test("pre-approves no unscoped write tool and no bare Bash", () => {
        for (const rule of allowed) {
          const { tool, spec } = parseRule(rule);
          if (WRITE_TOOLS.includes(tool) || tool === "Bash") {
            assert.ok(spec !== undefined && spec.trim() !== "*", `"${rule}" grants everything`);
          }
        }
      });

      test("every write it pre-approves is under reports/", () => {
        const writes = allowed.map(parseRule).filter((r) => WRITE_TOOLS.includes(r.tool));
        assert.ok(writes.length > 0, "a report-only skill should pre-approve writing its report");
        for (const { tool, spec } of writes) {
          assert.ok(spec.startsWith("reports/"), `${tool}(${spec}) writes outside reports/`);
        }
      });

      test("pre-approves no git push, git commit, or package changes", () => {
        for (const [command, why] of Object.entries(NEVER_PREAPPROVED)) {
          const culprit = allowed.find((rule) => bashRuleMatches(rule, command));
          assert.equal(culprit, undefined, `"${culprit}" would pre-approve \`${command}\` (${why})`);
        }
      });

      test("names its report file under reports/", () => {
        const body = skill(name).body;
        assert.match(body, /reports\/[\w-]+-<date>\.md/);
      });
    });
  }

  test("dependency-audit does not pre-approve npm ci either (its guard rails forbid installs)", () => {
    const allowed = toolList(skill("dependency-audit").data["allowed-tools"]);
    assert.equal(allowed.find((rule) => bashRuleMatches(rule, "npm ci")), undefined);
  });

  test("reports/ is gitignored, so scheduled reports never end up in a commit", () => {
    const result = spawnSync("git", ["check-ignore", "--quiet", "reports/morning-health-2026-10-12.md"], { cwd: ROOT });
    assert.equal(result.status, 0, "add reports/ to .gitignore");
  });
});
