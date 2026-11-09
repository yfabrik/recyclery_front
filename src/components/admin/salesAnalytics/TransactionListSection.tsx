import { Clear, Description, FileDownload } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { TransactionModel } from "../../../interfaces/Models";
import { fetchCategories } from "../../../services/api/categories";
import { getTransactions } from "../../../services/api/transactions";
import { toSaleQuery } from "../../../services/mapper/sale";
import type { SaleFilterFormValues } from "../../../services/schema/sale";
import { reprintTransactionReceipt } from "../../../utils/transactionReceipt";
import { useTransactionsCsvExport } from "../../../hooks/useTransactionsCsvExport";
import { useReceiptPrint } from "../../ReceiptPrint";
import { TransactionDetailsDialog } from "../../transactions/TransactionDetailsDialog";
import { TransactionListTable } from "../../transactions/TransactionListTable";

type TransactionListSectionProps = {
  filters: SaleFilterFormValues;
  page: number;
  onPageChange: (page: number) => void;
  /** Clears the "N° de transaction" search behind the "Filtré par" chip. */
  onClearTransactionNumber: () => void;
};

/**
 * Read-only list of the transactions matching the analytics filters: details,
 * reprint and a CSV of the whole filtered list. No Refund here, it needs an
 * open cash session.
 */
export const TransactionListSection = ({
  filters,
  page,
  onPageChange,
  onClearTransactionNumber,
}: TransactionListSectionProps) => {
  const query = useMemo(() => toSaleQuery(filters), [filters]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionModel | null>(null);

  const transactions = useQuery({
    queryKey: ["transactions", query, page],
    queryFn: () =>
      getTransactions({
        ...query,
        include: ["refund", "items"],
        page,
      }).then((response) => response.data),
  });

  const categories = useQuery({
    queryKey: [
      "categories",
      { include: ["category", "promo"], only_category: true, sell: true },
    ],
    queryFn: () =>
      fetchCategories({
        include: ["category", "promo"],
        only_category: true,
        sell: true,
      }).then((response) => response.data.data),
  });

  const { triggerPrintReceipt, receiptPrintNode } = useReceiptPrint();
  const { exportCsv, isExporting } = useTransactionsCsvExport();

  const transactionList = transactions.data?.data ?? [];
  const total = transactions.data?.pagination?.total ?? 0;

  const handleExportCsv = () =>
    exportCsv({
      query,
      fileName: `transactions-${filters.date_from}-${filters.date_to}.csv`,
    });

  return (
    <>
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <Typography variant="h6">
              <Description /> Détail des transactions
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {filters.transaction_number && (
                <Chip
                  label={`Filtré par: ${filters.transaction_number} (${total} résultat${total > 1 ? "s" : ""})`}
                  color="primary"
                  variant="outlined"
                  onDelete={onClearTransactionNumber}
                  deleteIcon={<Clear />}
                />
              )}
              <Button
                variant="contained"
                startIcon={<FileDownload />}
                loading={isExporting}
                disabled={total === 0}
                onClick={() => void handleExportCsv()}
              >
                Exporter CSV
              </Button>
            </Box>
          </Box>

          {transactions.isError ? (
            <Alert severity="error">
              Erreur lors du chargement des transactions.
            </Alert>
          ) : (
            <TransactionListTable
              transactions={transactionList}
              isLoading={transactions.isLoading}
              emptyMessage="Aucune transaction trouvée pour la période sélectionnée."
              page={page}
              total={total}
              onPageChange={onPageChange}
              handleReprintReceipt={(id) =>
                reprintTransactionReceipt(id, triggerPrintReceipt)
              }
              handleShowDetail={setSelectedTransaction}
            />
          )}
        </CardContent>
      </Card>

      <TransactionDetailsDialog
        open={selectedTransaction !== null}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        categories={categories.data ?? []}
      />

      {receiptPrintNode}
    </>
  );
};
