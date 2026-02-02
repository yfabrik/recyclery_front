import {
  AccessTime,
  Add,
  Block,
  CheckCircle,
  Delete,
  Person,
  PersonAdd,
  PersonOff,
  Store,
  Warning,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { EmployeeModel, TaskModel } from "../../interfaces/Models";
import {
  addEmployeeToTask,
  getEmployeesForTask,
  removeEmployeeFromTask,
} from "../../services/api/tasks";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAvailableUserForTask } from "../../services/api/planning";

interface TaskAssignmentDialogTitleProps {
  taskName: string;
  storeName: string;
}
// Dialog Title Component
const TaskAssignmentDialogTitle = ({
  taskName,
  storeName,
}: TaskAssignmentDialogTitleProps) => {
  return (
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
};
interface TaskAssignmentDialogInfoProps {
  storeName: string;
  scheduledDate: string;
}
// Info Message Component
const TaskAssignmentDialogInfo = ({
  storeName,
  scheduledDate,
}: TaskAssignmentDialogInfoProps) => {
  const dayName = scheduledDate
    ? new Date(scheduledDate).toLocaleDateString("fr-FR", {
        weekday: "long",
      })
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
      <Typography
        variant="body2"
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <Store sx={{ fontSize: 16, color: "#1976d2" }} />
        <strong>Filtrage par magasin et présence:</strong> Seuls les employés du
        magasin "{storeName || "Non spécifié"}" qui travaillent le {dayName}{" "}
        sont affichés.
      </Typography>
    </Box>
  );
};

interface TaskAssignmentEmployeeCardProps {
  employee: EmployeeModel;
  type: "assigned" | "available";
  onAssign?: (employeeId: number) => void;
  onUnassign?: (employeeId: number) => void;
  isAssignedToOtherTask: boolean;
}
// Employee Card Component
const TaskAssignmentEmployeeCard = ({
  employee,
  type = "available", // "assigned" or "available"
  onAssign = () => {},
  onUnassign = () => {},
  isAssignedToOtherTask = false,
}: TaskAssignmentEmployeeCardProps) => {
  const isAssigned = type === "assigned";

  if (isAssigned) {
    return (
      <Card
        variant="outlined"
        sx={{
          bgcolor: "#e3f2fd",
          border: "2px solid #2196f3",
        }}
      >
        <CardContent sx={{ py: 1, px: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Tooltip title="Employé assigné à cette tâche">
                <Person color="primary" />
              </Tooltip>
              <Typography
                variant="body2"
                fontWeight="medium"
                sx={{ color: "#1976d2" }}
              >
                {employee.fullName}
              </Typography>
              <Chip
                label="employee"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: "0.7rem" }}
              />
              <Chip
                icon={<CheckCircle />}
                label="Assigné"
                size="small"
                color="primary"
                variant="filled"
                sx={{ fontSize: "0.7rem" }}
              />
            </Box>
            <Tooltip title="Retirer cet employé de la tâche">
              <IconButton
                size="small"
                onClick={() => onUnassign?.(employee.id)}
                color="error"
                sx={{
                  bgcolor: "#ffebee",
                  "&:hover": {
                    bgcolor: "#ffcdd2",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Available employee card
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1,
        bgcolor: isAssignedToOtherTask ? "#ffebee" : "#f1f8e9",
        border: isAssignedToOtherTask
          ? "2px solid #f44336"
          : "1px solid #e0e0e0",
      }}
    >
      <CardContent sx={{ py: 1, px: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {/* Icône selon le statut */}
            {isAssignedToOtherTask ? (
              <Tooltip title="Employé occupé à ce moment">
                <Block color="error" sx={{ fontSize: 20 }} />
              </Tooltip>
            ) : (employee as any).already_assigned ? (
              <Tooltip title="Déjà assigné à cette tâche">
                <Person color="primary" sx={{ fontSize: 20 }} />
              </Tooltip>
            ) : (
              <Tooltip title="Disponible">
                <Person color="success" sx={{ fontSize: 20 }} />
              </Tooltip>
            )}

            <Typography
              variant="body2"
              fontWeight="medium"
              sx={{
                color: isAssignedToOtherTask ? "#d32f2f" : "inherit",
              }}
            >
              {employee.fullName}
            </Typography>

            <Chip
              label="employee"
              size="small"
              color="info"
              variant="outlined"
            />

            {/* Statut avec icône */}
            {isAssignedToOtherTask ? (
              <Tooltip title="Occupé par une autre tâche à ce moment">
                <Chip
                  icon={<AccessTime />}
                  label="Occupé"
                  size="small"
                  color="error"
                  variant="filled"
                  sx={{ fontSize: "0.7rem" }}
                />
              </Tooltip>
            ) : (employee as any).already_assigned ? (
              <Tooltip title="Déjà assigné à cette tâche">
                <Chip
                  icon={<Person />}
                  label="Assigné"
                  size="small"
                  color="primary"
                  variant="filled"
                  sx={{ fontSize: "0.7rem" }}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Libre pour cette tâche">
                <Chip
                  icon={<CheckCircle />}
                  label="Libre"
                  size="small"
                  color="success"
                  variant="filled"
                  sx={{ fontSize: "0.7rem" }}
                />
              </Tooltip>
            )}
          </Box>

          {/* Bouton d'assignation avec icône appropriée */}
          {isAssignedToOtherTask ? (
            <Tooltip title="Impossible d'assigner - Employé occupé">
              <span>
                <IconButton size="small" color="error" disabled>
                  <Block />
                </IconButton>
              </span>
            </Tooltip>
          ) : (
            <Tooltip title="Assigner cet employé">
              <IconButton
                size="small"
                onClick={() => onAssign(employee.id)}
                color="success"
                sx={{
                  bgcolor: "#e8f5e8",
                  "&:hover": {
                    bgcolor: "#c8e6c9",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Add />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Message d'information pour les employés occupés */}
        {isAssignedToOtherTask &&
          (employee as any).conflicts &&
          (employee as any).conflicts.length > 0 && (
            <Box
              sx={{
                mt: 1,
                p: 1,
                bgcolor: "#fff3e0",
                borderRadius: 1,
                border: "1px solid #ffcc02",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#e65100", fontSize: "0.7rem" }}
              >
                <Warning sx={{ fontSize: 12, mr: 0.5 }} />
                Conflit d'horaires détecté
              </Typography>
            </Box>
          )}
      </CardContent>
    </Card>
  );
};

interface TaskAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  selectedTask: TaskModel;
  // assignedEmployees: EmployeeModel[];
  // availableEmployees: EmployeeModel[];
  onAssignEmployee?: (employeeId: number) => void;
  onUnassignEmployee?: (employeeId: number) => void;
  onCloseWithChanges?: () => void; // Callback triggered when dialog closes AND changes were made
}
// Main Compound Component
const TaskAssignmentDialog = ({
  open,
  onClose,
  selectedTask,
  // assignedEmployees,
  // availableEmployees,
  onAssignEmployee,
  onUnassignEmployee,
  onCloseWithChanges,
}: TaskAssignmentDialogProps) => {
  const [taskAssignedEmployees, setTaskAssignedEmployees] =
    useState<EmployeeModel[]>([]);
  const [availableEmployeesForTask, setAvailableEmployeesForTask] =
    useState<EmployeeModel[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger for useEffect
  const [hasChanges, setHasChanges] = useState(false); // Track if any changes were made

  // Refetch data when dialog opens, selectedTask changes, or refreshTrigger changes
  useEffect(() => {
    if (!open || !selectedTask?.id) return;

    const fetchData = async () => {
      try {
        // Fetch assigned employees
        const assignedResponse = await getEmployeesForTask(selectedTask.id);
        setTaskAssignedEmployees(
          assignedResponse.data.employees || [],
        );

        // Fetch available employees
        const availableResponse = await getAvailableUserForTask(
          selectedTask.id,
        );
        // const availableResponse = await getEmployees({}); // TODO add in backend filter for day
        setAvailableEmployeesForTask(availableResponse.data.employees.filter((e) => e.is_available) || []);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchData();
  }, [open, selectedTask?.id, refreshTrigger]);

  // Filter available employees (exclude already assigned)
  const filteredAvailableEmployees = availableEmployeesForTask.filter(
    (emp) => !taskAssignedEmployees.some((assigned) => assigned.id === emp.id),
  );
  // Fonction pour assigner un employé à une tâche spécifique
  const handleAssignEmployee = async (employeeId: number) => {
    if (!selectedTask?.id) {
      toast.error("Erreur: Tâche non sélectionnée");
      return;
    }

    try {
      await addEmployeeToTask(selectedTask.id, employeeId);

      // Mettre à jour la liste des employés assignés
      const employee = availableEmployeesForTask.find(
        (emp) => emp.id === employeeId,
      );
      if (employee) {
        setTaskAssignedEmployees((prev) => [...prev, employee]);
      }

      toast.success("Employé assigné avec succès");

      // Mark that changes were made
      setHasChanges(true);

      // Trigger refresh
      setRefreshTrigger((prev) => prev + 1);

      // Also call parent handler if provided
      onAssignEmployee?.(employeeId);
    } catch (error: any) {
      console.error("Erreur lors de l'assignation:", error);

      // Gérer spécifiquement les erreurs de conflit d'horaires
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Erreur lors de l'assignation");
      }
    }
  };

  // Fonction pour retirer un employé d'une tâche spécifique
  const handleUnassignEmployee = async (employeeId: number) => {
    if (!selectedTask?.id) {
      toast.error("Erreur: Tâche non sélectionnée");
      return;
    }

    try {
      await removeEmployeeFromTask(selectedTask.id, employeeId);

      // Mettre à jour la liste des employés assignés
      setTaskAssignedEmployees((prev) =>
        prev.filter((emp) => emp.id !== employeeId),
      );

      toast.success("Employé retiré avec succès");

      // Mark that changes were made
      setHasChanges(true);

      // Trigger refresh
      setRefreshTrigger((prev) => prev + 1);

      // Also call parent handler if provided
      onUnassignEmployee?.(employeeId);
    } catch (error: unknown) {
      console.error("Erreur lors du retrait:", error);
      toast.error("Erreur lors du retrait");
    }
  };

  // Handle dialog close - trigger callback if changes were made
  const handleClose = () => {
    if (hasChanges && onCloseWithChanges) {
      onCloseWithChanges();
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <TaskAssignmentDialogTitle
        taskName={selectedTask?.name}
        storeName={selectedTask?.store_name}
      />
      <DialogContent>
        <TaskAssignmentDialogInfo
          storeName={(selectedTask as any)?.store_name || ""}
          scheduledDate={
            selectedTask?.scheduled_date
              ? String(selectedTask.scheduled_date)
              : ""
          }
        />

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Employés déjà assignés */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Person color="primary" />
              Employés assignés ({taskAssignedEmployees.length})
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: "auto" }}>
              {taskAssignedEmployees.length > 0 ? (
                <Stack spacing={1}>
                  {taskAssignedEmployees.map((employee) => (
                    <TaskAssignmentEmployeeCard
                      key={employee.id}
                      employee={employee}
                      type="assigned"
                      onUnassign={handleUnassignEmployee}
                      isAssignedToOtherTask={false}
                    />
                  ))}
                </Stack>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 3,
                    bgcolor: "#f5f5f5",
                    borderRadius: 1,
                    border: "2px dashed #ccc",
                  }}
                >
                  <PersonOff sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Aucun employé assigné
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Cliquez sur "+" pour assigner des employés
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Employés disponibles */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <PersonAdd color="action" />
              Employés disponibles
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: "auto" }}>
              {filteredAvailableEmployees.map((employee) => (
                <TaskAssignmentEmployeeCard
                  key={employee.id}
                  employee={employee}
                  type="available"
                  onAssign={handleAssignEmployee}
                  isAssignedToOtherTask={
                    (employee as any).is_assigned_to_task || false
                  }
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

// Export sub-components for potential reuse
TaskAssignmentDialog.Title = TaskAssignmentDialogTitle;
TaskAssignmentDialog.Info = TaskAssignmentDialogInfo;
TaskAssignmentDialog.EmployeeCard = TaskAssignmentEmployeeCard;

export default TaskAssignmentDialog;
