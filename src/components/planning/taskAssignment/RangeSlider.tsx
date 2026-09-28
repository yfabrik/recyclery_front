import { Box, Slider } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  clampRangeToWindow,
  nearestWindow,
  subtractWindows,
  TIME_RANGE_STEP_MINUTES,
  type MinuteWindow,
} from "@recyclerie/api/domain/timeRange";
import { BLOCKED_FILL, formatMinutes, hourMarks, isMinuteRange, type LocalRange } from "./geometry";

type RangeSliderProps = {
  task: MinuteWindow;
  range: LocalRange;
  label: string;
  color: string;
  free: readonly MinuteWindow[];
  employeeName: string;
  onChange: (start: number, end: number) => void;
};

/**
 * A range sitting in a blocked zone is shown as is; a drag snaps it into the nearest
 * allowed window (`free`), or is ignored if there is none.
 */
export const RangeSlider = ({ task, range, label, color, free, employeeName, onChange }: RangeSliderProps) => {
  const blocked = subtractWindows(task, free);
  const pct = (value: number) => ((value - task.start) / (task.end - task.start)) * 100;

  return (
    <Box sx={{ px: 1.5 }}>
      <Box sx={{ position: "relative", height: 56 }}>
        <Box
          sx={{
            position: "absolute",
            inset: "18px 0 auto 0",
            height: 10,
            borderRadius: 1,
            overflow: "hidden",
            bgcolor: alpha(color, 0.35),
            pointerEvents: "none",
          }}
        >
          {blocked.map((window) => (
            <Box
              key={`${window.start}-${window.end}`}
              sx={{
                position: "absolute",
                left: `${pct(window.start)}%`,
                width: `${pct(window.end) - pct(window.start)}%`,
                top: 0,
                bottom: 0,
                background: BLOCKED_FILL,
              }}
            />
          ))}
          <Box
            sx={{
              position: "absolute",
              left: `${pct(range.start)}%`,
              width: `${pct(range.end) - pct(range.start)}%`,
              top: 0,
              bottom: 0,
              bgcolor: color,
            }}
          />
        </Box>
        <Slider
          getAriaLabel={(thumb) => `${thumb === 0 ? "Début" : "Fin"} ${label} de ${employeeName}`}
          getAriaValueText={formatMinutes}
          value={[range.start, range.end]}
          min={task.start}
          max={task.end}
          step={TIME_RANGE_STEP_MINUTES}
          disableSwap
          marks={hourMarks(task.start, task.end)}
          valueLabelDisplay="auto"
          valueLabelFormat={formatMinutes}
          onChange={(_event, value, activeThumb) => {
            if (!isMinuteRange(value)) return;
            const fragment = nearestWindow(free, activeThumb === 0 ? value[0] : value[1]);
            if (!fragment) return;
            const clamped = clampRangeToWindow(value, fragment);
            if (!clamped) return;
            onChange(clamped[0], clamped[1]);
          }}
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 4,
            color,
            "& .MuiSlider-rail": { display: "none" },
            "& .MuiSlider-track": { display: "none" },
            "& .MuiSlider-thumb": { width: 16, height: 16 },
            "& .MuiSlider-valueLabel": { pointerEvents: "none" },
            "& .MuiSlider-markLabel": { fontSize: 10 },
          }}
        />
      </Box>
    </Box>
  );
};
