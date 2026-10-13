/*
 * ============================================================================
 *  API INPUT AUDIT (teaching file - read verdant-design-audit.js first)
 * ============================================================================
 *
 *  The same two-stage shape as verdant-design-audit.js (fan out, then
 *  adversarially verify), pointed at a different question: does every API
 *  route validate the user input it accepts?
 *
 *  WHAT IT DOES
 *    Stage 0 - Discover: one cheap agent lists every route.ts under
 *              app/src/app/api/. The work-list is found at runtime, not
 *              hardcoded, so a new route is audited without editing this file.
 *    Stage 1 - Review:  one reviewer per route file, using this repo's
 *              `security-reviewer` agent (read-only tools, the
 *              security-checklist skill preloaded). It follows each input
 *              from where it enters to where it is used.
 *    Stage 2 - Verify:  one `verifier` per finding. It must describe a
 *              concrete request that triggers the issue, or the finding is
 *              dropped. Only CONFIRMED findings come back, ranked high to low.
 *
 *  THREE THINGS THIS FILE TEACHES
 *    1. `agentType` reuses an agent definition from .claude/agents/: its
 *       tool allowlist and its instructions. Combined with `schema`, the
 *       agent answers in JSON instead of its usual prose report.
 *    2. Budgets are code. MAX_FILES and MAX_FINDINGS_PER_FILE cap the run, and
 *       log() says what was dropped, so a capped run never reads as "covered
 *       everything". This repo has two routes, so a run is about 1 + 2 + a few
 *       verifiers: well under 10 agents.
 *    3. pipeline() has no barrier: one route can be in Verify while another
 *       is still in Review.
 *
 *  HOW TO RUN IT
 *    - `/api-input-audit`, or ask "run the api-input-audit workflow".
 *    - You approve it first (the card shows the phases). Watch it in /workflows.
 *    - The agents only read. Nothing in app/ changes. To act on a confirmed
 *      finding, hand it to the `implementer` agent (see ORCHESTRATION.md).
 *
 *  SCRIPT RULES (the runtime enforces them)
 *    - `export const meta` must be the first statement and a plain literal.
 *    - Date.now(), Math.random() and new Date() throw inside the script, so a
 *      resumed run repeats the same agent() calls. No import(), no fs.
 *    - The final `return` hands the result to Claude. (That is also why a bare
 *      `node --check` rejects this file: top-level return is legal here, in
 *      the workflow runtime, but not in a plain ES module.)
 * ============================================================================
 */

export const meta = {
  name: 'api-input-audit',
  description: 'Audit every API route for unvalidated user input, then verify each finding with a concrete request',
  whenToUse: 'Before merging changes under app/src/app/api, or as a periodic security pass on the API routes',
  phases: [
    { title: 'Review', detail: 'find the routes, then one security reviewer per route file' },
    { title: 'Verify', detail: 'one skeptic per finding: show a request that triggers it, or drop it' },
  ],
}

// Budgets. Raise them for a bigger API; log() reports anything they cut.
const MAX_FILES = 8
const MAX_FINDINGS_PER_FILE = 3

const FILES = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' } },
  },
  required: ['files'],
}

const FINDINGS = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file:     { type: 'string' },
          line:     { type: 'number' },
          issue:    { type: 'string' },   // one line: what input is unvalidated, and where it goes
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          detail:   { type: 'string' },   // the path the input takes, entry point to use
        },
        required: ['file', 'line', 'issue', 'severity', 'detail'],
      },
    },
  },
  required: ['findings'],
}

const VERDICT = {
  type: 'object',
  properties: {
    verdict:  { type: 'string', enum: ['CONFIRMED', 'REFUTED'] },
    request:  { type: 'string' },   // the concrete request (a curl command) that triggers it, or ""
    evidence: { type: 'string' },   // file:line references that support the verdict
    reason:   { type: 'string' },   // one line
  },
  required: ['verdict', 'request', 'evidence', 'reason'],
}

const SEVERITY_RANK = { high: 0, medium: 1, low: 2 }

// STAGE 0 - discover the work-list. A cheap, mechanical job, so low effort.
phase('Review')
const found = await agent(
  `List every file named route.ts under app/src/app/api/ (any depth). Use Glob.
   Return repo-relative paths, for example app/src/app/api/<name>/route.ts. Do not read them.`,
  { label: 'discover:routes', phase: 'Review', schema: FILES, effort: 'low' }
)

const allFiles = found?.files ?? []
if (allFiles.length > MAX_FILES) {
  log(`Found ${allFiles.length} route files; auditing the first ${MAX_FILES}. Raise MAX_FILES to cover the rest.`)
}
const files = allFiles.slice(0, MAX_FILES)
log(`Auditing ${files.length} route file(s): ${files.join(', ')}`)

const results = await pipeline(
  files,

  // STAGE 1 - review one route file with the repo's security-reviewer agent.
  (file) => agent(
    `Audit ${file} for unvalidated user input. Before you start, make sure you have the
     security-checklist skill (preloaded for this agent type; otherwise read
     .claude/skills/security-checklist/SKILL.md).
     Find every value that comes from the request: body, query string, path segment, headers,
     cookies. Follow each one from where it enters to where it is used (file system, network,
     HTML, logs, the response body) and check its type, shape and maximum length on the way.
     Read the helpers it passes through in app/src/lib. Report only problems you can point at,
     with the line where the unvalidated value is used. No findings is a valid answer.`,
    { label: `review:${file.split('/').slice(-2).join('/')}`, phase: 'Review', schema: FINDINGS, agentType: 'security-reviewer' }
  ),

  // STAGE 2 - one skeptic per finding. Dynamic: the count depends on Stage 1.
  (review, file) => {
    const findings = review?.findings ?? []
    if (findings.length > MAX_FINDINGS_PER_FILE) {
      log(`${file}: ${findings.length} findings, verifying the first ${MAX_FINDINGS_PER_FILE} by severity.`)
    }
    const toVerify = [...findings]
      .sort((a, b) => (SEVERITY_RANK[a.severity] ?? 3) - (SEVERITY_RANK[b.severity] ?? 3))
      .slice(0, MAX_FINDINGS_PER_FILE)

    return parallel(
      toVerify.map((f) => () =>
        agent(
          `A reviewer claims this is an unvalidated-input issue. Try to REFUTE it.
           File: ${f.file}:${f.line}
           Claim (${f.severity}): ${f.issue}
           Reviewer's reasoning: ${f.detail}
           Read the route and everything the input passes through. CONFIRMED only if you can write
           the concrete HTTP request (a curl command against http://localhost:3000) that triggers
           it and point at the lines it passes through. If you cannot, the verdict is REFUTED and
           request is an empty string.`,
          { label: `verify:${f.file.split('/').slice(-2, -1)[0]}:${f.line}`, phase: 'Verify', schema: VERDICT, agentType: 'verifier' }
        ).then((v) => ({ ...f, verdict: v }))
      )
    )
  }
)

// Flatten, drop nulls (stopped or failed agents), keep what the skeptic could NOT refute.
const confirmed = results
  .flat()
  .filter(Boolean)
  .filter((f) => f.verdict?.verdict === 'CONFIRMED')
  .sort((a, b) => (SEVERITY_RANK[a.severity] ?? 3) - (SEVERITY_RANK[b.severity] ?? 3))
  .map((f) => ({
    file: f.file,
    line: f.line,
    severity: f.severity,
    issue: f.issue,
    request: f.verdict.request,
    evidence: f.verdict.evidence,
  }))

return { confirmed, routesAudited: files.length, routesFound: allFiles.length }
