import {
  Assignment,
  AttachMoney,
  Build,
  CleaningServices,
  LocalShipping,
  Recycling,
  School,
} from "@mui/icons-material";
import type { ChipProps } from "@mui/material";
import type { ReactElement } from "react";

export type TaskCategoryValue =
  | "collection"
  | "sorting"
  | "maintenance"
  | "sales"
  | "administration"
  | "cleaning"
  | "transport"
  | "training";

export type TaskCategory = {
  value: TaskCategoryValue;
  label: string;
  icon: ReactElement;
  color: ChipProps["color"];
};

export const TASK_CATEGORIES: TaskCategory[] = [
  {
    value: "collection",
    label: "Collecte",
    icon: <LocalShipping fontSize="small" />,
    color: "primary",
  },
  {
    value: "sorting",
    label: "Tri",
    icon: <Recycling fontSize="small" />,
    color: "secondary",
  },
  {
    value: "maintenance",
    label: "Maintenance",
    icon: <Build fontSize="small" />,
    color: "warning",
  },
  {
    value: "sales",
    label: "Vente",
    icon: <AttachMoney fontSize="small" />,
    color: "success",
  },
  {
    value: "administration",
    label: "Administration",
    icon: <Assignment fontSize="small" />,
    color: "info",
  },
  {
    value: "cleaning",
    label: "Nettoyage",
    icon: <CleaningServices fontSize="small" />,
    color: "default",
  },
  {
    value: "transport",
    label: "Transport",
    icon: <LocalShipping fontSize="small" />,
    color: "primary",
  },
  {
    value: "training",
    label: "Formation",
    icon: <School fontSize="small" />,
    color: "secondary",
  },
];

export const getTaskCategory = (value: string) =>
  TASK_CATEGORIES.find((category) => category.value === value);
