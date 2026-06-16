import {
  Box,
  Card,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { FormProvider } from "react-hook-form";
import type { CategoryModel, TransactionModel } from "../../interfaces/Models";
import { getPaymentMethodColor, getPaymentMethodLabel } from "../../constants/paymentMethods";
import { getRefundReasonLabel } from "../../constants/refundReasons";
import {
  getRefundForTransaction,
  type RefundTransaction,
} from "../../services/api/transactions";
import {
  formatCurrency,
  getTransactionGlobalPromotionDiscount,
  getTransactionStoreName,
  getTransactionSubtotal,
} from "../../services/cartService";
import { buildTransactionCartFormValues } from "../../utils/editTransactionDefaults";
import { CartTable } from "../pos/CartTable";
import { OrderSummary } from "../pos/OrderSummary";
import { PaymentPanel } from "../pos/PaymentPanel";
import { Loading } from "../Loading";
import { TransactionInfoCard } from "./TransactionInfoCard";
import { type CartFormValues, type Schema } from "../forms/cartSchema";
import { useCheckoutFormCore } from "../../hooks/useCheckoutFormCore";

const getRefundType = (
  refund: RefundTransaction,
  parentTotal: number,
  cumulativeRefunded: number,
): "full" | "partial" => {
  if (refund.refund_type) return refund.refund_type;
  if (refund.total_amount >= parentTotal) return "full";
  if (cumulativeRefunded >= parentTotal) return "full";
  return "partial";
};

interface TransactionDetailsContentProps {
  transaction: TransactionModel;
  categories: CategoryModel[];
  editable: boolean;
  formId: string;
  onSubmit?: (data: Schema) => void;
}

export const TransactionDetailsContent = ({
  transaction,
  categories,
  editable,
  formId,
  onSubmit,
}: TransactionDetailsContentProps) => {
  const resolvedDefaults = buildTransactionCartFormValues(transaction, categories);
  const {
    form,
    cartFields,
    updateCartItem,
    removeCartItem,
    paymentFields,
    appendPayment,
    removePayment,
    cart,
    globalPromotion,
    cartSubtotal,
    globalPromotionDiscount,
    paymentBalance,
    giftCardScanInput,
    setGiftCardScanInput,
    handleScanGiftCard,
  } = useCheckoutFormCore({
    defaultValues: resolvedDefaults as CartFormValues,
    autoRecalculateGiftCardSplits: false,
  });

  const refundsQuery = useQuery({
    queryKey: ["refunds", { id: transaction.id }],
    queryFn: () =>
      getRefundForTransaction(transaction.id).then((response) => response.data.refunds),
    placeholderData: [],
  });
  const refunds = refundsQuery.data ?? [];
  const hasRefunds = refunds.length > 0;
  const totalRefunded = refunds.reduce((sum, refund) => sum + refund.total_amount, 0);
  const transactionGlobalPromotionDiscount =
    getTransactionGlobalPromotionDiscount(transaction);
  const transactionSubtotal = getTransactionSubtotal(transaction);

  const noop = () => {};

  const content = (
    <FormProvider {...form}>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <TransactionInfoCard transaction={transaction} refunds={editable ? undefined : refunds} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CartTable
            fields={cartFields}
            update={(index, value) => updateCartItem(index, value as Schema["cart"][number])}
            remove={editable ? removeCartItem : noop}
            allowRemove={editable}
            minQuantity={0}
            removeOnZero={false}
            quantityEditable={editable}
            size="small"
            emptyMessage="Aucun article"
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <OrderSummary
            cart={cart}
            cartSubtotal={cartSubtotal}
            globalPromotionDiscount={globalPromotionDiscount}
            paymentBalance={paymentBalance}
            globalPromotion={globalPromotion}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <PaymentPanel
            readOnly={!editable}
            showSubmitButton={false}
            paymentFields={paymentFields}
            appendPayment={appendPayment}
            removePayment={removePayment}
            giftCardScanInput={giftCardScanInput}
            setGiftCardScanInput={setGiftCardScanInput}
            onScanGiftCard={handleScanGiftCard}
          />
        </Grid>

          <Grid size={{ xs: 12 }}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Historique des remboursements
              </Typography>
              <Loading isLoading={refundsQuery.isLoading}>
                {hasRefunds ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Montant</TableCell>
                          <TableCell>Raison</TableCell>
                          <TableCell>Mode</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Heure</TableCell>
                          <TableCell>Magasin</TableCell>
                          <TableCell>Créé par</TableCell>
                          <TableCell>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {refunds.map((refund, index) => {
                          const cumulativeRefunded = refunds
                            .slice(0, index + 1)
                            .reduce((sum, r) => sum + r.total_amount, 0);
                          const refundType = getRefundType(
                            refund,
                            transaction.total_amount,
                            cumulativeRefunded,
                          );
                          const refundDate = new Date(refund.createdAt);
                          return (
                            <TableRow key={refund.id}>
                              <TableCell>
                                <Typography variant="body2" fontWeight="bold">
                                  #{refund.id}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={refundType === "full" ? "Total" : "Partiel"}
                                  color={refundType === "full" ? "error" : "warning"}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="bold" color="error">
                                  -{formatCurrency(refund.total_amount)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {getRefundReasonLabel(refund.refund_reason)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={getPaymentMethodLabel(refund.payment_method)}
                                  color={getPaymentMethodColor(refund.payment_method)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {refundDate.toLocaleDateString("fr-FR")}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {refundDate.toLocaleTimeString("fr-FR")}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {getTransactionStoreName(refund)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {refund.created_by ||
                                    refund.CashSession?.User?.username ||
                                    "N/A"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={refund.status === "completed" ? "Terminé" : refund.status}
                                  color={refund.status === "completed" ? "success" : "default"}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <Typography variant="body2" color="textSecondary">
                      Aucun remboursement pour cette transaction
                    </Typography>
                  </Box>
                )}
              </Loading>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card variant="outlined" sx={{ p: 2, bgcolor: "#e3f2fd" }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Résumé financier
              </Typography>
              <Grid container spacing={2}>
                {transactionGlobalPromotionDiscount > 0 && (
                  <>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="body2" color="textSecondary">
                        Sous-total:
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(transactionSubtotal)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="body2" color="textSecondary">
                        Promotion globale:
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        -{formatCurrency(transactionGlobalPromotionDiscount)}
                      </Typography>
                    </Grid>
                  </>
                )}
                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Montant vendu:
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(transaction.total_amount)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Total remboursé:
                  </Typography>
                  <Typography variant="h6" color="error">
                    -{formatCurrency(totalRefunded)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Solde restant:
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(transaction.total_amount - totalRefunded)}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          </Grid>
      </Grid>
    </FormProvider>
  );

  if (editable && onSubmit) {
    return (
      <Box component="form" id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        {content}
      </Box>
    );
  }

  return content;
};
