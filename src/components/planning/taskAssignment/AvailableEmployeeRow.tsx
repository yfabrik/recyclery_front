import { Add, Block, CheckCircle, Person } from "@mui/icons-material";
import { Box, Card, CardContent, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import { assignableWindows, type MinuteWindow } from "@recyclerie/api/domain/timeRange";
import type { TaskAvailableEmployeeDto } from "@recyclerie/api/responses/timeRanges";
import { employeeName } from "../../../employee";
import { formatMinutes, toMinuteWindow } from "./geometry";

type AvailableEmployeeRowProps = {
  task: MinuteWindow;
  employee: TaskAvailableEmployeeDto;
  onAssign: (employee: TaskAvailableEmployeeDto) => void;
};

/** Busy means the Employee has no free window left on the Task; otherwise its free windows are listed. */
export const AvailableEmployeeRow = ({ task, employee, onAssign }: AvailableEmployeeRowProps) => {
  const free = assignableWindows({
    task,
    workWindows: employee.workWindows.map(toMinuteWindow),
    otherRanges: employee.busyRanges.map(toMinuteWindow),
  });
  const busy = free.length === 0;
  const name = employeeName(employee);

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1,
        bgcolor: busy ? "#ffebee" : "#f1f8e9",
        border: busy ? "2px solid #f44336" : "1px solid #e0e0e0",
      }}
    >
      <CardContent sx={{ py: 1, px: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {busy ? (
              <Block color="error" sx={{ fontSize: 20 }} />
            ) : (
              <Person color="success" sx={{ fontSize: 20 }} />
            )}
            <Typography variant="body2" fontWeight="medium" sx={{ color: busy ? "#d32f2f" : "inherit" }}>
              {name}
            </Typography>
            {busy ? (
              <Chip label="Occupé" size="small" color="error" sx={{ fontSize: "0.7rem" }} />
            ) : (
              <Chip
                icon={<CheckCircle />}
                label="Libre"
                size="small"
                color="success"
                sx={{ fontSize: "0.7rem" }}
              />
            )}
          </Box>
          {busy ? (
            <span>
              <IconButton size="small" color="error" disabled aria-label={`Impossible d'assigner ${name}`}>
                <Block />
              </IconButton>
            </span>
          ) : (
            <Tooltip title="Assigner cet employé">
              <IconButton
                size="small"
                color="success"
                aria-label={`Assigner ${name}`}
                onClick={() => onAssign(employee)}
                sx={{ bgcolor: "#e8f5e8", "&:hover": { bgcolor: "#c8e6c9" } }}
              >
                <Add />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        {!busy && (
          <Typography variant="caption" color="text.secondary">
            Libre{" "}
            {free
              .map((window) => `${formatMinutes(window.start)}–${formatMinutes(window.end)}`)
              .join(", ")}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
