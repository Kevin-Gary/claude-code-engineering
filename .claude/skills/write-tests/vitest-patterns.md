# Vitest patterns (unit tests in app/)

```ts
import { describe, expect, it } from "vitest";
import { addDays } from "./schedule";

describe("addDays", () => {
  it("rolls over into the next month", () => {
    expect(addDays("2026-01-30", 3)).toBe("2026-02-02");
  });
});
```

- Run one file: `npx vitest run app/src/lib/care/schedule.test.ts` (from the repo root) or
  `npm test` for everything.
- Table-driven cases keep edge cases readable:

```ts
it.each([
  ["2026-03-15", 1, "2026-04-15"],
  ["2026-05-10", 3, "2026-08-10"],
])("from %s plus %i month(s) is %s", (from, months, expected) => {
  expect(nextFeedingDate(from, months)).toBe(expected);
});
```

- Boundaries worth a case: empty, zero, negative, the end of a month, February in leap and
  non-leap years, December to January, very long strings, unexpected casing and whitespace.
- Errors: `expect(() => parseISODate("nope")).toThrow(RangeError)`.
- Time: `vi.useFakeTimers(); vi.setSystemTime(new Date("2026-03-01T00:00:00Z"))`, and
  `vi.useRealTimers()` in `afterEach`.
