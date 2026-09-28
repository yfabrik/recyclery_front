import { AddCircleOutline, Delete } from "@mui/icons-material";
import { Avatar, Box, Button, Card, CardContent, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import type { MinuteWindow } from "@recyclerie/api/domain/timeRange";
import {
  employeeColor,
  employeeDisplayName,
  formatMinutes,
  freeWindowsForEmployee,
  type EmployeeInfo,
  type LocalRange,
} from "./geometry";
import { RangeSlider } from "./RangeSlider";

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
  const color = employeeColor(info.id);
  const name = employeeDisplayName(info);
  const canAddRange = freeWindowsForEmployee(task, info, allRanges).length > 0;

  return (
    <Card variant="outlined" sx={{ borderLeft: "4px solid", borderLeftColor: color }}>
      <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 32, height: 32, bgcolor: color, fontSize: 14 }}>
            {name
              .split(" ")
              .map((part) => part[0])
              .join("")}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600}>
              {name}
            </Typography>
          </Box>
          <Tooltip describeChild title={canAddRange ? "" : "Plus de plage horaire libre"}>
            <span>
              <Button
                size="small"
                startIcon={<AddCircleOutline />}
                disabled={!canAddRange}
                aria-label={`Ajouter une plage horaire pour ${name}`}
                onClick={() => onAddRange(info.id)}
              >
                Ajouter une plage horaire
              </Button>
            </span>
          </Tooltip>
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
          {employeeRanges.map((range, index) => {
            const label = `plage horaire ${index + 1}`;
            const free = freeWindowsForEmployee(task, info, allRanges, range.key);
            return (
              <Box key={range.key}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Plage horaire {index + 1} · {formatMinutes(range.start)}–
                    {formatMinutes(range.end)}
                  </Typography>
                  {employeeRanges.length > 1 ? (
                    <Tooltip title="Retirer cette plage horaire">
                      <IconButton
                        size="small"
                        aria-label={`Retirer le ${label} de ${name}`}
                        onClick={() => onRemoveRange(range)}
                      >
                        <Delete fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </Stack>
                <RangeSlider
                  task={task}
                  range={range}
                  label={label}
                  color={color}
                  free={free}
                  employeeName={name}
                  onChange={(start, end) => onUpdateRange(range, start, end)}
                />
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};
