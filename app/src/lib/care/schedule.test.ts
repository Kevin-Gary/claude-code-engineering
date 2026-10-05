// 📘 Unit tests for the care-schedule math. These are the checks Claude runs after every change
// ("make the change, then `npm test` must stay green"). Read them as a spec: each `it` names one
// behavior in plain words. Coverage here is deliberately incomplete; finding the gaps is part of
// the session. Any stack: the same file is a pytest module, a JUnit class, or a Go _test.go file.
import { describe, expect, it } from "vitest";
import { addDays, nextFeedingDate, nextWateringDate, parseISODate } from "./schedule";

describe("parseISODate", () => {
  it("accepts a real calendar day", () => {
    expect(parseISODate("2026-03-14").toISOString()).toBe("2026-03-14T00:00:00.000Z");
  });

  it("rejects text that is not YYYY-MM-DD", () => {
    expect(() => parseISODate("March 14")).toThrow(RangeError);
  });

  it("rejects a day that does not exist", () => {
    expect(() => parseISODate("2026-02-30")).toThrow(RangeError);
  });
});

describe("addDays", () => {
  it("rolls over into the next month", () => {
    expect(addDays("2026-01-30", 3)).toBe("2026-02-02");
  });

  it("rolls over into the next year", () => {
    expect(addDays("2026-12-30", 5)).toBe("2027-01-04");
  });
});

describe("nextWateringDate", () => {
  it("adds the plant's interval to the last watering", () => {
    expect(nextWateringDate("2026-03-10", 7)).toBe("2026-03-17");
  });
});

describe("nextFeedingDate", () => {
  it("lands on the same day next month", () => {
    expect(nextFeedingDate("2026-03-15", 1)).toBe("2026-04-15");
  });

  it("handles a multi-month interval", () => {
    expect(nextFeedingDate("2026-05-10", 3)).toBe("2026-08-10");
  });
});
