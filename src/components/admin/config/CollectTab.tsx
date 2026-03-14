import { Add, Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
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
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import type { ScheduleModel } from "../../../interfaces/Models";
import { fetchCollectionPoints } from "../../../services/api/collectionPoint";
import {
  createPlanning,
  deletePlanning,
  getPlanning,
  updatePlanning,
} from "../../../services/api/planning";
import { fetchStores } from "../../../services/api/store";
import { CollecteForm, type Schema } from "../../forms/CollecteForm";
import { Loading } from "../../Loading";

export const CollectTab = () => {
  const queryClient = useQueryClient();

  const [editingCollecte, setEditingCollecte] = useState<ScheduleModel | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    isLoading,
    isPending,
    error,
    data: collectes,
  } = useQuery({
    queryKey: ["collectes"],
    queryFn: () =>
      getPlanning({ category: "collection" }).then((res) => res.data.schedules),
  });
  if (error) toast.error("Erreur lors de la recupération des collectes")


  const collectionPoints = useQuery({
    queryKey: ["collectionPoints"],
    queryFn: () => fetchCollectionPoints().then(res => res.data.collection_points),
  });
  const stores = useQuery({
    queryKey: ["stores"],
    queryFn: () => fetchStores({ active: true }).then(res => res.data.stores),
  });

  const addCollecte = useMutation({
    mutationFn: (formData: Partial<ScheduleModel>) => {
      return createPlanning(formData);
    },
    onSuccess: (newItem) => {
      toast.success("Collecte créé avec succès");
      //   queryClient.setQueryData(["collectes"], (old = []) => [...old, newItem]);
      queryClient.invalidateQueries({ queryKey: ["collectes"] });
      handleCloseDialog();
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  const editCollecte = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<ScheduleModel> }) => {
      return updatePlanning(id, data);
    },
    onSuccess: (updatedItem) => {
      toast.success("Collecte mise à jour avec succès");
      //   queryClient.setQueryData(["items"], (old = []) =>
      //     old.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      //   );
      queryClient.invalidateQueries({ queryKey: ["collectes"] });
      handleCloseDialog();

    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  const removeCollecte = useMutation({
    mutationFn: (id: number) => deletePlanning(id),
    onSuccess: (deleted) => {
      queryClient.invalidateQueries({ queryKey: ["collectes"] });
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const handleOpenDialog = (collecte: ScheduleModel | null = null) => {
    const tmp = { ...collecte, location: collecte?.location ? collecte.location.split(",") : [] }

    setEditingCollecte(tmp);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setEditingCollecte(null);
    setDialogOpen(false);
  };

  const handleSave = async (data: Schema) => {
    const result: Partial<ScheduleModel> = {
      ...data,
      location: data.location.join(",") ?? "",
      name: "collecte",
      category: "collection",
      recurrence_pattern: "weekly",
      collection_point_id: undefined,
    };

    // const [type, id] = data.location2?.split(".") ?? [];
    // if (type === "point") {
    //   result.collection_point_id = +id;
    //   result.name += ` - déchet ${collectionPoints.data?.find(point => point.id === +id)?.name}`;
    // } else if (type === "store") {
    //   result.store_id = +id;
    //   result.name += ` - magasin ${stores.data?.find(store => store.id === +id)?.name}`;
    // }
    //TODO FIXME BEUUUUUUURK
    result.scheduled_date = (() => {
      const today = new Date();
      let i = 0;
      while (i < 7) {
        const jour = new Intl.DateTimeFormat("fr-FR", {
          weekday: "long",
        }).format(today.setDate(today.getDate() + 1));
        if (jour == data.day_of_week.toLowerCase()) {
          return today;
        }
        i++;
      }
    })();
    if (editingCollecte?.id) {
      editCollecte.mutate({ id: editingCollecte.id, data: result });
    } else {
      addCollecte.mutate(result);
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
                        <Typography variant="body2" sx={{ textTransform: "capitalize", fontWeight: "bold" }}>
                          {item.day_of_week}
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
                        {`${new Date(item.start_time).toLocaleString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} - ${new Date(item.end_time).toLocaleString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`}
                      </TableCell>
                      <TableCell>
                        {item.collection_point_id && collectionPoints.data?.find(point => point.id === item.collection_point_id)?.name}
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
          {editingCollecte ? "Modifier la collecte" : "Nouvelle Collecte"}
        </DialogTitle>
        <DialogContent>
          <CollecteForm
            formId="createLogistic"
            stores={stores.data ?? []}
            collectionPoints={collectionPoints.data ?? []}
            onSubmit={handleSave}
            defaultValues={editingCollecte}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button type="submit" form="createLogistic" variant="contained" loading={addCollecte.isPending || editCollecte.isPending}>
            {editingCollecte ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
