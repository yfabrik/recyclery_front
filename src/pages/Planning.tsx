import {
  Add,
  Assignment,
  Flag,
  FlagOutlined,
  Person,
  PersonAdd,
  PlayArrow,
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
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { PlaningForm, type Schema as TaskFormSchema } from "../components/forms/planningForm";
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
import {
  createPlanning,
  updatePlanning
} from "../services/api/planning";
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
  const [conflictDialog, setConflictDialog] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [pendingScheduleData, setPendingScheduleData] = useState(null);

  // État pour les employés présents
  // const [employeesPresent, setEmployeesPresent] = useState<StoreModel[]>([]);
  // const [loadingEmployeesPresent, setLoadingEmployeesPresent] = useState(false);
  const [missingEmployeesDialogDismissed, setMissingEmployeesDialogDismissed] =
    useState(false);
  const [showWorkdayWarning, setShowWorkdayWarning] = useState(false);
  const [workdayWarningInfo, setWorkdayWarningInfo] = useState(null);

  // useEffect(() => {
  //   console.log("e", employeesPresent);
  //   console.log("u", schedules);
  // }, [schedules, employeesPresent]);

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
        new Date(selectedDate).setDate(selectedDate.getDate() -
          selectedDate.getDay() + (
            selectedDate.getDay() === 0 ? -6 : 1)))
      return {
        date_from: lundi,
        date_to: new Date(lundi.getDate() + 6)
      }
    }

    if (viewMode == "calendar") {
      const first = new Date(new Date(selectedDate).setDate(1))
      return {
        date_from: new Date(new Date(first).setDate(first.getDate() - first.getDay() + 1)),
        date_to: new Date(new Date(first).setDate(first.getDate() - first.getDay() + 42))
      }
    }
    return {
      date_from: selectedDate,
      date_to: selectedDate
    }
  }
  const queryclient = useQueryClient()

  const schedules = useQuery({
    queryKey: ["tasks", { include: ["user", "store"], store: selectedStore?.id, viewMode, ...date_from() }],
    queryFn: () => getTasks({
      store_id: selectedStore?.id,
      include: ["user", "store"],
      date_from: new Date(new Date(selectedDate).setDate(selectedDate.getDate() - selectedDate.getDay() + 1)),
      date_to: new Date(new Date(selectedDate).setDate(selectedDate.getDate() - selectedDate.getDay() + 7))
    }).then(response => response.data.tasks)
  })
  if (schedules.isError) {
    toast.error("Erreur lors du chargement des plannings");
  }

  const stores = useQuery({
    queryKey: ["stores", { include: ["employees"] }],
    queryFn: () => fstore({ include: ["employees"] }).then(response => response.data.stores)
  })

  const addTask = useMutation({
    mutationFn: (data: TaskFormSchema) => createTask(data),

    onSuccess: () => {
      toast.success("Planning créé avec succès");
      queryclient.invalidateQueries({ queryKey: ["tasks"] })

      handleCloseDialog();
    },
    onError: () => toast.error("Erreur lors de la sauvegarde")
  })
  const editTask = useMutation({
    mutationFn: (data: { id: number, data: TaskFormSchema }) => updateTask(data.id, data.data),
    onSuccess: () => {
      toast.success("Planning mis à jour avec succès");
      handleCloseDialog();
      queryclient.invalidateQueries({ queryKey: ["tasks"] })

    },
    onError: (error) => {
      toast.error("Erreur lors de la sauvegarde")
      console.log("edit error", error)
    }
  })
  const removeTask = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      toast.success("Tâche supprimée avec succès");
      queryclient.invalidateQueries({ queryKey: ["tasks"] })

    },
    onError: () => toast.error("Erreur lors de la suppression")
  })



  // useEffect(() => {
  //   if (stores.data && stores.data?.length > 0) {
  //     fetchEmployeesPresent();
  //   }
  // }, [stores.data]);

  // useEffect(() => {
  //   fetchSchedules();
  // }, [selectedStore, selectedDate]);

  // Recharger les employés quand le magasin sélectionné change
  // useEffect(() => {
  //   if (stores.data && stores.data?.length > 0) {
  //     fetchEmployeesPresent();
  //   }
  // }, [selectedStore]);

  // const fetchSchedules = async () => {
  //   try {
  //     // setLoading(true);
  //     const params = {};
  //     if (selectedStore) {
  //       // params.store_id = parseInt(selectedStore);
  //       params.store_id = selectedStore.id;
  //     }
  //     if (viewMode == "week") {
  //       const thisWeek = new Date(selectedDate);
  //       params.date_from = new Date(new Date(selectedDate).setDate(thisWeek.getDate() - thisWeek.getDay() + 1));
  //       params.date_to = new Date(new Date(params.date_from).setDate(params.date_from.getDate() + 6));
  //     }
  //     const r = await getTasks({ include: "user", ...params });
  //     const tasks: TaskModel[] = r.data.tasks;
  //     const synchronizedSchedules = tasks.map((task, i, array) => {
  //       const users = task.Employees || [];
  //       const occuped = [];

  //       array
  //         .filter((a, j) => i != j)
  //         .forEach((other) => {
  //           const otherUsers = other.Employees || [];
  //           users.forEach(
  //             (user) =>
  //               otherUsers.some((o) => o.id == user.id) &&
  //               occuped.push({
  //                 ...user,
  //                 assigned_to_task_id: task.id,
  //                 assigned_to_task_name: task.name || "",
  //               }),
  //           );
  //         });
  //       return { ...task, occupied_employees: occuped };
  //     });

  //     setSchedules(synchronizedSchedules);
  //   } catch (error) {
  //     console.error("❌ ERREUR lors du chargement des plannings:", error);
  //     console.error("❌ Error details:", error.response?.data);
  //     toast.error("Erreur lors du chargement des plannings");
  //     setSchedules([]);
  //   } finally {
  //     // setLoading(false);
  //   }
  // };

  // const fetchStores = async () => {
  //   try {
  //     const response = await fstore();
  //     setStores(response.data.stores || []);
  //   } catch (error) {
  //     console.error("❌ ERREUR lors du chargement des magasins:", error);
  //     setStores([]);
  //   }
  // };

  const employees = useQuery({
    queryKey: ["employees"],
    queryFn: () => getEmployees().then(response => response.data.data)
  })
  if (employees.isError) {
    toast.error("Erreur lors du chargement des employés");
  }

  const missingEmployees = useMemo(() => {
    const data = employees.data
    if (!data?.length) return []
    return data.filter(
      (emp) =>
        emp.stores?.length === 0 || emp.EmployeeWorkdays?.length === 0,
    )
  }, [employees.data])

  const showMissingEmployeesDialog =
    missingEmployees.length > 0 && !missingEmployeesDialogDismissed

  //TODO fixme
  // const fetchEmployeesPresent = async () => {
  //   try {
  //     setLoadingEmployeesPresent(true);
  //     const [
  //       // infoStoreResponse, 
  //       employeesResponse] = await Promise.all([
  //         // fstore({ include: "employees" }),
  //         getEmployees(),
  //       ]);

  //     const filteredEmployees = employeesResponse.data.data;

  //     // setEmployeesPresent(infoStoreResponse.data.stores);

  //     const missingEmployeesList = filteredEmployees.filter(
  //       (emp) =>
  //         emp.stores?.length == 0 || emp.EmployeeWorkdays?.length == 0,
  //     );
  //     setMissingEmployees(missingEmployeesList);

  //     // Afficher le popup s'il y a des employés manquants
  //     if (missingEmployeesList.length > 0) {
  //       setShowMissingEmployeesDialog(true);
  //     }
  //   } catch (error) {
  //     console.error(
  //       "❌ ERREUR lors du chargement des employés présents:",
  //       error,
  //     );
  //     // setEmployeesPresent([]);
  //   } finally {
  //     setLoadingEmployeesPresent(false);
  //   }
  // };

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
        stores.data?.find((s) => s.id === selectedStore.id)?.employees ||
        [];
    } else {
      const tmpEmployeeToProcess = stores.data?.reduce(
        (prev: EmployeeModel[], current) => {
          const employees = current.employees || [];
          prev = [...prev, ...employees];
          return prev;
        },
        [],
      ) || [];
      employeesToProcess = [
        ...new Map(tmpEmployeeToProcess.map((obj) => [obj.id, obj])).values(),
      ];
    }

    const newYear = new Date(selectedDate.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((selectedDate-newYear)/(7*24*60*60*1000));
    const weekToProcess = viewMode!="calendar"? (weekNumber%2 ?"week2":"week1"):null

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
            (weekToProcess && wd?.week===weekToProcess)
        );
      });
      const afternoon = employeesToProcess.filter((employee) => {
        const workdays = employee.EmployeeWorkdays || [];
        return workdays.some(
          (wd) =>
            wd.day_of_week === day &&
            wd.time_slot === "afternoon" &&
            wd.is_working === true &&
            (weekToProcess && wd?.week===weekToProcess)
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
    if (editingSchedule?.id) editTask.mutate({ id: editingSchedule.id, data })
    else addTask.mutate(data)
    // try {
    //   if (editingSchedule?.id) {
    //     await updateTask(editingSchedule.id, data);
    //     toast.success("Planning mis à jour avec succès");
    //   } else {
    //     await createTask(data);
    //     toast.success("Planning créé avec succès");
    //   }

    //   // fetchSchedules();
    //   queryclient.invalidateQueries({ queryKey: ["tasks"] })
    //   handleCloseDialog();
    // } catch (error) {
    //   if (error.response?.status === 409) {
    //     const errorMessage = error.response?.data?.message || "Conflit détecté";
    //     toast.error(`Conflit: ${errorMessage}`);
    //   } else if (error.response?.status === 400) {
    //     const errorMessage =
    //       error.response?.data?.message || "Données invalides";
    //     toast.error(`Erreur de validation: ${errorMessage}`);
    //   } else if (error.response?.status === 401) {
    //     toast.error("Session expirée. Veuillez vous reconnecter.");
    //   } else {
    //     toast.error("Erreur lors de la sauvegarde");
    //   }
    // }
  };

  const handleDeleteTask = async (schedule: TaskModel) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer la tâche "${schedule.name}" ?`,
      )
    )
      removeTask.mutate(schedule.id)
    // {
    //   try {
    //     await deleteTask(schedule.id);
    //     toast.success("Tâche supprimée avec succès");
    //     // fetchSchedules();
    //     queryclient.invalidateQueries({ queryKey: ["tasks"] })

    //   } catch (error) {
    //     console.error("Erreur lors de la suppression:", error);
    //     toast.error("Erreur lors de la suppression");
    //   }
    // }
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

      // const availableEmployeesResponse = await getAvailableUserForTask(
      //   schedule.id,
      // );

      // if (availableEmployeesResponse.data.success) {
      //   // Le backend renvoie déjà les employés avec leur statut de disponibilité correct
      //   const employeesWithStatus =
      //     availableEmployeesResponse.data.employees.map((emp) => ({
      //       ...emp,
      //       is_assigned_to_task: !emp.is_available,
      //     }));

      //   setAvailableEmployeesForTask(employeesWithStatus);

      //   // Récupérer aussi les employés déjà assignés à cette tâche
      //   setTaskAssignedEmployees(
      //     availableEmployeesResponse.data.employees.filter(
      //       (emp) => emp.already_assigned,
      //     ),
      //   );
      // } else {
      //   throw new Error("Erreur lors du chargement des employés disponibles");
      // }

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

  // Fonction pour assigner un employé à une tâche spécifique
  // const handleAssignEmployeeToTask = async (employeeId) => {
  //   // Vérification de sécurité
  //   if (!selectedTaskForAssignment || !selectedTaskForAssignment.id) {
  //     console.error(
  //       "Erreur: selectedTaskForAssignment invalide dans handleAssignEmployeeToTask",
  //     );
  //     toast.error("Erreur: Tâche non sélectionnée");
  //     return;
  //   }

  //   try {
  //     const token = localStorage.getItem("token");
  //     const apiBaseUrl = "";
  //     await axios.post(
  //       `${apiBaseUrl}/api/planning/${selectedTaskForAssignment.id}/employees`,
  //       {
  //         employee_id: employeeId,
  //       },
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       },
  //     );

  //     // Mettre à jour la liste des employés assignés
  //     const employee = availableEmployeesForTask.find(
  //       (emp) => emp.id === employeeId,
  //     );
  //     if (employee) {
  //       setTaskAssignedEmployees((prev) => [...prev, employee]);
  //     }

  //     toast.success("Employé assigné avec succès");

  //     // Fermer le dialogue et forcer le rechargement complet
  //     handleCloseTaskAssignmentDialog();

  //     // Forcer le rechargement complet des données
  //     setTimeout(() => {
  //       fetchSchedules();
  //       // setForceUpdate((prev) => prev + 1);
  //     }, 500);
  //   } catch (error) {
  //     console.error("Erreur lors de l'assignation:", error);

  //     // Gérer spécifiquement les erreurs de conflit d'horaires
  //     if (
  //       error.response &&
  //       error.response.status === 400 &&
  //       error.response.data.message
  //     ) {
  //       toast.error(error.response.data.message);
  //     } else {
  //       toast.error("Erreur lors de l'assignation");
  //     }
  //   }
  // };

  // Fonction pour retirer un employé d'une tâche spécifique
  // const handleUnassignEmployeeFromTask = async (employeeId) => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const apiBaseUrl = ""; // import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';
  //     await axios.delete(
  //       `${apiBaseUrl}/api/planning/${selectedTaskForAssignment.id}/employees/${employeeId}`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       },
  //     );

  //     // Mettre à jour la liste des employés assignés
  //     setTaskAssignedEmployees((prev) =>
  //       prev.filter((emp) => emp.id !== employeeId),
  //     );

  //     toast.success("Employé retiré avec succès");

  //     // Rafraîchir les données du planning sans recharger la page
  //     setTimeout(() => {
  //       fetchSchedules();
  //     }, 1000);
  //   } catch (error) {
  //     console.error("Erreur lors du retrait:", error);
  //     toast.error("Erreur lors du retrait");
  //   }
  // };

  // Fonctions pour gérer le popup de conflit
  const handleConfirmConflict = async () => {
    try {
      if (editingSchedule) {
        await updatePlanning(editingSchedule.id, pendingScheduleData);
        // await axios.put(`/api/planning/${editingSchedule.id}`, pendingScheduleData);
        toast.success("Planning mis à jour avec succès (conflit ignoré)");
      } else {
        await createPlanning(pendingScheduleData);
        // await axios.post('/api/planning', pendingScheduleData);
        toast.success("Planning créé avec succès (conflit ignoré)");
      }

      // fetchSchedules();
      queryclient.invalidateQueries({ queryKey: ["tasks"] })

      handleCloseDialog();
      setConflictDialog(false);
      setConflictInfo(null);
      setPendingScheduleData(null);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde avec conflit:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleCancelWorkdayWarning = () => {
    setShowWorkdayWarning(false);
    setPendingScheduleData(null);
    setWorkdayWarningInfo(null);
  };

  const handleConfirmWorkdayWarning = async () => {
    setShowWorkdayWarning(false);
    if (pendingScheduleData) {
      try {
        if (editingSchedule) {
          await updatePlanning(editingSchedule.id, pendingScheduleData);

          // await axios.put(`/api/planning/${editingSchedule.id}`, pendingScheduleData);
          toast.success(
            "Planning créé avec succès (malgré l'absence de l'employé)",
          );
        } else {
          await createPlanning(pendingScheduleData);
          // await axios.post('/api/planning', pendingScheduleData);
          toast.success(
            "Planning créé avec succès (malgré l'absence de l'employé)",
          );
        }
        // fetchSchedules();
        queryclient.invalidateQueries({ queryKey: ["tasks"] })

        handleCloseDialog();
      } catch (error) {
        console.error("Erreur lors de la sauvegarde malgré l'alerte:", error);
        toast.error("Erreur lors de la sauvegarde");
      }
    }
    setPendingScheduleData(null);
    setWorkdayWarningInfo(null);
  };

  const handleCancelConflict = () => {
    setConflictDialog(false);
    setConflictInfo(null);
    setPendingScheduleData(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  const filteredSchedules = schedules.data?.filter((schedule) => {
    return true;
  })
    ;

  const getStatusInfo = (status) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[1]; // Utiliser 'planned' par défaut
  };

  // Fonction pour identifier si une tâche est une tâche d'ouverture
  const isOpeningTask = (schedule: TaskModel) => {
    return schedule.category == "vente";
  };

  // Fonction pour identifier si une tâche est une tâche de présence
  const isPresenceTask = (schedule: TaskModel) => {
    return schedule.category == "point";
  };

  // Fonction pour identifier si une tâche est une tâche de collecte
  const isCollectionTask = (schedule: TaskModel) => {
    return schedule.category == "collection";
  };

  // Fonction pour obtenir le style d'une tâche d'ouverture
  const getOpeningTaskStyle = (schedule: TaskModel) => {
    if (!isOpeningTask(schedule)) return {};

    return {
      backgroundColor: "#e8f5e8",
      border: "2px solid #4caf50",
      borderLeft: "4px solid #4caf50",
      "&:hover": {
        backgroundColor: "#d4edda",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 8px rgba(76, 175, 80, 0.3)",
      },
    };
  };

  // Fonction pour obtenir le style de fond des cartes d'ouverture
  const getOpeningCardStyle = (schedule: TaskModel) => {
    if (!isOpeningTask(schedule)) return {};

    return {
      backgroundColor: "#f1f8e9",
      border: "1px solid #c8e6c9",
      "&:hover": {
        backgroundColor: "#e8f5e8",
        boxShadow: "0 2px 8px rgba(76, 175, 80, 0.2)",
      },
    };
  };

  // Fonction pour obtenir le style d'une tâche de présence
  const getPresenceTaskStyle = (schedule: TaskModel) => {
    if (!isPresenceTask(schedule)) return {};

    return {
      backgroundColor: "#fff3e0",
      border: "2px solid #ff9800",
      borderLeft: "4px solid #ff9800",
      "&:hover": {
        backgroundColor: "#ffe0b2",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 8px rgba(255, 152, 0, 0.3)",
      },
    };
  };

  // Fonction pour obtenir le style de fond des cartes de présence
  const getPresenceCardStyle = (schedule: TaskModel) => {
    if (!isPresenceTask(schedule)) return {};

    return {
      backgroundColor: "#fff8e1",
      border: "1px solid #ffcc02",
      "&:hover": {
        backgroundColor: "#fff3e0",
        boxShadow: "0 2px 8px rgba(255, 152, 0, 0.2)",
      },
    };
  };

  const getPriorityInfo = (priority: string) => {
    return (
      priorityOptions.find((p) => p.value === priority) || priorityOptions[1]
    );
  };

  // Fonction pour obtenir le nom d'affichage correct de la tâche
  // Fonction utilitaire pour filtrer les valeurs "Utilisateur inconnu"
  const getValidEmployeeName = (employeeName: string) => {
    if (!employeeName || employeeName === "Utilisateur inconnu") {
      return null;
    }
    return employeeName;
  };

  const getTaskDisplayName = (schedule: TaskModel) => {
    return schedule.name;
    // Si c'est une tâche de vente (avec notes contenant "Vente -")
    if (schedule.notes?.includes("Vente -")) {
      return "Vente";
    }

    // Si c'est une tâche d'ouverture
    if (isOpeningTask(schedule)) {
      return "Ouverture magasin";
    }

    // Si c'est une tâche de présence
    if (isPresenceTask(schedule)) {
      // Enlever "Présence point de collecte -" et ne garder que le nom qui suit
      if (schedule.task_name?.includes("Présence point de collecte -")) {
        return schedule.task_name
          .replace("Présence point de collecte -", "")
          .trim();
      }
      return schedule.task_name || "Présence point de collecte";
    }

    // Pour les autres tâches, utiliser le nom de la tâche ou un nom par défaut
    return schedule.task_name || "Tâche sans nom";
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
          {/* <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth disabled={!selectedStore}>
              <InputLabel>Filtrer par lieu</InputLabel>
              <Select
                value={selectedLocation}
                onChange={(e) => {
                  console.log("📍 LOCATION SELECTION CHANGED");
                  console.log("📍 New selected location:", e.target.value);
                  setSelectedLocation(e.target.value);
                }}
                label="Filtrer par lieu"
              >
                <MenuItem value="">
                  <em>Tous les lieux</em>
                </MenuItem>
                {locations
                  .filter(
                    (loc) =>
                      !selectedStore || loc.store_id === parseInt(selectedStore)
                  )
                  .map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid> */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {selectedStore
                ? `Affichage des tâches pour ${stores.data?.find((s) => s.id === selectedStore.id)?.name ||
                "magasin sélectionné"
                }`
                : "Affichage de toutes les tâches"}
              {/* {selectedLocation &&
                ` - Lieu: ${locations.find((l) => l.id === parseInt(selectedLocation))?.name || "lieu sélectionné"}`} */}
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
        {viewMode === "calendar" && (
          <CalendarView
            filteredSchedules={schedules.data || []}
            getTaskDisplayName={getTaskDisplayName}
            handleDeleteTask={handleDeleteTask}
            handleOpenDialog={handleOpenDialog}
            handleAssignEmployeesToTask={handleAssignEmployeesToTask}
            isOpeningTask={isOpeningTask}
            isPresenceTask={isPresenceTask}
            selectedDate={selectedDate}
          />
        )}
        {viewMode === "week" && (
          <WeekViewSections
            // collections={collections}
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
            getOpeningCardStyle={getOpeningCardStyle}
            getOpeningTaskStyle={getOpeningTaskStyle}
            getPresenceCardStyle={getPresenceCardStyle}
            getPresenceTaskStyle={getPresenceCardStyle}
            getPriorityInfo={getPriorityInfo}
            getTaskDisplayName={getTaskDisplayName}
            handleDeleteTask={handleDeleteTask}
            handleOpenDialog={handleOpenDialog}
            // handleQuickTimeSlot={handleQuickTimeSlot}
            isOpeningTask={isOpeningTask}
            isPresenceTask={isPresenceTask}
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
            onClick={handleSave}
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
      <Dialog
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
      </Dialog>

      {/* TODO JE L'AI JAMAIS VU */}
      {/* Dialog pour l'alerte de jour de travail */}
      <Dialog
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
      </Dialog>

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
              navigate("/admin/config");
              // Rediriger vers la page d'administration
              window.location.href = "/admin";
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
      {selectedTaskForAssignment &&
        <TaskAssignmentDialog
          open={openTaskAssignmentDialog}
          onClose={handleCloseTaskAssignmentDialog}
          selectedTask={selectedTaskForAssignment}
          // assignedEmployees={taskAssignedEmployees}
          // availableEmployees={availableEmployeesForTask}
          // onAssignEmployee={handleAssignEmployeeToTask}
          // onUnassignEmployee={handleUnassignEmployeeFromTask}
          onCloseWithChanges={() => {
            // Only refetch schedules if changes were made when dialog closes
            // fetchSchedules();
            queryclient.invalidateQueries({ queryKey: ["tasks"] })

          }}
        />
      }

    </Box>
  );
};

export default Planning;
