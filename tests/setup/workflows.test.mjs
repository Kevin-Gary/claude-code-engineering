// 📘 Tests for the dynamic workflows in .claude/workflows. The workflow runtime enforces a few
// script rules, but only when someone RUNS the workflow, which can spawn a dozen agents first.
// These tests check the same rules statically, in milliseconds:
//   1. `export const meta = { ... }` is the FIRST statement and a plain literal, with a name and a
//      description (the runtime reads it without running the script, to show the approval card).
//   2. Every phase title the script uses is declared in `meta.phases` (the progress tree groups by it).
//   3. No Date.now(), Math.random(), argument-less new Date() or import(): a resumed run must
//      repeat the same agent() calls, so the script has to be deterministic and self-contained.
//   4. Every `agentType` names an agent file in .claude/agents.
// A workflow body may `return` at the top level, which a plain ES module rejects (so `node --check`
// fails on these files). The tests parse it the way the runtime runs it: as an async function body.
//
// The checker is tested on purpose-built BAD scripts first. A checker that cannot fail proves nothing.

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { acorn, agentNames, repoPath } from "./helpers.mjs";

const AsyncFunction = (async () => {}).constructor;

/** Visits every AST node under `node`. */
function walk(node, visit) {
  if (!node || typeof node.type !== "string") return;
  visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (key === "loc") continue;
    for (const child of Array.isArray(value) ? value : [value]) {
      if (child && typeof child.type === "string") walk(child, visit);
    }
  }
}

/** The value of a plain literal (strings, numbers, booleans, null, arrays, objects); throws otherwise. */
function literalValue(node) {
  const where = `line ${node.loc.start.line}`;
  switch (node.type) {
    case "Literal":
      if (node.regex) throw new Error(`a regular expression at ${where}`);
      return node.value;
    case "TemplateLiteral":
      if (node.expressions.length) throw new Error(`a template with \${...} at ${where}`);
      return node.quasis[0].value.cooked;
    case "UnaryExpression":
      if (node.operator === "-" && node.argument.type === "Literal" && typeof node.argument.value === "number") {
        return -node.argument.value;
      }
      throw new Error(`an expression at ${where}`);
    case "ArrayExpression":
      return node.elements.map((element) => {
        if (!element || element.type === "SpreadElement") throw new Error(`a hole or spread at ${where}`);
        return literalValue(element);
      });
    case "ObjectExpression": {
      const value = {};
      for (const prop of node.properties) {
        if (prop.type !== "Property" || prop.computed || prop.method || prop.kind !== "init" || prop.shorthand) {
          throw new Error(`a spread, computed, shorthand or method property at line ${prop.loc.start.line}`);
        }
        value[prop.key.type === "Identifier" ? prop.key.name : String(prop.key.value)] = literalValue(prop.value);
      }
      return value;
    }
    default:
      throw new Error(`${node.type} at ${where}`);
  }
}

const stringOf = (node) => (node?.type === "Literal" && typeof node.value === "string" ? node.value : undefined);
const keyName = (prop) => (prop.key.type === "Identifier" ? prop.key.name : prop.key.value);

/**
 * Checks one workflow script. Returns { meta, problems }: problems is a list of plain-words
 * strings, empty when the script follows every rule above.
 */
function checkWorkflow(source, { knownAgents = [] } = {}) {
  const problems = [];

  // The runtime runs the body as an async function, so compile it exactly like that (with the
  // `export` keyword on meta removed). This only COMPILES the code; nothing runs.
  try {
    new AsyncFunction(source.replace(/^export\s+(?=const\s+meta\b)/m, ""));
  } catch (error) {
    problems.push(`does not compile as a workflow body: ${error.message}`);
    return { meta: undefined, problems };
  }

  const ast = acorn.parse(source, {
    ecmaVersion: "latest",
    sourceType: "module",
    allowReturnOutsideFunction: true,
    locations: true,
  });

  // Rule 1: meta first, a plain literal, with a name and a description.
  let meta;
  const [first, ...rest] = ast.body;
  const declarator = first?.declaration?.declarations?.[0];
  const isMetaFirst =
    first?.type === "ExportNamedDeclaration" &&
    first.declaration?.type === "VariableDeclaration" &&
    first.declaration.kind === "const" &&
    first.declaration.declarations.length === 1 &&
    declarator.id.type === "Identifier" &&
    declarator.id.name === "meta";
  if (!isMetaFirst) {
    problems.push("the first statement must be `export const meta = { ... }`");
  } else {
    try {
      meta = literalValue(declarator.init);
      if (typeof meta !== "object" || meta === null || Array.isArray(meta)) throw new Error("not an object");
    } catch (error) {
      problems.push(`meta must be a plain literal (found ${error.message})`);
      meta = undefined;
    }
  }
  if (meta) {
    for (const field of ["name", "description"]) {
      if (typeof meta[field] !== "string" || !meta[field].trim()) problems.push(`meta.${field} must be a non-empty string`);
    }
  }
  const declaredPhases = new Set((Array.isArray(meta?.phases) ? meta.phases : []).map((p) => p?.title));

  // Rules 2-4 look at the body only (everything after meta).
  const usedPhases = new Map();
  for (const statement of isMetaFirst ? rest : ast.body) {
    walk(statement, (node) => {
      const line = node.loc.start.line;
      const callee = node.callee;
      const isMember = (obj, prop) =>
        callee?.type === "MemberExpression" && !callee.computed &&
        callee.object.type === "Identifier" && callee.object.name === obj &&
        callee.property.type === "Identifier" && callee.property.name === prop;

      if (node.type === "CallExpression" && isMember("Date", "now")) problems.push(`Date.now() at line ${line}`);
      if (node.type === "CallExpression" && isMember("Math", "random")) problems.push(`Math.random() at line ${line}`);
      if (node.type === "NewExpression" && callee.type === "Identifier" && callee.name === "Date" && node.arguments.length === 0) {
        problems.push(`new Date() with no argument at line ${line}`);
      }
      if (node.type === "ImportExpression") problems.push(`import() at line ${line}`);
      if (node.type === "ImportDeclaration") problems.push(`an import statement at line ${line}`);

      if (node.type === "CallExpression" && callee.type === "Identifier" && callee.name === "phase") {
        const title = stringOf(node.arguments[0]);
        if (title !== undefined) usedPhases.set(title, line);
      }
      if (node.type === "Property" && !node.computed && keyName(node) === "phase") {
        const title = stringOf(node.value);
        if (title !== undefined) usedPhases.set(title, line);
      }
      if (node.type === "Property" && !node.computed && keyName(node) === "agentType") {
        const name = stringOf(node.value);
        if (name !== undefined && !knownAgents.includes(name)) {
          problems.push(`agentType "${name}" at line ${line} has no file in .claude/agents`);
        }
      }
    });
  }

  for (const [title, line] of usedPhases) {
    if (!declaredPhases.has(title)) problems.push(`phase "${title}" at line ${line} is not in meta.phases`);
  }

  return { meta, problems };
}

describe("the workflow checker catches each broken rule", () => {
  const knownAgents = ["verifier"];

  test("meta that is not the first statement", () => {
    const { problems } = checkWorkflow(
      `const NAME = 'demo'\nexport const meta = { name: 'demo', description: 'd', phases: [] }\nreturn 1\n`,
      { knownAgents },
    );
    assert.ok(problems.includes("the first statement must be `export const meta = { ... }`"), problems.join("\n"));
  });

  test("meta that is not a plain literal", () => {
    const { problems } = checkWorkflow(`export const meta = { name: NAME, description: 'd' }\nreturn 1\n`, { knownAgents });
    assert.ok(problems.some((p) => p.startsWith("meta must be a plain literal")), problems.join("\n"));
  });

  test("meta without a name or description", () => {
    const { problems } = checkWorkflow(`export const meta = { phases: [] }\nreturn 1\n`, { knownAgents });
    assert.ok(problems.includes("meta.name must be a non-empty string"));
    assert.ok(problems.includes("meta.description must be a non-empty string"));
  });

  test("non-deterministic calls, imports, an undeclared phase and an unknown agentType", () => {
    const source = [
      "export const meta = { name: 'demo', description: 'd', phases: [{ title: 'Review' }] }",
      "const started = Date.now()",
      "const id = Math.random()",
      "const today = new Date()",
      "const fixed = new Date('2026-01-01')",
      "const fs = await import('node:fs')",
      "phase('Ghost')",
      "await agent('x', { phase: 'Review', agentType: 'nobody' })",
      "await agent('y', { phase: 'Review', agentType: 'verifier' })",
      "return { started, id, today, fixed, fs }",
    ].join("\n");
    const { problems } = checkWorkflow(source, { knownAgents });
    assert.deepEqual(problems.sort(), [
      "Date.now() at line 2",
      "Math.random() at line 3",
      'agentType "nobody" at line 8 has no file in .claude/agents',
      "import() at line 6",
      "new Date() with no argument at line 4",
      'phase "Ghost" at line 7 is not in meta.phases',
    ]);
  });

  test("a script that does not compile", () => {
    const { problems } = checkWorkflow(`export const meta = { name: 'demo', description: 'd' }\nconst = 1\n`, { knownAgents });
    assert.ok(problems[0].startsWith("does not compile as a workflow body"));
  });

  test("a clean script with a top-level return passes", () => {
    const source = "export const meta = { name: 'demo', description: 'd', phases: [{ title: 'Review' }] }\nphase('Review')\nreturn 1\n";
    assert.deepEqual(checkWorkflow(source, { knownAgents }).problems, []);
  });
});

describe("the workflows in .claude/workflows follow the runtime's script rules", () => {
  const files = readdirSync(repoPath(".claude/workflows")).filter((f) => f.endsWith(".js")).sort();
  const knownAgents = agentNames();

  test("both workflows are there", () => {
    for (const expected of ["api-input-audit.js", "verdant-design-audit.js"]) assert.ok(files.includes(expected), expected);
  });

  for (const file of files) {
    test(`${file}: meta first, deterministic, phases declared, agent types exist`, () => {
      const source = readFileSync(repoPath(".claude/workflows", file), "utf8");
      const { meta, problems } = checkWorkflow(source, { knownAgents });
      assert.deepEqual(problems, []);
      assert.equal(meta.name, path.basename(file, ".js"), "meta.name is the /command name; keep it equal to the file name");
      assert.ok(Array.isArray(meta.phases) && meta.phases.length > 0, "declare the phases the progress tree shows");
    });
  }
});
