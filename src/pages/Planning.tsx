import {
  Assignment,
  Person,
  PersonAdd,
  Print,
  Save,
  Settings,
  Warning
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import {
  PlaningForm,
  type SchemaInputValues,
} from "../components/forms/planningForm";
import { CalendarView } from "../components/planning/CalendarView";
import { DayView } from "../components/planning/DayView";
import { PlanningViewHeader } from "../components/planning/PlanningViewHeader";
import { EmployeePresenceSchedule } from "../components/planning/PresenceEmployees";
import TaskAssignmentDialog from "../components/planning/TaskAssignmentDialog";
import WeekViewSections from "../components/planning/WeekViewSections";
import { TASK_STATUSES } from "../constants/taskStatuses";
import { useQueryErrorToast } from "../hooks/useQueryErrorToast";
import type {
  EmployeeModel,
  StoreModel,
  TaskModel,
} from "../interfaces/Models";
import { getEmployees } from "../services/api/employee";
import { fetchStores as fstore } from "../services/api/store";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../services/api/tasks";
import {
  planningTaskPayloadFromForm,
  taskToPlanningFormValues,
} from "../services/mapper/task";
import type { PlanningFormOutput } from "../services/schema/schedule";
import {
  getWeekRangeFromDate,
  toIsoDate,
  WEEKDAY_LABELS_FR,
  WEEKDAYS_MONDAY_FIRST,
} from "../services/dateService";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../utils/apiToastMessage";

const Planning = () => {
  // Fonction pour générer une couleur basée sur le nom de l'employé
  const getEmployeeColor = (employeeName: string) => {
    if (!employeeName) return "#999";
    const colors = [
      "#4caf50",
      "#2196f3",
      "#ff9800",
      "#9c27b0",
      "#f44336",
      "#00bcd4",
      "#795548",
      "#607d8b",
    ];
    const hash = employeeName.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  // Fonction pour obtenir les initiales d'un employé
  const getEmployeeInitials = (employeeName: string) => {
    if (!employeeName) return "?";
    return employeeName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  const [selectedStore, setSelectedStore] = useState<StoreModel | null>();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<TaskModel["id"] | null>(null);
  const [formDefaults, setFormDefaults] =
    useState<Partial<SchemaInputValues> | null>(null);

  // États pour l'assignation des employés depuis le planning
  const [openTaskAssignmentDialog, setOpenTaskAssignmentDialog] =
    useState(false);
  const [selectedTaskForAssignment, setSelectedTaskForAssignment] =
    useState<TaskModel | null>(null);

  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "calendar" | "day">("week"); // semaine par défaut

  const [missingEmployeesDialogDismissed, setMissingEmployeesDialogDismissed] =
    useState(false);

  const date_from = () => {
    if (viewMode == "week") {
      return getWeekRangeFromDate(selectedDate);
    }

    if (viewMode == "calendar") {
      const first = new Date(new Date(selectedDate).setDate(1));
      const start = new Date(first);
      start.setDate(first.getDate() - first.getDay() + 1);
      const end = new Date(first);
      end.setDate(first.getDate() - first.getDay() + 42);
      return {
        date_from: toIsoDate(start),
        date_to: toIsoDate(end),
      };
    }
    return {
      date_from: toIsoDate(selectedDate),
      date_to: toIsoDate(selectedDate),
    };
  };

  const queryclient = useQueryClient();

  const schedules = useQuery({
    queryKey: [
      "tasks",
      {
        include: ["user", "store"],
        store: selectedStore?.id,
        viewMode,
        ...date_from(),
      },
    ],
    queryFn: () =>
      getTasks({
        store_id: selectedStore?.id,
        include: ["user", "store"],
        date_from: date_from().date_from,
        date_to: date_from().date_to,
      }).then((response) => response.data.data),
  });
  useQueryErrorToast(schedules.error, "Erreur lors du chargement des plannings");

  const stores = useQuery({
    queryKey: ["stores", { include: ["employees"] }],
    queryFn: () =>
      fstore({ include: ["employees"] }).then(
        (response) => response.data.data,
      ),
  });


  const addTask = useMutation({
    //TODO faudra fix quand on changera les api non lié au form
    mutationFn: (data: Parameters<typeof createTask>[0]) => createTask(data),

    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Planning créé avec succès"));
      queryclient.invalidateQueries({ queryKey: ["tasks"] });

      handleCloseDialog();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
  });
  const editTask = useMutation({
    mutationFn: (data: { id: TaskModel["id"]; data: Parameters<typeof updateTask>[1] }) =>
      updateTask(data.id, data.data),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Planning mis à jour avec succès"));
      handleCloseDialog();
      queryclient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde"));
      console.log("edit error", error);
    },
  });
  const removeTask = useMutation({
    mutationFn: (id: TaskModel["id"]) => deleteTask(id),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Tâche supprimée avec succès"));
      queryclient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la suppression")),
  });

  const employees = useQuery({
    queryKey: ["employees"],
    queryFn: () => getEmployees().then((response) => response.data.data),
  });
  useQueryErrorToast(employees.error, "Erreur lors du chargement des employés");

  const missingEmployees = useMemo(() => {
    const data = employees.data;
    if (!data?.length) return [];
    return data.filter(
      (emp) => emp.stores?.length === 0 || emp.EmployeeWorkdays?.length === 0,
    );
  }, [employees.data]);

  const showMissingEmployeesDialog =
    missingEmployees.length > 0 && !missingEmployeesDialogDismissed;

    //TODO use dayjs here to simplify
  // Fonction pour organiser les employés par jour de la semaine
  const getEmployeesByDay = (): {
    [key: string]: {
      label: string;
      morning: EmployeeModel[];
      afternoon: EmployeeModel[];
      allDay: EmployeeModel[];
    };
  } => {
    const daysOfWeek = WEEKDAYS_MONDAY_FIRST;

    // Filtrer les employés selon le magasin sélectionné
    let employeesToProcess: EmployeeModel[] = [];

    if (selectedStore) {
      employeesToProcess =
        stores.data?.find((s) => s.id === selectedStore.id)?.employees || [];
    } else {
      const tmpEmployeeToProcess =
        stores.data?.reduce((prev: EmployeeModel[], current) => {
          const employees = current.employees || [];
          prev = [...prev, ...employees];
          return prev;
        }, []) || [];
      employeesToProcess = [
        ...new Map(tmpEmployeeToProcess.map((obj) => [obj.id, obj])).values(),
      ];
    }

    const newYear = new Date(selectedDate.getFullYear(), 0, 1);
    const dayNumber = Math.floor(
      (selectedDate.getTime() - newYear.getTime()) / (24 * 60 * 60 * 1000),
    );
    const weekNumber = Math.ceil((selectedDate.getDay() + dayNumber + 1) / 7);
    const weekToProcess =
      viewMode != "calendar" ? (weekNumber % 2 ? "week2" : "week1") : null;
    const employeesByDay: {
      [key: string]: {
        label: string;
        morning: EmployeeModel[];
        afternoon: EmployeeModel[];
        allDay: EmployeeModel[];
      };
    } = {};
    daysOfWeek.forEach((day) => {
      const morning = employeesToProcess.filter((employee) => {
        const workday = employee.EmployeeWorkdays || [];
        return workday.some(
          (wd) =>
            Number(wd.day_of_week) === day &&
            wd.time_slot === "morning" &&
            wd.is_working === true &&
            weekToProcess &&
            wd?.week === weekToProcess,
        );
      });
      const afternoon = employeesToProcess.filter((employee) => {
        const workdays = employee.EmployeeWorkdays || [];
        return workdays.some(
          (wd) =>
            Number(wd.day_of_week) === day &&
            wd.time_slot === "afternoon" &&
            wd.is_working === true &&
            weekToProcess &&
            wd?.week === weekToProcess,
        );
      });

      //remove duplicate in morning and afternoon and put them in allday
      const map1 = new Map(morning.map((o) => [o.id, o]));
      const map2 = new Map(afternoon.map((o) => [o.id, o]));

      const allDay: EmployeeModel[] = [];
      const onlyMorning: EmployeeModel[] = [];
      const onlyNoon: EmployeeModel[] = [];

      for (const [id, obj] of map1) {
        if (map2.has(id)) {
          allDay.push(obj);
        } else {
          onlyMorning.push(obj);
        }
      }

      for (const [id, obj] of map2) {
        if (!map1.has(id)) {
          onlyNoon.push(obj);
        }
      }
      employeesByDay[String(day)] = {
        label: WEEKDAY_LABELS_FR[day],
        morning: onlyMorning,
        afternoon: onlyNoon,
        allDay: allDay,
      };
    });

    return employeesByDay;
  };

  const handleOpenDialog = (
    schedule: TaskModel | null = null,
    selectedDate: Date | null = null,
  ) => {
    setEditingScheduleId(schedule?.id ?? null);
    setFormDefaults(
      schedule
        ? taskToPlanningFormValues(schedule)
        : { scheduled_date: selectedDate || new Date() },
    );

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingScheduleId(null);
    setFormDefaults(null);
  };
  const handleSave = async (data: PlanningFormOutput) => {
    const result = planningTaskPayloadFromForm(data)
    if (editingScheduleId)
      editTask.mutate({ id: editingScheduleId, data: result });
    else addTask.mutate(result);
  };

  const handleDeleteTask = async (schedule: TaskModel) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer la tâche "${schedule.name}" ?`,
      )
    )
      removeTask.mutate(schedule.id);
  };

  // Fonction pour ouvrir le dialogue d'assignation des employés depuis le planning
  const handleAssignEmployeesToTask = async (schedule: TaskModel) => {
    // Vérification de sécurité
    if (!schedule || !schedule.id) {
      console.error(
        "Erreur: schedule invalide dans handleAssignEmployeesToTask",
      );
      return;
    }
    setSelectedTaskForAssignment(schedule);
    setOpenTaskAssignmentDialog(true);

    try {
      // Vérification supplémentaire pour s'assurer que schedule a toutes les propriétés nécessaires
      if (
        !schedule.scheduled_date ||
        !schedule.start_time ||
        !schedule.end_time
      ) {
        console.error(
          "Erreur: schedule incomplet dans handleAssignEmployeesToTask",
          schedule,
        );
        toast.error("Erreur: Informations de tâche incomplètes");
        return;
      }

      setOpenTaskAssignmentDialog(true);
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error);
      toast.error(getApiErrorMessage(error, "Erreur lors du chargement des employés"));
    }
  };

  // Fonction pour fermer le dialogue d'assignation
  const handleCloseTaskAssignmentDialog = () => {
    setOpenTaskAssignmentDialog(false);
    setSelectedTaskForAssignment(null);
  };

  return (
    <Box>
      {/* Sélecteurs de magasin et lieu */}
      <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Filtrer par magasin</InputLabel>
              <Select
                value={selectedStore?.id || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) setSelectedStore(null);
                  else
                    setSelectedStore(
                      stores.data?.find((s) => s.id === Number(value)),
                    );
                  // setSelectedLocation(""); // Reset location when store changes
                }}
                label="Filtrer par magasin"
              >
                <MenuItem value="">
                  <em>Tous les magasins</em>
                </MenuItem>
                {stores.data?.map((store) => (
                  <MenuItem key={store.id} value={store.id}>
                    {store.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {selectedStore
                ? `Affichage des tâches pour ${stores.data?.find((s) => s.id === selectedStore.id)?.name ||
                "magasin sélectionné"
                }`
                : "Affichage de toutes les tâches"}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Planning des employés par jour */}
      <EmployeePresenceSchedule
        employeesByDay={getEmployeesByDay()}
        isLoading={employees.isLoading}
        selectedStore={selectedStore || null}
        onShowMissingEmployees={() => setMissingEmployeesDialogDismissed(false)}
      ></EmployeePresenceSchedule>

      <Box sx={{ bgcolor: "white", minHeight: "100vh", p: 3 }}>
        <PlanningViewHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onNewTask={() => handleOpenDialog()}
          statusFilters={
            viewMode === "calendar" ? [...TASK_STATUSES] : undefined
          }
          filterStatus={viewMode === "calendar" ? filterStatus : undefined}
          onFilterStatusChange={
            viewMode === "calendar" ? setFilterStatus : undefined
          }
        />
        {viewMode === "week" && (
          <Box sx={{ mb: 2 }}>
            <Button
              component={Link}
              to={`/admin/planning/print?date=${toIsoDate(selectedDate)}${selectedStore?.id != null ? `&store_id=${selectedStore.id}` : ""}`}
              variant="outlined"
              startIcon={<Print />}
              size="small"
            >
              Imprimer la semaine
            </Button>
          </Box>
        )}
        {viewMode === "calendar" && (
          <CalendarView
          schedules={schedules.data || []}
            handleDeleteTask={handleDeleteTask}
            handleOpenDialog={handleOpenDialog}
            handleAssignEmployeesToTask={handleAssignEmployeesToTask}
            selectedDate={selectedDate}
          />
        )}
        {viewMode === "week" && (
          <WeekViewSections
            schedules={schedules.data || []}
            getEmployeeColor={getEmployeeColor}
            getEmployeeInitials={getEmployeeInitials}
            handleAssignEmployeesToTask={handleAssignEmployeesToTask}
            handleDeleteTask={handleDeleteTask}
            handleOpenDialog={handleOpenDialog}
            selectedDate={selectedDate}
          />
        )}
        {viewMode === "day" && (
          <DayView
            schedules={schedules.data || []}
            handleAssignEmployeesToTask={handleAssignEmployeesToTask}
            handleDeleteTask={handleDeleteTask}
            handleOpenDialog={handleOpenDialog}
            selectedDate={selectedDate}
          />
        )}
      </Box>

      {/* Dialog de création/édition amélioré */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Assignment />
            {editingScheduleId ? "Modifier la tâche" : "Nouvelle tâche"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <PlaningForm
            formId="planningForm"
            defaultValues={formDefaults}
            onSubmit={handleSave}
            stores={stores.data || []}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            // onClick={handleSave}
            type="submit"
            form="planningForm"
            variant="contained"
            startIcon={<Save />}
          >
            {editingScheduleId ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>


      {/* Dialog pour les employés manquants */}
      <MissingEMployeesDialog showDialog={showMissingEmployeesDialog} setShowDialog={setMissingEmployeesDialogDismissed}missingEmployees={missingEmployees} />

      {/* Dialogue d'assignation des employés depuis le planning */}
      {selectedTaskForAssignment && (
        <TaskAssignmentDialog
          open={openTaskAssignmentDialog}
          onClose={handleCloseTaskAssignmentDialog}
          selectedTask={selectedTaskForAssignment}
          onCloseWithChanges={() => {
            // Only refetch schedules if changes were made when dialog closes
            queryclient.invalidateQueries({ queryKey: ["tasks"] });
          }}
        />
      )}
    </Box>
  );
};

export default Planning;

interface MissingEMployeesDialogProps {
  showDialog: boolean
  setShowDialog: React.Dispatch<React.SetStateAction<boolean>>
  missingEmployees: EmployeeModel[]
}

const MissingEMployeesDialog = ({
  missingEmployees,
  setShowDialog,
  showDialog
}: MissingEMployeesDialogProps) => {
  const navigate = useNavigate()
  return (
    <Dialog
      open={showDialog}
      onClose={() => setShowDialog(true)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "#ff9800",
        }}
      >
        <Warning sx={{ fontSize: 28 }} />
        <Typography component="span" variant="h6" fontWeight="bold">
          Employés Non Configurés
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Certains employés ne sont pas visibles dans le planning car ils ne
          sont pas encore configurés.
        </Alert>

        <Typography variant="body1" sx={{ mb: 2, fontWeight: "medium" }}>
          Pour qu'un employé apparaisse dans le planning, il doit :
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
          >
            <Settings sx={{ fontSize: 16, color: "#2196f3" }} />
            <strong>1. Être affecté à un magasin</strong>
          </Typography>
          <Typography
            variant="body2"
            sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
          >
            <PersonAdd sx={{ fontSize: 16, color: "#4caf50" }} />
            <strong>2. Avoir des jours de travail configurés</strong>
          </Typography>
        </Box>

        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
          Employés à configurer ({missingEmployees.length}) :
        </Typography>

        <List
          sx={{
            maxHeight: 300,
            overflow: "auto",
            border: "1px solid #e0e0e0",
            borderRadius: 1,
          }}
        >
          {missingEmployees.map((employee, index) => (
            <ListItem
              key={employee.id}
              sx={{
                borderBottom:
                  index < missingEmployees.length - 1
                    ? "1px solid #f0f0f0"
                    : "none",
                py: 1.5,
              }}
            >
              <ListItemIcon>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "#ff9800" }}>
                  <Person sx={{ fontSize: 18 }} />
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body1" fontWeight="medium">
                    {employee.fullName}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {employee.email}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label="Pas d'affectation magasin"
                        size="small"
                        color="warning"
                        sx={{ mr: 1, fontSize: "0.7rem" }}
                      />
                      <Chip
                        label="Pas de jours de travail"
                        size="small"
                        color="error"
                        sx={{ fontSize: "0.7rem" }}
                      />
                    </Box>
                  </Box>
                }
                slotProps={{
                  primary: { component: "div" },
                  secondary: { component: "div" },
                }}
              />
            </ListItem>
          ))}
        </List>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Solution :</strong> Allez dans{" "}
            <strong>Administration → Gestion des Employés</strong>
            et configurez les affectations aux magasins et les jours de
            travail pour ces employés.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={() => setShowDialog(true)}
          variant="outlined"
        >
          Fermer
        </Button>
        <Button
          onClick={() => {
            setShowDialog(true);
            navigate("/admin/config/employees");
            // Rediriger vers la page d'administration
          }}
          variant="contained"
          color="primary"
          startIcon={<Settings />}
        >
          Aller à l'Administration
        </Button>
      </DialogActions>
    </Dialog>
  )
}