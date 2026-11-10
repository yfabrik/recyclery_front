import { useTheme } from "@mui/material";
import {
  BarPlot,
  ChartDataProvider,
  ChartsAxisHighlight,
  ChartsGrid,
  ChartsLegend,
  ChartsSurface,
  ChartsTooltip,
  ChartsWrapper,
  ChartsXAxis,
  ChartsYAxis,
  LinePlot,
  MarkPlot,
} from "@mui/x-charts";
import { formatCurrency } from "../../../services/cartService";
import type { TimelinePoint } from "./timeline";
import { countLabel } from "./format";

type TimelineChartProps = {
  points: TimelinePoint[];
  /** Legend of the comparison line; no line when null. */
  comparisonLabel: string | null;
};

const euroTick = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/**
 * Net revenue as bars, the comparison as a line, on one euro axis. The number
 * of Sales is only in the tooltip, so euros and counts never share an axis.
 */
export const TimelineChart = ({ points, comparisonLabel }: TimelineChartProps) => {
  const { palette } = useTheme();
  const at = (dataIndex: number) => points[dataIndex];

  return (
    <ChartDataProvider
      height={320}
      series={[
        {
          type: "bar",
          id: "net",
          label: "CA net",
          color: palette.primary.main,
          data: points.map((p) => p.net),
          valueFormatter: (value, { dataIndex }) => {
            const point = at(dataIndex);
            return point ? `${formatCurrency(value ?? 0)} · ${countLabel(point.salesCount, "vente")}` : null;
          },
        },
        ...(comparisonLabel === null
          ? []
          : [
              {
                type: "line" as const,
                id: "comparison",
                label: comparisonLabel,
                color: palette.secondary.main,
                data: points.map((p) => p.comparison?.net ?? null),
                showMark: points.length <= 31,
                valueFormatter: (_value: number | null, { dataIndex }: { dataIndex: number }) => {
                  const other = at(dataIndex)?.comparison;
                  return other
                    ? `${formatCurrency(other.net)} · ${countLabel(other.salesCount, "vente")} (${other.title})`
                    : "—";
                },
              },
            ]),
      ]}
      xAxis={[
        {
          id: "x",
          scaleType: "band",
          // Positions, not labels: two days can share a label ("lun. 3" in Feb and Mar).
          data: points.map((_, index) => index),
          valueFormatter: (index: number, context) => {
            const point = at(index);
            if (!point) return "";
            return context.location === "tick" ? point.label : point.title;
          },
        },
      ]}
      yAxis={[{ id: "eur", width: 72, valueFormatter: (value: number) => euroTick.format(value) }]}
    >
      <ChartsWrapper>
        <ChartsLegend />
        <ChartsSurface>
          <ChartsGrid horizontal />
          <BarPlot />
          <LinePlot />
          <MarkPlot />
          <ChartsAxisHighlight x="band" />
          <ChartsXAxis axisId="x" />
          <ChartsYAxis axisId="eur" />
        </ChartsSurface>
        <ChartsTooltip trigger="axis" />
      </ChartsWrapper>
    </ChartDataProvider>
  );
};
