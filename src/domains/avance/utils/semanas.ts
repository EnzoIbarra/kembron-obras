const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Normalize to UTC midnight so DST transitions never skew day counts.
function toUTCDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

function diffDays(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/**
 * Total schedulable weeks for an obra.
 * Rounds up so every day up to theoreticalEndDate falls within some week.
 * The last week may cover fewer than 7 real days but counts as a full week.
 */
export function calculateTotalWeeks(startDate: Date, theoreticalEndDate: Date): number {
  const start = toUTCDay(startDate);
  const end = toUTCDay(theoreticalEndDate);
  const totalDays = diffDays(start, end) + 1; // +1: both endpoints inclusive
  return Math.ceil(totalDays / 7);
}

/**
 * Calendar date range for the given 1-based weekNumber.
 * `to` is clamped to theoreticalEndDate — the last week never overshoots the obra.
 */
export function getWeekDateRange(
  startDate: Date,
  theoreticalEndDate: Date,
  weekNumber: number,
): { from: Date; to: Date } {
  const start = toUTCDay(startDate);
  const end = toUTCDay(theoreticalEndDate);
  const from = addDays(start, (weekNumber - 1) * 7);
  const toRaw = addDays(start, weekNumber * 7 - 1);
  return { from, to: toRaw > end ? end : toRaw };
}

/**
 * Which week number today falls into, or null if outside the obra's planned period.
 * null means "no current-week marker" — not clamped to week 1 or the last week.
 */
export function getCurrentWeekNumber(
  startDate: Date,
  theoreticalEndDate: Date,
  today: Date = new Date(),
): number | null {
  const start = toUTCDay(startDate);
  const end = toUTCDay(theoreticalEndDate);
  const todayNorm = toUTCDay(today);
  if (todayNorm < start || todayNorm > end) return null;
  return Math.floor(diffDays(start, todayNorm) / 7) + 1;
}

/**
 * Converts an absolute date to a 1-based week number relative to the obra's startDate.
 * Clamps to [1, totalWeeks] so records outside the obra period are assigned to the
 * nearest boundary week rather than dropped from the curve.
 */
export function dateToWeekNumber(startDate: Date, date: Date, totalWeeks: number): number {
  const start = toUTCDay(startDate);
  const d = toUTCDay(date);
  const raw = Math.floor(diffDays(start, d) / 7) + 1;
  return Math.max(1, Math.min(totalWeeks, raw));
}
