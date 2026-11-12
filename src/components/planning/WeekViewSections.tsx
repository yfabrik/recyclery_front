import {
  LocalShipping,
  LocationOn,
  ShoppingCart,
  WbSunny,
} from "@mui/icons-material";
import { Box } from "@mui/material";
import { timeSlotOfMinutes, type WorkdayTimeSlotValue } from "../../constants/workdayTimeSlots";
import type { TaskModel } from "../../interfaces/Models";
import WeekTaskSection, {
  TaskCard,
  TaskCardContent,
} from "./weekView/WeekTaskSection";

interface WeekViewSectionsProps {
  schedules: TaskModel[];
  handleAssignEmployeesToTask: (e: TaskModel) => void;
  handleOpenDialog: (t: TaskModel | null, day?: Date) => void;
  handleDeleteTask: (t: TaskModel) => void;
  selectedDate: Date;
}

const WeekViewSections = ({
  schedules,
  handleAssignEmployeesToTask,
  handleOpenDialog,
  handleDeleteTask,
  selectedDate,
}: WeekViewSectionsProps) => {
  const wd = () => {
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour commencer le lundi
    startOfWeek.setDate(diff);

    const wd = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      wd.push(date);
    }
    return wd;
  };
  const weekDays = wd();

  const filteredSchedules = (
    category: TaskModel["category"] = "vente",
    slot: WorkdayTimeSlotValue,
  ) => {
    return (
      schedules?.filter((s) => {
        if (s.category != category) return false;
        const start = new Date(s.start_time);
        return timeSlotOfMinutes(start.getHours() * 60 + start.getMinutes()) === slot;
      }) || []
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <WeekTaskSection
        title={
          <>
            <ShoppingCart sx={{ fontSize: 28, mr: 0.5 }} />
            Ventes
          </>
        }
        chipLabel={`${filteredSchedules("vente", "morning").length + filteredSchedules("vente", "afternoon").length
          } tâches`}
        chipSx={{ bgcolor: "#e8f5e8", color: "#4caf50", fontWeight: "bold" }}
        cardColor="#4caf50"
        borderColor="#4caf50"
        rowLabels={["MATIN", "APRÈS-MIDI"]}
      >
        {weekDays.map((day) => {
          const daySchedules = filteredSchedules("vente", "morning").filter((schedule) => {
            const scheduleDate = new Date(schedule.scheduled_date);
            return (
              scheduleDate.getDate() === day.getDate() &&
              scheduleDate.getMonth() === day.getMonth() &&
              scheduleDate.getFullYear() === day.getFullYear()
            );
          });
          return (
            <TaskCard
              key={`m-${day.toISOString()}`}
              day={day}
              dayName={day.toLocaleString(undefined, { weekday: "long" })}
              cardColor="#4caf50"
              emptyText="Aucune tâche"
            >
              {daySchedules.map((schedule, j) => (
                <TaskCardContent
                  key={j}
                  schedule={schedule}
                  handleAssignEmployeesToTask={handleAssignEmployeesToTask}
                  handleOpenDialog={handleOpenDialog}
                  handleDeleteTask={handleDeleteTask}
                />
              ))}
            </TaskCard>
          );
        })}
        {weekDays.map((day) => {
          const daySchedules = filteredSchedules("vente", "afternoon").filter((schedule) => {
            const scheduleDate = new Date(schedule.scheduled_date);
            return (
              scheduleDate.getDate() === day.getDate() &&
              scheduleDate.getMonth() === day.getMonth() &&
              scheduleDate.getFullYear() === day.getFullYear()
            );
          });
          return (
            <TaskCard
              key={`a-${day.toISOString()}`}
              day={day}
              dayName={day.toLocaleString(undefined, { weekday: "long" })}
              cardColor="#4caf50"
              emptyText="Aucune tâche"
            >
              {daySchedules.map((schedule, j) => (
                <TaskCardContent
                  key={j}
                  schedule={schedule}
                  handleAssignEmployeesToTask={handleAssignEmployeesToTask}
                  handleOpenDialog={handleOpenDialog}
                  handleDeleteTask={handleDeleteTask}
                />
              ))}
            </TaskCard>
          );
        })}
      </WeekTaskSection>

      <WeekTaskSection
        title={
          <>
            <LocationOn sx={{ fontSize: 28, mr: 0.5 }} />
            Déchetteries
          </>
        }
        chipLabel={`${filteredSchedules("point", "morning").length + filteredSchedules("point", "afternoon").length} présences`}
        chipSx={{ bgcolor: "#fff3e0", color: "#ff9800", fontWeight: "bold" }}
        cardColor="#ff9800"
        borderColor="#ff9800"
        rowLabels={["MATIN", "APRÈS-MIDI"]}
      >
        {weekDays.map((day) => {
          const daySchedules = Array.isArray(schedules)
            ? filteredSchedules("point", "morning").filter((schedule) => {
              const scheduleDate = new Date(schedule.scheduled_date);
              return (
                scheduleDate.getDate() === day.getDate() &&
                scheduleDate.getMonth() === day.getMonth() &&
                scheduleDate.getFullYear() === day.getFullYear()
              );
            })
            : [];
          return (
            <TaskCard
              key={`m-${day.toISOString()}`}
              day={day}
              dayName={day.toLocaleString(undefined, { weekday: "long" })}
              cardColor="#ff9800"
              emptyText="Aucune présence"
            >
              {daySchedules.map((schedule, j) => {
                return (
                  <TaskCardContent
                    key={j}
                    schedule={schedule}
                    handleAssignEmployeesToTask={handleAssignEmployeesToTask}
                    handleOpenDialog={handleOpenDialog}
                    handleDeleteTask={handleDeleteTask}
                  ></TaskCardContent>
                );
              })}
            </TaskCard>
          );
        })}

        {weekDays.map((day) => {
          const daySchedules = Array.isArray(schedules)
            ? filteredSchedules("point", "afternoon").filter((schedule) => {
              const scheduleDate = new Date(schedule.scheduled_date);
              return (
                scheduleDate.getDate() === day.getDate() &&
                scheduleDate.getMonth() === day.getMonth() &&
                scheduleDate.getFullYear() === day.getFullYear()
              );
            })
            : [];
          return (
            <TaskCard
              key={`a-${day.toISOString()}`}
              day={day}
              dayName={day.toLocaleString(undefined, { weekday: "long" })}
              cardColor="#ff9800"
              emptyText="Aucune présence après-midi"
            >
              {daySchedules.map((schedule, j) => {
                return (
                  <TaskCardContent
                    key={j}
                    schedule={schedule}
                    handleAssignEmployeesToTask={handleAssignEmployeesToTask}
                    handleOpenDialog={handleOpenDialog}
                    handleDeleteTask={handleDeleteTask}
                  ></TaskCardContent>
                );
              })}
            </TaskCard>
          );
        })}
      </WeekTaskSection>

      <WeekTaskSection
        title={
          <>
            <WbSunny sx={{ fontSize: 28, mr: 0.5 }} />
            Tâches normales
          </>
        }
        chipLabel={`${filteredSchedules("custom", "morning").length + filteredSchedules("custom", "afternoon").length} tâches`}
        chipSx={{ bgcolor: "#e3f2fd", color: "#2196f3", fontWeight: "bold" }}
        cardColor="#2196f3"
        borderColor="#2196f3"
        // showAddButton
        // onAddClick={(day) => handleOpenDialog(null, day)}
        rowLabels={["MATIN", "APRÈS-MIDI"]}
      >
        {weekDays.map((day) => {
          const daySchedules = Array.isArray(schedules)
            ? filteredSchedules("custom", "morning").filter((schedule) => {
              const scheduleDate = new Date(schedule.scheduled_date);
              return (
                scheduleDate.getDate() === day.getDate() &&
                scheduleDate.getMonth() === day.getMonth() &&
                scheduleDate.getFullYear() === day.getFullYear()
              );
            })
            : [];
          return (
            <TaskCard
              key={`m-${day.toISOString()}`}
              day={day}
              dayName={day.toLocaleString(undefined, { weekday: "long" })}
              cardColor="#2196f3"
              emptyText="Aucune tâche matin"
              showAddButton
              onAddClick={(day) => handleOpenDialog(null, day)}
            >
              {daySchedules.map((schedule, j) => {
                return (
                  <TaskCardContent
                    key={j}
                    schedule={schedule}
                    handleAssignEmployeesToTask={handleAssignEmployeesToTask}
                    handleOpenDialog={handleOpenDialog}
                    handleDeleteTask={handleDeleteTask}
                  ></TaskCardContent>
                );
              })}
            </TaskCard>
          );
        })}

        {weekDays.map((day) => {
          const daySchedules = Array.isArray(schedules)
            ? filteredSchedules("custom", "afternoon").filter((schedule) => {
              const scheduleDate = new Date(schedule.scheduled_date);
              return (
                scheduleDate.getDate() === day.getDate() &&
                scheduleDate.getMonth() === day.getMonth() &&
                scheduleDate.getFullYear() === day.getFullYear()
              );
            })
            : [];
          return (
            <TaskCard
              key={`a-${day.toISOString()}`}
              day={day}
              dayName={day.toLocaleString(undefined, { weekday: "long" })}
              cardColor="#2196f3"
              emptyText="Aucune tâche après-midi"
              showAddButton
              onAddClick={(day) => handleOpenDialog(null, day)}
            >
              {daySchedules.map((schedule, j) => {
                return (
                  <TaskCardContent
                    key={j}
                    schedule={schedule}
                    handleAssignEmployeesToTask={handleAssignEmployeesToTask}
                    handleOpenDialog={handleOpenDialog}
                    handleDeleteTask={handleDeleteTask}
                  ></TaskCardContent>
                );
              })}
            </TaskCard>
          );
        })}
      </WeekTaskSection>

      <WeekTaskSection
        title={
          <>
            <LocalShipping sx={{ fontSize: 28, mr: 0.5 }} />
            Logistique
          </>
        }
        chipLabel={`${filteredSchedules("collection", "morning").length + filteredSchedules("collection", "afternoon").length} lieux de collecte`}
        chipSx={{ bgcolor: "#f3e5f5", color: "#9c27b0", fontWeight: "bold" }}
        cardColor="#9c27b0"
        borderColor="#9c27b0"
        rowLabels={["MATIN", "APRÈS-MIDI"]}
      >
        {weekDays.map((day) => {
          const daySchedules = Array.isArray(schedules)
            ? filteredSchedules("collection", "morning").filter((schedule) => {
              const scheduleDate = new Date(schedule.scheduled_date);
              return (
                scheduleDate.getDate() === day.getDate() &&
                scheduleDate.getMonth() === day.getMonth() &&
                scheduleDate.getFullYear() === day.getFullYear()
              );
            })
            : [];
          return (
            <TaskCard
              key={`m-${day.toISOString()}`}
              day={day}
              dayName={day.toLocaleString(undefined, { weekday: "long" })}
              cardColor="#9c27b0"
              emptyText="Aucun lieu de collecte"
            >
              {daySchedules.map((schedule, j) => {
                return (
                  <TaskCardContent
                    key={j}
                    schedule={schedule}
                    handleAssignEmployeesToTask={handleAssignEmployeesToTask}
                    handleOpenDialog={handleOpenDialog}
                    handleDeleteTask={handleDeleteTask}
                  ></TaskCardContent>
                );
              })}
            </TaskCard>
          );
        })}
     
        {weekDays.map((day) => {
          const daySchedules = Array.isArray(schedules)
            ? filteredSchedules("collection", "afternoon").filter((schedule) => {
              const scheduleDate = new Date(schedule.scheduled_date);
              return (
                scheduleDate.getDate() === day.getDate() &&
                scheduleDate.getMonth() === day.getMonth() &&
                scheduleDate.getFullYear() === day.getFullYear()
              );
            })
            : [];
          return (
            <TaskCard
              key={`a-${day.toISOString()}`}
              day={day}
              dayName={day.toLocaleString(undefined, { weekday: "long" })}
              cardColor="#9c27b0"
              emptyText="Aucun lieu de collecte"
            >
              {daySchedules.map((schedule, j) => {
                return (
                  <TaskCardContent
                    key={j}
                    schedule={schedule}
                    handleAssignEmployeesToTask={handleAssignEmployeesToTask}
                    handleOpenDialog={handleOpenDialog}
                    handleDeleteTask={handleDeleteTask}
                  ></TaskCardContent>
                );
              })}
            </TaskCard>
          );
        })}
      </WeekTaskSection>
    </Box>
  );
};

export default WeekViewSections;
