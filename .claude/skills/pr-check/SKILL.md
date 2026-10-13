---
name: pr-check
description: For a newly opened pull request, runs npm run check and /verdant-review against the PR diff, then posts ONE comment with the check result, the verdict and findings by severity with file:line. Never pushes to the PR branch.
when_to_use: As the prompt of a cloud routine with a GitHub pull_request trigger, or when asked to "check this PR".
disallowed-tools: AskUserQuestion
---
<!-- 📘 The instructions from docs/automation/cloud-routine.md, committed as a skill so the routine's
     prompt is just `/pr-check`. -->

# PR check

A pull request was opened. Check out its branch.

1. Run `npm run check`. Note any failure.
2. Run /verdant-review against `git diff origin/main...HEAD`.
3. Post ONE pull request comment with: the check result, the review verdict, and the findings
   grouped by severity with file:line. Keep it under 40 lines.

Do not push commits to the pull request branch.
