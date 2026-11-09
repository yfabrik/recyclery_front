import { CardGiftcard, FileDownload } from "@mui/icons-material";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { giftCardAnalyticsRoute } from "../../../services/api/salesAnalytics";
import { formatCurrency } from "../../../services/cartService";
import { downloadCsv } from "../../../utils/csv";
import { AnalyticsSectionCard } from "./AnalyticsSectionCard";
import { computeChange, formatChange } from "./change";
import { COMPARE_LABELS } from "./filters";
import { giftCardRows, giftCardsCsv, hasNoGiftCards, type GiftCardRow } from "./giftCards";
import type { SalesAnalyticsSectionProps } from "./sections";
import { useSalesAnalytics } from "./useSalesAnalytics";

const count = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const countLabel = ({ count: n, unit: [one, many] }: GiftCardRow) =>
  `${count.format(n)} ${n > 1 ? many : one}`;

/**
 * Gift cards issued in the period by origin, used, expired, and the balance
 * left at the end of the period. With a Store selected, the lines that cannot
 * be traced to a Store stay network-wide and say so.
 */
export const GiftCardsSection = ({ filters }: SalesAnalyticsSectionProps) => {
  const giftCards = useSalesAnalytics(giftCardAnalyticsRoute, filters);
  const storeSelected = filters.store_id !== "";
  const hasComparison = Boolean(giftCards.data?.comparison);

  const exportCsv = () => {
    if (!giftCards.data) return;
    const rows = giftCardRows(giftCards.data, { storeSelected });
    downloadCsv(
      `cartes-cadeaux-${filters.date_from}-${filters.date_to}.csv`,
      giftCardsCsv(rows, { comparison: hasComparison }),
    );
  };

  return (
    <AnalyticsSectionCard
      title="Cartes cadeaux"
      icon={<CardGiftcard />}
      query={giftCards}
      isEmpty={(data) => hasNoGiftCards(data.current)}
      emptyMessage="Aucune carte cadeau sur la période sélectionnée."
      actions={
        <Button
          variant="outlined"
          size="small"
          startIcon={<FileDownload />}
          disabled={!giftCards.data}
          onClick={exportCsv}
        >
          Exporter CSV
        </Button>
      }
    >
      {(data) => (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell align="right">Nombre</TableCell>
              <TableCell align="right">Montant</TableCell>
              {hasComparison && (
                <TableCell align="right">{COMPARE_LABELS[filters.compare].vs}</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {giftCardRows(data, { storeSelected }).map((row) => {
              const change = computeChange(row.amount, row.comparisonAmount);
              return (
                <TableRow key={row.key}>
                  <TableCell sx={row.isOrigin ? { pl: 4 } : { fontWeight: 500 }}>
                    {row.label}
                    {row.scope && (
                      <Typography component="span" variant="caption" color="text.secondary">
                        {" "}
                        ({row.scope})
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">{countLabel(row)}</TableCell>
                  <TableCell align="right" sx={row.isOrigin ? {} : { fontWeight: 500 }}>
                    {formatCurrency(row.amount)}
                  </TableCell>
                  {hasComparison && (
                    <TableCell align="right" sx={{ color: "text.secondary" }}>
                      {change ? formatChange(change) : "—"}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </AnalyticsSectionCard>
  );
};
