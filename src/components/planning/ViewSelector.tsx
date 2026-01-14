import { CalendarToday, ViewDay, ViewWeek } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

interface ViewProps {
  viewMode: string;
  setViewMode: (s: string) => void;
}
export const ViewSelector = ({ setViewMode, viewMode }: ViewProps) => {
  const viewModes = [
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
          <Typography variant="body2" fontWeight="500">
            {view.icon} {view.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
