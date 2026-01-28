/**
 * @deprecated
 */

import {
  Add,
  ArrowBackIos,
  ArrowForwardIos,
  Delete,
  Edit,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { useEmployee } from "../../services/useEmployee";
import type { TaskModel } from "../../interfaces/Models";

interface WeekViewProps {
  filteredSchedules: TaskModel[];
  handleOpenDialog: (a?: TaskModel | null, b?: Date) => void;
  isOpeningTask: (t: TaskModel) => boolean;
  isPresenceTask: (t: TaskModel) => boolean;
  getTaskDisplayName: (t: TaskModel) => string;
  handleDeleteTask: (t: TaskModel) => void;
  selectedDate: Date;
  setSelectedDate: (a: Date) => Date;
  statusOptions: { value: string; color: string; label: string }[];
  setFilterStatus: (a: string) => void;
  filterStatus: string;
  renderViewSelector: () => ReactNode;
  getStatusInfo:(task:TaskModel)=>object
  isManuallyCreatedTask:(t:TaskModel)=>boolean
  formatTime:(s:string)=>string
  handleAssignEmployeesToTask:(t:TaskModel)=>void,
  isCollectionTask:(t:TaskModel)=>boolean
}

/**
 * @deprecated
 */

export const WeekView = ({
  filteredSchedules,
  handleOpenDialog,
  isOpeningTask,
  isPresenceTask,
  getTaskDisplayName,
  handleDeleteTask,
  selectedDate,
  setSelectedDate,
  statusOptions,
  setFilterStatus,
  filterStatus,
  renderViewSelector,
  getStatusInfo,
  isManuallyCreatedTask,
  formatTime,
  handleAssignEmployeesToTask,
  isCollectionTask
}: WeekViewProps) => {
  const startOfWeek = new Date(selectedDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour commencer le lundi
  startOfWeek.setDate(diff);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDays.push(date);
  }

  const dayNames = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];

  const { getEmployeeColor, getEmployeeInitials } = useEmployee();

  return (
    <Box sx={{ bgcolor: "white", minHeight: "100vh", p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: "bold", color: "#333", mb: 3 }}
        >
          Vue Semaine
        </Typography>

        {/* Navigation semaine */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={() =>
                setSelectedDate(
                  new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000)
                )
              }
              sx={{
                bgcolor: "#f5f5f5",
                "&:hover": { bgcolor: "#e0e0e0" },
                width: 40,
                height: 40,
              }}
            >
              <ArrowBackIos fontSize="small" />
            </IconButton>

            <Typography variant="h5" sx={{ color: "#333", fontWeight: "bold" }}>
              Semaine du {startOfWeek.toLocaleDateString("fr-FR")} au{" "}
              {weekDays[6].toLocaleDateString("fr-FR")}
            </Typography>

            <IconButton
              onClick={() =>
                setSelectedDate(
                  new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000)
                )
              }
              sx={{
                bgcolor: "#f5f5f5",
                "&:hover": { bgcolor: "#e0e0e0" },
                width: 40,
                height: 40,
              }}
            >
              <ArrowForwardIos fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{
                bgcolor: "#4caf50",
                "&:hover": { bgcolor: "#45a049" },
                px: 3,
                py: 1.5,
                borderRadius: "20px",
              }}
            >
              Nouvelle Tâche
            </Button>

            {/* Sélecteur de vue */}
            {renderViewSelector()}
          </Box>
        </Box>
      </Box>

      {/* Nouvelle grille avec regroupement par type de tâche */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Ligne des tâches de vente - Matin */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              p: 2,
              bgcolor: "#f8f9fa",
              borderRadius: 2,
              border: "2px solid #4caf50",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#4caf50",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              🛒 Tâches de vente - Matin (8h-12h)
            </Typography>
            <Chip
              label={`${
                filteredSchedules.filter((s) => {
                  const isVente = s.notes?.includes("Vente -");
                  const isOuverture = isOpeningTask(s);
                  if (!isVente && !isOuverture) return false;
                  const startHour = parseInt(
                    s.start_time?.split(":")[0] || "0"
                  );
                  return startHour >= 8 && startHour < 12;
                }).length
              } tâches`}
              size="small"
              sx={{
                bgcolor: "#e8f5e8",
                color: "#4caf50",
                fontWeight: "bold",
              }}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 2,
            }}
          >
            {weekDays.map((day, index) => {
              const daySchedules = Array.isArray(filteredSchedules)
                ? filteredSchedules.filter((schedule) => {
                    const scheduleDate = new Date(schedule.scheduled_date);
                    return (
                      scheduleDate.getDate() === day.getDate() &&
                      scheduleDate.getMonth() === day.getMonth() &&
                      scheduleDate.getFullYear() === day.getFullYear()
                    );
                  })
                : [];

              const venteSchedules = daySchedules.filter((schedule) => {
                const isVente = schedule.notes?.includes("Vente -");
                const isOuverture = isOpeningTask(schedule);
                if (!isVente && !isOuverture) return false;
                const startHour = parseInt(
                  schedule.start_time?.split(":")[0] || "0"
                );
                return startHour >= 8 && startHour < 12;
              });

              return (
                <Card
                  key={`opening-${index}`}
                  sx={{
                    minHeight: 200,
                    border: "1px solid #e0e0e0",
                    bgcolor:
                      day.toDateString() === new Date().toDateString()
                        ? "#e3f2fd"
                        : "white",
                    "&:hover": {
                      boxShadow: 2,
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s",
                  }}
                >
                  <CardHeader
                    title={
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: "#4caf50" }}
                        >
                          {dayNames[index]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {day.getDate()}/{day.getMonth() + 1}
                        </Typography>
                      </Box>
                    }
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Stack spacing={1}>
                      {venteSchedules.map((schedule, scheduleIndex) => {
                        const statusInfo = getStatusInfo(schedule.status);

                        return (
                          <Card
                            key={scheduleIndex}
                            sx={{
                              p: 1.5,
                              bgcolor: isManuallyCreatedTask(schedule)
                                ? "#ffffff"
                                : isOpeningTask(schedule)
                                  ? "#f1f8e9"
                                  : isPresenceTask(schedule)
                                    ? "#fff8e1"
                                    : `${statusInfo.color}.100`,
                              border: isManuallyCreatedTask(schedule)
                                ? "2px solid #e0e0e0"
                                : isOpeningTask(schedule)
                                  ? "1px solid #c8e6c9"
                                  : isPresenceTask(schedule)
                                    ? "1px solid #ffcc02"
                                    : `1px solid ${statusInfo.color}.300`,
                              "&:hover": {
                                bgcolor: isManuallyCreatedTask(schedule)
                                  ? "#f5f5f5"
                                  : isOpeningTask(schedule)
                                    ? "#e8f5e8"
                                    : isPresenceTask(schedule)
                                      ? "#fff3e0"
                                      : `${statusInfo.color}.200`,
                                boxShadow: isOpeningTask(schedule)
                                  ? "0 2px 8px rgba(76, 175, 80, 0.2)"
                                  : isPresenceTask(schedule)
                                    ? "0 2px 8px rgba(255, 152, 0, 0.2)"
                                    : "none",
                              },
                            }}
                          >
                            <Box sx={{ mb: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                sx={{
                                  color: isOpeningTask(schedule)
                                    ? "#4caf50"
                                    : isPresenceTask(schedule)
                                      ? "#ff9800"
                                      : "inherit",
                                }}
                              >
                                {getTaskDisplayName(schedule)}
                              </Typography>
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ fontWeight: "bold", color: "#2196f3" }}
                              >
                                🏪{" "}
                                {schedule.store_name || "Magasin non assigné"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {formatTime(schedule.start_time)} -{" "}
                                {formatTime(schedule.end_time)}
                              </Typography>

                              {/* Employés assignés - Layout compact pour vue semaine */}
                              {schedule.assigned_employees &&
                                schedule.assigned_employees.length > 0 && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 0.3,
                                      mb: 0.5,
                                      p: 0.5,
                                      bgcolor: "#e8f5e8",
                                      borderRadius: 1,
                                      border: "1px solid #4caf50",
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#2e7d32",
                                        fontSize: "0.7rem",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                      }}
                                    >
                                      👥 Employés (
                                      {schedule.assigned_employees.length})
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 0.3,
                                        alignItems: "center",
                                      }}
                                    >
                                      {schedule.assigned_employees.map(
                                        (emp, index) => (
                                          <Box
                                            key={index}
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 0.3,
                                              p: 0.3,
                                              bgcolor: "white",
                                              borderRadius: 0.5,
                                              border: "1px solid #c8e6c9",
                                              width: "100%",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <Avatar
                                              sx={{
                                                width: 16,
                                                height: 16,
                                                fontSize: "0.6rem",
                                                bgcolor: getEmployeeColor(
                                                  emp.username
                                                ),
                                                color: "white",
                                                fontWeight: "bold",
                                              }}
                                              title={emp.username}
                                            >
                                              {getEmployeeInitials(
                                                emp.username
                                              )}
                                            </Avatar>
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                color: "#2e7d32",
                                                fontSize: "0.65rem",
                                                fontWeight: "bold",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              {emp.username}
                                            </Typography>
                                          </Box>
                                        )
                                      )}
                                    </Box>
                                  </Box>
                                )}
                              {schedule.location_name && (
                                <Typography
                                  variant="caption"
                                  display="block"
                                  sx={{
                                    fontWeight: "bold",
                                    color: "#9c27b0",
                                  }}
                                >
                                  📍 {schedule.location_name}
                                </Typography>
                              )}
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 0.5,
                              }}
                            >
                              <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "Assignation d'employés à la tâche:",
                                    schedule
                                  );
                                  handleAssignEmployeesToTask(schedule);
                                }}
                                sx={{
                                  bgcolor: "#4caf50",
                                  color: "white",
                                  fontSize: "0.6rem",
                                  height: 24,
                                  minWidth: 60,
                                  "&:hover": {
                                    bgcolor: "#45a049",
                                    transform: "scale(1.05)",
                                  },
                                }}
                              >
                                +
                              </Button>

                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
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
                          </Card>
                        );
                      })}

                      {venteSchedules.length === 0 && (
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 3,
                            color: "text.secondary",
                            border: "2px dashed #e0e0e0",
                            borderRadius: 1,
                            bgcolor: "#fafafa",
                          }}
                        >
                          <Typography variant="body2">Aucune tâche</Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>

        {/* Ligne des tâches de vente - Après-midi */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              p: 2,
              bgcolor: "#f8f9fa",
              borderRadius: 2,
              border: "2px solid #4caf50",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#4caf50",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              🛒 Tâches de vente - Après-midi (13h-17h)
            </Typography>
            <Chip
              label={`${
                filteredSchedules.filter((s) => {
                  const isVente = s.notes?.includes("Vente -");
                  const isOuverture = isOpeningTask(s);
                  if (!isVente && !isOuverture) return false;
                  const startHour = parseInt(
                    s.start_time?.split(":")[0] || "0"
                  );
                  return startHour >= 13 && startHour < 17;
                }).length
              } tâches`}
              size="small"
              sx={{
                bgcolor: "#e8f5e8",
                color: "#4caf50",
                fontWeight: "bold",
              }}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 2,
            }}
          >
            {weekDays.map((day, index) => {
              const daySchedules = Array.isArray(filteredSchedules)
                ? filteredSchedules.filter((schedule) => {
                    const scheduleDate = new Date(schedule.scheduled_date);
                    return (
                      scheduleDate.getDate() === day.getDate() &&
                      scheduleDate.getMonth() === day.getMonth() &&
                      scheduleDate.getFullYear() === day.getFullYear()
                    );
                  })
                : [];

              const venteSchedules = daySchedules.filter((schedule) => {
                const isVente = schedule.notes?.includes("Vente -");
                const isOuverture = isOpeningTask(schedule);
                if (!isVente && !isOuverture) return false;
                const startHour = parseInt(
                  schedule.start_time?.split(":")[0] || "0"
                );
                return startHour >= 13 && startHour < 17;
              });

              return (
                <Card
                  key={`opening-pm-${index}`}
                  sx={{
                    minHeight: 200,
                    border: "1px solid #e0e0e0",
                    bgcolor:
                      day.toDateString() === new Date().toDateString()
                        ? "#e3f2fd"
                        : "white",
                    "&:hover": {
                      boxShadow: 2,
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s",
                  }}
                >
                  <CardHeader
                    title={
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: "#4caf50" }}
                        >
                          {dayNames[index]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {day.getDate()}/{day.getMonth() + 1}
                        </Typography>
                      </Box>
                    }
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Stack spacing={1}>
                      {venteSchedules.map((schedule, scheduleIndex) => {
                        const statusInfo = getStatusInfo(schedule.status);

                        return (
                          <Card
                            key={scheduleIndex}
                            sx={{
                              p: 1.5,
                              bgcolor: isManuallyCreatedTask(schedule)
                                ? "#ffffff"
                                : isOpeningTask(schedule)
                                  ? "#f1f8e9"
                                  : isPresenceTask(schedule)
                                    ? "#fff8e1"
                                    : `${statusInfo.color}.100`,
                              border: isManuallyCreatedTask(schedule)
                                ? "2px solid #e0e0e0"
                                : isOpeningTask(schedule)
                                  ? "1px solid #c8e6c9"
                                  : isPresenceTask(schedule)
                                    ? "1px solid #ffcc02"
                                    : `1px solid ${statusInfo.color}.300`,
                              "&:hover": {
                                bgcolor: isManuallyCreatedTask(schedule)
                                  ? "#f5f5f5"
                                  : isOpeningTask(schedule)
                                    ? "#e8f5e8"
                                    : isPresenceTask(schedule)
                                      ? "#fff3e0"
                                      : `${statusInfo.color}.200`,
                                boxShadow: isOpeningTask(schedule)
                                  ? "0 2px 8px rgba(76, 175, 80, 0.2)"
                                  : isPresenceTask(schedule)
                                    ? "0 2px 8px rgba(255, 152, 0, 0.2)"
                                    : "none",
                              },
                            }}
                          >
                            <Box sx={{ mb: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                sx={{
                                  color: isOpeningTask(schedule)
                                    ? "#4caf50"
                                    : isPresenceTask(schedule)
                                      ? "#ff9800"
                                      : "inherit",
                                }}
                              >
                                {getTaskDisplayName(schedule)}
                              </Typography>
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ fontWeight: "bold", color: "#2196f3" }}
                              >
                                🏪{" "}
                                {schedule.store_name || "Magasin non assigné"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {formatTime(schedule.start_time)} -{" "}
                                {formatTime(schedule.end_time)}
                              </Typography>

                              {/* Employés assignés - Layout compact pour vue semaine */}
                              {schedule.assigned_employees &&
                                schedule.assigned_employees.length > 0 && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 0.3,
                                      mb: 0.5,
                                      p: 0.5,
                                      bgcolor: "#e8f5e8",
                                      borderRadius: 1,
                                      border: "1px solid #4caf50",
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#2e7d32",
                                        fontSize: "0.7rem",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                      }}
                                    >
                                      👥 Employés (
                                      {schedule.assigned_employees.length})
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 0.3,
                                        alignItems: "center",
                                      }}
                                    >
                                      {schedule.assigned_employees.map(
                                        (emp, index) => (
                                          <Box
                                            key={index}
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 0.3,
                                              p: 0.3,
                                              bgcolor: "white",
                                              borderRadius: 0.5,
                                              border: "1px solid #c8e6c9",
                                              width: "100%",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <Avatar
                                              sx={{
                                                width: 16,
                                                height: 16,
                                                fontSize: "0.6rem",
                                                bgcolor: getEmployeeColor(
                                                  emp.username
                                                ),
                                                color: "white",
                                                fontWeight: "bold",
                                              }}
                                              title={emp.username}
                                            >
                                              {getEmployeeInitials(
                                                emp.username
                                              )}
                                            </Avatar>
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                color: "#2e7d32",
                                                fontSize: "0.65rem",
                                                fontWeight: "bold",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              {emp.username}
                                            </Typography>
                                          </Box>
                                        )
                                      )}
                                    </Box>
                                  </Box>
                                )}
                              {schedule.location_name && (
                                <Typography
                                  variant="caption"
                                  display="block"
                                  sx={{
                                    fontWeight: "bold",
                                    color: "#9c27b0",
                                  }}
                                >
                                  📍 {schedule.location_name}
                                </Typography>
                              )}
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 0.5,
                              }}
                            >
                              <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "Assignation d'employés à la tâche:",
                                    schedule
                                  );
                                  handleAssignEmployeesToTask(schedule);
                                }}
                                sx={{
                                  bgcolor: "#4caf50",
                                  color: "white",
                                  fontSize: "0.6rem",
                                  height: 24,
                                  minWidth: 60,
                                  "&:hover": {
                                    bgcolor: "#45a049",
                                    transform: "scale(1.05)",
                                  },
                                }}
                              >
                                +
                              </Button>

                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
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
                          </Card>
                        );
                      })}

                      {venteSchedules.length === 0 && (
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 3,
                            color: "text.secondary",
                            border: "2px dashed #e0e0e0",
                            borderRadius: 1,
                            bgcolor: "#fafafa",
                          }}
                        >
                          <Typography variant="body2">
                            Aucune tâche après-midi
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>

        {/* Ligne des points de collecte - Matin */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              p: 2,
              bgcolor: "#f8f9fa",
              borderRadius: 2,
              border: "2px solid #ff9800",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#ff9800",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              📍 Présence déchèterie - Matin (8h-12h)
            </Typography>
            <Chip
              label={`${
                filteredSchedules.filter((s) => {
                  if (!isPresenceTask(s)) return false;
                  const startHour = parseInt(
                    s.start_time?.split(":")[0] || "0"
                  );
                  return startHour >= 8 && startHour < 12;
                }).length
              } présences`}
              size="small"
              sx={{
                bgcolor: "#fff3e0",
                color: "#ff9800",
                fontWeight: "bold",
              }}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 2,
            }}
          >
            {weekDays.map((day, index) => {
              const daySchedules = Array.isArray(filteredSchedules)
                ? filteredSchedules.filter((schedule) => {
                    const scheduleDate = new Date(schedule.scheduled_date);
                    return (
                      scheduleDate.getDate() === day.getDate() &&
                      scheduleDate.getMonth() === day.getMonth() &&
                      scheduleDate.getFullYear() === day.getFullYear()
                    );
                  })
                : [];

              const presenceSchedules = daySchedules.filter((schedule) => {
                if (!isPresenceTask(schedule)) return false;
                const startHour = parseInt(
                  schedule.start_time?.split(":")[0] || "0"
                );
                return startHour >= 8 && startHour < 12;
              });

              return (
                <Card
                  key={`presence-${index}`}
                  sx={{
                    minHeight: 200,
                    border: "1px solid #e0e0e0",
                    bgcolor:
                      day.toDateString() === new Date().toDateString()
                        ? "#e3f2fd"
                        : "white",
                    "&:hover": {
                      boxShadow: 2,
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s",
                  }}
                >
                  <CardHeader
                    title={
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: "#2196f3" }}
                        >
                          {dayNames[index]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {day.getDate()}/{day.getMonth() + 1}
                        </Typography>
                      </Box>
                    }
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Stack spacing={1}>
                      {presenceSchedules.map((schedule, scheduleIndex) => {
                        const statusInfo = getStatusInfo(schedule.status);

                        return (
                          <Card
                            key={scheduleIndex}
                            sx={{
                              p: 1.5,
                              bgcolor: isManuallyCreatedTask(schedule)
                                ? "#ffffff"
                                : isOpeningTask(schedule)
                                  ? "#f1f8e9"
                                  : isPresenceTask(schedule)
                                    ? "#fff8e1"
                                    : `${statusInfo.color}.100`,
                              border: isManuallyCreatedTask(schedule)
                                ? "2px solid #e0e0e0"
                                : isOpeningTask(schedule)
                                  ? "1px solid #c8e6c9"
                                  : isPresenceTask(schedule)
                                    ? "1px solid #ffcc02"
                                    : `1px solid ${statusInfo.color}.300`,
                              "&:hover": {
                                bgcolor: isManuallyCreatedTask(schedule)
                                  ? "#f5f5f5"
                                  : isOpeningTask(schedule)
                                    ? "#e8f5e8"
                                    : isPresenceTask(schedule)
                                      ? "#fff3e0"
                                      : `${statusInfo.color}.200`,
                                boxShadow: isOpeningTask(schedule)
                                  ? "0 2px 8px rgba(76, 175, 80, 0.2)"
                                  : isPresenceTask(schedule)
                                    ? "0 2px 8px rgba(255, 152, 0, 0.2)"
                                    : "none",
                              },
                            }}
                          >
                            <Box sx={{ mb: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                sx={{
                                  color: isOpeningTask(schedule)
                                    ? "#4caf50"
                                    : isPresenceTask(schedule)
                                      ? "#ff9800"
                                      : "inherit",
                                }}
                              >
                                {getTaskDisplayName(schedule)}
                              </Typography>
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ fontWeight: "bold", color: "#2196f3" }}
                              >
                                🏪{" "}
                                {schedule.store_name || "Magasin non assigné"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {formatTime(schedule.start_time)} -{" "}
                                {formatTime(schedule.end_time)}
                              </Typography>
                            </Box>

                            {/* Section des employés assignés */}
                            {schedule.assigned_employees &&
                              schedule.assigned_employees.length > 0 && (
                                <Box
                                  sx={{
                                    mt: 1,
                                    p: 1,
                                    bgcolor: isPresenceTask(schedule)
                                      ? "#fff3e0"
                                      : "#e8f5e8",
                                    borderRadius: 1,
                                    border: isPresenceTask(schedule)
                                      ? "1px solid #ffcc02"
                                      : "1px solid #c8e6c9",
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: isPresenceTask(schedule)
                                        ? "#e65100"
                                        : "#2e7d32",
                                      fontSize: "0.7rem",
                                      fontWeight: "bold",
                                      textAlign: "center",
                                    }}
                                  >
                                    👥 Employés (
                                    {schedule.assigned_employees.length})
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 0.3,
                                      alignItems: "center",
                                    }}
                                  >
                                    {schedule.assigned_employees.map(
                                      (emp, index) => (
                                        <Box
                                          key={index}
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.3,
                                            p: 0.3,
                                            bgcolor: "white",
                                            borderRadius: 0.5,
                                            border: isPresenceTask(schedule)
                                              ? "1px solid #ffcc02"
                                              : "1px solid #c8e6c9",
                                            width: "100%",
                                            justifyContent: "center",
                                          }}
                                        >
                                          <Avatar
                                            sx={{
                                              width: 16,
                                              height: 16,
                                              fontSize: "0.7rem",
                                              bgcolor: getEmployeeColor(
                                                emp.username
                                              ),
                                              color: "white",
                                              fontWeight: "bold",
                                            }}
                                          >
                                            {emp.initials ||
                                              getEmployeeInitials(emp.username)}
                                          </Avatar>
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              fontSize: "0.7rem",
                                              fontWeight: "medium",
                                              color: isPresenceTask(schedule)
                                                ? "#e65100"
                                                : "#2e7d32",
                                            }}
                                          >
                                            {emp.username}
                                          </Typography>
                                        </Box>
                                      )
                                    )}
                                  </Box>
                                </Box>
                              )}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 0.5,
                              }}
                            >
                              <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "Assignation d'employés à la tâche:",
                                    schedule
                                  );
                                  handleAssignEmployeesToTask(schedule);
                                }}
                                sx={{
                                  bgcolor: "#4caf50",
                                  color: "white",
                                  fontSize: "0.6rem",
                                  height: 24,
                                  minWidth: 60,
                                  "&:hover": {
                                    bgcolor: "#45a049",
                                    transform: "scale(1.05)",
                                  },
                                }}
                              >
                                +
                              </Button>

                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
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
                          </Card>
                        );
                      })}

                      {presenceSchedules.length === 0 && (
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 3,
                            color: "text.secondary",
                            border: "2px dashed #e0e0e0",
                            borderRadius: 1,
                            bgcolor: "#fafafa",
                          }}
                        >
                          <Typography variant="body2">
                            Aucune présence
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>

        {/* Ligne des points de collecte - Après-midi */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              p: 2,
              bgcolor: "#f8f9fa",
              borderRadius: 2,
              border: "2px solid #ff9800",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#ff9800",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              📍 Présence déchèterie - Après-midi (13h-17h)
            </Typography>
            <Chip
              label={`${
                filteredSchedules.filter((s) => {
                  if (!isPresenceTask(s)) return false;
                  const startHour = parseInt(
                    s.start_time?.split(":")[0] || "0"
                  );
                  return startHour >= 13 && startHour < 17;
                }).length
              } présences`}
              size="small"
              sx={{
                bgcolor: "#fff3e0",
                color: "#ff9800",
                fontWeight: "bold",
              }}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 2,
            }}
          >
            {weekDays.map((day, index) => {
              const daySchedules = Array.isArray(filteredSchedules)
                ? filteredSchedules.filter((schedule) => {
                    const scheduleDate = new Date(schedule.scheduled_date);
                    return (
                      scheduleDate.getDate() === day.getDate() &&
                      scheduleDate.getMonth() === day.getMonth() &&
                      scheduleDate.getFullYear() === day.getFullYear()
                    );
                  })
                : [];

              const presenceSchedules = daySchedules.filter((schedule) => {
                if (!isPresenceTask(schedule)) return false;
                const startHour = parseInt(
                  schedule.start_time?.split(":")[0] || "0"
                );
                return startHour >= 13 && startHour < 17;
              });

              return (
                <Card
                  key={`presence-pm-${index}`}
                  sx={{
                    minHeight: 200,
                    border: "1px solid #e0e0e0",
                    bgcolor:
                      day.toDateString() === new Date().toDateString()
                        ? "#e3f2fd"
                        : "white",
                    "&:hover": {
                      boxShadow: 2,
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s",
                  }}
                >
                  <CardHeader
                    title={
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: "#2196f3" }}
                        >
                          {dayNames[index]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {day.getDate()}/{day.getMonth() + 1}
                        </Typography>
                      </Box>
                    }
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Stack spacing={1}>
                      {presenceSchedules.map((schedule, scheduleIndex) => {
                        const statusInfo = getStatusInfo(schedule.status);

                        return (
                          <Card
                            key={scheduleIndex}
                            sx={{
                              p: 1.5,
                              bgcolor: isManuallyCreatedTask(schedule)
                                ? "#ffffff"
                                : isOpeningTask(schedule)
                                  ? "#f1f8e9"
                                  : isPresenceTask(schedule)
                                    ? "#fff8e1"
                                    : `${statusInfo.color}.100`,
                              border: isManuallyCreatedTask(schedule)
                                ? "2px solid #e0e0e0"
                                : isOpeningTask(schedule)
                                  ? "1px solid #c8e6c9"
                                  : isPresenceTask(schedule)
                                    ? "1px solid #ffcc02"
                                    : `1px solid ${statusInfo.color}.300`,
                              "&:hover": {
                                bgcolor: isManuallyCreatedTask(schedule)
                                  ? "#f5f5f5"
                                  : isOpeningTask(schedule)
                                    ? "#e8f5e8"
                                    : isPresenceTask(schedule)
                                      ? "#fff3e0"
                                      : `${statusInfo.color}.200`,
                                boxShadow: isOpeningTask(schedule)
                                  ? "0 2px 8px rgba(76, 175, 80, 0.2)"
                                  : isPresenceTask(schedule)
                                    ? "0 2px 8px rgba(255, 152, 0, 0.2)"
                                    : "none",
                              },
                            }}
                          >
                            <Box sx={{ mb: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                sx={{
                                  color: isOpeningTask(schedule)
                                    ? "#4caf50"
                                    : isPresenceTask(schedule)
                                      ? "#ff9800"
                                      : "inherit",
                                }}
                              >
                                {getTaskDisplayName(schedule)}
                              </Typography>
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ fontWeight: "bold", color: "#2196f3" }}
                              >
                                🏪{" "}
                                {schedule.store_name || "Magasin non assigné"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {formatTime(schedule.start_time)} -{" "}
                                {formatTime(schedule.end_time)}
                              </Typography>
                            </Box>

                            {/* Section des employés assignés */}
                            {schedule.assigned_employees &&
                              schedule.assigned_employees.length > 0 && (
                                <Box
                                  sx={{
                                    mt: 1,
                                    p: 1,
                                    bgcolor: isPresenceTask(schedule)
                                      ? "#fff3e0"
                                      : "#e8f5e8",
                                    borderRadius: 1,
                                    border: isPresenceTask(schedule)
                                      ? "1px solid #ffcc02"
                                      : "1px solid #c8e6c9",
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: isPresenceTask(schedule)
                                        ? "#e65100"
                                        : "#2e7d32",
                                      fontSize: "0.7rem",
                                      fontWeight: "bold",
                                      textAlign: "center",
                                    }}
                                  >
                                    👥 Employés (
                                    {schedule.assigned_employees.length})
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 0.3,
                                      alignItems: "center",
                                    }}
                                  >
                                    {schedule.assigned_employees.map(
                                      (emp, index) => (
                                        <Box
                                          key={index}
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.3,
                                            p: 0.3,
                                            bgcolor: "white",
                                            borderRadius: 0.5,
                                            border: isPresenceTask(schedule)
                                              ? "1px solid #ffcc02"
                                              : "1px solid #c8e6c9",
                                            width: "100%",
                                            justifyContent: "center",
                                          }}
                                        >
                                          <Avatar
                                            sx={{
                                              width: 16,
                                              height: 16,
                                              fontSize: "0.7rem",
                                              bgcolor: getEmployeeColor(
                                                emp.username
                                              ),
                                              color: "white",
                                              fontWeight: "bold",
                                            }}
                                          >
                                            {emp.initials ||
                                              getEmployeeInitials(emp.username)}
                                          </Avatar>
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              fontSize: "0.7rem",
                                              fontWeight: "medium",
                                              color: isPresenceTask(schedule)
                                                ? "#e65100"
                                                : "#2e7d32",
                                            }}
                                          >
                                            {emp.username}
                                          </Typography>
                                        </Box>
                                      )
                                    )}
                                  </Box>
                                </Box>
                              )}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 0.5,
                              }}
                            >
                              <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "Assignation d'employés à la tâche:",
                                    schedule
                                  );
                                  handleAssignEmployeesToTask(schedule);
                                }}
                                sx={{
                                  bgcolor: "#4caf50",
                                  color: "white",
                                  fontSize: "0.6rem",
                                  height: 24,
                                  minWidth: 60,
                                  "&:hover": {
                                    bgcolor: "#45a049",
                                    transform: "scale(1.05)",
                                  },
                                }}
                              >
                                +
                              </Button>

                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
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
                          </Card>
                        );
                      })}

                      {presenceSchedules.length === 0 && (
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 3,
                            color: "text.secondary",
                            border: "2px dashed #e0e0e0",
                            borderRadius: 1,
                            bgcolor: "#fafafa",
                          }}
                        >
                          <Typography variant="body2">
                            Aucune présence après-midi
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>

        {/* Ligne des tâches normales - Matin */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              p: 2,
              bgcolor: "#f8f9fa",
              borderRadius: 2,
              border: "2px solid #2196f3",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#2196f3",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              🌅 Tâches normales - Matin (8h00 - 12h00)
            </Typography>
            <Chip
              label={`${
                filteredSchedules.filter((s) => {
                  const startHour = parseInt(
                    s.start_time?.split(":")[0] || "0"
                  );
                  return (
                    startHour >= 8 &&
                    startHour < 12 &&
                    !isOpeningTask(s) &&
                    !isPresenceTask(s)
                  );
                }).length
              } tâches`}
              size="small"
              sx={{
                bgcolor: "#e3f2fd",
                color: "#2196f3",
                fontWeight: "bold",
              }}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 2,
            }}
          >
            {weekDays.map((day, index) => {
              const daySchedules = Array.isArray(filteredSchedules)
                ? filteredSchedules.filter((schedule) => {
                    const scheduleDate = new Date(schedule.scheduled_date);
                    return (
                      scheduleDate.getDate() === day.getDate() &&
                      scheduleDate.getMonth() === day.getMonth() &&
                      scheduleDate.getFullYear() === day.getFullYear()
                    );
                  })
                : [];

              const normalMorningSchedules = daySchedules.filter((schedule) => {
                const startHour = parseInt(
                  schedule.start_time?.split(":")[0] || "0"
                );
                return (
                  startHour >= 8 &&
                  startHour < 12 &&
                  !isOpeningTask(schedule) &&
                  !isPresenceTask(schedule) &&
                  !isCollectionTask(schedule)
                );
              });

              return (
                <Card
                  key={`normal-morning-${index}`}
                  sx={{
                    minHeight: 200,
                    border: "1px solid #e0e0e0",
                    bgcolor:
                      day.toDateString() === new Date().toDateString()
                        ? "#e3f2fd"
                        : "white",
                    "&:hover": {
                      boxShadow: 2,
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s",
                  }}
                >
                  <CardHeader
                    title={
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: "#2196f3" }}
                        >
                          {dayNames[index]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {day.getDate()}/{day.getMonth() + 1}
                        </Typography>
                      </Box>
                    }
                    action={
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(null, day)}
                        sx={{
                          bgcolor: "#2196f3",
                          color: "white",
                          "&:hover": { bgcolor: "#1976d2" },
                        }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    }
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Stack spacing={1}>
                      {normalMorningSchedules.map((schedule, scheduleIndex) => {
                        const statusInfo = getStatusInfo(schedule.status);

                        return (
                          <Card
                            key={scheduleIndex}
                            sx={{
                              p: 1.5,
                              bgcolor: isManuallyCreatedTask(schedule)
                                ? "#ffffff"
                                : isOpeningTask(schedule)
                                  ? "#f1f8e9"
                                  : isPresenceTask(schedule)
                                    ? "#fff8e1"
                                    : `${statusInfo.color}.100`,
                              border: isManuallyCreatedTask(schedule)
                                ? "2px solid #e0e0e0"
                                : isOpeningTask(schedule)
                                  ? "1px solid #c8e6c9"
                                  : isPresenceTask(schedule)
                                    ? "1px solid #ffcc02"
                                    : `1px solid ${statusInfo.color}.300`,
                              "&:hover": {
                                bgcolor: isManuallyCreatedTask(schedule)
                                  ? "#f5f5f5"
                                  : isOpeningTask(schedule)
                                    ? "#e8f5e8"
                                    : isPresenceTask(schedule)
                                      ? "#fff3e0"
                                      : `${statusInfo.color}.200`,
                                boxShadow: isOpeningTask(schedule)
                                  ? "0 2px 8px rgba(76, 175, 80, 0.2)"
                                  : isPresenceTask(schedule)
                                    ? "0 2px 8px rgba(255, 152, 0, 0.2)"
                                    : "none",
                              },
                            }}
                          >
                            <Box sx={{ mb: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                sx={{
                                  color: isOpeningTask(schedule)
                                    ? "#4caf50"
                                    : isPresenceTask(schedule)
                                      ? "#ff9800"
                                      : "inherit",
                                }}
                              >
                                {getTaskDisplayName(schedule)}
                              </Typography>
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{
                                  fontWeight: "bold",
                                  color: "#2196f3",
                                }}
                              >
                                🏪{" "}
                                {schedule.store_name || "Magasin non assigné"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {formatTime(schedule.start_time)} -{" "}
                                {formatTime(schedule.end_time)}
                              </Typography>

                              {/* Employés assignés - Layout compact pour vue semaine */}
                              {schedule.assigned_employees &&
                                schedule.assigned_employees.length > 0 && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 0.3,
                                      mb: 0.5,
                                      p: 0.5,
                                      bgcolor: "#e8f5e8",
                                      borderRadius: 1,
                                      border: "1px solid #4caf50",
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#2e7d32",
                                        fontSize: "0.7rem",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                      }}
                                    >
                                      👥 Employés (
                                      {schedule.assigned_employees.length})
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 0.3,
                                        alignItems: "center",
                                      }}
                                    >
                                      {schedule.assigned_employees.map(
                                        (emp, index) => (
                                          <Box
                                            key={index}
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 0.3,
                                              p: 0.3,
                                              bgcolor: "white",
                                              borderRadius: 0.5,
                                              border: "1px solid #c8e6c9",
                                              width: "100%",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <Avatar
                                              sx={{
                                                width: 16,
                                                height: 16,
                                                fontSize: "0.6rem",
                                                bgcolor: getEmployeeColor(
                                                  emp.username
                                                ),
                                                color: "white",
                                                fontWeight: "bold",
                                              }}
                                              title={emp.username}
                                            >
                                              {getEmployeeInitials(
                                                emp.username
                                              )}
                                            </Avatar>
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                color: "#2e7d32",
                                                fontSize: "0.65rem",
                                                fontWeight: "bold",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              {emp.username}
                                            </Typography>
                                          </Box>
                                        )
                                      )}
                                    </Box>
                                  </Box>
                                )}
                              {schedule.location_name && (
                                <Typography
                                  variant="caption"
                                  display="block"
                                  sx={{
                                    fontWeight: "bold",
                                    color: "#9c27b0",
                                  }}
                                >
                                  📍 {schedule.location_name}
                                </Typography>
                              )}
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 0.5,
                              }}
                            >
                              <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "Assignation d'employés à la tâche:",
                                    schedule
                                  );
                                  handleAssignEmployeesToTask(schedule);
                                }}
                                sx={{
                                  bgcolor: "#4caf50",
                                  color: "white",
                                  fontSize: "0.6rem",
                                  height: 24,
                                  minWidth: 60,
                                  "&:hover": {
                                    bgcolor: "#45a049",
                                    transform: "scale(1.05)",
                                  },
                                }}
                              >
                                +
                              </Button>

                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
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
                          </Card>
                        );
                      })}

                      {normalMorningSchedules.length === 0 && (
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 3,
                            color: "text.secondary",
                            border: "2px dashed #e0e0e0",
                            borderRadius: 1,
                            bgcolor: "#fafafa",
                          }}
                        >
                          <Typography variant="body2">
                            Aucune tâche matin
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>

        {/* Ligne des tâches normales - Après-midi */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              p: 2,
              bgcolor: "#f8f9fa",
              borderRadius: 2,
              border: "2px solid #2196f3",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#2196f3",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              🌞 Tâches normales - Après-midi (13h30 - 17h)
            </Typography>
            <Chip
              label={`${
                filteredSchedules.filter((s) => {
                  const startHour = parseInt(
                    s.start_time?.split(":")[0] || "0"
                  );
                  return (
                    startHour >= 13 &&
                    startHour < 17 &&
                    !isOpeningTask(s) &&
                    !isPresenceTask(s)
                  );
                }).length
              } tâches`}
              size="small"
              sx={{
                bgcolor: "#e3f2fd",
                color: "#2196f3",
                fontWeight: "bold",
              }}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 2,
            }}
          >
            {weekDays.map((day, index) => {
              const daySchedules = Array.isArray(filteredSchedules)
                ? filteredSchedules.filter((schedule) => {
                    const scheduleDate = new Date(schedule.scheduled_date);
                    return (
                      scheduleDate.getDate() === day.getDate() &&
                      scheduleDate.getMonth() === day.getMonth() &&
                      scheduleDate.getFullYear() === day.getFullYear()
                    );
                  })
                : [];

              const afternoonSchedules = daySchedules.filter((schedule) => {
                const startHour = parseInt(
                  schedule.start_time?.split(":")[0] || "0"
                );
                return (
                  startHour >= 13 &&
                  startHour < 17 &&
                  !isOpeningTask(schedule) &&
                  !isPresenceTask(schedule) &&
                  !isCollectionTask(schedule)
                );
              });

              return (
                <Card
                  key={`afternoon-${index}`}
                  sx={{
                    minHeight: 200,
                    border: "1px solid #e0e0e0",
                    bgcolor:
                      day.toDateString() === new Date().toDateString()
                        ? "#e3f2fd"
                        : "white",
                    "&:hover": {
                      boxShadow: 2,
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s",
                  }}
                >
                  <CardHeader
                    title={
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: "#2196f3" }}
                        >
                          {dayNames[index]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {day.getDate()}/{day.getMonth() + 1}
                        </Typography>
                      </Box>
                    }
                    action={
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(null, day)}
                        sx={{
                          bgcolor: "#2196f3",
                          color: "white",
                          "&:hover": { bgcolor: "#1976d2" },
                        }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    }
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Stack spacing={1}>
                      {afternoonSchedules.map((schedule, scheduleIndex) => {
                        const statusInfo = getStatusInfo(schedule.status);

                        return (
                          <Card
                            key={scheduleIndex}
                            sx={{
                              p: 1.5,
                              bgcolor: isManuallyCreatedTask(schedule)
                                ? "#ffffff"
                                : isOpeningTask(schedule)
                                  ? "#f1f8e9"
                                  : isPresenceTask(schedule)
                                    ? "#fff8e1"
                                    : `${statusInfo.color}.100`,
                              border: isManuallyCreatedTask(schedule)
                                ? "2px solid #e0e0e0"
                                : isOpeningTask(schedule)
                                  ? "1px solid #c8e6c9"
                                  : isPresenceTask(schedule)
                                    ? "1px solid #ffcc02"
                                    : `1px solid ${statusInfo.color}.300`,
                              "&:hover": {
                                bgcolor: isManuallyCreatedTask(schedule)
                                  ? "#f5f5f5"
                                  : isOpeningTask(schedule)
                                    ? "#e8f5e8"
                                    : isPresenceTask(schedule)
                                      ? "#fff3e0"
                                      : `${statusInfo.color}.200`,
                                boxShadow: isOpeningTask(schedule)
                                  ? "0 2px 8px rgba(76, 175, 80, 0.2)"
                                  : isPresenceTask(schedule)
                                    ? "0 2px 8px rgba(255, 152, 0, 0.2)"
                                    : "none",
                              },
                            }}
                          >
                            <Box sx={{ mb: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                sx={{
                                  color: isOpeningTask(schedule)
                                    ? "#4caf50"
                                    : isPresenceTask(schedule)
                                      ? "#ff9800"
                                      : "inherit",
                                }}
                              >
                                {getTaskDisplayName(schedule)}
                              </Typography>
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ fontWeight: "bold", color: "#2196f3" }}
                              >
                                🏪{" "}
                                {schedule.store_name || "Magasin non assigné"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {formatTime(schedule.start_time)} -{" "}
                                {formatTime(schedule.end_time)}
                              </Typography>

                              {/* Employés assignés - Layout compact pour vue semaine */}
                              {schedule.assigned_employees &&
                                schedule.assigned_employees.length > 0 && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 0.3,
                                      mb: 0.5,
                                      p: 0.5,
                                      bgcolor: "#e8f5e8",
                                      borderRadius: 1,
                                      border: "1px solid #4caf50",
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#2e7d32",
                                        fontSize: "0.7rem",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                      }}
                                    >
                                      👥 Employés (
                                      {schedule.assigned_employees.length})
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 0.3,
                                        alignItems: "center",
                                      }}
                                    >
                                      {schedule.assigned_employees.map(
                                        (emp, index) => (
                                          <Box
                                            key={index}
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 0.3,
                                              p: 0.3,
                                              bgcolor: "white",
                                              borderRadius: 0.5,
                                              border: "1px solid #c8e6c9",
                                              width: "100%",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <Avatar
                                              sx={{
                                                width: 16,
                                                height: 16,
                                                fontSize: "0.6rem",
                                                bgcolor: getEmployeeColor(
                                                  emp.username
                                                ),
                                                color: "white",
                                                fontWeight: "bold",
                                              }}
                                              title={emp.username}
                                            >
                                              {getEmployeeInitials(
                                                emp.username
                                              )}
                                            </Avatar>
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                color: "#2e7d32",
                                                fontSize: "0.65rem",
                                                fontWeight: "bold",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              {emp.username}
                                            </Typography>
                                          </Box>
                                        )
                                      )}
                                    </Box>
                                  </Box>
                                )}
                              {schedule.location_name && (
                                <Typography
                                  variant="caption"
                                  display="block"
                                  sx={{
                                    fontWeight: "bold",
                                    color: "#9c27b0",
                                  }}
                                >
                                  📍 {schedule.location_name}
                                </Typography>
                              )}
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 0.5,
                              }}
                            >
                              <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "Assignation d'employés à la tâche:",
                                    schedule
                                  );
                                  handleAssignEmployeesToTask(schedule);
                                }}
                                sx={{
                                  bgcolor: "#4caf50",
                                  color: "white",
                                  fontSize: "0.6rem",
                                  height: 24,
                                  minWidth: 60,
                                  "&:hover": {
                                    bgcolor: "#45a049",
                                    transform: "scale(1.05)",
                                  },
                                }}
                              >
                                +
                              </Button>

                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
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
                          </Card>
                        );
                      })}

                      {afternoonSchedules.length === 0 && (
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 3,
                            color: "text.secondary",
                            border: "2px dashed #e0e0e0",
                            borderRadius: 1,
                            bgcolor: "#fafafa",
                          }}
                        >
                          <Typography variant="body2">
                            Aucune tâche après-midi
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>

        {/* Ligne des collectes - Matin */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              p: 2,
              bgcolor: "#f8f9fa",
              borderRadius: 2,
              border: "2px solid #9c27b0",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#9c27b0",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              🚚 Lieux de collecte - Matin (8h-12h)
            </Typography>
            <Chip
              label={`${
                collections.filter((c) => {
                  if (!c.scheduled_time) return true;
                  const startHour = parseInt(
                    c.scheduled_time.split(":")[0] || "0"
                  );
                  return startHour >= 8 && startHour < 12;
                }).length +
                filteredSchedules.filter((s) => {
                  const startHour = parseInt(
                    s.start_time?.split(":")[0] || "0"
                  );
                  return (
                    startHour >= 8 && startHour < 12 && isCollectionTask(s)
                  );
                }).length
              } lieux de collecte`}
              size="small"
              sx={{
                bgcolor: "#f3e5f5",
                color: "#9c27b0",
                fontWeight: "bold",
              }}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 2,
            }}
          >
            {weekDays.map((day, index) => {
              // Collectes du planning (collection_schedules)
              const dayCollections = Array.isArray(collections)
                ? collections.filter((collection) => {
                    const collectionDate = new Date(collection.scheduled_date);
                    return (
                      collectionDate.getDate() === day.getDate() &&
                      collectionDate.getMonth() === day.getMonth() &&
                      collectionDate.getFullYear() === day.getFullYear()
                    );
                  })
                : [];

              // Tâches de collecte du planning général
              const dayCollectionTasks = Array.isArray(filteredSchedules)
                ? filteredSchedules.filter((schedule) => {
                    const scheduleDate = new Date(schedule.scheduled_date);
                    return (
                      scheduleDate.getDate() === day.getDate() &&
                      scheduleDate.getMonth() === day.getMonth() &&
                      scheduleDate.getFullYear() === day.getFullYear() &&
                      isCollectionTask(schedule)
                    );
                  })
                : [];

              const morningCollections = dayCollections.filter((collection) => {
                if (!collection.scheduled_time) return true; // Si pas d'heure, on l'affiche partout
                const startHour = parseInt(
                  collection.scheduled_time.split(":")[0] || "0"
                );
                return startHour >= 8 && startHour < 12;
              });

              const morningCollectionTasks = dayCollectionTasks.filter(
                (schedule) => {
                  const startHour = parseInt(
                    schedule.start_time?.split(":")[0] || "0"
                  );
                  return startHour >= 8 && startHour < 12;
                }
              );

              return (
                <Card
                  key={`collection-morning-${index}`}
                  sx={{
                    minHeight: 200,
                    border: "1px solid #e0e0e0",
                    bgcolor:
                      day.toDateString() === new Date().toDateString()
                        ? "#e3f2fd"
                        : "white",
                    "&:hover": {
                      boxShadow: 2,
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s",
                  }}
                >
                  <CardHeader
                    title={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold", color: "#9c27b0" }}
                        >
                          {day.toLocaleDateString("fr-FR", {
                            weekday: "short",
                          })}
                        </Typography>
                      </Box>
                    }
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Stack spacing={1}>
                      {/* Collectes du planning (collection_schedules) */}
                      {morningCollections.map((collection, collectionIndex) => {
                        return (
                          <Card
                            key={`collection-${collectionIndex}`}
                            sx={{
                              p: 1,
                              bgcolor: "#f3e5f5",
                              border: "1px solid #e1bee7",
                              "&:hover": {
                                bgcolor: "#e8d5f2",
                                transform: "translateY(-1px)",
                                boxShadow: "0 2px 4px rgba(156, 39, 176, 0.2)",
                              },
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: "bold", color: "#9c27b0" }}
                            >
                              🚚 {collection.collection_point_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{ color: "#666" }}
                            >
                              {collection.collection_point_city ||
                                "Ville non définie"}
                            </Typography>
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{ color: "#666", mb: 1 }}
                            >
                              {collection.scheduled_time}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                {collection.employee_name && (
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#666" }}
                                  >
                                    {collection.employee_name}
                                  </Typography>
                                )}
                                {!collection.employee_name && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log(
                                        "Assignation d'employés à la collecte:",
                                        collection
                                      );
                                      handleAssignEmployeesToCollection(
                                        collection
                                      );
                                    }}
                                    sx={{
                                      bgcolor: "#9c27b0",
                                      color: "white",
                                      fontSize: "0.6rem",
                                      height: 16,
                                      minWidth: 40,
                                      "&:hover": {
                                        bgcolor: "#7b1fa2",
                                        transform: "scale(1.05)",
                                      },
                                    }}
                                  >
                                    +
                                  </Button>
                                )}
                              </Box>
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log(
                                      "Modification de la collecte:",
                                      collection
                                    );
                                    // TODO: Implémenter la modification de collecte
                                  }}
                                  sx={{
                                    color: "#2196f3",
                                    minWidth: 20,
                                    minHeight: 20,
                                    width: 20,
                                    height: 20,
                                    bgcolor: "rgba(33, 150, 243, 0.1)",
                                    border: "1px solid rgba(33, 150, 243, 0.3)",
                                    "&:hover": {
                                      bgcolor: "#e3f2fd",
                                      transform: "scale(1.2)",
                                      border: "1px solid #2196f3",
                                    },
                                  }}
                                >
                                  <Edit sx={{ fontSize: 12 }} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log(
                                      "Suppression de la collecte:",
                                      collection
                                    );
                                    // TODO: Implémenter la suppression de collecte
                                  }}
                                  sx={{
                                    color: "#f44336",
                                    minWidth: 20,
                                    minHeight: 20,
                                    width: 20,
                                    height: 20,
                                    bgcolor: "rgba(244, 67, 54, 0.1)",
                                    border: "1px solid rgba(244, 67, 54, 0.3)",
                                    "&:hover": {
                                      bgcolor: "#ffebee",
                                      transform: "scale(1.2)",
                                      border: "1px solid #f44336",
                                    },
                                  }}
                                >
                                  <Delete sx={{ fontSize: 12 }} />
                                </IconButton>
                              </Box>
                            </Box>
                          </Card>
                        );
                      })}

                      {/* Tâches de collecte du planning général */}
                      {morningCollectionTasks.map((schedule, taskIndex) => {
                        const statusInfo = getStatusInfo(schedule.status);
                        return (
                          <Card
                            key={`collection-task-${taskIndex}`}
                            sx={{
                              p: 1,
                              bgcolor: "#e8f5e8",
                              border: "1px solid #c8e6c9",
                              "&:hover": {
                                bgcolor: "#d4edda",
                                transform: "translateY(-1px)",
                                boxShadow: "0 2px 4px rgba(76, 175, 80, 0.2)",
                              },
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: "bold", color: "#4caf50" }}
                            >
                              📋 {getTaskDisplayName(schedule)}
                            </Typography>
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{ color: "#666" }}
                            >
                              {formatTime(schedule.start_time)} -{" "}
                              {formatTime(schedule.end_time)}
                            </Typography>
                          </Card>
                        );
                      })}

                      {morningCollections.length === 0 &&
                        morningCollectionTasks.length === 0 && (
                          <Box
                            sx={{
                              textAlign: "center",
                              py: 2,
                              color: "text.secondary",
                              border: "2px dashed #e0e0e0",
                              borderRadius: 1,
                              bgcolor: "#fafafa",
                            }}
                          >
                            <Typography variant="body2">
                              Aucun lieu de collecte
                            </Typography>
                          </Box>
                        )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>

        {/* Ligne des collectes - Après-midi */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              p: 2,
              bgcolor: "#f8f9fa",
              borderRadius: 2,
              border: "2px solid #9c27b0",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#9c27b0",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              🚚 Lieux de collecte - Après-midi (13h-17h)
            </Typography>
            <Chip
              label={`${
                collections.filter((c) => {
                  if (!c.scheduled_time) return true;
                  const startHour = parseInt(
                    c.scheduled_time.split(":")[0] || "0"
                  );
                  return startHour >= 13 && startHour < 17;
                }).length +
                filteredSchedules.filter((s) => {
                  const startHour = parseInt(
                    s.start_time?.split(":")[0] || "0"
                  );
                  return (
                    startHour >= 13 && startHour < 17 && isCollectionTask(s)
                  );
                }).length
              } lieux de collecte`}
              size="small"
              sx={{
                bgcolor: "#f3e5f5",
                color: "#9c27b0",
                fontWeight: "bold",
              }}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 2,
            }}
          >
            {weekDays.map((day, index) => {
              // Collectes du planning (collection_schedules)
              const dayCollections = Array.isArray(collections)
                ? collections.filter((collection) => {
                    const collectionDate = new Date(collection.scheduled_date);
                    return (
                      collectionDate.getDate() === day.getDate() &&
                      collectionDate.getMonth() === day.getMonth() &&
                      collectionDate.getFullYear() === day.getFullYear()
                    );
                  })
                : [];

              // Tâches de collecte du planning général
              const dayCollectionTasks = Array.isArray(filteredSchedules)
                ? filteredSchedules.filter((schedule) => {
                    const scheduleDate = new Date(schedule.scheduled_date);
                    return (
                      scheduleDate.getDate() === day.getDate() &&
                      scheduleDate.getMonth() === day.getMonth() &&
                      scheduleDate.getFullYear() === day.getFullYear() &&
                      isCollectionTask(schedule)
                    );
                  })
                : [];

              const afternoonCollections = dayCollections.filter(
                (collection) => {
                  if (!collection.scheduled_time) return true; // Si pas d'heure, on l'affiche partout
                  const startHour = parseInt(
                    collection.scheduled_time.split(":")[0] || "0"
                  );
                  return startHour >= 13 && startHour < 17;
                }
              );

              const afternoonCollectionTasks = dayCollectionTasks.filter(
                (schedule) => {
                  const startHour = parseInt(
                    schedule.start_time?.split(":")[0] || "0"
                  );
                  return startHour >= 13 && startHour < 17;
                }
              );

              return (
                <Card
                  key={`collection-afternoon-${index}`}
                  sx={{
                    minHeight: 200,
                    border: "1px solid #e0e0e0",
                    bgcolor:
                      day.toDateString() === new Date().toDateString()
                        ? "#e3f2fd"
                        : "white",
                    "&:hover": {
                      boxShadow: 2,
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s",
                  }}
                >
                  <CardHeader
                    title={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold", color: "#9c27b0" }}
                        >
                          {day.toLocaleDateString("fr-FR", {
                            weekday: "short",
                          })}
                        </Typography>
                      </Box>
                    }
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Stack spacing={1}>
                      {/* Collectes du planning (collection_schedules) */}
                      {afternoonCollections.map(
                        (collection, collectionIndex) => {
                          return (
                            <Card
                              key={`collection-${collectionIndex}`}
                              sx={{
                                p: 1,
                                bgcolor: "#f3e5f5",
                                border: "1px solid #e1bee7",
                                "&:hover": {
                                  bgcolor: "#e8d5f2",
                                  transform: "translateY(-1px)",
                                  boxShadow:
                                    "0 2px 4px rgba(156, 39, 176, 0.2)",
                                },
                                transition: "all 0.2s ease",
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: "bold", color: "#9c27b0" }}
                              >
                                🚚 {collection.collection_point_name}
                              </Typography>
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ color: "#666" }}
                              >
                                {collection.collection_point_city ||
                                  "Ville non définie"}
                              </Typography>
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ color: "#666", mb: 1 }}
                              >
                                {collection.scheduled_time}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  {collection.employee_name && (
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#666" }}
                                    >
                                      {collection.employee_name}
                                    </Typography>
                                  )}
                                  {!collection.employee_name && (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log(
                                          "Assignation d'employés à la collecte:",
                                          collection
                                        );
                                        handleAssignEmployeesToCollection(
                                          collection
                                        );
                                      }}
                                      sx={{
                                        bgcolor: "#9c27b0",
                                        color: "white",
                                        fontSize: "0.6rem",
                                        height: 16,
                                        minWidth: 40,
                                        "&:hover": {
                                          bgcolor: "#7b1fa2",
                                          transform: "scale(1.05)",
                                        },
                                      }}
                                    >
                                      +
                                    </Button>
                                  )}
                                </Box>
                                <Box sx={{ display: "flex", gap: 0.5 }}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log(
                                        "Modification de la collecte:",
                                        collection
                                      );
                                      // TODO: Implémenter la modification de collecte
                                    }}
                                    sx={{
                                      color: "#2196f3",
                                      minWidth: 20,
                                      minHeight: 20,
                                      width: 20,
                                      height: 20,
                                      bgcolor: "rgba(33, 150, 243, 0.1)",
                                      border:
                                        "1px solid rgba(33, 150, 243, 0.3)",
                                      "&:hover": {
                                        bgcolor: "#e3f2fd",
                                        transform: "scale(1.2)",
                                        border: "1px solid #2196f3",
                                      },
                                    }}
                                  >
                                    <Edit sx={{ fontSize: 12 }} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log(
                                        "Suppression de la collecte:",
                                        collection
                                      );
                                      // TODO: Implémenter la suppression de collecte
                                    }}
                                    sx={{
                                      color: "#f44336",
                                      minWidth: 20,
                                      minHeight: 20,
                                      width: 20,
                                      height: 20,
                                      bgcolor: "rgba(244, 67, 54, 0.1)",
                                      border:
                                        "1px solid rgba(244, 67, 54, 0.3)",
                                      "&:hover": {
                                        bgcolor: "#ffebee",
                                        transform: "scale(1.2)",
                                        border: "1px solid #f44336",
                                      },
                                    }}
                                  >
                                    <Delete sx={{ fontSize: 12 }} />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Card>
                          );
                        }
                      )}

                      {/* Tâches de collecte du planning général */}
                      {afternoonCollectionTasks.map((schedule, taskIndex) => {
                        const statusInfo = getStatusInfo(schedule.status);
                        return (
                          <Card
                            key={`collection-task-${taskIndex}`}
                            sx={{
                              p: 1,
                              bgcolor: "#e8f5e8",
                              border: "1px solid #c8e6c9",
                              "&:hover": {
                                bgcolor: "#d4edda",
                                transform: "translateY(-1px)",
                                boxShadow: "0 2px 4px rgba(76, 175, 80, 0.2)",
                              },
                              transition: "all 0.2s ease",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: "bold", color: "#4caf50" }}
                            >
                              📋 {getTaskDisplayName(schedule)}
                            </Typography>
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{ color: "#666" }}
                            >
                              {formatTime(schedule.start_time)} -{" "}
                              {formatTime(schedule.end_time)}
                            </Typography>
                          </Card>
                        );
                      })}

                      {afternoonCollections.length === 0 &&
                        afternoonCollectionTasks.length === 0 && (
                          <Box
                            sx={{
                              textAlign: "center",
                              py: 2,
                              color: "text.secondary",
                              border: "2px dashed #e0e0e0",
                              borderRadius: 1,
                              bgcolor: "#fafafa",
                            }}
                          >
                            <Typography variant="body2">
                              Aucun lieu de collecte après-midi
                            </Typography>
                          </Box>
                        )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};




const PlanningCardList = ()=>{
  return (
              <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 2,
            }}
          >
            {weekDays.map((day, index) => {
              const daySchedules = Array.isArray(filteredSchedules)
                ? filteredSchedules.filter((schedule) => {
                    const scheduleDate = new Date(schedule.scheduled_date);
                    return (
                      scheduleDate.getDate() === day.getDate() &&
                      scheduleDate.getMonth() === day.getMonth() &&
                      scheduleDate.getFullYear() === day.getFullYear()
                    );
                  })
                : [];

              const venteSchedules = daySchedules.filter((schedule) => {
                const isVente = schedule.notes?.includes("Vente -");
                const isOuverture = isOpeningTask(schedule);
                if (!isVente && !isOuverture) return false;
                const startHour = parseInt(
                  schedule.start_time?.split(":")[0] || "0"
                );
                return startHour >= 8 && startHour < 12;
              });

              return (
                <Card
                  key={`opening-${index}`}
                  sx={{
                    minHeight: 200,
                    border: "1px solid #e0e0e0",
                    bgcolor:
                      day.toDateString() === new Date().toDateString()
                        ? "#e3f2fd"
                        : "white",
                    "&:hover": {
                      boxShadow: 2,
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s",
                  }}
                >
                  <CardHeader
                    title={
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: "#4caf50" }}
                        >
                          {dayNames[index]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {day.getDate()}/{day.getMonth() + 1}
                        </Typography>
                      </Box>
                    }
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Stack spacing={1}>
                      {venteSchedules.map((schedule, scheduleIndex) => {
                        const statusInfo = getStatusInfo(schedule.status);

                        return (
                          <Card
                            key={scheduleIndex}
                            sx={{
                              p: 1.5,
                              bgcolor: isManuallyCreatedTask(schedule)
                                ? "#ffffff"
                                : isOpeningTask(schedule)
                                  ? "#f1f8e9"
                                  : isPresenceTask(schedule)
                                    ? "#fff8e1"
                                    : `${statusInfo.color}.100`,
                              border: isManuallyCreatedTask(schedule)
                                ? "2px solid #e0e0e0"
                                : isOpeningTask(schedule)
                                  ? "1px solid #c8e6c9"
                                  : isPresenceTask(schedule)
                                    ? "1px solid #ffcc02"
                                    : `1px solid ${statusInfo.color}.300`,
                              "&:hover": {
                                bgcolor: isManuallyCreatedTask(schedule)
                                  ? "#f5f5f5"
                                  : isOpeningTask(schedule)
                                    ? "#e8f5e8"
                                    : isPresenceTask(schedule)
                                      ? "#fff3e0"
                                      : `${statusInfo.color}.200`,
                                boxShadow: isOpeningTask(schedule)
                                  ? "0 2px 8px rgba(76, 175, 80, 0.2)"
                                  : isPresenceTask(schedule)
                                    ? "0 2px 8px rgba(255, 152, 0, 0.2)"
                                    : "none",
                              },
                            }}
                          >
                            <Box sx={{ mb: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                sx={{
                                  color: isOpeningTask(schedule)
                                    ? "#4caf50"
                                    : isPresenceTask(schedule)
                                      ? "#ff9800"
                                      : "inherit",
                                }}
                              >
                                {getTaskDisplayName(schedule)}
                              </Typography>
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ fontWeight: "bold", color: "#2196f3" }}
                              >
                                🏪{" "}
                                {schedule.store_name || "Magasin non assigné"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {formatTime(schedule.start_time)} -{" "}
                                {formatTime(schedule.end_time)}
                              </Typography>

                              {/* Employés assignés - Layout compact pour vue semaine */}
                              {schedule.assigned_employees &&
                                schedule.assigned_employees.length > 0 && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 0.3,
                                      mb: 0.5,
                                      p: 0.5,
                                      bgcolor: "#e8f5e8",
                                      borderRadius: 1,
                                      border: "1px solid #4caf50",
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#2e7d32",
                                        fontSize: "0.7rem",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                      }}
                                    >
                                      👥 Employés (
                                      {schedule.assigned_employees.length})
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 0.3,
                                        alignItems: "center",
                                      }}
                                    >
                                      {schedule.assigned_employees.map(
                                        (emp, index) => (
                                          <Box
                                            key={index}
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 0.3,
                                              p: 0.3,
                                              bgcolor: "white",
                                              borderRadius: 0.5,
                                              border: "1px solid #c8e6c9",
                                              width: "100%",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <Avatar
                                              sx={{
                                                width: 16,
                                                height: 16,
                                                fontSize: "0.6rem",
                                                bgcolor: getEmployeeColor(
                                                  emp.username
                                                ),
                                                color: "white",
                                                fontWeight: "bold",
                                              }}
                                              title={emp.username}
                                            >
                                              {getEmployeeInitials(
                                                emp.username
                                              )}
                                            </Avatar>
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                color: "#2e7d32",
                                                fontSize: "0.65rem",
                                                fontWeight: "bold",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              {emp.username}
                                            </Typography>
                                          </Box>
                                        )
                                      )}
                                    </Box>
                                  </Box>
                                )}
                              {schedule.location_name && (
                                <Typography
                                  variant="caption"
                                  display="block"
                                  sx={{
                                    fontWeight: "bold",
                                    color: "#9c27b0",
                                  }}
                                >
                                  📍 {schedule.location_name}
                                </Typography>
                              )}
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 0.5,
                              }}
                            >
                              <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "Assignation d'employés à la tâche:",
                                    schedule
                                  );
                                  handleAssignEmployeesToTask(schedule);
                                }}
                                sx={{
                                  bgcolor: "#4caf50",
                                  color: "white",
                                  fontSize: "0.6rem",
                                  height: 24,
                                  minWidth: 60,
                                  "&:hover": {
                                    bgcolor: "#45a049",
                                    transform: "scale(1.05)",
                                  },
                                }}
                              >
                                +
                              </Button>

                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
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
                          </Card>
                        );
                      })}

                      {venteSchedules.length === 0 && (
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 3,
                            color: "text.secondary",
                            border: "2px dashed #e0e0e0",
                            borderRadius: 1,
                            bgcolor: "#fafafa",
                          }}
                        >
                          <Typography variant="body2">Aucune tâche</Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
  )
}

const PlanningCard = ()=>{
  return (
                    <Card
                  
                  sx={{
                    minHeight: 200,
                    border: "1px solid #e0e0e0",
                    bgcolor:
                      day.toDateString() === new Date().toDateString()
                        ? "#e3f2fd"
                        : "white",
                    "&:hover": {
                      boxShadow: 2,
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s",
                  }}
                >
                  <CardHeader
                    title={
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: "#4caf50" }}
                        >
                          {dayNames[index]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {day.getDate()}/{day.getMonth() + 1}
                        </Typography>
                      </Box>
                    }
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Stack spacing={1}>
                      {venteSchedules.map((schedule, scheduleIndex) => {
                        const statusInfo = getStatusInfo(schedule.status);

                        return (
                          <Card
                            key={scheduleIndex}
                            sx={{
                              p: 1.5,
                              bgcolor: isManuallyCreatedTask(schedule)
                                ? "#ffffff"
                                : isOpeningTask(schedule)
                                  ? "#f1f8e9"
                                  : isPresenceTask(schedule)
                                    ? "#fff8e1"
                                    : `${statusInfo.color}.100`,
                              border: isManuallyCreatedTask(schedule)
                                ? "2px solid #e0e0e0"
                                : isOpeningTask(schedule)
                                  ? "1px solid #c8e6c9"
                                  : isPresenceTask(schedule)
                                    ? "1px solid #ffcc02"
                                    : `1px solid ${statusInfo.color}.300`,
                              "&:hover": {
                                bgcolor: isManuallyCreatedTask(schedule)
                                  ? "#f5f5f5"
                                  : isOpeningTask(schedule)
                                    ? "#e8f5e8"
                                    : isPresenceTask(schedule)
                                      ? "#fff3e0"
                                      : `${statusInfo.color}.200`,
                                boxShadow: isOpeningTask(schedule)
                                  ? "0 2px 8px rgba(76, 175, 80, 0.2)"
                                  : isPresenceTask(schedule)
                                    ? "0 2px 8px rgba(255, 152, 0, 0.2)"
                                    : "none",
                              },
                            }}
                          >
                            <Box sx={{ mb: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                sx={{
                                  color: isOpeningTask(schedule)
                                    ? "#4caf50"
                                    : isPresenceTask(schedule)
                                      ? "#ff9800"
                                      : "inherit",
                                }}
                              >
                                {getTaskDisplayName(schedule)}
                              </Typography>
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ fontWeight: "bold", color: "#2196f3" }}
                              >
                                🏪{" "}
                                {schedule.store_name || "Magasin non assigné"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {formatTime(schedule.start_time)} -{" "}
                                {formatTime(schedule.end_time)}
                              </Typography>

                              {/* Employés assignés - Layout compact pour vue semaine */}
                              {schedule.assigned_employees &&
                                schedule.assigned_employees.length > 0 && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 0.3,
                                      mb: 0.5,
                                      p: 0.5,
                                      bgcolor: "#e8f5e8",
                                      borderRadius: 1,
                                      border: "1px solid #4caf50",
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#2e7d32",
                                        fontSize: "0.7rem",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                      }}
                                    >
                                      👥 Employés (
                                      {schedule.assigned_employees.length})
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 0.3,
                                        alignItems: "center",
                                      }}
                                    >
                                      {schedule.assigned_employees.map(
                                        (emp, index) => (
                                          <Box
                                            key={index}
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 0.3,
                                              p: 0.3,
                                              bgcolor: "white",
                                              borderRadius: 0.5,
                                              border: "1px solid #c8e6c9",
                                              width: "100%",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <Avatar
                                              sx={{
                                                width: 16,
                                                height: 16,
                                                fontSize: "0.6rem",
                                                bgcolor: getEmployeeColor(
                                                  emp.username
                                                ),
                                                color: "white",
                                                fontWeight: "bold",
                                              }}
                                              title={emp.username}
                                            >
                                              {getEmployeeInitials(
                                                emp.username
                                              )}
                                            </Avatar>
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                color: "#2e7d32",
                                                fontSize: "0.65rem",
                                                fontWeight: "bold",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              {emp.username}
                                            </Typography>
                                          </Box>
                                        )
                                      )}
                                    </Box>
                                  </Box>
                                )}
                              {schedule.location_name && (
                                <Typography
                                  variant="caption"
                                  display="block"
                                  sx={{
                                    fontWeight: "bold",
                                    color: "#9c27b0",
                                  }}
                                >
                                  📍 {schedule.location_name}
                                </Typography>
                              )}
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 0.5,
                              }}
                            >
                              <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "Assignation d'employés à la tâche:",
                                    schedule
                                  );
                                  handleAssignEmployeesToTask(schedule);
                                }}
                                sx={{
                                  bgcolor: "#4caf50",
                                  color: "white",
                                  fontSize: "0.6rem",
                                  height: 24,
                                  minWidth: 60,
                                  "&:hover": {
                                    bgcolor: "#45a049",
                                    transform: "scale(1.05)",
                                  },
                                }}
                              >
                                +
                              </Button>

                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
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
                          </Card>
                        );
                      })}

                      {venteSchedules.length === 0 && (
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 3,
                            color: "text.secondary",
                            border: "2px dashed #e0e0e0",
                            borderRadius: 1,
                            bgcolor: "#fafafa",
                          }}
                        >
                          <Typography variant="body2">Aucune tâche</Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
  )
}


interface TaskInfos {
manualCreated:boolean
opening:boolean
presence:boolean
}
const CardTasks = ()=>{

  const cssManual= {
    bgcolor:"#ffffff",
    border:"2px solid #e0e0e0",
    hover_bgcolor:"#f5f5f5",
    boxShadow:"none"
  }
    const cssOpening= {
    bgcolor:"#f1f8e9",
    border:"1px solid #c8e6c9",
    hover_bgcolor:"#e8f5e8",
    boxShadow:"0 2px 8px rgba(76, 175, 80, 0.2)"
  }
      const cssPresence= {
    bgcolor:"#fff8e1",
    border:"1px solid #ffcc02",
    hover_bgcolor:"#fff3e0",
    boxShadow:"0 2px 8px rgba(255, 152, 0, 0.2)"
  }
        const autre= {
    bgcolor:"#fff8e1",
    border:"1px solid #ffcc02",
    hover_bgcolor:"#fff3e0",
    boxShadow:"0 2px 8px rgba(255, 152, 0, 0.2)"
  }

  return (<>

                          <Card
                            key={scheduleIndex}
                            sx={{
                              p: 1.5,
                              bgcolor: 
                                 "#ffffff",
                                
                              border: 
                                 "2px solid #e0e0e0",
                                
                              "&:hover": {
                                
                                  "#f5f5f5",
                                 
                                boxShadow: 
                                   "0 2px 8px rgba(76, 175, 80, 0.2)"
                                
                              },
                            }}
                          >
                            <Box sx={{ mb: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                sx={{
                                  color:  "#4caf50"
                                   
                                }}
                              >
                                {getTaskDisplayName(schedule)}
                              </Typography>
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ fontWeight: "bold", color: "#2196f3" }}
                              >
                                🏪{" "}
                                {schedule.store_name || "Magasin non assigné"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {formatTime(schedule.start_time)} -{" "}
                                {formatTime(schedule.end_time)}
                              </Typography>

                              {/* Employés assignés - Layout compact pour vue semaine */}
                              {schedule.assigned_employees &&
                                schedule.assigned_employees.length > 0 && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 0.3,
                                      mb: 0.5,
                                      p: 0.5,
                                      bgcolor: "#e8f5e8",
                                      borderRadius: 1,
                                      border: "1px solid #4caf50",
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#2e7d32",
                                        fontSize: "0.7rem",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                      }}
                                    >
                                      👥 Employés (
                                      {schedule.assigned_employees.length})
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 0.3,
                                        alignItems: "center",
                                      }}
                                    >
                                      {schedule.assigned_employees.map(
                                        (emp, index) => (
                                          <Box
                                            key={index}
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 0.3,
                                              p: 0.3,
                                              bgcolor: "white",
                                              borderRadius: 0.5,
                                              border: "1px solid #c8e6c9",
                                              width: "100%",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <Avatar
                                              sx={{
                                                width: 16,
                                                height: 16,
                                                fontSize: "0.6rem",
                                                bgcolor: getEmployeeColor(
                                                  emp.username
                                                ),
                                                color: "white",
                                                fontWeight: "bold",
                                              }}
                                              title={emp.username}
                                            >
                                              {getEmployeeInitials(
                                                emp.username
                                              )}
                                            </Avatar>
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                color: "#2e7d32",
                                                fontSize: "0.65rem",
                                                fontWeight: "bold",
                                                whiteSpace: "nowrap",
                                              }}
                                            >
                                              {emp.username}
                                            </Typography>
                                          </Box>
                                        )
                                      )}
                                    </Box>
                                  </Box>
                                )}
                              {schedule.location_name && (
                                <Typography
                                  variant="caption"
                                  display="block"
                                  sx={{
                                    fontWeight: "bold",
                                    color: "#9c27b0",
                                  }}
                                >
                                  📍 {schedule.location_name}
                                </Typography>
                              )}
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 0.5,
                              }}
                            >
                              <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "Assignation d'employés à la tâche:",
                                    schedule
                                  );
                                  handleAssignEmployeesToTask(schedule);
                                }}
                                sx={{
                                  bgcolor: "#4caf50",
                                  color: "white",
                                  fontSize: "0.6rem",
                                  height: 24,
                                  minWidth: 60,
                                  "&:hover": {
                                    bgcolor: "#45a049",
                                    transform: "scale(1.05)",
                                  },
                                }}
                              >
                                +
                              </Button>

                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
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
                          </Card>
                        );

  </>

  )
}