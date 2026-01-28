import {
  AccessTime,
  AccountBalance,
  Add,
  Delete,
  Edit,
  Email,
  Person,
  Phone,
  Schedule,
  Store,
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
  Grid,
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
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  createCaisse,
  createStore,
  deleteStore,
  fetchCaisses,
  fetchStores as fStore,
  updateStore,
} from "../../../services/api/store";
import {
  createStoreHours,
  deleteStoreHours,
  fetchStoreHours as fStoreHours,
  updateStoreHours,
} from "../../../services/api/storeHours";
import { fetchUsers as fUsers } from "../../../services/api/users";
import { StatCardNoIcon } from "../../StatCard";
import { StoreOpen } from "../../StoreOpen";
import { StoreForm } from "../../forms/StoreForm";
import { StoreOpeningForm } from "../../forms/StoreOpeningForm";
import type {
  CaisseModel,
  StoreHoursModel,
  StoreModel,
  UserModel,
} from "../../../interfaces/Models";

const StoresTab = () => {
  const [stores, setStores] = useState<StoreModel[]>([]);
  const [users, setUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreModel | null>(null);
  const [cashRegistersDialog, setCashRegistersDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreModel | null>(null); //TODO le meme que editing store ?
  const [cashRegisters, setCashRegisters] = useState<CaisseModel[]>([]);
  const [newCashRegisterName, setNewCashRegisterName] = useState("");

  // États pour les onglets et horaires
  const [tabValue, setTabValue] = useState(0);
  const [storeHours, setStoreHours] = useState<StoreHoursModel[]>([]);
  const [hoursDialogOpen, setHoursDialogOpen] = useState(false);
  const [editingHours, setEditingHours] = useState<StoreHoursModel | null>(
    null,
  );
  const [hoursLoading, setHoursLoading] = useState(false);

  useEffect(() => {
    fetchStores();
    fetchUsers();
    fetchStoreHours();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await fStore();
      setStores(response.data.stores || []);
    } catch (error) {
      console.error("Erreur lors du chargement des magasins:", error);
      toast.error("Erreur lors du chargement des magasins");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fUsers();
      const managers = (response.data.users || []).filter(
        (user) => user.role === "manager" || user.role === "admin",
      );
      setUsers(managers);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
    }
  };

  const fetchStoreHours = async () => {
    try {
      setHoursLoading(true);
      const response = await fStoreHours();
      setStoreHours(response.data.storeHours || []);
    } catch (error) {
      console.error("Erreur lors du chargement des horaires:", error);
      toast.error("Erreur lors du chargement des horaires");
    } finally {
      setHoursLoading(false);
    }
  };

  const fetchCashRegisters = async (storeId: number) => {
    try {
      const response = await fetchCaisses(storeId);
      setCashRegisters(response.data.cash_registers || []);
    } catch (error) {
      console.error("Erreur lors du chargement des caisses:", error);
      toast.error("Erreur lors du chargement des caisses");
    }
  };

  const handleOpenDialog = (store: StoreModel | null = null) => {
    setEditingStore(store);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStore(null);
  };

  const handleSave = async (data) => {
    try {
      if (editingStore?.id) {
        // Mise à jour
        await updateStore(editingStore.id, data);
        toast.success("Magasin mis à jour avec succès");
      } else {
        // Création
        await createStore(data);
        toast.success("Magasin créé avec succès");
      }

      handleCloseDialog();
      fetchStores();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce magasin ?")) {
      return;
    }

    try {
      await deleteStore(id);
      toast.success("Magasin supprimé avec succès");
      fetchStores();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error(
        error.response?.data?.error || "Erreur lors de la suppression",
      );
    }
  };

  const handleOpenCashRegisters = (store: StoreModel) => {
    setSelectedStore(store);
    fetchCashRegisters(store.id);
    setCashRegistersDialog(true);
  };

  const handleCloseCashRegisters = () => {
    setCashRegistersDialog(false);
    setSelectedStore(null);
    setCashRegisters([]);
    setNewCashRegisterName("");
  };

  const handleAddCashRegister = async () => {
    if (!newCashRegisterName.trim()) {
      toast.error("Le nom de la caisse est obligatoire");
      return;
    }

    try {
      await createCaisse(selectedStore.id, { name: newCashRegisterName });
      toast.success("Caisse créée avec succès");
      setNewCashRegisterName("");
      fetchCashRegisters(selectedStore.id);
    } catch (error) {
      console.error("Erreur lors de la création de la caisse:", error);
      toast.error("Erreur lors de la création de la caisse");
    }
  };

  // Fonctions pour gérer les horaires d'ouverture
  const handleOpenHoursDialog = (
    hours: StoreHoursModel | null = null,
    store_id: number | null = null,
  ) => {
    if (hours) {
      setEditingHours(hours);
    } else {
      setEditingHours(store_id ? { store_id } : null);
    }
    setHoursDialogOpen(true);
  };

  const handleCloseHoursDialog = () => {
    setHoursDialogOpen(false);
    setEditingHours(null);
  };

  const handleSaveHours = async (data) => {
    try {
      if (editingHours?.id) {
        await updateStoreHours(editingHours.id, data);
        toast.success("Horaires mis à jour avec succès");
      } else {
        await createStoreHours(data);
        toast.success("Horaires créés avec succès");
      }

      handleCloseHoursDialog();
      fetchStoreHours();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des horaires:", error);
      toast.error("Erreur lors de la sauvegarde des horaires");
    }
  };

  const handleDeleteHours = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ces horaires ?")) {
      try {
        await deleteStoreHours(id);
        toast.success("Horaires supprimés avec succès");
        fetchStoreHours();
      } catch (error) {
        console.error("Erreur lors de la suppression des horaires:", error);
        toast.error("Erreur lors de la suppression des horaires");
      }
    }
  };

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
        <Typography variant="h6">Gestion des Magasins</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nouveau Magasin
        </Button>
      </Box>
      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Liste des Magasins" icon={<Store />} iconPosition="start" />
        <Tab
          label="Horaires d'Ouverture"
          icon={<AccessTime />}
          iconPosition="start"
        />
        {/* <Tab label="Lieux" icon={<LocationOn />} iconPosition="start" /> */}
      </Tabs>
      {/* Contenu des onglets */}
      {tabValue === 0 && (
        <>
          {/* Statistiques rapides */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCardNoIcon
                title="Magasins total"
                value={stores.length}
                color="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCardNoIcon
                title="Magasins actifs"
                value={stores.filter((store) => store.is_active).length}
                color="success.main"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCardNoIcon
                title="Caisses total"
                value={stores.reduce(
                  (sum, store) => sum + (store.cash_registers_count || 0),
                  0,
                )}
                color="info.main"
              />
            </Grid>
          </Grid>

          {/* Table des magasins */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Magasin</TableCell>
                  <TableCell>Manager</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Caisses</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : stores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Aucun magasin trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  stores.map((store) => (
                    <TableRow key={store.id} hover>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Store color="primary" />
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {store.name}
                            </Typography>
                            {store.address && (
                              <Typography variant="body2" color="textSecondary">
                                {store.address}
                                {store.city && `, ${store.city}`}
                                {store.postal_code && ` ${store.postal_code}`}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {store?.manager?.username ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Person fontSize="small" />
                            {store.manager.username}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            Non assigné
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box>
                          {store.phone && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 0.5,
                              }}
                            >
                              <Phone fontSize="small" />
                              <Typography variant="body2">
                                {store.phone}
                              </Typography>
                            </Box>
                          )}
                          {store.email && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Email fontSize="small" />
                              <Typography variant="body2">
                                {store.email}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AccountBalance />}
                          onClick={() => handleOpenCashRegisters(store)}
                        >
                          {store.cash_registers_count || 0} caisse(s)
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={store.is_active ? "Actif" : "Inactif"}
                          color={store.is_active ? "success" : "default"}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="Modifier">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(store)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(store.id)}
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
        </>
      )}
      {/* Onglet Horaires d'ouverture */}
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
              Horaires d'ouverture des magasins
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenHoursDialog()}
            >
              Ajouter des horaires
            </Button>
          </Box>

          {hoursLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : storeHours.length === 0 ? (
            <Alert severity="info">
              Aucun horaire d'ouverture configuré. Cliquez sur "Ajouter des
              horaires" pour commencer.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {Object.entries(
                storeHours.reduce(
                  (acc: Record<number, StoreHoursModel[]>, hours) => {
                    if (!acc[hours.store_id]) {
                      acc[hours.store_id] = [];
                    }
                    acc[hours.store_id].push(hours);
                    return acc;
                  },
                  {},
                ),
              ).map(([storeId, hours]) => (
                <Grid size={{ xs: 12, md: 6 }} key={storeId}>
                  <StoreOpen
                    store={stores.find((s) => s.id === parseInt(storeId)) || []}
                    hours={hours}
                    handleOpenHoursDialog={handleOpenHoursDialog}
                    handleDeleteHours={handleDeleteHours}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Dialog de gestion des caisses */}
      <Dialog
        open={cashRegistersDialog}
        onClose={handleCloseCashRegisters}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Caisses - {selectedStore?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Nom de la nouvelle caisse"
              value={newCashRegisterName}
              onChange={(e) => setNewCashRegisterName(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleAddCashRegister}
                      disabled={!newCashRegisterName.trim()}
                    >
                      Ajouter
                    </Button>
                  ),
                },
              }}
            />
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Sessions</TableCell>
                  <TableCell>Dernière utilisation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cashRegisters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Aucune caisse
                    </TableCell>
                  </TableRow>
                ) : (
                  cashRegisters.map((register) => (
                    <TableRow key={register.id}>
                      <TableCell>{register.name}</TableCell>
                      <TableCell>{register.total_sessions || 0}</TableCell>
                      <TableCell>
                        {register.last_session
                          ? new Date(register.last_session).toLocaleString()
                          : "Jamais"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCashRegisters}>Fermer</Button>
        </DialogActions>
      </Dialog>
      {/* Dialog de création/édition de magasin */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingStore ? "Modifier le magasin" : "Nouveau magasin"}
        </DialogTitle>
        <DialogContent>
          <StoreForm
            formId="createStore"
            onSubmit={handleSave}
            managers={users}
            defaultValues={editingStore}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button type="submit" form="createStore" variant="contained">
            {editingStore ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog de création/édition des horaires */}
      <Dialog
        open={hoursDialogOpen}
        onClose={handleCloseHoursDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Schedule />
            {editingHours ? "Modifier les horaires" : "Nouveaux horaires"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <StoreOpeningForm
            formId="openHours"
            onSubmit={handleSaveHours}
            stores={stores}
            defaultValues={editingHours}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHoursDialog}>Annuler</Button>
          <Button type="submit" form="openHours" variant="contained">
            {editingHours ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoresTab;
