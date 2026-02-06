import {
  Add,
  Delete,
  Edit,
  Email,
  LocationOn,
  Phone,
  Schedule,
} from "@mui/icons-material";
import {
  Alert,
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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  type CollectionPointModel,
  type ScheduleModel,
  type StoreModel,
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
  fetchCollectionPointPresence,
  updatePointPresence,
} from "../../../services/api/collectionPointPresence";
import { fetchStores } from "../../../services/api/store";
import {
  CollectionPointForm,
  type Schema,
} from "../../forms/CollectionPointForm";
import type { Schema as PresenceSchema } from "../../forms/PresencePointForm";
import { PresencePointForm } from "../../forms/PresencePointForm";

const CollectionPointsTab = () => {
  const [recycleries, setRecycleries] = useState<StoreModel[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPoint, setEditingPoint] = useState<CollectionPointModel | null>(
    null,
  );

  // États pour les onglets et présence
  const [tabValue, setTabValue] = useState(0);
  const [presenceData, setPresenceData] = useState<ScheduleModel[]>([]);
  const [presenceLoading, setPresenceLoading] = useState(false);
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

  useEffect(() => {
    fetchRecycleries();
    fetchPresenceData();
  }, []);


  const fetchRecycleries = async () => {
    try {
      const response = await fetchStores();

      setRecycleries(response.data.recycleries || []);
    } catch (error) {
      console.error("Erreur lors du chargement des recycleries:", error);
    }
  };

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
    if (!point.id) return
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

  // Fonctions pour gérer la présence
  const fetchPresenceData = async () => {
    try {
      setPresenceLoading(true);
      const response = await fetchCollectionPointPresence();
      setPresenceData(response.data.schedules || []);
    } catch (error) {
      console.error("Erreur lors du chargement de la présence:", error);
      toast.error("Erreur lors du chargement de la présence");
    } finally {
      setPresenceLoading(false);
    }
  };

  const handleOpenPresenceDialog = (
    presence: ScheduleModel | null = null,
  ) => {
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
      fetchPresenceData()

    }
  })
  const createPresence = useMutation({
    mutationFn: (data: PresenceSchema) => createPointPresence(data),
    onError: () => toast.error("Erreur lors de la sauvegarde de la présence"),
    onSuccess: () => {
      toast.success("Présence créée avec succès");
      handleClosePresenceDialog()
      fetchPresenceData()

    }
  })
  const deletePresence = useMutation({
    mutationFn: (id: number) => deletePointPresence(id),
    onError: () => toast.error("Erreur lors de la suppression de la présence"),
    onSuccess: () => {
      toast.success("Présence supprimée avec succès");
      fetchPresenceData()
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

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab
          label="Liste des Points"
          icon={<LocationOn />}
          iconPosition="start"
        />
        <Tab label="Présence Points" icon={<Schedule />} iconPosition="start" />
      </Tabs>

      {/* Contenu des onglets */}
      {tabValue === 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Adresse</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {collectionPoints.data?.map((point) => (
                  <TableRow key={point.id}>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LocationOn color="primary" fontSize="small" />
                        <Typography variant="subtitle2">
                          {point.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{point.address}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {point.city} {point.postal_code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTypeLabel(point.type)}
                        color={getTypeColor(point.type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {point.contact_person && (
                        <Typography variant="body2">
                          {point.contact_person}
                        </Typography>
                      )}
                      {point.contact_phone && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Phone fontSize="small" />
                          <Typography variant="caption">
                            {point.contact_phone}
                          </Typography>
                        </Box>
                      )}
                      {point.contact_email && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Email fontSize="small" />
                          <Typography variant="caption">
                            {point.contact_email}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={point.is_active ? "Actif" : "Inactif"}
                        color={point.is_active ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleOpenDialog(point)}
                        color="primary"
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(point)}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

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
                recycleries={recycleries}
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
        </>
      )}

      {/* Onglet Présence Points */}
      {tabValue === 1 && (
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
              Présence aux Points de Collecte
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenPresenceDialog()}
            >
              Ajouter une présence
            </Button>
          </Box>

          {presenceLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : presenceData.length === 0 ? (
            <Alert severity="info">
              Aucune présence enregistrée. Cliquez sur "Ajouter une présence"
              pour commencer.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Point de Collecte</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Heures</TableCell>
                    <TableCell>Employé</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {presenceData.map((presence) => (
                    <TableRow key={presence.id}>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <LocationOn color="primary" fontSize="small" />
                          <Typography variant="body2">
                            {collectionPoints.data?.find(
                              (cp) => cp.id === presence.collection_point_id,
                            )?.name || "Point inconnu"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {presence.day_of_week}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(presence.start_time).toLocaleString(
                            "fr-FR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}{" "}
                          -{" "}
                          {new Date(presence.end_time).toLocaleString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {presence.employee_name || "aucun"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={presence.is_recurring ? "Présent" : "Absent"}
                          color={presence.is_recurring ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenPresenceDialog(presence)}
                          color="primary"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeletePresence(presence.id)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

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
            {editingPresence ? "Modifier la présence" : "Nouvelle présence"}
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
            {editingPresence ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollectionPointsTab;
