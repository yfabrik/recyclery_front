import type { IsoDate } from "@recyclerie/api/primitives/zod";
import type { Weekday } from "@recyclerie/api/enums";
import { startOfDay, toIsoDate, WEEKDAYS_MONDAY_FIRST } from "../dateService";

/**
 * Date of a weekday inside the displayed week. The presence header's cards only know
 * their weekday, so the date is the week's Monday plus the weekday's index (Monday first).
 */
export const dateOfWeekday = (weekStart: IsoDate, weekday: Weekday): IsoDate => {
  const offset = WEEKDAYS_MONDAY_FIRST.indexOf(weekday);
  return toIsoDate(startOfDay(weekStart).add(offset, "day").toDate());
};

// `Intl` on UTC midnight rather than dayjs's locale: the date is a calendar day, not an
// instant, and the fr locale does not reach every dayjs instance in this repo.
const longDay = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** "jeudi 15 janvier" (lowercase; capitalise with CSS where it is a title). */
export const formatDayLong = (date: IsoDate): string => longDay.format(new Date(`${date}T00:00:00Z`));
