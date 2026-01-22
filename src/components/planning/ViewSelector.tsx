import { CalendarToday, ViewDay, ViewWeek } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

export type ViewMode = "calendar" | "day" | "week";

interface ViewSelectorProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

interface ViewOption {
  value: ViewMode;
  label: string;
  icon: ReactNode;
}

export const ViewSelector = ({
  setViewMode,
  viewMode,
}: ViewSelectorProps) => {
  const viewModes: ViewOption[] = [
    { value: "calendar", label: "Calendrier", icon: <CalendarToday /> },
    { value: "week", label: "Semaine", icon: <ViewWeek /> },
    { value: "day", label: "Jour", icon: <ViewDay /> },
  ];

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      {viewModes.map((view) => (
        <Box
          key={view.value}
          onClick={() => setViewMode(view.value)}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: "20px",
            cursor: "pointer",
            transition: "all 0.2s",
            bgcolor: viewMode === view.value ? "#4caf50" : "white",
            color: viewMode === view.value ? "white" : "#666",
            border: "1px solid #e0e0e0",
            "&:hover": {
              bgcolor: viewMode === view.value ? "#45a049" : "#f5f5f5",
            },
          }}
        >
          <Typography
            variant="body2"
            fontWeight="500"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            {view.icon} {view.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
