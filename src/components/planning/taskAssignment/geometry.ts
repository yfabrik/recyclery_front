import {
  assignableWindows,
  timeToMinutes,
  TIME_RANGE_STEP_MINUTES,
  type MinuteWindow,
} from "@recyclerie/api/domain/timeRange";
import type { WorkWindowDto } from "@recyclerie/api/responses/timeRanges";

export const formatMinutes = (value: number): string => {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export const hourMarks = (from: number, to: number): { value: number; label: string }[] => {
  const marks: { value: number; label: string }[] = [];
  const firstHour = Math.ceil(from / 60) * 60;
  for (let value = firstHour; value <= to; value += 60) {
    marks.push({ value, label: formatMinutes(value) });
  }
  return marks;
};

export const isMinuteRange = (value: number | readonly number[]): value is [number, number] =>
  Array.isArray(value) && value.length === 2;

export const toMinuteWindow = (
  window: WorkWindowDto | { start_time: string; end_time: string },
): MinuteWindow => ({
  start: timeToMinutes(window.start_time),
  end: timeToMinutes(window.end_time),
});

/** One Time range as edited locally; `id` is null until its create call resolves. */
export interface LocalRange {
  key: string;
  id: number | null;
  employeeId: number;
  start: number;
  end: number;
}

export interface EmployeeInfo {
  id: number;
  nom: string;
  prenom: string;
  fullName?: string | undefined;
  workWindows: WorkWindowDto[];
  busyRanges: { start_time: string; end_time: string }[];
}

export const otherLocalRangesForEmployee = (
  ranges: readonly LocalRange[],
  employeeId: number,
  exceptKey?: string,
): MinuteWindow[] =>
  ranges
    .filter((range) => range.employeeId === employeeId && range.key !== exceptKey)
    .map((range) => ({ start: range.start, end: range.end }));

/** Windows a new or dragged range can land in: the Employee's Workday hours inside
 * the Task, minus their busy Time ranges on other Tasks and their other ranges here. */
export const freeWindowsForEmployee = (
  task: MinuteWindow,
  info: EmployeeInfo,
  ranges: readonly LocalRange[],
  exceptKey?: string,
): MinuteWindow[] =>
  assignableWindows({
    task,
    workWindows: info.workWindows.map(toMinuteWindow),
    otherRanges: [
      ...info.busyRanges.map(toMinuteWindow),
      ...otherLocalRangesForEmployee(ranges, info.id, exceptKey),
    ],
  });

export interface CoverageSegment {
  start: number;
  end: number;
  count: number;
}

const coverageAt = (ranges: readonly LocalRange[], minute: number): number =>
  ranges.filter((range) => range.start <= minute && range.end > minute).length;

/** Headcount over the Task's span, sliced to the grid and merged where the count doesn't change. */
export const coverageSegments = (
  task: MinuteWindow,
  ranges: readonly LocalRange[],
): CoverageSegment[] => {
  const raw: CoverageSegment[] = [];
  for (let start = task.start; start < task.end; start += TIME_RANGE_STEP_MINUTES) {
    const end = Math.min(start + TIME_RANGE_STEP_MINUTES, task.end);
    raw.push({ start, end, count: coverageAt(ranges, start) });
  }
  const merged: CoverageSegment[] = [];
  for (const segment of raw) {
    const last = merged[merged.length - 1];
    if (last && last.count === segment.count && last.end === segment.start) {
      last.end = segment.end;
    } else {
      merged.push({ ...segment });
    }
  }
  return merged;
};

const COVERAGE_COLORS = ["#cfd8dc", "#ffb74d", "#66bb6a", "#2e7d32"];
export const coverageColor = (count: number) => COVERAGE_COLORS[Math.min(count, 3)];

export const BLOCKED_FILL =
  "repeating-linear-gradient(-45deg, #e57373, #e57373 4px, #ffcdd2 4px, #ffcdd2 8px)";
