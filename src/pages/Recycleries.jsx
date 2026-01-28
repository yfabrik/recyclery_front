import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  Store,
  Edit,
  Delete,
  Phone,
  Email,
  LocationOn,
  Person,
  Assessment,
  AccountBalance,
  Settings,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import {
  createCaisse2,
  deleteCaisse,
  fetchCaisses2,
  updateCaisse,
} from "../services/api/store";

/**
 * @deprecated mais j'aime bien les card
 * @returns 
 */
const Recycleries = () => {
  const { user, isAdmin } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRecyclery, setEditingRecyclery] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  // États pour les caisses
  const [cashRegisters, setCashRegisters] = useState([]);
  const [openCashRegisterDialog, setOpenCashRegisterDialog] = useState(false);
  const [editingCashRegister, setEditingCashRegister] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Données simulées pour la démonstration
  const [recycleries, setRecycleries] = useState([
    {
      id: 1,
      name: "Recyclerie Centre-Ville",
      address: "123 Rue de la République, 75001 Paris",
      phone: "01 23 45 67 89",
      email: "centre@recyclerie.fr",
      manager_id: 1,
      manager_name: "Marie Dupont",
      stats: {
        items: 1247,
        sales: 156,
        revenue: 4580.5,
      },
    },
    {
      id: 2,
      name: "Recyclerie Quartier Nord",
      address: "456 Avenue des Champs, 75002 Paris",
      phone: "01 98 76 54 32",
      email: "nord@recyclerie.fr",
      manager_id: 2,
      manager_name: "Jean Martin",
      stats: {
        items: 892,
        sales: 89,
        revenue: 2340.25,
      },
    },
  ]);

  const handleOpenDialog = (recyclery = null) => {
    setEditingRecyclery(recyclery);
    if (recyclery) {
      reset(recyclery);
    } else {
      reset();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRecyclery(null);
    reset();
  };

  // Fonctions pour les caisses
  const fetchCashRegisters = async (storeId) => {
    try {
      setLoading(true);
      // const token = localStorage.getItem("token");
      const response = await fetchCaisses2(storeId);
      //  axios.get(`/api/cash-registers/store/${storeId}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      setCashRegisters(response.data.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des caisses:", error);
      toast.error("Erreur lors du chargement des caisses");
    } finally {
      setLoading(false);
    }
  };

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    fetchCashRegisters(store.id);
  };

  const handleOpenCashRegisterDialog = (cashRegister = null) => {
    setEditingCashRegister(cashRegister);
    if (cashRegister) {
      reset({
        name: cashRegister.name,
        is_active: cashRegister.is_active,
      });
    } else {
      reset({
        name: "",
        is_active: true,
      });
    }
    setOpenCashRegisterDialog(true);
  };

  const handleCloseCashRegisterDialog = () => {
    setOpenCashRegisterDialog(false);
    setEditingCashRegister(null);
    reset();
  };

  const onSubmitCashRegister = async (data) => {
    try {
      setLoading(true);
      // const token = localStorage.getItem("token");

      if (editingCashRegister) {
        // Mise à jour
        await updateCaisse(editingCashRegister.id, data);
        // await axios.put(`/api/cash-registers/${editingCashRegister.id}`, data, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        toast.success("Caisse mise à jour avec succès");
      } else {
        // Création
        await createCaisse2({
          ...data,
          store_id: selectedStore.id,
        });
        // await axios.post('/api/cash-registers', {
        //   ...data,
        //   store_id: selectedStore.id
        // }, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        toast.success("Caisse créée avec succès");
      }

      handleCloseCashRegisterDialog();
      fetchCashRegisters(selectedStore.id);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error(
        error.response?.data?.message || "Erreur lors de la sauvegarde"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCashRegister = async (cashRegisterId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette caisse ?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteCaisse(cashRegisterId)
      // const token = localStorage.getItem("token");
      // await axios.delete(`/api/cash-registers/${cashRegisterId}`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      toast.success("Caisse supprimée avec succès");
      fetchCashRegisters(selectedStore.id);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression"
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data) => {
    if (editingRecyclery) {
      // Modifier une recyclerie existante
      setRecycleries((prev) =>
        prev.map((r) => (r.id === editingRecyclery.id ? { ...r, ...data } : r))
      );
      toast.success("Recyclerie modifiée avec succès");
    } else {
      // Créer une nouvelle recyclerie
      const newRecyclery = {
        id: Date.now(),
        ...data,
        stats: { items: 0, sales: 0, revenue: 0 },
      };
      setRecycleries((prev) => [...prev, newRecyclery]);
      toast.success("Recyclerie créée avec succès");
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cette recyclerie ?")
    ) {
      setRecycleries((prev) => prev.filter((r) => r.id !== id));
      toast.success("Recyclerie supprimée");
    }
  };

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
            Gestion des Recycleries
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gérez vos sites de recyclerie et leurs informations
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Nouvelle Recyclerie
          </Button>
        )}
      </Box>
      {/* Liste des recycleries */}
      <Grid container spacing={3}>
        {recycleries.map((recyclery) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={recyclery.id}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                    <Store />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="h2">
                      {recyclery.name}
                    </Typography>
                    <Chip
                      label="Active"
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <List dense>
                  <ListItem disablePadding>
                    <ListItemAvatar>
                      <LocationOn color="action" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={recyclery.address}
                      slotProps={{
                        primary: { variant: "body2" }
                      }}
                    />
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemAvatar>
                      <Phone color="action" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={recyclery.phone}
                      slotProps={{
                        primary: { variant: "body2" }
                      }}
                    />
                  </ListItem>

                  <ListItem disablePadding>
                    <ListItemAvatar>
                      <Email color="action" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={recyclery.email}
                      slotProps={{
                        primary: { variant: "body2" }
                      }}
                    />
                  </ListItem>

                  {recyclery.manager_name && (
                    <ListItem disablePadding>
                      <ListItemAvatar>
                        <Person color="action" />
                      </ListItemAvatar>
                      <ListItemText
                        primary={recyclery.manager_name}
                        secondary="Gestionnaire"
                        slotProps={{
                          primary: { variant: "body2" },
                          secondary: { variant: "caption" }
                        }} />
                    </ListItem>
                  )}
                </List>

                <Divider sx={{ my: 2 }} />

                {/* Statistiques */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    textAlign: "center",
                  }}
                >
                  <Box>
                    <Typography variant="h6" color="primary">
                      {recyclery.stats.items}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Articles
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" color="success.main">
                      {recyclery.stats.sales}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Ventes
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" color="info.main">
                      {recyclery.stats.revenue}€
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      CA
                    </Typography>
                  </Box>
                </Box>
              </CardContent>

              <CardActions
                sx={{ justifyContent: "space-between", px: 2, pb: 2 }}
              >
                <Button
                  size="small"
                  startIcon={<Assessment />}
                  onClick={() => toast.info("Fonctionnalité en développement")}
                >
                  Statistiques
                </Button>

                {isAdmin && (
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(recyclery)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(recyclery.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Dialog pour créer/modifier une recyclerie */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingRecyclery ? "Modifier la recyclerie" : "Nouvelle recyclerie"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nom de la recyclerie"
              {...register("name", {
                required: "Le nom est requis",
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Adresse"
              multiline
              rows={2}
              {...register("address")}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Téléphone"
              {...register("phone")}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Email"
              type="email"
              {...register("email")}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained">
            {editingRecyclery ? "Modifier" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Recycleries;
