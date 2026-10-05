<!-- 📘 ACCEPTANCE CRITERIA: the "what done means" for one feature, written before (or alongside) the
     code. This file is the input to the whole QA chain: the qa-explorer agent tests against it, the
     test plan in specs/ is derived from it, and each E2E test names the AC it proves.
     Given/When/Then keeps each criterion testable. Any stack: this is plain Markdown in a docs
     folder, a Jira ticket, or a Gherkin .feature file; the format matters less than the IDs. -->

# Feature: waitlist signup

**Why:** before launch, the site's job is to collect people who want the app, and which plan they
care about. The plan they pick shapes launch pricing and the first email they get.

**Where:** home page, `#waitlist` section. Form: `app/src/components/site/WaitlistForm.tsx`.
API: `POST /api/waitlist`, `GET /api/waitlist`.

## Acceptance criteria

**AC1. Join the waitlist.**
Given a visitor on the home page, when they enter a first name, a valid email, pick a plan and
press "Join the waitlist", then they see a confirmation in place of the form.

**AC2. Name is optional.**
Given a visitor who leaves "First name" empty, when they submit with a valid email, then the
signup still succeeds.

**AC3. Plan choices.**
The plan selector offers exactly Free, Plus and Family, in that order, with Plus selected by default.

**AC4. The confirmation names the chosen plan.**
Given a visitor who picked plan X (Free, Plus or Family), when the signup succeeds, then the
confirmation reads "You're on the X waitlist" and shows their place in line.

**AC5. Invalid email.**
Given a visitor who enters an email without a valid shape (for example `not-an-email`), when they
submit, then an inline error reads "Please enter a valid email address.", no confirmation appears,
and no signup is stored.

**AC6. Recent signups ticker.**
The section shows up to five recent signups, newest first, as "<first name> just joined the
<plan> waitlist". Only first names appear. A new signup appears in the ticker right after it succeeds.

## Non-functional requirements

**NFR1. The server does not trust the browser.** `POST /api/waitlist` applies the same rules as the
form (valid email, a known plan, a first name of at most 50 characters) and answers 400 otherwise.

**NFR2. No personal data in public responses.** Anything the browser can fetch without logging in
contains no email addresses and no full names.

**NFR3. Visitor text is shown as text.** Whatever a visitor types is displayed literally, never
interpreted as HTML.

## Out of scope
- Double opt-in email confirmation (launch email only).
- Rate limiting (tracked separately).
