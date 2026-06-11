import {
  Add,
  AttachMoney,
  Delete,
  Edit,
  LocationOn,
  Person,
  Refresh,
  Schedule,
  Search,
  Timer,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { EmployeeModel, TaskModel } from "../../../interfaces/Models";
import {
  addEmployeeToTask,
  createTask,
  deleteTask,
  getEmployeesForTask,
  getTasks,
  removeEmployeeFromTask,
  updateTask,
} from "../../../services/api/tasks";
import { fetchUsers } from "../../../services/api/users";
import { TASK_CATEGORIES } from "../../../constants/taskCategories";
import { TaskForm } from "../../forms/TaskForm";

/**
 * @deprecated
 * @returns 
 */
const TaskManagement = () => {
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [employees, setEmployees] = useState<EmployeeModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskModel | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // États pour l'assignation des employés
  const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskModel | null>(null); //TODO pareil que editingtask ?
  const [taskEmployees, setTaskEmployees] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState<EmployeeModel[]>(
    [],
  );

  const categories = TASK_CATEGORIES;

  const priorities = [
    { value: "low", label: "Faible", color: "success" },
    { value: "medium", label: "Moyenne", color: "warning" },
    { value: "high", label: "Élevée", color: "error" },
    { value: "urgent", label: "Urgente", color: "error" },
  ];

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getTasks();
      // S'assurer que les champs JSON sont correctement parsés
      const baseTasks = (response.data.tasks || []).map((task) => ({
        ...task,
        required_skills: Array.isArray(task.required_skills)
          ? task.required_skills
          : typeof task.required_skills === "string"
            ? JSON.parse(task.required_skills)
            : [],
        equipment_needed: Array.isArray(task.equipment_needed)
          ? task.equipment_needed
          : typeof task.equipment_needed === "string"
            ? JSON.parse(task.equipment_needed)
            : [],
      }));

      // Pour chaque tâche, récupérer les employés assignés
      const tasksWithEmployees = await Promise.all(
        baseTasks.map(async (task) => {
          try {
            const employeesResponse = await getEmployeesForTask(task.id);
            return {
              ...task,
              assigned_employees: employeesResponse.data.employees || [],
            };
          } catch (error) {
            console.error(
              `Erreur lors du chargement des employés pour la tâche ${task.id}:`,
              error,
            );
            return {
              ...task,
              assigned_employees: [],
            };
          }
        }),
      );

      setTasks(tasksWithEmployees);
    } catch (error) {
      console.error("Erreur lors du chargement des tâches:", error);
      toast.error("Erreur lors du chargement des tâches");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetchUsers({ role: "employee" });

      if (response.data.success) {
        setEmployees(response.data.users || []);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error);
      setEmployees([]);
    }
  };

  const handleOpenDialog = (task: TaskModel | null = null) => {
    setEditingTask(task);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
  };

  const handleSave = async (data) => {
    try {
      if (editingTask) {
        // Mise à jour
        await updateTask(editingTask.id, data);

        toast.success("Tâche mise à jour avec succès");
      } else {
        await createTask(data);
        toast.success("Tâche créée avec succès");
      }

      handleCloseDialog();
      fetchTasks();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error(
        error.response?.data?.error || "Erreur lors de la sauvegarde",
      );
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
      return;
    }

    try {
      await deleteTask(taskId);
      toast.success("Tâche supprimée avec succès");
      fetchTasks();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Fonction pour ouvrir le dialogue d'assignation des employés
  const handleAssignEmployees = async (task) => {
    setSelectedTask(task);
    try {
      // Récupérer les employés assignés à cette tâche
      const assignedResponse = await getEmployeesForTask(task.id);

      setTaskEmployees(assignedResponse.data.employees || []);

      // Récupérer tous les employés disponibles
      const employeesResponse = await fetchUsers();
      setAvailableEmployees(employeesResponse.data.users || []);

      setOpenAssignmentDialog(true);
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error);
      toast.error("Erreur lors du chargement des employés");
    }
  };

  // Fonction pour fermer le dialogue d'assignation
  const handleCloseAssignmentDialog = () => {
    setOpenAssignmentDialog(false);
    setSelectedTask(null);
    setTaskEmployees([]);
    setAvailableEmployees([]);
  };

  // Fonction pour assigner un employé à une tâche
  const handleAssignEmployee = async (employeeId: number) => {
    try {
      await addEmployeeToTask(selectedTask.id, employeeId);

      // Mettre à jour la liste des employés assignés
      const employee = availableEmployees.find((emp) => emp.id === employeeId);
      if (employee) {
        setTaskEmployees((prev) => [...prev, employee]);
      }

      toast.success("Employé assigné avec succès");
    } catch (error) {
      console.error("Erreur lors de l'assignation:", error);
      toast.error("Erreur lors de l'assignation");
    }
  };

  // Fonction pour retirer un employé d'une tâche
  const handleUnassignEmployee = async (employeeId: number) => {
    try {
      await removeEmployeeFromTask(selectedTask.id, employeeId);

      // Mettre à jour la liste des employés assignés
      setTaskEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));

      toast.success("Employé retiré avec succès");
    } catch (error) {
      console.error("Erreur lors du retrait:", error);
      toast.error("Erreur lors du retrait");
    }
  };

  const getCategoryInfo = (category) => {
    return categories.find((cat) => cat.value === category) || categories[0];
  };

  const getPriorityInfo = (priority) => {
    return priorities.find((pri) => pri.value === priority) || priorities[1];
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || task.category === filterCategory;
    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 400,
          }}
        >
          <Typography>Chargement des tâches...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* En-tête */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
            Gestion des Tâches
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Définissez et organisez les tâches de votre recyclerie
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Nouvelle Tâche
        </Button>
      </Box>
      {/* Filtres et recherche */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <Search sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Catégorie"
              >
                <MenuItem value="all">Toutes les catégories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {category.icon}
                      {category.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Priorité</InputLabel>
              <Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                label="Priorité"
              >
                <MenuItem value="all">Toutes les priorités</MenuItem>
                {priorities.map((priority) => (
                  <MenuItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchTasks}
              fullWidth
            >
              Actualiser
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {/* Liste des tâches */}
      <Grid container spacing={3}>
        {filteredTasks.map((task) => {
          const categoryInfo = getCategoryInfo(task.category);
          const priorityInfo = getPriorityInfo(task.priority);

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={task.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        component="div"
                        fontWeight="bold"
                        gutterBottom
                      >
                        {task.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 1 }}
                      >
                        {task.description}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleAssignEmployees(task)}
                        color="success"
                        title="Assigner des employés"
                      >
                        <Add />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(task)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(task.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>

                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        icon={categoryInfo.icon}
                        label={categoryInfo.label}
                        color={categoryInfo.color}
                        size="small"
                      />
                      <Chip
                        label={priorityInfo.label}
                        color={priorityInfo.color}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Timer fontSize="small" color="action" />
                      <Typography variant="body2">
                        {new Date(task.start_time).toLocaleString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(task.end_time).toLocaleString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>

                    {task.location && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" noWrap>
                          {task.location}
                        </Typography>
                      </Box>
                    )}

                    {task.hourly_rate && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <AttachMoney fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight="bold">
                          {task.hourly_rate}€/h
                        </Typography>
                      </Box>
                    )}

                    {task.required_skills &&
                      Array.isArray(task.required_skills) &&
                      task.required_skills.length > 0 && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            gutterBottom
                          >
                            Compétences requises:
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                              mt: 0.5,
                            }}
                          >
                            {task.required_skills
                              .slice(0, 2)
                              .map((skill, index) => (
                                <Chip
                                  key={index}
                                  label={skill}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            {task.required_skills.length > 2 && (
                              <Chip
                                label={`+${task.required_skills.length - 2}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      )}

                    {task.equipment_needed &&
                      Array.isArray(task.equipment_needed) &&
                      task.equipment_needed.length > 0 && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            gutterBottom
                          >
                            Équipement:
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                              mt: 0.5,
                            }}
                          >
                            {task.equipment_needed
                              .slice(0, 2)
                              .map((equipment, index) => (
                                <Chip
                                  key={index}
                                  label={equipment}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            {task.equipment_needed.length > 2 && (
                              <Chip
                                label={`+${task.equipment_needed.length - 2}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      )}

                    {task.is_recurring && (
                      <Chip
                        label="Récurrente"
                        size="small"
                        color="info"
                        variant="outlined"
                        icon={<Schedule />}
                      />
                    )}

                    {/* Affichage des employés assignés */}
                    {task.assigned_employees &&
                      task.assigned_employees.length > 0 && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            gutterBottom
                          >
                            Employés assignés:
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                              mt: 0.5,
                            }}
                          >
                            {task.assigned_employees
                              .slice(0, 3)
                              .map((employee, index) => (
                                <Chip
                                  key={index}
                                  label={employee.username}
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  icon={<Person />}
                                />
                              ))}
                            {task.assigned_employees.length > 3 && (
                              <Chip
                                label={`+${task.assigned_employees.length - 3}`}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      {filteredTasks.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            Aucune tâche trouvée
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {searchTerm || filterCategory !== "all" || filterPriority !== "all"
              ? "Essayez de modifier vos critères de recherche"
              : "Commencez par ajouter une tâche"}
          </Typography>
        </Box>
      )}
      {/* Dialog de création/édition */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingTask ? "Modifier la tâche" : "Nouvelle tâche"}
        </DialogTitle>
        <DialogContent>
          <TaskForm
            formId="taskForm"
            employees={employees}
            defaultValues={editingTask}
            onSubmit={handleSave}
          />
          {/* <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Nom de la tâche"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Taux horaire (€)"
                name="hourly_rate"
                type="number"
                value={formData.hourly_rate}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Catégorie"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {category.icon}
                        {category.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Priorité</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  label="Priorité"
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Durée estimée (minutes)"
                name="estimated_duration"
                type="number"
                value={formData.estimated_duration}
                onChange={handleInputChange}
                slotProps={{
                  htmlInput: { min: 15, max: 480 },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Lieu"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Employé assigné</InputLabel>
                <Select
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleInputChange}
                  label="Employé assigné"
                >
                  <MenuItem value="">
                    <em>Aucun employé assigné</em>
                  </MenuItem>
                  {employees && employees.length > 0 ? (
                    employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.username} ({employee.role})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Aucun employé disponible</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                Compétences requises
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {skillsOptions.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onClick={() => handleArrayChange("required_skills", skill)}
                    color={
                      formData.required_skills.includes(skill)
                        ? "primary"
                        : "default"
                    }
                    variant={
                      formData.required_skills.includes(skill)
                        ? "filled"
                        : "outlined"
                    }
                  />
                ))}
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                Équipement nécessaire
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {equipmentOptions.map((equipment) => (
                  <Chip
                    key={equipment}
                    label={equipment}
                    onClick={() =>
                      handleArrayChange("equipment_needed", equipment)
                    }
                    color={
                      formData.equipment_needed.includes(equipment)
                        ? "secondary"
                        : "default"
                    }
                    variant={
                      formData.equipment_needed.includes(equipment)
                        ? "filled"
                        : "outlined"
                    }
                  />
                ))}
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_recurring}
                    onChange={handleInputChange}
                    name="is_recurring"
                  />
                }
                label="Tâche récurrente"
              />
            </Grid>
            {formData.is_recurring && (
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Modèle de récurrence</InputLabel>
                  <Select
                    name="recurrence_pattern"
                    value={formData.recurrence_pattern}
                    onChange={handleInputChange}
                    label="Modèle de récurrence"
                  >
                    {recurrencePatterns.map((pattern) => (
                      <MenuItem key={pattern.value} value={pattern.value}>
                        {pattern.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button type="submit" form="taskForm" variant="contained">
            {editingTask ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialogue d'assignation des employés */}
      <Dialog
        open={openAssignmentDialog}
        onClose={handleCloseAssignmentDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Assigner des employés à la tâche: {selectedTask?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Employés déjà assignés */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>
                Employés assignés ({taskEmployees.length})
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                {taskEmployees.length > 0 ? (
                  <Stack spacing={1}>
                    {taskEmployees.map((employee) => (
                      <Card key={employee.id} variant="outlined">
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
                              <Person color="success" />
                              <Typography variant="body2" fontWeight="medium">
                                {employee.username}
                              </Typography>
                              <Chip
                                label={employee.role}
                                size="small"
                                color="info"
                                variant="outlined"
                              />
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleUnassignEmployee(employee.id)
                              }
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    Aucun employé assigné
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Employés disponibles */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>
                Employés disponibles
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                {availableEmployees
                  .filter(
                    (emp) =>
                      !taskEmployees.some((assigned) => assigned.id === emp.id),
                  )
                  .map((employee) => (
                    <Card key={employee.id} variant="outlined" sx={{ mb: 1 }}>
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
                            <Person color="action" />
                            <Typography variant="body2" fontWeight="medium">
                              {employee.username}
                            </Typography>
                            <Chip
                              label={employee.role}
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleAssignEmployee(employee.id)}
                            color="success"
                          >
                            <Add />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignmentDialog}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskManagement;
