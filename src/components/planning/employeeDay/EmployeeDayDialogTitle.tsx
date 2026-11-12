import { Box, Chip, DialogTitle, Stack, Typography } from "@mui/material";
import type { IsoDate } from "@recyclerie/api/primitives/zod";
import type { WorkWindowDto } from "@recyclerie/api/responses/timeRanges";
import { EmployeeAvatar, employeeName, type Employee } from "../../../employee";
import { formatDayLong } from "../../../services/planning/employeeDayDate";
import { toMinuteWindow } from "../taskAssignment/geometry";
import { formatWindow } from "./dayModel";

interface EmployeeDayDialogTitleProps {
  employee: Employee;
  date: IsoDate;
  /** The Employee's Workday hours that day; `undefined` while the day is still loading. */
  workWindows: readonly WorkWindowDto[] | undefined;
  /** Id of the element naming the dialog (the Employee and the day). */
  titleId: string;
}

/** Avatar, name, the day in French and the Employee's work hours that day. */
export const EmployeeDayDialogTitle = ({ employee, date, workWindows, titleId }: EmployeeDayDialogTitleProps) => (
  <DialogTitle component="div">
    <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
      <EmployeeAvatar employee={employee} size="large" />
      <Box id={titleId} sx={{ flex: 1, minWidth: 160 }}>
        <Typography variant="h6" component="h2" sx={{ lineHeight: 1.2 }}>
          {employeeName(employee)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ "&::first-letter": { textTransform: "uppercase" } }}>
          {formatDayLong(date)}
        </Typography>
      </Box>
      {workWindows && (
        <Stack direction="row" spacing={0.5} role="group" aria-label="Horaires de travail" useFlexGap flexWrap="wrap">
          {workWindows.length === 0 ? (
            <Chip size="small" label="Ne travaille pas ce jour" />
          ) : (
            workWindows.map((window) => (
              <Chip
                key={window.start_time}
                size="small"
                variant="outlined"
                label={formatWindow(toMinuteWindow(window))}
              />
            ))
          )}
        </Stack>
      )}
    </Stack>
  </DialogTitle>
);
