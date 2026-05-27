import type { SxProps, Theme } from "@mui/material";
import type { TaskModel } from "../../interfaces/Models";

export type TaskVariant = "opening" | "presence" | "default" | "collection";

export type CategoryKey = "vente" | "point" | "custom" | "collection";

export interface TaskCss {
  color: string;
  fontSize: string;
  fontWeight: string | number;
  border: string;
  bgColor: string;
}

export interface CategoryStyle {
  card: Record<string, unknown>;
  task: Record<string, unknown>;
  taskCss: TaskCss;
}

/**
 * Single source of truth for task card styles (default rules from WeekTaskSection).
 * Used by DayView, CalendarView, and WeekTaskSection.
 */
export const categoryStyles: Record<CategoryKey, CategoryStyle> = {
  vente: {
    card: {
      backgroundColor: "#f1f8e9",
      border: "1px solid #c8e6c9",
      "&:hover": {
        backgroundColor: "#e8f5e8",
        boxShadow: "0 2px 8px rgba(76, 175, 80, 0.2)",
      },
    },
    task: {
      backgroundColor: "#e8f5e8",
      border: "2px solid #4caf50",
      borderLeft: "4px solid #4caf50",
      "&:hover": {
        backgroundColor: "#d4edda",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 8px rgba(76, 175, 80, 0.3)",
      },
    },
    taskCss: {
      color: "#2e7d32",
      fontSize: "0.65rem",
      fontWeight: "bold",
      border: "1px solid #4caf50",
      bgColor: "#e8f5e8",
    },
  },
  point: {
    card: {
      backgroundColor: "#fff8e1",
      border: "1px solid #ffcc02",
      "&:hover": {
        backgroundColor: "#fff3e0",
        boxShadow: "0 2px 8px rgba(255, 152, 0, 0.2)",
      },
    },
    task: {
      backgroundColor: "#fff3e0",
      border: "2px solid #ff9800",
      borderLeft: "4px solid #ff9800",
      "&:hover": {
        backgroundColor: "#ffe0b2",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 8px rgba(255, 152, 0, 0.3)",
      },
    },
    taskCss: {
      color: "#e65100",
      fontSize: "0.7rem",
      fontWeight: "medium",
      border: "1px solid #ffcc02",
      bgColor: "#fff3e0",
    },
  },
  custom: {
    card: {
      backgroundColor: "#e3f2fd",
      border: "1px solid #90caf9",
      "&:hover": {
        backgroundColor: "#bbdefb",
        boxShadow: "0 2px 8px rgba(33, 150, 243, 0.2)",
      },
    },
    task: {
      backgroundColor: "#bbdefb",
      border: "2px solid #2196f3",
      borderLeft: "4px solid #2196f3",
      "&:hover": {
        backgroundColor: "#90caf9",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 8px rgba(33, 150, 243, 0.3)",
      },
    },
    taskCss: {
      color: "#1565c0",
      fontSize: "0.65rem",
      fontWeight: "bold",
      border: "1px solid #2196f3",
      bgColor: "#e3f2fd",
    },
  },
  collection: {
    card: {
      backgroundColor: "#f3e5f5",
      border: "1px solid #ce93d8",
      "&:hover": {
        backgroundColor: "#e1bee7",
        boxShadow: "0 2px 8px rgba(156, 39, 176, 0.2)",
      },
    },
    task: {
      backgroundColor: "#e1bee7",
      border: "2px solid #9c27b0",
      borderLeft: "4px solid #9c27b0",
      "&:hover": {
        backgroundColor: "#ce93d8",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 8px rgba(156, 39, 176, 0.3)",
      },
    },
    taskCss: {
      color: "#6a1b9a",
      fontSize: "0.65rem",
      fontWeight: "bold",
      border: "1px solid #9c27b0",
      bgColor: "#f3e5f5",
    },
  },
};

const CATEGORY_KEYS: CategoryKey[] = ["vente", "point", "custom", "collection"];

export const getCategoryKey = (schedule: TaskModel): CategoryKey => {
  const c = schedule.category;
  return CATEGORY_KEYS.includes(c as CategoryKey) ? (c as CategoryKey) : "custom";
};

export const getTaskVariant = (schedule: TaskModel): TaskVariant =>
  schedule.category === "vente"
    ? "opening"
    : schedule.category === "point"
      ? "presence"
      : schedule.category === "collection"
        ? "collection" :
        "default";

/**
 * Card-level styles per task variant (for DayView).
 * Default = custom (blue) from WeekTaskSection.
 */
export const taskCardStyles: Record<TaskVariant, SxProps<Theme>> = {
  opening: categoryStyles.vente.task as SxProps<Theme>,
  presence: categoryStyles.point.task as SxProps<Theme>,
  default: categoryStyles.custom.task as SxProps<Theme>,
  collection: categoryStyles.collection.task as SxProps<Theme>,
};

/**
 * Calendar cell task styles: box sx, typography sx, iconColor (for CalendarView).
 * Default = custom (blue) from WeekTaskSection.
 */
export const calendarTaskStyles: Record<
  TaskVariant,
  { box: SxProps<Theme>; typography: SxProps<Theme>; iconColor: string }
> = {
  opening: {
    box: {
      p: 1,
      borderRadius: 1,
      cursor: "pointer",
      transition: "all 0.2s",
      ...categoryStyles.vente.card,
      "&:hover": {
        ...(categoryStyles.vente.card["&:hover"] as object),
        transform: "translateY(-1px)",
      },
    },
    typography: {
      color: categoryStyles.vente.taskCss.color,
      fontSize: "0.75rem",
    },
    iconColor: "#4caf50",
  },
  presence: {
    box: {
      p: 1,
      borderRadius: 1,
      cursor: "pointer",
      transition: "all 0.2s",
      ...categoryStyles.point.card,
      "&:hover": {
        ...(categoryStyles.point.card["&:hover"] as object),
        transform: "translateY(-1px)",
      },
    },
    typography: {
      color: categoryStyles.point.taskCss.color,
      fontSize: "0.75rem",
    },
    iconColor: "#ff9800",
  },
  collection: {
    box: {
      p: 1,
      borderRadius: 1,
      cursor: "pointer",
      transition: "all 0.2s",
      ...categoryStyles.collection.card,
      "&:hover": {
        ...(categoryStyles.point.card["&:hover"] as object),
        transform: "translateY(-1px)",
      },

    },
    typography: {
      color: categoryStyles.collection.taskCss.color,
      fontSize: "0.75rem",
    },
    iconColor: "#9c27b0",
  },
  default: {
    box: {
      p: 1,
      borderRadius: 1,
      cursor: "pointer",
      transition: "all 0.2s",
      ...categoryStyles.custom.card,
      "&:hover": {
        ...(categoryStyles.custom.card["&:hover"] as object),
        transform: "translateY(-1px)",
      },
    },
    typography: {
      color: categoryStyles.custom.taskCss.color,
      fontSize: "0.75rem",
    },
    iconColor: "#1976d2",
  },
};
