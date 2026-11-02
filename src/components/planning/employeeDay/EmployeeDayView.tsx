import { Box, Grid, Stack, Typography } from "@mui/material";
import type { EmployeeTasksDayDto } from "@recyclerie/api/responses/employeeTasks";
import { employeeColor, employeeName, type Employee } from "../../../employee";
import { toMinuteWindow } from "../taskAssignment/geometry";
import { AssignableTaskCard } from "./AssignableTaskCard";
import { AssignedTaskCard } from "./AssignedTaskCard";
import { DayStrip, type DayStripRange } from "./DayStrip";
import { EmptyColumnMessage } from "./EmptyColumnMessage";
import { splitRows } from "./dayModel";

interface EmployeeDayViewProps {
  employee: Employee;
  day: EmployeeTasksDayDto;
}

/**
 * The body of the Employee day dialog: a day strip, then the Tasks the Employee holds
 * and the Tasks they could take or cannot. Pure view of one `EmployeeTasksDayDto`: the
 * dialog owns the data (and, from the write tickets on, the local state and the callbacks).
 */
export const EmployeeDayView = ({ employee, day }: EmployeeDayViewProps) => {
  if (day.rows.length === 0) return <EmptyColumnMessage text="Aucune tâche planifiée ce jour" />;

  const { assigned, others } = splitRows(day.rows);
  const color = employeeColor(employee);
  const stripRanges: DayStripRange[] = assigned.flatMap((row) =>
    row.timeRanges.map((range) => ({
      key: `range-${range.id}`,
      taskName: row.task.name,
      window: toMinuteWindow(range),
    })),
  );

  return (
    <>
      <DayStrip
        label={`Journée de ${employeeName(employee)}`}
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
                <AssignedTaskCard key={row.task.id} row={row} color={color} />
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
                <AssignableTaskCard key={row.task.id} row={row} />
              ))}
            </Box>
          )}
        </Grid>
      </Grid>
    </>
  );
};
