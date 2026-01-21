import {
  AccessTime,
  Add,
  ArrowBackIos,
  ArrowForwardIos,
  Assignment,
  Block,
  CalendarToday,
  CheckCircle,
  Delete,
  Edit,
  Flag,
  FlagOutlined,
  LocalShipping,
  LocationOn,
  Person,
  PersonAdd,
  PersonOff,
  PlayArrow,
  PriorityHigh,
  Save,
  Settings,
  Stop,
  Store,
  Task,
  ViewDay,
  ViewWeek,
  Warning,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { PlaningForm } from "../components/forms/planningForm";
import { PrecenseEmployees } from "../components/planning/PresenceEmployees";
import WeekViewSections from "../components/planning/WeekViewSections";
import { getCollectionSchedules } from "../services/api/collectionSchedules";
import {
  createPlanning,
  deletePlanning,
  getAvailableUserForTask,
  updatePlanning,
} from "../services/api/planning";
import { fetchStores as fstore } from "../services/api/store";
import { createTask, getTasks, updateTask } from "../services/api/tasks";
import { getEmployees } from "../services/api/employee";
import TaskAssignmentDialog from "../components/planning/TaskAssignmentDialog";

const Planning = () => {
  const [schedules, setSchedules] = useState([]);
  // const [tasks, setTasks] = useState([]);
  // const [employees, setEmployees] = useState([]);
  const [stores, setStores] = useState([]);
  // const [locations, setLocations] = useState([]);
  const [collections, setCollections] = useState([]);

  // Fonction pour générer une couleur basée sur le nom de l'employé
  const getEmployeeColor = (employeeName) => {
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
  const getEmployeeInitials = (employeeName) => {
    if (!employeeName) return "?";
    return employeeName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  const [selectedStore, setSelectedStore] = useState("");
  // const [selectedLocation, setSelectedLocation] = useState("");
  // const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // États pour l'assignation des employés depuis le planning
  const [openTaskAssignmentDialog, setOpenTaskAssignmentDialog] =
    useState(false);
  const [selectedTaskForAssignment, setSelectedTaskForAssignment] =
    useState(null);
  const [taskAssignedEmployees, setTaskAssignedEmployees] = useState([]);
  const [availableEmployeesForTask, setAvailableEmployeesForTask] = useState(
    [],
  );

  // État simple pour forcer la mise à jour
  // const [forceUpdate, setForceUpdate] = useState(0);
  // const [assignedEmployees, setAssignedEmployees] = useState(new Set());

  // États pour l'assignation des employés aux collectes
  const [openCollectionAssignmentDialog, setOpenCollectionAssignmentDialog] =
    useState(false);
  const [selectedCollectionForAssignment, setSelectedCollectionForAssignment] =
    useState(null);
  const [collectionAssignedEmployees, setCollectionAssignedEmployees] =
    useState([]);
  const [availableEmployeesForCollection, setAvailableEmployeesForCollection] =
    useState([]);
  // const [tabValue, setTabValue] = useState(0);
  // const [searchTerm, setSearchTerm] = useState("");
  // const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week"); // semaine par défaut
  // const [showCompleted, setShowCompleted] = useState(true);
  // const [groupBy, setGroupBy] = useState("employee"); // employee, date, priority

  // États pour la gestion des conflits
  const [conflictDialog, setConflictDialog] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [pendingScheduleData, setPendingScheduleData] = useState(null);

  // État pour les employés présents
  const [employeesPresent, setEmployeesPresent] = useState({});
  const [loadingEmployeesPresent, setLoadingEmployeesPresent] = useState(false);
  const [showMissingEmployeesDialog, setShowMissingEmployeesDialog] =
    useState(false);
  const [missingEmployees, setMissingEmployees] = useState([]);
  // const [allEmployees, setAllEmployees] = useState([]);
  const [showWorkdayWarning, setShowWorkdayWarning] = useState(false);
  const [workdayWarningInfo, setWorkdayWarningInfo] = useState(null);

  useEffect(() => {
    // console.log("t", tasks);
    console.log("u", schedules);
  }, [schedules]);

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

  const viewModes = [
    { value: "calendar", label: "Calendrier", icon: <CalendarToday /> },
    { value: "week", label: "Semaine", icon: <ViewWeek /> },
    { value: "day", label: "Jour", icon: <ViewDay /> },
  ];

  useEffect(() => {
    fetchSchedules();
    // fetchTasks();
    // fetchEmployees();
    fetchStores();
    // fetchLocations();
    fetchCollections();
  }, []);

  useEffect(() => {
    if (stores.length > 0) {
      fetchEmployeesPresent();
    }
  }, [stores]);

  useEffect(() => {
    fetchSchedules();
  }, [selectedStore]);

  // useEffect(() => {
  //   if (selectedStore) {
  //     // Filtrer les lieux par magasin sélectionné
  //     const filteredLocations = locations.filter(
  //       (loc) => loc.store_id === parseInt(selectedStore)
  //     );
  //     setLocations(filteredLocations);
  //   }
  // }, [selectedStore, locations]);

  // Recharger les employés quand le magasin sélectionné change
  useEffect(() => {
    if (stores.length > 0) {
      fetchEmployeesPresent();
    }
  }, [selectedStore]);

  const fetchSchedules = async () => {
    try {
      // setLoading(true);
      const params = {};
      if (selectedStore) {
        params.store_id = parseInt(selectedStore);
      }

      const r = await getTasks();
      const tasks = r.data.tasks;
      const synchronizedSchedules = tasks.map((task, i, array) => {
        const users = task.Users || [];
        const occuped = [];

        array
          .filter((a, j) => i != j)
          .forEach((other) => {
            const otherUsers = other.Users;
            users.forEach(
              (user) =>
                otherUsers.some((o) => o.id == user.id) &&
                occuped.push({
                  ...user,
                  assigned_to_task_id: task.id,
                  assigned_to_task_name: task.name || "",
                }),
            );
          });
        return { ...task, occupied_employees: occuped };
      });
      // Logs très visibles
      // Logs de débogage supprimés pour éviter la boucle infinie

      // const response = await getPlanning(params);
      // // await axios.get('/api/planning', { params });
      // // Logs de débogage supprimés pour éviter la boucle infinie

      // if (response.data.success) {
      //   const loadedSchedules = response.data.schedules || [];

      //   // Synchroniser le statut des employés entre toutes les tâches
      //   const synchronizedSchedules = loadedSchedules.map((schedule) => {
      //     const assignedEmployees = schedule.assigned_employees || [];
      //     const occupiedEmployees = [];

      //     // Marquer les employés occupés par d'autres tâches
      //     loadedSchedules.forEach((otherSchedule) => {
      //       if (
      //         otherSchedule.id !== schedule.id &&
      //         otherSchedule.assigned_employees
      //       ) {
      //         otherSchedule.assigned_employees.forEach((emp) => {
      //           if (
      //             !assignedEmployees.some((assigned) => assigned.id === emp.id)
      //           ) {
      //             occupiedEmployees.push({
      //               ...emp,
      //               assigned_to_task_id: otherSchedule.id,
      //               assigned_to_task_name: otherSchedule.task_name,
      //             });
      //           }
      //         });
      //       }
      //     });

      //     return {
      //       ...schedule,
      //       occupied_employees: occupiedEmployees,
      //     };
      //   });

      setSchedules(synchronizedSchedules);

      // Forcer la mise à jour de toutes les cartes
      // setForceUpdate((prev) => prev + 1);

      // Log de débogage supprimé pour éviter la boucle infinie

      // Debug pour les employés assignés - logs supprimés pour éviter la boucle infinie

      //   // Debug pour les tâches Vente
      //   const venteTasks = response.data.schedules?.filter((s) =>
      //     s.notes?.includes("Vente -")
      //   );
      //   // Log supprimé
      //   if (venteTasks && venteTasks.length > 0) {
      //     // Log supprimé
      //     // Log supprimé pour éviter la boucle infinie
      //   }
      //   // Log supprimé

      //   // Log de toutes les tâches pour diagnostic
      //   // Log supprimé
      //   // Logs supprimés pour éviter la boucle infinie
      // } else {
      //   // Log supprimé
      //   setSchedules([]);
      // }
    } catch (error) {
      console.error("❌ ERREUR lors du chargement des plannings:", error);
      console.error("❌ Error details:", error.response?.data);
      toast.error("Erreur lors du chargement des plannings");
      setSchedules([]);
    } finally {
      // setLoading(false);
    }
  };

  // const fetchTasks = async () => {
  //   try {
  //     const response = await getTasks();
  //     //  await axios.get('/api/tasks');
  //     if (response.data.success) {
  //       // Filtrer les tâches pour ne garder que celles pertinentes pour le planning
  //       const allTasks = response.data.tasks || [];
  //       const filteredTasks = allTasks.filter((task) => {
  //         // Exclure seulement la tâche système par défaut créée automatiquement
  //         if (task.name === "Tâche par défaut" && task.id === 1) {
  //           return false;
  //         }

  //         // Garder toutes les tâches actives créées par l'utilisateur
  //         // (y compris "Ouverture de magasin" et "Présence point de collecte" si créées par l'utilisateur)
  //         // return task.status === "active";
  //         return true;
  //       });

  //       // console.log('🔍 Tâches filtrées pour le planning:', filteredTasks.length);
  //       // console.log('🔍 Tâches disponibles:', filteredTasks.map(t => ({ id: t.id, name: t.name, category: t.category })));

  //       setTasks(filteredTasks);
  //     } else {
  //       setTasks([]);
  //     }
  //   } catch (error) {
  //     console.error("Erreur lors du chargement des tâches:", error);
  //     setTasks([]);
  //   }
  // };
  // const fetchEmployees = async () => {
  //   try {
  //     const response = await getEmployees();

  //       setEmployees(response.data.data || []);

  //   } catch (error) {
  //     console.error("Erreur lors du chargement des employés:", error);
  //     setEmployees([]);
  //   }
  // };

  const fetchStores = async () => {
    try {
      const response = await fstore();
      setStores(response.data.stores || []);
    } catch (error) {
      console.error("❌ ERREUR lors du chargement des magasins:", error);
      setStores([]);
    }
  };

  // const fetchLocations = async () => {
  //   try {
  //     const response = await axios.get("/api/store-locations");
  //     if (response.data.locations) {
  //       setLocations(response.data.locations || []);
  //     } else {
  //       setLocations([]);
  //     }
  //   } catch (e) {
  //     setLocations([]);
  //   }
  // };

  const fetchCollections = async () => {
    try {
      const response = await getCollectionSchedules();
      // await axios.get('/api/collection-schedules');
      if (response.data.schedules) {
        setCollections(response.data.schedules || []);
      } else {
        setCollections([]);
      }
    } catch (error) {
      console.error(
        "❌ ERREUR lors du chargement des plannings de collecte:",
        error,
      );
      setCollections([]);
    }
  };

  const fetchEmployeesPresent = async () => {
    try {
      setLoadingEmployeesPresent(true);
      const [infoStoreResponse, employeesResponse] = await Promise.all([
        fstore({ include: "employees" }),
        getEmployees(),
      ]);

      const employeesByStore = {};
      infoStoreResponse.data.stores.forEach((store) => {
        const employees = store.employees;

        employeesByStore[store.id] = employees.map((employee) => {
          return {
            ...employee,
            is_primary: employee.EmployeeStore.is_primary,
            workdays: employee.EmployeeWorkdays,
          };
        });
      });

      const filteredEmployees = employeesResponse.data.data;

      // Récupérer les employés, leurs affectations aux magasins et leurs jours de travail
      // const [employeesResponse, assignmentsResponse, workdaysResponse] =
      //   await Promise.all([
      //     axios.get("/api/users"),
      //     axios.get("/api/employee-stores"),
      //     axios.get("/api/employee-workdays"),
      //   ]);

      // if (
      //   employeesResponse.data.users &&
      //   assignmentsResponse.data.success &&
      //   workdaysResponse.data.success
      // ) {
      //   const employees = employeesResponse.data.users || [];
      //   const assignments = assignmentsResponse.data.assignments || [];
      //   const workdays = workdaysResponse.data.workdays || [];

      //   // Filtrer les employés (exclure les admins)
      //   const filteredEmployees = employees.filter(
      //     (emp) => emp.role !== "admin"
      //   );

      //   // Organiser les employés par magasin avec leurs jours de travail
      //   const employeesByStore = {};

      //   // Initialiser tous les magasins
      //   stores.forEach((store) => {
      //     employeesByStore[store.id] = [];
      //   });

      //   // Ajouter les employés affectés avec leurs jours de travail
      //   assignments.forEach((assignment) => {
      //     const employee = filteredEmployees.find(
      //       (emp) => emp.id === assignment.employee_id
      //     );
      //     if (employee && employeesByStore[assignment.store_id]) {
      //       // Récupérer les jours de travail de cet employé
      //       const employeeWorkdays = workdays.filter(
      //         (wd) => wd.employee_id === employee.id && wd.is_working
      //       );

      //       employeesByStore[assignment.store_id].push({
      //         ...employee,
      //         is_primary: assignment.is_primary,
      //         workdays: employeeWorkdays,
      //       });
      //     }
      //   });
      setEmployeesPresent(employeesByStore);
      // setAllEmployees(filteredEmployees);

      // Détecter les employés manquants (sans affectations ou sans jours de travail)
      const employeesInPlanning = new Set();
      Object.values(employeesByStore).forEach((storeEmployees) => {
        storeEmployees.forEach((employee) => {
          if (employee.workdays && employee.workdays.length > 0) {
            employeesInPlanning.add(employee.id);
          }
        });
      });

      const missingEmployeesList = filteredEmployees.filter(
        (emp) => !employeesInPlanning.has(emp.id),
      );
      setMissingEmployees(missingEmployeesList);

      // Afficher le popup s'il y a des employés manquants
      if (missingEmployeesList.length > 0) {
        setShowMissingEmployeesDialog(true);
      }
    } catch (error) {
      console.error(
        "❌ ERREUR lors du chargement des employés présents:",
        error,
      );
      setEmployeesPresent({});
    } finally {
      setLoadingEmployeesPresent(false);
    }
  };

  // Fonction pour organiser les employés par jour de la semaine
  const getEmployeesByDay = () => {
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

    const employeesByDay = {};

    daysOfWeek.forEach((day, index) => {
      employeesByDay[day] = {
        label: dayLabels[index],
        morning: [],
        afternoon: [],
        allDay: [],
      };
    });

    // Filtrer les employés selon le magasin sélectionné
    let employeesToProcess = [];

    if (selectedStore) {
      // Si un magasin est sélectionné, ne prendre que les employés de ce magasin
      const storeId = parseInt(selectedStore);
      Object.entries(employeesPresent).forEach(
        ([storeIdKey, storeEmployees]) => {
          if (parseInt(storeIdKey) === storeId) {
            employeesToProcess = storeEmployees;
          }
        },
      );
    } else {
      // Si aucun magasin n'est sélectionné, prendre tous les employés
      Object.values(employeesPresent).forEach((storeEmployees) => {
        employeesToProcess = employeesToProcess.concat(storeEmployees);
      });
    }

    // Parcourir les employés filtrés et leurs jours de travail
    employeesToProcess.forEach((employee) => {
      if (employee.workdays && employee.workdays.length > 0) {
        employee.workdays.forEach((workday) => {
          const day = workday.day_of_week;
          const timeSlot = workday.time_slot;
          const isWorking = workday.is_working;

          if (employeesByDay[day] && isWorking) {
            const employeeInfo = {
              ...employee,
              id: employee.id,
              name: employee.username,
              store: employee.is_primary ? "Principal" : "Secondaire",
              startTime: workday.start_time,
              endTime: workday.end_time,
            };

            if (timeSlot === "morning") {
              employeesByDay[day].morning.push(employeeInfo);
            } else if (timeSlot === "afternoon") {
              employeesByDay[day].afternoon.push(employeeInfo);
            }

            // Ajouter aussi à allDay pour un aperçu global
            const existingInAllDay = employeesByDay[day].allDay.find(
              (emp) => emp.id === employee.id,
            );
            if (!existingInAllDay) {
              employeesByDay[day].allDay.push(employeeInfo);
            }
          }
        });
      }
    });
    return employeesByDay;
  };

  // Fonction pour vérifier si un employé travaille un jour donné
  const checkEmployeeWorkday = (employeeId, date, timeSlot) => {
    const dayOfWeek = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    // Parcourir les employés selon le magasin sélectionné
    let employeeWorkdays = [];
    let employeesToCheck = [];

    if (selectedStore) {
      // Si un magasin est sélectionné, ne vérifier que les employés de ce magasin
      const storeId = parseInt(selectedStore);
      Object.entries(employeesPresent).forEach(
        ([storeIdKey, storeEmployees]) => {
          if (parseInt(storeIdKey) === storeId) {
            employeesToCheck = storeEmployees;
          }
        },
      );
    } else {
      // Si aucun magasin n'est sélectionné, vérifier tous les employés
      Object.values(employeesPresent).forEach((storeEmployees) => {
        employeesToCheck = employeesToCheck.concat(storeEmployees);
      });
    }

    employeesToCheck.forEach((employee) => {
      if (employee.id === employeeId && employee.workdays) {
        employeeWorkdays = employee.workdays;
      }
    });

    // Vérifier si l'employé travaille ce jour
    const worksThisDay = employeeWorkdays.some(
      (workday) => workday.day_of_week === dayOfWeek && workday.is_working,
    );

    // Vérifier le créneau spécifique si fourni
    if (timeSlot && worksThisDay) {
      const worksThisTimeSlot = employeeWorkdays.some(
        (workday) =>
          workday.day_of_week === dayOfWeek &&
          workday.time_slot === timeSlot &&
          workday.is_working,
      );
      return worksThisTimeSlot;
    }

    return worksThisDay;
  };

  const handleOpenDialog = (schedule = null, selectedDate = null) => {
    setEditingSchedule(
      schedule || { scheduled_date: selectedDate || new Date() },
    );

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSchedule(null);
  };

  const handleSave = async (data) => {
    try {
      if (editingSchedule) {
        await updateTask(editingSchedule.id, data);
        toast.success("Planning mis à jour avec succès");
      } else {
        await createTask(data);
        toast.success("Planning créé avec succès");
      }

      fetchSchedules();
      handleCloseDialog();
    } catch (error) {
      if (error.response?.status === 409) {
        const errorMessage = error.response?.data?.message || "Conflit détecté";
        toast.error(`Conflit: ${errorMessage}`);
      } else if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message || "Données invalides";
        toast.error(`Erreur de validation: ${errorMessage}`);
      } else if (error.response?.status === 401) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    }
  };

  //FIXME task et planning c'st le meme delete
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce planning ?")) {
      try {
        await deletePlanning(id);
        // await axios.delete(`/api/planning/${id}`);
        toast.success("Planning supprimé avec succès");
        fetchSchedules();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleDeleteTask = async (schedule) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer la tâche "${schedule.task_name}" ?`,
      )
    ) {
      try {
        await deletePlanning(schedule.id);
        toast.success("Tâche supprimée avec succès");
        fetchSchedules();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  // Fonction pour ouvrir le dialogue d'assignation des employés depuis le planning
  const handleAssignEmployeesToTask = async (schedule) => {
    // Vérification de sécurité
    if (!schedule || !schedule.id) {
      console.error(
        "Erreur: schedule invalide dans handleAssignEmployeesToTask",
      );
      return;
    }
    setSelectedTaskForAssignment(schedule);
    // Log de débogage pour les tâches de présence
    if (isPresenceTask(schedule)) {
      // Log de débogage supprimé pour éviter la boucle infinie
    }
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

      const availableEmployeesResponse = await getAvailableUserForTask(
        schedule.id,
      );

      if (availableEmployeesResponse.data.success) {
        // Le backend renvoie déjà les employés avec leur statut de disponibilité correct
        const employeesWithStatus =
          availableEmployeesResponse.data.employees.map((emp) => ({
            ...emp,
            is_assigned_to_task: !emp.is_available,
          }));

        setAvailableEmployeesForTask(employeesWithStatus);

        // Récupérer aussi les employés déjà assignés à cette tâche
        setTaskAssignedEmployees(
          availableEmployeesResponse.data.employees.filter(
            (emp) => emp.already_assigned,
          ),
        );
      } else {
        throw new Error("Erreur lors du chargement des employés disponibles");
      }

      setOpenTaskAssignmentDialog(true);
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error);
      toast.error("Erreur lors du chargement des employés");
    }
  };

  // Fonction supprimée - la disponibilité est maintenant gérée côté backend

  // ========== FONCTIONS POUR L'ASSIGNATION AUX COLLECTES ==========

  // Fonction pour ouvrir le dialogue d'assignation des employés aux collectes
  const handleAssignEmployeesToCollection = async (collection) => {
    // Vérification de sécurité
    if (!collection || !collection.id) {
      console.error(
        "Erreur: collection invalide dans handleAssignEmployeesToCollection",
      );
      return;
    }

    setSelectedCollectionForAssignment(collection);

    try {
      const token = localStorage.getItem("token");
      const apiBaseUrl = ""; // import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';

      const availableEmployeesResponse = await axios.get(
        `${apiBaseUrl}/api/collection-schedules/${collection.id}/available-employees`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (availableEmployeesResponse.data.success) {
        // Le backend renvoie déjà les employés avec leur statut de disponibilité correct
        const employeesWithStatus =
          availableEmployeesResponse.data.employees.map((emp) => ({
            ...emp,
            is_assigned_to_task: !emp.is_available,
          }));

        setAvailableEmployeesForCollection(employeesWithStatus);

        // Récupérer aussi l'employé déjà assigné à cette collecte
        if (collection.employee_name) {
          setCollectionAssignedEmployees([
            {
              id: collection.employee_id,
              username: collection.employee_name,
            },
          ]);
        } else {
          setCollectionAssignedEmployees([]);
        }
      } else {
        throw new Error("Erreur lors du chargement des employés disponibles");
      }

      setOpenCollectionAssignmentDialog(true);
    } catch (e) {
      toast.error("Erreur lors du chargement des employés");
    }
  };

  // Fonction pour fermer le dialogue d'assignation des collectes
  const handleCloseCollectionAssignmentDialog = () => {
    setOpenCollectionAssignmentDialog(false);
    setSelectedCollectionForAssignment(null);
    setCollectionAssignedEmployees([]);
    setAvailableEmployeesForCollection([]);
  };

  // Fonction pour assigner un employé à une collecte
  const handleAssignEmployeeToCollection = async (employeeId) => {
    // Vérification de sécurité
    if (
      !selectedCollectionForAssignment ||
      !selectedCollectionForAssignment.id
    ) {
      console.error(
        "Erreur: selectedCollectionForAssignment invalide dans handleAssignEmployeeToCollection",
      );
      toast.error("Erreur: Collecte non sélectionnée");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const apiBaseUrl = ""; // import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';
      await axios.post(
        `${apiBaseUrl}/api/collection-schedules/${selectedCollectionForAssignment.id}/employees`,
        {
          employee_id: employeeId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Mettre à jour la liste des employés assignés
      const employee = availableEmployeesForCollection.find(
        (emp) => emp.id === employeeId,
      );
      if (employee) {
        setCollectionAssignedEmployees([employee]);
      }

      toast.success("Employé assigné à la collecte avec succès");

      // Fermer le dialogue et forcer le rechargement complet
      handleCloseCollectionAssignmentDialog();

      // Forcer le rechargement complet des données
      setTimeout(() => {
        fetchCollections();
        // setForceUpdate((prev) => prev + 1);
      }, 500);
    } catch (error) {
      console.error("Erreur lors de l'assignation à la collecte:", error);

      // Gérer spécifiquement les erreurs de conflit d'horaires
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Erreur lors de l'assignation à la collecte");
      }
    }
  };

  // Fonction pour retirer un employé d'une collecte
  const handleUnassignEmployeeFromCollection = async (employeeId) => {
    try {
      const token = localStorage.getItem("token");
      const apiBaseUrl = ""; // import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';
      await axios.delete(
        `${apiBaseUrl}/api/collection-schedules/${selectedCollectionForAssignment.id}/employees/${employeeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Mettre à jour la liste des employés assignés
      setCollectionAssignedEmployees([]);

      toast.success("Employé retiré de la collecte avec succès");

      // Fermer le dialogue et forcer le rechargement complet
      handleCloseCollectionAssignmentDialog();

      // Forcer le rechargement complet des données
      setTimeout(() => {
        fetchCollections();
        // setForceUpdate((prev) => prev + 1);
      }, 500);
    } catch (error) {
      console.error(
        "Erreur lors du retrait de l'employé de la collecte:",
        error,
      );
      toast.error("Erreur lors du retrait de l'employé");
    }
  };

  // Fonction pour fermer le dialogue d'assignation
  const handleCloseTaskAssignmentDialog = () => {
    setOpenTaskAssignmentDialog(false);
    setSelectedTaskForAssignment(null);
    setTaskAssignedEmployees([]);
    setAvailableEmployeesForTask([]);
  };

  // Fonction pour assigner un employé à une tâche spécifique
  const handleAssignEmployeeToTask = async (employeeId) => {
    // Vérification de sécurité
    if (!selectedTaskForAssignment || !selectedTaskForAssignment.id) {
      console.error(
        "Erreur: selectedTaskForAssignment invalide dans handleAssignEmployeeToTask",
      );
      toast.error("Erreur: Tâche non sélectionnée");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const apiBaseUrl = "";
      await axios.post(
        `${apiBaseUrl}/api/planning/${selectedTaskForAssignment.id}/employees`,
        {
          employee_id: employeeId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Mettre à jour la liste des employés assignés
      const employee = availableEmployeesForTask.find(
        (emp) => emp.id === employeeId,
      );
      if (employee) {
        setTaskAssignedEmployees((prev) => [...prev, employee]);
      }

      toast.success("Employé assigné avec succès");

      // Fermer le dialogue et forcer le rechargement complet
      handleCloseTaskAssignmentDialog();

      // Forcer le rechargement complet des données
      setTimeout(() => {
        fetchSchedules();
        // setForceUpdate((prev) => prev + 1);
      }, 500);
    } catch (error) {
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
  const handleUnassignEmployeeFromTask = async (employeeId) => {
    try {
      const token = localStorage.getItem("token");
      const apiBaseUrl = ""; // import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';
      await axios.delete(
        `${apiBaseUrl}/api/planning/${selectedTaskForAssignment.id}/employees/${employeeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Mettre à jour la liste des employés assignés
      setTaskAssignedEmployees((prev) =>
        prev.filter((emp) => emp.id !== employeeId),
      );

      toast.success("Employé retiré avec succès");

      // Rafraîchir les données du planning sans recharger la page
      setTimeout(() => {
        fetchSchedules();
      }, 1000);
    } catch (error) {
      console.error("Erreur lors du retrait:", error);
      toast.error("Erreur lors du retrait");
    }
  };

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

      fetchSchedules();
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
        fetchSchedules();
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

  const filteredSchedules = Array.isArray(schedules)
    ? schedules.filter((schedule) => {
        return true;
        // const matchesSearch =
        //   !searchTerm ||
        //   schedule.task_name
        //     ?.toLowerCase()
        //     .includes(searchTerm.toLowerCase()) ||
        //   getValidEmployeeName(schedule.employee_name)
        //     ?.toLowerCase()
        //     .includes(searchTerm.toLowerCase());

        // const matchesEmployee =
        //   filterEmployee === "all" ||
        //   schedule.assigned_to?.toString() === filterEmployee;

        // const matchesStatus =
        //   filterStatus === "all" || schedule.status === filterStatus;

        // const matchesCompleted =
        //   showCompleted || schedule.status !== "completed";

        // const matchesStore =
        //   !selectedStore ||
        //   schedule.store_id?.toString() === selectedStore.toString();

        // const matchesLocation =
        //   !selectedLocation ||
        //   schedule.location_id?.toString() === selectedLocation.toString();

        // return (
        //   matchesSearch &&
        //   matchesEmployee &&
        //   matchesStatus &&
        //   matchesCompleted &&
        //   matchesStore &&
        //   matchesLocation
        // );
      })
    : [];

  const getStatusInfo = (status) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[1]; // Utiliser 'planned' par défaut
  };

  // Fonction pour identifier si une tâche est créée manuellement depuis le planning
  const isManuallyCreatedTask = (schedule) => {
    // Une tâche est créée manuellement si elle a un task_id (pas synchronisée) et un statut 'new'
    // OU si c'est une tâche de vente (même si task_id est null)
    return (
      (schedule.task_id && schedule.status === "new") ||
      schedule.notes?.includes("Vente -")
    );
  };

  // Fonction pour identifier si une tâche est une tâche d'ouverture
  const isOpeningTask = (schedule) => {
    const isOpening =
      schedule.task_name?.includes("Ouverture") ||
      schedule.notes?.includes("Ouverture du magasin") ||
      schedule.notes?.includes("Vente -") || // Les tâches de vente sont des tâches d'ouverture
      schedule.task_id === null; // Les tâches d'ouverture n'ont pas de task_id

    return isOpening;
  };

  // Fonction pour identifier si une tâche est une tâche de présence
  const isPresenceTask = (schedule) => {
    const isPresence =
      schedule.task_name?.includes("Présence point de collecte") ||
      schedule.task_name?.includes("Présence") ||
      schedule.notes?.includes("Présence au point de collecte");

    // Log de débogage supprimé pour éviter la boucle infinie

    return isPresence;
  };

  // Fonction pour identifier si une tâche est une tâche de collecte
  const isCollectionTask = (schedule) => {
    // Exclure les tâches de présence point de collecte
    if (isPresenceTask(schedule)) return false;

    const isCollection =
      schedule.task_name?.includes("Collecte") ||
      schedule.task_name?.includes("collecte") ||
      schedule.notes?.includes("Collecte") ||
      schedule.notes?.includes("collecte") ||
      schedule.task_category === "collection_operations";

    return isCollection;
  };

  // Fonction pour obtenir le style d'une tâche d'ouverture
  const getOpeningTaskStyle = (schedule) => {
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
  const getOpeningCardStyle = (schedule) => {
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
  const getPresenceTaskStyle = (schedule) => {
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
  const getPresenceCardStyle = (schedule) => {
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

  const getPriorityInfo = (priority) => {
    return (
      priorityOptions.find((p) => p.value === priority) || priorityOptions[1]
    );
  };

  // Fonction pour obtenir le nom d'affichage correct de la tâche
  // Fonction utilitaire pour filtrer les valeurs "Utilisateur inconnu"
  const getValidEmployeeName = (employeeName) => {
    if (!employeeName || employeeName === "Utilisateur inconnu") {
      return null;
    }
    return employeeName;
  };

  const getTaskDisplayName = (schedule) => {
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

  // const getProgressPercentage = (schedule) => {
  //   switch (schedule.status) {
  //     case "completed":
  //       return 100;
  //     case "in_progress":
  //       return 50;
  //     case "planned":
  //       return 25;
  //     case "on_hold":
  //       return 25;
  //     default:
  //       return 0;
  //   }
  // };

  // const getSchedulesByGroup = () => {
  //   const grouped = {};
  //   if (Array.isArray(filteredSchedules)) {
  //     filteredSchedules.forEach((schedule) => {
  //       let key;
  //       switch (groupBy) {
  //         case "employee":
  //           key = getValidEmployeeName(schedule.employee_name) || "Non assigné";
  //           break;
  //         case "date":
  //           key = formatDate(schedule.scheduled_date);
  //           break;
  //         case "priority":
  //           key = getPriorityInfo(schedule.priority).label;
  //           break;
  //         default:
  //           key = "Tous";
  //       }

  //       if (!grouped[key]) {
  //         grouped[key] = [];
  //       }
  //       grouped[key].push(schedule);
  //     });
  //   }
  //   return grouped;
  // };

  const renderViewSelector = () => (
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
            {view.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);
    // Premier lundi de la semaine contenant le premier jour
    const startDate = new Date(firstDay);
    startDate.setDate(
      firstDay.getDate() -
        (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1),
    );

    const days = [];
    const currentDate = new Date(startDate);

    // Générer 42 jours (6 semaines)
    for (let i = 0; i < 42; i++) {
      const daySchedules = Array.isArray(filteredSchedules)
        ? filteredSchedules.filter((schedule) => {
            const scheduleDate = new Date(schedule.scheduled_date);
            const matches =
              scheduleDate.getDate() === currentDate.getDate() &&
              scheduleDate.getMonth() === currentDate.getMonth() &&
              scheduleDate.getFullYear() === currentDate.getFullYear();

            // Log de débogage pour les tâches de présence
            // if (schedule.task_name && schedule.task_name.includes('Présence')) {
            //   console.log('🔍 TASK FILTERING:', {
            //     task_name: schedule.task_name,
            //     scheduled_date: schedule.scheduled_date,
            //     scheduleDate: scheduleDate.toISOString(),
            //     currentDate: currentDate.toISOString(),
            //     matches: matches,
            //     day: currentDate.getDate(),
            //     month: currentDate.getMonth(),
            //     year: currentDate.getFullYear()
            //   });
            // }

            return matches;
          })
        : [];

      days.push({
        date: new Date(currentDate),
        schedules: daySchedules,
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === new Date().toDateString(),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const renderCalendarView = () => {
    const calendarDays = generateCalendarDays(selectedDate);
    const monthNames = [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre",
    ];
    const dayNames = [
      "lundi",
      "mardi",
      "mercredi",
      "jeudi",
      "vendredi",
      "samedi",
      "dimanche",
    ];

    return (
      <Box sx={{ bgcolor: "white", minHeight: "100vh", p: 3 }}>
        {/* En-tête principal */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: "bold",
              color: "#333",
              mb: 3,
              fontSize: "2.5rem",
            }}
          >
            Calendrier des Lieux de collecte
          </Typography>

          {/* Filtres de statut - style pills */}
          <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
            {statusOptions.map((status) => (
              <Box
                key={status.value}
                onClick={() =>
                  setFilterStatus(
                    filterStatus === status.value ? "all" : status.value,
                  )
                }
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: "20px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  bgcolor:
                    filterStatus === status.value
                      ? status.color === "primary"
                        ? "#e3f2fd"
                        : status.color === "warning"
                          ? "#fff3e0"
                          : status.color === "success"
                            ? "#e8f5e8"
                            : status.color === "error"
                              ? "#ffebee"
                              : "#f5f5f5"
                      : "#f5f5f5",
                  color:
                    filterStatus === status.value
                      ? status.color === "primary"
                        ? "#1976d2"
                        : status.color === "warning"
                          ? "#f57c00"
                          : status.color === "success"
                            ? "#388e3c"
                            : status.color === "error"
                              ? "#d32f2f"
                              : "#666"
                      : "#666",
                  border: "1px solid",
                  borderColor:
                    filterStatus === status.value
                      ? status.color === "primary"
                        ? "#bbdefb"
                        : status.color === "warning"
                          ? "#ffcc02"
                          : status.color === "success"
                            ? "#c8e6c9"
                            : status.color === "error"
                              ? "#ffcdd2"
                              : "#e0e0e0"
                      : "#e0e0e0",
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
            ))}
          </Box>

          {/* Navigation et sélecteur de vue */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            {/* Navigation mois */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                onClick={() =>
                  setSelectedDate(
                    new Date(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth() - 1,
                    ),
                  )
                }
                sx={{
                  bgcolor: "#f5f5f5",
                  "&:hover": { bgcolor: "#e0e0e0" },
                  width: 40,
                  height: 40,
                }}
              >
                <ArrowBackIos fontSize="small" />
              </IconButton>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mx: 2 }}
              >
                <CalendarToday sx={{ color: "#666", fontSize: 20 }} />
                <Typography
                  variant="h5"
                  sx={{ color: "#333", fontWeight: "bold" }}
                >
                  {monthNames[selectedDate.getMonth()]}{" "}
                  {selectedDate.getFullYear()}
                </Typography>
              </Box>

              <IconButton
                onClick={() =>
                  setSelectedDate(
                    new Date(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth() + 1,
                    ),
                  )
                }
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

            {/* Bouton d'ajout et sélecteur de vue */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
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

              {/* Sélecteur de vue */}
              {renderViewSelector()}
            </Box>
          </Box>
        </Box>

        {/* Grille du calendrier */}
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {/* En-têtes des jours */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              borderBottom: "2px solid #e0e0e0",
            }}
          >
            {dayNames.map((day) => (
              <Box
                key={day}
                sx={{
                  py: 2,
                  textAlign: "center",
                  fontWeight: "bold",
                  bgcolor: "#f8f9fa",
                  borderRight: "1px solid #e0e0e0",
                  "&:last-child": { borderRight: "none" },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#666", textTransform: "capitalize" }}
                >
                  {day}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Jours du calendrier */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {calendarDays.map((day, index) => (
              <Box
                key={index}
                onClick={() => handleOpenDialog(null, day.date)}
                sx={{
                  minHeight: 100,
                  borderRight: "1px solid #e0e0e0",
                  borderBottom: "1px solid #e0e0e0",
                  position: "relative",
                  bgcolor: day.isToday ? "#e3f2fd" : "white",
                  "&:nth-of-type(7n)": { borderRight: "none" },
                  "&:hover": {
                    bgcolor: day.isToday ? "#e3f2fd" : "#f8f9fa",
                    cursor: "pointer",
                  },
                }}
              >
                <Box sx={{ p: 1.5, height: "100%" }}>
                  {/* Numéro du jour */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: day.isToday ? "bold" : "normal",
                      color: day.isCurrentMonth ? "#333" : "#999",
                      mb: 1,
                      fontSize: "0.875rem",
                    }}
                  >
                    {day.date.getDate().toString().padStart(2, "0")}
                  </Typography>

                  {/* Événements du jour */}
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    {day.schedules
                      .slice(0, 2)
                      .map((schedule, scheduleIndex) => {
                        const statusInfo = getStatusInfo(schedule.status);
                        // Log de débogage pour voir les tâches
                        // Log de débogage supprimé pour éviter la boucle infinie

                        return (
                          <Box
                            key={scheduleIndex}
                            onClick={(e) => {
                              e.stopPropagation(); // Empêcher la propagation du clic vers le jour
                              handleOpenDialog(schedule);
                            }}
                            sx={{
                              p: 1,
                              bgcolor: isOpeningTask(schedule)
                                ? "#f1f8e9"
                                : isPresenceTask(schedule)
                                  ? "#fff8e1"
                                  : "#e3f2fd",
                              borderRadius: 1,
                              cursor: "pointer",
                              border: isOpeningTask(schedule)
                                ? "1px solid #c8e6c9"
                                : isPresenceTask(schedule)
                                  ? "1px solid #ffcc02"
                                  : "1px solid #bbdefb",
                              transition: "all 0.2s",
                              "&:hover": {
                                bgcolor: isOpeningTask(schedule)
                                  ? "#e8f5e8"
                                  : isPresenceTask(schedule)
                                    ? "#fff3e0"
                                    : "#bbdefb",
                                transform: "translateY(-1px)",
                                boxShadow: isOpeningTask(schedule)
                                  ? "0 2px 4px rgba(76, 175, 80, 0.2)"
                                  : isPresenceTask(schedule)
                                    ? "0 2px 4px rgba(255, 152, 0, 0.2)"
                                    : "0 2px 4px rgba(0,0,0,0.1)",
                              },
                            }}
                          >
                            <Box sx={{ mb: 0.5 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 0.5,
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    fontWeight="bold"
                                    sx={{
                                      color: isOpeningTask(schedule)
                                        ? "#4caf50"
                                        : isPresenceTask(schedule)
                                          ? "#ff9800"
                                          : "#1976d2",
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    {getTaskDisplayName(schedule)}
                                  </Typography>
                                  {isOpeningTask(schedule) ? (
                                    <Store
                                      sx={{ fontSize: 12, color: "#4caf50" }}
                                    />
                                  ) : isPresenceTask(schedule) ? (
                                    <LocationOn
                                      sx={{ fontSize: 12, color: "#ff9800" }}
                                    />
                                  ) : (
                                    <Assignment
                                      sx={{ fontSize: 12, color: "#1976d2" }}
                                    />
                                  )}
                                </Box>
                              </Box>

                              {/* Affichage des employés assignés */}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  mt: 0.5,
                                }}
                              >
                                <Person sx={{ fontSize: 10, color: "#666" }} />
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.3,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {/* Employés assignés au type de tâche prédéfinie */}
                                  {schedule.task_employees &&
                                    schedule.task_employees.length > 0 && (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 0.3,
                                          ml: 0.5,
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "#666",
                                            fontSize: "0.6rem",
                                          }}
                                        >
                                          +{schedule.task_employees.length}{" "}
                                          autres
                                        </Typography>
                                        {schedule.task_employees
                                          .slice(0, 2)
                                          .map((emp, index) => (
                                            <Avatar
                                              key={index}
                                              sx={{
                                                width: 14,
                                                height: 14,
                                                fontSize: "0.5rem",
                                                bgcolor: getEmployeeColor(
                                                  emp.username,
                                                ),
                                                color: "white",
                                                fontWeight: "bold",
                                              }}
                                              title={emp.username}
                                            >
                                              {getEmployeeInitials(
                                                emp.username,
                                              )}
                                            </Avatar>
                                          ))}
                                      </Box>
                                    )}

                                  {/* Employés assignés à cette tâche spécifique du planning */}
                                  {schedule.assigned_employees &&
                                    schedule.assigned_employees.length > 0 && (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: 0.5,
                                          mt: 0.5,
                                          p: 0.8,
                                          bgcolor: "#e8f5e8",
                                          borderRadius: 1.5,
                                          border: "2px solid #4caf50",
                                          boxShadow:
                                            "0 2px 4px rgba(76, 175, 80, 0.2)",
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "#2e7d32",
                                            fontSize: "0.75rem",
                                            fontWeight: "bold",
                                            textAlign: "center",
                                            mb: 0.5,
                                          }}
                                        >
                                          👥 Employés assignés (
                                          {schedule.assigned_employees.length})
                                        </Typography>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 0.8,
                                            justifyContent: "center",
                                          }}
                                        >
                                          {schedule.assigned_employees.map(
                                            (emp, index) => (
                                              <Box
                                                key={index}
                                                sx={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  gap: 0.5,
                                                  p: 0.5,
                                                  bgcolor: "white",
                                                  borderRadius: 1,
                                                  border: "1px solid #c8e6c9",
                                                  minWidth: "fit-content",
                                                }}
                                              >
                                                <Avatar
                                                  sx={{
                                                    width: 24,
                                                    height: 24,
                                                    fontSize: "0.8rem",
                                                    bgcolor: getEmployeeColor(
                                                      emp.username,
                                                    ),
                                                    color: "white",
                                                    fontWeight: "bold",
                                                    border: "2px solid #4caf50",
                                                  }}
                                                  title={emp.username}
                                                >
                                                  {getEmployeeInitials(
                                                    emp.username,
                                                  )}
                                                </Avatar>
                                                <Typography
                                                  variant="caption"
                                                  sx={{
                                                    color: "#2e7d32",
                                                    fontSize: "0.75rem",
                                                    fontWeight: "bold",
                                                    maxWidth: 100,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                  }}
                                                >
                                                  {emp.username}
                                                </Typography>
                                              </Box>
                                            ),
                                          )}
                                        </Box>
                                      </Box>
                                    )}
                                </Box>
                              </Box>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 0.5,
                                mt: 0.5,
                              }}
                            >
                              {/* BOUTON DE TEST - TOUJOURS VISIBLE */}
                              <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert("Bouton cliqué !");
                                }}
                                sx={{
                                  bgcolor: "#4caf50",
                                  color: "white",
                                  fontSize: "0.6rem",
                                  height: 24,
                                  minWidth: 60,
                                  "&:hover": {
                                    bgcolor: "#45a049",
                                  },
                                }}
                              >
                                + EMPLOYÉS
                              </Button>

                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "Modification de la tâche:",
                                    schedule,
                                  );
                                  handleOpenDialog(schedule);
                                }}
                                sx={{
                                  color: "#2196f3",
                                  minWidth: 20,
                                  minHeight: 20,
                                  width: 20,
                                  height: 20,
                                  bgcolor: "rgba(33, 150, 243, 0.1)",
                                  border: "1px solid rgba(33, 150, 243, 0.3)",
                                  "&:hover": {
                                    bgcolor: "#e3f2fd",
                                    transform: "scale(1.2)",
                                    border: "1px solid #2196f3",
                                  },
                                }}
                              >
                                <Edit sx={{ fontSize: 12 }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "Suppression de la tâche:",
                                    schedule,
                                  );
                                  handleDeleteTask(schedule);
                                }}
                                sx={{
                                  color: "#f44336",
                                  minWidth: 20,
                                  minHeight: 20,
                                  width: 20,
                                  height: 20,
                                  bgcolor: "rgba(244, 67, 54, 0.1)",
                                  border: "1px solid rgba(244, 67, 54, 0.3)",
                                  "&:hover": {
                                    bgcolor: "#ffebee",
                                    transform: "scale(1.2)",
                                    border: "1px solid #f44336",
                                  },
                                }}
                              >
                                <Delete sx={{ fontSize: 12 }} />
                              </IconButton>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <Person sx={{ fontSize: 10, color: "#666" }} />
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.3,
                                }}
                              ></Box>
                            </Box>
                          </Box>
                        );
                      })}

                    {/* Indicateur s'il y a plus d'événements */}
                    {day.schedules.length > 2 && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#999",
                          textAlign: "center",
                          mt: 0.5,
                          fontSize: "0.7rem",
                        }}
                      >
                        +{day.schedules.length - 2} autres
                      </Typography>
                    )}

                    {/* Indicateur pour ajouter un événement si le jour est vide */}
                    {day.schedules.length === 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mt: 2,
                          opacity: 0.3,
                        }}
                      >
                        <Add sx={{ fontSize: 16, color: "#666" }} />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour commencer le lundi
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }

    const dayNames = [
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
      "Dimanche",
    ];

    return (
      <Box sx={{ bgcolor: "white", minHeight: "100vh", p: 3 }}>
        {/* En-tête */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: "bold", color: "#333", mb: 3 }}
          >
            Vue Semaine
          </Typography>

          {/* Navigation semaine */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                onClick={() =>
                  setSelectedDate(
                    new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000),
                  )
                }
                sx={{
                  bgcolor: "#f5f5f5",
                  "&:hover": { bgcolor: "#e0e0e0" },
                  width: 40,
                  height: 40,
                }}
              >
                <ArrowBackIos fontSize="small" />
              </IconButton>

              <Typography
                variant="h5"
                sx={{ color: "#333", fontWeight: "bold" }}
              >
                Semaine du {startOfWeek.toLocaleDateString("fr-FR")} au{" "}
                {weekDays[6].toLocaleDateString("fr-FR")}
              </Typography>

              <IconButton
                onClick={() =>
                  setSelectedDate(
                    new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000),
                  )
                }
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

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
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

              {/* Sélecteur de vue */}
              {renderViewSelector()}
            </Box>
          </Box>
        </Box>

        <WeekViewSections
          collections={collections}
          schedules={filteredSchedules}
          getEmployeeColor={getEmployeeColor}
          getEmployeeInitials={getEmployeeInitials}
          handleAssignEmployeesToTask={handleAssignEmployeesToTask}
          handleDeleteTask={handleDeleteTask}
          handleOpenDialog={handleOpenDialog}
          selectedDate={selectedDate}
          handleAssignEmployeesToCollection={handleAssignEmployeesToCollection}
        />
      </Box>
    );
  };

  const renderDayView = () => {
    const daySchedules = Array.isArray(filteredSchedules)
      ? filteredSchedules.filter((schedule) => {
          const scheduleDate = new Date(schedule.scheduled_date);
          return (
            scheduleDate.getDate() === selectedDate.getDate() &&
            scheduleDate.getMonth() === selectedDate.getMonth() &&
            scheduleDate.getFullYear() === selectedDate.getFullYear()
          );
        })
      : [];

    return (
      <Box sx={{ bgcolor: "white", minHeight: "100vh", p: 3 }}>
        {/* En-tête */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: "bold", color: "#333", mb: 3 }}
          >
            Vue Jour
          </Typography>

          {/* Navigation jour */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                onClick={() =>
                  setSelectedDate(
                    new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000),
                  )
                }
                sx={{
                  bgcolor: "#f5f5f5",
                  "&:hover": { bgcolor: "#e0e0e0" },
                  width: 40,
                  height: 40,
                }}
              >
                <ArrowBackIos fontSize="small" />
              </IconButton>

              <Typography
                variant="h5"
                sx={{ color: "#333", fontWeight: "bold" }}
              >
                {selectedDate.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>

              <IconButton
                onClick={() =>
                  setSelectedDate(
                    new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000),
                  )
                }
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

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
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

              {/* Sélecteur de vue */}
              {renderViewSelector()}
            </Box>
          </Box>
        </Box>

        {/* Calendrier par créneaux */}
        <Grid container spacing={3}>
          {/* Créneau Matin */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: "100%", border: "2px solid #4caf50" }}>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "#4caf50" }}
                    >
                      🌅 Matin (8h - 12h)
                    </Typography>
                    <Chip
                      label={`${
                        daySchedules.filter((s) => {
                          const startHour = parseInt(
                            s.start_time?.split(":")[0] || "0",
                          );
                          return startHour >= 8 && startHour < 12;
                        }).length
                      } tâche${
                        daySchedules.filter((s) => {
                          const startHour = parseInt(
                            s.start_time?.split(":")[0] || "0",
                          );
                          return startHour >= 8 && startHour < 12;
                        }).length > 1
                          ? "s"
                          : ""
                      }`}
                      size="small"
                      sx={{ bgcolor: "#e8f5e8", color: "#4caf50" }}
                    />
                  </Box>
                }
                action={
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => {
                      handleOpenDialog();
                      handleQuickTimeSlot("morning");
                    }}
                    sx={{ borderColor: "#4caf50", color: "#4caf50" }}
                  >
                    Ajouter
                  </Button>
                }
              />
              <CardContent>
                <Stack spacing={2}>
                  {daySchedules.filter((schedule) => {
                    const startHour = parseInt(
                      schedule.start_time?.split(":")[0] || "0",
                    );
                    return startHour >= 8 && startHour < 12;
                  }).length > 0 ? (
                    daySchedules
                      .filter((schedule) => {
                        const startHour = parseInt(
                          schedule.start_time?.split(":")[0] || "0",
                        );
                        return startHour >= 8 && startHour < 12;
                      })
                      .map((schedule, index) => {
                        const statusInfo = getStatusInfo(schedule.status);
                        const priorityInfo = getPriorityInfo(schedule.priority);

                        return (
                          <Card
                            key={index}
                            onClick={() => handleOpenDialog(schedule)}
                            sx={{
                              cursor: "pointer",
                              border: `1px solid ${statusInfo.color}`,
                              "&:hover": {
                                boxShadow: 2,
                                transform: "translateY(-1px)",
                              },
                              transition: "all 0.2s ease",
                              ...getOpeningTaskStyle(schedule),
                              ...getOpeningCardStyle(schedule),
                              ...getPresenceTaskStyle(schedule),
                              ...getPresenceCardStyle(schedule),
                            }}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ mb: 1 }}>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="bold"
                                  noWrap
                                  sx={{
                                    color: isOpeningTask(schedule)
                                      ? "#4caf50"
                                      : isPresenceTask(schedule)
                                        ? "#ff9800"
                                        : "inherit",
                                  }}
                                >
                                  {getTaskDisplayName(schedule)}
                                </Typography>
                                {isOpeningTask(schedule) && (
                                  <Chip
                                    label="🏪 Ouverture"
                                    size="small"
                                    sx={{
                                      bgcolor: "#4caf50",
                                      color: "white",
                                      fontWeight: "bold",
                                      fontSize: "0.7rem",
                                      mt: 0.5,
                                    }}
                                  />
                                )}
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  gap: 0.5,
                                  mt: 1,
                                }}
                              >
                                {/* BOUTON DE TEST - TOUJOURS VISIBLE */}
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    alert("Bouton cliqué !");
                                  }}
                                  sx={{
                                    bgcolor: "#4caf50",
                                    color: "white",
                                    fontSize: "0.6rem",
                                    height: 24,
                                    minWidth: 60,
                                    "&:hover": {
                                      bgcolor: "#45a049",
                                    },
                                  }}
                                >
                                  + EMPLOYÉS
                                </Button>

                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log(
                                      "Modification de la tâche:",
                                      schedule,
                                    );
                                    handleOpenDialog(schedule);
                                  }}
                                  sx={{
                                    color: "#2196f3",
                                    minWidth: 24,
                                    minHeight: 24,
                                    width: 24,
                                    height: 24,
                                    bgcolor: "rgba(33, 150, 243, 0.1)",
                                    border: "1px solid rgba(33, 150, 243, 0.3)",
                                    "&:hover": {
                                      bgcolor: "#e3f2fd",
                                      transform: "scale(1.2)",
                                      border: "1px solid #2196f3",
                                    },
                                  }}
                                >
                                  <Edit sx={{ fontSize: 14 }} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log(
                                      "Suppression de la tâche:",
                                      schedule,
                                    );
                                    handleDeleteTask(schedule);
                                  }}
                                  sx={{
                                    color: "#f44336",
                                    minWidth: 24,
                                    minHeight: 24,
                                    width: 24,
                                    height: 24,
                                    bgcolor: "rgba(244, 67, 54, 0.1)",
                                    border: "1px solid rgba(244, 67, 54, 0.3)",
                                    "&:hover": {
                                      bgcolor: "#ffebee",
                                      transform: "scale(1.2)",
                                      border: "1px solid #f44336",
                                    },
                                  }}
                                >
                                  <Delete sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Box>
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ fontWeight: "bold", color: "#2196f3" }}
                              >
                                🏪{" "}
                                {schedule.store_name || "Magasin non assigné"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {formatTime(schedule.start_time)} -{" "}
                                {formatTime(schedule.end_time)}
                              </Typography>
                              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                <Chip
                                  label={statusInfo.label}
                                  size="small"
                                  sx={{
                                    bgcolor: isManuallyCreatedTask(schedule)
                                      ? "#e0e0e0"
                                      : statusInfo.color,
                                    color: isManuallyCreatedTask(schedule)
                                      ? "#333"
                                      : "white",
                                    fontSize: "0.7rem",
                                  }}
                                />
                                <Chip
                                  label={priorityInfo.label}
                                  size="small"
                                  variant="outlined"
                                  color={priorityInfo.color}
                                  sx={{ fontSize: "0.7rem" }}
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        );
                      })
                  ) : (
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 4,
                        color: "text.secondary",
                      }}
                    >
                      <Typography variant="body2">
                        Aucune tâche programmée
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Créneau Après-midi */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: "100%", border: "2px solid #ff9800" }}>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "#ff9800" }}
                    >
                      🌞 Après-midi (13h30 - 17h)
                    </Typography>
                    <Chip
                      label={`${
                        daySchedules.filter((s) => {
                          const startHour = parseInt(
                            s.start_time?.split(":")[0] || "0",
                          );
                          return startHour >= 13 && startHour < 17;
                        }).length
                      } tâche${
                        daySchedules.filter((s) => {
                          const startHour = parseInt(
                            s.start_time?.split(":")[0] || "0",
                          );
                          return startHour >= 13 && startHour < 17;
                        }).length > 1
                          ? "s"
                          : ""
                      }`}
                      size="small"
                      sx={{ bgcolor: "#fff3e0", color: "#ff9800" }}
                    />
                  </Box>
                }
                action={
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => {
                      handleOpenDialog();
                      handleQuickTimeSlot("afternoon");
                    }}
                    sx={{ borderColor: "#ff9800", color: "#ff9800" }}
                  >
                    Ajouter
                  </Button>
                }
              />
              <CardContent>
                <Stack spacing={2}>
                  {daySchedules.filter((schedule) => {
                    const startHour = parseInt(
                      schedule.start_time?.split(":")[0] || "0",
                    );
                    return startHour >= 13 && startHour < 17;
                  }).length > 0 ? (
                    daySchedules
                      .filter((schedule) => {
                        const startHour = parseInt(
                          schedule.start_time?.split(":")[0] || "0",
                        );
                        return startHour >= 13 && startHour < 17;
                      })
                      .map((schedule, index) => {
                        const statusInfo = getStatusInfo(schedule.status);
                        const priorityInfo = getPriorityInfo(schedule.priority);

                        return (
                          <Card
                            key={index}
                            onClick={() => handleOpenDialog(schedule)}
                            sx={{
                              cursor: "pointer",
                              border: `1px solid ${statusInfo.color}`,
                              "&:hover": {
                                boxShadow: 2,
                                transform: "translateY(-1px)",
                              },
                              transition: "all 0.2s ease",
                              ...getOpeningTaskStyle(schedule),
                              ...getOpeningCardStyle(schedule),
                              ...getPresenceTaskStyle(schedule),
                              ...getPresenceCardStyle(schedule),
                            }}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ mb: 1 }}>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="bold"
                                  noWrap
                                  sx={{
                                    color: isOpeningTask(schedule)
                                      ? "#4caf50"
                                      : isPresenceTask(schedule)
                                        ? "#ff9800"
                                        : "inherit",
                                  }}
                                >
                                  {getTaskDisplayName(schedule)}
                                </Typography>
                                {isOpeningTask(schedule) && (
                                  <Chip
                                    label="🏪 Ouverture"
                                    size="small"
                                    sx={{
                                      bgcolor: "#4caf50",
                                      color: "white",
                                      fontWeight: "bold",
                                      fontSize: "0.7rem",
                                      mt: 0.5,
                                    }}
                                  />
                                )}
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  gap: 0.5,
                                  mt: 1,
                                }}
                              >
                                {/* BOUTON DE TEST - TOUJOURS VISIBLE */}
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    alert("Bouton cliqué !");
                                  }}
                                  sx={{
                                    bgcolor: "#4caf50",
                                    color: "white",
                                    fontSize: "0.6rem",
                                    height: 24,
                                    minWidth: 60,
                                    "&:hover": {
                                      bgcolor: "#45a049",
                                    },
                                  }}
                                >
                                  + EMPLOYÉS
                                </Button>

                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log(
                                      "Modification de la tâche:",
                                      schedule,
                                    );
                                    handleOpenDialog(schedule);
                                  }}
                                  sx={{
                                    color: "#2196f3",
                                    minWidth: 24,
                                    minHeight: 24,
                                    width: 24,
                                    height: 24,
                                    bgcolor: "rgba(33, 150, 243, 0.1)",
                                    border: "1px solid rgba(33, 150, 243, 0.3)",
                                    "&:hover": {
                                      bgcolor: "#e3f2fd",
                                      transform: "scale(1.2)",
                                      border: "1px solid #2196f3",
                                    },
                                  }}
                                >
                                  <Edit sx={{ fontSize: 14 }} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log(
                                      "Suppression de la tâche:",
                                      schedule,
                                    );
                                    handleDeleteTask(schedule);
                                  }}
                                  sx={{
                                    color: "#f44336",
                                    minWidth: 24,
                                    minHeight: 24,
                                    width: 24,
                                    height: 24,
                                    bgcolor: "rgba(244, 67, 54, 0.1)",
                                    border: "1px solid rgba(244, 67, 54, 0.3)",
                                    "&:hover": {
                                      bgcolor: "#ffebee",
                                      transform: "scale(1.2)",
                                      border: "1px solid #f44336",
                                    },
                                  }}
                                >
                                  <Delete sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Box>
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ fontWeight: "bold", color: "#2196f3" }}
                              >
                                🏪{" "}
                                {schedule.store_name || "Magasin non assigné"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {formatTime(schedule.start_time)} -{" "}
                                {formatTime(schedule.end_time)}
                              </Typography>
                              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                <Chip
                                  label={statusInfo.label}
                                  size="small"
                                  sx={{
                                    bgcolor: isManuallyCreatedTask(schedule)
                                      ? "#e0e0e0"
                                      : statusInfo.color,
                                    color: isManuallyCreatedTask(schedule)
                                      ? "#333"
                                      : "white",
                                    fontSize: "0.7rem",
                                  }}
                                />
                                <Chip
                                  label={priorityInfo.label}
                                  size="small"
                                  variant="outlined"
                                  color={priorityInfo.color}
                                  sx={{ fontSize: "0.7rem" }}
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        );
                      })
                  ) : (
                    <Box
                      sx={{
                        textAlign: "center",
                        py: 4,
                        color: "text.secondary",
                      }}
                    >
                      <Typography variant="body2">
                        Aucune tâche programmée
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
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
                value={selectedStore}
                onChange={(e) => {
                  // console.log("🏪 STORE SELECTION CHANGED");
                  // console.log("🏪 New selected store:", e.target.value);
                  setSelectedStore(e.target.value);
                  // setSelectedLocation(""); // Reset location when store changes
                }}
                label="Filtrer par magasin"
              >
                <MenuItem value="">
                  <em>Tous les magasins</em>
                </MenuItem>
                {stores.map((store) => (
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
                ? `Affichage des tâches pour ${
                    stores.find((s) => s.id === parseInt(selectedStore))
                      ?.name || "magasin sélectionné"
                  }`
                : "Affichage de toutes les tâches"}
              {/* {selectedLocation &&
                ` - Lieu: ${locations.find((l) => l.id === parseInt(selectedLocation))?.name || "lieu sélectionné"}`} */}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Planning des employés par jour */}
      <PrecenseEmployees
        getEmployeesByDay={getEmployeesByDay}
        loadingEmployeesPresent={loadingEmployeesPresent}
        selectedStore={selectedStore}
        setShowMissingEmployeesDialog={setShowMissingEmployeesDialog}
      ></PrecenseEmployees>

      {viewMode === "calendar" && renderCalendarView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "day" && renderDayView()}

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
            stores={stores}
          />
          {/* <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Tâche</InputLabel>
                <Select
                  name="task_id"
                  value={formData.task_id}
                  onChange={handleInputChange}
                  label="Tâche"
                >
                  <MenuItem value="vente">Vente - Création manuelle</MenuItem>
                  {tasks && tasks.length > 0 ? (
                    tasks.map((task) => (
                      <MenuItem key={task.id} value={task.id}>
                        {task.name} ({task.category})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      Aucune tâche disponible
                      <br />
                      <small style={{ fontSize: "0.7em", color: "#666" }}>
                        Créez des tâches dans la section "Gestion des Tâches"
                      </small>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Date"
                name="scheduled_date"
                type="date"
                value={
                  formData.scheduled_date
                    ? formData.scheduled_date.toISOString().split("T")[0]
                    : ""
                }
                onChange={handleDateChange}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Heure de début"
                name="start_time"
                type="time"
                value={formData.start_time}
                onChange={handleInputChange}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Heure de fin"
                name="end_time"
                type="time"
                value={formData.end_time}
                onChange={handleInputChange}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>


            <Grid size={{ xs: 12 }}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 2, color: "#666", fontWeight: "bold" }}
              >
                Configuration rapide des horaires
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  onClick={() => handleQuickTimeSlot("morning")}
                  sx={{
                    borderColor: "#4caf50",
                    color: "#4caf50",
                    "&:hover": {
                      borderColor: "#45a049",
                      backgroundColor: "#f1f8e9",
                    },
                    px: 3,
                    py: 1.5,
                    borderRadius: "20px",
                  }}
                >
                  🌅 Matin (8h - 12h)
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleQuickTimeSlot("afternoon")}
                  sx={{
                    borderColor: "#ff9800",
                    color: "#ff9800",
                    "&:hover": {
                      borderColor: "#f57c00",
                      backgroundColor: "#fff3e0",
                    },
                    px: 3,
                    py: 1.5,
                    borderRadius: "20px",
                  }}
                >
                  🌞 Après-midi (13h30 - 17h)
                </Button>
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#e3f2fd",
                  borderRadius: 1,
                  border: "1px solid #2196f3",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <PersonAdd sx={{ fontSize: 20, color: "#2196f3" }} />
                <Typography variant="body2" sx={{ color: "#1976d2" }}>
                  <strong>Assignation des employés :</strong> Une fois la tâche
                  créée, vous pourrez assigner des employés en cliquant sur le
                  bouton "+" de la tâche. Le système filtrera automatiquement
                  les employés disponibles selon le magasin et les horaires.
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Priorité</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  label="Priorité"
                >
                  {priorityOptions.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {priority.icon}
                        {priority.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Magasin</InputLabel>
                <Select
                  name="store_id"
                  value={formData.store_id || ""}
                  onChange={handleInputChange}
                  label="Magasin"
                >
                  <MenuItem value="">
                    <em>Sélectionner un magasin</em>
                  </MenuItem>
                  {stores.map((store) => (
                    <MenuItem key={store.id} value={store.id}>
                      {store.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Lieu spécifique</InputLabel>
                <Select
                  name="location_id"
                  value={formData.location_id || ""}
                  onChange={handleInputChange}
                  label="Lieu spécifique"
                >
                  <MenuItem value="">
                    <em>Tous les lieux</em>
                  </MenuItem>
                  {locations
                    .filter(
                      (loc) =>
                        !formData.store_id ||
                        loc.store_id === parseInt(formData.store_id)
                    )
                    .map((location) => (
                      <MenuItem key={location.id} value={location.id}>
                        {location.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Instructions spéciales, détails importants..."
              />
            </Grid>
          </Grid> */}
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
      {/* TODO fusionner avec celle des collectes ? */}
      <Dialog
        open={showMissingEmployeesDialog}
        onClose={() => setShowMissingEmployeesDialog(false)}
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
                      {employee.username}
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
            onClick={() => setShowMissingEmployeesDialog(false)}
            variant="outlined"
          >
            Fermer
          </Button>
          <Button
            onClick={() => {
              setShowMissingEmployeesDialog(false);
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
      <TaskAssignmentDialog
        open={openTaskAssignmentDialog}
        onClose={handleCloseTaskAssignmentDialog}
        selectedTask={selectedTaskForAssignment}
        assignedEmployees={taskAssignedEmployees}
        availableEmployees={availableEmployeesForTask}
        onAssignEmployee={handleAssignEmployeeToTask}
        onUnassignEmployee={handleUnassignEmployeeFromTask}
      />


      {/* Dialogue d'assignation des employés aux collectes */}
      {openCollectionAssignmentDialog && selectedCollectionForAssignment && (
        <Dialog
          open={openCollectionAssignmentDialog}
          onClose={handleCloseCollectionAssignmentDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              bgcolor: "#9c27b0",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <LocalShipping sx={{ fontSize: 20 }} />
            <Typography variant="h6">
              Assigner un employé à la collecte
            </Typography>
            <Typography variant="body2" sx={{ ml: "auto", opacity: 0.8 }}>
              {selectedCollectionForAssignment.collection_point_name}
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            {/* Informations sur la collecte */}
            <Box
              sx={{
                mb: 3,
                p: 2,
                bgcolor: "#f3e5f5",
                borderRadius: 1,
                border: "1px solid #9c27b0",
              }}
            >
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Store sx={{ fontSize: 16, color: "#9c27b0" }} />
                <strong>Filtrage par magasin et présence:</strong> Seuls les
                employés du magasin "
                {selectedCollectionForAssignment.collection_point_name}" qui
                travaillent le{" "}
                {selectedCollectionForAssignment.scheduled_date
                  ? new Date(
                      selectedCollectionForAssignment.scheduled_date,
                    ).toLocaleDateString("fr-FR", { weekday: "long" })
                  : "jour sélectionné"}{" "}
                sont affichés.
              </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Employés déjà assignés */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="h6"
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <Person sx={{ fontSize: 20, color: "#2196f3" }} />
                  Employé assigné
                </Typography>

                <Card
                  sx={{
                    bgcolor: "#e3f2fd",
                    border: "2px solid #2196f3",
                    minHeight: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {collectionAssignedEmployees.length > 0 ? (
                    <Stack spacing={2} sx={{ width: "100%", p: 2 }}>
                      {collectionAssignedEmployees.map((employee) => (
                        <Box
                          key={employee.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: 2,
                            bgcolor: "white",
                            borderRadius: 1,
                            boxShadow: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Tooltip title={`Employé assigné à cette collecte`}>
                              <Person sx={{ fontSize: 24, color: "#2196f3" }} />
                            </Tooltip>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: "bold" }}
                              >
                                {employee.username}
                              </Typography>
                              <Chip
                                label="Assigné"
                                size="small"
                                icon={<CheckCircle />}
                                sx={{ bgcolor: "#e8f5e8", color: "#2e7d32" }}
                              />
                            </Box>
                          </Box>
                          <Tooltip title="Retirer l'employé de cette collecte">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleUnassignEmployeeFromCollection(
                                  employee.id,
                                )
                              }
                              sx={{
                                color: "#f44336",
                                "&:hover": {
                                  bgcolor: "#ffebee",
                                  transform: "scale(1.1)",
                                },
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box sx={{ textAlign: "center", color: "#999" }}>
                      <PersonOff sx={{ fontSize: 48, mb: 1 }} />
                      <Typography variant="body2">
                        Aucun employé assigné à cette collecte
                      </Typography>
                    </Box>
                  )}
                </Card>
              </Grid>

              {/* Employés disponibles */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="h6"
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <PersonAdd sx={{ fontSize: 20, color: "#4caf50" }} />
                  Employés disponibles
                </Typography>

                <Card
                  sx={{
                    bgcolor: "#f1f8e9",
                    border: "2px solid #4caf50",
                    maxHeight: 400,
                    overflow: "auto",
                  }}
                >
                  {availableEmployeesForCollection.length > 0 ? (
                    <Stack spacing={1} sx={{ p: 1 }}>
                      {availableEmployeesForCollection.map((employee) => (
                        <Box
                          key={employee.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: 1.5,
                            bgcolor: employee.is_assigned_to_task
                              ? "#ffebee"
                              : "white",
                            border: employee.is_assigned_to_task
                              ? "2px solid #f44336"
                              : "1px solid #e0e0e0",
                            borderRadius: 1,
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            {employee.is_assigned_to_task ? (
                              <Tooltip title="Employé occupé par une autre tâche">
                                <Block
                                  sx={{ fontSize: 20, color: "#f44336" }}
                                />
                              </Tooltip>
                            ) : employee.already_assigned ? (
                              <Tooltip title="Employé déjà assigné à cette collecte">
                                <Person
                                  sx={{ fontSize: 20, color: "#2196f3" }}
                                />
                              </Tooltip>
                            ) : (
                              <Tooltip title="Employé disponible">
                                <CheckCircle
                                  sx={{ fontSize: 20, color: "#4caf50" }}
                                />
                              </Tooltip>
                            )}
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: "bold",
                                  color: employee.is_assigned_to_task
                                    ? "#f44336"
                                    : "inherit",
                                }}
                              >
                                {employee.username}
                              </Typography>
                              <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                                <Chip
                                  label={employee.role}
                                  size="small"
                                  sx={{ fontSize: "0.65rem", height: 16 }}
                                />
                                {employee.is_assigned_to_task ? (
                                  <Chip
                                    label="Occupé"
                                    size="small"
                                    icon={<AccessTime />}
                                    sx={{
                                      bgcolor: "#ffcdd2",
                                      color: "#d32f2f",
                                      fontSize: "0.65rem",
                                      height: 16,
                                    }}
                                  />
                                ) : (
                                  <Chip
                                    label="Libre"
                                    size="small"
                                    icon={<CheckCircle />}
                                    sx={{
                                      bgcolor: "#c8e6c9",
                                      color: "#388e3c",
                                      fontSize: "0.65rem",
                                      height: 16,
                                    }}
                                  />
                                )}
                              </Box>
                              {employee.has_conflicts &&
                                employee.conflicts &&
                                employee.conflicts.length > 0 && (
                                  <Box
                                    sx={{
                                      mt: 0.5,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <Warning
                                      sx={{ fontSize: 12, color: "#ff9800" }}
                                    />
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#ff9800",
                                        fontSize: "0.6rem",
                                      }}
                                    >
                                      Conflit:{" "}
                                      {employee.conflicts
                                        .map(
                                          (c) =>
                                            c.collection_point_name || "Tâche",
                                        )
                                        .join(", ")}
                                    </Typography>
                                  </Box>
                                )}
                            </Box>
                          </Box>

                          {employee.is_assigned_to_task ? (
                            <Tooltip title="Employé occupé - impossible d'assigner">
                              <span>
                                <IconButton
                                  size="small"
                                  disabled
                                  sx={{ color: "#999" }}
                                >
                                  <Block />
                                </IconButton>
                              </span>
                            </Tooltip>
                          ) : employee.already_assigned ? (
                            <Tooltip title="Déjà assigné à cette collecte">
                              <span>
                                <IconButton
                                  size="small"
                                  disabled
                                  sx={{ color: "#2196f3" }}
                                >
                                  <CheckCircle />
                                </IconButton>
                              </span>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Assigner cet employé à la collecte">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleAssignEmployeeToCollection(employee.id)
                                }
                                sx={{
                                  color: "#4caf50",
                                  "&:hover": {
                                    bgcolor: "#e8f5e8",
                                    transform: "scale(1.1)",
                                  },
                                }}
                              >
                                <Add />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box sx={{ textAlign: "center", color: "#999", py: 4 }}>
                      <PersonOff sx={{ fontSize: 48, mb: 1 }} />
                      <Typography variant="body2">
                        Aucun employé disponible pour cette collecte
                      </Typography>
                    </Box>
                  )}
                </Card>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2, bgcolor: "#f5f5f5" }}>
            <Button
              onClick={handleCloseCollectionAssignmentDialog}
              variant="outlined"
              color="secondary"
            >
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Planning;
