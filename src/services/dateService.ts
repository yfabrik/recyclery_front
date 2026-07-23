import type { Weekday } from "@recyclerie/api/enums";
import {
  dateFromWeekday,
  dayjs,
  startOfDay,
  toIsoDate,
  toIsoTime,
  weekday,
  WEEKDAYS_MONDAY_FIRST,
  weekdaySortKey,
} from "@recyclerie/api/domain/date";
import "dayjs/locale/fr";

export {
  dateFromWeekday,
  dayjs,
  now,
  startOfDay,
  endOfDay,
  toIsoDate,
  toIsoTime,
  toIsoDateTime,
  combineDateAndTime,
  WEEKDAY_LABELS_FR,
  WEEKDAYS_MONDAY_FIRST,
  weekdaySortKey,
} from "@recyclerie/api/domain/date";

/** @deprecated Prefer `weekday` from `@recyclerie/api/domain/date` */
export const weekdayFromDate = weekday;

/** @deprecated Prefer `dateFromWeekday` from `@recyclerie/api/domain/date` */
export const nextDateForWeekday = dateFromWeekday;

const capitalize = (s: string) =>
  s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);

/** French Title Case weekday label via dayjs locale (0=Sunday … 6=Saturday). */
export const weekdayLabel = (n: Weekday | number): string =>
  // 1970-01-04 is a Sunday
  capitalize(dayjs("1970-01-04").locale("fr").add(n, "day").format("dddd"));

export const weekDays = () =>
  WEEKDAYS_MONDAY_FIRST.map((day) => weekdayLabel(day).toLowerCase());

export const weekDaysMap = () =>
  WEEKDAYS_MONDAY_FIRST.reduce((prev, current) => {
    return prev.set(current, weekdayLabel(current).toLowerCase());
  }, new Map<Weekday, string>());

export const weekDaysArray = () =>
  WEEKDAYS_MONDAY_FIRST.map((day) => ({
    key: day,
    value: day,
    label: weekdayLabel(day),
  }));

export const getDay = (n: number) => weekdayLabel(n);

/** Display DD/MM/YYYY (UI only). */
export const formatDate = (d: Date) => dayjs(d).format("DD/MM/YYYY");

/** Display HH:mm (UI only). */
export const formatTime = (d: Date) => toIsoTime(d);

/** Week (Monday–Sunday) containing the given date. Returns YYYY-MM-DD for API. */
export const getWeekRangeFromDate = (
  selectedDate: Date,
): { date_from: string; date_to: string } => {
  const d = startOfDay(selectedDate);
  const lundi = d.subtract(weekdaySortKey(d.day() as Weekday), "day");
  const dimanche = lundi.add(6, "day");
  return {
    date_from: toIsoDate(lundi.toDate()),
    date_to: toIsoDate(dimanche.toDate()),
  };
};
