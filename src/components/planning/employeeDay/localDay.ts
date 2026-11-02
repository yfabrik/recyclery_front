import {
  assignableWindows,
  clipWindow,
  overlap,
  timeToMinutes,
  type MinuteWindow,
} from "@recyclerie/api/domain/timeRange";
import type {
  EmployeeTaskStatus,
  EmployeeTaskUnavailableReason,
  EmployeeTasksDayDto,
} from "@recyclerie/api/responses/employeeTasks";
import type { TaskDto } from "@recyclerie/api/responses/tasks";
import { taskMinuteWindow } from "./dayModel";
import type { LocalRange } from "../taskAssignment/geometry";

/**
 * One of the Employee's Time ranges as the dialog edits it: the Task dialog's `LocalRange`
 * plus the Task it belongs to (the Employee is the same for the whole day).
 */
export interface DayRange extends LocalRange {
  taskId: number;
}

/** A Task of the day as the dialog shows it, re-derived from the local Time ranges on every change. */
export interface EmployeeDayRow {
  task: TaskDto;
  status: EmployeeTaskStatus;
  /** The Employee's Time ranges on this Task, earliest first; non-empty iff `assigned`. */
  ranges: DayRange[];
  /**
   * Where the Employee could work on this Task: Workday hours inside the Task minus their
   * Time ranges on OTHER Tasks (their ranges here are not subtracted, as for the endpoint).
   * Empty when `unavailable`.
   */
  freeWindows: MinuteWindow[];
  /** Only when `status` is `unavailable`. */
  reason?: EmployeeTaskUnavailableReason;
  /** Only when `reason` is `busy` and the blocking range is known. */
  blockedBy?: TaskDto;
}

/** The server's Time ranges of the day, as the local state starts from (and reverts to). */
export const seedDayRanges = (day: EmployeeTasksDayDto): DayRange[] =>
  day.rows.flatMap((row) =>
    row.timeRanges.map((range) => ({
      key: `server-${range.id}`,
      id: range.id,
      employeeId: range.employee_id,
      taskId: row.task.id,
      start: timeToMinutes(range.start_time),
      end: timeToMinutes(range.end_time),
    })),
  );

const byStart = (a: MinuteWindow, b: MinuteWindow) => a.start - b.start || a.end - b.end;

/**
 * Every Task of the day with its status for the Employee given their CURRENT (local) Time
 * ranges, following the endpoint's rules so that the initial state equals the server's
 * and assigning one Task immediately updates the others (a Task the new range now covers
 * becomes `busy`, an unassigned one is free again):
 *
 * - holds a range here: `assigned`;
 * - Vacation that day: `unavailable` / `vacation`;
 * - no Workday hours inside the Task: `unavailable` / `outside-hours`;
 * - Workday hours left once their other Tasks' ranges are subtracted: `assignable`;
 * - otherwise `unavailable` / `busy`, blocked by the Task holding the earliest overlapping range.
 *
 * Rows keep the endpoint's order (the set of Tasks is the server's, only statuses are local).
 */
export const deriveDayRows = (day: EmployeeTasksDayDto, ranges: readonly DayRange[]): EmployeeDayRow[] => {
  const workWindows: MinuteWindow[] = day.workWindows.map((window) => ({
    start: timeToMinutes(window.start_time),
    end: timeToMinutes(window.end_time),
  }));
  const tasksById = new Map(day.rows.map(({ task }) => [task.id, task]));

  return day.rows.map(({ task }): EmployeeDayRow => {
    const taskWindow = taskMinuteWindow(task);
    const own = ranges.filter((range) => range.taskId === task.id).sort(byStart);
    const others = ranges.filter((range) => range.taskId !== task.id);
    const freeWindows = assignableWindows({ task: taskWindow, workWindows, otherRanges: others });

    if (own.length > 0) return { task, status: "assigned", ranges: own, freeWindows };
    if (day.vacation) return { task, status: "unavailable", ranges: [], freeWindows: [], reason: "vacation" };

    const hoursInTask = workWindows.flatMap((window) => clipWindow(window, taskWindow) ?? []);
    if (hoursInTask.length === 0) {
      return { task, status: "unavailable", ranges: [], freeWindows: [], reason: "outside-hours" };
    }
    if (freeWindows.length > 0) return { task, status: "assignable", ranges: [], freeWindows };

    const blocker = others
      .filter((range) => hoursInTask.some((hours) => overlap(hours, range)))
      .sort(byStart)[0];
    const blockedBy = blocker ? tasksById.get(blocker.taskId) : undefined;
    return {
      task,
      status: "unavailable",
      ranges: [],
      freeWindows: [],
      reason: "busy",
      ...(blockedBy ? { blockedBy } : {}),
    };
  });
};
