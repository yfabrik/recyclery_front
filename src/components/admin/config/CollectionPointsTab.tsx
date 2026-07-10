import { Add, Schedule } from "@mui/icons-material";
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
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../../../utils/apiToastMessage";
import {
  type CollectionPointModel,
  type ScheduleModel,
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
  updatePointPresence,
} from "../../../services/api/collectionPointPresence";
import { fetchStores } from "../../../services/api/store";
import { CardCollectionPoint } from "../../CardCollectionPoint";
import {
  CollectionPointForm,
  type Schema,
  type SchemaInputValues,
} from "../../forms/CollectionPointForm";
import type {
  PresencePointFormValues,
  Schema as PresenceSchema,
} from "../../forms/PresencePointForm";
import { PresencePointForm } from "../../forms/PresencePointForm";
import type { CollectionPointDataInput } from "@recyclerie/api/schemas/collectionPoints";
import { Loading } from "../../Loading";
import type { CreateCollectionPointPresenceDataInput } from "@recyclerie/api/schemas/schedules";

function collectionPointToFormValues(
  point: CollectionPointModel,
): Partial<SchemaInputValues> {
  return {
    name: point.name,
    address: point.address ?? "",
    city: point.city ?? "",
    postal_code: point.postal_code ?? "",
    contact_person: point.contact_person ?? "",
    contact_phone: point.contact_phone ?? "",
    contact_email: point.contact_email ?? "",
    notes: point.notes ?? "",
    is_active: point.is_active,
    recyclery_id: point.recyclery_id ?? "",
  };
}
function collectionPointPayloadFromForm(data: Schema): CollectionPointDataInput {
  return {
    ...data,
  };
}
function presenceToFormValues(
  presence: ScheduleModel | null,
  pointId: CollectionPointModel["id"] | null,//TODO ScheduleModel["collection_point_id"] ?
):
  | (Partial<PresencePointFormValues>)
  | null {
  if (!presence && !pointId) return null;
  const dayOfWeek = presence?.scheduled_date ? new Date(presence.scheduled_date).getDay() : undefined
  // const dayOfWeek = presence?.day_of_week ?? (scheduledDate != null ? new Date(scheduledDate).getDay() : undefined);
  return {
    collection_point_id:
      presence?.collection_point_id != null
        ? Number(presence.collection_point_id)
        : (pointId ?? undefined),
    ...(typeof presence?.day_of_week === "number"
      ? { day_of_week: presence.day_of_week }
      : dayOfWeek ? { day_of_week: dayOfWeek } : {}),
    is_present: presence?.is_recurring ?? true,
    start_time: presence?.start_time
      ? new Date(presence.start_time)
      : undefined,
    end_time: presence?.end_time ? new Date(presence.end_time) : undefined,
    notes: presence?.notes ?? "",
  };
}
const CollectionPointsTab = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPointId, setEditingPointId] = useState<CollectionPointModel["id"] | null>(null);
  const [pointFormDefaults, setPointFormDefaults] =
    useState<Partial<SchemaInputValues> | null>(null);
  const [presenceDialogOpen, setPresenceDialogOpen] = useState(false);
  const [editingPresenceId, setEditingPresenceId] = useState<ScheduleModel["id"] | null>(
    null,
  );
  const [presenceFormDefaults, setPresenceFormDefaults] = useState<
    | (Partial<PresencePointFormValues>)
    | null
  >(null);
  const queryClient = useQueryClient();
  const collectionPoints = useQuery({
    queryKey: ["points"],
    queryFn: () => fCol().then((response) => response.data.data || []),
  });
  useQueryErrorToast(
    collectionPoints.error,
    "Erreur lors du chargement des points de collecte",
  );
  const updatePoint = useMutation({
    mutationFn: ({ id, data }: { id: CollectionPointModel["id"]; data: Schema }) =>
      updateCollectionPoint(id, collectionPointPayloadFromForm(data)),
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
    onSuccess: (data) => {
      toast.success(
        getApiSuccessMessage(data, "Point de collecte mis à jour avec succès"),
      );
      handleCloseDialog();
      queryClient.invalidateQueries({ queryKey: ["points"] });
    },
  });
  const createPoint = useMutation({
    mutationFn: (data: Schema) => createCollectionPoint(collectionPointPayloadFromForm(data)),
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
    onSuccess: (data) => {
      toast.success(
        getApiSuccessMessage(data, "Point de collecte créé avec succès"),
      );
      handleCloseDialog();
      queryClient.invalidateQueries({ queryKey: ["points"] });
    },
  });
  const deletePoint = useMutation({
    mutationFn: (id: CollectionPointModel["id"]) => deleteCollectionPoint(id),
    onSuccess: (data) => {
      toast.success(
        getApiSuccessMessage(data, "Point de collecte supprimé avec succès"),
      );
      queryClient.invalidateQueries({ queryKey: ["points"] });
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Erreur lors de la suppression")),
  });
  const recycleries = useQuery({
    queryKey: ["stores"],
    queryFn: () => fetchStores().then((response) => response.data.data),
  });
  useQueryErrorToast(
    recycleries.error,
    "Erreur lors du chargement des recycleries",
  );
  const handleOpenDialog = (point: CollectionPointModel | null = null) => {
    setEditingPointId(point?.id ?? null);
    setPointFormDefaults(point ? collectionPointToFormValues(point) : null);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPointId(null);
    setPointFormDefaults(null);
  };
  const handleSave = async (data: Schema) => {
    const payload = collectionPointPayloadFromForm(data);
    if (editingPointId)
      updatePoint.mutate({ id: editingPointId, data: payload });
    else createPoint.mutate(payload);
  };
  const handleDelete = async (point: CollectionPointModel) => {
    if (
      window.confirm(`Êtes-vous sûr de vouloir supprimer "${point.name}" ?`)
    ) {
      deletePoint.mutate(point.id);
    }
  };
  const handleOpenPresenceDialog = (
    presence: ScheduleModel | null = null,
    pointId: CollectionPointModel["id"] | null = null,
  ) => {
    setEditingPresenceId(presence?.id ?? null);
    setPresenceFormDefaults(presenceToFormValues(presence, pointId));
    setPresenceDialogOpen(true);
  };
  const handleClosePresenceDialog = () => {
    setPresenceDialogOpen(false);
    setEditingPresenceId(null);
    setPresenceFormDefaults(null);
  };

  const presencePayloadFromForm = (data: PresenceSchema): CreateCollectionPointPresenceDataInput => ({
    ...data
  });
  const updatePresence = useMutation({
    mutationFn: ({ id, data }: { id: ScheduleModel["id"]; data: PresenceSchema }) =>
      updatePointPresence(id, presencePayloadFromForm(data)),
    onError: (error) =>
      toast.error(
        getApiErrorMessage(
          error,
          "Erreur lors de la sauvegarde de la présence",
        ),
      ),
    onSuccess: (data) => {
      toast.success(
        getApiSuccessMessage(data, "Présence mise à jour avec succès"),
      );
      handleClosePresenceDialog();
      queryClient.invalidateQueries({ queryKey: ["points"] });
    },
  });
  const createPresence = useMutation({
    mutationFn: (data: PresenceSchema) => createPointPresence(presencePayloadFromForm(data)),
    onError: (error) =>
      toast.error(
        getApiErrorMessage(
          error,
          "Erreur lors de la sauvegarde de la présence",
        ),
      ),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Présence créée avec succès"));
      handleClosePresenceDialog();
      queryClient.invalidateQueries({ queryKey: ["points"] });
    },
  });
  const deletePresence = useMutation({
    mutationFn: (id: ScheduleModel["id"]) => deletePointPresence(id),
    onError: (error) =>
      toast.error(
        getApiErrorMessage(
          error,
          "Erreur lors de la suppression de la présence",
        ),
      ),
    onSuccess: (data) => {
      toast.success(
        getApiSuccessMessage(data, "Présence supprimée avec succès"),
      );
      queryClient.invalidateQueries({ queryKey: ["points"] });
    },
  });
  const handleSavePresence = async (data: PresenceSchema) => {
    if (editingPresenceId)
      updatePresence.mutate({ id: editingPresenceId, data });
    else createPresence.mutate(data);
  };
  const handleDeletePresence = async (id: ScheduleModel["id"]) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette présence ?")) {
      deletePresence.mutate(id);
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
        <Typography variant="h5" fontWeight="bold">
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
      <Loading isLoading={collectionPoints.isLoading}>
        <Grid container spacing={3}>
          {collectionPoints.data?.map((point) => (
            <Grid size={{ xs: 12, md: 6 }} key={point.id}>
              <CardCollectionPoint
                key={point.id}
                point={point}
                handleOpenDialog={handleOpenDialog}
                handleDeletePoint={handleDelete}
                handleDeleteHours={handleDeletePresence}
                handleOpenHoursDialog={handleOpenPresenceDialog}
              />
            </Grid>
          ))}
        </Grid>
      </Loading>
      {/* Dialog de création/édition */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPointId
            ? "Modifier le Point de Collecte"
            : "Nouveau Point de Collecte"}
        </DialogTitle>
        <DialogContent>
          <CollectionPointForm
            formId="collectionPointForm"
            recycleries={recycleries.data || []}
            onSubmit={handleSave}
            defaultValues={pointFormDefaults ?? undefined}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            type="submit"
            form="collectionPointForm"
            variant="contained"
            loading={updatePoint.isPending || createPoint.isPending}
          >
            {editingPointId ? "Mettre à jour" : "Créer"}
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
            {editingPresenceId ? "Modifier la présence" : "Nouvelle présence"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <PresencePointForm
            formId="presencePointForm"
            collectionPoints={collectionPoints.data || []}
            onSubmit={handleSavePresence}
            defaultValues={presenceFormDefaults ?? undefined}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePresenceDialog}>Annuler</Button>
          <Button
            type="submit"
            form="presencePointForm"
            variant="contained"
            loading={updatePresence.isPending || createPresence.isPending}
          >
            {editingPresenceId ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default CollectionPointsTab;
