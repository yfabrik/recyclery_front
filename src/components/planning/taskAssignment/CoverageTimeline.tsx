import { Box, Tooltip, Typography } from "@mui/material";
import { useMemo } from "react";
import type { MinuteWindow } from "@recyclerie/api/domain/timeRange";
import { coverageColor, coverageSegments, formatMinutes, type LocalRange } from "./geometry";

type CoverageTimelineProps = {
  task: MinuteWindow;
  ranges: readonly LocalRange[];
};

/** Headcount over the Task's time span, so gaps and peaks are visible at a glance. */
export const CoverageTimeline = ({ task, ranges }: CoverageTimelineProps) => {
  const duration = task.end - task.start;
  const segments = useMemo(() => coverageSegments(task, ranges), [task, ranges]);
  if (duration <= 0) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        Effectif sur la tâche
      </Typography>
      <Box
        role="group"
        aria-label="Effectif assigné au cours de la tâche"
        sx={{
          display: "flex",
          height: 36,
          borderRadius: 1,
          overflow: "hidden",
          border: "1px solid #b0bec5",
        }}
      >
        {segments.map((segment) => (
          <Tooltip
            key={segment.start}
            title={`${formatMinutes(segment.start)}–${formatMinutes(segment.end)} · ${segment.count} employé${segment.count > 1 ? "s" : ""}`}
          >
            <Box
              sx={{
                width: `${((segment.end - segment.start) / duration) * 100}%`,
                bgcolor: coverageColor(segment.count),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: segment.count === 0 ? "#37474f" : "#fff",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {segment.count}
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};
