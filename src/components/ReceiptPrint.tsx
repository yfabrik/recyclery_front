/* eslint-disable react-refresh/only-export-components */
import { Box, Typography } from "@mui/material";
import type { SalesTransactionDto } from "@recyclerie/api/responses/salesTransactions";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import type { AuthUserModel, CashSession } from "../interfaces/Models";
import {
  formatCurrency,
  formatWeight,
  getCartLinePrice,
  getCartTotal,
  getCartTotalWithGlobalPromotion,
  getGlobalPromotionDiscount,
  getPaymentBalance,
  getPaymentMethodLabel,
  roundCurrency,
  type GlobalPromotionInput,
} from "../services/cartService";
import type { CartItem } from "./forms/cartSchema";

type ReceiptSale = SalesTransactionDto;

interface ReceiptPrintPayload {
  sale: ReceiptSale;
  items: CartItem[];
  cashSession: CashSession;
  user:  AuthUserModel;
  global_promotion?: GlobalPromotionInput | null;
}

const getPaymentLabel = (method: ReceiptSale["payment_method"]) => {
  if (method === "mixed") return "Paiement multiple";
  return getPaymentMethodLabel(method);
};

const ReceiptPrintContent = ({ payload }: { payload: ReceiptPrintPayload }) => {
  const { sale, items, cashSession, user, global_promotion } = payload;
  const paymentLines = sale.payments ?? [];
  const paidAmount = paymentLines.reduce((prev, current) => prev + +current.amount, 0);
  const subtotalFromSale =
    sale.total_amount_before_promotion != null
      ? Number(sale.total_amount_before_promotion)
      : null;
  const subtotal = subtotalFromSale ?? getCartTotal(items);
  const totalFromSale =
    sale.total_amount != null ? Number(sale.total_amount) : null;
  const totalAmount =
    totalFromSale ?? getCartTotalWithGlobalPromotion(items, global_promotion);
  const globalPromotionDiscount =
    subtotalFromSale != null && totalFromSale != null
      ? Math.max(subtotal - totalAmount, 0)
      : getGlobalPromotionDiscount(subtotal, global_promotion);
  const paidFromSale =
    paymentLines.length > 0
      ? paidAmount
      : Number(sale.payment_amount ?? 0);
  const receiptBalance = getPaymentBalance(paidFromSale, totalAmount);

  return (
    <Box sx={{ px: 2, py: 1, fontFamily: "monospace", fontSize: "12px", width: "80mm" }} className="receipt-print-root">
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontFamily: "monospace", fontWeight: 700 }}>
          {cashSession.Recyclery?.name}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>Ticket N°: {sale.id}</Typography>
        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
          Date: {new Date().toLocaleString()}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>Caissier: {user.username}</Typography>
      </Box>

      <Box sx={{ borderBottom: "1px dashed #000", mb: 1 }} />

      {items.map((item) => (
        <Box key={`${item.barcode}-${item.name}-${item.price}-${item.quantity}`} sx={{ mb: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
            <Typography variant="body2" sx={{ flex: 1, fontFamily: "monospace", fontWeight: 700 }}>
              {item.name}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "nowrap", fontFamily: "monospace", textAlign: "right", minWidth: 50 }}>
              {formatCurrency(getCartLinePrice(item))}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ display: "block", fontFamily: "monospace" }}>
            Qt: {item.quantity} x {formatCurrency(item.price)} {item.weight > 0 ? `| Poids: ${formatWeight(item.weight)}` : ""}
          </Typography>
          {item.promotion > 0 && (
            <Typography variant="caption" sx={{ display: "block", fontFamily: "monospace" }}>
              Promo appliquee: -{item.promotion.toFixed(0)}%
            </Typography>
          )}
          {!!item.bundleQuantity && !!item.bundlePrice && item.bundleQuantity > 0 && (
            <Typography variant="caption" sx={{ display: "block", fontFamily: "monospace" }}>
              Bundle: {item.bundleQuantity} pour {formatCurrency(item.bundlePrice)}
            </Typography>
          )}
        </Box>
      ))}

      <Box sx={{ borderBottom: "1px dashed #000", my: 1 }} />

      <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 700, mb: 0.5 }}>
        Paiements
      </Typography>
      {paymentLines.length > 0 ? (
        paymentLines.map((payment, index) => (
          <Box key={`${payment.method}-${payment.amount}-${index}`} sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
              {getPaymentMethodLabel(payment.method)}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
              {formatCurrency(+payment.amount)}
            </Typography>
          </Box>
        ))
      ) : (
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
            {getPaymentLabel(sale.payment_method)}
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
            {formatCurrency(Number(sale.payment_amount ?? 0))}
          </Typography>
        </Box>
      )}
      <Box sx={{ borderBottom: "1px dashed #000", mt: 1 }} />
      <Box sx={{ fontWeight: 700 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>Sous-total:</Typography>
          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{formatCurrency(roundCurrency(subtotal))}</Typography>
        </Box>
        {roundCurrency(globalPromotionDiscount) > 0 && (
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
              Promotion globale
              {global_promotion?.type === "percent"
                ? ` (${global_promotion.value}%)`
                : ""}
              :
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
              -{formatCurrency(roundCurrency(globalPromotionDiscount))}
            </Typography>
          </Box>
        )}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 700 }}>TOTAL:</Typography>
          <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 700 }}>{formatCurrency(receiptBalance.due)}</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>Paye:</Typography>
          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{formatCurrency(receiptBalance.paid)}</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>Rendu:</Typography>
          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{formatCurrency(receiptBalance.change)}</Typography>
        </Box>
      </Box>

      <Box sx={{ borderBottom: "1px dashed #000", mt: 1, mb: 2 }} />

      <Typography variant="body2" sx={{ textAlign: "center", fontFamily: "monospace" }}>
        Merci de votre visite !
      </Typography>
    </Box>
  );
};

const printPageStyle = `
  @page { size: 80mm auto; margin: 4mm; }
  html, body { margin: 0 !important; padding: 0 !important; }
  .receipt-print-root { page-break-inside: avoid; page-break-after: avoid; }
`;

export function useReceiptPrint() {
  const [payload, setPayload] = useState<ReceiptPrintPayload | null>(null);
  const receiptPrintRef = useRef<HTMLDivElement>(null);

  const documentTitle = useMemo(() => {
    if (!payload) return "Ticket de caisse";
    return `Ticket-${payload.sale.id}`;
  }, [payload]);

  const handlePrint = useReactToPrint({
    contentRef: receiptPrintRef,
    pageStyle: printPageStyle,
    onAfterPrint: () => setPayload(null),
    documentTitle,
  });

  useEffect(() => {
    if (!payload) return;
    handlePrint();
  }, [payload, handlePrint]);

  const triggerPrintReceipt = (nextPayload: ReceiptPrintPayload) => setPayload(nextPayload);

  const receiptPrintNode = (
    <Box sx={{ display: "none", displayPrint: "block" }} ref={receiptPrintRef}>
      {payload && <ReceiptPrintContent payload={payload} />}
    </Box>
  );

  return { triggerPrintReceipt, receiptPrintNode };
}
