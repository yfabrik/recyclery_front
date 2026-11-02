import { Add, Block, CheckCircle } from "@mui/icons-material";
import { Box, Card, CardContent, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { formatWindow, taskMinuteWindow, unavailableReasonText } from "./dayModel";
import type { EmployeeDayRow } from "./localDay";

interface AssignableTaskCardProps {
  /** A row with `status: "assignable"` or `"unavailable"`. */
  row: EmployeeDayRow;
  /** The Employee's name, for the accessible name of the assign button. */
  employeeName: string;
  /** Assigns the Employee to this Task, on its first free window. */
  onAssign: (taskId: number) => void;
}

/** A Task the Employee does not hold: where they could cover it ("Libre"), or why they cannot ("Impossible"). */
export const AssignableTaskCard = ({ row, employeeName, onAssign }: AssignableTaskCardProps) => {
  const unavailable = row.status === "unavailable";

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1,
        bgcolor: unavailable ? "#ffebee" : "#f1f8e9",
        border: unavailable ? "2px solid #f44336" : "1px solid #e0e0e0",
      }}
    >
      <CardContent sx={{ py: 1, px: 2, "&:last-child": { pb: 1 } }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={500}>
              {row.task.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {formatWindow(taskMinuteWindow(row.task))} · {row.task.Recyclery?.name ?? "Sans magasin"}
            </Typography>
            <Typography variant="caption" color={unavailable ? "error" : "text.secondary"} display="block">
              {unavailable
                ? unavailableReasonText(row)
                : `Libre ${row.freeWindows.map(formatWindow).join(", ")}`}
            </Typography>
          </Box>
          {unavailable ? (
            <Chip label="Impossible" size="small" color="error" sx={{ fontSize: "0.7rem" }} />
          ) : (
            <Chip icon={<CheckCircle />} label="Libre" size="small" color="success" sx={{ fontSize: "0.7rem" }} />
          )}
          {unavailable ? (
            <Tooltip describeChild title={unavailableReasonText(row)}>
              <span>
                <IconButton size="small" color="error" disabled aria-label={`Impossible d'assigner ${row.task.name}`}>
                  <Block />
                </IconButton>
              </span>
            </Tooltip>
          ) : (
            <Tooltip title="Assigner à cette tâche">
              <IconButton
                size="small"
                color="success"
                aria-label={`Assigner ${employeeName} à ${row.task.name}`}
                onClick={() => onAssign(row.task.id)}
                sx={{ bgcolor: "#e8f5e8", "&:hover": { bgcolor: "#c8e6c9" } }}
              >
                <Add />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
