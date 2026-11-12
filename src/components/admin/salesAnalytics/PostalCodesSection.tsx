import type { SalesPostalCodesDto } from "@recyclerie/api/responses/salesAnalytics";
import { FileDownload, Place } from "@mui/icons-material";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { salesPostalCodesRoute } from "../../../services/api/salesAnalytics";
import { formatCurrency, formatPercentage } from "../../../services/cartService";
import { downloadCsv } from "../../../utils/csv";
import { AnalyticsSectionCard } from "./AnalyticsSectionCard";
import { COMPARE_LABELS } from "./filters";
import { formatCount } from "./format";
import { postalCodeShare, postalCodesCsv } from "./postalCodes";
import type { SalesAnalyticsSectionProps } from "./sections";
import { useSalesAnalytics } from "./useSalesAnalytics";


const ShareLine = ({
  current,
  comparison,
  vsLabel,
}: {
  current: SalesPostalCodesDto;
  comparison: SalesPostalCodesDto | null;
  vsLabel: string;
}) => {
  const share = postalCodeShare(current) ?? 0;
  const comparisonShare = comparison ? postalCodeShare(comparison) : null;
  return (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      <strong>{formatPercentage(share)}</strong> des ventes ont un code postal (
      {formatCount(current.sales_with_postal_code)} sur {formatCount(current.sales_count)})
      {comparisonShare != null && ` · ${vsLabel} : ${formatPercentage(comparisonShare)}`}
    </Typography>
  );
};

/** Top 10 postal codes by net revenue, and how many Sales have a postal code. */
export const PostalCodesSection = ({ filters }: SalesAnalyticsSectionProps) => {
  const postalCodes = useSalesAnalytics(salesPostalCodesRoute, filters);
  const current = postalCodes.data?.current;

  const exportCsv = () => {
    if (!current) return;
    downloadCsv(
      `codes-postaux-${filters.date_from}-${filters.date_to}.csv`,
      postalCodesCsv(current),
    );
  };

  return (
    <AnalyticsSectionCard
      title="Top 10 des codes postaux"
      icon={<Place />}
      query={postalCodes}
      isEmpty={(data) => data.current.sales_count === 0}
      actions={
        <Button
          variant="outlined"
          size="small"
          startIcon={<FileDownload />}
          disabled={!current?.postal_codes.length}
          onClick={exportCsv}
        >
          Exporter CSV
        </Button>
      }
    >
      {(data) => (
        <Box>
          <ShareLine
            current={data.current}
            comparison={data.comparison}
            vsLabel={COMPARE_LABELS[filters.compare].vs}
          />
          {data.current.postal_codes.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aucun code postal saisi sur la période.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code postal</TableCell>
                  <TableCell align="right">CA net</TableCell>
                  <TableCell align="right">Ventes</TableCell>
                  <TableCell align="right">Panier moyen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.current.postal_codes.map((row) => (
                  <TableRow key={row.postal_code}>
                    <TableCell sx={{ fontWeight: "bold" }}>{row.postal_code}</TableCell>
                    <TableCell align="right">{formatCurrency(row.net_revenue)}</TableCell>
                    <TableCell align="right">{formatCount(row.sales_count)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.average_basket)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      )}
    </AnalyticsSectionCard>
  );
};
