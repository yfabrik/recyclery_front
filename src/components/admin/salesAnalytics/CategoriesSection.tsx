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
import { useXScale, useYScale } from "@mui/x-charts/hooks";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo, useState, type KeyboardEvent } from "react";
import { salesCategoriesRoute } from "../../../services/api/salesAnalytics";
import { formatCurrency, formatPercentage } from "../../../services/cartService";
import { downloadCsv } from "../../../utils/csv";
import { AnalyticsQueryState } from "./AnalyticsSectionCard";
import {
  categoriesCsv,
  categoryBars,
  categoryRows,
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

const barLabel = (bar: CategoryBar, metric: CategoryMetric) =>
  `${bar.name} · ${formatMetric(metric, bar.value)} · ${formatPercentage(bar.share)}`;

/** Height of one bar and the label above it. */
const BAR_STEP = 48;
/** Room above the first bar for its label. */
const TOP_MARGIN = 20;

/**
 * Each bar's label, written above the bar from its start so a long name is
 * never cut. Drawn as a chart child: the bar plot itself is clipped to the
 * drawing area, which would cut the first label.
 */
const CategoryBarLabels = ({ bars, metric }: { bars: CategoryBar[]; metric: CategoryMetric }) => {
  const theme = useTheme();
  const xScale = useXScale<"linear">();
  const yScale = useYScale<"band">();
  return (
    <g>
      {bars.map((bar) => {
        const top = yScale(bar.key);
        if (top === undefined) return null;
        return (
          <text
            key={bar.key}
            x={xScale(Math.min(0, bar.value)) + 2}
            y={top - 6}
            style={{
              ...theme.typography.body2,
              fill: theme.palette.text.primary,
              pointerEvents: "none",
            }}
          >
            {barLabel(bar, metric)}
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
  return (
    <BarChart
      layout="horizontal"
      height={bars.length * BAR_STEP + TOP_MARGIN}
      margin={{ top: TOP_MARGIN, right: 8, bottom: 0, left: 8 }}
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
          categoryGapRatio: 0.5,
          colorMap: {
            type: "ordinal",
            values: ["others"],
            colors: [theme.palette.grey[400]],
            unknownColor: theme.palette.primary.main,
          },
        },
      ]}
      xAxis={[{ position: "none" }]}
      onItemClick={(_event, item) => {
        const bar = bars[item.dataIndex];
        if (bar) onBarClick(bar);
      }}
    >
      <CategoryBarLabels bars={bars} metric={metric} />
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
