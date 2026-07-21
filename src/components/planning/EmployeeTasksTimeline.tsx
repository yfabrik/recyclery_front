import {
  Assignment,
  Build,
  CleaningServices,
  Place,
  PointOfSale,
  Recycling,
  School,
  LocalShipping,
} from "@mui/icons-material";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import { Box, Paper, Typography } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import type { Weekday } from "@recyclerie/api/enums";
import dayjs from "dayjs";
import { weekdayLabel } from "../../services/dateService";

/**
 * Shape of a single task for the timeline (compatible with TaskModel).
 */
export interface EmployeeTaskItem {
  name: string;
  start_time: Date | string;
  end_time: Date | string;
  day_of_week: Weekday | number | string;
  /** Task category used to pick the timeline icon (e.g. vente, point, collection, custom). */
  category?: string;
}

function formatDayOfWeek(day: EmployeeTaskItem["day_of_week"]): string {
  if (typeof day === "number") return weekdayLabel(day);
  const asNum = Number(day);
  if (day !== "" && !Number.isNaN(asNum) && asNum >= 0 && asNum <= 6) {
    return weekdayLabel(asNum);
  }
  return String(day);
}

const CATEGORY_ICONS: Record<string, SvgIconComponent> = {
  collection: LocalShipping,
  sorting: Recycling,
  maintenance: Build,
  sales: PointOfSale,
  vente: PointOfSale,
  administration: Assignment,
  cleaning: CleaningServices,
  transport: LocalShipping,
  training: School,
  point: Place,
  custom: Assignment,
};
const DEFAULT_CATEGORY_ICON = Assignment;

function getCategoryIcon(category?: string): SvgIconComponent {
  if (!category) return DEFAULT_CATEGORY_ICON;
  return CATEGORY_ICONS[category] ?? DEFAULT_CATEGORY_ICON;
}

export interface EmployeeTasksTimelineProps {
  /** List of employee tasks to display in chronological order */
  tasks: EmployeeTaskItem[];
  /** Employee name shown at the top (e.g. for printing). */
  employeeName?: string;
}

function formatTime(value: Date | string): string {
  if (!value) return "–";
  return dayjs(value).format("HH:mm");
}

/**
 * Timeline component that displays employee tasks with start/end time,
 * day of week and task name.
 */
const printStyles = {
  "@media print": {
    breakInside: "avoid",
    printColorAdjust: "exact" as const,
    WebkitPrintColorAdjust: "exact" as const,
    "& .MuiTimelineItem-root": { breakInside: "avoid" },
  },
};

export function EmployeeTasksTimeline({
  tasks,
  employeeName,
}: EmployeeTasksTimelineProps) {
  if (!tasks?.length) {
    return (
      <Box sx={printStyles}>
        {employeeName && (
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", mb: 1 }}>
            {employeeName}
          </Typography>
        )}
        <Typography color="text.secondary" sx={{ py: 2 }}>
          Aucune tâche à afficher.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={printStyles}>
      {employeeName && (
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: "bold",
            mb: 2,
            "@media print": { marginBottom: 4 },
          }}
        >
          {employeeName}
        </Typography>
      )}
      <Timeline position="right" sx={{ p: 0 }}>
      {tasks.map((task, index) => {
        const Icon = getCategoryIcon(task.category);
        return (
          <TimelineItem key={index}>
            <TimelineOppositeContent
              sx={{
                py: 1.5,
                px: 0,
                flex: "0 0 auto",
                maxWidth: 110,
                textAlign: "right",
                pr: 2,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                component="div"
                sx={{ display: "block" }}
              >
                {formatDayOfWeek(task.day_of_week)}
              </Typography>
              <Typography
                variant="body2"
                fontWeight="medium"
                component="div"
                sx={{ display: "block", mt: 0.25 }}
              >
                {formatTime(task.start_time)} – {formatTime(task.end_time)}
              </Typography>
            </TimelineOppositeContent>
            <TimelineSeparator sx={{ flex: "0 0 auto" }}>
              <TimelineDot color="primary" variant="outlined" sx={{ p: 0.75 }}>
                <Icon sx={{ fontSize: 20 }} />
              </TimelineDot>
              {index < tasks.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent sx={{ py: 1.5, px: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "action.hover",
                }}
              >
                <Typography variant="body1" fontWeight="medium">
                  {task.name}
                </Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
        );
      })}
      </Timeline>
    </Box>
  );
}
