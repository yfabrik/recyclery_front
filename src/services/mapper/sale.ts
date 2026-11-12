import type { transactionsFilters } from "../api/transactions";
import type {
  SaleHistoryFilterFormValues,
  SaleListFilterValues,
} from "../schema/sale";
import { omitBlank } from "../zodTransform";

/**
 * Admin sales analytics transaction list query (also used by its CSV export).
 * No `period`: `GET /sales-transactions` filters on the dates only.
 */
export const toSaleQuery = (f: SaleListFilterValues): transactionsFilters => ({
  date_from: f.date_from,
  date_to: f.date_to,
  ...omitBlank({
    store_id: f.store_id,
    transaction_number: f.transaction_number,
  }),
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
