import {
  ChevronLeft,
  ChevronRight
} from "@mui/icons-material";
import {
  Box,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from "@mui/material";


import { BarChart, PieChart } from "@mui/x-charts";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useMemo, useState } from "react";
import { getTranscationStats, type transactionsFilters } from "../../services/api/transactions";
import { formatCurrency } from "../../services/cartService";
import type { DashboardStoreDto } from "@recyclerie/api/responses/dashboard";

const ALL_STORES = "all" as const;
type ViewStoreFilter = DashboardStoreDto["id"] | typeof ALL_STORES;
type StatsView = "week" | "month" | "year" | "custom";
type CustomDateRange = {
  from: dayjs.Dayjs;
  to: dayjs.Dayjs;
};

const getStatsDateRange = (
  view: StatsView,
  offset: number,
  customRange?: CustomDateRange,
) => {
  if (view === "custom") {
    if (customRange) {
      return {
        date_from: customRange.from.startOf("day").format("YYYY-MM-DD"),
        date_to: customRange.to.endOf("day").format("YYYY-MM-DD"),
      };
    }
    view = "week";
  }

  const base = dayjs().add(offset, view);
  switch (view) {
    case "week":
      return {
        date_from: base.startOf("week").format("YYYY-MM-DD"),
        date_to: base.endOf("week").format("YYYY-MM-DD"),
      };
    case "month":
      return {
        date_from: base.startOf("month").format("YYYY-MM-DD"),
        date_to: base.endOf("month").format("YYYY-MM-DD"),
      };
    case "year":
      return {
        date_from: base.startOf("year").format("YYYY-MM-DD"),
        date_to: base.endOf("year").format("YYYY-MM-DD"),
      };
  }
};

const formatPeriodLabel = (
  view: StatsView,
  offset: number,
  customRange?: CustomDateRange,
) => {
  const { date_from, date_to } = getStatsDateRange(view, offset, customRange);
  const from = dayjs(date_from);
  const to = dayjs(date_to);
  const shortDate = (date: dayjs.Dayjs) =>
    date.toDate().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });

  switch (view) {
    case "week":
      return `${shortDate(from)} – ${shortDate(to)} ${to.year()}`;
    case "month":
      return from.toDate().toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      });
    case "year":
      return String(from.year());
    case "custom":
      return `${shortDate(from)} – ${shortDate(to)} ${to.year()}`;
  }
};
interface SalesChartsProps {
  stores: DashboardStoreDto[];
}
export const SalesCharts = ({ stores }: SalesChartsProps) => {
  const [view, setView] = useState<StatsView>("week");
  const [viewStore, setViewStore] = useState<ViewStoreFilter>(ALL_STORES);
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>({
    from: dayjs().subtract(1, "month"),
    to: dayjs(),
  });
  const [periodOffset, setPeriodOffset] = useState(0);

  const statsFilters = useMemo((): transactionsFilters => {
    const saleFilter: transactionsFilters = {};
    if (viewStore !== ALL_STORES) saleFilter.store_id = viewStore;
    const { date_from, date_to } = getStatsDateRange(
      view,
      periodOffset,
      customDateRange,
    );
    saleFilter.date_from = date_from;
    saleFilter.date_to = date_to;
    return saleFilter;
  }, [view, viewStore, periodOffset, customDateRange]);

  const salesStats = useQuery({
    queryKey: ["salesStats", statsFilters],
    queryFn: () =>
      getTranscationStats(statsFilters).then((response) => response.data.data),
  });

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: StatsView,
  ) => {
    if (newView !== null) {
      if (newView === "custom") {
        const { date_from, date_to } = getStatsDateRange(view, periodOffset);
        setCustomDateRange({
          from: dayjs(date_from),
          to: dayjs(date_to),
        });
      }
      setView(newView);
      setPeriodOffset(0);
    }
  };


  const handleViewStoreChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: ViewStoreFilter | null,
  ) => {
    if (newView !== null) {
      setViewStore(newView);
    }
  };
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 3,
          mb: 2,
        }}
      >
        <ToggleButtonGroup
          color="primary"
          size="small"
          value={view}
          exclusive
          onChange={handleViewChange}
        >
          <ToggleButton value="week">semaine</ToggleButton>
          <ToggleButton value="month">mois</ToggleButton>
          <ToggleButton value="year">année</ToggleButton>
          <ToggleButton value="custom">personnalisé</ToggleButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup
          color="primary"
          size="small"
          value={viewStore}
          exclusive
          onChange={handleViewStoreChange}
        >
          <ToggleButton value={ALL_STORES}>TOUT</ToggleButton>
          {stores.map((store) => (
            <ToggleButton value={store.id}>{store.name}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        {view === "custom" ? (
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <DatePicker
                label="Date de début"
                format="DD/MM/YYYY"
                value={customDateRange.from}
                onChange={(value) => {
                  if (!value) return;
                  setCustomDateRange((prev) => ({
                    from: value,
                    to: value.isAfter(prev.to) ? value : prev.to,
                  }));
                }}
                slotProps={{
                  textField: { size: "small", sx: { width: 170 } },
                }}
              />
              <Typography variant="body2" color="text.secondary">
                –
              </Typography>
              <DatePicker
                label="Date de fin"
                format="DD/MM/YYYY"
                value={customDateRange.to}
                onChange={(value) => {
                  if (!value) return;
                  setCustomDateRange((prev) => ({
                    from: value.isBefore(prev.from) ? value : prev.from,
                    to: value,
                  }));
                }}
                slotProps={{
                  textField: { size: "small", sx: { width: 170 } },
                }}
              />
              <Typography
                variant="body2"
                sx={{ minWidth: 180, textAlign: "center", fontWeight: 500 }}
              >
                {formatPeriodLabel(view, periodOffset, customDateRange)}
              </Typography>
            </Box>
          </LocalizationProvider>
        ) : (
          <>
            <Tooltip title="Période précédente">
              <IconButton
                size="small"
                onClick={() => setPeriodOffset((offset) => offset - 1)}
                aria-label="Période précédente"
              >
                <ChevronLeft />
              </IconButton>
            </Tooltip>
            <Typography
              variant="body2"
              sx={{ minWidth: 180, textAlign: "center", fontWeight: 500 }}
            >
              {formatPeriodLabel(view, periodOffset, customDateRange)}
            </Typography>
            <Tooltip title="Période suivante">
              <span>
                <IconButton
                  size="small"
                  onClick={() => setPeriodOffset((offset) => offset + 1)}
                  disabled={periodOffset >= 0}
                  aria-label="Période suivante"
                >
                  <ChevronRight />
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}
      </Box>
      {salesStats.isSuccess && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            gap: 2,
          }}
        >
          <Box sx={{ flex: "1 1 400px", minWidth: 0 }}>
            <BarChart
              height={350}
              series={[
                {
                  data:
                    salesStats.data?.by_day.map(
                      (cat) => cat.total_amount,
                    ) ?? [],
                  label: "Chiffre d'affaires",
                  id: "money",
                },
                {
                  data:
                    salesStats.data?.by_day.map(
                      (cat) => cat.transaction_count,
                    ) ?? [],
                  label: "nombre de transactions",
                  id: "quantity",
                },
              ]}
              xAxis={[
                {
                  data: salesStats.data?.by_day.map(
                    (cat) => cat.date,
                  ),
                  height: 28,
                },
              ]}
              yAxis={[{ width: 50 }]}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 0.5 }}
            >
              Quantité par catégorie
            </Typography>
            <PieChart
              series={[
                {
                  data:
                    salesStats.data?.by_category.map(
                      (cat, index) => ({
                        id: index,
                        label: cat.category_name ?? "",
                        value: cat.total_quantity,
                      }),
                    ) || [],
                },
              ]}
              width={200}
              height={200}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 0.5 }}
            >
              Montant par catégorie
            </Typography>
            <PieChart
              series={[
                {
                  data:
                    salesStats.data?.by_category.map(
                      (cat, index) => ({
                        id: index,
                        label: cat.category_name ?? "",
                        value: cat.total_price_sum,
                      }),
                    ) || [],
                  valueFormatter: (item) =>
                    `${item.label} ${formatCurrency(item.value as number)}`,
                },
              ]}
              width={200}
              height={200}
            />
          </Box>
        </Box>
      )}
    </Box>
  )
}