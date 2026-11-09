import { ChevronLeft, ChevronRight, Refresh } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  SALES_ANALYTICS_COMPARE_MODES,
  SALES_ANALYTICS_PERIODS,
} from "@recyclerie/api/schemas/salesAnalytics";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import dayjs, { type Dayjs } from "dayjs";
import { useTouchLayout } from "../../../contexts/TouchLayoutContext";
import type { StoreModel } from "../../../interfaces/Models";
import { COMPARE_LABELS, todayIsoDate, type SalesAnalyticsFilters } from "./filters";
import {
  canStepForward,
  PERIOD_LABELS,
  periodLabel,
  rangeLabel,
  selectPeriod,
  stepPeriod,
} from "./period";
import { isSalesAnalyticsPageQuery, refreshSalesAnalytics } from "./queryKeys";

type SalesAnalyticsFilterBarProps = {
  filters: SalesAnalyticsFilters;
  onChange: (next: SalesAnalyticsFilters) => void;
  stores: StoreModel[];
};

const toDate = (value: Dayjs) => value.format("YYYY-MM-DD");

/** Sticky bar: period with ← →, Store, comparison and refresh. */
export const SalesAnalyticsFilterBar = ({
  filters,
  onChange,
  stores,
}: SalesAnalyticsFilterBarProps) => {
  const today = todayIsoDate();
  const { isTouchLayout } = useTouchLayout();
  const queryClient = useQueryClient();
  const isFetching = useIsFetching({ predicate: isSalesAnalyticsPageQuery }) > 0;

  const step = (direction: -1 | 1) =>
    onChange({ ...filters, ...stepPeriod(filters, direction, today) });

  const setDates = (date_from: string, date_to: string) =>
    onChange({
      ...filters,
      date_from: date_from <= date_to ? date_from : date_to,
      date_to: date_from <= date_to ? date_to : date_from,
    });

  return (
    <Paper
      elevation={2}
      sx={{
        position: "sticky",
        // Under the fixed AppBar (taller in the touch layout).
        top: isTouchLayout ? 72 : { xs: 56, sm: 64 },
        zIndex: (theme) => theme.zIndex.appBar - 1,
        p: 2,
        mb: 3,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 2,
      }}
    >
      <ToggleButtonGroup
        exclusive
        size="small"
        color="primary"
        value={filters.period}
        onChange={(_event, period: SalesAnalyticsFilters["period"] | null) => {
          if (period) onChange({ ...filters, ...selectPeriod(filters, period, today) });
        }}
      >
        {SALES_ANALYTICS_PERIODS.map((period) => (
          <ToggleButton key={period} value={period}>
            {PERIOD_LABELS[period]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Tooltip title="Période précédente">
          <IconButton aria-label="Période précédente" onClick={() => step(-1)}>
            <ChevronLeft />
          </IconButton>
        </Tooltip>
        {filters.period === "custom" ? (
          <>
            <DatePicker
              label="Du"
              format="DD/MM/YYYY"
              value={dayjs(filters.date_from)}
              maxDate={dayjs(today)}
              onChange={(value) => value?.isValid() && setDates(toDate(value), filters.date_to)}
              slotProps={{ textField: { size: "small", sx: { width: 160 } } }}
            />
            <DatePicker
              label="Au"
              format="DD/MM/YYYY"
              value={dayjs(filters.date_to)}
              maxDate={dayjs(today)}
              onChange={(value) => value?.isValid() && setDates(filters.date_from, toDate(value))}
              slotProps={{ textField: { size: "small", sx: { width: 160 } } }}
            />
          </>
        ) : (
          <Box sx={{ minWidth: 170, textAlign: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {periodLabel(filters)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {rangeLabel(filters)}
            </Typography>
          </Box>
        )}
        {/* A disabled button fires no events, so the Tooltip needs a wrapper. */}
        <Tooltip title="Période suivante">
          <span>
            <IconButton
              aria-label="Période suivante"
              disabled={!canStepForward(filters, today)}
              onClick={() => step(1)}
            >
              <ChevronRight />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <TextField
        select
        size="small"
        label="Magasin"
        value={filters.store_id}
        onChange={(event) =>
          onChange({
            ...filters,
            store_id: event.target.value === "" ? "" : Number(event.target.value),
          })
        }
        slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
        sx={{ minWidth: 200 }}
      >
        <MenuItem value="">Tous les magasins</MenuItem>
        {stores.map((store) => (
          <MenuItem key={store.id} value={store.id}>
            {store.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label="Comparer avec"
        value={filters.compare}
        onChange={(event) => {
          const compare = SALES_ANALYTICS_COMPARE_MODES.find(
            (mode) => mode === event.target.value,
          );
          if (compare) onChange({ ...filters, compare });
        }}
        sx={{ minWidth: 200 }}
      >
        {SALES_ANALYTICS_COMPARE_MODES.map((mode) => (
          <MenuItem key={mode} value={mode}>
            {COMPARE_LABELS[mode].option}
          </MenuItem>
        ))}
      </TextField>

      <Button
        variant="contained"
        startIcon={<Refresh />}
        loading={isFetching}
        onClick={() => void refreshSalesAnalytics(queryClient)}
        sx={{ ml: "auto", minWidth: 140 }}
      >
        Actualiser
      </Button>
    </Paper>
  );
};
