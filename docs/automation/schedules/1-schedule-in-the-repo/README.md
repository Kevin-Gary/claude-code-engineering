# 1. The schedule is in the repo (team-owned, CI)

The schedule is a line of YAML, committed and reviewed like code. It runs on CI with an
organization API key, so it doesn't depend on anyone's laptop or account.

## GitHub Actions: the cron is in the file

[`morning-health.github-actions.yml`](morning-health.github-actions.yml) is an example. To turn it
on, copy it to `.github/workflows/morning-health.yml` and add `ANTHROPIC_API_KEY` as a repository
secret. The schedule is this line (cron is in UTC; GitHub runs schedules only from the default branch):

```yaml
on:
  schedule:
    - cron: "7 16 * * 1-5"   # 9:07 AM Pacific (PDT), Monday to Friday
```

## Bitbucket Pipelines: the pipeline is in the file, the timer is in Bitbucket

Bitbucket doesn't take a cron in `bitbucket-pipelines.yml`. You commit a custom pipeline
([`ci-examples/bitbucket-pipelines.yml`](../../../../ci-examples/bitbucket-pipelines.yml), `custom: nightly-health`)
and then attach a schedule to it from the repository's Pipelines page (branch `main`, that
pipeline, daily). Add `ANTHROPIC_API_KEY` as a secured repository variable.

Both run the same committed skill: `claude -p "/morning-health"`.
