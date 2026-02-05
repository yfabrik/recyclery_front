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
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import type { ScheduleModel, TaskModel } from "../../../interfaces/Models";
import {
  createPlanning,
  deletePlanning,
  getPlanning,
  updatePlanning,
} from "../../../services/api/planning";
import { CollecteForm } from "../../forms/CollecteForm";

export const CollectTab = () => {
  const queryClient = useQueryClient();
  const [editingCollecte, setEditingCollecte] = useState<TaskModel | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    isPending,
    error,
    data: collectes,
  } = useQuery<ScheduleModel[]>({
    queryKey: ["collectes"],
    queryFn: () =>
      getPlanning({ category: "collection" }).then((res) => res.data.schedules),
  });

  const mutation = useMutation({
    mutationFn: (formData) => {
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      return updatePlanning(id, data);
    },
    onSuccess: (updatedItem) => {
      toast.success("Collecte mise à jour avec succès");
      //   queryClient.setQueryData(["items"], (old = []) =>
      //     old.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      //   );
      queryClient.invalidateQueries({ queryKey: ["collectes"] });
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePlanning(id),
    onSuccess: (deleted) => console.log(deleted),
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const handleOpenDialog = (collecte: TaskModel | null = null) => {
    setEditingCollecte(collecte);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setEditingCollecte(null);
    setDialogOpen(false);
  };

  const handleSave = async (data) => {
    data.name = "collecte";
    data.category = "collection";
    //TODO FIXME BEUUUUUUURK
    data.scheduled_date = (() => {
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
    data.recurrence_pattern = "weekly";
    if (editingCollecte?.id) {
      updateMutation.mutate({ id: editingCollecte.id, data });
    } else {
      mutation.mutate(data);
    }
  };

  const handleDelete = async (collecte: TaskModel) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer cette collecte ?")
    ) {
      return;
    }
    deleteMutation.mutate(collecte.id);
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
          <Typography variant="h6">Gestion des collectes</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Nouvelle Collecte
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Jour</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Horaires</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : collectes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Aucune Collecte
                  </TableCell>
                </TableRow>
              ) : (
                collectes.map((item: TaskModel) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.day_of_week}</TableCell>
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
            formId="createStore"
            onSubmit={handleSave}
            defaultValues={editingCollecte}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button type="submit" form="createStore" variant="contained">
            {editingCollecte ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
