import { toIsoDate } from "@recyclerie/api/domain/date";
import { timeToMinutes } from "@recyclerie/api/domain/timeRange";
import type { TimeSlot } from "@recyclerie/api/enums";
import type { TimeRangeDto } from "@recyclerie/api/responses/timeRanges";
import { timeSlotOfMinutes } from "../../constants/workdayTimeSlots";
import {
  assigneesForPrint,
  printedTasksMixStores,
  printEmployeeName,
  type PrintMode,
  type PrintTask,
} from "./printSelection";

/** A printed Task: what the print needs of it besides who is on it and their ranges. */
export type PrintEntryTask = PrintTask & {
  name: string;
  category?: string;
  scheduled_date: Date | string;
  Recyclery?: { name: string } | null;
};

/** One Time range of one Employee, as printed. Times are `HH:mm`, the day is `date`. */
export interface EmployeeTimeRangeItem {
  date: string;
  start_time: string;
  end_time: string;
  name: string;
  category?: string;
  storeName: string | null;
}

export interface EmployeeTimeRangeList {
  employeeId: number;
  employeeName: string;
  items: EmployeeTimeRangeItem[];
}

export interface GridCellLine {
  text: string;
  storeName: string | null;
}

export function toTimeRangeItem(
  task: PrintEntryTask,
  range: Pick<TimeRangeDto, "start_time" | "end_time">,
  storeName: string | null,
): EmployeeTimeRangeItem {
  return {
    date: toIsoDate(task.scheduled_date),
    start_time: range.start_time,
    end_time: range.end_time,
    name: task.name,
    category: task.category,
    storeName,
  };
}

export function formatRangeCell(
  item: Pick<EmployeeTimeRangeItem, "start_time" | "end_time" | "name">,
): string {
  return `${item.start_time}-${item.end_time} ${item.name}`;
}

/** Column of a range: by its start, so a range crossing noon stays in the morning. */
export function slotOfRange(range: { start_time: string }): TimeSlot {
  return timeSlotOfMinutes(timeToMinutes(range.start_time));
}

/** Date, then range start. Only the time of day of a range is meaningful; ISO `YYYY-MM-DD` dates compare chronologically as strings. */
function compareItems(
  a: EmployeeTimeRangeItem,
  b: EmployeeTimeRangeItem,
): number {
  if (a.date !== b.date) {
    return a.date < b.date ? -1 : 1;
  }
  return timeToMinutes(a.start_time) - timeToMinutes(b.start_time);
}

/**
 * One list per Employee: an entry per Time range they cover on the printed
 * Tasks, sorted by date then range start. The Task's own start/end are not read.
 * An Assignment without Time ranges is skipped.
 */
export function employeeTimeRangeLists(input: {
  tasks: readonly PrintEntryTask[];
  mode: PrintMode;
  selectedEmployeeIds: readonly number[];
}): EmployeeTimeRangeList[] {
  const showStore = printedTasksMixStores(input.tasks);
  const byEmployee = new Map<number, EmployeeTimeRangeList>();

  for (const task of input.tasks) {
    const storeName = showStore ? (task.Recyclery?.name ?? null) : null;
    const assignees = assigneesForPrint(
      task,
      input.mode,
      input.selectedEmployeeIds,
    );
    for (const employee of assignees) {
      const ranges = (task.timeRanges ?? []).filter(
        (range) => range.employee_id === employee.id,
      );
      if (ranges.length === 0) {
        if (import.meta.env.DEV) {
          console.warn(
            `Assignment without Time range: employee ${employee.id} on task ${task.id}`,
          );
        }
        continue;
      }
      let list = byEmployee.get(employee.id);
      if (!list) {
        list = {
          employeeId: employee.id,
          employeeName: printEmployeeName(employee),
          items: [],
        };
        byEmployee.set(employee.id, list);
      }
      for (const range of ranges) {
        list.items.push(toTimeRangeItem(task, range, storeName));
      }
    }
  }

  return [...byEmployee.values()].map((list) => ({
    ...list,
    items: [...list.items].sort(compareItems),
  }));
}

/** Grid cells keyed `${date}-morning` / `${date}-afternoon`; entries outside `dayIsos` are dropped. */
export function buildGridCells(
  items: readonly EmployeeTimeRangeItem[],
  dayIsos: readonly string[],
): Record<string, GridCellLine[]> {
  const cells: Record<string, GridCellLine[]> = {};
  for (const iso of dayIsos) {
    cells[`${iso}-morning`] = [];
    cells[`${iso}-afternoon`] = [];
  }
  for (const item of items) {
    const key = `${item.date}-${slotOfRange(item)}`;
    cells[key]?.push({ text: formatRangeCell(item), storeName: item.storeName });
  }
  return cells;
}
