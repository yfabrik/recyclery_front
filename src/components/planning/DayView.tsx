import {
  Add,
  Delete,
  Edit,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import type { TaskModel } from "../../interfaces/Models";
import { getTaskVariant, taskCardStyles } from "./planningTaskStyles";

interface StatusInfo {
  label: string;
  color: string;
}

interface PriorityInfo {
  label: string;
  color: string;
}

interface DayViewProps {
  filteredSchedules: TaskModel[];
  handleOpenDialog: (a?: TaskModel | null, b?: Date) => void;
  handleDeleteTask: (t: TaskModel) => void;
  selectedDate: Date;
  formatTime: (s: string) => string;
  getStatusInfo: (status: string | null) => StatusInfo;
  getPriorityInfo: (priority: string) => PriorityInfo;
  isManuallyCreatedTask?: (t: TaskModel) => boolean;
}

export const DayView = ({
  handleOpenDialog,
  handleDeleteTask,
  filteredSchedules,
  selectedDate,
  formatTime,
  getStatusInfo,
  getPriorityInfo,
  isManuallyCreatedTask = () => false,
}: DayViewProps) => {
  const daySchedules = Array.isArray(filteredSchedules)
    ? filteredSchedules.filter((schedule) => {
        const scheduleDate = new Date(schedule.scheduled_date);
        return (
          scheduleDate.getDate() === selectedDate.getDate() &&
          scheduleDate.getMonth() === selectedDate.getMonth() &&
          scheduleDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  return (
    <Box>
      {/* Calendrier par créneaux */}
      <Grid container spacing={3}>
        {/* Créneau Matin */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%", border: "2px solid #4caf50" }}>
            <CardHeader
              title={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#4caf50" }}
                  >
                    🌅 Matin (8h - 12h)
                  </Typography>
                  <Chip
                    label={`${
                      daySchedules.filter((s) => {
                        const startHour = parseInt(
                          s.start_time?.split(":")[0] || "0",
                        );
                        return startHour >= 8 && startHour < 12;
                      }).length
                    } tâche${
                      daySchedules.filter((s) => {
                        const startHour = parseInt(
                          s.start_time?.split(":")[0] || "0",
                        );
                        return startHour >= 8 && startHour < 12;
                      }).length > 1
                        ? "s"
                        : ""
                    }`}
                    size="small"
                    sx={{ bgcolor: "#e8f5e8", color: "#4caf50" }}
                  />
                </Box>
              }
              action={
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => {
                    handleOpenDialog();
                    // handleQuickTimeSlot("morning");
                  }}
                  sx={{ borderColor: "#4caf50", color: "#4caf50" }}
                >
                  Ajouter
                </Button>
              }
            />
            <CardContent>
              <Stack spacing={2}>
                {daySchedules.filter((schedule) => {
                  const startHour = parseInt(
                    schedule.start_time?.split(":")[0] || "0",
                  );
                  return startHour >= 8 && startHour < 12;
                }).length > 0 ? (
                  daySchedules
                    .filter((schedule) => {
                      const startHour = parseInt(
                        schedule.start_time?.split(":")[0] || "0",
                      );
                      return startHour >= 8 && startHour < 12;
                    })
                    .map((schedule, index) => {
                      const statusInfo = getStatusInfo(schedule.status);
                      const priorityInfo = getPriorityInfo(schedule.priority);

                      return (
                        <Card
                          key={index}
                          onClick={() => handleOpenDialog(schedule)}
                          sx={{
                            cursor: "pointer",
                            border: `1px solid ${statusInfo.color}`,
                            "&:hover": {
                              boxShadow: 2,
                              transform: "translateY(-1px)",
                            },
                            transition: "all 0.2s ease",
                            ...taskCardStyles[getTaskVariant(schedule)],
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ mb: 1 }}>
                              <Typography
                                variant="subtitle2"
                                fontWeight="bold"
                                noWrap
                                sx={{
                                  color: schedule.category=="vente"
                                    ? "#4caf50"
                                    : schedule.category=="point"
                                      ? "#ff9800"
                                      : "inherit",
                                }}
                              >
                                {schedule.name}
                              </Typography>
                              {schedule.category=="vente" && (
                                <Chip
                                  label="🏪 Ouverture"
                                  size="small"
                                  sx={{
                                    bgcolor: "#4caf50",
                                    color: "white",
                                    fontWeight: "bold",
                                    fontSize: "0.7rem",
                                    mt: 0.5,
                                  }}
                                />
                              )}
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 0.5,
                                mt: 1,
                              }}
                            >
                              {/* BOUTON DE TEST - TOUJOURS VISIBLE */}
                              <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert("Bouton cliqué !");
                                }}
                                sx={{
                                  bgcolor: "#4caf50",
                                  color: "white",
                                  fontSize: "0.6rem",
                                  height: 24,
                                  minWidth: 60,
                                  "&:hover": {
                                    bgcolor: "#45a049",
                                  },
                                }}
                              >
                                + EMPLOYÉS
                              </Button>

                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "Modification de la tâche:",
                                    schedule,
                                  );
                                  handleOpenDialog(schedule);
                                }}
                                sx={{
                                  color: "#2196f3",
                                  minWidth: 24,
                                  minHeight: 24,
                                  width: 24,
                                  height: 24,
                                  bgcolor: "rgba(33, 150, 243, 0.1)",
                                  border: "1px solid rgba(33, 150, 243, 0.3)",
                                  "&:hover": {
                                    bgcolor: "#e3f2fd",
                                    transform: "scale(1.2)",
                                    border: "1px solid #2196f3",
                                  },
                                }}
                              >
                                <Edit sx={{ fontSize: 14 }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "Suppression de la tâche:",
                                    schedule,
                                  );
                                  handleDeleteTask(schedule);
                                }}
                                sx={{
                                  color: "#f44336",
                                  minWidth: 24,
                                  minHeight: 24,
                                  width: 24,
                                  height: 24,
                                  bgcolor: "rgba(244, 67, 54, 0.1)",
                                  border: "1px solid rgba(244, 67, 54, 0.3)",
                                  "&:hover": {
                                    bgcolor: "#ffebee",
                                    transform: "scale(1.2)",
                                    border: "1px solid #f44336",
                                  },
                                }}
                              >
                                <Delete sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Box>
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{ fontWeight: "bold", color: "#2196f3" }}
                            >
                              🏪 {schedule.store_name || "Magasin non assigné"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {formatTime(schedule.start_time)} -{" "}
                              {formatTime(schedule.end_time)}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                              <Chip
                                label={statusInfo.label}
                                size="small"
                                sx={{
                                  bgcolor: isManuallyCreatedTask(schedule)
                                    ? "#e0e0e0"
                                    : statusInfo.color,
                                  color: isManuallyCreatedTask(schedule)
                                    ? "#333"
                                    : "white",
                                  fontSize: "0.7rem",
                                }}
                              />
                              <Chip
                                label={priorityInfo.label}
                                size="small"
                                variant="outlined"
                                color={priorityInfo.color}
                                sx={{ fontSize: "0.7rem" }}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })
                ) : (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 4,
                      color: "text.secondary",
                    }}
                  >
                    <Typography variant="body2">
                      Aucune tâche programmée
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Créneau Après-midi */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%", border: "2px solid #ff9800" }}>
            <CardHeader
              title={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#ff9800" }}
                  >
                    🌞 Après-midi (13h30 - 17h)
                  </Typography>
                  <Chip
                    label={`${
                      daySchedules.filter((s) => {
                        const startHour = parseInt(
                          s.start_time?.split(":")[0] || "0",
                        );
                        return startHour >= 13 && startHour < 17;
                      }).length
                    } tâche${
                      daySchedules.filter((s) => {
                        const startHour = parseInt(
                          s.start_time?.split(":")[0] || "0",
                        );
                        return startHour >= 13 && startHour < 17;
                      }).length > 1
                        ? "s"
                        : ""
                    }`}
                    size="small"
                    sx={{ bgcolor: "#fff3e0", color: "#ff9800" }}
                  />
                </Box>
              }
              action={
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => {
                    handleOpenDialog();
                    // handleQuickTimeSlot("afternoon");
                  }}
                  sx={{ borderColor: "#ff9800", color: "#ff9800" }}
                >
                  Ajouter
                </Button>
              }
            />
            <CardContent>
              <Stack spacing={2}>
                {daySchedules.filter((schedule) => {
                  const startHour = parseInt(
                    schedule.start_time?.split(":")[0] || "0",
                  );
                  return startHour >= 13 && startHour < 17;
                }).length > 0 ? (
                  daySchedules
                    .filter((schedule) => {
                      const startHour = parseInt(
                        schedule.start_time?.split(":")[0] || "0",
                      );
                      return startHour >= 13 && startHour < 17;
                    })
                    .map((schedule, index) => {
                      const statusInfo = getStatusInfo(schedule.status);
                      const priorityInfo = getPriorityInfo(schedule.priority);

                      return (
                        <Card
                          key={index}
                          onClick={() => handleOpenDialog(schedule)}
                          sx={{
                            cursor: "pointer",
                            border: `1px solid ${statusInfo.color}`,
                            "&:hover": {
                              boxShadow: 2,
                              transform: "translateY(-1px)",
                            },
                            transition: "all 0.2s ease",
                            ...taskCardStyles[getTaskVariant(schedule)],
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ mb: 1 }}>
                              <Typography
                                variant="subtitle2"
                                fontWeight="bold"
                                noWrap
                                sx={{
                                  color: schedule.category=="vente"
                                    ? "#4caf50"
                                    : schedule.category=="point"
                                      ? "#ff9800"
                                      : "inherit",
                                }}
                              >
                                {schedule.name}
                              </Typography>
                              {schedule.category=="vente" && (
                                <Chip
                                  label="🏪 Ouverture"
                                  size="small"
                                  sx={{
                                    bgcolor: "#4caf50",
                                    color: "white",
                                    fontWeight: "bold",
                                    fontSize: "0.7rem",
                                    mt: 0.5,
                                  }}
                                />
                              )}
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 0.5,
                                mt: 1,
                              }}
                            >
                              {/* BOUTON DE TEST - TOUJOURS VISIBLE */}
                              <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert("Bouton cliqué !");
                                }}
                                sx={{
                                  bgcolor: "#4caf50",
                                  color: "white",
                                  fontSize: "0.6rem",
                                  height: 24,
                                  minWidth: 60,
                                  "&:hover": {
                                    bgcolor: "#45a049",
                                  },
                                }}
                              >
                                + EMPLOYÉS
                              </Button>

                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "Modification de la tâche:",
                                    schedule,
                                  );
                                  handleOpenDialog(schedule);
                                }}
                                sx={{
                                  color: "#2196f3",
                                  minWidth: 24,
                                  minHeight: 24,
                                  width: 24,
                                  height: 24,
                                  bgcolor: "rgba(33, 150, 243, 0.1)",
                                  border: "1px solid rgba(33, 150, 243, 0.3)",
                                  "&:hover": {
                                    bgcolor: "#e3f2fd",
                                    transform: "scale(1.2)",
                                    border: "1px solid #2196f3",
                                  },
                                }}
                              >
                                <Edit sx={{ fontSize: 14 }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "Suppression de la tâche:",
                                    schedule,
                                  );
                                  handleDeleteTask(schedule);
                                }}
                                sx={{
                                  color: "#f44336",
                                  minWidth: 24,
                                  minHeight: 24,
                                  width: 24,
                                  height: 24,
                                  bgcolor: "rgba(244, 67, 54, 0.1)",
                                  border: "1px solid rgba(244, 67, 54, 0.3)",
                                  "&:hover": {
                                    bgcolor: "#ffebee",
                                    transform: "scale(1.2)",
                                    border: "1px solid #f44336",
                                  },
                                }}
                              >
                                <Delete sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Box>
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{ fontWeight: "bold", color: "#2196f3" }}
                            >
                              🏪 {schedule.store_name || "Magasin non assigné"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {formatTime(schedule.start_time)} -{" "}
                              {formatTime(schedule.end_time)}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                              <Chip
                                label={statusInfo.label}
                                size="small"
                                sx={{
                                  bgcolor: isManuallyCreatedTask(schedule)
                                    ? "#e0e0e0"
                                    : statusInfo.color,
                                  color: isManuallyCreatedTask(schedule)
                                    ? "#333"
                                    : "white",
                                  fontSize: "0.7rem",
                                }}
                              />
                              <Chip
                                label={priorityInfo.label}
                                size="small"
                                variant="outlined"
                                color={priorityInfo.color}
                                sx={{ fontSize: "0.7rem" }}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })
                ) : (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 4,
                      color: "text.secondary",
                    }}
                  >
                    <Typography variant="body2">
                      Aucune tâche programmée
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
