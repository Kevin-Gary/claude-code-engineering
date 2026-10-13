// 📘 Tests for the cloud SessionStart hook (scripts/cloud/session-start.sh) and its registration in
// .claude/settings.json. The hook runs on EVERY session start, on laptops too, so the two things
// that matter most are: it does nothing locally, and it never fails a session (always exit 0).
//
// These tests RUN the real script in a temporary folder. A fake `npm` sits first on PATH and writes
// down how it was called, so no test ever runs a real `npm ci` or touches this repo's node_modules.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, test } from "node:test";
import { repoPath } from "./helpers.mjs";

const HOOK = repoPath("scripts/cloud/session-start.sh");
const NEEDS_BASH = process.platform === "win32" && "these tests run a bash script (POSIX shell)";

describe("settings.json registers the cloud SessionStart hook", () => {
  const settings = JSON.parse(readFileSync(repoPath(".claude/settings.json"), "utf8"));
  const sessionStart = settings.hooks?.SessionStart ?? [];

  test("one SessionStart entry runs scripts/cloud/session-start.sh on startup and resume, with a 600s timeout", () => {
    const entries = sessionStart.filter((entry) =>
      (entry.hooks ?? []).some((hook) => hook.command?.includes("scripts/cloud/session-start.sh")),
    );
    assert.equal(entries.length, 1, "expected exactly one SessionStart entry for the cloud hook");
    const [entry] = entries;
    assert.equal(entry.matcher, "startup|resume");
    const hook = entry.hooks.find((h) => h.command.includes("scripts/cloud/session-start.sh"));
    assert.equal(hook.type, "command");
    assert.equal(hook.timeout, 600, "npm ci on a cold VM needs the long timeout");
    assert.match(hook.command, /"\$CLAUDE_PROJECT_DIR\/scripts\/cloud\/session-start\.sh"/);
  });

  test("the matcher fires on startup and resume, not on compact or clear", () => {
    const entry = sessionStart.find((e) => (e.hooks ?? []).some((h) => h.command?.includes("session-start.sh")));
    const matcher = new RegExp(`^(?:${entry.matcher})$`);
    assert.ok(matcher.test("startup"));
    assert.ok(matcher.test("resume"));
    assert.ok(!matcher.test("compact"));
    assert.ok(!matcher.test("clear"));
  });

  test("every hook script that settings.json points at exists in the repo", () => {
    const commands = Object.values(settings.hooks ?? {})
      .flat()
      .flatMap((entry) => entry.hooks ?? [])
      .map((hook) => hook.command ?? "");
    const scripts = commands.flatMap((command) =>
      [...command.matchAll(/\$CLAUDE_PROJECT_DIR\/([^"'\s;]+\.(?:sh|mjs|cjs|js))/g)].map((m) => m[1]),
    );
    assert.ok(scripts.includes("scripts/cloud/session-start.sh"));
    for (const script of scripts) assert.ok(existsSync(repoPath(script)), `missing hook script: ${script}`);
  });

  test("the hook script is valid bash", { skip: NEEDS_BASH }, () => {
    const result = spawnSync("bash", ["-n", HOOK], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
  });

  test("the first command in the script is the CLAUDE_CODE_REMOTE guard, before any cd or npm", () => {
    const lines = readFileSync(HOOK, "utf8").split("\n").filter((l) => l.trim() && !l.trim().startsWith("#"));
    assert.match(lines[0], /^if \[ "\$CLAUDE_CODE_REMOTE" != "true" \]; then$/);
  });
});

describe("scripts/cloud/session-start.sh behavior", { skip: NEEDS_BASH }, () => {
  let sandbox;
  let stubBin;
  const SHARED_LOG = "/tmp/verdant-npm-ci.log"; // the script logs npm output here (hardcoded)
  let savedLog = null;

  before(() => {
    sandbox = realpathSync(mkdtempSync(path.join(tmpdir(), "verdant-hook-")));
    stubBin = path.join(sandbox, "bin");
    mkdirSync(stubBin);
    // A fake npm: records the folder it ran in and its arguments, then exits with STUB_NPM_EXIT.
    writeFileSync(
      path.join(stubBin, "npm"),
      '#!/usr/bin/env bash\nprintf \'%s\\n\' "$PWD" "$@" > "$STUB_NPM_LOG"\nexit "${STUB_NPM_EXIT:-0}"\n',
      { mode: 0o755 },
    );
    // Two cases below let the fake npm "install", which makes the script write SHARED_LOG.
    // Keep whatever a real cloud run left there and put it back afterwards.
    if (existsSync(SHARED_LOG)) savedLog = readFileSync(SHARED_LOG);
  });

  after(() => {
    rmSync(sandbox, { recursive: true, force: true });
    if (savedLog !== null) writeFileSync(SHARED_LOG, savedLog);
    else rmSync(SHARED_LOG, { force: true });
  });

  let counter = 0;
  /** A fresh fake project folder with a package.json (and node_modules when asked). */
  function makeProject({ withNodeModules = false } = {}) {
    counter += 1;
    const dir = path.join(sandbox, `project-${counter}`);
    mkdirSync(dir);
    writeFileSync(path.join(dir, "package.json"), '{ "name": "fake", "private": true }\n');
    if (withNodeModules) mkdirSync(path.join(dir, "node_modules"));
    return dir;
  }

  /** Runs a copy of the hook with a clean environment: only what each test passes in. */
  function runHook({ script = HOOK, env = {}, cwd = sandbox } = {}) {
    const npmLog = path.join(sandbox, `npm-calls-${++counter}.txt`);
    const result = spawnSync("bash", [script], {
      cwd,
      encoding: "utf8",
      env: {
        PATH: [stubBin, path.dirname(process.execPath), process.env.PATH].join(path.delimiter),
        HOME: sandbox,
        STUB_NPM_LOG: npmLog,
        ...env,
      },
    });
    const npmCall = existsSync(npmLog) ? readFileSync(npmLog, "utf8").trim().split("\n") : null;
    return { status: result.status, stdout: result.stdout, stderr: result.stderr, npmCall };
  }

  for (const value of [undefined, "", "false"]) {
    const label = value === undefined ? "unset" : JSON.stringify(value);
    test(`locally (CLAUDE_CODE_REMOTE ${label}) it exits 0, prints nothing and installs nothing`, () => {
      const project = makeProject();
      const env = { CLAUDE_PROJECT_DIR: project };
      if (value !== undefined) env.CLAUDE_CODE_REMOTE = value;
      const run = runHook({ env });
      assert.equal(run.status, 0);
      assert.equal(run.stdout, "");
      assert.equal(run.npmCall, null, "npm must not run outside a cloud session");
      assert.ok(!existsSync(path.join(project, "node_modules")));
    });
  }

  test("in the cloud with node_modules already there it exits 0, prints the skip line and runs no npm", () => {
    const project = makeProject({ withNodeModules: true });
    const run = runHook({ env: { CLAUDE_CODE_REMOTE: "true", CLAUDE_PROJECT_DIR: project } });
    assert.equal(run.status, 0);
    assert.equal(
      run.stdout,
      "Cloud session: node_modules already present (cached or resumed), skipped npm ci.\n",
      "SessionStart stdout becomes Claude's context, so it must be exactly one line",
    );
    assert.equal(run.npmCall, null);
  });

  test("without CLAUDE_PROJECT_DIR it falls back to the folder two levels above the script", () => {
    const repo = makeProject({ withNodeModules: true });
    mkdirSync(path.join(repo, "scripts", "cloud"), { recursive: true });
    const copy = path.join(repo, "scripts", "cloud", "session-start.sh");
    copyFileSync(HOOK, copy);
    // Run from somewhere else entirely, so only the fallback can find the project.
    const run = runHook({ script: copy, env: { CLAUDE_CODE_REMOTE: "true" }, cwd: stubBin });
    assert.equal(run.status, 0);
    assert.match(run.stdout, /skipped npm ci/);
    assert.equal(run.npmCall, null);
  });

  test("if CLAUDE_PROJECT_DIR does not exist it still exits 0 and runs no npm", () => {
    const run = runHook({
      env: { CLAUDE_CODE_REMOTE: "true", CLAUDE_PROJECT_DIR: path.join(sandbox, "no-such-project") },
    });
    assert.equal(run.status, 0);
    assert.equal(run.npmCall, null);
  });

  test("in a fresh cloud clone it runs `npm ci --no-audit --no-fund` in the project and reports success", () => {
    const project = makeProject();
    const run = runHook({ env: { CLAUDE_CODE_REMOTE: "true", CLAUDE_PROJECT_DIR: project, STUB_NPM_EXIT: "0" } });
    assert.equal(run.status, 0);
    assert.deepEqual(run.npmCall, [project, "ci", "--no-audit", "--no-fund"]);
    assert.equal(run.stdout, "Cloud session: installed dependencies with npm ci. npm run check is ready to run.\n");
  });

  test("when npm ci fails it still exits 0, so the session starts, and says how to recover", () => {
    const project = makeProject();
    const run = runHook({ env: { CLAUDE_CODE_REMOTE: "true", CLAUDE_PROJECT_DIR: project, STUB_NPM_EXIT: "1" } });
    assert.equal(run.status, 0, "a failed install must never stop the session from starting");
    assert.match(run.stdout, /^Cloud session: npm ci failed \(log: \/tmp\/verdant-npm-ci\.log\)\. Run npm ci before npm run check\.\n$/);
  });
});
