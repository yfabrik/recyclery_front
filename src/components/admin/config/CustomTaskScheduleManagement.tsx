import {
  Add,
  CalendarToday,
  Delete,
  Edit,
  Schedule,
  Store,
  Timer,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  getRecurrencePatternLabel,
} from "../../../constants/recurrencePatterns";
import { getTaskPriority } from "../../../constants/taskPriorities";
import { useQueryErrorToast } from "../../../hooks/useQueryErrorToast";
import { useUrlFilters } from "../../../hooks/useUrlFilters";
import type { ScheduleModel, StoreModel } from "../../../interfaces/Models";
import {
  createPlanning,
  deletePlanning,
  getPlanning,
  updatePlanning,
} from "../../../services/api/planning";
import { fetchStores } from "../../../services/api/store";
import {
  formatTime,
  weekdayFromDate,
  weekdayLabel,
} from "../../../services/dateService";
import {
  scheduleCustomPayloadFromForm,
  scheduleToCustomFormValues,
} from "../../../services/mapper/schedule";
import type { PlanningFormOutput, PlanningFormValues } from "../../../services/schema/schedule";
import {
  CUSTOM_TASK_FILTER_FORM_DEFAULTS,
  customTaskFilterFormSchema,
} from "../../../services/schema/task";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../../../utils/apiToastMessage";
import { CustomTaskFiltersForm } from "../../forms/filters/CustomTaskFiltersForm";
import { PlaningForm } from "../../forms/planningForm";
import { Loading } from "../../Loading";

const CUSTOM_SCHEDULES_KEY = ["custom-schedules"] as const;

const CustomTaskScheduleManagement = () => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleModel | null>(
    null,
  );
  const [formDefaults, setFormDefaults] = useState<Partial<PlanningFormValues> | null>(null);
  const { filters, setFilters } = useUrlFilters({
    schema: customTaskFilterFormSchema,
    defaults: CUSTOM_TASK_FILTER_FORM_DEFAULTS,
  });

  const stores = useQuery({
    queryKey: ["stores", { active: true }],
    queryFn: () => fetchStores({ active: true }).then((res) => res.data.data),
  });
  useQueryErrorToast(stores.error, "Erreur lors du chargement des magasins");

  const schedulesQuery = useQuery({
    queryKey: CUSTOM_SCHEDULES_KEY,
    queryFn: () =>
      getPlanning({ category: "custom" }).then((res) => res.data.data),
  });
  useQueryErrorToast(
    schedulesQuery.error,
    "Erreur lors du chargement des tâches personnalisées",
  );

  const addSchedule = useMutation({
    mutationFn: (data: PlanningFormOutput) =>
      createPlanning(scheduleCustomPayloadFromForm(data)),
    onSuccess: (data) => {
      toast.success(
        getApiSuccessMessage(data, "Tâche personnalisée créée avec succès"),
      );
      queryClient.invalidateQueries({ queryKey: CUSTOM_SCHEDULES_KEY });
      handleCloseDialog();
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
  });

  const updateSchedule = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PlanningFormOutput }) =>
      updatePlanning(id, scheduleCustomPayloadFromForm(data)),
    onSuccess: (data) => {
      toast.success(
        getApiSuccessMessage(
          data,
          "Tâche personnalisée mise à jour avec succès",
        ),
      );
      queryClient.invalidateQueries({ queryKey: CUSTOM_SCHEDULES_KEY });
      handleCloseDialog();
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
  });

  const deleteSchedule = useMutation({
    mutationFn: (id: number) => deletePlanning(id),
    onSuccess: (data) => {
      toast.success(
        getApiSuccessMessage(
          data,
          "Tâche personnalisée supprimée avec succès",
        ),
      );
      queryClient.invalidateQueries({ queryKey: CUSTOM_SCHEDULES_KEY });
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Erreur lors de la suppression")),
  });

  const getStoreName = (storeId?: number | null) => {
    if (!storeId) return null;
    return stores.data?.find((s) => s.id === storeId)?.name;
  };

  const handleOpenDialog = (schedule: ScheduleModel | null = null) => {
    setEditingSchedule(schedule);
    setFormDefaults(schedule ? scheduleToCustomFormValues(schedule) : null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSchedule(null);
  };

  const handleSave = (data: PlanningFormOutput) => {
    if (editingSchedule?.id) {
      updateSchedule.mutate({ id: editingSchedule.id, data });
    } else {
      addSchedule.mutate(data);
    }
  };

  const handleDelete = (scheduleId: ScheduleModel["id"]) => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette tâche personnalisée ?",
      )
    ) {
      return;
    }
    deleteSchedule.mutate(scheduleId);
  };

  const getWeeklyDayLabel = (schedule: ScheduleModel) => {
    if (typeof schedule.day_of_week === "number") {
      return weekdayLabel(schedule.day_of_week);
    }
    if (schedule.scheduled_date) {
      return weekdayLabel(weekdayFromDate(schedule.scheduled_date));
    }
    return null;
  };

  const searchTerm = filters.search ?? "";

  const filteredSchedules = (schedulesQuery.data ?? []).filter((schedule) => {
    const matchesSearch =
      schedule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore =
      !filters.store_id || schedule.store_id === filters.store_id;
    const matchesPriority =
      filters.priority === "all" || schedule.priority === filters.priority;
    const matchesRecurrence =
      filters.recurrence === "all" ||
      (filters.recurrence === "none"
        ? !schedule.recurrence_pattern
        : schedule.recurrence_pattern === filters.recurrence);

    return (
      matchesSearch && matchesStore && matchesPriority && matchesRecurrence
    );
  });

  const hasActiveFilters =
    searchTerm !== "" ||
    !!filters.store_id ||
    filters.priority !== "all" ||
    filters.recurrence !== "all";

  const isSaving = addSchedule.isPending || updateSchedule.isPending;

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
            Tâches personnalisées
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Définissez et organisez les modèles de tâches personnalisées du
            planning
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Nouvelle tâche
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <CustomTaskFiltersForm
          stores={stores.data ?? []}
          defaultValues={filters}
          onChange={setFilters}
          onRefresh={() => schedulesQuery.refetch()}
        />
      </Paper>

      <Loading isLoading={schedulesQuery.isLoading}>
        <Grid container spacing={3}>
          {filteredSchedules.map((schedule) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={schedule.id}>
              <ScheduleCard
                schedule={schedule}
                disabled={deleteSchedule.isPending}

                storeName={getStoreName(schedule.store_id) ?? "-"}
                weeklyDayLabel={getWeeklyDayLabel(schedule) ?? "-"}
                handleDelete={handleDelete}
                handleOpenDialog={handleOpenDialog} />
            </Grid>
          ))}
        </Grid>

        {!schedulesQuery.isLoading && filteredSchedules.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="textSecondary">
              Aucune tâche personnalisée trouvée
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {hasActiveFilters
                ? "Essayez de modifier vos critères de recherche"
                : "Commencez par ajouter une tâche personnalisée"}
            </Typography>
          </Box>
        )}
      </Loading>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingSchedule
            ? "Modifier la tâche personnalisée"
            : "Nouvelle tâche personnalisée"}
        </DialogTitle>
        <DialogContent>
          <PlaningForm
            formId="customScheduleForm"
            stores={(stores.data ?? []) as StoreModel[]}
            defaultValues={formDefaults ?? undefined}
            onSubmit={handleSave}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            type="submit"
            form="customScheduleForm"
            variant="contained"
            loading={isSaving}
          >
            {editingSchedule ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CustomTaskScheduleManagement;

interface ScheduleCardProps {
  schedule: ScheduleModel
  handleOpenDialog: (s: ScheduleModel) => void
  handleDelete: (id: ScheduleModel["id"]) => void
  storeName: string
  weeklyDayLabel: string
  // getPriorityInfo: (p: ScheduleModel["priority"]) => string
  // getStoreName: (id: StoreModel["id"]) => StoreModel["name"] | null
  // getWeeklyDayLabel: (s: ScheduleModel) => string
  // getRecurrencePatternLabel: (s: ScheduleModel) => string
  disabled: boolean
}
const ScheduleCard = ({ schedule, handleDelete, handleOpenDialog, disabled, storeName, weeklyDayLabel
  // getPriorityInfo, getStoreName, getWeeklyDayLabel, getRecurrencePatternLabel
}: ScheduleCardProps) => {

  const priorityInfo = getTaskPriority(schedule.priority ?? "medium");


  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              component="div"
              fontWeight="bold"
              gutterBottom
            >
              {schedule.name}
            </Typography>
            {schedule.notes && (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mb: 1 }}
              >
                {schedule.notes}
              </Typography>
            )}
          </Box>
          <Box>
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(schedule)}
              color="primary"
            >
              <Edit />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDelete(schedule.id)}
              color="error"
              disabled={disabled}
            >
              <Delete />
            </IconButton>
          </Box>
        </Box>

        <Stack spacing={1}>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Chip label="Personnalisée" color="info" size="small" />
            {priorityInfo &&
              <Chip
                label={priorityInfo.label}
                color={
                  priorityInfo.color
                }
                size="small"
                variant="outlined"
              />}
          </Box>

          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Timer fontSize="small" color="action" />
            <Typography variant="body2">
              {
                `${formatTime(new Date(schedule.start_time))} - ${formatTime(new Date(schedule.end_time))}`
              }
            </Typography>
          </Box>

          {storeName && (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Store fontSize="small" color="action" />
              <Typography variant="body2" noWrap>
                {storeName}
              </Typography>
            </Box>
          )}

          {weeklyDayLabel && (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <CalendarToday fontSize="small" color="action" />
              <Typography
                variant="body2"
                sx={{ textTransform: "capitalize" }}
              >
                {weeklyDayLabel}
              </Typography>
            </Box>
          )}

          {schedule.recurrence_pattern && (
            <Chip
              label={getRecurrencePatternLabel(schedule.recurrence_pattern)}
              size="small"
              color="info"
              variant="outlined"
              icon={<Schedule />}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}