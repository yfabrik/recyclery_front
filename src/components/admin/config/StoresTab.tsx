import {
  Add,
  CheckCircle,
  PointOfSale,
  Schedule,
  Store,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { useQueryErrorToast } from "../../../hooks/useQueryErrorToast";
import type { ScheduleModel, StoreModel } from "../../../interfaces/Models";
import {
  createStore,
  deleteStore,
  fetchStores as fStore,
  updateStore,
} from "../../../services/api/store";
import {
  createStoreHours,
  deleteStoreHours,
  updateStoreHours,
} from "../../../services/api/storeHours";
import { fetchUsers as fUsers } from "../../../services/api/users";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../../../utils/apiToastMessage";
import { CardStore } from "../../CardStore";
import { CreateCaisseDialog } from "../../CreateCaisseDialog";
import { StoreForm } from "../../forms/StoreForm";
import type { Schema as HoraireSchema, StoreOpeningFormValues } from "../../forms/StoreOpeningForm";
import { StoreOpeningForm } from "../../forms/StoreOpeningForm";
import { Loading } from "../../Loading";
import { StatCard } from "../../StatCard";
import {
  storeHoursPayloadFromForm,
  storeHoursToFormValues,
} from "../../../services/mapper/schedule";
import { storePayloadFromForm, storeToFormValues } from "../../../services/mapper/store";
import type { StoreFormOutput, StoreFormValues } from "../../../services/schema/store";

const StoresTab = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<StoreModel["id"] | null>(null);
  const [storeFormDefaults, setStoreFormDefaults] =
    useState<Partial<StoreFormValues> | null>(null);
  const [cashRegisterStore, setCashRegisterStore] = useState<StoreModel | null>(
    null,
  );
  const [cashRegistersDialog, setCashRegistersDialog] = useState(false);
  const [hoursDialogOpen, setHoursDialogOpen] = useState(false);
  const [editingHoursId, setEditingHoursId] = useState<ScheduleModel["id"] | null>(null);
  const [hoursFormDefaults, setHoursFormDefaults] =
    useState<Partial<StoreOpeningFormValues> | null>(null);
  const queryClient = useQueryClient();
  const stores = useQuery({
    queryKey: ["stores", "horaires"],
    queryFn: () =>
      fStore({ include: ["horaires"] }).then((response) => response.data.data),
  });
  useQueryErrorToast(stores.error, "Erreur lors du chargement des magasins");

  const editStore = useMutation({
    mutationFn: ({ id, data }: { id: StoreModel["id"]; data: StoreFormOutput }) =>
      updateStore(id, storePayloadFromForm(data)),
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
    onSuccess: (data) => {
      toast.success(
        getApiSuccessMessage(data, "Magasin mis à jour avec succès"),
      );
      handleCloseDialog();
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
  const addStore = useMutation({
    mutationFn: (data: StoreFormOutput) => createStore(storePayloadFromForm(data)),
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Magasin créé avec succès"));
      handleCloseDialog();
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
  const removeStore = useMutation({
    mutationFn: (id: number) => deleteStore(id),
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Erreur lors de la suppression")),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Magasin supprimé avec succès"));
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
  const users = useQuery({
    queryKey: ["users"],
    queryFn: () =>
      fUsers({ role: "admin" }).then((response) => response.data.data),
  });
  useQueryErrorToast(users.error, "Erreur lors du chargement des utilisateurs");


  const saveHoraire = useMutation({
    mutationFn: (data: HoraireSchema) => createStoreHours(storeHoursPayloadFromForm(data)),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Horaires créés avec succès"));
      queryClient.invalidateQueries({ queryKey: ["stores", "horaires"] });
      handleCloseHoursDialog();
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "Erreur lors de la sauvegarde des horaires"),
      ),
  });
  const editHoraire = useMutation({
    mutationFn: ({ id, data }: { id: ScheduleModel["id"]; data: HoraireSchema }) =>
      updateStoreHours(id, storeHoursPayloadFromForm(data)),
    onSuccess: (data) => {
      toast.success(
        getApiSuccessMessage(data, "Horaires mis à jour avec succès"),
      );
      queryClient.invalidateQueries({ queryKey: ["stores", "horaires"] });
      handleCloseHoursDialog();
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "Erreur lors de la sauvegarde des horaires"),
      ),
  });
  const removeHoraire = useMutation({
    mutationFn: (id: ScheduleModel["id"]) => deleteStoreHours(id),
    onSuccess: (data) => {
      toast.success(
        getApiSuccessMessage(data, "Horaires supprimés avec succès"),
      );
      queryClient.invalidateQueries({ queryKey: ["stores", "horaires"] });
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "Erreur lors de la suppression des horaires"),
      ),
  });
  const handleOpenDialog = (store: StoreModel | null = null) => {
    setEditingStoreId(store?.id ?? null);
    setStoreFormDefaults(store ? storeToFormValues(store) : null);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStoreId(null);
    setStoreFormDefaults(null);
  };
  const handleSave = async (data: StoreFormOutput) => {
    if (editingStoreId) editStore.mutate({ id: editingStoreId, data });
    else addStore.mutate(data);
  };
  const handleDelete = async (store: StoreModel) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce magasin ?")) {
      return;
    }
    removeStore.mutate(store.id);
  };
  const handleOpenCashRegisters = (store: StoreModel) => {
    setCashRegisterStore(store);
    setCashRegistersDialog(true);
  };
  const handleCloseCashRegisters = () => {
    setCashRegistersDialog(false);
    setCashRegisterStore(null);
  };
  // Fonctions pour gérer les horaires d'ouverture
  const handleOpenHoursDialog = (
    hours: ScheduleModel | null = null,
    store_id: number | null = null,
  ) => {
    setEditingHoursId(hours?.id ?? null);
    if (hours) {
      setHoursFormDefaults(storeHoursToFormValues(hours));
    } else {
      setHoursFormDefaults(store_id ? { store_id } : null);
    }
    setHoursDialogOpen(true);
  };
  const handleCloseHoursDialog = () => {
    setHoursDialogOpen(false);
    setEditingHoursId(null);
    setHoursFormDefaults(null);
  };
  const handleSaveHours = async (data: HoraireSchema) => {

    if (!editingHoursId) saveHoraire.mutate(data);
    else editHoraire.mutate({ id: editingHoursId, data });
  };
  const handleDeleteHours = async (id: ScheduleModel["id"]) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ces horaires ?"))
      removeHoraire.mutate(id);
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
        <Typography variant="h5" fontWeight="bold">
          Gestion des Magasins
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nouveau Magasin
        </Button>
      </Box>
      {/* Statistiques rapides */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Magasins total"
            value={stores.data?.length || 0}
            icon={<Store />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Magasins actifs"
            value={stores.data?.filter((store) => store.is_active).length || 0}
            icon={<CheckCircle />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Caisses total"
            value={
              stores.data?.reduce(
                (sum, store) => sum + (store.caisses?.length || 0),
                0,
              ) || 0
            }
            icon={<PointOfSale />}
            color="info"
          />
        </Grid>
      </Grid>
      <Loading isLoading={stores.isLoading}>
        {/* Table des magasins */}
        <Grid container spacing={3}>
          {stores.data?.map((store) => (
            <Grid size={{ xs: 12, md: 6 }} key={store.id}>
              <CardStore
                store={store}
                handleOpenCashRegisters={handleOpenCashRegisters}
                handleOpenHoursDialog={handleOpenHoursDialog}
                handleDeleteHours={handleDeleteHours}
                handleOpenDialog={handleOpenDialog}
                handleDeleteStore={handleDelete}
              />
            </Grid>
          ))}
        </Grid>
      </Loading>
      {/* Dialog de gestion des caisses */}
      {cashRegisterStore && (
        <CreateCaisseDialog
          store={cashRegisterStore}
          onClose={handleCloseCashRegisters}
          open={cashRegistersDialog}
        />
      )}
      {/* Dialog de création/édition */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingStoreId ? "Modifier le magasin" : "Nouveau magasin"}
        </DialogTitle>
        <DialogContent>
          <StoreForm
            formId="createStore"
            onSubmit={handleSave}
            managers={users.data || []}
            defaultValues={storeFormDefaults ?? undefined}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button type="submit" form="createStore" variant="contained">
            {editingStoreId ? "Mettre à jour" : "Créer"}
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
            {editingHoursId ? "Modifier les horaires" : "Nouveaux horaires"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <StoreOpeningForm
            formId="openHours"
            onSubmit={handleSaveHours}
            stores={stores.data || []}
            defaultValues={hoursFormDefaults ?? undefined}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHoursDialog}>Annuler</Button>
          <Button type="submit" form="openHours" variant="contained">
            {editingHoursId ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default StoresTab;
