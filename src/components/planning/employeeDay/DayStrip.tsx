import { Box, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { MinuteWindow } from "@recyclerie/api/domain/timeRange";
import { formatMinutes } from "../taskAssignment/geometry";
import { dayStripBounds, formatDuration, formatWindow, hourTicks, totalMinutes } from "./dayModel";

/** One assigned Time range as drawn on the strip. */
export interface DayStripRange {
  key: string;
  taskName: string;
  window: MinuteWindow;
}

interface DayStripProps {
  /** Accessible name of the strip, e.g. "Journée de Léa Martin". */
  label: string;
  color: string;
  workWindows: readonly MinuteWindow[];
  ranges: readonly DayStripRange[];
}

/** One-line day axis: the Employee's work hours as a band, their assigned Time ranges on top. */
export const DayStrip = ({ label, color, workWindows, ranges }: DayStripProps) => {
  const { start: from, end: to } = dayStripBounds([...workWindows, ...ranges.map((range) => range.window)]);
  const pct = (value: number) => ((value - from) / (to - from)) * 100;
  const assigned = totalMinutes(ranges.map((range) => range.window));
  const present = totalMinutes(workWindows);

  return (
    <Box sx={{ mb: 1 }} role="group" aria-label={label}>
      <Typography variant="caption" color="text.secondary">
        {present === 0
          ? `Ne travaille pas ce jour — ${formatDuration(assigned)} assignées`
          : `Journée de l'employé — ${formatDuration(assigned)} assignées sur ${formatDuration(present)} de présence`}
      </Typography>
      <Box
        sx={{ position: "relative", height: 30, mt: 0.5, bgcolor: "#eceff1", borderRadius: 1, overflow: "hidden" }}
      >
        {workWindows.map((window) => (
          <Box
            key={window.start}
            role="img"
            aria-label={`Horaires de travail ${formatWindow(window)}`}
            sx={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${pct(window.start)}%`,
              width: `${pct(window.end) - pct(window.start)}%`,
              bgcolor: alpha("#4caf50", 0.18),
            }}
          />
        ))}
        {ranges.map(({ key, taskName, window }) => {
          const description = `${taskName} · ${formatWindow(window)}`;
          return (
            <Tooltip key={key} title={description}>
              <Box
                role="img"
                aria-label={description}
                sx={{
                  position: "absolute",
                  top: 4,
                  bottom: 4,
                  left: `${pct(window.start)}%`,
                  width: `${pct(window.end) - pct(window.start)}%`,
                  bgcolor: color,
                  borderRadius: 0.5,
                  color: "#fff",
                  fontSize: 10,
                  px: 0.5,
                  lineHeight: "22px",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {taskName}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
      <Box aria-hidden sx={{ position: "relative", height: 14 }}>
        {hourTicks({ start: from, end: to }).map((tick) => (
          <Typography
            key={tick}
            variant="caption"
            color="text.secondary"
            sx={{ position: "absolute", left: `${pct(tick)}%`, transform: "translateX(-50%)", fontSize: 10 }}
          >
            {formatMinutes(tick)}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};
