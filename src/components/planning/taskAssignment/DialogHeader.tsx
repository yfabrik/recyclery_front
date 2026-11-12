import { Store } from "@mui/icons-material";
import { Box, Chip, DialogTitle, Typography } from "@mui/material";
import type { MinuteWindow } from "@recyclerie/api/domain/timeRange";
import { formatWindow } from "../employeeDay/dayModel";

interface TaskAssignmentDialogTitleProps {
  taskName: string;
  storeName: string;
  /** When the Task runs; shown as a start–end chip. */
  taskWindow?: MinuteWindow;
}

export const TaskAssignmentDialogTitle = ({ taskName, storeName, taskWindow }: TaskAssignmentDialogTitleProps) => (
  <DialogTitle>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Store color="primary" />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="h6">
          Assigner des employés à la tâche: {taskName}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Magasin: {storeName || "Non spécifié"}
        </Typography>
      </Box>
      {taskWindow && (
        <Chip size="small" variant="outlined" aria-label="Horaires de la tâche" label={formatWindow(taskWindow)} />
      )}
    </Box>
  </DialogTitle>
);

interface TaskAssignmentDialogInfoProps {
  storeName: string;
  scheduledDate: string;
}

export const TaskAssignmentDialogInfo = ({ storeName, scheduledDate }: TaskAssignmentDialogInfoProps) => {
  const dayName = scheduledDate
    ? new Date(scheduledDate).toLocaleDateString("fr-FR", { weekday: "long" })
    : "jour sélectionné";

  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        bgcolor: "#e3f2fd",
        borderRadius: 1,
        border: "1px solid #2196f3",
      }}
    >
      <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Store sx={{ fontSize: 16, color: "#1976d2" }} />
        <strong>Filtrage par magasin et présence:</strong> Seuls les employés du
        magasin "{storeName || "Non spécifié"}" qui travaillent le {dayName} sont
        affichés.
      </Typography>
    </Box>
  );
};
