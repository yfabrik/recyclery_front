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
  Tooltip,
  Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import type {
  StoreHoursModel,
  StoreModel
} from "../../../interfaces/Models";
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
import { CreateCaisseForm, type Schema as CaisseSchema } from "../../forms/CreateCaisseForm";
import { StoreForm, type Schema } from "../../forms/StoreForm";
import type { Schema as HoraireSchema } from "../../forms/StoreOpeningForm";
import { StoreOpeningForm } from "../../forms/StoreOpeningForm";

const StoresTab = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreModel | null>(null);
  const [cashRegistersDialog, setCashRegistersDialog] = useState(false);

  // États pour les onglets et horaires
  const [tabValue, setTabValue] = useState(0);
  const [hoursDialogOpen, setHoursDialogOpen] = useState(false);
  const [editingHours, setEditingHours] = useState<StoreHoursModel | null>(
    null,
  );

  const queryClient = useQueryClient()

  //TODO y'a peu etre plus besoin des hours vu que je peux les recup avec les store ?
  const stores = useQuery({
    queryFn: () => fStore({ include: ["horaires"] }).then(response => response.data.stores),
    queryKey: ["stores", "horaires"]
  })
  if (stores.error) toast.error("Erreur lors du chargement des magasins");

  const editStore = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Schema }) => updateStore(id, data),
    onError: () => toast.error("Erreur lors de la sauvegarde"),
    onSuccess: () => {
      toast.success("Magasin mis à jour avec succès");
      handleCloseDialog();
      queryClient.invalidateQueries({ queryKey: ["stores"] })
    }
  })
  const addStore = useMutation({
    mutationFn: (data: Schema) => createStore(data),
    onError: () => toast.error("Erreur lors de la sauvegarde"),
    onSuccess: () => {
      toast.success("Magasin créé avec succès");
      handleCloseDialog();
      queryClient.invalidateQueries({ queryKey: ["stores"] })
    }
  })
  const removeStore = useMutation({
    mutationFn: (id: number) => deleteStore(id),
    onError: () => toast.error("Erreur lors de la suppression"),
    onSuccess: () => {
      toast.success("Magasin supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["stores"] })
    }
  })


  const users = useQuery({
    queryKey: ["users"],
    queryFn: () => fUsers({ role: "admin" }).then(response => response.data.users)
  })
  if (users.error) toast.error("Erreur lors du chargement des utilisateurs")

  // const fetchUsers = async () => {
  //   try {
  //     const response = await fUsers();
  //     const managers = (response.data.users || []).filter(
  //       (user) => user.role === "manager" || user.role === "admin",
  //     );
  //     setUsers(managers);
  //   } catch (error) {
  //     console.error("Erreur lors du chargement des utilisateurs:", error);
  //   }
  // };

  const caisses = useQuery({
    queryKey: ["caisses", editingStore?.id],//FIXME je crois que c'est pas bon
    enabled: !!editingStore?.id && cashRegistersDialog,

    queryFn: () => fetchCaisses(editingStore?.id).then(response => response.data.cash_registers),
    placeholderData: []
  })
  if (caisses.isError) toast.error("Erreur lors du chargement des caisses");


  const addCaisse = useMutation({
    mutationFn: ({ id, name }: { id: number, name: CaisseSchema }) => createCaisse(id, name),
    onSuccess: () => {
      toast.success("Caisse créée avec succès")
      queryClient.invalidateQueries({ queryKey: ["caisses"] })
    },
    onError: () => toast.error("Erreur lors de la création de la caisse"),
  })


  const storeHours = useQuery({
    queryKey: ["storeHour"],
    queryFn: () => fStoreHours().then(response => response.data.storeHours)
  })
  if (storeHours.isError) toast.error("Erreur lors du chargement des horaires");


  const saveHoraire = useMutation({
    mutationFn: (data: HoraireSchema) => createStoreHours(data),
    onSuccess: () => {
      toast.success("Horaires créés avec succès");
      queryClient.invalidateQueries({ queryKey: ['storeHour'] })
      handleCloseHoursDialog();
    },
    onError: () => toast.error("Erreur lors de la sauvegarde des horaires")
  })

  const editHoraire = useMutation({
    mutationFn: ({ id, data }: { id: number, data: HoraireSchema }) => updateStoreHours(id, data),
    onSuccess: () => {
      toast.success("Horaires mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ['storeHour'] })
      handleCloseHoursDialog();
    },
    onError: () => toast.error("Erreur lors de la sauvegarde des horaires")
  })

  const removeHoraire = useMutation({
    mutationFn: (id: number) => deleteStoreHours(id),
    onSuccess: () => {
      toast.success("Horaires supprimés avec succès");
      queryClient.invalidateQueries({ queryKey: ['storeHour'] })

    },
    onError: () => toast.error("Erreur lors de la suppression des horaires"),
  })



  const handleOpenDialog = (store: StoreModel | null = null) => {
    setEditingStore(store);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStore(null);
  };

  const handleSave = async (data: Schema) => {
    if (editingStore?.id) editStore.mutate({ id: editingStore.id, data })
    else addStore.mutate(data)

  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce magasin ?")) {
      return;
    }
    removeStore.mutate(id)
  };

  const handleOpenCashRegisters = (store: StoreModel) => {
    setEditingStore(store);
    setCashRegistersDialog(true);
  };

  const handleCloseCashRegisters = () => {
    setCashRegistersDialog(false);
    setEditingStore(null);
  };


  const handleAddCashRegister = async (data: CaisseSchema) => {
    if (!editingStore?.id) return // throw new Error("no id provided")
    addCaisse.mutate({ id: editingStore.id, name: data })

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


  const handleSaveHours = async (data: HoraireSchema) => {
    if (!editingHours?.id) saveHoraire.mutate(data)
    else editHoraire.mutate({ id: editingHours.id, data })

  };

  const handleDeleteHours = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ces horaires ?"))
      removeHoraire.mutate(id)
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
      </Tabs>
      {/* Contenu des onglets */}
      {tabValue === 0 && (
        <>
          {/* Statistiques rapides */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCardNoIcon
                title="Magasins total"
                value={stores.data?.length || 0}
                color="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCardNoIcon
                title="Magasins actifs"
                value={stores.data?.filter((store) => store.is_active).length || 0}
                color="success.main"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCardNoIcon
                title="Caisses total"
                value={stores.data?.reduce(
                  (sum, store) => sum + (store.caisses?.length || 0),
                  0,
                ) || 0}
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
                {stores.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : stores.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Aucun magasin trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  stores.data?.map((store) => (
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
                        {store.manager?.username ? (
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
                          {store.caisses?.length || 0} caisse(s)
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

          {storeHours.isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : storeHours.data?.length === 0 ? (
            <Alert severity="info">
              Aucun horaire d'ouverture configuré. Cliquez sur "Ajouter des
              horaires" pour commencer.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {Object.entries(
                storeHours.data?.reduce(
                  (acc: Record<number, StoreHoursModel[]>, hours) => {
                    if (!acc[hours.store_id]) {
                      acc[hours.store_id] = [];
                    }
                    acc[hours.store_id].push(hours);
                    return acc;
                  },
                  {}
                )
              ).map(([storeId, hours]) => {
                const currentStore = stores.data?.find((s) => s.id === parseInt(storeId))
                if (currentStore)
                  return (
                    <Grid size={{ xs: 12, md: 6 }} key={storeId}>
                      <StoreOpen
                        store={currentStore}
                        hours={hours}
                        handleOpenHoursDialog={handleOpenHoursDialog}
                        handleDeleteHours={handleDeleteHours}
                      />
                    </Grid>)
              })}
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
        <DialogTitle>Caisses - {editingStore?.name}</DialogTitle>
        <DialogContent>
          <CreateCaisseForm formId="createCaisse" onSubmit={handleAddCashRegister} />
          {/* <Box sx={{ mb: 2, mt: 2 }}>
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
          </Box> */}

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
                {caisses.isLoading ?
                  (<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                  </Box>) :


                  caisses.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Aucune caisse
                      </TableCell>
                    </TableRow>
                  ) : (
                    caisses.data?.map((register) => (
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
            managers={users.data || []}
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
            stores={stores.data || []}
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