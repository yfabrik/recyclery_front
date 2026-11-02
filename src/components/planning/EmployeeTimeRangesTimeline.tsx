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
import { toIsoTime, weekday } from "@recyclerie/api/domain/date";
import { weekdayLabel } from "../../services/dateService";
import type { EmployeeTimeRangeItem } from "../../services/planning/printEntries";

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

export interface EmployeeTimeRangesTimelineProps {
  /** Employee Time ranges to display in chronological order */
  timeRanges: EmployeeTimeRangeItem[];
  /** Employee name shown at the top (e.g. for printing). */
  employeeName?: string;
}

function formatTime(value: Date | string): string {
  if (!value) return "–";
  return toIsoTime(value);
}

const printStyles = {
  "@media print": {
    breakInside: "avoid",
    printColorAdjust: "exact" as const,
    WebkitPrintColorAdjust: "exact" as const,
    "& .MuiTimelineItem-root": { breakInside: "avoid" },
  },
};

/**
 * Timeline component that displays employee Time ranges with start/end time,
 * day of week and task name.
 */
export function EmployeeTimeRangesTimeline({
  timeRanges,
  employeeName,
}: EmployeeTimeRangesTimelineProps) {
  if (!timeRanges?.length) {
    return (
      <Box sx={printStyles}>
        {employeeName && (
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", mb: 1 }}>
            {employeeName}
          </Typography>
        )}
        <Typography color="text.secondary" sx={{ py: 2 }}>
          Aucune plage horaire à afficher.
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
      {timeRanges.map((timeRange, index) => {
        const Icon = getCategoryIcon(timeRange.category);
        return (
          <TimelineItem
            key={`${timeRange.date}-${timeRange.start_time}-${timeRange.name}`}
          >
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
                {weekdayLabel(weekday(timeRange.date))}
              </Typography>
              <Typography
                variant="body2"
                fontWeight="medium"
                component="div"
                sx={{ display: "block", mt: 0.25 }}
              >
                {formatTime(timeRange.start_time)} – {formatTime(timeRange.end_time)}
              </Typography>
            </TimelineOppositeContent>
            <TimelineSeparator sx={{ flex: "0 0 auto" }}>
              <TimelineDot color="primary" variant="outlined" sx={{ p: 0.75 }}>
                <Icon sx={{ fontSize: 20 }} />
              </TimelineDot>
              {index < timeRanges.length - 1 && <TimelineConnector />}
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
                  {timeRange.name}
                </Typography>
                {timeRange.storeName ? (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", fontSize: "0.75rem", mt: 0.25 }}
                  >
                    {timeRange.storeName}
                  </Typography>
                ) : null}
              </Paper>
            </TimelineContent>
          </TimelineItem>
        );
      })}
      </Timeline>
    </Box>
  );
}
