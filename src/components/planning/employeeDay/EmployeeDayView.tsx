import { BeachAccess } from "@mui/icons-material";
import { Alert, Box, Grid, Stack, Typography } from "@mui/material";
import type { EmployeeTasksDayDto } from "@recyclerie/api/responses/employeeTasks";
import type { EmployeeVacationDto } from "@recyclerie/api/responses/vacations";
import { getVacationReasonLabel } from "../../../constants/vacationReasons";
import { employeeColor, employeeName, type Employee } from "../../../employee";
import { toMinuteWindow } from "../taskAssignment/geometry";
import { AssignableTaskCard } from "./AssignableTaskCard";
import { AssignedTaskCard } from "./AssignedTaskCard";
import { DayStrip, type DayStripRange } from "./DayStrip";
import { EmptyColumnMessage } from "./EmptyColumnMessage";
import { splitRows } from "./dayModel";
import type { EmployeeDayRow } from "./localDay";

interface EmployeeDayViewProps {
  employee: Employee;
  /** The server's day: Workday hours (and, from the Vacation tickets on, the Vacation). */
  day: EmployeeTasksDayDto;
  /** The Tasks of the day with their status for the Employee's current (local) Time ranges. */
  rows: readonly EmployeeDayRow[];
  /** Assigns the Employee to the Task (the "+" of an assignable Task). */
  onAssign: (taskId: number) => void;
  /** Removes the Employee from the Task (the trash button of an assigned Task). */
  onUnassign: (taskId: number) => void;
}

/** An Employee on Vacation with nothing assigned: the server refuses any new Assignment that day. */
const VacationInfo = ({ reason }: { reason: EmployeeVacationDto["reason"] }) => (
  <Alert severity="info" icon={<BeachAccess />} sx={{ mb: 2 }}>
    En congé ({getVacationReasonLabel(reason)}) : aucune tâche ne peut lui être assignée.
  </Alert>
);

/**
 * The body of the Employee day dialog: a day strip, then the Tasks the Employee holds
 * and the Tasks they could take or cannot. Pure view: the dialog owns the data, the local
 * state (`useEmployeeDayEditor`) and the callbacks.
 */
export const EmployeeDayView = ({ employee, day, rows, onAssign, onUnassign }: EmployeeDayViewProps) => {
  const { assigned, others } = splitRows(rows);
  // On Vacation but still holding Tasks is a Vacation conflict, shown by its own banner.
  const vacation = assigned.length === 0 ? day.vacation : null;

  if (rows.length === 0) {
    return (
      <>
        {vacation && <VacationInfo reason={vacation.reason} />}
        <EmptyColumnMessage text="Aucune tâche planifiée ce jour" />
      </>
    );
  }

  const color = employeeColor(employee);
  const name = employeeName(employee);
  const stripRanges: DayStripRange[] = assigned.flatMap((row) =>
    row.ranges.map((range) => ({
      key: range.key,
      taskName: row.task.name,
      window: { start: range.start, end: range.end },
    })),
  );

  return (
    <>
      {vacation && <VacationInfo reason={vacation.reason} />}
      <DayStrip
        label={`Journée de ${name}`}
        color={color}
        workWindows={day.workWindows.map(toMinuteWindow)}
        ranges={stripRanges}
      />
      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 7 }} component="section" aria-label="Tâches assignées">
          <Typography variant="h6" gutterBottom>
            Tâches assignées ({assigned.length})
          </Typography>
          {assigned.length === 0 ? (
            <EmptyColumnMessage text="Aucune tâche assignée" />
          ) : (
            <Stack spacing={1.5}>
              {assigned.map((row) => (
                <AssignedTaskCard
                  key={row.task.id}
                  row={row}
                  color={color}
                  employeeName={name}
                  onUnassign={onUnassign}
                />
              ))}
            </Stack>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 5 }} component="section" aria-label="Tâches assignables">
          <Typography variant="h6" gutterBottom>
            Tâches assignables
          </Typography>
          {others.length === 0 ? (
            <EmptyColumnMessage text="Aucune autre tâche ce jour" />
          ) : (
            <Box sx={{ maxHeight: 480, overflow: "auto" }}>
              {others.map((row) => (
                <AssignableTaskCard key={row.task.id} row={row} employeeName={name} onAssign={onAssign} />
              ))}
            </Box>
          )}
        </Grid>
      </Grid>
    </>
  );
};
