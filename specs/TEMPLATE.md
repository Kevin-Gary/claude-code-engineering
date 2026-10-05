# Test plan: <feature name>

**Source:** `docs/features/<feature>.md` (AC1 to ACn)
**Seed:** `e2e/seed.spec.ts`
**Start state:** fresh browser, dev server running at http://localhost:3000

## 1. <Group of scenarios, e.g. "Happy path">

### 1.1 <Scenario title, phrased as the behavior> (covers ACx)
**Steps:**
1. <exact action, with exact values typed>
2. <next action>

**Expected:**
- <what the visitor sees, quoting on-screen text>

**Test:** `e2e/<file>.spec.ts` (or "not yet automated")

## 2. <Negative and edge cases>

### 2.1 <Scenario> (covers ACy)
**Steps:**
1. ...

**Expected:**
- ...

## Data
- <test data used, e.g. emails in the example.com domain>

## Out of scope
- <what this plan deliberately does not check>
