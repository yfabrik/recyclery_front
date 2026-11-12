import { Delete } from "@mui/icons-material";
import { Box, Card, CardContent, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { AddRangeButton, RangeEditorRow } from "../taskAssignment/RangeEditor";
import { describeTaskPlace, taskMinuteWindow } from "./dayModel";
import type { DayRange, EmployeeDayRow } from "./localDay";

interface AssignedTaskCardProps {
  /** A row with `status: "assigned"`. */
  row: EmployeeDayRow;
  /** The Employee's color (their `employeeColor`). */
  color: string;
  /** The Employee's name, for the accessible names of the buttons and sliders. */
  employeeName: string;
  /** Removes the Employee from this Task (all their Time ranges on it). */
  onUnassign: (taskId: number) => void;
  /** Adds a Time range on this Task, on the first window the Employee has left there. */
  onAddRange: (taskId: number) => void;
  /** Removes one of the Time ranges (offered only when the Employee holds several here). */
  onRemoveRange: (range: DayRange) => void;
  /** Moves a Time range; the slider only reports positions inside the allowed windows. */
  onUpdateRange: (range: DayRange, start: number, end: number) => void;
}

/**
 * A Task the Employee holds: its name, hours and Store, and the Employee's Time ranges on it,
 * each with its slider, exactly as the Task assignment dialog edits them.
 */
export const AssignedTaskCard = ({
  row,
  color,
  employeeName,
  onUnassign,
  onAddRange,
  onRemoveRange,
  onUpdateRange,
}: AssignedTaskCardProps) => {
  const taskWindow = taskMinuteWindow(row.task);
  // Several cards sit side by side, so the Task is part of the accessible names.
  const subject = `${employeeName} sur ${row.task.name}`;

  return (
    <Card variant="outlined" sx={{ borderLeft: "4px solid", borderLeftColor: color }}>
      <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600}>
              {row.task.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {describeTaskPlace(row.task)}
            </Typography>
          </Box>
          <AddRangeButton
            subject={subject}
            canAdd={row.newRangeWindows.length > 0}
            onAdd={() => onAddRange(row.task.id)}
          />
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
        <Stack spacing={0.5} sx={{ mt: 1 }}>
          {row.ranges.map((range, index) => (
            <RangeEditorRow
              key={range.key}
              task={taskWindow}
              range={range}
              position={index + 1}
              removable={row.ranges.length > 1}
              color={color}
              subject={subject}
              free={row.rangeWindows[index] ?? []}
              onChange={(start, end) => onUpdateRange(range, start, end)}
              onRemove={() => onRemoveRange(range)}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};
