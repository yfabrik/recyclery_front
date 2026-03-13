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
import { useState } from "react";
import { toast } from "react-toastify";
import type {
  ScheduleModel,
  StoreModel
} from "../../../interfaces/Models";
import {
  createStore,
  deleteStore,
  fetchStores as fStore,
  updateStore
} from "../../../services/api/store";
import {
  createStoreHours,
  deleteStoreHours,
  updateStoreHours
} from "../../../services/api/storeHours";
import { fetchUsers as fUsers } from "../../../services/api/users";
import { CardStore } from "../../CardStore";
import { CreateCaisseDialog } from "../../CreateCaisseDialog";
import { StatCardNoIcon } from "../../StatCard";
import { StoreForm, type Schema } from "../../forms/StoreForm";
import type { Schema as HoraireSchema } from "../../forms/StoreOpeningForm";
import { StoreOpeningForm } from "../../forms/StoreOpeningForm";
import { emptyStringToNull } from "../../../services/zodTransform";
import { Loading } from "../../Loading";

const StoresTab = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreModel | null>(null);
  const [cashRegistersDialog, setCashRegistersDialog] = useState(false);

  const [hoursDialogOpen, setHoursDialogOpen] = useState(false);
  const [editingHours, setEditingHours] = useState<Partial<ScheduleModel> | null>(
    null,
  );

  const queryClient = useQueryClient()

  const stores = useQuery({
    queryKey: ["stores", "horaires"],
    queryFn: () => fStore({ include: ["horaires"] }).then(response => response.data.stores)
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


  const saveHoraire = useMutation({
    mutationFn: (data: HoraireSchema) => createStoreHours(data),
    onSuccess: () => {
      toast.success("Horaires créés avec succès");
      queryClient.invalidateQueries({ queryKey: ["stores", "horaires"] })
      handleCloseHoursDialog();
    },
    onError: () => toast.error("Erreur lors de la sauvegarde des horaires")
  })

  const editHoraire = useMutation({
    mutationFn: ({ id, data }: { id: number, data: HoraireSchema }) => updateStoreHours(id, data),
    onSuccess: () => {
      toast.success("Horaires mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["stores", "horaires"] })
      handleCloseHoursDialog();
    },
    onError: () => toast.error("Erreur lors de la sauvegarde des horaires")
  })

  const removeHoraire = useMutation({
    mutationFn: (id: number) => deleteStoreHours(id),
    onSuccess: () => {
      toast.success("Horaires supprimés avec succès");
      queryClient.invalidateQueries({ queryKey: ["stores", "horaires"] })

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

  const handleDelete = async (store: StoreModel) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce magasin ?")) {
      return;
    }
    removeStore.mutate(store.id)
  };

  const handleOpenCashRegisters = (store: StoreModel) => {
    setEditingStore(store);
    setCashRegistersDialog(true);
  };

  const handleCloseCashRegisters = () => {
    setCashRegistersDialog(false);
    setEditingStore(null);
  };



  // Fonctions pour gérer les horaires d'ouverture
  const handleOpenHoursDialog = (
    hours: ScheduleModel | null = null,
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
        <Typography variant="h5" fontWeight='bold'>Gestion des Magasins</Typography>
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
      {editingStore &&
        <CreateCaisseDialog store={editingStore} onClose={handleCloseCashRegisters} open={cashRegistersDialog} />
      }

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
            defaultValues={editingStore ? emptyStringToNull(editingStore) : undefined}
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
            defaultValues={editingHours ? emptyStringToNull(editingHours) : undefined}
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