import { CalendarToday, Save, WbSunny, WbTwilight } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { WorkdaysModel } from "../interfaces/Models";
import { addWorkdaysToUser, getUserWorkdays } from "../services/api/users";
import { EmployeeWorkdaysForm } from "./forms/EmployeeWorkdaysForm";

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
  const [workdays, setWorkdays] = useState<WorkdaysModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const daysOfWeek = [
    { key: "monday", label: "Lundi", short: "Lun" },
    { key: "tuesday", label: "Mardi", short: "Mar" },
    { key: "wednesday", label: "Mercredi", short: "Mer" },
    { key: "thursday", label: "Jeudi", short: "Jeu" },
    { key: "friday", label: "Vendredi", short: "Ven" },
    { key: "saturday", label: "Samedi", short: "Sam" },
    { key: "sunday", label: "Dimanche", short: "Dim" },
  ];

  const timeSlots = [
    { key: "morning", label: "Matin", icon: <WbSunny />, color: "#ff9800" },
    {
      key: "afternoon",
      label: "Après-midi",
      icon: <WbTwilight />,
      color: "#2196f3",
    },
  ];

  useEffect(() => {
    fetchWorkdays();
  }, [employeeId]);

  useEffect(() => {
    console.log(workdays);
  }, [workdays]);
  const fetchWorkdays = async () => {
    try {
      setLoading(true);
      const response = await getUserWorkdays(employeeId);
      const existingWorkdays = response.data.workdays || [];
      const day = new Map([
        ["monday", "lundi"],
        ["tuesday", "mardi"],
        ["wednesday", "mercredi"],
        ["thurday", "jeudi"],
        ["friday", "vendredi"],
        ["saturday", "samedi"],
        ["sunday", "dimanche"],
      ]);

      const result = existingWorkdays.map((exist: WorkdaysModel) => {
        exist.day_of_week = day.get(exist.day_of_week) ?? "lundi";
        let [h, m] = exist.start_time.split(":");
        exist.start_time = new Date(new Date().setHours(h, m));
        let [hh, mm] = exist.end_time.split(":");
        exist.end_time = new Date(new Date().setHours(hh, mm));

        return exist;
      });

      setWorkdays(result);

      // Initialiser la structure complète des jours de travail
      // const initializedWorkdays = [];

      // daysOfWeek.forEach((day) => {
      //   timeSlots.forEach((slot) => {
      //     const existing = existingWorkdays.find(
      //       (w) => w.day_of_week === day.key && w.time_slot === slot.key,
      //     );

      //     initializedWorkdays.push({
      //       day_of_week: day.key,
      //       time_slot: slot.key,
      //       is_working: existing ? existing.is_working == 1 : false,
      //       start_time:
      //         existing?.start_time ||
      //         (slot.key === "morning" ? "08:00" : "13:30"),
      //       end_time:
      //         existing?.end_time ||
      //         (slot.key === "morning" ? "12:00" : "17:00"),
      //       notes: existing?.notes || "",
      //     });
      //   });
      // });

      // setWorkdays(initializedWorkdays);
    } catch (error) {
      console.error("Erreur lors du chargement des jours de travail:", error);
      toast.error("Erreur lors du chargement des jours de travail");
    } finally {
      setLoading(false);
    }
  };

  // const updateWorkday = (dayOfWeek, timeSlot, field, value) => {
  //   setWorkdays((prev) =>
  //     prev.map((workday) =>
  //       workday.day_of_week === dayOfWeek && workday.time_slot === timeSlot
  //         ? { ...workday, [field]: value }
  //         : workday,
  //     ),
  //   );
  // };

  const handleSave = async (data) => {
    try {
      setSaving(true);
      console.log("save", data);
      const today = new Map([
        ["lundi", "monday"],
        ["mardi", "tuesday"],
        ["mercredi", "wednesday"],
        ["jeudi", "thurday"],
        ["vendredi", "friday"],
        ["samedi", "saturday"],
        ["dimanche", "sunday"],
      ]);

      const activeWorkdays = Object.entries(data)
        .flatMap(([key, arr]) => {
          return arr.map((day) => ({
            ...day,
            day_of_week: today.get(day.day_of_week),
            week: key,
          }));
        })
        .filter((day) => day.is_working);

      // const activeWorkdays = workdays.filter((w) => w.is_working);
      await addWorkdaysToUser(employeeId, {
        workdays: activeWorkdays,
      });

      toast.success("Jours de travail mis à jour avec succès");
      onSave && onSave();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde des jours de travail");
    } finally {
      setSaving(false);
    }
  };

  // const getWorkdayForDayAndSlot = (dayOfWeek, timeSlot) => {
  //   return workdays.find(
  //     (w) => w.day_of_week === dayOfWeek && w.time_slot === timeSlot,
  //   );
  // };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 4,
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          Chargement des jours de travail...
        </Typography>
      </Box>
    );
  }

  return (
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
            {timeSlots.map((slot) => (
              <Grid size={{ xs: 4.5 }} key={slot.key}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {slot.icon}
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ color: slot.color }}
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
        defaults={workdays}
      />

      {/* Lignes pour chaque jour de la semaine */}
      {/* {daysOfWeek.map((day) => (
        <Card key={day.key} sx={{ mb: 1 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center"> */}
      {/* Nom du jour */}
      {/* <Grid size={{ xs: 3 }}>
                <Typography variant="body1" fontWeight="medium">
                  {day.label}
                </Typography>
              </Grid> */}

      {/* Créneaux horaires */}
      {/* {timeSlots.map((slot) => {
                const workday = getWorkdayForDayAndSlot(day.key, slot.key);

                return (
                  <Grid size={{ xs: 4.5 }} key={slot.key}>
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        bgcolor: workday?.is_working ? "#f1f8e9" : "#fafafa",
                        borderColor: workday?.is_working
                          ? "#4caf50"
                          : "#e0e0e0",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        {slot.icon}
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={workday?.is_working || false}
                              onChange={(e) =>
                                updateWorkday(
                                  day.key,
                                  slot.key,
                                  "is_working",
                                  e.target.checked,
                                )
                              }
                              color="primary"
                            />
                          }
                          label={slot.label}
                          sx={{
                            width: "100%",
                            height: "100%",
                          }}
                        />
                      </Box>

                      {workday?.is_working && (
                        <Box
                          sx={{
                            mt: 1,
                            display: "flex",
                            gap: 1,
                            alignItems: "center",
                          }}
                        >
                          <TextField
                            size="small"
                            type="time"
                            label="Début"
                            value={workday.start_time || ""}
                            onChange={(e) =>
                              updateWorkday(
                                day.key,
                                slot.key,
                                "start_time",
                                e.target.value,
                              )
                            }
                            slotProps={{ inputLabel: { shrink: true } }}
                            sx={{ width: 100 }}
                          />
                          <Typography variant="body2">-</Typography>
                          <TextField
                            size="small"
                            type="time"
                            label="Fin"
                            value={workday.end_time || ""}
                            onChange={(e) =>
                              updateWorkday(
                                day.key,
                                slot.key,
                                "end_time",
                                e.target.value,
                              )
                            }
                            slotProps={{ inputLabel: { shrink: true } }}
                            sx={{ width: 100 }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      ))} */}

      {/* Résumé des jours de travail */}
      {/* <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Résumé des jours de travail :
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {workdays
              .filter((w) => w.is_working)
              .map((workday) => {
                const day = daysOfWeek.find(
                  (d) => d.key === workday.day_of_week,
                );
                const slot = timeSlots.find((s) => s.key === workday.time_slot);
                return (
                  <Chip
                    key={`${workday.day_of_week}-${workday.time_slot}`}
                    icon={slot?.icon}
                    label={`${day?.short} ${slot?.label} (${workday.start_time}-${workday.end_time})`}
                    color="primary"
                    variant="outlined"
                    sx={{
                      borderColor: slot?.color,
                      color: slot?.color,
                      "& .MuiChip-icon": { color: slot?.color },
                    }}
                  />
                );
              })}
          </Box>
          {workdays.filter((w) => w.is_working).length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Aucun jour de travail configuré
            </Typography>
          )}
        </CardContent>
      </Card> */}

      <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={onClose} disabled={saving}>
          Annuler
        </Button>
        <Button
          type="submit"
          form="WorkdaysForm"
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : <Save />}
        >
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </Box>
    </Box>
  );
};

export default EmployeeWorkdays;
