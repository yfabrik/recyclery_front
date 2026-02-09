import {
  Add,
  Schedule
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  type CollectionPointModel,
  type ScheduleModel
} from "../../../interfaces/Models";
import {
  createCollectionPoint,
  deleteCollectionPoint,
  fetchCollectionPoints as fCol,
  updateCollectionPoint,
} from "../../../services/api/collectionPoint";
import {
  createPointPresence,
  deletePointPresence,
  updatePointPresence
} from "../../../services/api/collectionPointPresence";
import { fetchStores } from "../../../services/api/store";
import { CardCollectionPoint } from "../../CardCollectionPoint";
import {
  CollectionPointForm,
  type Schema,
} from "../../forms/CollectionPointForm";
import type { Schema as PresenceSchema } from "../../forms/PresencePointForm";
import { PresencePointForm } from "../../forms/PresencePointForm";

const CollectionPointsTab = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPoint, setEditingPoint] = useState<CollectionPointModel | null>(
    null,
  );

  const [presenceDialogOpen, setPresenceDialogOpen] = useState(false);
  const [editingPresence, setEditingPresence] = useState<ScheduleModel | null>(
    null,
  );

  const queryClient = useQueryClient()

  const collectionPoints = useQuery({
    queryKey: ["points"],
    queryFn: () => fCol().then(response => response.data.collection_points || [])
  })

  if (collectionPoints.error)
    toast.error("Erreur lors du chargement des points de collecte");


  const updatePoint = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Schema }) => updateCollectionPoint(id, data),
    onError: () => toast.error(
      "Erreur lors de la sauvegarde"
    ),
    onSuccess: () => {
      toast.success("Point de collecte mis à jour avec succès");
      handleCloseDialog()
      queryClient.invalidateQueries({ queryKey: ["points"] })
    }
  })
  const createPoint = useMutation({
    mutationFn: (data: Schema) => createCollectionPoint(data),
    onError: () => toast.error(
      "Erreur lors de la sauvegarde"
    ),
    onSuccess: () => {
      toast.success("Point de collecte créé avec succès");
      handleCloseDialog()
      queryClient.invalidateQueries({ queryKey: ["points"] })
    }
  })
  const deletePoint = useMutation({
    mutationFn: (id: number) => deleteCollectionPoint(id),
    onSuccess: () => {
      toast.success("Point de collecte supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["points"] })
    },
    onError: () => toast.error("Erreur lors de la suppression")
  })


  const recycleries = useQuery({
    queryKey: ["stores"],
    queryFn: () => fetchStores().then(response => response.data.stores)
  })
  if (recycleries.isError) toast.error("Erreur lors du chargement des recycleries");

  const handleOpenDialog = (point: CollectionPointModel | null = null) => {
    setEditingPoint(point);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPoint(null);
  };

  const handleSave = async (data: Schema) => {
    if (editingPoint?.id) updatePoint.mutate({ id: editingPoint.id, data })
    else createPoint.mutate(data)
    //   //FIXME
    //   //faudrait pas faire data = {...editing,...data} ?

  };

  const handleDelete = async (point: CollectionPointModel) => {
    if (
      window.confirm(`Êtes-vous sûr de vouloir supprimer "${point.name}" ?`)
    ) {
      deletePoint.mutate(point.id)
    }
  };

  const getTypeLabel = (type: string) => {
    const types = {
      standard: "Standard",
      enterprise: "Entreprise",
      association: "Association",
      school: "École",
      hospital: "Hôpital",
      other: "Autre",
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      standard: "default",
      enterprise: "primary",
      association: "secondary",
      school: "success",
      hospital: "warning",
      other: "info",
    };
    return colors[type] || "default";
  };


  const handleOpenPresenceDialog = (
    presence: ScheduleModel | null = null,
    pointId: number | null = null,
  ) => {
    if (pointId) {
      setEditingPresence({
        ...presence,
        collection_point_id: pointId,
      });
    } else
      setEditingPresence(presence);
    setPresenceDialogOpen(true);
  };

  const handleClosePresenceDialog = () => {
    setPresenceDialogOpen(false);
    setEditingPresence(null);
  };

  const updatePresence = useMutation({
    mutationFn: ({ id, data }: { id: number, data: PresenceSchema }) => updatePointPresence(id, data),
    onError: () => toast.error("Erreur lors de la sauvegarde de la présence"),
    onSuccess: () => {
      toast.success("Présence mise à jour avec succès");
      handleClosePresenceDialog()
      queryClient.invalidateQueries({ queryKey: ["points"] })

    }
  })
  const createPresence = useMutation({
    mutationFn: (data: PresenceSchema) => createPointPresence(data),
    onError: () => toast.error("Erreur lors de la sauvegarde de la présence"),
    onSuccess: () => {
      toast.success("Présence créée avec succès");
      handleClosePresenceDialog()
      queryClient.invalidateQueries({ queryKey: ["points"] })

    }
  })
  const deletePresence = useMutation({
    mutationFn: (id: number) => deletePointPresence(id),
    onError: () => toast.error("Erreur lors de la suppression de la présence"),
    onSuccess: () => {
      toast.success("Présence supprimée avec succès");
      queryClient.invalidateQueries({ queryKey: ["points"] })
    }
  })

  const handleSavePresence = async (data: PresenceSchema) => {
    if (editingPresence?.id) updatePresence.mutate({ id: editingPresence.id, data });
    else createPresence.mutate(data)
  };

  const handleDeletePresence = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette présence ?")) {
      deletePresence.mutate(id)
    }
  };

  if (collectionPoints.isLoading) {
    return <Typography>Chargement...</Typography>;
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">
          Gestion des Points de Collecte ({collectionPoints.data?.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nouveau Point
        </Button>
      </Box>

      <Grid container spacing={3}>
        {collectionPoints.data?.map((point) => (
          <Grid size={{ xs: 12, md: 6 }} key={point.id}>
            <CardCollectionPoint key={point.id}
              point={point}
              handleOpenDialog={handleOpenDialog}
              handleDeletePoint={handleDelete}
              handleDeleteHours={handleDeletePresence}
              handleOpenHoursDialog={handleOpenPresenceDialog} />
          </Grid>
        ))}
      </Grid>
      

      {/* Dialog de création/édition */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPoint
            ? "Modifier le Point de Collecte"
            : "Nouveau Point de Collecte"}
        </DialogTitle>
        <DialogContent>
          <CollectionPointForm
            formId="collectionPointForm"
            recycleries={recycleries.data || []}
            onSubmit={handleSave}
            defaultValues={editingPoint}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            type="submit"
            form="collectionPointForm"
            variant="contained"
          //TODO
          // disabled={
          //   !formData.name ||
          //   !formData.address ||
          //   !formData.city ||
          //   !formData.postal_code
          // }
          >
            {editingPoint ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>

      

      {/* Dialog de création/édition de présence */}
      <Dialog
        open={presenceDialogOpen}
        onClose={handleClosePresenceDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Schedule />
            {editingPresence?.id ? "Modifier la présence" : "Nouvelle présence"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <PresencePointForm
            formId="presencePointForm"
            collectionPoints={collectionPoints.data || []}
            onSubmit={handleSavePresence}
            defaultValues={editingPresence}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePresenceDialog}>Annuler</Button>
          <Button type="submit" form="presencePointForm" variant="contained">
            {editingPresence?.id ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollectionPointsTab;
