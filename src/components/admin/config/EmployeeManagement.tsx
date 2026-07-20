import {
  AccessTime,
  Add,
  Delete,
  Edit,
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
import type { EmployeeDataInput, EmployeeSkillsInput } from "@recyclerie/api/schemas/employees";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { useQueryErrorToast } from "../../../hooks/useQueryErrorToast";
import type { EmployeeModel } from "../../../interfaces/Models";
import {
  createEmployees,
  deleteEmployee,
  getEmployees,
  updateEmployee,
} from "../../../services/api/employee";
import { fetchSkills, updateEmployeeSkills } from "../../../services/api/skills";
import { fetchStores } from "../../../services/api/store";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../../../utils/apiToastMessage";
import EmployeeStoreAssignment from "../../EmployeeStoreAssignment";
import EmployeeWorkdays from "../../EmployeeWorkdays";
import {
  EMPLOYEE_FILTER_DEFAULTS,
  EmployeeFilterForm,
  type EmployeeFilters,
} from "../../forms/filters/EmployeeFilterForm";
import { EmployeeForm, type EmployeeFormValues, type Schema } from "../../forms/EmployeeForm";
import { EmployeeSkillForm, type Schema as EmployeeSkillSchema } from "../../forms/EmployeeSkillForm";
import { Loading } from "../../Loading";

function employeeToFormValues(employee: EmployeeModel): Partial<EmployeeFormValues> {
  return {
    prenom: employee.prenom,
    nom: employee.nom,
    phone: employee.phone ?? "",
    isActive: employee.isActive,
    recyclery_id: employee.stores?.[0]?.id ?? "",
  };
}

const EmployeeManagement = () => {
  const [openDialog, setOpenDialog] = useState(false);
  // const [editingEmployeeId, setEditingEmployeeId] = useState<EmployeeModel["id"] | null>(null);
  const [employeeFormDefaults, setEmployeeFormDefaults] = useState<Partial<EmployeeFormValues> | null>(
    null,
  );
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeModel | null>(null);

  // Nouveaux états pour les dialogs d'affectation et jours de travail
  const [openStoreAssignmentDialog, setOpenStoreAssignmentDialog] =
    useState(false);
  const [openWorkdaysDialog, setOpenWorkdaysDialog] = useState(false);
  const [openSkillsDialog, setOpenSkillsDialog] = useState(false);

  const skills = useQuery({
    queryKey: ["skills"],
    queryFn: () => fetchSkills().then(response => response.data.data ?? [])
  });
  useQueryErrorToast(skills.error, "Erreur lors du chargement des compétences");


  // const availabilityOptions = [
  //   { value: "full_time", label: "Temps plein" },
  //   { value: "part_time", label: "Temps partiel" },
  //   { value: "weekend", label: "Week-end" },
  //   { value: "evening", label: "Soirée" },
  //   { value: "flexible", label: "Flexible" },
  // ];

  // const roleOptions = [
  //   { value: "employee", label: "Employé" },
  //   { value: "manager", label: "Manager" },
  //   { value: "supervisor", label: "Superviseur" },
  //   { value: "driver", label: "Chauffeur" },
  //   { value: "collector", label: "Collecteur" },
  // ];

  const [filters, setFilters] = useState<EmployeeFilters>(EMPLOYEE_FILTER_DEFAULTS);

  const queryClient = useQueryClient()

  const stores = useQuery({
    queryKey: ["stores", { active: true }],
    queryFn: () => fetchStores({ active: true }).then(response => response.data.data)
  })
  useQueryErrorToast(stores.error, "Erreur lors du chargement des stores");

  const employees = useQuery({
    queryKey: ["employees"],
    queryFn: () => getEmployees().then(response => response.data.data)
  })
  useQueryErrorToast(employees.error, "Erreur lors du chargement des employés");

  const employeePayloadFromForm = (data: Schema): EmployeeDataInput => ({ ...data });
  const editEmployee = useMutation({
    mutationFn: ({ id, data }: { id: EmployeeModel["id"], data: Schema }) => updateEmployee(id, employeePayloadFromForm(data)),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Employé mis à jour avec succès"));
      handleCloseDialog();
      queryClient.invalidateQueries({ queryKey: ["employees"] })

    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
  })
  const addEmployee = useMutation({
    mutationFn: (data: Schema) => createEmployees(employeePayloadFromForm(data)),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Employé créé avec succès"));
      handleCloseDialog();
      queryClient.invalidateQueries({ queryKey: ["employees"] })

    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
  })
  const removeEmployee = useMutation({
    mutationFn: (id: EmployeeModel["id"]) => deleteEmployee(id),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Employé supprimé avec succès"));
      queryClient.invalidateQueries({ queryKey: ["employees"] })

    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la suppression")),

  })

  const handleOpenDialog = (employee: EmployeeModel | null = null) => {
    setSelectedEmployee(employee ?? null);
    setEmployeeFormDefaults(employee ? employeeToFormValues(employee) : null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
    setEmployeeFormDefaults(null);
  };

  const handleOpenStoreAssignment = (employee: EmployeeModel) => {
    setSelectedEmployee(employee);
    setOpenStoreAssignmentDialog(true);
  };

  const handleOpenWorkdays = (employee: EmployeeModel) => {
    setSelectedEmployee(employee);
    setOpenWorkdaysDialog(true);
  };

  const handleOpenSkills = (employee: EmployeeModel) => {
    setSelectedEmployee(employee);
    setOpenSkillsDialog(true);
  }

  const handleCloseStoreAssignment = () => {
    setOpenStoreAssignmentDialog(false);
    setSelectedEmployee(null);
  };

  const handleCloseWorkdays = () => {
    setOpenWorkdaysDialog(false);
    setSelectedEmployee(null);
  };

  const handleCloseSkills = () => {
    setOpenSkillsDialog(false)
    setSelectedEmployee(null);
  };


  const handleSave = async (data: Schema) => {
    if (selectedEmployee?.id) editEmployee.mutate({ id: selectedEmployee.id, data })
    else addEmployee.mutate(data)
  };

  const handleDelete = async (employeeId: EmployeeModel["id"]) => {
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

  // const AVAILABILITY_COLORS = {
  //   full_time: "success",
  //   part_time: "warning",
  //   weekend: "info",
  //   evening: "secondary",
  //   flexible: "default",
  // } as const;
  // const getAvailabilityColor = (availability: keyof typeof AVAILABILITY_COLORS) =>
  //   AVAILABILITY_COLORS[availability] ?? "default";

  const filteredEmployees =
    employees.data?.filter((employee) => {
      const matchesSearch =
        !filters.search?.trim() ||
        employee.nom?.toLowerCase().includes(filters.search.toLowerCase()) ||
        employee.email?.toLowerCase().includes(filters.search.toLowerCase());
      // const matchesRole =
      //   // !filters.role ||
      //   (employee as { role?: string }).role === filters.role;
      const matchesStatus =
        !filters.status ||
        (filters.status === "active" && employee.isActive !== false) ||
        (filters.status === "inactive" && employee.isActive === false)
      const matchesStore =
        !filters.store_id ||
        (filters.store_id !== "" && employee.stores?.some(store => store.id === filters.store_id));
      return matchesSearch &&
        // matchesRole &&
        matchesStatus &&
        matchesStore;
    }) || [];

  const updateEmployeeSkillsPayloadFromForm = (data: EmployeeSkillSchema): EmployeeSkillsInput => ({ ...data });
  const updateEmployeeSkillsMutation = useMutation({
    mutationFn: ({ id, data }: { id: EmployeeModel["id"], data: EmployeeSkillSchema }) => updateEmployeeSkills(id, updateEmployeeSkillsPayloadFromForm(data)),
    onSuccess: (data) => {
      handleCloseSkills()
      toast.success(getApiSuccessMessage(data, "Compétences mises à jour avec succès"));
      // queryClient.invalidateQueries({ queryKey: ["employees"] })
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la mise à jour des compétences")),
  })

  const handleSaveSkills = (data: EmployeeSkillSchema) => {
    if (selectedEmployee?.id) updateEmployeeSkillsMutation.mutate({ id: selectedEmployee.id, data: data })
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
            stores={stores.data || []}
          // roleOptions={roleOptions}
          />
        </Paper>
        {/* Liste des employés */}
        <Grid container spacing={3}>
          {filteredEmployees.map((employee) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={employee.id}>
              <EmployeeCard employee={employee}
                handleOpenDialog={handleOpenDialog}
                handleDelete={handleDelete}
                handleOpenSkills={handleOpenSkills}
                handleOpenStoreAssignment={handleOpenStoreAssignment}
                handleOpenWorkdays={handleOpenWorkdays} />
            </Grid>
          ))}
        </Grid>
        {filteredEmployees.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="textSecondary">
              Aucun employé trouvé
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {filters.search ||
                //  filters.role ||
                filters.status
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
          {selectedEmployee?.id ? "Modifier l'employé" : "Nouvel employé"}
        </DialogTitle>
        <DialogContent>
          <EmployeeForm
            formId="employeeForm"
            onSubmit={handleSave}
            stores={stores.data || []}
            defaultValues={employeeFormDefaults ?? undefined}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button type="submit" form="employeeForm" variant="contained">
            {selectedEmployee?.id ? "Mettre à jour" : "Créer"}
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
          {selectedEmployee && (
            <EmployeeStoreAssignment
              employeeId={selectedEmployee.id}
              employeeName={selectedEmployee.nom}
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
          {selectedEmployee && (
            <EmployeeWorkdays
              employeeId={selectedEmployee.id}
              employeeName={selectedEmployee.nom}
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
          {selectedEmployee && (
            <Box sx={{ mt: 2 }}>
              <EmployeeSkillForm formId="employeeSkillsForm" onSubmit={handleSaveSkills} employee={selectedEmployee} />

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

interface EmployeeCardProps {
  employee: EmployeeModel;
  handleOpenDialog: (employee: EmployeeModel) => void;
  handleDelete: (employeeId: EmployeeModel["id"]) => void;
  handleOpenSkills: (employee: EmployeeModel) => void;
  handleOpenStoreAssignment: (employee: EmployeeModel) => void;
  handleOpenWorkdays: (employee: EmployeeModel) => void;
}
const EmployeeCard = ({ employee, handleOpenDialog, handleDelete, handleOpenSkills, handleOpenStoreAssignment, handleOpenWorkdays }: EmployeeCardProps) => {
  return (
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
          {employee.phone && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Phone fontSize="small" color="action" />
              <Typography variant="body2">{employee.phone}</Typography>
            </Box>
          )}

          {employee.workTime && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTime fontSize="small" color="action" />
              <Typography variant="body2">
                {employee.workTime}h/semaine
              </Typography>
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
                {employee.skills.slice(0, 3).map((skill) => (
                  <Chip
                    key={skill.id}
                    label={skill.name}
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
  )
}