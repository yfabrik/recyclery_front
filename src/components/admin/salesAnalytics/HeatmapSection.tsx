import { GridOn } from "@mui/icons-material";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { WEEKDAY_LABELS_FR } from "@recyclerie/api/domain/date";
import type {
  SalesHeatmapCellDto,
  SalesHeatmapDto,
} from "@recyclerie/api/responses/salesAnalytics";
import { Fragment, useMemo, useState } from "react";
import { salesHeatmapRoute } from "../../../services/api/salesAnalytics";
import { formatCurrency } from "../../../services/cartService";
import { AnalyticsSectionCard } from "./AnalyticsSectionCard";
import {
  cellIntensity,
  heatmapCellColors,
  heatmapCellLabel,
  heatmapFilters,
  heatmapMax,
  type HeatmapMetric,
} from "./heatmap";
import type { SalesAnalyticsSectionProps } from "./sections";
import { useSalesAnalytics } from "./useSalesAnalytics";

const METRICS: { value: HeatmapMetric; label: string }[] = [
  { value: "net_revenue", label: "CA net" },
  { value: "sales_count", label: "Ventes" },
];

const count = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const compactCurrency = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
});

const formatMetric = (metric: HeatmapMetric, value: number) =>
  metric === "net_revenue" ? compactCurrency.format(value) : count.format(value);

const salesLabel = (n: number) => `${count.format(n)} vente${n > 1 ? "s" : ""}`;

const isEmptyCell = (cell: SalesHeatmapCellDto) =>
  cell.net_revenue === 0 && cell.sales_count === 0;

/** Text inside a cell: the metric, blank when there is nothing to show. */
const cellText = (cell: SalesHeatmapCellDto, metric: HeatmapMetric) =>
  isEmptyCell(cell) || (metric === "sales_count" && cell.sales_count === 0)
    ? ""
    : formatMetric(metric, cell[metric]);

const HeatmapGrid = ({
  heatmap,
  metric,
}: {
  heatmap: SalesHeatmapDto;
  metric: HeatmapMetric;
}) => {
  const theme = useTheme();
  const palette = {
    paper: theme.palette.background.paper,
    accent: theme.palette.primary.main,
  };
  const max = heatmapMax(heatmap, metric);

  return (
    <>
      <Box sx={{ overflowX: "auto" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `max-content repeat(${heatmap.hours.length}, minmax(52px, 1fr))`,
            gap: "3px",
            minWidth: "fit-content",
          }}
        >
          <Box />
          {heatmap.hours.map((hour) => (
            <Typography key={hour} variant="caption" color="text.secondary" align="center">
              {hour}h
            </Typography>
          ))}
          {heatmap.rows.map((row) => (
            <Fragment key={row.weekday}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", pr: 1 }}
              >
                {WEEKDAY_LABELS_FR[row.weekday].slice(0, 3)}
              </Typography>
              {row.cells.map((cell) => {
                const colors = heatmapCellColors(palette, cellIntensity(cell[metric], max));
                return (
                  <Tooltip
                    key={cell.hour}
                    arrow
                    title={`${heatmapCellLabel(row.weekday, cell.hour)} : ${formatCurrency(
                      cell.net_revenue,
                    )} · ${salesLabel(cell.sales_count)}`}
                  >
                    <Box
                      sx={{
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "divider",
                        bgcolor: colors.background,
                        color: colors.color,
                        typography: "caption",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cellText(cell, metric)}
                    </Box>
                  </Tooltip>
                );
              })}
            </Fragment>
          ))}
        </Box>
      </Box>
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1, mt: 2 }}
      >
        <Typography variant="caption" color="text.secondary">
          {formatMetric(metric, 0)}
        </Typography>
        <Box
          sx={{
            width: 120,
            height: 10,
            borderRadius: 1,
            border: 1,
            borderColor: "divider",
            background: `linear-gradient(to right, ${heatmapCellColors(palette, 0).background}, ${
              heatmapCellColors(palette, 1).background
            })`,
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {formatMetric(metric, max)}
        </Typography>
      </Box>
    </>
  );
};

/**
 * Weekday × hour heatmap of net revenue, or of the number of Sales. Hours in
 * Paris time, only those with at least one Sale. No comparison overlay.
 */
export const HeatmapSection = ({ filters }: SalesAnalyticsSectionProps) => {
  const query = useSalesAnalytics(
    salesHeatmapRoute,
    useMemo(() => heatmapFilters(filters), [filters]),
  );
  const [metric, setMetric] = useState<HeatmapMetric>("net_revenue");

  return (
    <AnalyticsSectionCard
      title="Ventes par jour et heure"
      icon={<GridOn />}
      query={query}
      isEmpty={(data) => data.current.hours.length === 0}
      actions={
        <ToggleButtonGroup
          exclusive
          size="small"
          value={metric}
          onChange={(_event, next: HeatmapMetric | null) => {
            if (next) setMetric(next);
          }}
          aria-label="Valeur affichée"
        >
          {METRICS.map(({ value, label }) => (
            <ToggleButton key={value} value={value}>
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      }
    >
      {(data) => (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Heures de Paris. Seules les heures avec au moins une vente sur la période sont
            affichées.
          </Typography>
          <HeatmapGrid heatmap={data.current} metric={metric} />
        </>
      )}
    </AnalyticsSectionCard>
  );
};
