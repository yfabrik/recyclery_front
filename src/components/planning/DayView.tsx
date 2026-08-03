import {
  Add,
  Delete,
  Edit,
  Store,
  WbSunny,
  WbTwilight,
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
  Typography
} from "@mui/material";
import { useMemo } from "react";
import {
  getTaskPriority,
  TASK_PRIORITIES
} from "../../constants/taskPriorities";
import {
  getTaskStatus
} from "../../constants/taskStatuses";
import type { TaskModel } from "../../interfaces/Models";
import { formatTime } from "../../services/dateService";
import { getTaskVariant, taskCardStyles } from "./planningTaskStyles";

interface DayViewProps {
  schedules: TaskModel[];
  handleOpenDialog: (a?: TaskModel | null, b?: Date) => void;
  handleDeleteTask: (t: TaskModel) => void;
  selectedDate: Date;
  isManuallyCreatedTask?: (t: TaskModel) => boolean;
  handleAssignEmployeesToTask: (e: TaskModel) => void;
}

const getStartHour = (schedule: TaskModel) =>
  new Date(schedule.start_time).getHours();

const getPriorityInfo = (priority: string | null) =>
  getTaskPriority(priority ?? "") ?? TASK_PRIORITIES[1];

export const DayView = ({
  handleOpenDialog,
  handleDeleteTask,
  schedules,
  selectedDate,
  isManuallyCreatedTask = () => false,
  handleAssignEmployeesToTask,
}: DayViewProps) => {
  const daySchedules = useMemo(() => {
    return Array.isArray(schedules)
      ? schedules.filter((schedule) => {
        const scheduleDate = new Date(schedule.scheduled_date);
        return (
          scheduleDate.getDate() === selectedDate.getDate() &&
          scheduleDate.getMonth() === selectedDate.getMonth() &&
          scheduleDate.getFullYear() === selectedDate.getFullYear()
        );
      })
      : [];
  }, [schedules, selectedDate]);

  const morningSchedules = useMemo(
    () =>
      daySchedules.filter((s) => {
        const startHour = getStartHour(s);
        return startHour >= 8 && startHour < 12;
      }),
    [daySchedules],
  );

  const afternoonSchedules = useMemo(
    () =>
      daySchedules.filter((s) => {
        const startHour = getStartHour(s);
        return startHour >= 13 && startHour < 17;
      }),
    [daySchedules],
  );

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
                    sx={{ fontWeight: "bold", color: "#4caf50", display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <WbTwilight fontSize="small" />
                    Matin (8h - 12h)
                  </Typography>
                  <Chip
                    label={`${morningSchedules.length} tâche${morningSchedules.length > 1 ? "s" : ""
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
                {morningSchedules.length > 0 ? (
                  morningSchedules
                    .map((schedule, index) => {

                      return <TaskCard
                        handleAssignEmployeesToTask={handleAssignEmployeesToTask}
                        key={index}
                        schedule={schedule}
                        handleOpenDialog={handleOpenDialog}
                        handleDeleteTask={handleDeleteTask}
                        isManuallyCreatedTask={isManuallyCreatedTask}
                      />
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
                    sx={{ fontWeight: "bold", color: "#ff9800", display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <WbSunny fontSize="small" />
                    Après-midi (13h30 - 17h)
                  </Typography>
                  <Chip
                    label={`${afternoonSchedules.length} tâche${afternoonSchedules.length > 1 ? "s" : ""
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
                {afternoonSchedules.length > 0 ? (
                  afternoonSchedules
                    .map((schedule, index) => {

                      return <TaskCard
                        handleAssignEmployeesToTask={handleAssignEmployeesToTask}
                        key={index}
                        schedule={schedule}

                        handleOpenDialog={handleOpenDialog}
                        handleDeleteTask={handleDeleteTask}
                        isManuallyCreatedTask={isManuallyCreatedTask}
                      />

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

interface TaskCardProps {
  schedule: TaskModel;

  handleOpenDialog: (schedule: TaskModel) => void;
  handleDeleteTask: (schedule: TaskModel) => void;
  isManuallyCreatedTask: (schedule: TaskModel) => boolean;
  handleAssignEmployeesToTask: (e: TaskModel) => void;
}
const TaskCard = ({ schedule, handleAssignEmployeesToTask, handleOpenDialog, handleDeleteTask, isManuallyCreatedTask }: TaskCardProps) => {
  const statusInfo = getTaskStatus(schedule.status);
  const priorityInfo = getPriorityInfo(schedule.priority || "");
  return (
    <Card
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
              color: schedule.category == "vente"
                ? "#4caf50"
                : schedule.category == "point"
                  ? "#ff9800"
                  : "inherit",
            }}
          >
            {schedule.name}
          </Typography>
          {schedule.category == "vente" && (
            <Chip
              icon={<Store sx={{ color: "white !important" }} />}
              label="Ouverture"
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
          sx={{ fontWeight: "bold", color: "#2196f3", display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <Store sx={{ fontSize: 14 }} />
          {schedule.Recyclery?.name || "Magasin non assigné"}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
        >
          {formatTime(new Date(schedule.start_time))} -{" "}
          {formatTime(new Date(schedule.end_time))}
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
}