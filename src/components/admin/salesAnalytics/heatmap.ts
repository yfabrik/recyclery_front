import { decomposeColor, getContrastRatio, recomposeColor } from "@mui/material/styles";
import type { Weekday } from "@recyclerie/api/enums";
import { WEEKDAY_LABELS_FR } from "@recyclerie/api/domain/date";
import type { SalesHeatmapDto } from "@recyclerie/api/responses/salesAnalytics";
import type { SalesAnalyticsFilters } from "./filters";

/** What the cells are coloured by. */
export type HeatmapMetric = "net_revenue" | "sales_count";

/**
 * The heatmap has no comparison overlay, so it always queries with
 * `compare=none`: the server computes one grid, and changing the page's
 * comparison does not refetch it.
 */
export const heatmapFilters = (filters: SalesAnalyticsFilters): SalesAnalyticsFilters => ({
  ...filters,
  compare: "none",
});

/** Top of the colour scale: the largest value of the metric in the grid, 0 if none is positive. */
export const heatmapMax = (heatmap: SalesHeatmapDto, metric: HeatmapMetric) =>
  Math.max(0, ...heatmap.rows.flatMap((row) => row.cells.map((cell) => cell[metric])));

/** Lightest tint of a positive cell, so a small one stands out from an empty one. */
const MIN_INTENSITY = 0.12;

/** Position of a value on the sequential scale: 0 for nothing (or only Refunds), 1 for the max. */
export const cellIntensity = (value: number, max: number) =>
  value <= 0 || max <= 0
    ? 0
    : MIN_INTENSITY + (1 - MIN_INTENSITY) * Math.min(value / max, 1);

/** Opaque colour `weight` of the way from `from` to `to`. */
const mix = (from: string, to: string, weight: number) => {
  const a = decomposeColor(from).values;
  const b = decomposeColor(to).values;
  const channel = (i: 0 | 1 | 2) => Math.round(a[i] + (b[i] - a[i]) * weight);
  return recomposeColor({ type: "rgb", values: [channel(0), channel(1), channel(2)] });
};

const TEXT_COLORS = ["#000", "#fff"] as const;

/**
 * Background of a cell on the scale from the paper colour to the accent, and
 * whichever of black or white text reads best on it. One of the two always
 * reaches 4.5:1, whatever the theme mode.
 */
export const heatmapCellColors = (
  palette: { paper: string; accent: string },
  intensity: number,
) => {
  const background = mix(palette.paper, palette.accent, intensity);
  const [black, white] = TEXT_COLORS;
  const color =
    getContrastRatio(white, background) > getContrastRatio(black, background) ? white : black;
  return { background, color };
};

/** "Lundi 10h–11h". */
export const heatmapCellLabel = (weekday: Weekday, hour: number) =>
  `${WEEKDAY_LABELS_FR[weekday]} ${hour}h–${hour + 1}h`;
