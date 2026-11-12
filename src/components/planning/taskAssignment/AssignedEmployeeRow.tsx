import { Delete } from "@mui/icons-material";
import { Box, Card, CardContent, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import type { MinuteWindow } from "@recyclerie/api/domain/timeRange";
import { EmployeeAvatar, employeeColor, employeeName } from "../../../employee";
import { freeWindowsForEmployee, type EmployeeInfo, type LocalRange } from "./geometry";
import { AddRangeButton, RangeEditorRow } from "./RangeEditor";

type AssignedEmployeeRowProps = {
  task: MinuteWindow;
  info: EmployeeInfo;
  employeeRanges: readonly LocalRange[];
  allRanges: readonly LocalRange[];
  onUpdateRange: (range: LocalRange, start: number, end: number) => void;
  onAddRange: (employeeId: number) => void;
  onRemoveRange: (range: LocalRange) => void;
  onRemoveEmployee: (employeeId: number) => void;
};

export const AssignedEmployeeRow = ({
  task,
  info,
  employeeRanges,
  allRanges,
  onUpdateRange,
  onAddRange,
  onRemoveRange,
  onRemoveEmployee,
}: AssignedEmployeeRowProps) => {
  const color = employeeColor(info);
  const name = employeeName(info);
  const canAddRange = freeWindowsForEmployee(task, info, allRanges).length > 0;

  return (
    <Card variant="outlined" sx={{ borderLeft: "4px solid", borderLeftColor: color }}>
      <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <EmployeeAvatar employee={info} size="large" />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600}>
              {name}
            </Typography>
          </Box>
          <AddRangeButton subject={name} canAdd={canAddRange} onAdd={() => onAddRange(info.id)} />
          <Tooltip title="Retirer cet employé de la tâche">
            <IconButton
              size="small"
              color="error"
              aria-label={`Retirer ${name} de la tâche`}
              onClick={() => onRemoveEmployee(info.id)}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack spacing={0.5} sx={{ mt: 1 }}>
          {employeeRanges.map((range, index) => (
            <RangeEditorRow
              key={range.key}
              task={task}
              range={range}
              position={index + 1}
              removable={employeeRanges.length > 1}
              color={color}
              subject={name}
              free={freeWindowsForEmployee(task, info, allRanges, range.key)}
              onChange={(start, end) => onUpdateRange(range, start, end)}
              onRemove={() => onRemoveRange(range)}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};
