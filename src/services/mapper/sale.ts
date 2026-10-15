import type { TransactionStatsFilterInput } from "@recyclerie/api/schemas/salesTransactions";
import type { transactionsFilters } from "../api/transactions";
import type {
  SaleFilterFormValues,
  SaleHistoryFilterFormValues,
} from "../schema/sale";
import { omitBlank } from "../zodTransform";

/**
 * Admin sales analytics list query.
 * `transaction_number` is deliberately not forwarded (it wasn't before the
 * form/query split either): the analytics form exposes the field but it has
 * never been sent to the API.
 */
export const toSaleQuery = (f: SaleFilterFormValues): transactionsFilters => ({
  period: f.period,
  date_from: f.date_from,
  date_to: f.date_to,
  ...omitBlank({ store_id: f.store_id }),
});

export const toSaleStatsQuery = (
  f: SaleFilterFormValues,
): TransactionStatsFilterInput => ({
  date_from: f.date_from,
  date_to: f.date_to,
  ...omitBlank({ store_id: f.store_id }),
});

/** POS history query. The store comes from the active cash session, not the form. */
export const toSaleHistoryQuery = (
  f: SaleHistoryFilterFormValues,
): transactionsFilters => ({
  date_from: f.date_from,
  date_to: f.date_to,
  ...omitBlank({
    transaction_number: f.transaction_number,
    type: f.transactionType,
    payment_method: f.transactionMethod,
  }),
});
