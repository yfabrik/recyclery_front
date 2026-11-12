import type { TransactionModel } from "../interfaces/Models";
import {
  getTransactions,
  type transactionsFilters,
} from "../services/api/transactions";
import type { PaginationMeta } from "../services/api/pagination";
import { downloadCsv, rowsToCsv, type CsvColumn } from "./csv";
import { fetchAllPages } from "./fetchAllPages";

/** Columns of every sales transaction CSV (POS history and sales analytics). */
export const transactionCsvColumns: CsvColumn<TransactionModel>[] = [
  { header: "Transaction", key: "id" },
  {
    header: "Date",
    key: "createdAt",
    format: (value) =>
      value ? new Date(String(value)).toLocaleString("fr-FR") : "",
  },
  { header: "Type", key: "transactionType" },
  { header: "Paiement", key: "payment_method" },
  { header: "Total", key: "total_amount" },
  { header: "Montant payé", key: "payment_amount" },
  { header: "Statut", key: "status" },
  {
    header: "Caissier",
    key: "CashSession.User.username",
    format: (_value, row) => row.CashSession?.User?.username ?? "",
  },
];

/** The largest page `GET /sales-transactions` serves: fewer round trips on a long period. */
const EXPORT_PER_PAGE = 200;

type TransactionsPage = {
  data?: TransactionModel[];
  pagination?: Partial<PaginationMeta>;
};

const toPaginationMeta = (response: TransactionsPage): PaginationMeta => {
  const perPage = response.pagination?.perPage ?? EXPORT_PER_PAGE;
  const total = response.pagination?.total ?? response.data?.length ?? 0;
  const totalPages =
    response.pagination?.totalPages ?? Math.max(1, Math.ceil(total / perPage));
  const currentPage = response.pagination?.page ?? 1;

  return {
    page: currentPage,
    perPage,
    total,
    totalPages,
    hasNext: response.pagination?.hasNext ?? currentPage < totalPages,
    hasPrevious: response.pagination?.hasPrevious ?? currentPage > 1,
  };
};

const fetchTransactionsPage = (
  query: transactionsFilters,
): Promise<TransactionsPage> =>
  getTransactions(query).then((response) => response.data);

type FetchAllTransactionsOptions = {
  /** Client-side filter on each page, for what the API cannot filter (one cash register). */
  keep?: (transaction: TransactionModel) => boolean;
  /** One page of `GET /sales-transactions`. Defaults to the real endpoint. */
  fetchPage?: (query: transactionsFilters) => Promise<TransactionsPage>;
};

/** Every transaction matching `query`, from all pages of `GET /sales-transactions`. */
export const fetchAllTransactions = (
  query: transactionsFilters,
  {
    keep = () => true,
    fetchPage = fetchTransactionsPage,
  }: FetchAllTransactionsOptions = {},
): Promise<TransactionModel[]> =>
  fetchAllPages<TransactionModel, TransactionsPage>({
    fetchPage: (page) =>
      fetchPage({ ...query, page, perPage: EXPORT_PER_PAGE }),
    getItems: (response) => (response.data ?? []).filter(keep),
    getPagination: toPaginationMeta,
  });

export const downloadTransactionsCsv = (
  fileName: string,
  transactions: TransactionModel[],
): void =>
  downloadCsv(fileName, rowsToCsv(transactions, transactionCsvColumns));
