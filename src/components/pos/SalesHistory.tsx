import { Description, Undo, Visibility } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import type {
  CashSession,
  TransactionModel,
  TransactionPayment,
} from "../../interfaces/Models";
import { fetchCategories } from "../../services/api/categories";
import {
  createRefund,
  getTransactionDetails,
  getTransactions,
  type CreateRefundBody,
  type CreateTransactionResponse,
  type transactionsFilters,
} from "../../services/api/transactions";
import {
  formatCurrency,
  getCartLinePrice,
  getPaymentMethodLabel,
  getTransactionGlobalPromotion,
} from "../../services/cartService";
import { DetailTransaction } from "../DetailTransaction";
import type { CartItem } from "../forms/cartSchema";
import { RefundForm, type Schema } from "../forms/RefundForm";
import { Loading } from "../Loading";
import { useReceiptPrint } from "../ReceiptPrint";
import { TransactionTableLine } from "../TransactionTableLine";
import { useGiftCardPrint } from "./GiftCartPrint";
import { SaleHistoryFilter, type Filters } from "../forms/SaleHistoryFilter";

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


  const [filters, setFilters] = useState<Filters>({
    date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    date_to: new Date().toISOString().split("T")[0],
    transaction_number: "", // Recherche par numéro de transaction
    transactionType: "",
    transactionMethod: "",

  });

  // États pour la pop-up des détails de transaction
  const [transactionDetailsDialog, setTransactionDetailsDialog] =
    useState(false);

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
          ...(filters.transactionType||filters.transactionType!="" ? {type: filters.transactionType}:{}),
          ...(filters.transactionMethod||filters.transactionMethod!="" ?{payment_method: filters.transactionMethod}:{})
         } satisfies transactionsFilters
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
      toast.success("Remboursement effectué avec succès");
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
    onError: () => {
      toast.error("Erreur lors du remboursement");
    },
  });

  const handleSubmitRefund = async (data: Schema) => {
    if (!selectedTransaction) return;
    const d = data.cart
      .map((item) => {
        return {
          ...item,
          quantity: item.refundQuantity,
        };
      })
      .filter((i) => i.quantity > 0);
    const refundValue = d.reduce(
      (prev, current) => (prev += getCartLinePrice(current)),
      0,
    );

    addRefund.mutate({
      id: selectedTransaction.id,
      data: {
        items: [...d],
        total_amount: refundValue,
        cash_session_id: activeSession.id,
        payment_method: data.refund_method,
        refund_reason: data.refund_reason,
        gift_card_code: data.gift_card_code,
      },
    });
  };
  const { triggerPrintReceipt, receiptPrintNode } = useReceiptPrint();

  const handleReprintReceipt = (transactionId: number) => {
    // Fonction pour réimprimer le ticket de caisse
    toast.success(
      `Réimpression du ticket de caisse ${transactionId} en cours...`,
    );

    //FIXME copy pasted from the SalesAnalyticsTab
    // Ici on pourrait ajouter la logique d'impression réelle
    getTransactionDetails(transactionId).then((response) => {
      const transaction = response.data.transaction;
      if (!transaction.CashSession || !transaction.CashSession.User) {
        toast.error(
          "Impossible de reimprimer: informations de session ou utilisateur manquantes.",
        );
        return;
      }
      type ReceiptSale = CreateTransactionResponse["data"]["sale"];
      const saleForPrint: ReceiptSale = {
        id: transaction.id,
        total_amount: transaction.total_amount ?? 0,
        total_amount_before_promotion: transaction.total_amount_before_promotion ?? transaction.total_amount ?? 0,
        payment_method: transaction.payment_method,
        payment_amount: transaction.payment_amount ?? 0,
        transactionType: transaction.transactionType,
        customer_postal_code: transaction.customer_postal_code ?? null,
        status: transaction.status,
        cash_session_id: transaction.cash_session_id ?? null,
        created_by: transaction.created_by ?? null,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt ?? transaction.createdAt,
        payments: transaction.payments as (TransactionPayment & {
          createdAt: string;
          updatedAt: string;
        })[],
      };
      const itemsForPrint: CartItem[] = transaction.items.map((item) => {
        const txItem = item.TransactionItem;
        return {
          name: txItem?.name ?? item.description ?? "",
          price: Number(txItem?.price ?? item.price ?? 0),
          quantity: Number(txItem?.quantity ?? 1),
          category_name: item.category?.name ?? "",
          subcategory_name: item.subcategory?.name ?? "",
          barcode: item.barcode ?? "",
          category_id: item.category_id ?? 0,
          subcategory_id: item.subcategory_id ?? null,
          description: item.description ?? null,
          weight: Number(item.weight ?? 0),
          promotion: Number(txItem?.promotionValue ?? 0),
          bundlePrice:
            txItem?.bundlePrice != null ? Number(txItem.bundlePrice) : null,
          bundleQuantity: txItem?.bundleQuantity ?? null,
        };
      });

      triggerPrintReceipt({
        cashSession: transaction.CashSession,
        items: itemsForPrint,
        user: transaction.CashSession.User!,
        sale: saleForPrint,
        global_promotion: getTransactionGlobalPromotion(transaction),
      });
    });
  };

  const handleRefund = (transaction: TransactionModel) => {
    setSelectedTransaction(transaction);
    setRefundDialog(true);
  };

  const handleCloseRefundDialog = () => {
    setRefundDialog(false);
    setSelectedTransaction(null);
  };

  // Fonction pour ouvrir les détails d'une transaction
  const handleViewTransactionDetails = (transaction: TransactionModel) => {
    setSelectedTransaction(transaction);
    setTransactionDetailsDialog(true);
  };

  // Fonction pour fermer les détails de transaction
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
            })
            )
          } />
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
        >
          <Description /> Historique des transactions de la caisse
        </Typography>
        <Loading isLoading={transactionsHistory.isLoading}>
          {cashRegisterTransactions.length === 0 ? (
            <Alert severity="info">
              Aucune transaction trouvée pour cette caisse.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>N° Transaction</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Magasin</TableCell>
                    <TableCell>Caissier</TableCell>
                    <TableCell>Mode de paiement</TableCell>
                    <TableCell align="right">Montant</TableCell>
                    <TableCell>Remboursements</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cashRegisterTransactions.map((transaction) => (
                    <TransactionTableLine
                      key={transaction.id}
                      transaction={transaction}
                      handleRefund={handleRefund}
                      handleReprintReceipt={handleReprintReceipt}
                      handleShowDetail={handleViewTransactionDetails}
                    />
                  ))}
                </TableBody>
              </Table>
              <Box
                sx={{ display: "flex", justifyContent: "center", padding: 1 }}
              >
                <Pagination
                  count={
                    Math.trunc(
                      (transactionsHistory.data?.pagination?.total || 0) / 50,
                    ) + 1 || 10
                  }
                  color="primary"
                  page={page}
                  onChange={(_e, val) => setPage(val)}
                />
              </Box>
            </TableContainer>
          )}
        </Loading>
      </Paper>

      {/* Pop-up de remboursement */}
      <Dialog
        open={refundDialog}
        onClose={handleCloseRefundDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Undo color="error" />
            <Typography variant="h6">
              Remboursement - Transaction #{selectedTransaction?.id}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {/* Informations de la transaction */}
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa" }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Informations de la transaction
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="textSecondary">
                          Montant total:{" "}
                          <strong>
                            {formatCurrency(selectedTransaction.total_amount)}
                          </strong>
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="textSecondary">
                          Mode de paiement:{" "}
                          <strong>
                            {getPaymentMethodLabel(
                              selectedTransaction.payment_method,
                            )}
                          </strong>
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="textSecondary">
                          Date:{" "}
                          <strong>
                            {new Date(
                              selectedTransaction.createdAt,
                            ).toLocaleDateString("fr-FR")}
                          </strong>
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="textSecondary">
                          Caissier:{" "}
                          <strong>
                            {selectedTransaction.CashSession?.User?.username ||
                              "N/A"}
                          </strong>
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              </Grid>

              <RefundForm
                formId="refundForm"
                onSubmit={handleSubmitRefund}
                selectedTransaction={selectedTransaction}
                categories={categories.data || []}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRefundDialog}>Annuler</Button>
          <Button
            type="submit"
            form="refundForm"
            variant="contained"
            color="error"
            startIcon={<Undo />}
          >
            Procéder au remboursement
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog des détails de transaction */}
      <Dialog
        open={transactionDetailsDialog}
        onClose={handleCloseTransactionDetailsDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Visibility color="primary" />
            <Typography variant="h6">
              Détails de la Transaction #{selectedTransaction?.id}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <DetailTransaction
              selectedTransaction={selectedTransaction}
              categories={categories.data ?? []}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransactionDetailsDialog}>Fermer</Button>
        </DialogActions>
      </Dialog>
      {giftCardPrintNode}
      {receiptPrintNode}
    </>
  );
};
