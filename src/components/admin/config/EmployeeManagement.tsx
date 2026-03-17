import {
  AccessTime,
  Add,
  CalendarToday,
  Delete,
  Edit,
  LocationOn,
  Person,
  Phone,
  Quiz,
  Schedule,
  Store
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import type { EmployeeModel } from "../../../interfaces/Models";
import {
  createEmployees,
  deleteEmployee,
  getEmployees,
  updateEmployee,
} from "../../../services/api/employee";
import { fetchSkills, updateEmployeeSkills } from "../../../services/api/skills";
import { fetchStores } from "../../../services/api/store";
import EmployeeStoreAssignment from "../../EmployeeStoreAssignment";
import EmployeeWorkdays from "../../EmployeeWorkdays";
import {
  EMPLOYEE_FILTER_DEFAULTS,
  EmployeeFilterForm,
  type EmployeeFilters,
} from "../../forms/EmployeeFilterForm";
import { EmployeeForm, type Schema } from "../../forms/EmployeeForm";
import { EmployeeSkillForm, type Schema as EmployeeSkillSchema } from "../../forms/EmployeeSkillForm";
import { Loading } from "../../Loading";

const EmployeeManagement = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeModel | null>(
    null,
  );

  // Nouveaux états pour les dialogs d'affectation et jours de travail
  const [openStoreAssignmentDialog, setOpenStoreAssignmentDialog] =
    useState(false);
  const [openWorkdaysDialog, setOpenWorkdaysDialog] = useState(false);
  const [openSkillsDialog, setOpenSkillsDialog] = useState(false);

  const skills = useQuery({
    queryKey: ["skills"],
    queryFn: () => fetchSkills().then(response => response.data.skills || [])
  });
  if (skills.isError) toast.error("Erreur lors du chargement des compétences");


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

  const [filters, setFilters] = useState<EmployeeFilters>(EMPLOYEE_FILTER_DEFAULTS);

  const queryClient = useQueryClient()

  const stores = useQuery({
    queryKey: ["stores", { active: true }],
    queryFn: () => fetchStores({ active: true }).then(response => response.data.stores)
  })
  if (stores.isError) toast.error("Erreur lors du chargement des stores");

  const employees = useQuery({
    queryKey: ["employees"],
    queryFn: () => getEmployees().then(response => response.data.data)
  })
  if (employees.isError) toast.error("Erreur lors du chargement des employés");

  const editEmployee = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Schema }) => updateEmployee(id, data),
    onSuccess: () => {
      toast.success("Employé mis à jour avec succès");
      handleCloseDialog();
      queryClient.invalidateQueries({ queryKey: ["employees"] })

    },
    onError: () => toast.error("Erreur lors de la sauvegarde",
    ),
  })
  const addEmployee = useMutation({
    mutationFn: (data: Schema) => createEmployees(data),
    onSuccess: () => {
      toast.success("Employé créé avec succès");
      handleCloseDialog();
      queryClient.invalidateQueries({ queryKey: ["employees"] })

    },
    onError: () => toast.error("Erreur lors de la sauvegarde",
    ),
  })
  const removeEmployee = useMutation({
    mutationFn: (id: number) => deleteEmployee(id),
    onSuccess: () => {
      toast.success("Employé supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["employees"] })

    },
    onError: () => toast.error("Erreur lors de la suppression"),

  })

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

  const handleOpenSkills = (employee: EmployeeModel) => {
    setEditingEmployee(employee);
    setOpenSkillsDialog(true);
  }

  const handleCloseStoreAssignment = () => {
    setOpenStoreAssignmentDialog(false);
    setEditingEmployee(null);
  };

  const handleCloseWorkdays = () => {
    setOpenWorkdaysDialog(false);
    setEditingEmployee(null);
  };

  const handleCloseSkills = () => {
    setOpenSkillsDialog(false)
    setEditingEmployee(null);
  };


  const handleSave = async (data: Schema) => {
    if (editingEmployee?.id) editEmployee.mutate({ id: editingEmployee.id, data })
    else addEmployee.mutate(data)
  };

  const handleDelete = async (employeeId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
      return;
    }
    removeEmployee.mutate(employeeId)
  };

  // const getRoleColor = (role: string) => {
  //   const colors = {
  //     employee: "default",
  //     manager: "primary",
  //     supervisor: "secondary",
  //     driver: "warning",
  //     collector: "info",
  //   };
  //   return colors[role] || "default";
  // };

  const AVAILABILITY_COLORS = {
    full_time: "success",
    part_time: "warning",
    weekend: "info",
    evening: "secondary",
    flexible: "default",
  } as const;
  const getAvailabilityColor = (availability: keyof typeof AVAILABILITY_COLORS) =>
    AVAILABILITY_COLORS[availability] ?? "default";

  const filteredEmployees =
    employees.data?.filter((employee) => {
      const matchesSearch =
        !filters.search?.trim() ||
        employee.nom?.toLowerCase().includes(filters.search.toLowerCase()) ||
        employee.email?.toLowerCase().includes(filters.search.toLowerCase());
      const matchesRole =
        !filters.role ||
        (employee as { role?: string }).role === filters.role;
      const matchesStatus =
        !filters.status ||
        (filters.status === "active" && employee.isActive !== false) ||
        (filters.status === "inactive" && employee.isActive === false);

      return matchesSearch && matchesRole && matchesStatus;
    }) || [];


  const updateEmployeeSkillsMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: { skills: string[] } }) => updateEmployeeSkills(id, data),
    onSuccess: () => {
      handleCloseSkills()
      toast.success("Compétences mises à jour avec succès");
      // queryClient.invalidateQueries({ queryKey: ["employees"] })
    },
    onError: () => toast.error("Erreur lors de la mise à jour des compétences"),
  })

  const handleSaveSkills = (data: EmployeeSkillSchema) => {
    console.log(data)
    if (editingEmployee?.id) updateEmployeeSkillsMutation.mutate({ id: editingEmployee.id, data: data })
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
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
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
      <Loading isLoading={employees.isLoading}>
        {/* Filtres et recherche */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <EmployeeFilterForm
            defaultValues={filters}
            onChange={(values) =>
              setFilters((prev) => ({ ...prev, ...values }))
            }
            roleOptions={roleOptions}
          />
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
                          color={getAvailabilityColor(
                            employee.availability as keyof typeof AVAILABILITY_COLORS,
                          )}
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
                </CardContent>
                {/* Boutons d'action supplémentaires */}
                <CardActions>
                  <Tooltip title="Définir les compétences des employés">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Quiz />}
                      onClick={() => handleOpenSkills(employee)}
                      sx={{ flex: 1 }}
                    >
                      Skills
                    </Button>
                  </Tooltip>
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
                </CardActions>
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
              {filters.search || filters.role || filters.status
                ? "Essayez de modifier vos critères de recherche"
                : "Commencez par ajouter un employé"}
            </Typography>
          </Box>
        )}
      </Loading>

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
            stores={stores.data || []}
            defaultValues={editingEmployee || undefined}
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
                queryClient.invalidateQueries({ queryKey: ["employees"] })
                // Optionnel: actualiser la liste des employés
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
                queryClient.invalidateQueries({ queryKey: ["employees"] })

              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de gestion des Comptences */}
      <Dialog
        open={openSkillsDialog}
        onClose={handleCloseSkills}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Compétences</DialogTitle>
        <DialogContent>
          {editingEmployee && (
            <Box sx={{ mt: 2 }}>
              <EmployeeSkillForm formId="employeeSkillsForm" onSubmit={handleSaveSkills} employee={editingEmployee} defaultValues={editingEmployee?.skills || []} />

            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSkills}>Fermer</Button>
          <Button type="submit" form="employeeSkillsForm" variant="contained">Enregistrer</Button>

        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmployeeManagement;
