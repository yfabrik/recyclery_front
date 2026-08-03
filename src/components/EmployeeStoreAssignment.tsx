import { Person, Save } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useQueryErrorToast } from "../hooks/useQueryErrorToast";
import { fetchStores } from "../services/api/store";
import {
  addAssignedStore,
  getAssignedStores,
  removeAssignedStores,
} from "../services/api/employee";
import {
  getApiErrorMessage
} from "../utils/apiToastMessage";
import { employeeStoresPayloadFromForm } from "../services/mapper/employee";
import { EmployeeStoresForm, type EmployeeStoresFormOutput } from "./forms/EmployeeStoresForm";
interface EmployeeStoreAssignmentProps {
  employeeId: number;
  employeeName: string;
  onClose: () => void;
  onSave: () => void;
}

const EmployeeStoreAssignment = ({
  employeeId,
  employeeName,
  onClose,
  onSave,
}: EmployeeStoreAssignmentProps) => {

  const queryClient = useQueryClient()
  const stores = useQuery({
    queryKey: ["stores"],
    queryFn: () => fetchStores().then(response => response.data.data)
  })

  const assignments = useQuery({
    queryKey: ["assignments", employeeId],
    queryFn: () => getAssignedStores(employeeId).then(response => response.data.data)
  })
  useQueryErrorToast(stores.error, "Erreur lors du chargement des données");
  useQueryErrorToast(assignments.error, "Erreur lors du chargement des données");


  const removeAssignements = useMutation({
    mutationFn: (employeeId: number) => removeAssignedStores(employeeId),
    onSuccess: () => {
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde des affectations")),
  })


  const addAssignment = useMutation({
    mutationFn: (data: { employee_id: number, store_id: number, is_primary: boolean }) => addAssignedStore(data),
    onSuccess: () => {
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde des affectations")),
  })

  const handleSave = async (data: EmployeeStoresFormOutput) => {
    try {
      await removeAssignements.mutateAsync(employeeId);
      for (const assignment of employeeStoresPayloadFromForm(data)) {
        await addAssignment.mutateAsync({
          employee_id: employeeId,
          store_id: assignment.store_id,
          is_primary: assignment.is_primary,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["assignments"] });

      toast.success("Affectations mises à jour avec succès");
      onSave?.();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde des affectations"));

    }
  };

  if (assignments.isLoading || stores.isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 4,
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement des magasins...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Person />
          Affectation de {employeeName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sélectionnez les magasins où cet employé peut travailler
        </Typography>
      </Box>

      <Box sx={{ width: "100%", minWidth: 280 }}>
        <EmployeeStoresForm formId="employeeStores" onSubmit={handleSave} stores={stores.data || []} assignments={assignments.data || []} />
       
      </Box>

      {/* {assignments.data && assignments.data?.length > 0 && (
        <Box sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Résumé des affectations :
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {assignments.data?.map((assignment) => (
              <Chip
                key={assignment.id}
                icon={assignment.is_primary ? <Star /> : <Store />}
                label={`${assignment.name}${assignment.is_primary ? " (Principal)" : ""}`}
                color={assignment.is_primary ? "warning" : "primary"}
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )} */}

      <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={onClose} disabled={addAssignment.isPending || removeAssignements.isPending}>
          Annuler
        </Button>
        <Button
          type="submit"
          form="employeeStores"
          variant="contained"
          disabled={addAssignment.isPending || removeAssignements.isPending}
          startIcon={addAssignment.isPending || removeAssignements.isPending ? <CircularProgress size={20} /> : <Save />}
        >
          {addAssignment.isPending || removeAssignements.isPending ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </Box>
    </Box>
  );
};

export default EmployeeStoreAssignment;
