import {
  Add,
  ArrowBackIos,
  ArrowForwardIos,
  CalendarToday,
} from "@mui/icons-material";
import { Box, Button, IconButton, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { ViewSelector, type ViewMode } from "./ViewSelector";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type NavigationType = "month" | "day" | "week";
export type { ViewMode };

interface StatusFilter {
  value: string;
  color: "primary" | "warning" | "success" | "error" | "default" | string;
  label: string;
}

interface PlanningViewHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onNewTask: () => void;
  // Optional: Status filters (only for calendar view)
  statusFilters?: StatusFilter[];
  filterStatus?: string;
  onFilterStatusChange?: (status: string) => void;
  // Optional: Custom date display
  customDateDisplay?: ReactNode;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Reusable header component for planning views (Calendar, Day, Week)
 * Automatically determines title and navigation type based on viewMode
 */
export const PlanningViewHeader = ({
  viewMode,
  onViewModeChange,
  selectedDate,
  onDateChange,
  onNewTask,
  statusFilters,
  filterStatus,
  onFilterStatusChange,
  customDateDisplay,
}: PlanningViewHeaderProps) => {
  // Automatically determine configuration based on viewMode
  const getViewConfig = () => {
    switch (viewMode) {
      case "calendar":
        return {
          title: "Calendrier des Lieux de collecte",
          titleVariant: "h3" as const,
          navigationType: "month" as NavigationType,
        };
      case "week":
        return {
          title: "Vue Semaine",
          titleVariant: "h4" as const,
          navigationType: "week" as NavigationType,
        };
      case "day":
        return {
          title: "Vue Jour",
          titleVariant: "h4" as const,
          navigationType: "day" as NavigationType,
        };
    }
  };

  const { title, titleVariant, navigationType } = getViewConfig();
  const handlePrevious = () => {
    let newDate: Date;
    switch (navigationType) {
      case "month":
        newDate = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() - 1,
        );
        break;
      case "day":
        newDate = new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        newDate = new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    let newDate: Date;
    switch (navigationType) {
      case "month":
        newDate = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
        );
        break;
      case "day":
        newDate = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000);
        break;
      case "week":
        newDate = new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
    }
    onDateChange(newDate);
  };

  const getDateDisplay = () => {
    if (customDateDisplay) {
      return customDateDisplay;
    }

    switch (navigationType) {
      case "month": {
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mx: 2 }}>
            <CalendarToday sx={{ color: "#666", fontSize: 20 }} />
            <Typography variant="h5" sx={{ color: "#333", fontWeight: "bold" }}>
              {selectedDate.toLocaleString(undefined, { month: "long" })} {selectedDate.getFullYear()}
            </Typography>
          </Box>
        );
      }
      case "day":
        return (
          <Typography variant="h5" sx={{ color: "#333", fontWeight: "bold" }}>
            {selectedDate.toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
        );
      case "week": {
        const startOfWeek = new Date(selectedDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        const endOfWeek = new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 6))

        // const weekDays = [];
        // for (let i = 0; i < 7; i++) {
        //   const date = new Date(startOfWeek);
        //   date.setDate(startOfWeek.getDate() + i);
        //   weekDays.push(date);
        // }

        return (
          <Typography variant="h5" sx={{ color: "#333", fontWeight: "bold" }}>
            Semaine du {startOfWeek.toLocaleDateString("fr-FR")} au{" "}
            {endOfWeek.toLocaleDateString("fr-FR")}
          </Typography>
        );
      }
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant={titleVariant}
        component="h1"
        sx={{
          fontWeight: "bold",
          color: "#333",
          mb: statusFilters ? 3 : 0,
          fontSize: titleVariant === "h3" ? "2.5rem" : undefined,
        }}
      >
        {title}
      </Typography>

      {/* Status Filters (only for calendar view) */}
      {statusFilters && onFilterStatusChange && (
        <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
          {statusFilters.map((status) => (
            <StatusFilterPill
              key={status.value}
              status={status}
              isActive={filterStatus === status.value}
              onClick={() =>
                onFilterStatusChange(
                  filterStatus === status.value ? "all" : status.value,
                )
              }
            />
          ))}
        </Box>
      )}

      {/* Navigation and Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        {/* Navigation Controls */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={handlePrevious}
            sx={{
              bgcolor: "#f5f5f5",
              "&:hover": { bgcolor: "#e0e0e0" },
              width: 40,
              height: 40,
            }}
          >
            <ArrowBackIos fontSize="small" />
          </IconButton>

          {getDateDisplay()}

          <IconButton
            onClick={handleNext}
            sx={{
              bgcolor: "#f5f5f5",
              "&:hover": { bgcolor: "#e0e0e0" },
              width: 40,
              height: 40,
            }}
          >
            <ArrowForwardIos fontSize="small" />
          </IconButton>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onNewTask}
            sx={{
              bgcolor: "#4caf50",
              "&:hover": { bgcolor: "#45a049" },
              px: 3,
              py: 1.5,
              borderRadius: "20px",
            }}
          >
            Nouvelle Tâche
          </Button>

          {/* View Selector */}
          <ViewSelector viewMode={viewMode} setViewMode={onViewModeChange} />
        </Box>
      </Box>
    </Box>
  );
};

// ============================================================================
// STATUS FILTER PILL COMPONENT
// ============================================================================

interface StatusFilterPillProps {
  status: StatusFilter;
  isActive: boolean;
  onClick: () => void;
}

const StatusFilterPill = ({
  status,
  isActive,
  onClick,
}: StatusFilterPillProps) => {
  const getBackgroundColor = () => {
    if (!isActive) return "#f5f5f5";
    switch (status.color) {
      case "primary":
        return "#e3f2fd";
      case "warning":
        return "#fff3e0";
      case "success":
        return "#e8f5e8";
      case "error":
        return "#ffebee";
      default:
        return "#f5f5f5";
    }
  };

  const getTextColor = () => {
    if (!isActive) return "#666";
    switch (status.color) {
      case "primary":
        return "#1976d2";
      case "warning":
        return "#f57c00";
      case "success":
        return "#388e3c";
      case "error":
        return "#d32f2f";
      default:
        return "#666";
    }
  };

  const getBorderColor = () => {
    if (!isActive) return "#e0e0e0";
    switch (status.color) {
      case "primary":
        return "#bbdefb";
      case "warning":
        return "#ffcc02";
      case "success":
        return "#c8e6c9";
      case "error":
        return "#ffcdd2";
      default:
        return "#e0e0e0";
    }
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        px: 3,
        py: 1.5,
        borderRadius: "20px",
        cursor: "pointer",
        transition: "all 0.2s",
        bgcolor: getBackgroundColor(),
        color: getTextColor(),
        border: "1px solid",
        borderColor: getBorderColor(),
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
      }}
    >
      <Typography variant="body2" fontWeight="500">
        {status.label}
      </Typography>
    </Box>
  );
};
