import { useQuery } from "@tanstack/react-query";
import type { CategoryModel, TransactionModel } from "../interfaces/Models";
import type { TransactionPayment } from "../interfaces/Models";
import {
  getRefundForTransaction,
  getTransactionDetails,
  type RefundTransaction,
} from "../services/api/transactions";
import {
  Alert,
  Box,
  Card,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Backpack, Description, Loyalty, Remove } from "@mui/icons-material";
import {
  formatCurrency,
  formatWeight,
  getCartLinePrice,
  getCartTotal,
  getCartTotalWithGlobalPromotion,
  getGlobalPromotionDiscount,
  getTransactionGlobalPromotion,
  getTransactionGlobalPromotionDiscount,
  getTransactionStoreName,
  getTransactionSubtotal,
} from "../services/cartService";
import {
  EDITABLE_PAYMENT_METHODS,
  getPaymentMethodColor,
  getPaymentMethodLabel,
} from "../constants/paymentMethods";
import { Loading } from "./Loading";
import type { CartItem } from "./forms/cartSchema";
import { useMemo, useState } from "react";

type EditablePaymentLine = {
  method: (typeof EDITABLE_PAYMENT_METHODS)[number]["value"];
  amount: number;
};

import {
  getRefundReasonLabel,
} from "../constants/refundReasons";

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

const mapTransactionItemsToCart = (
  transaction: TransactionModel,
  categories?: CategoryModel[],
): CartItem[] => {
  return (transaction.items ?? []).map((item) => {
    const txItem = item.TransactionItem;
    const category = categories?.find((c) => c.id === item.category_id);
    const subcategory = category?.subcategories?.find(
      (c) => c.id === item.subcategory_id,
    );
    return {
      name: txItem?.name ?? item.description ?? "",
      price: Number(txItem?.price ?? item.price ?? 0),
      quantity: Number(txItem?.quantity ?? 1),
      category_name: item.category?.name ?? category?.name ?? "",
      subcategory_name: item.subcategory?.name ?? subcategory?.name ?? "",
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
};

const buildInitialPayments = (
  transaction: TransactionModel,
): EditablePaymentLine[] => {
  if (transaction.payments?.length) {
    return transaction.payments.map((payment) => ({
      method: payment.method,
      amount: Number(payment.amount),
    }));
  }
  if (transaction.payment_method === "mixed") {
    return [{ method: "cash", amount: Number(transaction.total_amount) }];
  }
  return [
    {
      method: transaction.payment_method,
      amount: Number(transaction.payment_amount ?? transaction.total_amount),
    },
  ];
};

interface DetailTransactionProps {
  selectedTransaction: TransactionModel;
  categories?: CategoryModel[];
  editable?: boolean;
}

interface DetailTransactionBodyProps {
  transaction: TransactionModel;
  categories?: CategoryModel[];
  editable: boolean;
  cartItems: CartItem[];
  refunds: RefundTransaction[];
  refundsLoading: boolean;
}

function DetailTransactionBody({
  transaction,
  editable,
  cartItems,
  refunds,
  refundsLoading,
}: DetailTransactionBodyProps) {
  const globalPromotion = getTransactionGlobalPromotion(transaction);
  const globalPromotionDiscount =
    getTransactionGlobalPromotionDiscount(transaction);
  const subtotal = getTransactionSubtotal(transaction);

  const [editedCart, setEditedCart] = useState(cartItems);
  const [editedPayments, setEditedPayments] = useState(() =>
    buildInitialPayments(transaction),
  );

  const displayCart = editable ? editedCart : cartItems;
  const paymentLines: TransactionPayment[] | EditablePaymentLine[] = editable
    ? editedPayments
    : (transaction.payments ?? []);

  const editedSubtotal = getCartTotal(displayCart);
  const editedGlobalDiscount = getGlobalPromotionDiscount(
    editedSubtotal,
    globalPromotion,
  );
  const editedTotal = getCartTotalWithGlobalPromotion(
    displayCart,
    globalPromotion,
  );
  const editedPaymentsSum = editable
    ? editedPayments.reduce((sum, line) => sum + line.amount, 0)
    : 0;

  const totalRefunded =
    refunds.reduce((sum, refund) => sum + refund.total_amount, 0);
  const hasRefunds = refunds.length > 0;
  const isFullyRefunded = totalRefunded >= transaction.total_amount;

  const updateQuantity = (index: number, delta: number) => {
    setEditedCart((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }),
    );
  };

  const updatePaymentMethod = (
    index: number,
    method: EditablePaymentLine["method"],
  ) => {
    setEditedPayments((prev) =>
      prev.map((line, i) => (i === index ? { ...line, method } : line)),
    );
  };

  const updatePaymentAmount = (index: number, amount: number) => {
    setEditedPayments((prev) =>
      prev.map((line, i) =>
        i === index ? { ...line, amount: Math.max(0, amount) } : line,
      ),
    );
  };

  const addPaymentLine = () => {
    setEditedPayments((prev) => [...prev, { method: "cash", amount: 0 }]);
  };

  const removePaymentLine = (index: number) => {
    setEditedPayments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
        {editable && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">
              Modifications locales uniquement — les changements ne sont pas
              enregistrés.
            </Alert>
          </Grid>
        )}

        {/* Informations de la transaction */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa" }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              <Description sx={{ verticalAlign: "middle", mr: 0.5 }} />
              Informations de la transaction
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  Numéro: <strong>#{transaction.id}</strong>
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  Date:{" "}
                  <strong>
                    {new Date(transaction.createdAt).toLocaleDateString(
                      "fr-FR",
                    )}
                  </strong>
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  Heure:{" "}
                  <strong>
                    {new Date(transaction.createdAt).toLocaleTimeString(
                      "fr-FR",
                    )}
                  </strong>
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  Magasin:{" "}
                  <strong>{getTransactionStoreName(transaction)}</strong>
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="body2" color="textSecondary">
                  Caissier:{" "}
                  <strong>
                    {transaction.CashSession?.User?.username || "N/A"}
                  </strong>
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="body2" color="textSecondary" component="div">
                  Statut:{" "}
                  {hasRefunds ? (
                    <Chip
                      label={
                        isFullyRefunded ? "Remboursé" : "Partiellement remboursé"
                      }
                      color={isFullyRefunded ? "error" : "warning"}
                      size="small"
                    />
                  ) : (
                    <Chip label="Actif" color="success" size="small" />
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Articles */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Articles
            </Typography>
            {displayCart.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Article</TableCell>
                      <TableCell>Poids unitaire</TableCell>
                      <TableCell>Prix unitaire</TableCell>
                      <TableCell>Quantité</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayCart.map((item, index) => (
                      <TableRow key={`${item.barcode}-${item.name}-${index}`}>
                        <TableCell>
                          <Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography variant="body1" fontWeight="medium">
                                {item.name}
                              </Typography>
                              {isNaN(+item.barcode) && (
                                <Chip
                                  size="small"
                                  label="Manuel"
                                  color="info"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              {item.barcode}
                            </Typography>
                            {(item.category_name || item.subcategory_name) && (
                              <Typography variant="body2" color="textSecondary">
                                {item.category_name}
                                {item.subcategory_name &&
                                  ` > ${item.subcategory_name}`}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{formatWeight(item.weight)}</TableCell>
                        <TableCell>
                          {formatCurrency(item.price)}
                          {item.promotion !== 0 && (
                            <Chip
                              color="secondary"
                              icon={<Loyalty />}
                              sx={{ marginLeft: 1 }}
                              label={`-${item.promotion}%`}
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {editable ? (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => updateQuantity(index, -1)}
                                  disabled={item.quantity <= 0}
                                >
                                  <Remove />
                                </IconButton>
                                <Typography
                                  sx={{ minWidth: 30, textAlign: "center" }}
                                >
                                  {item.quantity}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => updateQuantity(index, 1)}
                                >
                                  <Add />
                                </IconButton>
                              </>
                            ) : (
                              <Typography
                                sx={{ minWidth: 30, textAlign: "center" }}
                              >
                                {item.quantity}
                              </Typography>
                            )}
                            {item.bundleQuantity &&
                              item.bundleQuantity !== 0 &&
                              item.bundleQuantity !== 1 &&
                              item.quantity >= item.bundleQuantity && (
                                <Chip
                                  color="secondary"
                                  icon={<Backpack />}
                                  label={`${Math.trunc(item.quantity / item.bundleQuantity)} pack`}
                                  size="small"
                                />
                              )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="bold">
                            {formatCurrency(getCartLinePrice(item))}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Aucun article
              </Typography>
            )}
          </Card>
        </Grid>

        {/* Paiements */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Paiements
              </Typography>
              {editable && (
                <IconButton size="small" onClick={addPaymentLine} color="primary">
                  <Add />
                </IconButton>
              )}
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Mode</TableCell>
                    <TableCell align="right">Montant</TableCell>
                    {editable && <TableCell width={48} />}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {editable ? (
                    editedPayments.map((payment, index) => (
                      <TableRow key={`editable-payment-${index}`}>
                        <TableCell>
                          <Select
                            size="small"
                            value={payment.method}
                            onChange={(e) =>
                              updatePaymentMethod(
                                index,
                                e.target
                                  .value as EditablePaymentLine["method"],
                              )
                            }
                          >
                            {EDITABLE_PAYMENT_METHODS.map((method) => (
                              <MenuItem key={method.value} value={method.value}>
                                {method.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            type="number"
                            value={payment.amount}
                            onChange={(e) =>
                              updatePaymentAmount(
                                index,
                                Number(e.target.value) || 0,
                              )
                            }
                            inputProps={{ min: 0, step: 0.01 }}
                            sx={{ width: 120 }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => removePaymentLine(index)}
                            disabled={editedPayments.length <= 1}
                          >
                            <Remove />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : paymentLines.length > 0 ? (
                    (paymentLines as TransactionPayment[]).map(
                      (payment, index) => (
                        <TableRow
                          key={`${payment.method}-${payment.amount}-${index}`}
                        >
                          <TableCell>
                            {getPaymentMethodLabel(payment.method)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(Number(payment.amount))}
                          </TableCell>
                        </TableRow>
                      ),
                    )
                  ) : (
                    <TableRow>
                      <TableCell>
                        {getPaymentMethodLabel(transaction.payment_method)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(
                          Number(transaction.payment_amount ?? 0),
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                  {!editable && transaction.change_amount > 0 && (
                    <TableRow>
                      <TableCell>Rendu monnaie</TableCell>
                      <TableCell align="right">
                        {formatCurrency(transaction.change_amount)}
                      </TableCell>
                    </TableRow>
                  )}
                  {editable && (
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          Total payé
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={
                            editedPaymentsSum < editedTotal
                              ? "error.main"
                              : "success.main"
                          }
                        >
                          {formatCurrency(editedPaymentsSum)}
                        </Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Promotions globales */}
        {(editable ? editedGlobalDiscount : globalPromotionDiscount) > 0 && (
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined" sx={{ p: 2, bgcolor: "#f3e5f5" }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Promotions globales
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Sous-total
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(editable ? editedSubtotal : subtotal)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Promotion globale
                    {globalPromotion.type === "percent"
                      ? ` (${globalPromotion.value}%)`
                      : globalPromotion.type === "fixed"
                        ? ` (${formatCurrency(globalPromotion.value)})`
                        : ""}
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    -
                    {formatCurrency(
                      editable ? editedGlobalDiscount : globalPromotionDiscount,
                    )}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    Total
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(editable ? editedTotal : transaction.total_amount)}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        )}

        {/* Historique des remboursements */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Historique des remboursements
            </Typography>
            <Loading isLoading={refundsLoading}>
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
                                label={
                                  refundType === "full" ? "Total" : "Partiel"
                                }
                                color={
                                  refundType === "full" ? "error" : "warning"
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                color="error"
                              >
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
                                label={getPaymentMethodLabel(
                                  refund.payment_method,
                                )}
                                color={getPaymentMethodColor(
                                  refund.payment_method,
                                )}
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
                                label={
                                  refund.status === "completed"
                                    ? "Terminé"
                                    : refund.status
                                }
                                color={
                                  refund.status === "completed"
                                    ? "success"
                                    : "default"
                                }
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

        {/* Résumé financier */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined" sx={{ p: 2, bgcolor: "#e3f2fd" }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Résumé financier
            </Typography>
            <Grid container spacing={2}>
              {(editable ? editedGlobalDiscount : globalPromotionDiscount) >
                0 && (
                <>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      Sous-total:
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(editable ? editedSubtotal : subtotal)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      Promotion globale:
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      -
                      {formatCurrency(
                        editable
                          ? editedGlobalDiscount
                          : globalPromotionDiscount,
                      )}
                    </Typography>
                  </Grid>
                </>
              )}
              <Grid size={{ xs: 4 }}>
                <Typography variant="body2" color="textSecondary">
                  {editable ? "Total (aperçu):" : "Montant vendu:"}
                </Typography>
                <Typography variant="h6" color="success.main">
                  {formatCurrency(
                    editable ? editedTotal : transaction.total_amount,
                  )}
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
                  {formatCurrency(
                    (editable ? editedTotal : transaction.total_amount) -
                      totalRefunded,
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
  );
}

export const DetailTransaction = ({
  selectedTransaction,
  categories,
  editable = false,
}: DetailTransactionProps) => {
  const transactionDetails = useQuery({
    queryKey: ["transactionDetails", selectedTransaction.id],
    queryFn: () =>
      getTransactionDetails(selectedTransaction.id).then(
        (response) => response.data.transaction,
      ),
  });

  const refundsQuery = useQuery({
    queryKey: ["refunds", { id: selectedTransaction.id }],
    queryFn: () =>
      getRefundForTransaction(selectedTransaction.id).then(
        (response) => response.data.refunds,
      ),
    placeholderData: [],
  });

  const transaction = transactionDetails.data ?? selectedTransaction;
  const cartItems = useMemo(
    () => mapTransactionItemsToCart(transaction, categories),
    [transaction, categories],
  );

  return (
    <Loading isLoading={transactionDetails.isLoading}>
      <DetailTransactionBody
        key={`${transaction.id}-${editable}-${transactionDetails.isSuccess}`}
        transaction={transaction}
        categories={categories}
        editable={editable}
        cartItems={cartItems}
        refunds={refundsQuery.data ?? []}
        refundsLoading={refundsQuery.isLoading}
      />
    </Loading>
  );
};
