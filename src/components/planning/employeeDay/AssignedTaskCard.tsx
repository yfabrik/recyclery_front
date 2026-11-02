import { Delete } from "@mui/icons-material";
import { Box, Card, CardContent, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { formatWindow, taskMinuteWindow } from "./dayModel";
import type { EmployeeDayRow } from "./localDay";

interface AssignedTaskCardProps {
  /** A row with `status: "assigned"`. */
  row: EmployeeDayRow;
  /** The Employee's color (their `employeeColor`). */
  color: string;
  /** The Employee's name, for the accessible name of the remove button. */
  employeeName: string;
  /** Removes the Employee from this Task (all their Time ranges on it). */
  onUnassign: (taskId: number) => void;
}

/** A Task the Employee holds: its name, hours and Store, and the Employee's Time ranges on it. */
export const AssignedTaskCard = ({ row, color, employeeName, onUnassign }: AssignedTaskCardProps) => (
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
        <Tooltip title="Retirer de la tâche">
          <IconButton
            size="small"
            color="error"
            aria-label={`Retirer ${employeeName} de ${row.task.name}`}
            onClick={() => onUnassign(row.task.id)}
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </Stack>
      <Stack spacing={0.25} sx={{ mt: 1 }}>
        {row.ranges.map((range, index) => (
          <Typography key={range.key} variant="caption" color="text.secondary">
            Plage horaire {index + 1} · {formatWindow(range)}
          </Typography>
        ))}
      </Stack>
    </CardContent>
  </Card>
);
