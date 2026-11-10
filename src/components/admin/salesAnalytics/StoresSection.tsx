import { FileDownload, Storefront } from "@mui/icons-material";
import type { SalesStoreDto } from "@recyclerie/api/responses/salesAnalytics";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { KeyboardEvent } from "react";
import { useMemo } from "react";
import { salesStoresRoute } from "../../../services/api/salesAnalytics";
import { formatCurrency, formatPercentage } from "../../../services/cartService";
import { downloadCsv } from "../../../utils/csv";
import { AnalyticsSectionCard } from "./AnalyticsSectionCard";
import { changeTone, formatChange } from "./change";
import { TONE_COLORS } from "./changeStyles";
import { COMPARE_LABELS } from "./filters";
import { formatCount } from "./format";
import type { SalesAnalyticsSectionProps } from "./sections";
import { storesCsv, toStoreRows, type StoreRow } from "./stores";
import { useSalesAnalytics } from "./useSalesAnalytics";


type StoreTableProps = {
  rows: StoreRow[];
  /** "vs N-1"; null hides the change column (`compare=none`). */
  changeLabel: string | null;
  onSelect: (storeId: StoreRow["store_id"]) => void;
};

const StoreTable = ({ rows, changeLabel, onSelect }: StoreTableProps) => {
  const onKeyDown = (row: StoreRow) => (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(row.store_id);
    }
  };
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Magasin</TableCell>
            <TableCell align="right">CA net</TableCell>
            <TableCell align="right">Ventes</TableCell>
            <TableCell align="right">Panier moyen</TableCell>
            <TableCell align="right">Part du CA net</TableCell>
            {changeLabel !== null && (
              <TableCell align="right">Évolution {changeLabel}</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            // The Store filter offers active Stores only.
            const selectable = row.is_active;
            return (
              <TableRow
                key={row.store_id}
                hover={selectable}
                {...(selectable && {
                  onClick: () => onSelect(row.store_id),
                  onKeyDown: onKeyDown(row),
                  tabIndex: 0,
                  title: `Voir ${row.name}`,
                  sx: { cursor: "pointer" },
                })}
              >
                <TableCell>
                  {row.name}
                  {!row.is_active && (
                    <Typography component="span" variant="caption" color="text.secondary">
                      {" "}
                      (fermé)
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">{formatCurrency(row.net_revenue)}</TableCell>
                <TableCell align="right">{formatCount(row.sales_count)}</TableCell>
                <TableCell align="right">{formatCurrency(row.average_basket)}</TableCell>
                <TableCell align="right">{formatPercentage(row.net_revenue_share)}</TableCell>
                {changeLabel !== null && (
                  <TableCell
                    align="right"
                    sx={{ color: TONE_COLORS[changeTone(row.change)], fontWeight: 500 }}
                  >
                    {row.change ? formatChange(row.change) : "—"}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

/** Nothing to show: no Store has a Sale or a Refund in the range. */
const nothingSold = (stores: SalesStoreDto[]) =>
  stores.every((s) => s.sales_count === 0 && s.refund_count === 0);

const StoreBreakdown = ({ filters, onFiltersChange }: SalesAnalyticsSectionProps) => {
  const stores = useSalesAnalytics(salesStoresRoute, filters);
  const rows = useMemo(() => (stores.data ? toStoreRows(stores.data) : []), [stores.data]);

  const exportCsv = () =>
    downloadCsv(`magasins-${filters.date_from}-${filters.date_to}.csv`, storesCsv(rows));

  return (
    <AnalyticsSectionCard
      title="Magasins"
      icon={<Storefront />}
      query={stores}
      isEmpty={(data) => nothingSold(data.current.stores)}
      actions={
        <Button
          variant="outlined"
          startIcon={<FileDownload />}
          disabled={nothingSold(rows)}
          onClick={exportCsv}
        >
          Exporter CSV
        </Button>
      }
    >
      {(data) => (
        <StoreTable
          rows={rows}
          changeLabel={data.comparison ? COMPARE_LABELS[filters.compare].vs : null}
          onSelect={(store_id) => onFiltersChange({ ...filters, store_id })}
        />
      )}
    </AnalyticsSectionCard>
  );
};

/**
 * Store breakdown, only with "Tous les magasins": one row per Store. Clicking
 * a row selects that Store in the page filters (and so hides this section).
 */
export const StoresSection = (props: SalesAnalyticsSectionProps) =>
  props.filters.store_id === "" ? <StoreBreakdown {...props} /> : null;
