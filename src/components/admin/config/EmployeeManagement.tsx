import {
  AccessTime,
  Add,
  CalendarToday,
  Delete,
  Edit,
  LocationOn,
  Person,
  Phone,
  Refresh,
  Schedule,
  Search,
  Store
} from "@mui/icons-material";
import {
  Avatar,
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
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { EmployeeModel, StoreModel } from "../../../interfaces/Models";
import {
  createEmployees,
  deleteEmployee,
  getEmployees,
  updateEmployee,
} from "../../../services/api/employee";
import { fetchStores } from "../../../services/api/store";
import EmployeeStoreAssignment from "../../EmployeeStoreAssignment";
import EmployeeWorkdays from "../../EmployeeWorkdays";
import { EmployeeForm } from "../../forms/EmployeeForm";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<EmployeeModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeModel | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Nouveaux états pour les dialogs d'affectation et jours de travail
  const [openStoreAssignmentDialog, setOpenStoreAssignmentDialog] =
    useState(false);
  const [openWorkdaysDialog, setOpenWorkdaysDialog] = useState(false);
  const [stores, setStores] = useState<StoreModel[]>([]);

  const skillsOptions = [
    "Collecte",
    "Tri",
    "Vente",
    "Maintenance",
    "Conduite",
    "Gestion",
    "Informatique",
    "Communication",
    "Formation",
  ];

  const availabilityOptions = [
    { value: "full_time", label: "Temps plein" },
    { value: "part_time", label: "Temps partiel" },
    { value: "weekend", label: "Week-end" },
    { value: "evening", label: "Soirée" },
    { value: "flexible", label: "Flexible" },
  ];

  const roleOptions = [
    { value: "employee", label: "Employé" },
    { value: "manager", label: "Manager" },
    { value: "supervisor", label: "Superviseur" },
    { value: "driver", label: "Chauffeur" },
    { value: "collector", label: "Collecteur" },
  ];

  useEffect(() => {
    fetchEmployees();
    getStores();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await getEmployees(); // await fetchUsers({ role: "employee" });
      setEmployees(response.data.data);
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error);
      toast.error("Erreur lors du chargement des employés");
    } finally {
      setLoading(false);
    }
  };
  const getStores = async () => {
    try {
      const response = await fetchStores({ active: true });
      setStores(response.data.stores);
    } catch (e) {
      toast.error("Erreur lors du chargement des stores");
    }
  };

  const handleOpenDialog = (employee: EmployeeModel | null = null) => {
    setEditingEmployee(employee);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEmployee(null);
  };

  const handleOpenStoreAssignment = (employee: EmployeeModel) => {
    setEditingEmployee(employee);
    setOpenStoreAssignmentDialog(true);
  };

  const handleOpenWorkdays = (employee: EmployeeModel) => {
    setEditingEmployee(employee);
    setOpenWorkdaysDialog(true);
  };

  const handleCloseStoreAssignment = () => {
    setOpenStoreAssignmentDialog(false);
    setEditingEmployee(null);
  };

  const handleCloseWorkdays = () => {
    setOpenWorkdaysDialog(false);
    setEditingEmployee(null);
  };

  const handleSave = async (data) => {
    try {
      if (editingEmployee?.id) {
        // Mise à jour
        await updateEmployee(editingEmployee.id, data);
        toast.success("Employé mis à jour avec succès");
      } else {
        // Création
        await createEmployees({ ...data });
        toast.success("Employé créé avec succès");
      }

      handleCloseDialog();
      fetchEmployees();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error(
        error.response?.data?.error || "Erreur lors de la sauvegarde",
      );
    }
  };

  const handleDelete = async (employeeId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
      return;
    }

    try {
      await deleteEmployee(employeeId);
      toast.success("Employé supprimé avec succès");
      fetchEmployees();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      employee: "default",
      manager: "primary",
      supervisor: "secondary",
      driver: "warning",
      collector: "info",
    };
    return colors[role] || "default";
  };

  const getAvailabilityColor = (availability) => {
    const colors = {
      full_time: "success",
      part_time: "warning",
      weekend: "info",
      evening: "secondary",
      flexible: "default",
    };
    return colors[availability] || "default";
  };

  const filteredEmployees =
    employees?.filter((employee) => {
      const matchesSearch =
        employee.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
      // const matchesRole = filterRole === "all" || employee.role === filterRole;
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && employee.isActive !== false) ||
        (filterStatus === "inactive" && employee.isActive === false);

      return matchesSearch && matchesStatus;
    }) || [];

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
          <Typography>Chargement des employés...</Typography>
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
            Gestion des Employés
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gérez vos employés et leurs compétences
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Nouvel Employé
        </Button>
      </Box>
      {/* Filtres et recherche */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Rechercher un employé..."
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
              <InputLabel>Rôle</InputLabel>
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                label="Rôle"
              >
                <MenuItem value="all">Tous les rôles</MenuItem>
                {roleOptions.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Statut"
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="active">Actif</MenuItem>
                <MenuItem value="inactive">Inactif</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchEmployees}
              fullWidth
            >
              Actualiser
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {/* Liste des employés */}
      <Grid container spacing={3}>
        {filteredEmployees.map((employee) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={employee.id}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                    <Person />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {employee.nom} {employee.prenom}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {employee.email}
                    </Typography>
                  </Box>
                  <Box>
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(employee)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(employee.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Stack spacing={1}>
                  {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Work fontSize="small" color="action" />
                    <Chip
                      label={
                        roleOptions.find((r) => r.value === employee.role)
                          ?.label || employee.role
                      }
                      color={getRoleColor(employee.role)}
                      size="small"
                    />
                  </Box> */}

                  {employee.phone && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2">{employee.phone}</Typography>
                    </Box>
                  )}

                  {employee.contract_hours && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="body2">
                        {employee.contract_hours}h/semaine
                      </Typography>
                    </Box>
                  )}

                  {employee.address && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" noWrap>
                        {employee.address}
                      </Typography>
                    </Box>
                  )}

                  {employee.availability && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarToday fontSize="small" color="action" />
                      <Chip
                        label={
                          availabilityOptions.find(
                            (a) => a.value === employee.availability,
                          )?.label || employee.availability
                        }
                        color={getAvailabilityColor(employee.availability)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  )}

                  {employee.skills && employee.skills.length > 0 && (
                    <Box>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        gutterBottom
                      >
                        Compétences:
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        {employee.skills.slice(0, 3).map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {employee.skills.length > 3 && (
                          <Chip
                            label={`+${employee.skills.length - 3}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {employee.hourly_rate && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {employee.hourly_rate}€/h
                      </Typography>
                    </Box>
                  )}
                </Stack>

                {/* Boutons d'action supplémentaires */}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                  <Tooltip title="Gérer les affectations aux magasins">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Store />}
                      onClick={() => handleOpenStoreAssignment(employee)}
                      sx={{ flex: 1 }}
                    >
                      Magasins
                    </Button>
                  </Tooltip>
                  <Tooltip title="Configurer les jours de travail">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Schedule />}
                      onClick={() => handleOpenWorkdays(employee)}
                      sx={{ flex: 1 }}
                    >
                      Horaires
                    </Button>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {filteredEmployees.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            Aucun employé trouvé
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {searchTerm || filterRole !== "all" || filterStatus !== "all"
              ? "Essayez de modifier vos critères de recherche"
              : "Commencez par ajouter un employé"}
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
          {editingEmployee ? "Modifier l'employé" : "Nouvel employé"}
        </DialogTitle>
        <DialogContent>
          <EmployeeForm
            formId="employeeForm"
            onSubmit={handleSave}
            stores={stores}
            defaultValues={editingEmployee}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button type="submit" form="employeeForm" variant="contained">
            {editingEmployee?.id ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog d'affectation aux magasins */}
      <Dialog
        open={openStoreAssignmentDialog}
        onClose={handleCloseStoreAssignment}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Affectation aux magasins</DialogTitle>
        <DialogContent>
          {editingEmployee && (
            <EmployeeStoreAssignment
              employeeId={editingEmployee.id}
              employeeName={editingEmployee.nom}
              onClose={handleCloseStoreAssignment}
              onSave={() => {
                // Optionnel: actualiser la liste des employés
                fetchEmployees();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      {/* Dialog de gestion des jours de travail */}
      <Dialog
        open={openWorkdaysDialog}
        onClose={handleCloseWorkdays}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Jours de travail</DialogTitle>
        <DialogContent>
          {editingEmployee && (
            <EmployeeWorkdays
              employeeId={editingEmployee.id}
              employeeName={editingEmployee.nom}
              onClose={handleCloseWorkdays}
              onSave={() => {
                // Optionnel: actualiser la liste des employés
                fetchEmployees();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default EmployeeManagement;
