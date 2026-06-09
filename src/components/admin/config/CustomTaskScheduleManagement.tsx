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
import type { ScheduleModel, StoreModel } from "../../../interfaces/Models";
import { PRIORITIES, RECURRENCE_PATTERNS } from "../../../interfaces/shared";
import {
  createPlanning,
  deletePlanning,
  getPlanning,
  updatePlanning,
} from "../../../services/api/planning";
import { fetchStores } from "../../../services/api/store";
import {
  CUSTOM_TASK_FILTER_DEFAULTS,
  CustomTaskFiltersForm,
  type CustomTaskFilters,
} from "../../forms/CustomTaskFiltersForm";
import { Loading } from "../../Loading";
import { PlaningForm, type Schema } from "../../forms/planningForm";

const CUSTOM_SCHEDULES_KEY = ["custom-schedules"] as const;

const CustomTaskScheduleManagement = () => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleModel | null>(
    null,
  );
  const [filters, setFilters] = useState<CustomTaskFilters>(
    CUSTOM_TASK_FILTER_DEFAULTS,
  );

  const stores = useQuery({
    queryKey: ["stores", { active: true }],
    queryFn: () => fetchStores({ active: true }).then((res) => res.data.stores),
  });
  if (stores.isError) toast.error("Erreur lors du chargement des magasins");

  const schedulesQuery = useQuery({
    queryKey: CUSTOM_SCHEDULES_KEY,
    queryFn: () =>
      getPlanning({ category: "custom" }).then((res) => res.data.schedules),
  });
  if (schedulesQuery.isError) {
    toast.error("Erreur lors du chargement des tâches personnalisées");
  }

  const addSchedule = useMutation({
    mutationFn: (data: Partial<ScheduleModel>) => createPlanning(data),
    onSuccess: () => {
      toast.success("Tâche personnalisée créée avec succès");
      queryClient.invalidateQueries({ queryKey: CUSTOM_SCHEDULES_KEY });
      handleCloseDialog();
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  const updateSchedule = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ScheduleModel> }) =>
      updatePlanning(id, data),
    onSuccess: () => {
      toast.success("Tâche personnalisée mise à jour avec succès");
      queryClient.invalidateQueries({ queryKey: CUSTOM_SCHEDULES_KEY });
      handleCloseDialog();
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  const deleteSchedule = useMutation({
    mutationFn: (id: number) => deletePlanning(id),
    onSuccess: () => {
      toast.success("Tâche personnalisée supprimée avec succès");
      queryClient.invalidateQueries({ queryKey: CUSTOM_SCHEDULES_KEY });
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const getStoreName = (storeId?: number | null) => {
    if (!storeId) return null;
    return stores.data?.find((s) => s.id === storeId)?.name;
  };

  const handleOpenDialog = (schedule: ScheduleModel | null = null) => {
    setEditingSchedule(schedule);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSchedule(null);
  };

  const handleSave = (data: Schema) => {
    const result: Partial<ScheduleModel> = {
      ...data,
      category: "custom",
      is_recurring: !!data.recurrence_pattern,
      recurrence_pattern: data.recurrence_pattern ?? undefined,
    };

    if (editingSchedule?.id) {
      updateSchedule.mutate({ id: editingSchedule.id, data: result });
    } else {
      addSchedule.mutate(result);
    }
  };

  const handleDelete = (scheduleId: number) => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette tâche personnalisée ?",
      )
    ) {
      return;
    }
    deleteSchedule.mutate(scheduleId);
  };

  const getPriorityInfo = (priority: string | null) => {
    return PRIORITIES.find((p) => p.value === priority) || PRIORITIES[1];
  };

  const getRecurrenceLabel = (pattern: string | null) => {
    return (
      RECURRENCE_PATTERNS.find((p) => p.value === pattern)?.label || "Aucune"
    );
  };

  const getWeeklyDayLabel = (schedule: ScheduleModel) => {
    if (schedule.day_of_week) {
      return schedule.day_of_week;
    }
    if (schedule.scheduled_date) {
      const day = new Date(schedule.scheduled_date).toLocaleDateString("fr-FR", {
        weekday: "long",
      });
      return day.charAt(0).toUpperCase() + day.slice(1);
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
          onChange={(values) =>
            setFilters((prev) => ({
              ...prev,
              ...values,
            }))
          }
          onRefresh={() => schedulesQuery.refetch()}
        />
      </Paper>

      <Loading isLoading={schedulesQuery.isLoading}>
        <Grid container spacing={3}>
          {filteredSchedules.map((schedule) => {
            const priorityInfo = getPriorityInfo(schedule.priority);
            const storeName = getStoreName(schedule.store_id);
            const weeklyDayLabel =
              schedule.recurrence_pattern === "weekly"
                ? getWeeklyDayLabel(schedule)
                : null;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={schedule.id}>
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
                          disabled={deleteSchedule.isPending}
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
                        <Chip
                          label={priorityInfo.label}
                          color={
                            priorityInfo.color as
                              | "success"
                              | "warning"
                              | "error"
                          }
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Timer fontSize="small" color="action" />
                        <Typography variant="body2">
                          {new Date(schedule.start_time).toLocaleString(
                            "fr-FR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}{" "}
                          -{" "}
                          {new Date(schedule.end_time).toLocaleString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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
                          label={getRecurrenceLabel(schedule.recurrence_pattern)}
                          size="small"
                          color="info"
                          variant="outlined"
                          icon={<Schedule />}
                        />
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
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
            defaultValues={
              editingSchedule
                ? {
                    name: editingSchedule.name,
                    category: "custom" as const,
                    scheduled_date: new Date(editingSchedule.scheduled_date),
                    start_time: new Date(editingSchedule.start_time),
                    end_time: new Date(editingSchedule.end_time),
                    priority: editingSchedule.priority ?? "medium",
                    store_id: editingSchedule.store_id ?? null,
                    recurrence_pattern: editingSchedule.recurrence_pattern ?? "",
                    notes: editingSchedule.notes ?? "",
                  }
                : { category: "custom" as const }
            }
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
