import {
  LocalShipping,
  LocationOn,
  ShoppingCart,
  WbSunny,
} from "@mui/icons-material";
import { Box } from "@mui/material";
import type { EmployeeModel, TaskModel } from "../../interfaces/Models";
import WeekTaskSection, {
  TaskCard,
  TaskCardContent,
} from "./weekView/WeekTaskSection";

interface WeekViewSectionsProps {
  schedules: TaskModel[];
  getEmployeeColor: (employee: EmployeeModel) => string;
  getEmployeeInitials: (employee: EmployeeModel) => string;
  handleAssignEmployeesToTask: (e: TaskModel) => void;
  handleOpenDialog: (t: TaskModel | null, day?: Date) => void;
  handleDeleteTask: (t: TaskModel) => void;
  selectedDate: Date;
}



const WeekViewSections = ({
  schedules,
  getEmployeeColor,
  getEmployeeInitials,
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
    start: number | null = null,
    end: number | null = null,
  ) => {
    return (
      schedules?.filter(
        (s) =>
          s.category == category &&
          (!start || new Date(s.start_time).getHours() >= start) &&
          (!end || new Date(s.start_time).getHours() <= end),
      ) || []
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
        chipLabel={`${filteredSchedules("vente", 8, 12).length + filteredSchedules("vente", 13, 17).length
          } tâches`}
        chipSx={{ bgcolor: "#e8f5e8", color: "#4caf50", fontWeight: "bold" }}
        cardColor="#4caf50"
        borderColor="#4caf50"
        rowLabels={["MATIN", "APRÈS-MIDI"]}
      >
        {weekDays.map((day) => {
          const daySchedules = filteredSchedules("vente", 8, 12).filter((schedule) => {
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
                  getEmployeeColor={getEmployeeColor}
                  getEmployeeInitials={getEmployeeInitials}
                  handleAssignEmployeesToTask={handleAssignEmployeesToTask}
                  handleOpenDialog={handleOpenDialog}
                  handleDeleteTask={handleDeleteTask}
                />
              ))}
            </TaskCard>
          );
        })}
        {weekDays.map((day) => {
          const daySchedules = filteredSchedules("vente", 13, 17).filter((schedule) => {
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
                  getEmployeeColor={getEmployeeColor}
                  getEmployeeInitials={getEmployeeInitials}
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
        chipLabel={`${filteredSchedules("point", 8, 12).length + filteredSchedules("point", 13, 17).length} présences`}
        chipSx={{ bgcolor: "#fff3e0", color: "#ff9800", fontWeight: "bold" }}
        cardColor="#ff9800"
        borderColor="#ff9800"
        rowLabels={["MATIN", "APRÈS-MIDI"]}
      >
        {weekDays.map((day) => {
          const daySchedules = Array.isArray(schedules)
            ? filteredSchedules("point", 8, 12).filter((schedule) => {
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
                    getEmployeeColor={getEmployeeColor}
                    getEmployeeInitials={getEmployeeInitials}
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
            ? filteredSchedules("point", 13, 17).filter((schedule) => {
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
                    getEmployeeColor={getEmployeeColor}
                    getEmployeeInitials={getEmployeeInitials}
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
        chipLabel={`${filteredSchedules("custom", 8, 12).length + filteredSchedules("custom", 13, 17).length} tâches`}
        chipSx={{ bgcolor: "#e3f2fd", color: "#2196f3", fontWeight: "bold" }}
        cardColor="#2196f3"
        borderColor="#2196f3"
        // showAddButton
        // onAddClick={(day) => handleOpenDialog(null, day)}
        rowLabels={["MATIN", "APRÈS-MIDI"]}
      >
        {weekDays.map((day) => {
          const daySchedules = Array.isArray(schedules)
            ? filteredSchedules("custom", 8, 12).filter((schedule) => {
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
                    getEmployeeColor={getEmployeeColor}
                    getEmployeeInitials={getEmployeeInitials}
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
            ? filteredSchedules("custom", 13, 17).filter((schedule) => {
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
                    getEmployeeColor={getEmployeeColor}
                    getEmployeeInitials={getEmployeeInitials}
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
        chipLabel={`${filteredSchedules("collection", 8, 12).length + filteredSchedules("collection", 13, 17).length} lieux de collecte`}
        chipSx={{ bgcolor: "#f3e5f5", color: "#9c27b0", fontWeight: "bold" }}
        cardColor="#9c27b0"
        borderColor="#9c27b0"
        rowLabels={["MATIN", "APRÈS-MIDI"]}
      >
        {weekDays.map((day) => {
          const daySchedules = Array.isArray(schedules)
            ? filteredSchedules("collection", 8, 12).filter((schedule) => {
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
                    getEmployeeColor={getEmployeeColor}
                    getEmployeeInitials={getEmployeeInitials}
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
            ? filteredSchedules("collection", 13, 17).filter((schedule) => {
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
                    getEmployeeColor={getEmployeeColor}
                    getEmployeeInitials={getEmployeeInitials}
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
