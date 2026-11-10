import type { SalesCategoryRefDto } from "@recyclerie/api/responses/salesAnalytics";
import {
  ArrowBack,
  BarChart as BarChartIcon,
  Category,
  ChevronRight,
  FileDownload,
  TableRows,
} from "@mui/icons-material";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { BarChart } from "@mui/x-charts/BarChart";
import { useDrawingArea, useXScale, useYScale } from "@mui/x-charts/hooks";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo, useState, type KeyboardEvent } from "react";
import { salesCategoriesRoute } from "../../../services/api/salesAnalytics";
import { formatCurrency, formatPercentage } from "../../../services/cartService";
import { downloadCsv } from "../../../utils/csv";
import { AnalyticsQueryState } from "./AnalyticsSectionCard";
import {
  barLabelPlacement,
  categoriesCsv,
  categoryBars,
  categoryRows,
  fitBarLabel,
  sortCategoryRows,
  TOP_CATEGORIES,
  type CategoryBar,
  type CategoryMetric,
  type CategoryRow,
} from "./categories";
import { changeTone, computeChange, formatChange } from "./change";
import { COMPARE_LABELS, toSalesAnalyticsQuery } from "./filters";
import { salesAnalyticsQueryKey } from "./queryKeys";
import type { SalesAnalyticsSectionProps } from "./sections";

const count = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const items = (n: number) => `${count.format(n)} objet${Math.abs(n) > 1 ? "s" : ""}`;

const METRIC_LABELS: Record<CategoryMetric, string> = {
  net_revenue: "CA net",
  quantity: "Quantité",
};
const formatMetric = (metric: CategoryMetric, value: number) =>
  metric === "net_revenue" ? formatCurrency(value) : items(value);

/** What follows a bar's name on its label, the one to drop last first. */
const barFigures = (bar: CategoryBar, metric: CategoryMetric) => [
  ` · ${formatMetric(metric, bar.value)}`,
  ` · ${formatPercentage(bar.share)}`,
];

/** Height of one bar and the gap below it. */
const BAR_STEP = 36;
/** Share of `BAR_STEP` left between two bars. */
const BAR_GAP_RATIO = 0.25;

let measureContext: CanvasRenderingContext2D | null | undefined;

/** Width in px of `text` drawn in `font` (a CSS font shorthand in px), letter spacing included. */
const textWidth = (text: string, font: string, fontSizePx: number, letterSpacingPx: number) => {
  measureContext ??= document.createElement("canvas").getContext("2d");
  if (!measureContext) return text.length * (fontSizePx * 0.6 + letterSpacingPx);
  measureContext.font = font;
  return measureContext.measureText(text).width + text.length * letterSpacingPx;
};

/** A typography length ("0.875rem", "0.01071em", "14px", 14) in px. */
const toPx = (
  length: string | number | undefined,
  { rem, em }: { rem: number; em: number },
) => {
  if (typeof length === "number") return length;
  const value = Number.parseFloat(length ?? "");
  if (Number.isNaN(value)) return 0;
  if (length?.endsWith("rem")) return value * rem;
  if (length?.endsWith("em")) return value * em;
  return value;
};

/**
 * Each bar's label (name, amount, %), written on the bar from its start in
 * a colour that reads on the bar, or just after the bar's end when the bar is
 * too short for it. On a narrow chart, a label that fits on neither side
 * goes where there is more room, its name shortened. Drawn as a chart child,
 * over the bar plot.
 */
const CategoryBarLabels = ({
  bars,
  metric,
  colorOf,
}: {
  bars: CategoryBar[];
  metric: CategoryMetric;
  colorOf: (bar: CategoryBar) => string;
}) => {
  const theme = useTheme();
  const xScale = useXScale<"linear">();
  const yScale = useYScale<"band">();
  const area = useDrawingArea();
  const { fontFamily, fontWeight, fontSize, letterSpacing } = theme.typography.body2;
  const { htmlFontSize } = theme.typography;
  const fontSizePx = toPx(fontSize, { rem: htmlFontSize, em: htmlFontSize }) || htmlFontSize;
  const letterSpacingPx = toPx(letterSpacing, { rem: htmlFontSize, em: fontSizePx });
  const font = `${fontWeight ?? 400} ${fontSizePx}px ${fontFamily ?? "sans-serif"}`;
  const widthOf = (text: string) => textWidth(text, font, fontSizePx, letterSpacingPx);
  return (
    <g style={{ pointerEvents: "none" }}>
      {bars.map((bar) => {
        const top = yScale(bar.key);
        if (top === undefined) return null;
        const zero = xScale(0);
        const end = xScale(bar.value);
        const figures = barFigures(bar, metric);
        const { x, inside, room } = barLabelPlacement(
          { start: Math.min(zero, end), end: Math.max(zero, end) },
          widthOf(`${bar.name}${figures.join("")}`),
          area.left + area.width,
        );
        return (
          <text
            key={bar.key}
            x={x}
            y={top + yScale.bandwidth() / 2}
            dominantBaseline="central"
            style={{
              font,
              letterSpacing: letterSpacingPx,
              fill: inside
                ? theme.palette.getContrastText(colorOf(bar))
                : theme.palette.text.primary,
            }}
          >
            {fitBarLabel(bar.name, figures, room, widthOf)}
          </text>
        );
      })}
    </g>
  );
};

type CategoryChartProps = {
  bars: CategoryBar[];
  metric: CategoryMetric;
  onBarClick: (bar: CategoryBar) => void;
};

const CategoryChart = ({ bars, metric, onBarClick }: CategoryChartProps) => {
  const theme = useTheme();
  const names = new Map(bars.map((bar) => [bar.key, bar.name]));
  const categoryColor = theme.palette.primary.main;
  const othersColor = theme.palette.grey[400];
  const colorOf = (bar: CategoryBar) => (bar.row ? categoryColor : othersColor);
  return (
    <BarChart
      layout="horizontal"
      height={bars.length * BAR_STEP}
      margin={{ top: 0, right: 8, bottom: 0, left: 8 }}
      hideLegend
      borderRadius={4}
      series={[
        {
          id: "categories",
          data: bars.map((bar) => bar.value),
          valueFormatter: (value) => (value == null ? null : formatMetric(metric, value)),
        },
      ]}
      yAxis={[
        {
          scaleType: "band",
          data: bars.map((bar) => bar.key),
          valueFormatter: (key: string) => names.get(key) ?? key,
          position: "none",
          categoryGapRatio: BAR_GAP_RATIO,
          colorMap: {
            type: "ordinal",
            values: ["others"],
            colors: [othersColor],
            unknownColor: categoryColor,
          },
        },
      ]}
      xAxis={[{ position: "none" }]}
      onItemClick={(_event, item) => {
        const bar = bars[item.dataIndex];
        if (bar) onBarClick(bar);
      }}
    >
      <CategoryBarLabels bars={bars} metric={metric} colorOf={colorOf} />
    </BarChart>
  );
};

const TONE_COLORS = {
  success: "success.main",
  error: "error.main",
  neutral: "text.secondary",
} as const;

const ChangeCell = ({ row, metric }: { row: CategoryRow; metric: CategoryMetric }) => {
  const change = computeChange(row.current[metric], row.comparison?.[metric]);
  return (
    <TableCell align="right">
      <Typography variant="body2" sx={{ color: TONE_COLORS[changeTone(change)], fontWeight: 500 }}>
        {change ? formatChange(change) : "—"}
      </Typography>
      {row.comparison && (
        <Typography variant="caption" color="text.secondary">
          {formatMetric(metric, row.comparison[metric])}
        </Typography>
      )}
    </TableCell>
  );
};

type CategoryTableProps = {
  rows: CategoryRow[];
  changeLabel: string | null;
  onOpen: (row: CategoryRow) => void;
};

const CategoryTable = ({ rows, changeLabel, onOpen }: CategoryTableProps) => {
  const openOnKey = (row: CategoryRow) => (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(row);
    }
  };
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Catégorie</TableCell>
            <TableCell align="right">CA net</TableCell>
            {changeLabel && <TableCell align="right">Évol. CA {changeLabel}</TableCell>}
            <TableCell align="right">Quantité</TableCell>
            {changeLabel && <TableCell align="right">Évol. qté {changeLabel}</TableCell>}
            <TableCell align="right">% du CA</TableCell>
            <TableCell align="right">Prix moyen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const opens = row.has_subcategories;
            return (
              <TableRow
                key={row.key}
                hover={opens}
                {...(opens
                  ? {
                      onClick: () => onOpen(row),
                      onKeyDown: openOnKey(row),
                      tabIndex: 0,
                      role: "button",
                      sx: { cursor: "pointer" },
                    }
                  : {})}
              >
                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      color: row.inCurrent ? "text.primary" : "text.secondary",
                    }}
                  >
                    {row.name}
                    {opens && <ChevronRight fontSize="small" color="action" />}
                  </Box>
                </TableCell>
                <TableCell align="right">{formatCurrency(row.current.net_revenue)}</TableCell>
                {changeLabel && <ChangeCell row={row} metric="net_revenue" />}
                <TableCell align="right">{count.format(row.current.quantity)}</TableCell>
                {changeLabel && <ChangeCell row={row} metric="quantity" />}
                <TableCell align="right">{formatPercentage(row.current.share)}</TableCell>
                <TableCell align="right">{formatCurrency(row.current.average_price)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

type View = "chart" | "table";

/**
 * Net revenue by top-level category: top 10 bars then "Autres", or a table of
 * every category with the change vs comparison. A category opens on its
 * subcategories.
 */
export const CategoriesSection = ({ filters }: SalesAnalyticsSectionProps) => {
  /** The opened categories, top level first; empty at the top level. */
  const [path, setPath] = useState<SalesCategoryRefDto[]>([]);
  const [metric, setMetric] = useState<CategoryMetric>("net_revenue");
  const [view, setView] = useState<View>("chart");
  const [showAll, setShowAll] = useState(false);

  const parentId = path.at(-1)?.id;
  const query = useMemo(
    () => ({
      ...toSalesAnalyticsQuery(filters),
      ...(parentId ? { parent_id: parentId } : {}),
    }),
    [filters, parentId],
  );
  const categories = useQuery({
    queryKey: salesAnalyticsQueryKey(salesCategoriesRoute.key, query),
    queryFn: () => salesCategoriesRoute.fetch(query),
    placeholderData: keepPreviousData,
  });

  const rows = useMemo(
    () =>
      categories.data
        ? sortCategoryRows(
            categoryRows(categories.data.current, categories.data.comparison),
            metric,
          )
        : [],
    [categories.data, metric],
  );
  const changeLabel = categories.data?.comparison
    ? COMPARE_LABELS[filters.compare].vs
    : null;

  const goTo = (next: SalesCategoryRefDto[]) => {
    setPath(next);
    setShowAll(false);
  };
  const open = (row: CategoryRow) => {
    if (row.has_subcategories && row.category_id != null)
      goTo([...path, { id: row.category_id, name: row.name }]);
  };
  const onBarClick = (bar: CategoryBar) => {
    if (bar.row) open(bar.row);
    else setShowAll(true);
  };
  const exportCsv = () => {
    const level = path.length > 0 ? `-${path.map((c) => c.name).join("-")}` : "";
    downloadCsv(
      `categories${level}-${filters.date_from}-${filters.date_to}.csv`,
      categoriesCsv(rows),
    );
  };

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Category /> Catégories
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={metric}
              onChange={(_event, next: CategoryMetric | null) => next && setMetric(next)}
              aria-label="Trier par"
            >
              {(Object.keys(METRIC_LABELS) as CategoryMetric[]).map((m) => (
                <ToggleButton key={m} value={m}>
                  {METRIC_LABELS[m]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={view}
              onChange={(_event, next: View | null) => next && setView(next)}
              aria-label="Affichage"
            >
              <ToggleButton value="chart" aria-label="Graphique">
                <BarChartIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="table" aria-label="Tableau">
                <TableRows fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownload />}
              disabled={rows.length === 0}
              onClick={exportCsv}
            >
              Exporter CSV
            </Button>
          </Box>
        </Box>

        {path.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Button size="small" startIcon={<ArrowBack />} onClick={() => goTo(path.slice(0, -1))}>
              Retour
            </Button>
            <Breadcrumbs>
              <Link component="button" type="button" underline="hover" onClick={() => goTo([])}>
                Toutes les catégories
              </Link>
              {path.map((category, index) =>
                index === path.length - 1 ? (
                  <Typography key={category.id} color="text.primary">
                    {category.name}
                  </Typography>
                ) : (
                  <Link
                    key={category.id}
                    component="button"
                    type="button"
                    underline="hover"
                    onClick={() => goTo(path.slice(0, index + 1))}
                  >
                    {category.name}
                  </Link>
                ),
              )}
            </Breadcrumbs>
          </Box>
        )}

        <AnalyticsQueryState
          query={categories}
          isEmpty={(data) => data.current.categories.length === 0}
        >
          {() => {
            if (view === "table")
              return <CategoryTable rows={rows} changeLabel={changeLabel} onOpen={open} />;
            const bars = categoryBars(rows, metric, { showAll });
            const grouped = bars.some((bar) => bar.row === null);
            const opensAny = bars.some((bar) => bar.row?.has_subcategories);
            return (
              <>
                <CategoryChart bars={bars} metric={metric} onBarClick={onBarClick} />
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
                  {(opensAny || grouped) && (
                    <Typography variant="caption" color="text.secondary">
                      {opensAny && "Cliquez sur une catégorie pour voir ses sous-catégories. "}
                      {grouped && "Cliquez sur « Autres » pour voir toutes les catégories."}
                    </Typography>
                  )}
                  {showAll && bars.length > TOP_CATEGORIES && (
                    <Button size="small" onClick={() => setShowAll(false)}>
                      Afficher le top {TOP_CATEGORIES}
                    </Button>
                  )}
                </Box>
              </>
            );
          }}
        </AnalyticsQueryState>
      </CardContent>
    </Card>
  );
};
