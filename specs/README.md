<!-- 📘 specs/ holds TEST PLANS: Markdown documents that sit between acceptance criteria and test code.
     Playwright's test agents use this folder (`npx playwright init-agents` creates it): the planner
     writes plans here, and the generator turns each scenario into a test in e2e/.
     Any stack: a test plan is just structured prose. Your QA team may already write these in a
     test-management tool; keeping them as Markdown in the repo means Claude can read and write them. -->

# Test plans

The chain this folder is part of:

```
docs/features/<feature>.md      acceptance criteria (AC1, AC2...)   "what done means"
        |
specs/<feature>.plan.md         test plan: scenarios with steps     "how we will check it"
        |
e2e/<feature>.spec.ts           Playwright tests, one per scenario  "the check, automated"
        |
CI (.github/workflows/ci.yml)   runs the tests on every push        "no AI needed"
```

## How to make a plan

- **By hand:** copy [`TEMPLATE.md`](TEMPLATE.md) and fill it from the acceptance criteria.
- **With Claude:** "Write a test plan for docs/features/waitlist-signup.md using specs/TEMPLATE.md."
- **With the Playwright planner agent:** "Use the playwright-test-planner agent to explore the
  waitlist on http://localhost:3000 and write a plan to specs/." It explores the live site.

Then generate tests: "Use the playwright-test-generator agent on specs/waitlist-signup.plan.md."

## What is here

- [`TEMPLATE.md`](TEMPLATE.md): the shape every plan follows.
- [`waitlist-signup.plan.md`](waitlist-signup.plan.md): a worked example. Some scenarios already
  have tests in `e2e/waitlist.spec.ts`; the rest are the exercise.
