# Patterns and fixes (Next.js + React)

## Input validation
- Smell: `const body = await request.json()` then `body.email` used directly.
- Fix: parse with a schema (zod, valibot) or hand-written guards. Reject unknown shapes with 400.
  Bound string lengths so one request cannot store megabytes.

## XSS
- Smell: `dangerouslySetInnerHTML` with any value that came from a user, even indirectly via the API.
- Fix: render text as JSX children (`<strong>{name}</strong>`). React escapes it. If HTML is truly
  required, sanitize with a vetted library (DOMPurify) and an allowlist of tags.
- Payload to try in review notes: a classic `<img src=x onerror=alert(1)>`, plus a variant that uses
  `/` instead of spaces. Code that splits, trims or truncates input can break one form and keep the other.

## Path traversal
- Smell: `path.join(BASE_DIR, userValue)` or a template string building a path.
- Fix: allowlist (look the value up in a known list of slugs), or validate with a strict regex
  such as `/^[a-z0-9-]+$/`, then confirm `path.resolve(result).startsWith(BASE_DIR + path.sep)`.
- Remember that encoded separators in a URL segment (`%2F`, `%5C`) can be decoded before your code
  sees the value, so a single dynamic segment is not proof of a single path segment.

## SSRF
- Smell: `fetch(request.nextUrl.searchParams.get("url"))`.
- Fix: allowlist hostnames, require `https:`, reject private and link-local IP ranges after DNS
  resolution, disable redirects or re-check each hop, set a timeout and a size cap.
- Targets an attacker wants: `http://169.254.169.254/` (cloud metadata), `http://localhost:*`,
  internal service names.

## Sensitive data exposure
- Smell: returning whole stored records (`Response.json(records)`) when the UI shows one field.
- Fix: map to a response shape with only the fields the UI needs.

## Abuse
- Smell: a public POST with no rate limit, captcha or size limit.
- Fix: rate-limit by IP or session at the edge or in middleware; cap body size.
