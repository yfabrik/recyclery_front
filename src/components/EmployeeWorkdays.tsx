import { CalendarToday, Save } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../utils/apiToastMessage";
import {
  addWorkdaysToUser,
  getUserWorkdays,
  type WorkdaysFormPayload,
} from "../services/api/users";
import { WORKDAY_TIME_SLOTS } from "../constants/workdayTimeSlots";
import { EmployeeWorkdaysForm } from "./forms/EmployeeWorkdaysForm";
import { Loading } from "./Loading";

interface EmployeeWorkdaysProps {
  employeeId: number;
  employeeName: string;
  onClose: () => void;
  onSave: () => void;
}
const EmployeeWorkdays = ({
  employeeId,
  employeeName,
  onClose,
  onSave,
}: EmployeeWorkdaysProps) => {
  const daysOfWeek = [
    { key: "monday", label: "Lundi", short: "Lun" },
    { key: "tuesday", label: "Mardi", short: "Mar" },
    { key: "wednesday", label: "Mercredi", short: "Mer" },
    { key: "thursday", label: "Jeudi", short: "Jeu" },
    { key: "friday", label: "Vendredi", short: "Ven" },
    { key: "saturday", label: "Samedi", short: "Sam" },
    { key: "sunday", label: "Dimanche", short: "Dim" },
  ];

  const queryClient = useQueryClient();
  const workdaysQuery = useQuery({
    queryKey: ["workdays", employeeId],
    queryFn: () => getUserWorkdays(employeeId).then((res) => res.data.workdays),
  });
  useEffect(() => {
    if (workdaysQuery.isError) {
      toast.error(getApiErrorMessage(workdaysQuery.error, "Erreur lors du chargement des jours de travail"));
    }
  }, [workdaysQuery.isError]);

  const workdays = workdaysQuery.data ?? [];

  const addWorkdays = useMutation({
    mutationFn: (data: WorkdaysFormPayload) =>
      addWorkdaysToUser(employeeId, data),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Jours de travail mis à jour avec succès"));
      queryClient.invalidateQueries({ queryKey: ["workdays", employeeId] });
      onSave?.();
      onClose();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde des jours de travail"));
    },
  });

  const handleSave = async (data: WorkdaysFormPayload) => {
    addWorkdays.mutate(data);
  };

  return (
    <Loading isLoading={workdaysQuery.isLoading}>
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <CalendarToday />
            Jours de travail de {employeeName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configurez les jours et créneaux horaires de travail de cet employé
          </Typography>
        </Box>

        {/* En-tête avec les créneaux horaires */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Jour
                </Typography>
              </Grid>
              {WORKDAY_TIME_SLOTS.map((slot) => (
                <Grid size={{ xs: 4.5 }} key={slot.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {slot.icon}
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color={`${slot.color}.main`}
                    >
                      {slot.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
        <EmployeeWorkdaysForm
          formId="WorkdaysForm"
          onSubmit={handleSave}
          defaults={workdays} //TODO: fix this BEURK
        />

        <Box
          sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            loading={addWorkdays.isPending}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form="WorkdaysForm"
            variant="contained"
            loading={addWorkdays.isPending}
            startIcon={<Save />}
          >
            {addWorkdays.isPending ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </Box>
      </Box>
    </Loading>
  );
};

export default EmployeeWorkdays;
