import { Box } from "@mui/material";
import type { EmployeeModel, TaskModel } from "../../interfaces/Models";
import WeekTaskSection, {
  TaskCard,
  TaskCardContent,
} from "./weekView/WeekTaskSection";
import { getDay } from "../../services/dateService";

interface WeekViewSectionsProps {
  schedules: TaskModel[];
  getEmployeeColor: (s: string) => string;
  getEmployeeInitials: (s: string) => string;
  handleAssignEmployeesToTask: (e: EmployeeModel) => void;
  handleOpenDialog: () => void;
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
        title="🛒 Tâches de vente - Matin (8h-12h)"
        chipLabel={`${filteredSchedules("vente", 8, 12).length} tâches`}
        chipSx={{ bgcolor: "#e8f5e8", color: "#4caf50", fontWeight: "bold" }}
        cardColor="#4caf50"
        borderColor="#4caf50"
      >
        {weekDays.map((day, index) => {
          const daySchedules = Array.isArray(schedules)
            ? filteredSchedules("vente", 8, 12).filter((schedule) => {
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
              key={day.toISOString()}
              day={day}
              dayName={getDay(day.getDay())}
              cardColor="#4caf50"
              borderColor="#4caf50"
              getEmployeeColor={getEmployeeColor}
              getEmployeeInitials={getEmployeeInitials}
              handleAssignEmployeesToTask={handleAssignEmployeesToTask}
              handleOpenDialog={handleOpenDialog}
              handleDeleteTask={handleDeleteTask}
              emptyText="Aucune tâche"
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
        title="🛒 Tâches de vente - Après-midi (13h-17h)"
        chipLabel={`${filteredSchedules("vente", 13, 17).length} tâches`}
        chipSx={{ bgcolor: "#e8f5e8", color: "#4caf50", fontWeight: "bold" }}
        cardColor="#4caf50"
        borderColor="#4caf50"
      >
        {weekDays.map((day, index) => {
          const daySchedules = Array.isArray(schedules)
            ? filteredSchedules("vente", 13, 17).filter((schedule) => {
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
              key={day.toISOString()}
              day={day}
              dayName={getDay(day.getDay())}
              cardColor="#4caf50"
              borderColor="#4caf50"
              getEmployeeColor={getEmployeeColor}
              getEmployeeInitials={getEmployeeInitials}
              handleAssignEmployeesToTask={handleAssignEmployeesToTask}
              handleOpenDialog={handleOpenDialog}
              handleDeleteTask={handleDeleteTask}
              emptyText="Aucune tâche"
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
        title="📍 Présence déchèterie - Matin (8h-12h)"
        chipLabel={`${filteredSchedules("point", 8, 12).length} présences`}
        chipSx={{ bgcolor: "#fff3e0", color: "#ff9800", fontWeight: "bold" }}
        cardColor="#ff9800"
        borderColor="#ff9800"
      >
        {weekDays.map((day, index) => {
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
              key={day.toISOString()}
              day={day}
              dayName={getDay(day.getDay())}
              cardColor="#ff9800"
              borderColor="#ff9800"
              getEmployeeColor={getEmployeeColor}
              getEmployeeInitials={getEmployeeInitials}
              handleAssignEmployeesToTask={handleAssignEmployeesToTask}
              handleOpenDialog={handleOpenDialog}
              handleDeleteTask={handleDeleteTask}
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
      </WeekTaskSection>

      <WeekTaskSection
        title="📍 Présence déchèterie - Après-midi (13h-17h)"
        chipLabel={`${filteredSchedules("point", 13, 17).length} présences`}
        chipSx={{ bgcolor: "#fff3e0", color: "#ff9800", fontWeight: "bold" }}
        cardColor="#ff9800"
        borderColor="#ff9800"
      >
        {weekDays.map((day, index) => {
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
              key={day.toISOString()}
              day={day}
              dayName={getDay(day.getDay())}
              cardColor="#ff9800"
              borderColor="#ff9800"
              getEmployeeColor={getEmployeeColor}
              getEmployeeInitials={getEmployeeInitials}
              handleAssignEmployeesToTask={handleAssignEmployeesToTask}
              handleOpenDialog={handleOpenDialog}
              handleDeleteTask={handleDeleteTask}
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
        title="🌅 Tâches normales - Matin (8h00 - 12h00)"
        chipLabel={`${filteredSchedules("custom", 8, 12).length} tâches`}
        chipSx={{ bgcolor: "#e3f2fd", color: "#2196f3", fontWeight: "bold" }}
        cardColor="#2196f3"
        borderColor="#2196f3"
        showAddButton
        onAddClick={(day) => handleOpenDialog(null, day)}
      >
        {weekDays.map((day, index) => {
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
              key={day.toISOString()}
              day={day}
              dayName={getDay(day.getDay())}
              cardColor="#2196f3"
              borderColor="#2196f3"
              getEmployeeColor={getEmployeeColor}
              getEmployeeInitials={getEmployeeInitials}
              handleAssignEmployeesToTask={handleAssignEmployeesToTask}
              handleOpenDialog={handleOpenDialog}
              handleDeleteTask={handleDeleteTask}
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
      </WeekTaskSection>

      <WeekTaskSection
        title="🌞 Tâches normales - Après-midi (13h30 - 17h)"
        chipLabel={`${filteredSchedules("custom", 13, 17).length} tâches`}
        chipSx={{ bgcolor: "#e3f2fd", color: "#2196f3", fontWeight: "bold" }}
        cardColor="#2196f3"
        borderColor="#2196f3"
      >
        {weekDays.map((day, index) => {
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
              key={day.toISOString()}
              day={day}
              dayName={getDay(day.getDay())}
              cardColor="#2196f3"
              borderColor="#2196f3"
              getEmployeeColor={getEmployeeColor}
              getEmployeeInitials={getEmployeeInitials}
              handleAssignEmployeesToTask={handleAssignEmployeesToTask}
              handleOpenDialog={handleOpenDialog}
              handleDeleteTask={handleDeleteTask}
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
        title="🚚 Lieux de collecte - Matin (8h-12h)"
        chipLabel={`${filteredSchedules("collection", 8, 12).length} lieux de collecte`}
        chipSx={{ bgcolor: "#f3e5f5", color: "#9c27b0", fontWeight: "bold" }}
        cardColor="#9c27b0"
        borderColor="#9c27b0"
      >
        {weekDays.map((day, index) => {
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
              key={day.toISOString()}
              day={day}
              dayName={getDay(day.getDay())}
              cardColor="#9c27b0"
              borderColor="#9c27b0"
              getEmployeeColor={getEmployeeColor}
              getEmployeeInitials={getEmployeeInitials}
              handleAssignEmployeesToTask={handleAssignEmployeesToTask}
              handleOpenDialog={handleOpenDialog}
              handleDeleteTask={handleDeleteTask}
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

      <WeekTaskSection
        title="🚚 Lieux de collecte - Après-midi (13h-17h)"
        chipLabel={`${filteredSchedules("collection", 13, 17).length} lieux de collecte`}
        chipSx={{ bgcolor: "#f3e5f5", color: "#9c27b0", fontWeight: "bold" }}
        cardColor="#9c27b0"
        borderColor="#9c27b0"
      >
        {weekDays.map((day, index) => {
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
              key={day.toISOString()}
              day={day}
              dayName={getDay(day.getDay())}
              cardColor="#9c27b0"
              borderColor="#9c27b0"
              getEmployeeColor={getEmployeeColor}
              getEmployeeInitials={getEmployeeInitials}
              handleAssignEmployeesToTask={handleAssignEmployeesToTask}
              handleOpenDialog={handleOpenDialog}
              handleDeleteTask={handleDeleteTask}
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

      {/* <WeekCollectionSection
        title="🚚 Lieux de collecte - Matin (8h-12h)"
        chipLabel={`${filteredSchedules("collection", 8, 12).length} lieux de collecte`}
        chipSx={{ bgcolor: "#f3e5f5", color: "#9c27b0", fontWeight: "bold" }}
        weekDays={weekDays}
        collections={schedules.filter((s) => s.category == "collection")}
        filteredSchedules={filteredSchedules("collection", 8, 12)}
        handleAssignEmployeesToTask={handleAssignEmployeesToTask}
      />

      <WeekCollectionSection
        title="🚚 Lieux de collecte - Après-midi (13h-17h)"
        chipLabel={`${filteredSchedules("collection", 13, 17).length} lieux de collecte`}
        chipSx={{ bgcolor: "#f3e5f5", color: "#9c27b0", fontWeight: "bold" }}
        weekDays={weekDays}
        collections={schedules.filter((s) => s.category == "collection")}
        filteredSchedules={filteredSchedules("collection", 13, 17)}
        handleAssignEmployeesToTask={handleAssignEmployeesToTask}
      /> */}
    </Box>
  );
};

export default WeekViewSections;
