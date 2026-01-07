import React from 'react';
import { Box } from '@mui/material';
import WeekTaskSection from './weekView/WeekTaskSection';
import WeekCollectionSection from './weekView/WeekCollectionSection';

const WeekViewSections = ({
  weekDays,
  dayNames,
  filteredSchedules,
  collections,
  isOpeningTask,
  isPresenceTask,
  isCollectionTask,
  isManuallyCreatedTask,
  getStatusInfo,
  getTaskDisplayName,
  getEmployeeColor,
  getEmployeeInitials,
  formatTime,
  handleAssignEmployeesToTask,
  handleOpenDialog,
  handleDeleteTask,
  handleAssignEmployeesToCollection
}) => {
  const venteChip = (start, end) =>
    `${filteredSchedules.filter(s => {
      const isVente = s.notes?.includes('Vente -');
      const isOuverture = isOpeningTask(s);
      if (!isVente && !isOuverture) return false;
      const startHour = parseInt(s.start_time?.split(':')[0] || '0');
      return startHour >= start && startHour < end;
    }).length} tâches`;

  const presenceChip = (start, end) =>
    `${filteredSchedules.filter(s => {
      if (!isPresenceTask(s)) return false;
      const startHour = parseInt(s.start_time?.split(':')[0] || '0');
      return startHour >= start && startHour < end;
    }).length} présences`;

  const normalChip = (start, end) =>
    `${filteredSchedules.filter(s => {
      const startHour = parseInt(s.start_time?.split(':')[0] || '0');
      return startHour >= start && startHour < end && !isOpeningTask(s) && !isPresenceTask(s);
    }).length} tâches`;

  const collectionChip = (start, end) =>
    `${
      collections.filter(c => {
        if (!c.scheduled_time) return true;
        const startHour = parseInt(c.scheduled_time.split(':')[0] || '0');
        return startHour >= start && startHour < end;
      }).length +
      filteredSchedules.filter(s => {
        const startHour = parseInt(s.start_time?.split(':')[0] || '0');
        return startHour >= start && startHour < end && isCollectionTask(s);
      }).length
    } lieux de collecte`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <WeekTaskSection
        title="🛒 Tâches de vente - Matin (8h-12h)"
        chipLabel={venteChip(8, 12)}
        chipSx={{ bgcolor: '#e8f5e8', color: '#4caf50', fontWeight: 'bold' }}
        cardColor="#4caf50"
        borderColor="#4caf50"
        weekDays={weekDays}
        dayNames={dayNames}
        filteredSchedules={filteredSchedules}
        filterDaySchedules={(day, daySchedules) =>
          daySchedules.filter(schedule => {
            const isVente = schedule.notes?.includes('Vente -');
            const isOuverture = isOpeningTask(schedule);
            if (!isVente && !isOuverture) return false;
            const startHour = parseInt(schedule.start_time?.split(':')[0] || '0');
            return startHour >= 8 && startHour < 12;
          })
        }
        getStatusInfo={getStatusInfo}
        getTaskDisplayName={getTaskDisplayName}
        formatTime={formatTime}
        getEmployeeColor={getEmployeeColor}
        getEmployeeInitials={getEmployeeInitials}
        isOpeningTask={isOpeningTask}
        isPresenceTask={isPresenceTask}
        isManuallyCreatedTask={isManuallyCreatedTask}
        handleAssignEmployeesToTask={handleAssignEmployeesToTask}
        handleOpenDialog={handleOpenDialog}
        handleDeleteTask={handleDeleteTask}
        emptyText="Aucune tâche"
      />

      <WeekTaskSection
        title="🛒 Tâches de vente - Après-midi (13h-17h)"
        chipLabel={venteChip(13, 17)}
        chipSx={{ bgcolor: '#e8f5e8', color: '#4caf50', fontWeight: 'bold' }}
        cardColor="#4caf50"
        borderColor="#4caf50"
        weekDays={weekDays}
        dayNames={dayNames}
        filteredSchedules={filteredSchedules}
        filterDaySchedules={(day, daySchedules) =>
          daySchedules.filter(schedule => {
            const isVente = schedule.notes?.includes('Vente -');
            const isOuverture = isOpeningTask(schedule);
            if (!isVente && !isOuverture) return false;
            const startHour = parseInt(schedule.start_time?.split(':')[0] || '0');
            return startHour >= 13 && startHour < 17;
          })
        }
        getStatusInfo={getStatusInfo}
        getTaskDisplayName={getTaskDisplayName}
        formatTime={formatTime}
        getEmployeeColor={getEmployeeColor}
        getEmployeeInitials={getEmployeeInitials}
        isOpeningTask={isOpeningTask}
        isPresenceTask={isPresenceTask}
        isManuallyCreatedTask={isManuallyCreatedTask}
        handleAssignEmployeesToTask={handleAssignEmployeesToTask}
        handleOpenDialog={handleOpenDialog}
        handleDeleteTask={handleDeleteTask}
        emptyText="Aucune tâche après-midi"
      />

      <WeekTaskSection
        title="📍 Présence déchèterie - Matin (8h-12h)"
        chipLabel={presenceChip(8, 12)}
        chipSx={{ bgcolor: '#fff3e0', color: '#ff9800', fontWeight: 'bold' }}
        cardColor="#ff9800"
        borderColor="#ff9800"
        weekDays={weekDays}
        dayNames={dayNames}
        filteredSchedules={filteredSchedules}
        filterDaySchedules={(day, daySchedules) =>
          daySchedules.filter(schedule => {
            if (!isPresenceTask(schedule)) return false;
            const startHour = parseInt(schedule.start_time?.split(':')[0] || '0');
            return startHour >= 8 && startHour < 12;
          })
        }
        getStatusInfo={getStatusInfo}
        getTaskDisplayName={getTaskDisplayName}
        formatTime={formatTime}
        getEmployeeColor={getEmployeeColor}
        getEmployeeInitials={getEmployeeInitials}
        isOpeningTask={isOpeningTask}
        isPresenceTask={isPresenceTask}
        isManuallyCreatedTask={isManuallyCreatedTask}
        handleAssignEmployeesToTask={handleAssignEmployeesToTask}
        handleOpenDialog={handleOpenDialog}
        handleDeleteTask={handleDeleteTask}
        emptyText="Aucune présence"
      />

      <WeekTaskSection
        title="📍 Présence déchèterie - Après-midi (13h-17h)"
        chipLabel={presenceChip(13, 17)}
        chipSx={{ bgcolor: '#fff3e0', color: '#ff9800', fontWeight: 'bold' }}
        cardColor="#ff9800"
        borderColor="#ff9800"
        weekDays={weekDays}
        dayNames={dayNames}
        filteredSchedules={filteredSchedules}
        filterDaySchedules={(day, daySchedules) =>
          daySchedules.filter(schedule => {
            if (!isPresenceTask(schedule)) return false;
            const startHour = parseInt(schedule.start_time?.split(':')[0] || '0');
            return startHour >= 13 && startHour < 17;
          })
        }
        getStatusInfo={getStatusInfo}
        getTaskDisplayName={getTaskDisplayName}
        formatTime={formatTime}
        getEmployeeColor={getEmployeeColor}
        getEmployeeInitials={getEmployeeInitials}
        isOpeningTask={isOpeningTask}
        isPresenceTask={isPresenceTask}
        isManuallyCreatedTask={isManuallyCreatedTask}
        handleAssignEmployeesToTask={handleAssignEmployeesToTask}
        handleOpenDialog={handleOpenDialog}
        handleDeleteTask={handleDeleteTask}
        emptyText="Aucune présence après-midi"
      />

      <WeekTaskSection
        title="🌅 Tâches normales - Matin (8h00 - 12h00)"
        chipLabel={normalChip(8, 12)}
        chipSx={{ bgcolor: '#e3f2fd', color: '#2196f3', fontWeight: 'bold' }}
        cardColor="#2196f3"
        borderColor="#2196f3"
        weekDays={weekDays}
        dayNames={dayNames}
        filteredSchedules={filteredSchedules}
        filterDaySchedules={(day, daySchedules) =>
          daySchedules.filter(schedule => {
            const startHour = parseInt(schedule.start_time?.split(':')[0] || '0');
            return startHour >= 8 && startHour < 12 && !isOpeningTask(schedule) && !isPresenceTask(schedule) && !isCollectionTask(schedule);
          })
        }
        getStatusInfo={getStatusInfo}
        getTaskDisplayName={getTaskDisplayName}
        formatTime={formatTime}
        getEmployeeColor={getEmployeeColor}
        getEmployeeInitials={getEmployeeInitials}
        isOpeningTask={isOpeningTask}
        isPresenceTask={isPresenceTask}
        isManuallyCreatedTask={isManuallyCreatedTask}
        handleAssignEmployeesToTask={handleAssignEmployeesToTask}
        handleOpenDialog={handleOpenDialog}
        handleDeleteTask={handleDeleteTask}
        emptyText="Aucune tâche matin"
        showAddButton
        onAddClick={day => handleOpenDialog(null, day)}
      />

      <WeekTaskSection
        title="🌞 Tâches normales - Après-midi (13h30 - 17h)"
        chipLabel={normalChip(13, 17)}
        chipSx={{ bgcolor: '#e3f2fd', color: '#2196f3', fontWeight: 'bold' }}
        cardColor="#2196f3"
        borderColor="#2196f3"
        weekDays={weekDays}
        dayNames={dayNames}
        filteredSchedules={filteredSchedules}
        filterDaySchedules={(day, daySchedules) =>
          daySchedules.filter(schedule => {
            const startHour = parseInt(schedule.start_time?.split(':')[0] || '0');
            return startHour >= 13 && startHour < 17 && !isOpeningTask(schedule) && !isPresenceTask(schedule) && !isCollectionTask(schedule);
          })
        }
        getStatusInfo={getStatusInfo}
        getTaskDisplayName={getTaskDisplayName}
        formatTime={formatTime}
        getEmployeeColor={getEmployeeColor}
        getEmployeeInitials={getEmployeeInitials}
        isOpeningTask={isOpeningTask}
        isPresenceTask={isPresenceTask}
        isManuallyCreatedTask={isManuallyCreatedTask}
        handleAssignEmployeesToTask={handleAssignEmployeesToTask}
        handleOpenDialog={handleOpenDialog}
        handleDeleteTask={handleDeleteTask}
        emptyText="Aucune tâche après-midi"
        showAddButton
        onAddClick={day => handleOpenDialog(null, day)}
      />

      <WeekCollectionSection
        title="🚚 Lieux de collecte - Matin (8h-12h)"
        chipLabel={collectionChip(8, 12)}
        chipSx={{ bgcolor: '#f3e5f5', color: '#9c27b0', fontWeight: 'bold' }}
        weekDays={weekDays}
        collections={collections}
        filteredSchedules={filteredSchedules}
        isCollectionTask={isCollectionTask}
        getTaskDisplayName={getTaskDisplayName}
        formatTime={formatTime}
        handleAssignEmployeesToCollection={handleAssignEmployeesToCollection}
      />

      <WeekCollectionSection
        title="🚚 Lieux de collecte - Après-midi (13h-17h)"
        chipLabel={collectionChip(13, 17)}
        chipSx={{ bgcolor: '#f3e5f5', color: '#9c27b0', fontWeight: 'bold' }}
        weekDays={weekDays}
        collections={collections}
        filteredSchedules={filteredSchedules}
        isCollectionTask={isCollectionTask}
        getTaskDisplayName={getTaskDisplayName}
        formatTime={formatTime}
        handleAssignEmployeesToCollection={handleAssignEmployeesToCollection}
      />
    </Box>
  );
};

export default WeekViewSections;


