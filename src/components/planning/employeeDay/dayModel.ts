import { timeToMinutes, type MinuteWindow } from "@recyclerie/api/domain/timeRange";
import { toIsoTime } from "@recyclerie/api/domain/date";
import type { EmployeeTaskRowDto } from "@recyclerie/api/responses/employeeTasks";
import type { TaskDto } from "@recyclerie/api/responses/tasks";
import { formatMinutes } from "../taskAssignment/geometry";

/** A Task's span in Paris minutes since midnight (its times arrive as UTC instants). */
export const taskMinuteWindow = (task: Pick<TaskDto, "start_time" | "end_time">): MinuteWindow => ({
  start: timeToMinutes(toIsoTime(task.start_time)),
  end: timeToMinutes(toIsoTime(task.end_time)),
});

/** "09:00–12:00" */
export const formatWindow = (window: MinuteWindow): string =>
  `${formatMinutes(window.start)}–${formatMinutes(window.end)}`;

/** "09:00–12:00 · Centre" : when a Task runs and where, as the Task cards show it under its name. */
export const describeTaskPlace = (task: Pick<TaskDto, "start_time" | "end_time" | "Recyclery">): string =>
  `${formatWindow(taskMinuteWindow(task))} · ${task.Recyclery?.name ?? "Sans magasin"}`;

export const totalMinutes = (windows: readonly MinuteWindow[]): number =>
  windows.reduce((sum, window) => sum + (window.end - window.start), 0);

/** "5 h", "1 h 30", "45 min" */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${String(rest).padStart(2, "0")}`;
};

/** Day strip axis used when the Employee neither works nor holds a Time range that day. */
const DEFAULT_STRIP: MinuteWindow = { start: 8 * 60, end: 18 * 60 };

/** Whole-hour axis covering every given window; a default working day when there is none. */
export const dayStripBounds = (windows: readonly MinuteWindow[]): MinuteWindow => {
  if (windows.length === 0) return DEFAULT_STRIP;
  return {
    start: Math.floor(Math.min(...windows.map((window) => window.start)) / 60) * 60,
    end: Math.ceil(Math.max(...windows.map((window) => window.end)) / 60) * 60,
  };
};

/** Hour labels along the axis; every 2 hours once the axis is longer than 12 hours. */
export const hourTicks = ({ start, end }: MinuteWindow): number[] => {
  const step = end - start > 12 * 60 ? 120 : 60;
  const ticks: number[] = [];
  for (let value = start; value <= end; value += step) ticks.push(value);
  return ticks;
};

export interface EmployeeDayColumns<Row extends Pick<EmployeeTaskRowDto, "status">> {
  /** Rows the Employee holds, in the endpoint's order (start time). */
  assigned: Row[];
  /** Rows they could take (`assignable`) and rows they cannot (`unavailable`), in the endpoint's order. */
  others: Row[];
}

export const splitRows = <Row extends Pick<EmployeeTaskRowDto, "status">>(
  rows: readonly Row[],
): EmployeeDayColumns<Row> => ({
  assigned: rows.filter((row) => row.status === "assigned"),
  others: rows.filter((row) => row.status !== "assigned"),
});

/** Why an `unavailable` row cannot take the Employee, in French. */
export const unavailableReasonText = (row: Pick<EmployeeTaskRowDto, "reason" | "blockedBy">): string => {
  switch (row.reason) {
    case "vacation":
      return "En congé";
    case "outside-hours":
      return "Hors de ses horaires de travail";
    case "busy":
      return row.blockedBy ? `Déjà sur « ${row.blockedBy.name} »` : "Déjà occupé";
    case undefined:
      return "Indisponible";
    default: {
      const unreachable: never = row.reason;
      return unreachable;
    }
  }
};
