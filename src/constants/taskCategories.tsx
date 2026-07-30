import {
  LocalShipping,
  Place,
  Storefront,
  TaskAlt,
} from "@mui/icons-material";
import type { ChipProps } from "@mui/material";
import type { ReactElement } from "react";
import type { TaskCategory as ApiTaskCategory } from "@recyclerie/api/enums";

export type TaskCategoryValue = ApiTaskCategory;

export type TaskCategory = {
  [K in TaskCategoryValue]: {
    value: K;
    label: string;
    icon: ReactElement;
    color: NonNullable<ChipProps["color"]>;
  };
}[TaskCategoryValue];

function defineTaskCategories<const T extends readonly TaskCategory[]>(
  categories: T & (TaskCategoryValue extends T[number]["value"] ? T : never),
): T {
  return categories;
}

/** UI metadata for `@recyclerie/api/enums` TASK_CATEGORIES. */
export const TASK_CATEGORIES = defineTaskCategories([
  {
    value: "vente",
    label: "Vente",
    icon: <Storefront fontSize="small" />,
    color: "success",
  },
  {
    value: "point",
    label: "Présence point collecte",
    icon: <Place fontSize="small" />,
    color: "info",
  },
  {
    value: "collection",
    label: "Collecte",
    icon: <LocalShipping fontSize="small" />,
    color: "primary",
  },
  {
    value: "custom",
    label: "Tâche personnalisée",
    icon: <TaskAlt fontSize="small" />,
    color: "secondary",
  },
] as const);

export const TASK_CATEGORY_VALUES = TASK_CATEGORIES.map(
  (category) => category.value,
);

export const getTaskCategory = (value: string) =>
  TASK_CATEGORIES.find((category) => category.value === value);

export const getTaskCategoryLabel = (category: TaskCategoryValue | string) =>
  getTaskCategory(category)?.label ?? category;

export const getTaskCategoryColor = (
  category: TaskCategoryValue | string,
): NonNullable<ChipProps["color"]> =>
  getTaskCategory(category)?.color ?? "default";
