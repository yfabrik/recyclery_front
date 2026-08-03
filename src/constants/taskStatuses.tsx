import { Add, PlayArrow, Save, Stop, Task } from "@mui/icons-material";
import type { ChipProps } from "@mui/material";
import type { ReactElement } from "react";

export type TaskStatusValue =
  | "new"
  | "planned"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TaskStatus = {
  [K in TaskStatusValue]: {
    value: K;
    label: string;
    icon: ReactElement;
    color: NonNullable<ChipProps["color"]>;
  };
}[TaskStatusValue];

function defineTaskStatuses<const T extends readonly TaskStatus[]>(
  statuses: T & (TaskStatusValue extends T[number]["value"] ? T : never),
): T {
  return statuses;
}

export const TASK_STATUSES = defineTaskStatuses([
  {
    value: "new",
    label: "Nouveau",
    icon: <Add />,
    color: "default",
  },
  {
    value: "planned",
    label: "Planifié",
    icon: <Task />,
    color: "primary",
  },
  {
    value: "in_progress",
    label: "En cours",
    icon: <PlayArrow />,
    color: "warning",
  },
  {
    value: "completed",
    label: "Terminé",
    icon: <Save />,
    color: "success",
  },
  {
    value: "cancelled",
    label: "Annulé",
    icon: <Stop />,
    color: "error",
  },
] as const);

export const TASK_STATUS_VALUES = TASK_STATUSES.map((status) => status.value);

export const getTaskStatus = (value: string | null | undefined) =>
  TASK_STATUSES.find((status) => status.value === value) ??
  TASK_STATUSES.find((status) => status.value === "planned")!;

export const getTaskStatusLabel = (status: TaskStatusValue | string | null) =>
  getTaskStatus(status).label;

export const getTaskStatusColor = (
  status: TaskStatusValue | string | null,
): NonNullable<ChipProps["color"]> => getTaskStatus(status).color;
