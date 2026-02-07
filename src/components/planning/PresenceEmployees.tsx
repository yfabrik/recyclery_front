import { CalendarToday, Person, Warning } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import type { EmployeeModel, StoreModel } from "../../interfaces/Models";

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

interface EmployeePresenceScheduleProps {
  selectedStore: StoreModel | null;
  onShowMissingEmployees: () => void;
  isLoading: boolean;
  employeesByDay: EmployeeScheduleByWeek;
}

/**
 * Main component displaying employee presence schedule by day of the week
 */
export const EmployeePresenceSchedule = ({
  selectedStore,
  onShowMissingEmployees,
  isLoading,
  employeesByDay,
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
              selectedStore={selectedStore}
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
            {selectedStore ? (
              `Magasin sélectionné: ${selectedStore?.name}`
            ) : (
              "Tous les magasins"
            )}
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
  selectedStore: StoreModel | null;
}

const WeeklyScheduleGrid = ({
  employeesByDay,
  selectedStore,
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
      {Object.entries(employeesByDay).map(([dayKey, daySchedule]) => (
        <DayScheduleCard
          key={dayKey}
          dayKey={dayKey}
          daySchedule={daySchedule}
        />
      ))}
    </Grid>
  );
};

// ============================================================================
// DAY SCHEDULE CARD
// ============================================================================

interface DayScheduleCardProps {
  dayKey: string;
  daySchedule: DaySchedule;
}

const DayScheduleCard = ({ dayKey, daySchedule }: DayScheduleCardProps) => {
  const totalEmployees =
    daySchedule.allDay.length +
    daySchedule.morning.length +
    daySchedule.afternoon.length;

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
          />

          {hasEmployees ? (
            <Stack spacing={1}>
              <DayEmployeeList daySchedule={daySchedule} />
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
}

const DayScheduleHeader = ({
  dayLabel,
  employeeCount,
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
        {employeeCount} employé{employeeCount > 1 ? "s" : ""}
      </Typography>
    </Box>
  );
};

// ============================================================================
// DAY EMPLOYEE LIST
// ============================================================================

interface DayEmployeeListProps {
  daySchedule: DaySchedule;
}

const DayEmployeeList = ({ daySchedule }: DayEmployeeListProps) => {
  return (
    <>
      {daySchedule.allDay.length > 0 && (
        <TimeSlotSection
          employees={daySchedule.allDay}
          timeSlot="allday"
          label="🌞 Journée"
          color="#4caf50"
        />
      )}

      {daySchedule.morning.length > 0 && (
        <TimeSlotSection
          employees={daySchedule.morning}
          timeSlot="morning"
          label="🌅 Matin"
          color="#ff9800"
        />
      )}

      {daySchedule.afternoon.length > 0 && (
        <TimeSlotSection
          employees={daySchedule.afternoon}
          timeSlot="afternoon"
          label="🌆 Après-midi"
          color="#2196f3"
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
  label: string;
  color: string;
}

const TimeSlotSection = ({
  employees,
  timeSlot,
  label,
  color,
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
}

const EmployeeBadge = ({ employee, timeSlot }: EmployeeBadgeProps) => {
  const avatarColor = getTimeSlotColor(timeSlot);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        mt: 0.5,
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
        <Person sx={{ fontSize: 12 }} />
      </Avatar>
      <Typography
        variant="caption"
        sx={{
          fontSize: "0.7rem",
          fontWeight: "medium",
        }}
      >
        {employee.fullName}
      </Typography>
    </Box>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getTimeSlotColor = (timeSlot: TimeSlot): string => {
  const colorMap: Record<TimeSlot, string> = {
    allday: "#4caf50", // Green
    morning: "#ff9800", // Orange
    afternoon: "#2196f3", // Blue
  };
  return colorMap[timeSlot];
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
