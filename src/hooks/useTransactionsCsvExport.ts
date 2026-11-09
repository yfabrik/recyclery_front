import { useState } from "react";
import { toast } from "react-toastify";
import type { TransactionModel } from "../interfaces/Models";
import type { transactionsFilters } from "../services/api/transactions";
import { getApiErrorMessage } from "../utils/apiToastMessage";
import {
  downloadTransactionsCsv,
  fetchAllTransactions,
} from "../utils/transactionsCsv";

type TransactionsCsvExport = {
  /** `GET /sales-transactions` filters; every page is fetched. */
  query: transactionsFilters;
  fileName: string;
  /** Client-side filter on the fetched rows, for what the API cannot filter. */
  keep?: (transaction: TransactionModel) => boolean;
};

/** Downloads every transaction matching a query as CSV, with progress and toasts. */
export const useTransactionsCsvExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportCsv = async ({
    query,
    fileName,
    keep,
  }: TransactionsCsvExport) => {
    setIsExporting(true);
    try {
      const transactions = await fetchAllTransactions(query, { keep });
      downloadTransactionsCsv(fileName, transactions);
      toast.success(`Export CSV prêt (${transactions.length} lignes).`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erreur lors de l'export CSV"));
    } finally {
      setIsExporting(false);
    }
  };

  return { exportCsv, isExporting };
};
