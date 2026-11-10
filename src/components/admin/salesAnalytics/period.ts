import {
  addDays,
  addMonths,
  addYears,
  daysBetween,
  startOfIsoWeek,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from "@recyclerie/api/domain/calendar";
import type { SalesAnalyticsPeriod } from "@recyclerie/api/schemas/salesAnalytics";
import { formatShortDate, frDateFormat, utcDate, type DateRange } from "./format";

// Calendar maths on `YYYY-MM-DD` strings only: dayjs here has no quarter
// plugin and starts weeks on Sunday.
export type PeriodSelection = DateRange & { period: SalesAnalyticsPeriod };
export type PresetPeriod = Exclude<SalesAnalyticsPeriod, "custom">;

export const PERIOD_LABELS: Record<SalesAnalyticsPeriod, string> = {
  week: "Semaine",
  month: "Mois",
  quarter: "Trimestre",
  year: "Année",
  custom: "Personnalisé",
};

const UNITS: Record<
  PresetPeriod,
  { start: (date: string) => string; add: (date: string, n: number) => string }
> = {
  week: { start: startOfIsoWeek, add: (date, n) => addDays(date, 7 * n) },
  month: { start: startOfMonth, add: addMonths },
  quarter: { start: startOfQuarter, add: (date, n) => addMonths(date, 3 * n) },
  year: { start: startOfYear, add: addYears },
};

const earliest = (a: string, b: string) => (a < b ? a : b);

/** The whole week (from Monday), month, quarter or year containing `anchor`, cut at `today`. */
export const presetRange = (
  period: PresetPeriod,
  anchor: string,
  today: string,
): DateRange => {
  const unit = UNITS[period];
  const date_from = unit.start(anchor);
  const end = addDays(unit.add(date_from, 1), -1);
  return { date_from, date_to: date_from <= today ? earliest(end, today) : end };
};

/** A period button: the unit containing the current `date_to`. Personnalisé keeps the dates. */
export const selectPeriod = (
  current: PeriodSelection,
  period: SalesAnalyticsPeriod,
  today: string,
): PeriodSelection =>
  period === "custom"
    ? { ...current, period }
    : { period, ...presetRange(period, current.date_to, today) };

/** ← / →: the previous or next unit; a custom range moves by its own number of days. */
export const stepPeriod = (
  current: PeriodSelection,
  direction: -1 | 1,
  today: string,
): PeriodSelection => {
  if (current.period === "custom") {
    const days = (daysBetween(current.date_from, current.date_to) + 1) * direction;
    const date_from = addDays(current.date_from, days);
    return {
      period: "custom",
      date_from,
      date_to: earliest(addDays(current.date_to, days), today < date_from ? date_from : today),
    };
  }
  const unit = UNITS[current.period];
  const anchor = unit.add(unit.start(current.date_from), direction);
  return { period: current.period, ...presetRange(current.period, anchor, today) };
};

/** "Next" is disabled once the next period would start after today. */
export const canStepForward = (current: PeriodSelection, today: string) =>
  stepPeriod(current, 1, today).date_from <= today;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "novembre 2026", "T4 2026", "2026", "2–8 nov. 2026". */
export const periodLabel = ({ period, date_from, date_to }: PeriodSelection) => {
  const from = utcDate(date_from);
  switch (period) {
    case "month":
      return capitalize(frDateFormat({ month: "long", year: "numeric" }).format(from));
    case "quarter":
      return `T${Math.floor(from.getUTCMonth() / 3) + 1} ${from.getUTCFullYear()}`;
    case "year":
      return String(from.getUTCFullYear());
    case "week":
    case "custom":
      return frDateFormat({ day: "numeric", month: "short", year: "numeric" }).formatRange(
        from,
        utcDate(date_to),
      );
  }
};

/** "01/11/2026 – 09/11/2026". */
export const rangeLabel = ({ date_from, date_to }: DateRange) =>
  `${formatShortDate(date_from)} – ${formatShortDate(date_to)}`;
