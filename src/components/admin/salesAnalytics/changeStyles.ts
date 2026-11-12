import { TrendingDown, TrendingFlat, TrendingUp } from "@mui/icons-material";
import type { SvgIconComponent } from "@mui/icons-material";
import type { Change, changeTone } from "./change";

/** Theme colour of a change's tone (`changeTone`). */
export const TONE_COLORS = {
  success: "success.main",
  error: "error.main",
  neutral: "text.secondary",
} as const satisfies Record<ReturnType<typeof changeTone>, string>;

/** Arrow of a change's direction. */
export const TREND_ICONS = {
  up: TrendingUp,
  down: TrendingDown,
  flat: TrendingFlat,
} as const satisfies Record<Change["direction"], SvgIconComponent>;
