import {
  BeachAccess,
  CalendarToday,
  ErrorOutline,
  Person,
  Warning,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import type { IsoDate } from "@recyclerie/api/primitives/zod";
import { employeeName } from "../../employee";
import type { EmployeeModel, StoreModel } from "../../interfaces/Models";
import {
  ALLDAY_PRESENCE_SLOT,
  WORKDAY_TIME_SLOT_AVATAR_COLORS,
  getWorkdayTimeSlot,
} from "../../constants/workdayTimeSlots";
import type { Weekday } from "@recyclerie/api/enums";
import { WEEKDAYS_MONDAY_FIRST } from "../../services/dateService";
import { dateOfWeekday, formatDayLong } from "../../services/planning/employeeDayDate";
import {
  conflictCountAmong,
  NO_MARKERS,
  type DayMarkers,
} from "../../services/planning/weekTaskMarkers";

const MORNING_SLOT = getWorkdayTimeSlot("morning")!;
const AFTERNOON_SLOT = getWorkdayTimeSlot("afternoon")!;

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DaySchedule {
  label: string;
  morning: EmployeeModel[];
  afternoon: EmployeeModel[];
  allDay: EmployeeModel[];
}

type TimeSlot = "allday" | "morning" | "afternoon";

interface EmployeeScheduleByWeek {
  [dayKey: string]: DaySchedule;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type VacationEmployeeIdsByDay = Readonly<
  Partial<Record<Weekday, ReadonlySet<number>>>
>;

interface EmployeePresenceScheduleProps {
  selectedStore: StoreModel | null;
  onShowMissingEmployees: () => void;
  isLoading: boolean;
  employeesByDay: EmployeeScheduleByWeek;
  vacationEmployeeIdsByDay: VacationEmployeeIdsByDay;
  /** Monday of the displayed week: the cards only know their weekday, their date is derived from it. */
  weekStart: IsoDate;
  /** An Employee's name was clicked on the card of `date`. */
  onSelectEmployee: SelectEmployee;
  /**
   * Task count pills and Vacation conflict markers per weekday (see `weekMarkersByWeekday`).
   * A day without an entry shows none.
   */
  markersByDay?: MarkersByDay;
}

type MarkersByDay = Readonly<Partial<Record<Weekday, DayMarkers>>>;

/** Called with the clicked Employee and the date of the day card they were clicked on. */
type SelectEmployee = (employee: EmployeeModel, date: IsoDate) => void;

/**
 * Main component displaying employee presence schedule by day of the week
 */
export const EmployeePresenceSchedule = ({
  selectedStore,
  onShowMissingEmployees,
  isLoading,
  employeesByDay,
  vacationEmployeeIdsByDay,
  weekStart,
  onSelectEmployee,
  markersByDay = {},
}: EmployeePresenceScheduleProps) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Card sx={{ bgcolor: "#f8f9fa", border: "2px solid #e0e0e0" }}>
        <CardContent>
          <EmployeePresenceHeader
            selectedStore={selectedStore}
            onShowMissingEmployees={onShowMissingEmployees}
          />

          {isLoading ? (
            <EmployeePresenceLoader />
          ) : (
            <WeeklyScheduleGrid
              employeesByDay={employeesByDay}
              vacationEmployeeIdsByDay={vacationEmployeeIdsByDay}
              selectedStore={selectedStore}
              weekStart={weekStart}
              onSelectEmployee={onSelectEmployee}
              markersByDay={markersByDay}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

// ============================================================================
// HEADER COMPONENT
// ============================================================================

interface EmployeePresenceHeaderProps {
  selectedStore: StoreModel | null;
  onShowMissingEmployees: () => void;
}

const EmployeePresenceHeader = ({
  selectedStore,
  onShowMissingEmployees,
}: EmployeePresenceHeaderProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CalendarToday sx={{ color: "#2196f3", fontSize: 28 }} />
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#2196f3" }}
          >
            Planning des Employés par Jour
          </Typography>
          <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
            {selectedStore
              ? `Magasin sélectionné: ${selectedStore?.name}`
              : "Tous les magasins"}
          </Typography>
        </Box>
      </Box>
      <Button
        variant="outlined"
        size="small"
        startIcon={<Warning />}
        onClick={onShowMissingEmployees}
        sx={{
          borderColor: "#ff9800",
          color: "#ff9800",
          "&:hover": {
            borderColor: "#ff9800",
            backgroundColor: "#fff3e0",
          },
        }}
      >
        Vérifier les employés manquants
      </Button>
    </Box>
  );
};

// ============================================================================
// LOADER COMPONENT
// ============================================================================

const EmployeePresenceLoader = () => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
      <CircularProgress size={24} />
      <Typography sx={{ ml: 2 }}>Chargement des employés...</Typography>
    </Box>
  );
};

// ============================================================================
// WEEKLY SCHEDULE GRID
// ============================================================================

interface WeeklyScheduleGridProps {
  employeesByDay: EmployeeScheduleByWeek;
  vacationEmployeeIdsByDay: VacationEmployeeIdsByDay;
  selectedStore: StoreModel | null;
  weekStart: IsoDate;
  onSelectEmployee: SelectEmployee;
  markersByDay: MarkersByDay;
}

const WeeklyScheduleGrid = ({
  employeesByDay,
  vacationEmployeeIdsByDay,
  selectedStore,
  weekStart,
  onSelectEmployee,
  markersByDay,
}: WeeklyScheduleGridProps) => {
  if (!employeesByDay || Object.keys(employeesByDay).length === 0) {
    return <EmptyScheduleMessage message="Aucun employé trouvé" />;
  }

  const hasEmployees = Object.values(employeesByDay).some(
    (day) =>
      day.morning.length > 0 ||
      day.afternoon.length > 0 ||
      day.allDay.length > 0,
  );

  if (!hasEmployees && selectedStore) {
    return (
      <EmptyScheduleMessage
        message="Aucun employé trouvé pour ce magasin"
        details="Sélectionnez un autre magasin ou vérifiez les affectations d'employés."
      />
    );
  }

  return (
    <Grid container spacing={2}>
      {WEEKDAYS_MONDAY_FIRST.map((day) => {
        const dayKey = String(day);
        const daySchedule = employeesByDay[dayKey];
        if (!daySchedule) return null;
        return (
          <DayScheduleCard
            key={dayKey}
            dayKey={dayKey}
            date={dateOfWeekday(weekStart, day)}
            daySchedule={daySchedule}
            vacationEmployeeIds={vacationEmployeeIdsByDay[day]}
            markers={markersByDay[day] ?? NO_MARKERS}
            onSelectEmployee={onSelectEmployee}
          />
        );
      })}
    </Grid>
  );
};

// ============================================================================
// DAY SCHEDULE CARD
// ============================================================================

interface DayScheduleCardProps {
  dayKey: string;
  date: IsoDate;
  daySchedule: DaySchedule;
  vacationEmployeeIds: ReadonlySet<number> | undefined;
  markers: DayMarkers;
  onSelectEmployee: SelectEmployee;
}

const DayScheduleCard = ({
  dayKey,
  date,
  daySchedule,
  vacationEmployeeIds,
  markers,
  onSelectEmployee,
}: DayScheduleCardProps) => {
const scheduledEmployees =
  daySchedule.allDay.length +
  daySchedule.morning.length +
  daySchedule.afternoon.length;

const vacationEmployees = vacationEmployeeIds?.size ?? 0;

const totalEmployees = Math.max(
  0,
  scheduledEmployees - vacationEmployees
);
  // By Employee, not by badge, and only among the Employees this card lists, so the chip
  // always matches the red badges one can see.
  const conflictCount = conflictCountAmong(
    markers,
    [...daySchedule.allDay, ...daySchedule.morning, ...daySchedule.afternoon].map((employee) => employee.id),
  );
  const hasEmployees =
    daySchedule.allDay.length > 0 ||
    daySchedule.morning.length > 0 ||
    daySchedule.afternoon.length > 0;

  return (
    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 1.7 }} key={dayKey}>
      <Card
        sx={{
          height: "100%",
          border: "1px solid #e0e0e0",
          bgcolor: daySchedule.allDay.length > 0 ? "#e8f5e8" : "#f5f5f5",
          "&:hover": { boxShadow: 2 },
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <DayScheduleHeader
            dayLabel={daySchedule.label}
            employeeCount={totalEmployees}
            conflictCount={conflictCount}
          />

          {hasEmployees ? (
            <Stack spacing={1}>
              <DayEmployeeList
                date={date}
                daySchedule={daySchedule}
                vacationEmployeeIds={vacationEmployeeIds}
                markers={markers}
                onSelectEmployee={onSelectEmployee}
              />
            </Stack>
          ) : (
            <EmptyDayMessage />
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};

// ============================================================================
// DAY SCHEDULE HEADER
// ============================================================================

interface DayScheduleHeaderProps {
  dayLabel: string;
  employeeCount: number;
  /** Employees on Vacation who still hold a Task that day. */
  conflictCount: number;
}

const DayScheduleHeader = ({
  dayLabel,
  employeeCount,
  conflictCount,
}: DayScheduleHeaderProps) => {
  return (
    <Box sx={{ textAlign: "center", mb: 2 }}>
      <Typography
        variant="subtitle1"
        fontWeight="bold"
        sx={{ color: "#333" }}
        textTransform={"capitalize"}
      >
        {dayLabel}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {plural(employeeCount, "employé")}
      </Typography>
      {conflictCount > 0 && (
        <Box sx={{ mt: 0.5 }}>
          <Chip
            size="small"
            color="error"
            icon={<ErrorOutline />}
            label={plural(conflictCount, "conflit")}
            sx={{ height: 20, fontSize: "0.65rem" }}
          />
        </Box>
      )}
    </Box>
  );
};

// ============================================================================
// DAY EMPLOYEE LIST
// ============================================================================

interface DayEmployeeListProps {
  date: IsoDate;
  daySchedule: DaySchedule;
  vacationEmployeeIds: ReadonlySet<number> | undefined;
  markers: DayMarkers;
  onSelectEmployee: SelectEmployee;
}

const DayEmployeeList = ({
  date,
  daySchedule,
  vacationEmployeeIds,
  markers,
  onSelectEmployee,
}: DayEmployeeListProps) => {
  return (
    <>
      {daySchedule.allDay.length > 0 && (
        <TimeSlotSection
          employees={daySchedule.allDay}
          timeSlot="allday"
          label={ALLDAY_PRESENCE_SLOT.label}
          color={ALLDAY_PRESENCE_SLOT.avatarColor}
          vacationEmployeeIds={vacationEmployeeIds}
          markers={markers}
          date={date}
          onSelectEmployee={onSelectEmployee}
        />
      )}

      {daySchedule.morning.length > 0 && (
        <TimeSlotSection
          employees={daySchedule.morning}
          timeSlot="morning"
          label={
            <>
              <Box component="span" sx={{ display: "flex", fontSize: 14 }}>
                {MORNING_SLOT.icon}
              </Box>
              {MORNING_SLOT.label}
            </>
          }
          color={WORKDAY_TIME_SLOT_AVATAR_COLORS.morning}
          vacationEmployeeIds={vacationEmployeeIds}
          markers={markers}
          date={date}
          onSelectEmployee={onSelectEmployee}
        />
      )}

      {daySchedule.afternoon.length > 0 && (
        <TimeSlotSection
          employees={daySchedule.afternoon}
          timeSlot="afternoon"
          label={
            <>
              <Box component="span" sx={{ display: "flex", fontSize: 14 }}>
                {AFTERNOON_SLOT.icon}
              </Box>
              {AFTERNOON_SLOT.label}
            </>
          }
          color={WORKDAY_TIME_SLOT_AVATAR_COLORS.afternoon}
          vacationEmployeeIds={vacationEmployeeIds}
          markers={markers}
          date={date}
          onSelectEmployee={onSelectEmployee}
        />
      )}
    </>
  );
};

// ============================================================================
// TIME SLOT SECTION
// ============================================================================

interface TimeSlotSectionProps {
  employees: EmployeeModel[];
  timeSlot: TimeSlot;
  label: ReactNode;
  color: string;
  vacationEmployeeIds: ReadonlySet<number> | undefined;
  markers: DayMarkers;
  date: IsoDate;
  onSelectEmployee: SelectEmployee;
}

const TimeSlotSection = ({
  employees,
  timeSlot,
  label,
  color,
  vacationEmployeeIds,
  markers,
  date,
  onSelectEmployee,
}: TimeSlotSectionProps) => {
  return (
    <Box>
      <Typography
        variant="caption"
        fontWeight="bold"
        sx={{
          color,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        {label}
      </Typography>
      {employees.map((employee, index) => (
        <EmployeeBadge
          key={`${employee.id}-${timeSlot}-${index}`}
          employee={employee}
          timeSlot={timeSlot}
          onVacation={vacationEmployeeIds?.has(employee.id) === true}
          taskCount={markers.taskCounts.get(employee.id) ?? 0}
          conflictTaskCount={markers.conflicts.get(employee.id) ?? 0}
          date={date}
          onSelect={onSelectEmployee}
        />
      ))}
    </Box>
  );
};

// ============================================================================
// EMPLOYEE BADGE
// ============================================================================

interface EmployeeBadgeProps {
  employee: EmployeeModel;
  timeSlot: TimeSlot;
  onVacation: boolean;
  /** Distinct Tasks the Employee holds that day, over all Stores; no pill at 0. */
  taskCount: number;
  /** On Vacation and still holding this many Tasks that day (a Vacation conflict); 0 when not in conflict. */
  conflictTaskCount: number;
  /** The day of the card this badge sits on. */
  date: IsoDate;
  onSelect: SelectEmployee;
}

const plural = (count: number, word: string) => `${count} ${word}${count > 1 ? "s" : ""}`;

/** An Employee on a day card: a button that opens their day. */
const EmployeeBadge = ({
  employee,
  timeSlot,
  onVacation,
  taskCount,
  conflictTaskCount,
  date,
  onSelect,
}: EmployeeBadgeProps) => {
  const Icon = onVacation ? BeachAccess : Person;
  const avatarColor = onVacation ? "text.disabled" : getTimeSlotColor(timeSlot);
  const inConflict = conflictTaskCount > 0;

  return (
    <ButtonBase
      onClick={() => onSelect(employee, date)}
      aria-label={`Voir les tâches de ${employeeName(employee)} le ${formatDayLong(date)}`}
      sx={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 0.5,
        mt: 0.5,
        width: "100%",
        borderRadius: 1,
        textAlign: "left",
        ...(inConflict && {
          px: 0.5,
          bgcolor: "#ffebee",
          outline: "1px solid",
          outlineColor: "error.main",
        }),
        "&:hover": { bgcolor: inConflict ? "#ffcdd2" : "action.hover" },
        "&.Mui-focusVisible": { outline: "2px solid", outlineColor: "primary.main" },
      }}
    >
      <Avatar
        sx={{
          width: 20,
          height: 20,
          bgcolor: avatarColor,
          fontSize: 10,
        }}
      >
        <Icon sx={{ fontSize: 12 }} />
      </Avatar>
      <Typography
        variant="caption"
        sx={{
          fontSize: "0.7rem",
          fontWeight: "medium",
          color: onVacation ? "text.disabled" : undefined,
        }}
      >
        {employeeName(employee)}
      </Typography>
      {(taskCount > 0 || inConflict) && (
        <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: "auto" }}>
          {inConflict && (
            <Tooltip title={`En congé mais assigné à ${plural(conflictTaskCount, "tâche")}`}>
              <Box component="span" role="img" sx={{ display: "flex", color: "error.main" }}>
                <ErrorOutline sx={{ fontSize: 16 }} />
              </Box>
            </Tooltip>
          )}
          {taskCount > 0 && (
            <Tooltip title={`${plural(taskCount, "tâche")} ce jour`}>
              <Box
                component="span"
                role="img"
                sx={{
                  minWidth: 16,
                  height: 16,
                  px: 0.5,
                  boxSizing: "border-box",
                  borderRadius: 8,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontSize: "0.65rem",
                  fontWeight: "bold",
                  lineHeight: "16px",
                  textAlign: "center",
                }}
              >
                {taskCount}
              </Box>
            </Tooltip>
          )}
        </Box>
      )}
    </ButtonBase>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getTimeSlotColor = (timeSlot: TimeSlot): string => {
  if (timeSlot === "allday") {
    return ALLDAY_PRESENCE_SLOT.avatarColor;
  }
  return WORKDAY_TIME_SLOT_AVATAR_COLORS[timeSlot];
};

// ============================================================================
// EMPTY STATE COMPONENTS
// ============================================================================

interface EmptyScheduleMessageProps {
  message: string;
  details?: string;
}

const EmptyScheduleMessage = ({
  message,
  details,
}: EmptyScheduleMessageProps) => {
  return (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
        {message}
      </Typography>
      {details && (
        <Typography variant="body2" color="text.secondary">
          {details}
        </Typography>
      )}
    </Box>
  );
};

const EmptyDayMessage = () => {
  return (
    <Box sx={{ textAlign: "center", py: 2 }}>
      <Typography variant="caption" color="text.secondary">
        Aucun employé
      </Typography>
    </Box>
  );
};

// ============================================================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================================================

/**
 * @deprecated Use EmployeePresenceSchedule instead
 */
export const PrecenseEmployees = EmployeePresenceSchedule;
