import { endOfMonth, startOfMonth } from "@recyclerie/api/domain/calendar";
import type {
  SalesAnalyticsDto,
  SalesTimelineBucketDto,
  SalesTimelineDto,
  SalesTimelineStep,
} from "@recyclerie/api/responses/salesAnalytics";

// French labels through Intl on UTC midnight, never the dayjs locale (two
// dayjs copies here, only one with `fr`).
type Range = { date_from: string; date_to: string };

/** What one bar stands for. Weeks start on Monday. */
export const STEP_LABELS: Record<SalesTimelineStep, string> = {
  day: "Par jour",
  week: "Par semaine",
  month: "Par mois",
};

const utcDate = (date: string) => new Date(`${date}T00:00:00Z`);
const fr = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", ...options });

const WEEKDAY_DAY = fr({ weekday: "short", day: "numeric" });
const WEEKDAY_DATE = fr({ weekday: "short", day: "numeric", month: "short", year: "numeric" });
const DAY_MONTH = fr({ day: "numeric", month: "short" });
const DATE = fr({ day: "numeric", month: "short", year: "numeric" });
const SHORT_MONTH = fr({ month: "short", year: "numeric" });
const LONG_MONTH = fr({ month: "long", year: "numeric" });

const isWholeMonth = ({ date_from, date_to }: Range) =>
  date_from === startOfMonth(date_from) && date_to === endOfMonth(date_from);

const dates = (format: Intl.DateTimeFormat, { date_from, date_to }: Range) =>
  format.formatRange(utcDate(date_from), utcDate(date_to));

/** Axis label: "lun. 3", "2–8 nov.", "nov. 2026"; a partial week or month at an edge: "27–30 sept.". */
export const bucketLabel = (bucket: Range, step: SalesTimelineStep): string => {
  switch (step) {
    case "day":
      return WEEKDAY_DAY.format(utcDate(bucket.date_from));
    case "week":
      return dates(DAY_MONTH, bucket);
    case "month":
      return isWholeMonth(bucket)
        ? SHORT_MONTH.format(utcDate(bucket.date_from))
        : dates(DAY_MONTH, bucket);
  }
};

/** Tooltip title, with the year: "jeu. 1 févr. 2024", "28 déc. 2023 – 3 janv. 2024", "février 2024". */
export const bucketTitle = (bucket: Range, step: SalesTimelineStep): string => {
  if (step === "day") return WEEKDAY_DATE.format(utcDate(bucket.date_from));
  if (step === "month" && isWholeMonth(bucket))
    return LONG_MONTH.format(utcDate(bucket.date_from));
  return dates(DATE, bucket);
};

/** One x position of the chart: a current bucket and the comparison bucket at the same position. */
export type TimelinePoint = {
  label: string;
  title: string;
  net: number;
  salesCount: number;
  /** null when there is no comparison, or no comparison day at this position. */
  comparison: { title: string; net: number; salesCount: number } | null;
};

export const timelinePoints = ({
  current,
  comparison,
}: SalesAnalyticsDto<SalesTimelineDto>): TimelinePoint[] =>
  current.buckets.flatMap((bucket, index) => {
    // The current series has no null bucket; the comparison may.
    if (!bucket) return [];
    const other = comparison?.buckets[index] ?? null;
    return [
      {
        label: bucketLabel(bucket, current.step),
        title: bucketTitle(bucket, current.step),
        net: bucket.net_revenue,
        salesCount: bucket.sales_count,
        comparison: other && {
          title: bucketTitle(other, current.step),
          net: other.net_revenue,
          salesCount: other.sales_count,
        },
      },
    ];
  });

const hasFigures = (bucket: SalesTimelineBucketDto | null) =>
  bucket !== null && (bucket.sales_count > 0 || bucket.refunded_amount > 0);

/** Nothing to plot: no Sale and no Refund in either range. */
export const isTimelineEmpty = ({ current, comparison }: SalesAnalyticsDto<SalesTimelineDto>) =>
  !current.buckets.some(hasFigures) && !(comparison?.buckets.some(hasFigures) ?? false);
