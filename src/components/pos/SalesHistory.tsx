import { Description } from "@mui/icons-material";
import { Box, Paper, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../../utils/apiToastMessage";
import type { CashSession, TransactionModel } from "../../interfaces/Models";
import { fetchCategories } from "../../services/api/categories";
import {
  createRefund,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../../services/api/transactions";
import { RefundTransactionDialog } from "../transactions/RefundTransactionDialog";
import { TransactionDetailsDialog } from "../transactions/TransactionDetailsDialog";
import { TransactionListTable } from "../transactions/TransactionListTable";
import type { CartFormOutput as EditTransactionSchema } from "../../services/schema/cart";
import { useReceiptPrint } from "../ReceiptPrint";
import { useGiftCardPrint } from "./GiftCartPrint";
import { SaleHistoryFilter } from "../forms/filters/SaleHistoryFilter";
import {
  getSaleHistoryFilterFormDefaults,
  saleHistoryFilterFormSchema,
} from "../../services/schema/sale";
import { toSaleHistoryQuery } from "../../services/mapper/sale";
import { buildCreateRefundBody } from "../../utils/refundBody";
import { buildUpdateTransactionBody } from "../../services/mapper/cart";
import type { RefundFormOutput } from "../../services/schema/refund";
import { reprintTransactionReceipt } from "../../utils/transactionReceipt";
import { SalesHistoryExport } from "./SalesHistoryExport";
import type { RefundDataInput } from "@recyclerie/api/schemas/salesTransactions";
import { useUrlFilters } from "../../hooks/useUrlFilters";

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
  const [transactionDetailsDialog, setTransactionDetailsDialog] =
    useState(false);

  const defaults = useMemo(() => getSaleHistoryFilterFormDefaults(), []);
  const { filters, setFilters, page, setPage } = useUrlFilters({
    schema: saleHistoryFilterFormSchema,
    defaults,
    withPage: true,
  });
  const query = useMemo(() => toSaleHistoryQuery(filters), [filters]);

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

  const transactionsHistory = useQuery({
    queryKey: [
      "transactionsHistory",
      { store_id: activeSession.CashRegister?.recyclery_id, page, query },
    ],
    queryFn: () =>
      getTransactions({
        ...query,
        store_id: activeSession.CashRegister?.recyclery_id,
        include: ["refund", "items"],
        page,
      }).then((response) => response.data),
    enabled: !!activeSession.CashRegister?.recyclery_id,
  });

  const cashRegisterTransactions = (
    transactionsHistory.data?.data || []
  ).filter(
    (transaction) =>
      transaction.CashSession?.cash_register_id ===
      activeSession.cash_register_id ||
      transaction.cash_session_id === activeSession.id,
  );

  const addRefund = useMutation({
    mutationFn: (v: { id: number; data: RefundDataInput }) =>
      createRefund(v.id, v.data),
    onSuccess: async (data, variables) => {
      handleCloseRefundDialog();
      toast.success(
        getApiSuccessMessage(data, "Remboursement effectué avec succès"),
      );
      const isGiftCardRefund = variables.data.payment_method === "giftcard";
      if (isGiftCardRefund) {
        const refundGiftCard = data.data.data.giftCard;

        if (!refundGiftCard?.code) {
          toast.warning("Code d'avoir introuvable pour impression");
          return;
        }

        triggerPrintGiftCard({
          giftCard: {
            code: refundGiftCard.code,
            initial_value: Number(refundGiftCard.currentBalance ?? 0),
            current_value: Number(refundGiftCard.currentBalance ?? 0),
            expires_at: null,
            issued_at: null,
            //TODO faut changer dans le backend pour renvoyer les dates de creation et d'expiration
            // expires_at: refundGiftCard.expires_at ? new Date(refundGiftCard.expires_at).toISOString() : null,
            // issued_at: refundGiftCard.issued_at ? new Date(refundGiftCard.issued_at).toISOString() : null,
            createdAt: new Date().toISOString(),
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
    onSuccess: (data, variables) => {
      toast.success(
        getApiSuccessMessage(data, "Transaction mise à jour avec succès"),
      );
      queryClient.invalidateQueries({ queryKey: ["transactionsHistory"] });
      queryClient.invalidateQueries({ queryKey: ["transactionDetails", variables.id] });
      handleCloseTransactionDetailsDialog();
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Erreur lors de la mise à jour de la transaction"),
      );
    },
  });

  const removeTransaction = useMutation({
    mutationFn: (id: number) => deleteTransaction(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["transactionsHistory"] });
      toast.success(
        getApiSuccessMessage(data, "Transaction mise à jour avec succès"),
      );
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Erreur lors de la suppression de la transaction"),
      );
    },
  })

  const handleRemoveTransaction = (data: TransactionModel["id"]) => {
  //  return toast.error("Cette fonctionnalité n'est pas encore disponible")
    if (window.confirm("supprimer la transaction ?")) {
      removeTransaction.mutate(data)
    }
  }

  const handleSubmitRefund = async (data: RefundFormOutput) => {
    if (!selectedTransaction) return;
    // return toast.error("Cette fonctionnalité n'est pas encore disponible")
    addRefund.mutate({
      id: selectedTransaction.id,
      data: buildCreateRefundBody(data, activeSession.id),
    });
  };

  const handleSaveTransaction = (data: EditTransactionSchema) => {
    if (!selectedTransaction) return;
    // return toast.error("Cette fonctionnalité n'est pas encore disponible")

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
          onChange={setFilters}
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
          <SalesHistoryExport
            activeSession={activeSession}
            filters={filters}
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
          handleRemove={handleRemoveTransaction}
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
