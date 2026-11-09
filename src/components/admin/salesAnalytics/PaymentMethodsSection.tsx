import type { SalesPaymentMethodsDto } from "@recyclerie/api/responses/salesAnalytics";
import { CreditCard, FileDownload } from "@mui/icons-material";
import { Box, Button, Divider, LinearProgress, Typography } from "@mui/material";
import { salesPaymentMethodsRoute } from "../../../services/api/salesAnalytics";
import {
  formatCurrency,
  formatPercentage,
  getPaymentMethodLabel,
} from "../../../services/cartService";
import { downloadCsv } from "../../../utils/csv";
import { AnalyticsSectionCard } from "./AnalyticsSectionCard";
import { paymentMethodsCsv, refundLine } from "./paymentMethods";
import type { SalesAnalyticsSectionProps } from "./sections";
import { useSalesAnalytics } from "./useSalesAnalytics";

const count = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const payments = (n: number) => `${count.format(n)} paiement${n > 1 ? "s" : ""}`;

const PaymentMethodList = ({ data }: { data: SalesPaymentMethodsDto }) => (
  <Box>
    {data.methods.map((method) => {
      const refund = refundLine(method);
      return (
        <Box key={method.method} sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <Typography variant="body2" fontWeight="medium">
              {getPaymentMethodLabel(method.method)}
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {formatCurrency(method.sales_amount)} · {formatPercentage(method.sales_share)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={method.sales_share * 100}
            sx={{ my: 0.5, height: 6, borderRadius: 3 }}
          />
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {payments(method.payment_count)}
            </Typography>
            {refund && (
              <Typography variant="caption" color="error.main">
                {refund}
              </Typography>
            )}
          </Box>
        </Box>
      );
    })}
    <Divider sx={{ mb: 1 }} />
    <Typography variant="body2" color="text.secondary">
      Encaissé sur les ventes : <strong>{formatCurrency(data.sales_amount)}</strong>
      {data.refunded_amount > 0 && ` · Remboursé : −${formatCurrency(data.refunded_amount)}`}
    </Typography>
  </Box>
);

/** Sales split by the amount each payment method collected, with what Refunds paid out through it. */
export const PaymentMethodsSection = ({ filters }: SalesAnalyticsSectionProps) => {
  const paymentMethods = useSalesAnalytics(salesPaymentMethodsRoute, filters);
  const current = paymentMethods.data?.current;

  const exportCsv = () => {
    if (!current) return;
    downloadCsv(
      `modes-de-paiement-${filters.date_from}-${filters.date_to}.csv`,
      paymentMethodsCsv(current),
    );
  };

  return (
    <AnalyticsSectionCard
      title="Modes de paiement"
      icon={<CreditCard />}
      query={paymentMethods}
      isEmpty={(data) => data.current.methods.length === 0}
      actions={
        <Button
          size="small"
          variant="outlined"
          startIcon={<FileDownload />}
          disabled={!current || current.methods.length === 0}
          onClick={exportCsv}
        >
          Exporter CSV
        </Button>
      }
    >
      {(data) => <PaymentMethodList data={data.current} />}
    </AnalyticsSectionCard>
  );
};
