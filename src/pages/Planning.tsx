import {
  Add,
  Assignment,
  Flag,
  FlagOutlined,
  Person,
  PersonAdd,
  PlayArrow,
  Print,
  PriorityHigh,
  Save,
  Settings,
  Stop,
  Task,
  Warning,
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
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import {
  PlaningForm,
  type Schema as TaskFormSchema,
} from "../components/forms/planningForm";
import { CalendarView } from "../components/planning/CalendarView";
import { DayView } from "../components/planning/DayView";
import { PlanningViewHeader } from "../components/planning/PlanningViewHeader";
import { EmployeePresenceSchedule } from "../components/planning/PresenceEmployees";
import TaskAssignmentDialog from "../components/planning/TaskAssignmentDialog";
import WeekViewSections from "../components/planning/WeekViewSections";
import type {
  EmployeeModel,
  StoreModel,
  TaskModel,
} from "../interfaces/Models";
import { getEmployees } from "../services/api/employee";
import { createPlanning, updatePlanning } from "../services/api/planning";
import { fetchStores as fstore } from "../services/api/store";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../services/api/tasks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDay } from "../services/dateService";

const Planning = () => {
  const navigate = useNavigate();
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
  const [editingSchedule, setEditingSchedule] =
    useState<Partial<TaskModel> | null>(null);

  // États pour l'assignation des employés depuis le planning
  const [openTaskAssignmentDialog, setOpenTaskAssignmentDialog] =
    useState(false);
  const [selectedTaskForAssignment, setSelectedTaskForAssignment] =
    useState<TaskModel | null>(null);

  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "calendar" | "day">("week"); // semaine par défaut

  // États pour la gestion des conflits
  // const [conflictDialog, setConflictDialog] = useState(false);
  // const [conflictInfo, setConflictInfo] = useState(null);
  // const [pendingScheduleData, setPendingScheduleData] = useState(null);

  // État pour les employés présents
  // const [employeesPresent, setEmployeesPresent] = useState<StoreModel[]>([]);
  // const [loadingEmployeesPresent, setLoadingEmployeesPresent] = useState(false);
  const [missingEmployeesDialogDismissed, setMissingEmployeesDialogDismissed] =
    useState(false);
  // const [showWorkdayWarning, setShowWorkdayWarning] = useState(false);
  // const [workdayWarningInfo, setWorkdayWarningInfo] = useState(null);

  const statusOptions = [
    { value: "new", label: "Nouveau", color: "grey", icon: <Add /> },
    { value: "planned", label: "Planifié", color: "primary", icon: <Task /> },
    {
      value: "in_progress",
      label: "En cours",
      color: "warning",
      icon: <PlayArrow />,
    },
    { value: "completed", label: "Terminé", color: "success", icon: <Save /> },
    { value: "cancelled", label: "Annulé", color: "error", icon: <Stop /> },
  ];

  const priorityOptions = [
    { value: "low", label: "Faible", color: "success", icon: <FlagOutlined /> },
    { value: "medium", label: "Moyenne", color: "warning", icon: <Flag /> },
    { value: "high", label: "Élevée", color: "error", icon: <PriorityHigh /> },
  ];

  const date_from = () => {
    if (viewMode == "week") {
      const lundi = new Date(
        new Date(selectedDate).setDate(
          selectedDate.getDate() -
            selectedDate.getDay() +
            (selectedDate.getDay() === 0 ? -6 : 1),
        ),
      );

      return {
        date_from: lundi.toLocaleString("en-ca", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        date_to: new Date(
          new Date(lundi).setDate(lundi.getDate() + 6),
        ).toLocaleString("en-ca", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
      };
    }

    if (viewMode == "calendar") {
      const first = new Date(new Date(selectedDate).setDate(1));
      return {
        date_from: new Date(
          new Date(first).setDate(first.getDate() - first.getDay() + 1),
        )
          .toISOString().slice(0, 10),
          // .replaceAll("/", "-"),
        date_to: new Date(
          new Date(first).setDate(first.getDate() - first.getDay() + 42),
        )
          .toISOString().slice(0, 10),
          // .replaceAll("/", "-"),
      };
    }
    return {
      date_from: selectedDate.toISOString().slice(0, 10),
      date_to: selectedDate.toISOString().slice(0, 10),
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
      }).then((response) => response.data.tasks),
  });
  if (schedules.isError) {
    toast.error("Erreur lors du chargement des plannings");
  }

  const stores = useQuery({
    queryKey: ["stores", { include: ["employees"] }],
    queryFn: () =>
      fstore({ include: ["employees"] }).then(
        (response) => response.data.stores,
      ),
  });

  const addTask = useMutation({
    mutationFn: (data: TaskFormSchema) => createTask(data),

    onSuccess: () => {
      toast.success("Planning créé avec succès");
      queryclient.invalidateQueries({ queryKey: ["tasks"] });

      handleCloseDialog();
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });
  const editTask = useMutation({
    mutationFn: (data: { id: number; data: TaskFormSchema }) =>
      updateTask(data.id, data.data),
    onSuccess: () => {
      toast.success("Planning mis à jour avec succès");
      handleCloseDialog();
      queryclient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      toast.error("Erreur lors de la sauvegarde");
      console.log("edit error", error);
    },
  });
  const removeTask = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      toast.success("Tâche supprimée avec succès");
      queryclient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const employees = useQuery({
    queryKey: ["employees"],
    queryFn: () => getEmployees().then((response) => response.data.data),
  });
  if (employees.isError) {
    toast.error("Erreur lors du chargement des employés");
  }

  const missingEmployees = useMemo(() => {
    const data = employees.data;
    if (!data?.length) return [];
    return data.filter(
      (emp) => emp.stores?.length === 0 || emp.EmployeeWorkdays?.length === 0,
    );
  }, [employees.data]);

  const showMissingEmployeesDialog =
    missingEmployees.length > 0 && !missingEmployeesDialogDismissed;

  // Fonction pour organiser les employés par jour de la semaine
  const getEmployeesByDay = (): {
    [key: string]: {
      label: string;
      morning: EmployeeModel[];
      afternoon: EmployeeModel[];
      allDay: EmployeeModel[];
    };
  } => {
    //TODO get rid OF ME
    const daysOfWeek = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const dayLabels = [
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
      "Dimanche",
    ];

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
      (selectedDate - newYear) / (24 * 60 * 60 * 1000),
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
    daysOfWeek.forEach((day, index) => {
      const morning = employeesToProcess.filter((employee) => {
        const workday = employee.EmployeeWorkdays || [];
        return workday.some(
          (wd) =>
            wd.day_of_week === day &&
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
            wd.day_of_week === day &&
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
      employeesByDay[day] = {
        label: dayLabels[index],
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
    setEditingSchedule(
      schedule || { scheduled_date: selectedDate || new Date() },
    );

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSchedule(null);
  };

  const handleSave = async (data: TaskFormSchema) => {
    if (editingSchedule?.id) editTask.mutate({ id: editingSchedule.id, data });
    else addTask.mutate(data);
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
      toast.error("Erreur lors du chargement des employés");
    }
  };

  // Fonction pour fermer le dialogue d'assignation
  const handleCloseTaskAssignmentDialog = () => {
    setOpenTaskAssignmentDialog(false);
    setSelectedTaskForAssignment(null);
  };

  // Fonctions pour gérer le popup de conflit
  // const handleConfirmConflict = async () => {
  //   try {
  //     if (editingSchedule) {
  //       await updatePlanning(editingSchedule.id, pendingScheduleData);
  //       toast.success("Planning mis à jour avec succès (conflit ignoré)");
  //     } else {
  //       await createPlanning(pendingScheduleData);
  //       toast.success("Planning créé avec succès (conflit ignoré)");
  //     }

  //     // fetchSchedules();
  //     queryclient.invalidateQueries({ queryKey: ["tasks"] })

  //     handleCloseDialog();
  //     setConflictDialog(false);
  //     setConflictInfo(null);
  //     setPendingScheduleData(null);
  //   } catch (error) {
  //     console.error("Erreur lors de la sauvegarde avec conflit:", error);
  //     toast.error("Erreur lors de la sauvegarde");
  //   }
  // };

  // const handleCancelWorkdayWarning = () => {
  //   setShowWorkdayWarning(false);
  //   setPendingScheduleData(null);
  //   setWorkdayWarningInfo(null);
  // };

  // const handleConfirmWorkdayWarning = async () => {
  //   setShowWorkdayWarning(false);
  //   if (pendingScheduleData) {
  //     try {
  //       if (editingSchedule) {
  //         await updatePlanning(editingSchedule.id, pendingScheduleData);

  //         // await axios.put(`/api/planning/${editingSchedule.id}`, pendingScheduleData);
  //         toast.success(
  //           "Planning créé avec succès (malgré l'absence de l'employé)",
  //         );
  //       } else {
  //         await createPlanning(pendingScheduleData);
  //         // await axios.post('/api/planning', pendingScheduleData);
  //         toast.success(
  //           "Planning créé avec succès (malgré l'absence de l'employé)",
  //         );
  //       }
  //       // fetchSchedules();
  //       queryclient.invalidateQueries({ queryKey: ["tasks"] })

  //       handleCloseDialog();
  //     } catch (error) {
  //       console.error("Erreur lors de la sauvegarde malgré l'alerte:", error);
  //       toast.error("Erreur lors de la sauvegarde");
  //     }
  //   }
  //   setPendingScheduleData(null);
  //   setWorkdayWarningInfo(null);
  // };

  // const handleCancelConflict = () => {
  //   setConflictDialog(false);
  //   setConflictInfo(null);
  //   setPendingScheduleData(null);
  // };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };
  const getStatusInfo = (status) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[1]; // Utiliser 'planned' par défaut
  };


  const getPriorityInfo = (priority: string) => {
    return (
      priorityOptions.find((p) => p.value === priority) || priorityOptions[1]
    );
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
                  if (e.target.value == "") setSelectedStore(null);
                  else
                    setSelectedStore(
                      stores.data?.find((s) => s.id == e.target.value),
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
                ? `Affichage des tâches pour ${
                    stores.data?.find((s) => s.id === selectedStore.id)?.name ||
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
          statusFilters={viewMode === "calendar" ? statusOptions : undefined}
          filterStatus={viewMode === "calendar" ? filterStatus : undefined}
          onFilterStatusChange={
            viewMode === "calendar" ? setFilterStatus : undefined
          }
        />
        {viewMode === "week" && (
          <Box sx={{ mb: 2 }}>
            <Button
              component={Link}
              to={`/admin/planning/print?date=${selectedDate.toISOString().slice(0, 10)}${selectedStore?.id != null ? `&store_id=${selectedStore.id}` : ""}`}
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
            filteredSchedules={schedules.data || []}
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
            filteredSchedules={schedules.data || []}
            formatTime={formatTime}
            getPriorityInfo={getPriorityInfo}
            getStatusInfo={getStatusInfo}
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
            {editingSchedule ? "Modifier la tâche" : "Nouvelle tâche"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <PlaningForm
            formId="planningForm"
            defaultValues={editingSchedule}
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
            {editingSchedule?.id ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* TODO JE L'AI JAMAIS VU */}
      {/* Dialog de conflit d'horaires */}
      {/* <Dialog
        open={conflictDialog}
        onClose={handleCancelConflict}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "warning.main",
            }}
          >
            <Warning />
            Conflit d'horaires détecté
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>{conflictInfo?.employeeName}</strong> est déjà assigné(e)
              le <strong>{conflictInfo?.halfDay}</strong> du{" "}
              <strong>
                {new Date(
                  pendingScheduleData?.scheduled_date,
                ).toLocaleDateString("fr-FR")}
              </strong>
              .
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Tâches en conflit :
            </Typography>

            <Box
              sx={{
                maxHeight: 200,
                overflow: "auto",
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                p: 1,
              }}
            >
              {conflictInfo?.conflicts?.map((conflict, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                    borderBottom:
                      index < conflictInfo.conflicts.length - 1
                        ? "1px solid #f0f0f0"
                        : "none",
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {conflict.task_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {conflict.store_name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="primary">
                    {conflict.start_time} - {conflict.end_time}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Voulez-vous continuer malgré le conflit ?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelConflict} color="inherit">
            Annuler
          </Button>
          <Button
            onClick={handleConfirmConflict}
            variant="contained"
            color="warning"
          >
            Continuer malgré le conflit
          </Button>
        </DialogActions>
      </Dialog> */}

      {/* TODO JE L'AI JAMAIS VU */}
      {/* Dialog pour l'alerte de jour de travail */}
      {/* <Dialog
        open={showWorkdayWarning}
        onClose={handleCancelWorkdayWarning}
        maxWidth="sm"
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
          <Typography variant="h6" fontWeight="bold">
            Employé Non Disponible
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            L'employé sélectionné ne travaille pas le jour choisi.
          </Alert>

          {workdayWarningInfo && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>{workdayWarningInfo.employeeName}</strong> ne travaille
                pas le <strong>{workdayWarningInfo.dayOfWeek}</strong> (
                {workdayWarningInfo.date}).
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Créneau sélectionné :{" "}
                <strong>{workdayWarningInfo.timeSlot}</strong>
              </Typography>

              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Conseil :</strong> Vérifiez les jours de travail de
                  cet employé dans la section Administration ou choisissez un
                  autre employé disponible ce jour.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancelWorkdayWarning} variant="outlined">
            Annuler
          </Button>
          <Button
            onClick={handleConfirmWorkdayWarning}
            variant="contained"
            color="warning"
            startIcon={<Warning />}
          >
            Créer malgré tout
          </Button>
        </DialogActions>
      </Dialog> */}

      {/* Dialog pour les employés manquants */}
      <Dialog
        open={showMissingEmployeesDialog}
        onClose={() => setMissingEmployeesDialogDismissed(true)}
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
          <Typography variant="h6" fontWeight="bold">
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
            onClick={() => setMissingEmployeesDialogDismissed(true)}
            variant="outlined"
          >
            Fermer
          </Button>
          <Button
            onClick={() => {
              setMissingEmployeesDialogDismissed(true);
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
