---
name: security-checklist
description: Verdant's web security checklist for Next.js API routes and React components. Background knowledge for security reviews; covers input validation, XSS, path traversal, SSRF, data exposure and abuse limits.
user-invocable: false
---
<!-- 📘 BACKGROUND-KNOWLEDGE skill. `user-invocable: false` hides it from the / menu: there is no
     "/security-checklist" action to take. Claude still sees the description and can load it when a
     task is about security, and the `security-reviewer` agent PRELOADS it through its `skills:` field,
     which injects the full text at the agent's startup.
     Any stack: the categories are OWASP's and apply everywhere. Rewrite the examples for your
     framework (Django views, Spring controllers, Rails actions). -->

# Security checklist for Verdant

Work through every category for each file in scope. Detailed patterns and safe alternatives are
in [owasp-nextjs.md](owasp-nextjs.md).

1. **Input validation.** Every value from a request body, query string, path segment, header or
   cookie is untrusted. Check type, shape and maximum length before use.
2. **Cross-site scripting (XSS).** Any place user-supplied text reaches the DOM as HTML.
3. **Path traversal.** Any file system read or write whose path includes user input.
4. **Server-side request forgery (SSRF).** Any server-side `fetch` whose URL comes from user input.
5. **Sensitive data exposure.** Responses, logs and errors that return more than the caller needs,
   especially personal data.
6. **Abuse.** Endpoints anyone can call in a loop: signups, uploads, proxies. Is there a limit?
7. **Secrets.** Keys in code, in client components, or in anything sent to the browser.

For each finding report: severity (Critical, High, Medium, Low), `file:line`, a concrete exploit
or reproduction, and the fix.
