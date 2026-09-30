import {
  Add,
  Assignment,
  Delete,
  Edit,
  Groups,
  LocationOn,
  Person,
  Store,
} from "@mui/icons-material";
import { Avatar, Box, Button, IconButton, Typography } from "@mui/material";
import type { TaskModel } from "../../interfaces/Models";
import { weekDays } from "../../services/dateService";
import { employeeColor, employeeInitials } from "../../employee";
import {
  calendarTaskStyles,
  getTaskVariant,
  type TaskVariant
} from "./planningTaskStyles";

interface CalendarViewProps {
  schedules: TaskModel[];
  handleOpenDialog: (a?: TaskModel | null, b?: Date) => void;
  handleDeleteTask: (t: TaskModel) => void;
  handleAssignEmployeesToTask: (t: TaskModel) => void;
  selectedDate: Date;
}
interface CalendarDay {
  date: Date;
  schedules: TaskModel[];
  isCurrentMonth: boolean;
  isToday: boolean;
}
export const CalendarView = ({
  handleOpenDialog,
  handleDeleteTask,
  schedules,
  selectedDate,
  handleAssignEmployeesToTask,
}: CalendarViewProps) => {
  const getScheduleDays = (currentDate: Date) => {
    const daySchedules = Array.isArray(schedules)
      ? schedules.filter((schedule) => {
        const scheduleDate = new Date(schedule.scheduled_date);
        const matches =
          scheduleDate.getDate() === currentDate.getDate() &&
          scheduleDate.getMonth() === currentDate.getMonth() &&
          scheduleDate.getFullYear() === currentDate.getFullYear();

        return matches;
      })
      : [];
    return daySchedules;
  };
  const generateCalendarDays = (date = new Date()): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Premier lundi de la semaine contenant le premier jour
    const startDate = new Date(firstDay);
    startDate.setDate(
      firstDay.getDate() -
      (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1),
    );

    const days = [];
    const currentDate = new Date(startDate);

    // Générer 42 jours (6 semaines)
    for (let i = 0; i < 42; i++) {
      days.push({
        date: new Date(currentDate),
        schedules: getScheduleDays(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === new Date().toDateString(),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };
  const calendarDays = generateCalendarDays(selectedDate);

  return (
    <Box>
      {/* Grille du calendrier */}
      {/* <Calendar
        schedules={schedules}
        getTaskDisplayName={getTaskDisplayName}
        handleDeleteTask={handleDeleteTask}
        isOpeningTask={isOpeningTask}
        isPresenceTask={isPresenceTask}
      /> */}
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* En-têtes des jours */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            borderBottom: "2px solid #e0e0e0",
          }}
        >
          {weekDays().map((day) => (
            <Box
              key={day}
              sx={{
                py: 2,
                textAlign: "center",
                fontWeight: "bold",
                bgcolor: "#f8f9fa",
                borderRight: "1px solid #e0e0e0",
                "&:last-child": { borderRight: "none" },
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "#666", textTransform: "capitalize" }}
              >
                {day}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Jours du calendrier */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {calendarDays.map((day, index) => (
            <Box
              key={index}
              onClick={() => handleOpenDialog(null, day.date)}
              sx={{
                minHeight: 100,
                borderRight: "1px solid #e0e0e0",
                borderBottom: "1px solid #e0e0e0",
                position: "relative",
                bgcolor: day.isToday ? "#e3f2fd" : "white",
                "&:nth-of-type(7n)": { borderRight: "none" },
                "&:hover": {
                  bgcolor: day.isToday ? "#e3f2fd" : "#f8f9fa",
                  cursor: "pointer",
                },
              }}
            >
              <Box sx={{ p: 1.5, height: "100%" }}>
                {/* Numéro du jour */}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: day.isToday ? "bold" : "normal",
                    color: day.isCurrentMonth ? "#333" : "#999",
                    mb: 1,
                    fontSize: "0.875rem",
                  }}
                >
                  {day.date.toLocaleDateString(undefined, { day: "2-digit" })}
                </Typography>

                {/* Événements du jour */}
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  {day.schedules.slice(0, 2).map((schedule, scheduleIndex) =>
                    <EventCard key={scheduleIndex} schedule={schedule} handleOpenDialog={handleOpenDialog} handleDeleteTask={handleDeleteTask} handleAssignEmployeesToTask={handleAssignEmployeesToTask} />
                  )}

                  {/* Indicateur s'il y a plus d'événements */}
                  {day.schedules.length > 2 && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#999",
                        textAlign: "center",
                        mt: 0.5,
                        fontSize: "0.7rem",
                      }}
                    >
                      +{day.schedules.length - 2} autres
                    </Typography>
                  )}

                  {/* Indicateur pour ajouter un événement si le jour est vide */}
                  {day.schedules.length === 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mt: 2,
                        opacity: 0.3,
                      }}
                    >
                      <Add sx={{ fontSize: 16, color: "#666" }} />
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

const TaskIcon = ({ variant }: { variant: TaskVariant }) => {
  const color = calendarTaskStyles[variant].iconColor;
  if (variant === "opening") return <Store sx={{ fontSize: 12, color }} />;
  if (variant === "presence") return <LocationOn sx={{ fontSize: 12, color }} />;
  return <Assignment sx={{ fontSize: 12, color }} />;
};


interface EventCardProps {
  schedule: TaskModel;
  handleOpenDialog: (a?: TaskModel | null) => void;
  handleDeleteTask: (t: TaskModel) => void;
  handleAssignEmployeesToTask: (t: TaskModel) => void;
}

const EventCard = ({ schedule, handleOpenDialog, handleDeleteTask, handleAssignEmployeesToTask }: EventCardProps) => {
  const variant = getTaskVariant(schedule);
  const styles = calendarTaskStyles[variant];

  return (
    <Box
      onClick={(e) => {
        e.stopPropagation(); // Empêcher la propagation du clic vers le jour
        handleOpenDialog(schedule);
      }}
      sx={styles.box}
    >
      <Box sx={{ mb: 0.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Typography
              variant="caption"
              fontWeight="bold"
              sx={styles.typography}
            >
              {schedule.name}
            </Typography>
            <TaskIcon variant={variant} />
          </Box>
        </Box>

        {/* Affichage des employés assignés */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mt: 0.5,
          }}
        >
          <Person sx={{ fontSize: 10, color: "#666" }} />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.3,
              flexWrap: "wrap",
            }}
          >
            {/* Employés assignés au type de tâche prédéfinie */}
            {schedule.Employees &&
              schedule.Employees.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.3,
                    ml: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#666",
                      fontSize: "0.6rem",
                    }}
                  >
                    +{schedule.Employees.length} autres
                  </Typography>
                  {schedule.Employees
                    .slice(0, 2)
                    .map((emp, index) => (
                      <Avatar
                        key={index}
                        sx={{
                          width: 14,
                          height: 14,
                          fontSize: "0.5rem",
                          bgcolor: employeeColor(emp),
                          color: "white",
                          fontWeight: "bold",
                        }}
                        title={emp.fullName||emp.prenom}
                      >
                        {employeeInitials(emp)}
                      </Avatar>
                    ))}
                </Box>
              )}

            {/* Employés assignés à cette tâche spécifique du planning */}
            {schedule.Employees &&
              schedule.Employees.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                    mt: 0.5,
                    p: 0.8,
                    bgcolor: "#e8f5e8",
                    borderRadius: 1.5,
                    border: "2px solid #4caf50",
                    boxShadow:
                      "0 2px 4px rgba(76, 175, 80, 0.2)",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#2e7d32",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      textAlign: "center",
                      mb: 0.5,
                    }}
                  >
                    <Groups sx={{ fontSize: 14, mr: 0.5 }} />
                    Employés assignés (
                    {schedule.Employees.length})
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.8,
                      justifyContent: "center",
                    }}
                  >
                    {schedule.Employees.map(
                      (emp, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            p: 0.5,
                            bgcolor: "white",
                            borderRadius: 1,
                            border: "1px solid #c8e6c9",
                            minWidth: "fit-content",
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              fontSize: "0.8rem",
                              bgcolor: employeeColor(emp),
                              color: "white",
                              fontWeight: "bold",
                              border: "2px solid #4caf50",
                            }}
                            title={emp.fullName||emp.prenom}
                          >
                            {employeeInitials(emp)}
                          </Avatar>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#2e7d32",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              maxWidth: 100,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {emp.fullName||emp.prenom}
                          </Typography>
                        </Box>
                      ),
                    )}
                  </Box>
                </Box>
              )}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 0.5,
          mt: 0.5,
        }}
      >
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
            handleOpenDialog(schedule);
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
            handleDeleteTask(schedule);
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <Person sx={{ fontSize: 10, color: "#666" }} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.3,
          }}
        ></Box>
      </Box>
    </Box>
  );

}