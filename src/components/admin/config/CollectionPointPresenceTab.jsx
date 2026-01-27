/**
 * @deprecated
 */

import {
  AccessTime,
  Add,
  CalendarToday,
  Cancel,
  CheckCircle,
  Delete,
  Edit,
  LocationOn,
  Schedule,
  Sync,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchCollectionPoints as fCollectionPoints } from "../../../services/api/collectionPoint";
import {
  createPointPresence,
  deletePointPresence,
  fetchCollectionPointPresence,
  fetchPresenceForPoint,
  updatePointPresence,
} from "../../../services/api/collectionPointPresence";
import { fetchStores as fStores } from "../../../services/api/store";
import { DAYS_OF_WEEK as dayOptions ,TIME_SLOTS as timeSlotOptions } from "../../../interfaces/shared";

const CollectionPointPresenceTab = () => {
  const [presenceHours, setPresenceHours] = useState([]);
  const [collectionPoints, setCollectionPoints] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPresence, setEditingPresence] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [selectedCollectionPoint, setSelectedCollectionPoint] = useState("");

  const [formData, setFormData] = useState({
    collection_point_id: "",
    store_id: "",
    day_of_week: "",
    time_slot_name: "Présence",
    is_present: true,
    start_time: "",
    end_time: "",
    is_24h: false,
    notes: "",
  });

  // const dayOptions = [
  //   { value: "monday", label: "Lundi" },
  //   { value: "tuesday", label: "Mardi" },
  //   { value: "wednesday", label: "Mercredi" },
  //   { value: "thursday", label: "Jeudi" },
  //   { value: "friday", label: "Vendredi" },
  //   { value: "saturday", label: "Samedi" },
  //   { value: "sunday", label: "Dimanche" },
  // ];

  // const timeSlotOptions = [
  //   { value: "Présence", label: "Présence" },
  //   { value: "Matin", label: "Matin" },
  //   { value: "Après-midi", label: "Après-midi" },
  //   { value: "Soir", label: "Soir" },
  // ];

  useEffect(() => {
    fetchPresenceHours();
    fetchCollectionPoints();
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedCollectionPoint) {
      fetchPresenceHours(selectedCollectionPoint);
    } else {
      fetchPresenceHours();
    }
  }, [selectedCollectionPoint]);

  const fetchPresenceHours = async (collectionPointId = null) => {
    try {
      setLoading(true);
      const response =
        collectionPointId && collectionPointId !== ""
          ? await fetchPresenceForPoint(collectionPointId)
          : await fetchCollectionPointPresence();

      if (response.data.success) {
        setPresenceHours(response.data.presence_hours || []);
      } else {
        setPresenceHours([]);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des jours de présence");
      setPresenceHours([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionPoints = async () => {
    try {
      const response = await fCollectionPoints();
     
        setCollectionPoints(response.data.collection_points || []);

    } catch (error) {
      toast.error("Erreur lors du chargement des points de collecte");
    }
  };

  const fetchStores = async () => {
    try {
      const response = await fStores();
   
        setStores(response.data.stores || []);

    } catch (error) {
      toast.error("Erreur lors du chargement des magasins");
    }
  };

  const handleOpenDialog = (presence = null) => {
    if (presence) {
      setEditingPresence(presence);
      setFormData({
        collection_point_id: presence.collection_point_id,
        store_id: presence.store_id || "",
        day_of_week: presence.day_of_week,
        time_slot_name: presence.time_slot_name,
        is_present: presence.is_present,
        start_time: presence.start_time || "",
        end_time: presence.end_time || "",
        is_24h: presence.is_24h,
        notes: presence.notes || "",
      });
    } else {
      setEditingPresence(null);
      setFormData({
        collection_point_id: selectedCollectionPoint || "",
        store_id: "",
        day_of_week: "",
        time_slot_name: "Présence",
        is_present: true,
        start_time: "",
        end_time: "",
        is_24h: false,
        notes: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPresence(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      if (editingPresence) {
        await updatePointPresence(editingPresence.id, formData);
        toast.success("Jours de présence mis à jour avec succès");
      } else {
        await createPointPresence(formData);
        toast.success("Jours de présence créés avec succès");
      }

      // Recharger les données après la sauvegarde
      if (selectedCollectionPoint && selectedCollectionPoint !== "") {
        fetchPresenceHours(selectedCollectionPoint);
      } else {
        fetchPresenceHours();
      }
      handleCloseDialog();
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde des jours de présence");
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer ces jours de présence ?"
      )
    ) {
      try {
        await deletePointPresence(id);
        toast.success("Jours de présence supprimés avec succès");
        fetchPresenceHours(selectedCollectionPoint);
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleSyncAllPresence = async () => {
    if (collectionPoints.length === 0) {
      toast.warning(
        "Aucun point de collecte disponible pour la synchronisation"
      );
      return;
    }

    setSyncing(true);

    // Synchroniser pour les 3 prochains mois
    const today = new Date();
    const endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);

    const startDate = today.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // Synchroniser pour chaque point de collecte
    const syncPromises = collectionPoints.map(async (point) => {
      try {
        const response = await axios.post(
          "/api/collection-point-presence/sync-to-planning",
          {
            collection_point_id: point.id,
            start_date: startDate,
            end_date: endDateStr,
          }
        );

        if (response.data.success) {
          return {
            point: point.name,
            success: true,
            tasks: response.data.tasks?.length || 0,
            debug: response.data.debug,
          };
        } else {
          return {
            point: point.name,
            success: false,
            message: response.data.message,
          };
        }
      } catch (error) {
        return { point: point.name, success: false, error: error.message };
      }
    });

    const results = await Promise.all(syncPromises);

    // Compter les succès
    const successful = results.filter((r) => r.success);
    const totalTasks = successful.reduce((sum, r) => sum + (r.tasks || 0), 0);

    if (successful.length > 0) {
      toast.success(
        `🎉 Synchronisation complète ! ${totalTasks} tâches de présence créées pour ${successful.length} point(s) de collecte sur 3 mois`
      );
    } else {
      toast.warning(
        "⚠️ Aucune tâche de présence créée. Vérifiez que les jours de présence sont bien configurés."
      );
    }
    setSyncing(false);
  };

  const getDayLabel = (day) => {
    const dayOption = dayOptions.find((d) => d.value === day);
    return dayOption ? dayOption.label : day;
  };

  const getTimeSlotLabel = (slot) => {
    const slotOption = timeSlotOptions.find((s) => s.value === slot);
    return slotOption ? slotOption.label : slot;
  };

  const formatTime = (time) => {
    if (!time) return "";
    return time.substring(0, 5);
  };

  const filteredPresenceHours = selectedCollectionPoint
    ? presenceHours.filter(
        (p) => p.collection_point_id === parseInt(selectedCollectionPoint)
      )
    : presenceHours;

  return (
    <Box>
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
          <Typography variant="h4" gutterBottom>
            Jours de Présence - Points de Collecte
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Configurez les jours et horaires de présence pour chaque point de
            collecte
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Sync />}
            onClick={handleSyncAllPresence}
            disabled={syncing}
            sx={{
              borderColor: "#4caf50",
              color: "#4caf50",
              "&:hover": { borderColor: "#45a049", backgroundColor: "#f1f8e9" },
            }}
          >
            {syncing ? <CircularProgress size={20} /> : "SYNC ALL"}
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Nouveaux Jours
          </Button>
        </Box>
      </Box>

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Filtrer par point de collecte</InputLabel>
                <Select
                  value={selectedCollectionPoint}
                  onChange={(e) => setSelectedCollectionPoint(e.target.value)}
                  label="Filtrer par point de collecte"
                >
                  <MenuItem value="">
                    <em>Tous les points de collecte</em>
                  </MenuItem>
                  {collectionPoints.map((point) => (
                    <MenuItem key={point.id} value={point.id}>
                      {point.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="textSecondary">
                {selectedCollectionPoint
                  ? `Affichage des jours de présence pour ${
                      collectionPoints.find(
                        (p) => p.id === parseInt(selectedCollectionPoint)
                      )?.name || "point sélectionné"
                    }`
                  : "Affichage de tous les jours de présence"}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Liste des jours de présence */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredPresenceHours.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Point de Collecte</TableCell>
                <TableCell>Jour</TableCell>
                <TableCell>Créneau</TableCell>
                <TableCell>Présent</TableCell>
                <TableCell>Horaires</TableCell>
                <TableCell>24h/24</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPresenceHours.map((presence) => (
                <TableRow key={presence.id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationOn color="primary" />
                      <Typography variant="subtitle2">
                        {presence.collection_point_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getDayLabel(presence.day_of_week)}
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTimeSlotLabel(presence.time_slot_name)}
                      color="secondary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {presence.is_present ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Cancel color="error" />
                    )}
                  </TableCell>
                  <TableCell>
                    {presence.is_24h ? (
                      <Chip label="24h/24" color="info" size="small" />
                    ) : (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <AccessTime fontSize="small" />
                        <Typography variant="body2">
                          {formatTime(presence.start_time)} -{" "}
                          {formatTime(presence.end_time)}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {presence.is_24h ? (
                      <CheckCircle color="info" />
                    ) : (
                      <Cancel color="disabled" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {presence.notes || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(presence)}
                          sx={{ color: "#2196f3" }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(presence.id)}
                          sx={{ color: "#f44336" }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <CalendarToday
              sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucun jour de présence configuré
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Commencez par ajouter des jours de présence pour vos points de
              collecte
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Ajouter des jours de présence
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog de création/édition */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Schedule />
            {editingPresence
              ? "Modifier les jours de présence"
              : "Nouveaux jours de présence"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Point de collecte</InputLabel>
                <Select
                  name="collection_point_id"
                  value={formData.collection_point_id}
                  onChange={handleInputChange}
                  label="Point de collecte"
                >
                  {collectionPoints.map((point) => (
                    <MenuItem key={point.id} value={point.id}>
                      {point.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Magasin assigné</InputLabel>
                <Select
                  name="store_id"
                  value={formData.store_id}
                  onChange={handleInputChange}
                  label="Magasin assigné"
                >
                  <MenuItem value="">
                    <em>Aucun magasin assigné</em>
                  </MenuItem>
                  {stores.map((store) => (
                    <MenuItem key={store.id} value={store.id}>
                      {store.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Jour de la semaine</InputLabel>
                <Select
                  name="day_of_week"
                  value={formData.day_of_week}
                  onChange={handleInputChange}
                  label="Jour de la semaine"
                >
                  {dayOptions.map((day) => (
                    <MenuItem key={day.key} value={day.label}>
                      {day.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Créneau</InputLabel>
                <Select
                  name="time_slot_name"
                  value={formData.time_slot_name}
                  onChange={handleInputChange}
                  label="Crénau"
                >
                  {timeSlotOptions.map((slot) => (
                    <MenuItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_present"
                    checked={formData.is_present}
                    onChange={handleInputChange}
                  />
                }
                label="Présent ce jour"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Heure de début"
                name="start_time"
                type="time"
                value={formData.start_time}
                onChange={handleInputChange}
                disabled={formData.is_24h}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Heure de fin"
                name="end_time"
                type="time"
                value={formData.end_time}
                onChange={handleInputChange}
                disabled={formData.is_24h}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_24h"
                    checked={formData.is_24h}
                    onChange={handleInputChange}
                  />
                }
                label="Présent 24h/24"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Instructions spéciales, détails importants..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSave} variant="contained">
            {editingPresence ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollectionPointPresenceTab;
