import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import type { EmployeeTaskRowDto } from "@recyclerie/api/responses/employeeTasks";
import { toMinuteWindow } from "../taskAssignment/geometry";
import { formatWindow, taskMinuteWindow } from "./dayModel";

interface AssignedTaskCardProps {
  /** A row with `status: "assigned"`. */
  row: EmployeeTaskRowDto;
  /** The Employee's color (their `employeeColor`). */
  color: string;
}

/** A Task the Employee holds: its name, hours and Store, and the Employee's Time ranges on it. */
export const AssignedTaskCard = ({ row, color }: AssignedTaskCardProps) => (
  <Card variant="outlined" sx={{ borderLeft: "4px solid", borderLeftColor: color }}>
    <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600}>
            {row.task.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatWindow(taskMinuteWindow(row.task))} · {row.task.Recyclery?.name ?? "Sans magasin"}
          </Typography>
        </Box>
      </Stack>
      <Stack spacing={0.25} sx={{ mt: 1 }}>
        {row.timeRanges.map((range, index) => (
          <Typography key={range.id} variant="caption" color="text.secondary">
            Plage horaire {index + 1} · {formatWindow(toMinuteWindow(range))}
          </Typography>
        ))}
      </Stack>
    </CardContent>
  </Card>
);
