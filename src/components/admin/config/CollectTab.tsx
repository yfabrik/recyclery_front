import { Add, Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { useQueryErrorToast } from "../../../hooks/useQueryErrorToast";
import type { ScheduleModel } from "../../../interfaces/Models";
import { fetchCollectionPoints } from "../../../services/api/collectionPoint";
import {
  createPlanning,
  deletePlanning,
  getPlanning,
  updatePlanning,
} from "../../../services/api/planning";
import { fetchStores } from "../../../services/api/store";
import {
  formatTime,
  weekdayFromDate,
  weekdayLabel,
} from "../../../services/dateService";
import {
  scheduleCollectPayloadFromForm,
  scheduleToCollectFormValues,
} from "../../../services/mapper/schedule";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../../../utils/apiToastMessage";
import type { CollecteFormOutput, CollecteFormValues } from "../../../services/schema/schedule";
import { CollecteForm } from "../../forms/CollecteForm";
import { Loading } from "../../Loading";

export const CollectTab = () => {
  const queryClient = useQueryClient();

  const [editingCollecteId, setEditingCollecteId] = useState<ScheduleModel["id"] | null>(null);
  const [formDefaults, setFormDefaults] = useState<Partial<CollecteFormValues> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    isLoading,
    error,
    data: collectes,
  } = useQuery({
    queryKey: ["collectes"],
    queryFn: () =>
      getPlanning({ category: "collection" }).then((res) => res.data.data),
  });
  useQueryErrorToast(error, "Erreur lors de la recupération des collectes");


  const collectionPoints = useQuery({
    queryKey: ["collectionPoints"],
    queryFn: () => fetchCollectionPoints().then(res => res.data.data),
  });
  const stores = useQuery({
    queryKey: ["stores"],
    queryFn: () => fetchStores({ active: true }).then(res => res.data.data),
  });

  const addCollecte = useMutation({
    mutationFn: (formData: CollecteFormOutput) => {
      return createPlanning(scheduleCollectPayloadFromForm(formData));
    },
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Collecte créé avec succès"));
      //   queryClient.setQueryData(["collectes"], (old = []) => [...old, newItem]);
      queryClient.invalidateQueries({ queryKey: ["collectes"] });
      handleCloseDialog();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
  });

  const editCollecte = useMutation({
    mutationFn: ({ id, data }: { id: ScheduleModel["id"]; data: CollecteFormOutput }) => {
      return updatePlanning(id, scheduleCollectPayloadFromForm(data));
    },
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Collecte mise à jour avec succès"));
      //   queryClient.setQueryData(["items"], (old = []) =>
      //     old.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      //   );
      queryClient.invalidateQueries({ queryKey: ["collectes"] });
      handleCloseDialog();

    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
  });

  const removeCollecte = useMutation({
    mutationFn: (id: ScheduleModel["id"]) => deletePlanning(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collectes"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la suppression")),
  });

  const handleOpenDialog = (collecte: ScheduleModel | null = null) => {
    setEditingCollecteId(collecte?.id ?? null);
    setFormDefaults(collecte ? scheduleToCollectFormValues(collecte) : null);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setEditingCollecteId(null);
    setFormDefaults(null);
    setDialogOpen(false);
  };

  const handleSave = async (data: CollecteFormOutput) => {

    if (editingCollecteId) {
      editCollecte.mutate({ id: editingCollecteId, data });
    } else {
      addCollecte.mutate(data);
    }
  };

  const handleDelete = async (collecte: ScheduleModel) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer cette collecte ?")
    ) {
      return;
    }
    removeCollecte.mutate(collecte.id);
  };

  return (
    <>
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold">Gestion des logistiques</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Nouvelle Logistique
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Jour</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Horaires</TableCell>
                <TableCell>Emplacement</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <Loading isLoading={isLoading} tableCols={6}>

                {collectes?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Aucune Collecte
                    </TableCell>
                  </TableRow>
                ) : (
                  collectes?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {typeof item.day_of_week === "number"
                            ? weekdayLabel(item.day_of_week)
                            : weekdayLabel(weekdayFromDate(item.scheduled_date))}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={item.is_recurring ? "Actif" : "Inactif"}
                          color={item.is_recurring ? "success" : "default"}
                        />
                      </TableCell>
                      <TableCell>
                        {
                        `${formatTime(new Date(item.start_time))} - ${formatTime(new Date(item.end_time))}`
                        }
                      </TableCell>
                      <TableCell>
                        {item.collection_point_id && collectionPoints?.data?.find(point => point.id === item.collection_point_id)?.name}
                        {item.store_id && stores.data?.find(store => store.id === item.store_id)?.name}
                        {!item.collection_point_id && !item.store_id && "Aucun"}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="Modifier">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(item)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(item)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </Loading>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingCollecteId ? "Modifier la collecte" : "Nouvelle Collecte"}
        </DialogTitle>
        <DialogContent>
          <CollecteForm
            formId="createLogistic"
            stores={stores.data ?? []}
            collectionPoints={collectionPoints.data ?? []}
            onSubmit={handleSave}
            defaultValues={formDefaults}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button type="submit" form="createLogistic" variant="contained" loading={addCollecte.isPending || editCollecte.isPending}>
            {editingCollecteId ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
