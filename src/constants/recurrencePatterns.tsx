import { CalendarMonth, CalendarViewDay, CalendarViewWeek } from "@mui/icons-material";
import type { ChipProps } from "@mui/material";
import type { ReactElement } from "react";
import type { ScheduleModel } from "../interfaces/Models";

export type RecurrencePatternValue = ScheduleModel["recurrence_pattern"];

export type RecurrencePattern = {
  [K in NonNullable<RecurrencePatternValue>]: {
    value: K;
    label: string;
    icon: ReactElement;
    color: NonNullable<ChipProps["color"]>;
  };
}[NonNullable<RecurrencePatternValue>];

function defineRecurrencePatterns<
  const T extends readonly RecurrencePattern[],
>(
  patterns: T &
    (NonNullable<RecurrencePatternValue> extends T[number]["value"]
      ? T
      : never),
): T {
  return patterns;
}

export const RECURRENCE_PATTERNS = defineRecurrencePatterns([
  {
    value: "daily",
    label: "Quotidienne",
    icon: <CalendarViewDay />,
    color: "primary",
  },
  {
    value: "weekly",
    label: "Hebdomadaire",
    icon: <CalendarViewWeek />,
    color: "info",
  },
  {
    value: "monthly",
    label: "Mensuelle",
    icon: <CalendarMonth />,
    color: "secondary",
  },
] as const);

export const RECURRENCE_PATTERN_VALUES = RECURRENCE_PATTERNS.map(
  (pattern) => pattern.value,
);

export const RECURRENCE_PATTERN_FORM_OPTIONS = [
  { value: "" as const, label: "Aucune" },
  ...RECURRENCE_PATTERNS,
];

export const RECURRENCE_FILTER_VALUES = [
  "all",
  "none",
  ...RECURRENCE_PATTERN_VALUES,
] as const;

export type RecurrenceFilter = (typeof RECURRENCE_FILTER_VALUES)[number];

export const getRecurrencePattern = (value: string) =>
  RECURRENCE_PATTERNS.find((pattern) => pattern.value === value);

export const getRecurrencePatternLabel = (
  pattern: RecurrencePatternValue | string | null | undefined,
) => {
  if (!pattern) return "Aucune";
  return getRecurrencePattern(pattern)?.label ?? pattern;//FIXME
};

export const getRecurrencePatternColor = (
  pattern: NonNullable<RecurrencePatternValue> | string,
): NonNullable<ChipProps["color"]> =>
  getRecurrencePattern(pattern)?.color ?? "default";
