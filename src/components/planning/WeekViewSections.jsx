import { Box } from "@mui/material";
import WeekTaskSection, {
  TaskCard,
  TaskCardContent,
} from "./weekView/WeekTaskSection";
import WeekCollectionSection from "./weekView/WeekCollectionSection";

const WeekViewSections = ({
  // weekDays,
  // dayNames,
  schedules,
  collections,
  // isOpeningTask,
  // isPresenceTask,
  // isCollectionTask,
  // isManuallyCreatedTask,
  // getStatusInfo,
  // getTaskDisplayName,
  getEmployeeColor,
  getEmployeeInitials,
  // formatTime,
  handleAssignEmployeesToTask,
  handleOpenDialog,
  handleDeleteTask,
  handleAssignEmployeesToCollection,
  selectedDate
}) => {
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
  const dayNames = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];
  const filteredSchedules = (category = "vente", start = null, end = null) => {
    return (
      schedules?.filter(
        (s) =>
          s.category == category &&
          (!start || new Date(s.start_time).getHours() >= start) &&
          (!end || new Date(s.start_time).getHours() <= end)
      ) || []
    );
  };
  console.log(filteredSchedules("vente", 8, 12).length);

  const venteChip = (start, end) =>
    `${
      schedules.filter((s) => {
        const startHour = parseInt(s.start_time?.split(":")[0] || "0");
        return s.category == "vente"; // && startHour >= start && startHour < end;
        // const isVente = s.notes?.includes('Vente -');
        // const isOuverture = isOpeningTask(s);
        // if (!isVente && !isOuverture) return false;
        // const startHour = parseInt(s.start_time?.split(':')[0] || '0');
        // return startHour >= start && startHour < end;
      }).length
    } tâches`;

  const presenceChip = (start, end) =>
    `${
      schedules.filter((s) => {
        const startHour = parseInt(s.start_time?.split(":")[0] || "0");
        return s.category == "point" && startHour >= start && startHour < end;

        // if (!isPresenceTask(s)) return false;
        // const startHour = parseInt(s.start_time?.split(':')[0] || '0');
        // return startHour >= start && startHour < end;
      }).length
    } présences`;

  const normalChip = (start, end) =>
    `${
      schedules.filter((s) => {
        return true;
        // const startHour = parseInt(s.start_time?.split(":")[0] || "0");
        // return (
        //   startHour >= start &&
        //   startHour < end &&
        //   !isOpeningTask(s) &&
        //   !isPresenceTask(s)
        // );
      }).length
    } tâches`;

  const collectionChip = (start, end) =>
    `${
      collections.filter((s) => {
        const startHour = parseInt(s.start_time?.split(":")[0] || "0");
        return (
          s.category == "collection" && startHour >= start && startHour < end
        );

        // if (!c.scheduled_time) return true;
        // const startHour = parseInt(c.scheduled_time.split(':')[0] || '0');
        // return startHour >= start && startHour < end;
      }).length
      // +
      // filteredSchedules.filter(s => {
      //   const startHour = parseInt(s.start_time?.split(':')[0] || '0');
      //   return startHour >= start && startHour < end && isCollectionTask(s);
      // }).length
    } lieux de collecte`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <WeekTaskSection
        title="🛒 Tâches de vente - Matin (8h-12h)"
        chipLabel={`${filteredSchedules("vente", 8, 12).length} tâches`}
        chipSx={{ bgcolor: "#e8f5e8", color: "#4caf50", fontWeight: "bold" }}
        cardColor="#4caf50"
        borderColor="#4caf50"
        // weekDays={weekDays}
        // dayNames={dayNames}
        // filteredSchedules={filteredSchedules.filter((s) => {
        //   const startHour = parseInt(s.start_time?.split(":")[0] || "0");
        //   return s.category == "vente" && startHour >= 8 && startHour < 12;
        // })}
        // filterDaySchedules={
        //   (day, daySchedules) => {
        //     return true;
        //   }
        //   // daySchedules.filter((s) => {
        //   //   const startHour = parseInt(s.start_time?.split(":")[0] || "0");
        //   //   return s.category == "vente" && startHour >= 8 && startHour < 12;
        //   // })
        // }
        // getStatusInfo={getStatusInfo}
        // getTaskDisplayName={getTaskDisplayName}
        // formatTime={formatTime}
        // getEmployeeColor={getEmployeeColor}
        // getEmployeeInitials={getEmployeeInitials}
        // isOpeningTask={isOpeningTask}
        // isPresenceTask={isPresenceTask}
        // isManuallyCreatedTask={isManuallyCreatedTask}
        // handleAssignEmployeesToTask={handleAssignEmployeesToTask}
        // handleOpenDialog={handleOpenDialog}
        // handleDeleteTask={handleDeleteTask}
        // emptyText="Aucune tâche"
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
              dayName={dayNames[index]}
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
        // weekDays={weekDays}
        // dayNames={dayNames}
        // filteredSchedules={filteredSchedules}

        // getStatusInfo={getStatusInfo}
        // getTaskDisplayName={getTaskDisplayName}
        // formatTime={formatTime}
        // getEmployeeColor={getEmployeeColor}
        // getEmployeeInitials={getEmployeeInitials}
        // isOpeningTask={isOpeningTask}
        // isPresenceTask={isPresenceTask}
        // isManuallyCreatedTask={isManuallyCreatedTask}
        // handleAssignEmployeesToTask={handleAssignEmployeesToTask}
        // handleOpenDialog={handleOpenDialog}
        // handleDeleteTask={handleDeleteTask}
        // emptyText="Aucune tâche après-midi"
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
              dayName={dayNames[index]}
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
                console.log("sss", schedule);

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
        // weekDays={weekDays}
        // dayNames={dayNames}
        // filteredSchedules={filteredSchedules}
        // filterDaySchedules={(day, daySchedules) =>
        //   daySchedules.filter((schedule) => {
        //     return true;
        //     //   if (!isPresenceTask(schedule)) return false;
        //     //   const startHour = parseInt(
        //     //     schedule.start_time?.split(":")[0] || "0"
        //     //   );
        //     //   return startHour >= 8 && startHour < 12;
        //   })
        // }
        // getStatusInfo={getStatusInfo}
        // getTaskDisplayName={getTaskDisplayName}
        // formatTime={formatTime}
        // getEmployeeColor={getEmployeeColor}
        // getEmployeeInitials={getEmployeeInitials}
        // isOpeningTask={isOpeningTask}
        // isPresenceTask={isPresenceTask}
        // isManuallyCreatedTask={isManuallyCreatedTask}
        // handleAssignEmployeesToTask={handleAssignEmployeesToTask}
        // handleOpenDialog={handleOpenDialog}
        // handleDeleteTask={handleDeleteTask}
        // emptyText="Aucune présence"
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
              dayName={dayNames[index]}
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
        // weekDays={weekDays}
        // dayNames={dayNames}
        // filteredSchedules={filteredSchedules}
        // filterDaySchedules={(day, daySchedules) =>
        //   daySchedules.filter((schedule) => {
        //     return true;
        //     // if (!isPresenceTask(schedule)) return false;
        //     // const startHour = parseInt(
        //     //   schedule.start_time?.split(":")[0] || "0"
        //     // );
        //     // return startHour >= 13 && startHour < 17;
        //   })
        // }
        // getStatusInfo={getStatusInfo}
        // getTaskDisplayName={getTaskDisplayName}
        // formatTime={formatTime}
        // getEmployeeColor={getEmployeeColor}
        // getEmployeeInitials={getEmployeeInitials}
        // isOpeningTask={isOpeningTask}
        // isPresenceTask={isPresenceTask}
        // isManuallyCreatedTask={isManuallyCreatedTask}
        // handleAssignEmployeesToTask={handleAssignEmployeesToTask}
        // handleOpenDialog={handleOpenDialog}
        // handleDeleteTask={handleDeleteTask}
        // emptyText="Aucune présence après-midi"
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
              dayName={dayNames[index]}
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
        // weekDays={weekDays}
        // dayNames={dayNames}
        // filteredSchedules={filteredSchedules}
        // filterDaySchedules={(day, daySchedules) =>
        //   daySchedules.filter((schedule) => {
        //     return true;
        //     // const startHour = parseInt(
        //     //   schedule.start_time?.split(":")[0] || "0"
        //     // );
        //     // return (
        //     //   startHour >= 8 &&
        //     //   startHour < 12 &&
        //     //   !isOpeningTask(schedule) &&
        //     //   !isPresenceTask(schedule) &&
        //     //   !isCollectionTask(schedule)
        //     // );
        //   })
        // }
        // getStatusInfo={getStatusInfo}
        // getTaskDisplayName={getTaskDisplayName}
        // formatTime={formatTime}
        // getEmployeeColor={getEmployeeColor}
        // getEmployeeInitials={getEmployeeInitials}
        // isOpeningTask={isOpeningTask}
        // isPresenceTask={isPresenceTask}
        // isManuallyCreatedTask={isManuallyCreatedTask}
        // handleAssignEmployeesToTask={handleAssignEmployeesToTask}
        // handleOpenDialog={handleOpenDialog}
        // handleDeleteTask={handleDeleteTask}
        // emptyText="Aucune tâche matin"
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
              dayName={dayNames[index]}
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
        // weekDays={weekDays}
        // dayNames={dayNames}
        // filteredSchedules={filteredSchedules}
        // filterDaySchedules={(day, daySchedules) =>
        //   daySchedules.filter((schedule) => {
        //     return true;
        //     // const startHour = parseInt(
        //     //   schedule.start_time?.split(":")[0] || "0"
        //     // );
        //     // return (
        //     //   startHour >= 13 &&
        //     //   startHour < 17 &&
        //     //   !isOpeningTask(schedule) &&
        //     //   !isPresenceTask(schedule) &&
        //     //   !isCollectionTask(schedule)
        //     // );
        //   })
        // }
        // getStatusInfo={getStatusInfo}
        // getTaskDisplayName={getTaskDisplayName}
        // formatTime={formatTime}
        // getEmployeeColor={getEmployeeColor}
        // getEmployeeInitials={getEmployeeInitials}
        // isOpeningTask={isOpeningTask}
        // isPresenceTask={isPresenceTask}
        // isManuallyCreatedTask={isManuallyCreatedTask}
        // handleAssignEmployeesToTask={handleAssignEmployeesToTask}
        // handleOpenDialog={handleOpenDialog}
        // handleDeleteTask={handleDeleteTask}
        // emptyText="Aucune tâche après-midi"
        // showAddButton
        // onAddClick={(day) => handleOpenDialog(null, day)}
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
              dayName={dayNames[index]}
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

      <WeekCollectionSection
        title="🚚 Lieux de collecte - Matin (8h-12h)"
        chipLabel={`${filteredSchedules("collection", 8, 12).length} lieux de collecte`}
        chipSx={{ bgcolor: "#f3e5f5", color: "#9c27b0", fontWeight: "bold" }}
        weekDays={weekDays}
        collections={collections}
        filteredSchedules={filteredSchedules("collection", 8, 12)}
        handleAssignEmployeesToCollection={handleAssignEmployeesToCollection}
      />

      <WeekCollectionSection
        title="🚚 Lieux de collecte - Après-midi (13h-17h)"
        chipLabel={`${filteredSchedules("collection", 13, 17).length} lieux de collecte`}
        chipSx={{ bgcolor: "#f3e5f5", color: "#9c27b0", fontWeight: "bold" }}
        weekDays={weekDays}
        collections={collections}
        filteredSchedules={filteredSchedules("collection", 13, 17)}
        handleAssignEmployeesToCollection={handleAssignEmployeesToCollection}
      />
    </Box>
  );
};

export default WeekViewSections;
