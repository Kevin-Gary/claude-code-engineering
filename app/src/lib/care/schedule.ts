/**
 * Care-schedule math: when does a plant next need water, and when does it next need food?
 *
 * 📘 This is the "domain logic" layer: plain functions with no React, no HTTP, no database.
 * That shape is what makes it cheap to test (see schedule.test.ts) and easy for Claude to verify:
 * every change here has a unit test that proves it, and `npm test` runs in about a second.
 * Any stack: the same split works everywhere. Keep business rules in pure functions and keep
 * framework code (routes, components, controllers) thin around them.
 *
 * Convention: dates are ISO calendar days, "YYYY-MM-DD", and all math runs in UTC so the
 * answer never depends on the server's timezone.
 */

export type ISODate = string;

export type Season = "spring" | "summer" | "autumn" | "winter";
export type Light = "low" | "medium" | "bright";
export type PotSize = "small" | "medium" | "large";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse "YYYY-MM-DD" into a Date at midnight UTC. Throws a RangeError for anything else. */
export function parseISODate(iso: ISODate): Date {
  if (!ISO_DATE.test(iso)) {
    throw new RangeError(`Expected a date like 2026-03-14, got "${iso}"`);
  }
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || toISODate(date) !== iso) {
    throw new RangeError(`"${iso}" is not a real calendar date`);
  }
  return date;
}

/** Format a Date back to "YYYY-MM-DD" (UTC). */
export function toISODate(date: Date): ISODate {
  return date.toISOString().slice(0, 10);
}

/** The calendar day `days` days after `iso`. */
export function addDays(iso: ISODate, days: number): ISODate {
  const date = parseISODate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return toISODate(date);
}

/** The same day of the month, `months` months after `iso`. */
export function addMonths(iso: ISODate, months: number): ISODate {
  const date = parseISODate(iso);
  date.setUTCMonth(date.getUTCMonth() + months);
  return toISODate(date);
}

/** Next watering day, given the last watering and the plant's interval in days. */
export function nextWateringDate(lastWatered: ISODate, everyDays: number): ISODate {
  return addDays(lastWatered, everyDays);
}

/** Next feeding day, given the last feed and the plant's interval in months. */
export function nextFeedingDate(lastFed: ISODate, everyMonths: number): ISODate {
  return addMonths(lastFed, everyMonths);
}

/**
 * Tune a plant's base watering interval to the home it lives in.
 * Winter and low light slow growth (water less often); summer, bright light and small pots
 * dry the soil faster (water more often). The result is always at least one day.
 */
export function adjustedIntervalDays(
  baseDays: number,
  conditions: { season: Season; light: Light; potSize: PotSize },
): number {
  let days = baseDays;

  if (conditions.season === "winter") days *= 1.5;
  else if (conditions.season === "summer") days *= 0.8;

  if (conditions.light === "bright") days *= 0.85;
  else if (conditions.light === "low") days *= 1.25;

  if (conditions.potSize === "small") days -= 1;
  else if (conditions.potSize === "large") days += 2;

  return Math.max(1, Math.round(days));
}
