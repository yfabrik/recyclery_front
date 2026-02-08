import { Person, Save } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { type StoreModel } from "../interfaces/Models";
import { fetchStores } from "../services/api/store";
import {
  addAssignedStore,
  getAssignedStores,
  removeAssignedStores,
} from "../services/api/users";
import { EmployeeStoresForm, type Schema } from "./forms/EmployeeStoresForm";
interface EmployeeStoreAssignmentProps {
  employeeId: number;
  employeeName: string;
  onClose: () => void;
  onSave: () => void;
}

interface Assignments extends StoreModel {
  is_primary: boolean;
  EmployeeStore: { is_primary: boolean };
}
const EmployeeStoreAssignment = ({
  employeeId,
  employeeName,
  onClose,
  onSave,
}: EmployeeStoreAssignmentProps) => {
  // const [stores, setStores] = useState<StoreModel[]>([]);
  // const [assignments, setAssignments] = useState<Assignments[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [saving, setSaving] = useState(false);

  // useEffect(() => {
  //   fetchData();
  // }, [employeeId]);
  const queryClient = useQueryClient()
  const stores = useQuery({
    queryKey: ["stores"],
    queryFn: () => fetchStores().then(response => response.data.stores)
  })

  const assignments = useQuery({
    queryKey: ["assignments", employeeId],
    queryFn: () => getAssignedStores(employeeId).then(response => response.data.assignments)
  })

  if (stores.isError || assignments.isError) toast.error("Erreur lors du chargement des données");


  const removeAssignements = useMutation({
    mutationFn: (employeeId: number) => removeAssignedStores(employeeId),
    onSuccess: () => {
    },
    onError: () => toast.error("Erreur lors de la sauvegarde des affectations"),
  })


  const addAssignment = useMutation({
    mutationFn: (data: { employee_id: number, store_id: number, is_primary: boolean }) => addAssignedStore(data),
    onSuccess: () => {
    },
    onError: () => toast.error("Erreur lors de la sauvegarde des affectations"),
  })

  // const fetchData = async () => {
  //   try {
  //     setLoading(true);
  //     // Récupérer tous les magasins
  //     const storesResponse = await fetchStores();
  //     setStores(storesResponse.data.stores || []);
  //     // Récupérer les affectations actuelles de l'employé
  //     const assignmentsResponse = await getAssignedStores(employeeId);
  //     setAssignments(assignmentsResponse.data.assignments || []);
  //   } catch (error) {
  //     console.error("Erreur lors du chargement des données:", error);
  //     toast.error("Erreur lors du chargement des données");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   console.log(assignments)
  // }, [assignments])

  // const handleStoreToggle = (storeId: number) => {
  //   setAssignments((prev) => {
  //     const existingAssignment = prev?.find((a) => a.id === storeId);

  //     if (existingAssignment) {
  //       // Supprimer l'affectation
  //       return prev.filter((a) => a.id !== storeId);
  //     } else {
  //       // Ajouter une nouvelle affectation
  //       const store = stores.data?.find((s) => s.id === storeId);
  //       return [
  //         ...prev,
  //         {
  //           id: storeId,
  //           name: store?.name || "",
  //           is_primary: prev.length === 0, // Premier magasin = principal par défaut
  //         },
  //       ];
  //     }
  //   });
  // };

  // const handlePrimaryChange = (storeId: number) => {
  //   setAssignments((prev) =>
  //     prev.map((assignment) => ({
  //       ...assignment,
  //       is_primary: assignment.id === storeId,
  //     })),
  //   );
  // };

  const handleSave = async (data: Schema) => {

    try {
      await removeAssignements.mutateAsync(employeeId)
      if (!removeAssignements.isError)

        //   // Supprimer toutes les affectations existantes
        //   await removeAssignedStores(employeeId);

        //   // Créer les nouvelles affectations
        for (const assignment of data.stores) {
          if (assignment.isAssigned)
            //TOOD c'est moche, l'url devrait avoir le employee id non ?
            await addAssignment.mutateAsync({
              employee_id: employeeId,
              store_id: assignment.store_id,
              is_primary: data.isPrimary == assignment.name,
            });
        }
      queryClient.invalidateQueries({ queryKey: ["assignments"] })

      toast.success("Affectations mises à jour avec succès");
      onSave && onSave();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde des affectations");

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
    <Box>
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

      <Grid container spacing={2}>
        <EmployeeStoresForm formId="employeeStores" onSubmit={handleSave} stores={stores.data || []} assignments={assignments.data || []}></EmployeeStoresForm>
        {/* {stores.data?.map((store) => {
          const assignment = assignments.data?.find((a) => a.id === store.id);
          const isAssigned = !!assignment;
          const isPrimary = assignment?.is_primary || false;

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={store.id}>
              <Card
                sx={{
                  border: isAssigned
                    ? "2px solid #4caf50"
                    : "1px solid #e0e0e0",
                  bgcolor: isAssigned ? "#f1f8e9" : "white",
                  "&:hover": {
                    boxShadow: 2,
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Store sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {store.name}
                    </Typography>
                    {isPrimary && (
                      <Chip
                        icon={<Star />}
                        label="Principal"
                        color="warning"
                        size="small"
                      />
                    )}
                  </Box>

                  {store.address && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      📍 {store.address}
                    </Typography>
                  )}

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isAssigned}
                          onChange={() => handleStoreToggle(store.id)}
                          color="primary"
                        />
                      }
                      label="Affecté"
                    />

                    {isAssigned && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isPrimary}
                            onChange={() => handlePrimaryChange(store.id)}
                            color="warning"
                          />
                        }
                        label="Principal"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })} */}
      </Grid>

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
          // onClick={handleSave}
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
