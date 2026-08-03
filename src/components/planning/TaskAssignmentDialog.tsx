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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../../utils/apiToastMessage";
import type { EmployeeModel, TaskModel } from "../../interfaces/Models";
import { getAvailableUserForTask } from "../../services/api/planning";
import {
  addEmployeeToTask,
  getEmployeesForTask,
  removeEmployeeFromTask,
} from "../../services/api/tasks";
import type { AvailableEmployeeDto } from "@recyclerie/api/responses/taskSchedule";

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

type EmployeeCardLayoutProps = {
  cardSx?: object;
  avatar: ReactNode;
  name: string;
  nameSx?: object;
  roleChipColor?: "primary" | "info";
  status: ReactNode;
  action: ReactNode;
  footer?: ReactNode;
};

const EmployeeCardLayout = ({
  cardSx,
  avatar,
  name,
  nameSx,
  roleChipColor = "info",
  status,
  action,
  footer,
}: EmployeeCardLayoutProps) => (
  <Card variant="outlined" sx={cardSx}>
    <CardContent sx={{ py: 1, px: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {avatar}
          <Typography variant="body2" fontWeight="medium" sx={nameSx}>
            {name}
          </Typography>
          <Chip
            label="employee"
            size="small"
            color={roleChipColor}
            variant="outlined"
            sx={{ fontSize: "0.7rem" }}
          />
          {status}
        </Box>
        {action}
      </Box>
      {footer}
    </CardContent>
  </Card>
);

interface AssignedEmployeeCardProps {
  employee: EmployeeModel;
  onUnassign: (employeeId: number) => void;
}

const AssignedEmployeeCard = ({
  employee,
  onUnassign,
}: AssignedEmployeeCardProps) => (
  <EmployeeCardLayout
    cardSx={{
      bgcolor: "#e3f2fd",
      border: "2px solid #2196f3",
    }}
    avatar={
      <Tooltip title="Employé assigné à cette tâche">
        <Person color="primary" />
      </Tooltip>
    }
    name={employee.fullName ?? `${employee.prenom} ${employee.nom}`}
    nameSx={{ color: "#1976d2" }}
    roleChipColor="primary"
    status={
      <Chip
        icon={<CheckCircle />}
        label="Assigné"
        size="small"
        color="primary"
        variant="filled"
        sx={{ fontSize: "0.7rem" }}
      />
    }
    action={
      <Tooltip title="Retirer cet employé de la tâche">
        <IconButton
          size="small"
          onClick={() => onUnassign(employee.id)}
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
    }
  />
);

interface AvailableEmployeeCardProps {
  employee: AvailableEmployeeDto;
  onAssign: (employeeId: number) => void;
  isAssignedToOtherTask: boolean;
}

const AvailableEmployeeCard = ({
  employee,
  onAssign,
  isAssignedToOtherTask,
}: AvailableEmployeeCardProps) => {
  const avatar = isAssignedToOtherTask ? (
    <Tooltip title="Employé occupé à ce moment">
      <Block color="error" sx={{ fontSize: 20 }} />
    </Tooltip>
  ) : employee.already_assigned ? (
    <Tooltip title="Déjà assigné à cette tâche">
      <Person color="primary" sx={{ fontSize: 20 }} />
    </Tooltip>
  ) : (
    <Tooltip title="Disponible">
      <Person color="success" sx={{ fontSize: 20 }} />
    </Tooltip>
  );

  const status = isAssignedToOtherTask ? (
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
  ) : employee.already_assigned ? (
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
  );

  const action = isAssignedToOtherTask ? (
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
  );

  const footer =
    isAssignedToOtherTask && employee.conflicts.length > 0 ? (
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
    ) : null;

  return (
    <EmployeeCardLayout
      cardSx={{
        mb: 1,
        bgcolor: isAssignedToOtherTask ? "#ffebee" : "#f1f8e9",
        border: isAssignedToOtherTask
          ? "2px solid #f44336"
          : "1px solid #e0e0e0",
      }}
      avatar={avatar}
      name={employee.fullName ?? `${employee.prenom} ${employee.nom}`}
      nameSx={{ color: isAssignedToOtherTask ? "#d32f2f" : "inherit" }}
      status={status}
      action={action}
      footer={footer}
    />
  );
};

interface TaskAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  selectedTask: TaskModel;
  onAssignEmployee?: (employeeId: number) => void;
  onUnassignEmployee?: (employeeId: number) => void;
  onCloseWithChanges?: () => void; // Callback triggered when dialog closes AND changes were made
}
// Main Compound Component
const TaskAssignmentDialog = ({
  open,
  onClose,
  selectedTask,
  onAssignEmployee,
  onUnassignEmployee,
  onCloseWithChanges,
}: TaskAssignmentDialogProps) => {
  const [hasChanges, setHasChanges] = useState(false); // Track if any changes were made

  const queryclient = useQueryClient()

  const availableEmployees = useQuery({
    queryKey: ["availableEmployee", selectedTask.id],
    queryFn: () => getAvailableUserForTask(selectedTask.id)
      .then(response => response.data.data)
      .then(employees => employees.filter((e) => e.is_available)),
    enabled: !!selectedTask?.id
  })
  const assignedEmployees = useQuery({
    queryKey: ["assignedEmployees", selectedTask.id],
    queryFn: () => getEmployeesForTask(selectedTask.id)
      .then(response => response.data.data)
    ,

    enabled: !!selectedTask?.id
  })

  const assignEmployee = useMutation({
    mutationFn: (employeeId: number) => addEmployeeToTask(selectedTask.id, employeeId),
    onSuccess: (data,variables) => {
      toast.success(getApiSuccessMessage(data, "Employé assigné avec succès"));
      setHasChanges(true);
      queryclient.invalidateQueries({ queryKey: ["availableEmployee", selectedTask.id] })
      queryclient.invalidateQueries({ queryKey: ["assignedEmployees", selectedTask.id] })
      onAssignEmployee?.(variables);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de l'assignation")),
  })
  const unassignEmployee = useMutation({
    mutationFn: (employeeId: number) => removeEmployeeFromTask(selectedTask.id, employeeId),
    onSuccess: (data,variables) => {
      toast.success(getApiSuccessMessage(data, "Employé retiré avec succès"));
      setHasChanges(true);
      queryclient.invalidateQueries({ queryKey: ["availableEmployee", selectedTask.id] })
      queryclient.invalidateQueries({ queryKey: ["assignedEmployees", selectedTask.id] })
      onUnassignEmployee?.(variables);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors du retrait")),
  })

  // Filter available employees (exclude already assigned)
  const filteredAvailableEmployees = availableEmployees.data?.filter(
    (emp) => !assignedEmployees.data?.some((assigned) => assigned.id === emp.id),
  ) || [];
  // Fonction pour assigner un employé à une tâche spécifique
  const handleAssignEmployee = async (employeeId: number) => {
    assignEmployee.mutate(employeeId)
  };

  // Fonction pour retirer un employé d'une tâche spécifique
  const handleUnassignEmployee = async (employeeId: number) => {
    unassignEmployee.mutate(employeeId)
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
        storeName={selectedTask?.Recyclery?.name ?? ""}
      />
      <DialogContent>
        <TaskAssignmentDialogInfo
          storeName={selectedTask?.Recyclery?.name ?? ""}
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
              Employés assignés ({assignedEmployees.data?.length})
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: "auto" }}>
              {assignedEmployees.data && assignedEmployees.data?.length > 0 ? (
                <Stack spacing={1}>
                  {assignedEmployees.data?.map((employee) => (
                    <AssignedEmployeeCard
                      key={employee.id}
                      employee={employee}
                      onUnassign={handleUnassignEmployee}
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
                <AvailableEmployeeCard
                  key={employee.id}
                  employee={employee}
                  onAssign={handleAssignEmployee}
                  isAssignedToOtherTask={employee.has_conflicts || false}
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
TaskAssignmentDialog.AssignedEmployeeCard = AssignedEmployeeCard;
TaskAssignmentDialog.AvailableEmployeeCard = AvailableEmployeeCard;

export default TaskAssignmentDialog;
