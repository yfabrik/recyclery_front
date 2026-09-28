import { Store } from "@mui/icons-material";
import { Box, DialogTitle, Typography } from "@mui/material";

interface TaskAssignmentDialogTitleProps {
  taskName: string;
  storeName: string;
}

export const TaskAssignmentDialogTitle = ({ taskName, storeName }: TaskAssignmentDialogTitleProps) => (
  <DialogTitle>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Store color="primary" />
      <Box>
        <Typography variant="h6">
          Assigner des employés à la tâche: {taskName}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Magasin: {storeName || "Non spécifié"}
        </Typography>
      </Box>
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
