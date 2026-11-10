/*
 * Labels and figures shared by the sections of the Suivi des Ventes page.
 * French dates go through Intl on UTC midnight of a `YYYY-MM-DD` date, never
 * the dayjs locale (two dayjs copies here, only one with `fr`).
 */

/** Inclusive range of calendar dates, `YYYY-MM-DD`. */
export type DateRange = { date_from: string; date_to: string };

/** UTC midnight of a `YYYY-MM-DD` date, to format with `timeZone: "UTC"`. */
export const utcDate = (date: string) => new Date(`${date}T00:00:00Z`);

/** A French date format, for `utcDate` dates. */
export const frDateFormat = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", ...options });

const SHORT_DATE = frDateFormat({ day: "2-digit", month: "2-digit", year: "numeric" });

/** "29/02/2024". */
export const formatShortDate = (date: string) => SHORT_DATE.format(utcDate(date));

const COUNT = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** A count, French style: "1 234". */
export const formatCount = (n: number) => COUNT.format(n);

/** A count and what it counts: "1 vente", "3 ventes", "−2 objets". */
export const countLabel = (n: number, one: string, many = `${one}s`) =>
  `${formatCount(n)} ${Math.abs(n) > 1 ? many : one}`;

/** A 0–1 ratio as a percentage, `decimals` after the dot, for a CSV: (0.23756, 1) → 23.8. */
export const toPercent = (ratio: number, decimals: number) =>
  Math.round(ratio * 10 ** (decimals + 2)) / 10 ** decimals;
