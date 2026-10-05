# Test plan: waitlist signup

**Source:** `docs/features/waitlist-signup.md` (AC1 to AC6)
**Seed:** `e2e/seed.spec.ts`
**Start state:** fresh browser, dev server running at http://localhost:3000, page scrolled to `#waitlist`

## 1. Joining the waitlist

### 1.1 Join the Plus waitlist (covers AC1, AC4)
**Steps:**
1. Type "Sam" into "First name".
2. Type "sam@example.com" into "Email".
3. Select "Plus" in "Plan you're interested in".
4. Click "Join the waitlist".

**Expected:**
- The form is replaced by a confirmation reading "You're on the Plus waitlist".
- The confirmation shows a place in line.

**Test:** `e2e/waitlist.spec.ts`

### 1.2 Join the Free waitlist (covers AC4)
**Steps:** as 1.1, selecting "Free".
**Expected:** the confirmation reads "You're on the Free waitlist".
**Test:** not yet automated

### 1.3 Join the Family waitlist (covers AC4)
**Steps:** as 1.1, selecting "Family".
**Expected:** the confirmation reads "You're on the Family waitlist".
**Test:** not yet automated

### 1.4 Join without a first name (covers AC2)
**Steps:** leave "First name" empty, type a valid email, click "Join the waitlist".
**Expected:** the confirmation appears.
**Test:** not yet automated

## 2. Validation

### 2.1 Invalid email (covers AC5)
**Steps:**
1. Type "Sam" into "First name".
2. Type "not-an-email" into "Email".
3. Click "Join the waitlist".

**Expected:**
- An inline error reads "Please enter a valid email address."
- No confirmation appears.

**Test:** `e2e/waitlist.spec.ts`

## 3. Plan selector and ticker

### 3.1 Plan options (covers AC3)
**Steps:** open "Plan you're interested in".
**Expected:** options are Free, Plus, Family in that order; Plus is selected.
**Test:** not yet automated

### 3.2 New signup appears in the ticker (covers AC6)
**Steps:** join as "Robin" on the Free plan.
**Expected:** "Robin just joined the Free waitlist" appears at the top of the recent signups list.
Only first names are shown.
**Test:** not yet automated

## Data
- Use addresses in the `example.com` domain. The store is in memory and resets when the dev server restarts.

## Out of scope
- Email delivery, rate limiting, and the API's non-functional requirements (NFR1 to NFR3), which
  belong to code review and the security reviewer, not to browser tests.
