import type { Weekday } from "@recyclerie/api/enums";
import type { IsoDate } from "@recyclerie/api/primitives/zod";
import { toIsoDate, WEEKDAYS_MONDAY_FIRST } from "../dateService";
import { dateOfWeekday } from "./employeeDayDate";

/** What the markers need of a Task listed with `include=user`. */
export interface MarkerTask {
  id: number;
  scheduled_date: string;
  Employees?: readonly { id: number }[] | undefined;
}

/** Employee id -> number of distinct Tasks. */
export type TaskCountByEmployee = ReadonlyMap<number, number>;

/** What the presence header shows on the card of one day. */
export interface DayMarkers {
  /** Distinct Tasks per Employee that day; Employees without a Task are absent. */
  taskCounts: TaskCountByEmployee;
  /**
   * Vacation conflicts that day: the Employees on Vacation who still hold at least one Task,
   * with their number of distinct Tasks.
   */
  conflicts: TaskCountByEmployee;
}

export const NO_MARKERS: DayMarkers = { taskCounts: new Map(), conflicts: new Map() };

/**
 * Distinct Tasks per Employee per day. A Task counts for the Paris day of its `scheduled_date`;
 * an Employee listed twice on a Task, or holding several Time ranges on it, counts once.
 */
export const taskCountsByDay = (tasks: readonly MarkerTask[]): ReadonlyMap<IsoDate, TaskCountByEmployee> => {
  const taskIdsByDay = new Map<IsoDate, Map<number, Set<number>>>();
  for (const task of tasks) {
    const day = toIsoDate(task.scheduled_date);
    for (const employee of task.Employees ?? []) {
      let byEmployee = taskIdsByDay.get(day);
      if (!byEmployee) taskIdsByDay.set(day, (byEmployee = new Map()));
      let taskIds = byEmployee.get(employee.id);
      if (!taskIds) byEmployee.set(employee.id, (taskIds = new Set()));
      taskIds.add(task.id);
    }
  }
  return new Map(
    [...taskIdsByDay].map(([day, byEmployee]) => [
      day,
      new Map([...byEmployee].map(([employeeId, taskIds]) => [employeeId, taskIds.size])),
    ]),
  );
};

/** The Employees on Vacation that day who hold a Task (a Vacation conflict), with their Task count. */
export const vacationConflicts = (
  taskCounts: TaskCountByEmployee,
  onVacationEmployeeIds: ReadonlySet<number> | undefined,
): TaskCountByEmployee => {
  const conflicts = new Map<number, number>();
  if (!onVacationEmployeeIds) return conflicts;
  for (const [employeeId, count] of taskCounts) {
    if (count > 0 && onVacationEmployeeIds.has(employeeId)) conflicts.set(employeeId, count);
  }
  return conflicts;
};

interface WeekMarkersInput {
  tasks: readonly MarkerTask[];
  /** Monday of the displayed week. */
  weekStart: IsoDate;
  /** Employees on Vacation per weekday of that week (what the presence header already receives). */
  vacationEmployeeIdsByDay: Readonly<Partial<Record<Weekday, ReadonlySet<number>>>>;
}

/** The week's Tasks crossed with its Vacations: the markers of each day card, by weekday. */
export const weekMarkersByWeekday = ({
  tasks,
  weekStart,
  vacationEmployeeIdsByDay,
}: WeekMarkersInput): Partial<Record<Weekday, DayMarkers>> => {
  const countsByDay = taskCountsByDay(tasks);
  const markers: Partial<Record<Weekday, DayMarkers>> = {};
  for (const weekday of WEEKDAYS_MONDAY_FIRST) {
    const taskCounts = countsByDay.get(dateOfWeekday(weekStart, weekday));
    if (!taskCounts) continue;
    markers[weekday] = { taskCounts, conflicts: vacationConflicts(taskCounts, vacationEmployeeIdsByDay[weekday]) };
  }
  return markers;
};

/**
 * Number of conflicts the day card announces: the conflicting Employees among those the card
 * lists. Counted by Employee, not by badge, so an Employee listed in two sections counts once.
 */
export const conflictCountAmong = (markers: DayMarkers, shownEmployeeIds: Iterable<number>): number =>
  new Set([...shownEmployeeIds].filter((id) => markers.conflicts.has(id))).size;
