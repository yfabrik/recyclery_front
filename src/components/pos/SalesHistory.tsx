import { Description } from "@mui/icons-material";
import { Paper, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
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
  type CreateRefundBody,
  type transactionsFilters,
} from "../../services/api/transactions";
import { RefundTransactionDialog } from "../transactions/RefundTransactionDialog";
import { TransactionDetailsDialog } from "../transactions/TransactionDetailsDialog";
import { TransactionListTable } from "../transactions/TransactionListTable";
import type { Schema } from "../forms/RefundForm";
import { useReceiptPrint } from "../ReceiptPrint";
import { useGiftCardPrint } from "./GiftCartPrint";
import { SaleHistoryFilter, type Filters } from "../forms/SaleHistoryFilter";
import { buildCreateRefundBody } from "../../utils/refundBody";
import { reprintTransactionReceipt } from "../../utils/transactionReceipt";

export const SalesHistory = ({
  activeSession,
}: {
  activeSession: CashSession;
}) => {
  const { triggerPrintGiftCard, giftCardPrintNode } = useGiftCardPrint();
  const [refundDialog, setRefundDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionModel | null>(null);
  const [page, setPage] = useState(1);
  const [transactionDetailsDialog, setTransactionDetailsDialog] =
    useState(false);

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

  const handleSubmitRefund = async (data: Schema) => {
    if (!selectedTransaction) return;

    addRefund.mutate({
      id: selectedTransaction.id,
      data: buildCreateRefundBody(data, activeSession.id),
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
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
        >
          <Description /> Historique des transactions de la caisse
        </Typography>
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
      />

      {giftCardPrintNode}
      {receiptPrintNode}
    </>
  );
};
