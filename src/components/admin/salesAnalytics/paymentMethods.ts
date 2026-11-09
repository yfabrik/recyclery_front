import type {
  SalesPaymentMethodDto,
  SalesPaymentMethodsDto,
} from "@recyclerie/api/responses/salesAnalytics";
import { formatCurrency, getPaymentMethodLabel } from "../../../services/cartService";
import { rowsToCsv, type CsvColumn } from "../../../utils/csv";

/** "dont remboursé en espèces : −10,50 €"; null when nothing was paid back through the method. */
export const refundLine = ({ method, refunded_amount }: SalesPaymentMethodDto) =>
  refunded_amount > 0
    ? `dont remboursé en ${getPaymentMethodLabel(method).toLocaleLowerCase("fr")} : −${formatCurrency(refunded_amount)}`
    : null;

type CsvRow = {
  label: string;
  sales_amount: number;
  sales_share: number;
  payment_count: number;
  refunded_amount: number;
};

/** 0.3333 → 33.3 */
const toPercent = (share: number) => Math.round(share * 1000) / 10;

const COLUMNS: CsvColumn<CsvRow>[] = [
  { header: "Mode de paiement", key: "label" },
  { header: "Encaissé sur les ventes (€)", key: "sales_amount" },
  { header: "Part des ventes (%)", key: "sales_share", format: (_, row) => toPercent(row.sales_share) },
  { header: "Nombre de paiements", key: "payment_count" },
  { header: "Remboursé (€)", key: "refunded_amount" },
];

/** The section's table as CSV: one row per method, then the totals. */
export const paymentMethodsCsv = (data: SalesPaymentMethodsDto) =>
  rowsToCsv<CsvRow>(
    [
      ...data.methods.map((m) => ({ ...m, label: getPaymentMethodLabel(m.method) })),
      {
        label: "Total",
        sales_amount: data.sales_amount,
        sales_share: data.sales_amount > 0 ? 1 : 0,
        payment_count: data.methods.reduce((sum, m) => sum + m.payment_count, 0),
        refunded_amount: data.refunded_amount,
      },
    ],
    COLUMNS,
  );
