import { Flag, FlagOutlined, PriorityHigh } from "@mui/icons-material";
import type { ChipProps } from "@mui/material";
import type { ReactElement } from "react";

export type TaskPriorityValue = "low" | "medium" | "high" | "urgent";

export type TaskPriority = {
  [K in TaskPriorityValue]: {
    value: K;
    label: string;
    icon: ReactElement;
    color: NonNullable<ChipProps["color"]>;
  };
}[TaskPriorityValue];

function defineTaskPriorities<const T extends readonly TaskPriority[]>(
  priorities: T & (TaskPriorityValue extends T[number]["value"] ? T : never),
): T {
  return priorities;
}

export const TASK_PRIORITIES = defineTaskPriorities([
  {
    value: "low",
    label: "Faible",
    icon: <FlagOutlined />,
    color: "success",
  },
  {
    value: "medium",
    label: "Moyenne",
    icon: <Flag />,
    color: "warning",
  },
  {
    value: "high",
    label: "Élevée",
    icon: <PriorityHigh />,
    color: "error",
  },
  {
    value: "urgent",
    label: "Urgente",
    icon: <PriorityHigh />,
    color: "error",
  },
] as const);

export const TASK_PRIORITY_VALUES = TASK_PRIORITIES.map(
  (priority) => priority.value,
);

export const PRIORITY_FILTER_VALUES = [
  "all",
  ...TASK_PRIORITY_VALUES,
] as const;

export type PriorityFilter = (typeof PRIORITY_FILTER_VALUES)[number];

export const getTaskPriority = (value: string) =>
  TASK_PRIORITIES.find((priority) => priority.value === value);

export const getTaskPriorityLabel = (priority: TaskPriorityValue | string) =>
  getTaskPriority(priority)?.label ?? priority;

export const getTaskPriorityColor = (
  priority: TaskPriorityValue | string,
): NonNullable<ChipProps["color"]> =>
  getTaskPriority(priority)?.color ?? "default";

// Backward-compatible alias for migrated imports
export const PRIORITIES = TASK_PRIORITIES;
