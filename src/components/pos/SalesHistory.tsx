import { Description } from "@mui/icons-material";
import { Box, Paper, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../../utils/apiToastMessage";
import type { CashSession, TransactionModel } from "../../interfaces/Models";
import { fetchCategories } from "../../services/api/categories";
import {
  createRefund,
  getTransactions,
  updateTransaction,
  type CreateRefundBody,
  type transactionsFilters,
} from "../../services/api/transactions";
import { RefundTransactionDialog } from "../transactions/RefundTransactionDialog";
import { TransactionDetailsDialog } from "../transactions/TransactionDetailsDialog";
import { TransactionListTable } from "../transactions/TransactionListTable";
import type { Schema as RefundSchema } from "../forms/RefundForm";
import type { Schema as EditTransactionSchema } from "../forms/cartSchema";
import { useReceiptPrint } from "../ReceiptPrint";
import { useGiftCardPrint } from "./GiftCartPrint";
import { SaleHistoryFilter, type Filters } from "../forms/SaleHistoryFilter";
import { buildCreateRefundBody } from "../../utils/refundBody";
import { buildUpdateTransactionBody } from "../../utils/editTransactionBody";
import { reprintTransactionReceipt } from "../../utils/transactionReceipt";
import { ExportCsvButton, type ExportScope } from "../ExportCsvButton";
import { downloadCsv, rowsToCsv, type CsvColumn } from "../../utils/csv";
import { fetchAllPages } from "../../utils/fetchAllPages";
import type { PaginationMeta } from "../../services/api/pagination";

export const SalesHistory = ({
  activeSession,
}: {
  activeSession: CashSession;
}) => {
  const queryClient = useQueryClient();
  const { triggerPrintGiftCard, giftCardPrintNode } = useGiftCardPrint();
  const [refundDialog, setRefundDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionModel | null>(null);
  const [page, setPage] = useState(1);
  const [transactionDetailsDialog, setTransactionDetailsDialog] =
    useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    date_to: new Date().toISOString().split("T")[0],
    transaction_number: "",
    transactionType: "",
    transactionMethod: "",
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
      }).then((response) => response.data.categories),
  });

  const transactionsHistory = useQuery({
    queryKey: [
      "transactionsHistory",
      { store_id: activeSession.CashRegister?.recyclery_id, page, filters },
    ],
    queryFn: () =>
      getTransactions({
        store_id: activeSession.CashRegister?.recyclery_id,
        include: ["refund", "items"],
        page,
        ...{
          ...filters,
          ...(filters.transactionType || filters.transactionType != ""
            ? { type: filters.transactionType }
            : {}),
          ...(filters.transactionMethod || filters.transactionMethod != ""
            ? { payment_method: filters.transactionMethod }
            : {}),
        } satisfies transactionsFilters,
      }).then((response) => response.data),
    enabled: !!activeSession.CashRegister?.recyclery_id,
  });

  const cashRegisterTransactions = (
    transactionsHistory.data?.transactions || []
  ).filter(
    (transaction) =>
      transaction.CashSession?.cash_register_id ===
        activeSession.cash_register_id ||
      transaction.cash_session_id === activeSession.id,
  );

  const transactionCsvColumns: CsvColumn<TransactionModel>[] = [
    { header: "Transaction", key: "id" },
    {
      header: "Date",
      key: "createdAt",
      format: (value) =>
        value
          ? new Date(String(value)).toLocaleString("fr-FR")
          : "",
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

  const handleExportCsv = async (scope: ExportScope) => {
    if (!activeSession.CashRegister?.recyclery_id) {
      toast.warning("Caisse introuvable pour l'export.");
      return;
    }

    setIsExporting(true);
    try {
      const allTransactions = await fetchAllPages<TransactionModel, {
        transactions?: TransactionModel[];
        pagination?: Partial<PaginationMeta>;
      }>({
        fetchPage: async (pageValue) => {
          const response = await getTransactions(
            getBaseFilters(scope, pageValue),
          );
          return response.data;
        },
        getItems: (data) =>
          (data.transactions || []).filter(
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

  const addRefund = useMutation({
    mutationFn: (v: { id: number; data: CreateRefundBody }) =>
      createRefund(v.id, v.data),
    onSuccess: async (data, variables) => {
      handleCloseRefundDialog();
      toast.success(
        getApiSuccessMessage(data, "Remboursement effectué avec succès"),
      );
      const isGiftCardRefund = variables.data.payment_method === "giftcard";
      if (isGiftCardRefund) {
        const refundGiftCard = data.data.giftCard;

        if (!refundGiftCard?.code) {
          toast.warning("Code d'avoir introuvable pour impression");
          return;
        }

        triggerPrintGiftCard({
          giftCard: {
            code: refundGiftCard.code,
            initial_value: Number(refundGiftCard.initial_value ?? 0),
            current_value: Number(refundGiftCard.initial_value ?? 0),
            createdAt: new Date(),
          },
          storeAddress: undefined,
        });
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Erreur lors du remboursement"));
    },
  });

  const editTransaction = useMutation({
    mutationFn: (v: { id: number; data: ReturnType<typeof buildUpdateTransactionBody> }) =>
      updateTransaction(v.id, v.data),
    onSuccess: (data) => {
      toast.success(
        getApiSuccessMessage(data, "Transaction mise à jour avec succès"),
      );
      queryClient.invalidateQueries({ queryKey: ["transactionsHistory"] });
      handleCloseTransactionDetailsDialog();
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Erreur lors de la mise à jour de la transaction"),
      );
    },
  });

  const handleSubmitRefund = async (data: RefundSchema) => {
    if (!selectedTransaction) return;

    addRefund.mutate({
      id: selectedTransaction.id,
      data: buildCreateRefundBody(data, activeSession.id),
    });
  };

  const handleSaveTransaction = (data: EditTransactionSchema) => {
    if (!selectedTransaction) return;

    editTransaction.mutate({
      id: selectedTransaction.id,
      data: buildUpdateTransactionBody(data, activeSession.id),
    });
  };

  const { triggerPrintReceipt, receiptPrintNode } = useReceiptPrint();

  const handleReprintReceipt = (transactionId: number) => {
    reprintTransactionReceipt(transactionId, triggerPrintReceipt);
  };

  const handleRefund = (transaction: TransactionModel) => {
    setSelectedTransaction(transaction);
    setRefundDialog(true);
  };

  const handleCloseRefundDialog = () => {
    setRefundDialog(false);
    setSelectedTransaction(null);
  };

  const handleViewTransactionDetails = (transaction: TransactionModel) => {
    setSelectedTransaction(transaction);
    setTransactionDetailsDialog(true);
  };

  const handleCloseTransactionDetailsDialog = () => {
    setTransactionDetailsDialog(false);
    setSelectedTransaction(null);
  };

  const isEditableTransaction =
    selectedTransaction?.transactionType === "sell" &&
    selectedTransaction.cash_session_id === activeSession.id;

  return (
    <>
      <Paper sx={{ p: 2, mb: 2 }}>
        <SaleHistoryFilter
          defaultValues={filters}
          onChange={(values) =>
            setFilters((prev) => ({
              ...prev,
              ...values,
            }))
          }
        />
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Description /> Historique des transactions de la caisse
          </Typography>
          <ExportCsvButton
            onExport={handleExportCsv}
            loading={isExporting}
          />
        </Box>
        <TransactionListTable
          transactions={cashRegisterTransactions}
          isLoading={transactionsHistory.isLoading}
          emptyMessage="Aucune transaction trouvée pour cette caisse."
          page={page}
          total={transactionsHistory.data?.pagination?.total || 0}
          onPageChange={setPage}
          handleRefund={handleRefund}
          handleReprintReceipt={handleReprintReceipt}
          handleShowDetail={handleViewTransactionDetails}
          currentCashSessionId={activeSession.id}
        />
      </Paper>

      <RefundTransactionDialog
        open={refundDialog}
        onClose={handleCloseRefundDialog}
        transaction={selectedTransaction}
        categories={categories.data || []}
        onSubmit={handleSubmitRefund}
      />

      <TransactionDetailsDialog
        open={transactionDetailsDialog}
        onClose={handleCloseTransactionDetailsDialog}
        transaction={selectedTransaction}
        categories={categories.data ?? []}
        editable={isEditableTransaction}
        onSubmit={isEditableTransaction ? handleSaveTransaction : undefined}
      />

      {giftCardPrintNode}
      {receiptPrintNode}
    </>
  );
};
