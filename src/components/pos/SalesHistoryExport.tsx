import { toast } from "react-toastify";
import type { CashSession } from "../../interfaces/Models";
import type { transactionsFilters } from "../../services/api/transactions";
import { toSaleHistoryQuery } from "../../services/mapper/sale";
import type { SaleHistoryFilterFormValues as Filters } from "../../services/schema/sale";
import { ExportCsvButton, type ExportScope } from "../ExportCsvButton";
import { useTransactionsCsvExport } from "../../hooks/useTransactionsCsvExport";

type SalesHistoryExportProps = {
  activeSession: CashSession;
  filters: Filters;
};

export const SalesHistoryExport = ({
  activeSession,
  filters,
}: SalesHistoryExportProps) => {
  const { exportCsv, isExporting } = useTransactionsCsvExport();

  const handleExportCsv = async (scope: ExportScope) => {
    const storeId = activeSession.CashRegister?.recyclery_id;
    if (!storeId) {
      toast.warning("Caisse introuvable pour l'export.");
      return;
    }

    const query: transactionsFilters = {
      store_id: storeId,
      include: ["refund", "items"],
      ...(scope === "filtered" ? toSaleHistoryQuery(filters) : {}),
    };
    const stamp = new Date().toISOString().slice(0, 10);

    await exportCsv({
      query,
      fileName:
        scope === "filtered"
          ? `sales-history-filtered-${stamp}.csv`
          : `sales-history-all-${stamp}.csv`,
      keep: (transaction) =>
        transaction.CashSession?.cash_register_id ===
          activeSession.cash_register_id ||
        transaction.cash_session_id === activeSession.id,
    });
  };

  return <ExportCsvButton onExport={handleExportCsv} loading={isExporting} />;
};

export default SalesHistoryExport;
