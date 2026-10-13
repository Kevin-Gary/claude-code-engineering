// 📘 Tests for the SCHEDULE side of the automation setup: the files that decide WHEN a committed skill
// runs, and with what limits.
//   - .claude/loop.md: what a bare `/loop` does (Claude Code cuts anything past 25,000 bytes)
//   - the GitHub Actions example: a committed cron line that runs /morning-health
//   - ci-examples/bitbucket-pipelines.yml: the `custom: nightly-health` pipeline
//   - scripts/ci/morning-health.sh: the headless run that pipeline starts, and its limits
// The script test RUNS morning-health.sh with a fake `claude` first on PATH. The fake records the
// arguments and prints a canned JSON answer, so the test proves what the script would ask for and
// how it handles the answer, without an API key, a network call or any cost.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, test } from "node:test";
import { WRITE_TOOLS, bashRuleMatches, parseRule, readYaml, repoPath, toolList } from "./helpers.mjs";

const NEEDS_BASH = process.platform === "win32" && "these tests run a bash script (POSIX shell)";
const MORNING_HEALTH = repoPath("scripts/ci/morning-health.sh");

describe(".claude/loop.md", () => {
  test("exists, has instructions, and is under the 25,000-byte cut-off", () => {
    const size = statSync(repoPath(".claude/loop.md")).size;
    assert.ok(size > 0);
    assert.ok(size < 25_000, `loop.md is ${size} bytes; Claude Code drops everything past 25,000`);
  });
});

describe("the GitHub Actions schedule example", () => {
  const file = "docs/automation/schedules/1-schedule-in-the-repo/morning-health.github-actions.yml";
  const workflow = readYaml(file);

  test("parses as YAML and has a five-field cron line", () => {
    const cron = workflow?.on?.schedule?.[0]?.cron;
    assert.equal(typeof cron, "string", "expected on.schedule[0].cron");
    assert.equal(cron.trim().split(/\s+/).length, 5, `"${cron}" is not a five-field cron expression`);
  });

  test("runs the committed /morning-health skill through the Claude Code action", () => {
    const steps = Object.values(workflow.jobs ?? {}).flatMap((job) => job.steps ?? []);
    const claude = steps.find((step) => String(step.uses ?? "").startsWith("anthropics/claude-code-action@"));
    assert.ok(claude, "no anthropics/claude-code-action step");
    assert.equal(claude.with?.prompt, "/morning-health");
    assert.ok(existsSync(repoPath(".claude/skills/morning-health/SKILL.md")));
    const install = steps.findIndex((s) => s.run === "npm ci");
    assert.ok(install >= 0 && install < steps.indexOf(claude), "install dependencies before the run");
  });
});

describe("the Bitbucket custom: nightly-health pipeline", () => {
  const pipelines = readYaml("ci-examples/bitbucket-pipelines.yml");
  const step = pipelines?.pipelines?.custom?.["nightly-health"]?.[0]?.step;

  test("exists as a custom pipeline (so it only runs on a schedule or by hand, never on a push)", () => {
    assert.ok(step, "expected pipelines.custom.nightly-health[0].step");
  });

  test("installs dependencies, then runs scripts/ci/morning-health.sh, and keeps reports/ as an artifact", () => {
    const script = step.script ?? [];
    const install = script.indexOf("npm ci");
    const run = script.indexOf("bash scripts/ci/morning-health.sh");
    assert.ok(install >= 0, "npm ci is missing");
    assert.ok(run > install, "the run must come after npm ci");
    assert.ok(existsSync(MORNING_HEALTH));
    assert.ok((step.artifacts ?? []).includes("reports/**"));
  });
});

describe("scripts/ci/morning-health.sh", { skip: NEEDS_BASH }, () => {
  let sandbox;
  let stubBin;

  before(() => {
    sandbox = realpathSync(mkdtempSync(path.join(tmpdir(), "verdant-morning-")));
    stubBin = path.join(sandbox, "bin");
    mkdirSync(stubBin);
    // A fake claude: one argument per line into STUB_CLAUDE_ARGS, then the canned answer and exit code.
    writeFileSync(
      path.join(stubBin, "claude"),
      [
        "#!/usr/bin/env bash",
        "printf '%s\\n' \"$@\" > \"$STUB_CLAUDE_ARGS\"",
        'if [ -n "${STUB_CLAUDE_OUTPUT:-}" ]; then printf \'%s\' "$STUB_CLAUDE_OUTPUT"; fi',
        'exit "${STUB_CLAUDE_EXIT:-0}"',
        "",
      ].join("\n"),
      { mode: 0o755 },
    );
  });

  after(() => rmSync(sandbox, { recursive: true, force: true }));

  let counter = 0;
  /** Runs the real script in a fresh folder (it writes reports/ relative to where it runs). */
  function runScript({ output = "", exit = 0 } = {}) {
    const cwd = path.join(sandbox, `run-${++counter}`);
    mkdirSync(cwd);
    const argsFile = path.join(cwd, "claude-args.txt");
    const result = spawnSync("bash", [MORNING_HEALTH], {
      cwd,
      encoding: "utf8",
      env: {
        PATH: [stubBin, path.dirname(process.execPath), process.env.PATH].join(path.delimiter),
        HOME: sandbox,
        STUB_CLAUDE_ARGS: argsFile,
        STUB_CLAUDE_OUTPUT: output,
        STUB_CLAUDE_EXIT: String(exit),
      },
    });
    const args = readFileSync(argsFile, "utf8").replace(/\n$/, "").split("\n");
    const flag = (name) => {
      const at = args.indexOf(name);
      return at === -1 ? undefined : args[at + 1];
    };
    return { ...result, cwd, args, flag };
  }

  test("is valid bash", () => {
    const result = spawnSync("bash", ["-n", MORNING_HEALTH], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
  });

  test("asks claude to run /morning-health headless, never waiting for a human, with a turn limit", () => {
    const { args, flag } = runScript({ output: '{"result":"ok"}' });
    assert.deepEqual(args.slice(0, 2), ["-p", "/morning-health"]);
    assert.equal(flag("--permission-mode"), "dontAsk");
    assert.ok(Number.parseInt(flag("--max-turns"), 10) > 0);
    assert.equal(flag("--output-format"), "json");
  });

  test("gives the run no Edit tool, no MCP servers and no repo hooks", () => {
    const { args, flag } = runScript({ output: '{"result":"ok"}' });
    assert.ok(!toolList(flag("--tools")).includes("Edit"), "the header promises no Edit");
    assert.ok(args.includes("--strict-mcp-config"));
    assert.equal(JSON.parse(flag("--settings")).disableAllHooks, true);
  });

  test("pre-approves writes only under reports/, and never git push or git commit", () => {
    const { flag } = runScript({ output: '{"result":"ok"}' });
    const allowed = toolList(flag("--allowedTools"));
    for (const { tool, spec } of allowed.map(parseRule).filter((r) => WRITE_TOOLS.includes(r.tool))) {
      assert.ok(spec?.startsWith("reports/"), `${tool}(${spec}) writes outside reports/`);
    }
    for (const command of ["git push origin main", "git commit -m wip"]) {
      assert.equal(allowed.find((rule) => bashRuleMatches(rule, command)), undefined, `\`${command}\` is pre-approved`);
    }
  });

  test("denies git push, git commit and installs outright (deny rules beat the repo's allow rules)", () => {
    const { flag } = runScript({ output: '{"result":"ok"}' });
    const denied = toolList(flag("--disallowedTools"));
    for (const command of ["git push origin main", "git commit -m wip", "git add .", "npm install left-pad", "npm ci"]) {
      assert.ok(denied.some((rule) => bashRuleMatches(rule, command)), `\`${command}\` is not denied`);
    }
  });

  test("prints the skill's summary into the CI log and keeps the full JSON in reports/", () => {
    const run = runScript({ output: '{"result":"Checks: PASS\\nCommits: 2 on origin/main"}' });
    assert.equal(run.status, 0, run.stderr);
    assert.equal(run.stdout, "Checks: PASS\nCommits: 2 on origin/main\n");
    assert.ok(existsSync(path.join(run.cwd, "reports", "morning-health-run.json")));
  });

  test("when claude stops early (non-zero exit) it still prints what came back, then fails with that code", () => {
    const run = runScript({ output: '{"result":"partial: hit --max-turns"}', exit: 3 });
    assert.equal(run.status, 3);
    assert.equal(run.stdout, "partial: hit --max-turns\n");
  });

  test("when claude returns nothing it says where to look, and fails", () => {
    const run = runScript({ output: "", exit: 1 });
    assert.equal(run.status, 1);
    assert.equal(run.stdout, "(no result: see reports/morning-health-run.json)\n");
  });
});
