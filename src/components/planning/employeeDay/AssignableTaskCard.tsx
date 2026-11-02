import { CheckCircle } from "@mui/icons-material";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { EmployeeTaskRowDto } from "@recyclerie/api/responses/employeeTasks";
import { toMinuteWindow } from "../taskAssignment/geometry";
import { formatWindow, taskMinuteWindow, unavailableReasonText } from "./dayModel";

interface AssignableTaskCardProps {
  /** A row with `status: "assignable"` or `"unavailable"`. */
  row: EmployeeTaskRowDto;
}

/** A Task the Employee does not hold: where they could cover it ("Libre"), or why they cannot ("Impossible"). */
export const AssignableTaskCard = ({ row }: AssignableTaskCardProps) => {
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
                : `Libre ${row.freeWindows.map((window) => formatWindow(toMinuteWindow(window))).join(", ")}`}
            </Typography>
          </Box>
          {unavailable ? (
            <Chip label="Impossible" size="small" color="error" sx={{ fontSize: "0.7rem" }} />
          ) : (
            <Chip icon={<CheckCircle />} label="Libre" size="small" color="success" sx={{ fontSize: "0.7rem" }} />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
