import { useState } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../utils/apiToastMessage";
import type { CashSession, TransactionModel } from "../../interfaces/Models";
import {
  getTransactions,
  type transactionsFilters,
} from "../../services/api/transactions";
import type { Filters } from "../forms/SaleHistoryFilter";
import { ExportCsvButton, type ExportScope } from "../ExportCsvButton";
import { downloadCsv, rowsToCsv, type CsvColumn } from "../../utils/csv";
import { fetchAllPages } from "../../utils/fetchAllPages";
import type { PaginationMeta } from "../../services/api/pagination";

const transactionCsvColumns: CsvColumn<TransactionModel>[] = [
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

const toPaginationMeta = (data: {
  pagination?: Partial<PaginationMeta>;
  transactions?: TransactionModel[];
}): PaginationMeta => {
  const perPage = data.pagination?.perPage ?? 50;
  const total = data.pagination?.total ?? data.transactions?.length ?? 0;
  const totalPages =
    data.pagination?.totalPages ?? Math.max(1, Math.ceil(total / perPage));
  const currentPage = data.pagination?.page ?? 1;

  return {
    page: currentPage,
    perPage,
    total,
    totalPages,
    hasNext: data.pagination?.hasNext ?? currentPage < totalPages,
    hasPrevious: data.pagination?.hasPrevious ?? currentPage > 1,
  };
};

type SalesHistoryExportProps = {
  activeSession: CashSession;
  filters: Filters;
};

export const SalesHistoryExport = ({
  activeSession,
  filters,
}: SalesHistoryExportProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const getBaseFilters = (scope: ExportScope, pageValue: number) => ({
    store_id: activeSession.CashRegister?.recyclery_id,
    include: ["refund", "items"] as transactionsFilters["include"],
    page: pageValue,
    ...(scope === "filtered"
      ? {
          ...filters,
          ...(filters.transactionType
            ? { type: filters.transactionType }
            : {}),
          ...(filters.transactionMethod
            ? { payment_method: filters.transactionMethod }
            : {}),
        }
      : {}),
  });

  const handleExportCsv = async (scope: ExportScope) => {
    if (!activeSession.CashRegister?.recyclery_id) {
      toast.warning("Caisse introuvable pour l'export.");
      return;
    }

    setIsExporting(true);
    try {
      const allTransactions = await fetchAllPages<
        TransactionModel,
        {
          data?: TransactionModel[];
          pagination?: Partial<PaginationMeta>;
        }
      >({
        fetchPage: async (pageValue) => {
          const response = await getTransactions(
            getBaseFilters(scope, pageValue),
          );
          return response.data;
        },
        getItems: (data) =>
          (data.data || []).filter(
            (transaction) =>
              transaction.CashSession?.cash_register_id ===
                activeSession.cash_register_id ||
              transaction.cash_session_id === activeSession.id,
          ),
        getPagination: toPaginationMeta,
      });

      const csv = rowsToCsv(allTransactions, transactionCsvColumns);
      const stamp = new Date().toISOString().slice(0, 10);
      const fileName =
        scope === "filtered"
          ? `sales-history-filtered-${stamp}.csv`
          : `sales-history-all-${stamp}.csv`;
      downloadCsv(fileName, csv);
      toast.success(`Export CSV prêt (${allTransactions.length} lignes).`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erreur lors de l'export CSV"));
    } finally {
      setIsExporting(false);
    }
  };

  return <ExportCsvButton onExport={handleExportCsv} loading={isExporting} />;
};

export default SalesHistoryExport;
