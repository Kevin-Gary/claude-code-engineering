/*
 * ============================================================================
 *  WHAT IS A WORKFLOW? (read this first - teaching file)
 * ============================================================================
 *
 *  A *subagent* is a single delegated task: Claude hands off one job, the
 *  agent runs in its own context window, and returns one result. The
 *  orchestration - deciding what to spawn next - lives in Claude's head.
 *
 *  A *workflow* writes that orchestration down as CODE. It's a JavaScript
 *  script that spawns MANY agents with real control flow: loops, conditionals,
 *  fan-out, and pipelines. It runs deterministically in the background and
 *  hands back a single result. Reach for one when the work is too big for a
 *  single context window, or needs verification you can't trust freehand.
 *
 *  WHEN TO USE A WORKFLOW (not for everyday coding):
 *    - Broad audits      - "check every component for X" across many files
 *    - Migrations        - one transform-agent per call site
 *    - Multi-source research - fan out searches, then verify + synthesize
 *    - Design exploration   - N approaches, judged, best one synthesized
 *    - High-stakes review   - adversarially verify before acting
 *  For "fix this bug" or "add this section", just use one agent. A workflow
 *  there is over-engineering.
 *
 *  THE PRIMITIVES the workflow runtime gives you:
 *    - agent(prompt, opts)        - spawn one subagent (opts.schema => structured output)
 *    - parallel([thunks])         - run many at once, wait for ALL (a barrier)
 *    - pipeline(items, ...stages) - flow each item through stages, NO barrier
 *    - log() / phase()            - progress output and grouping
 *    - loops + budget             - dynamic: agent count computed at runtime
 *  NOTE: quality patterns like "adversarial verify" are NOT automatic - they
 *  are something the SCRIPT AUTHOR encodes. The power is that the primitives
 *  make those patterns cheap to write. A workflow is only as rigorous as its
 *  script. (This one encodes adversarial verify in Stage 2 below.)
 *
 *  HOW WORKFLOWS ARE INVOKED (they are OPT-IN - never auto-launched, because
 *  they can spawn dozens of agents and cost real tokens):
 *    - Ask in plain words: "run the verdant-design-audit workflow"
 *    - Say the keyword `ultracode` to opt into orchestration for the turn
 *    - Files in THIS folder (.claude/workflows/) are auto-registered as named
 *      workflows - a real, Claude-recognized directory (sibling to
 *      .claude/agents/ and .claude/skills/), not a made-up path.
 *    - A saved workflow also runs as a slash command: `/verdant-design-audit`.
 *    - Run `/workflows` to watch the live progress tree while one executes.
 *
 *  ANOTHER WORKFLOW WORTH WRITING (an exercise): a per-route security audit.
 *  Fan out one `security-reviewer` agent per API route file (app/src/app/api/<name>/route.ts), then a
 *  skeptic per finding that must produce a working exploit (a curl command) or
 *  drop it. Same two-stage shape as this file, different checklist.
 *
 *  WHAT THIS WORKFLOW DOES & WHY YOU'D USE IT:
 *    A design-system audit of the Verdant marketing site. It fans out one
 *    reviewer per component (Stage 1), then pipes every finding to a SKEPTIC
 *    agent that tries to refute it (Stage 2), keeping only findings that
 *    survive. You'd use it to catch hardcoded colors / off-scale spacing /
 *    one-off shadows across all of app/ at once - work that's too broad for a
 *    single reviewer, and where adversarial verification filters out the
 *    plausible-but-wrong findings a lone reviewer would happily report.
 * ============================================================================
 */

export const meta = {
  name: 'verdant-design-audit',
  description: 'Audit each app/ component against the Verdant design system, verify each finding',
  phases: [
    { title: 'Review', detail: 'one reviewer per component' },
    { title: 'Verify', detail: 'skeptic tries to refute each finding' },
  ],
}

// Schema forces each agent to return structured data - no parsing, auto-retries on mismatch.
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
          rule:     { type: 'string' },   // e.g. "hardcoded hex instead of color token"
          severity: { type: 'string', enum: ['low', 'med', 'high'] },
          detail:   { type: 'string' },
        },
        required: ['file', 'rule', 'severity', 'detail'],
      },
    },
  },
  required: ['findings'],
}

const VERDICT = {
  type: 'object',
  properties: {
    isReal: { type: 'boolean' },
    reason: { type: 'string' },
  },
  required: ['isReal', 'reason'],
}

// The work-list: the real component files in app/.
const COMPONENTS = [
  'app/src/components/site/Hero.tsx',
  'app/src/components/site/SiteNav.tsx',
  'app/src/components/site/HowItWorks.tsx',
  'app/src/components/site/FeatureDiagnose.tsx',
  'app/src/components/site/Pricing.tsx',
  'app/src/components/site/Waitlist.tsx',
  'app/src/components/site/WaitlistForm.tsx',
  'app/src/components/site/SiteFooter.tsx',
  'app/src/components/ui/Button.tsx',
  'app/src/components/ui/Badge.tsx',
  'app/src/components/ui/CareRing.tsx',
]

// pipeline() = each component flows through BOTH stages independently.
// Hero can be in "Verify" while Pricing is still in "Review" - no barrier, no wasted wall-clock.
const results = await pipeline(
  COMPONENTS,

  // STAGE 1 - review one component against the design tokens.
  (file) => agent(
    `Review ${file} against Verdant's design system. The source of truth is the token files in
     app/src/styles/tokens/ (colors.css, spacing.css, typography.css, effects.css).
     Flag: hardcoded hex/rgb colors, off-scale spacing/font sizes, one-off shadows,
     and any value that should reference a token but doesn't. Read the tokens first.`,
    { label: `review:${file.split('/').pop()}`, phase: 'Review', schema: FINDINGS }
  ),

  // STAGE 2 - for each finding, spawn a skeptic that tries to REFUTE it.
  // This inner parallel() fans out per-finding; dynamic - count depends on stage 1's output.
  (review, file) => parallel(
    (review?.findings ?? []).map((f) => () =>
      agent(
        `A reviewer claims this is a design-system violation in ${f.file}:
         "${f.detail}" (rule: ${f.rule}).
         Try to REFUTE it. Check whether the value actually maps to an allowed token,
         or is a legitimate exception. Default isReal=false if you're not confident it's a real violation.`,
        { label: `verify:${f.rule}`, phase: 'Verify', schema: VERDICT }
      ).then((v) => ({ ...f, verdict: v }))
    )
  )
)

// results is an array-of-arrays (one inner array per component). Flatten, drop nulls,
// keep only findings the skeptic could NOT refute.
const confirmed = results
  .flat()
  .filter(Boolean)
  .filter((f) => f.verdict?.isReal)

return { confirmed, reviewed: COMPONENTS.length }
