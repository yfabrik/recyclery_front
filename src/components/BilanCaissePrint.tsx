import { Box, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import type { CashSession, TransactionModel, TransactionPayment } from "../interfaces/Models";
import {
  formatCurrency,
  getCashSessionBalance,
  sumCashInPayments,
} from "../services/cartService";
import type { PaymentMethod } from "@recyclerie/api/enums";
type BilanCaisseTransaction = TransactionModel&{
  payments: Array<TransactionPayment>;
};
// type BilanCaisseTransaction = {
//   payment_method: string;
//   transactionType: string;
//   total_amount: number;
//   payments: Array<{ method: string; amount: number }>;
//   global_promotion?: number | null;
//   global_promotion_type?: string | null;
// };

interface BilanCaisseProps {
  session: CashSession;
  transactions: BilanCaisseTransaction[];
  closingAmount?: number;
}

interface BilanCaissePrintPayload {
  session: CashSession;
  transactions: BilanCaisseTransaction[];
  closingAmount?: number;
}

const printBlockSx = {
  border: "1px solid #333",
  borderRadius: 1,
  p: 1.5,
  mb: 1.5,
};
const printSubblockSx = {
  pl: 1,
  borderLeft: "2px solid #666",
  ml: 0.5,
  mb: 1,
  "&:last-of-type": { mb: 0 },
};
export const BilanCaissePrint = ({
  session,
  transactions,
  closingAmount,
}: BilanCaisseProps) => {
  const expected_amount = useMemo(
    () =>
      sumCashInPayments(transactions, session.opening_amount),
    // transactions.reduce(
    //   (prev, current) =>
    //     current.payment_method == "cash"
    //       ? (prev += current.total_amount)
    //       : prev,
    //   session.opening_amount,
    // ),
    [transactions, session.opening_amount],
  );

  type PaymentStatKey = PaymentMethod;
  type transacStats = Record<PaymentStatKey, { amount: number; count: number }>;

  const saleDatas: transacStats = useMemo(() => {
    return transactions.reduce(
      (prev: transacStats, current) => {
        if (current.transactionType !== "sell") return prev;
        switch (current.payment_method) {
          case "card":
            prev["card"].amount += current.total_amount;
            prev["card"].count++;
            break;
          case "check":
            prev["check"].amount += current.total_amount;
            prev["check"].count++;
            break;
          case "cash":
            prev["cash"].amount += current.total_amount;
            prev["cash"].count++;
            break;
          case "giftcard":
            prev["giftcard"].amount += current.total_amount;
            prev["giftcard"].count++;
            break;
          case "mixed":
            current.payments.forEach((payment) => {
              const key = payment.method;
              if (key in prev) {
                prev[key].amount += payment.amount;
                prev[key].count++;
              }
            });
            break;
          case "transfer":
            prev["transfer"].amount += current.total_amount;
            prev["transfer"].count++;
            break;
          default:
            current.payment_method satisfies never
            break;
        }
        return prev;
      },
      {
        card: {
          amount: 0,
          count: 0,
        },
        cash: {
          amount: 0,
          count: 0,
        },
        check: {
          amount: 0,
          count: 0,
        },
        giftcard: {
          amount: 0,
          count: 0,
        }, 

        transfer: {
          amount: 0,
          count: 0,
        }
      }satisfies transacStats,
    );
  }, [transactions]);

  const refundDatas: transacStats = useMemo(() => {
    return transactions.reduce(
      (prev: transacStats, current) => {
        if (current.transactionType !== "refund") return prev;
        switch (current.payment_method) {
          case "card":
            prev["card"].amount += current.total_amount;
            prev["card"].count++;
            break;
          case "check":
            prev["check"].amount += current.total_amount;
            prev["check"].count++;
            break;
          case "cash":
            prev["cash"].amount += current.total_amount;
            prev["cash"].count++;
            break;
          case "giftcard":
            prev["giftcard"].amount += current.total_amount;
            prev["giftcard"].count++;
            break;
          case "transfer":
            prev["transfer"].amount += current.total_amount;
            prev["transfer"].count++;
            break;
          default:
            current.payment_method satisfies "mixed"
            break;
        }
        return prev;
      },
      {
        card: {
          amount: 0,
          count: 0,
        },
        cash: {
          amount: 0,
          count: 0,
        },
        check: {
          amount: 0,
          count: 0,
        },
        giftcard: {
          amount: 0,
          count: 0,
        },

        transfer: {
          amount: 0,
          count: 0,
        },
      }satisfies transacStats,
    );
  }, [transactions]);

  const salesTotal = useMemo(
    () =>
      transactions.reduce(
        (prev, current) =>
          current.transactionType === "sell" ? prev + current.total_amount : prev,
        0,
      ),
    [transactions],
  );

  const globalPromoStats = useMemo(() => {
    return transactions.reduce(
      (prev, current) => {
        if (current.transactionType !== "sell") return prev;
        const value = Number(current.global_promotion ?? 0);
        if (value <= 0) return prev;
        const type = current.global_promotion_type ?? "percent";
        if (type === "percent" && value === 40) {
          prev.percent40++;
        } else if (type === "fixed" && value === 5) {
          prev.fixed5++;
        } else {
          prev.other++;
        }
        return prev;
      },
      { percent40: 0, fixed5: 0, other: 0 },
    );
  }, [transactions]);

  const refundsTotal = useMemo(
    () =>
      transactions.reduce(
        (prev, current) =>
          current.transactionType === "refund"
            ? prev + current.total_amount
            : prev,
        0,
      ),
    [transactions],
  );

  const totalAmount = useMemo(
    () =>
      transactions.reduce(
        (prev, current) =>
          current.transactionType == "sell"
            ? prev + current.total_amount
            : prev - current.total_amount,
        0,
      ),
    [transactions],
  );

  const recycleryName = session.CashRegister?.Recyclery?.name  ?? "Recyclerie";
  const cashRegisterName = session.CashRegister?.name ?? "Caisse";
  const closedAt = session.closed_at
    ? new Date(session.closed_at).toLocaleString()
    : `${new Date().toLocaleString()} ,pas fermée`;
  const countedAmount = closingAmount ?? session.closing_amount ?? 0;
  const cashBalance = getCashSessionBalance(expected_amount, countedAmount);

  return (
    <>
      <Box
        sx={{
          width: "100%",
          fontFamily: "inherit",
          "& *": { color: "black" },
        }}
      >
        <Stack spacing={0} sx={{ maxWidth: "72mm" }}>
          {/* Title & subtitle */}
          <Box sx={{ mb: 2, textAlign: "center" }}>
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontSize: "1.1rem",
                fontWeight: 700,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
              }}
            >
              {recycleryName}
            </Typography>
            <Typography
              variant="subtitle1"
              component="p"
              sx={{
                fontSize: "0.95rem",
                fontWeight: 500,
                color: "#444",
              }}
            >
              {cashRegisterName}
            </Typography>
          </Box>

          {/* Block: Session infos */}
          <Box sx={printBlockSx}>
            <Typography
              component="h2"
              sx={{
                fontSize: "0.85rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                mb: 1,
                borderBottom: "1px solid #333",
                pb: 0.5,
              }}
            >
              Session n°{session.id}
            </Typography>

            {/* Subblock: Open info */}
            <Box sx={printSubblockSx}>
              <Typography
                sx={{ fontSize: "0.75rem", fontWeight: 600, mb: 0.5 }}
              >
                Ouverture
              </Typography>
              <Typography sx={{ fontSize: "0.7rem" }}>
                {session.createdAt
                  ? new Date(session.createdAt).toLocaleString()
                  : "—"}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem" }}>
                Fond de caisse : {formatCurrency(session.opening_amount)}
              </Typography>
            </Box>

            {/* Subblock: Close info */}
            <Box sx={printSubblockSx}>
              <Typography
                sx={{ fontSize: "0.75rem", fontWeight: 600, mb: 0.5 }}
              >
                Fermeture
              </Typography>
              <Typography sx={{ fontSize: "0.7rem" }}>
                {closedAt}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem" }}>
                Comptage : {formatCurrency(cashBalance.countedDisplay)}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem" }}>
                Attendu : {formatCurrency(cashBalance.expectedDisplay)}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: cashBalance.isBalanced ? 500 : 700,
                  color: cashBalance.isBalanced ? "inherit" : "#b00",
                }}
              >
                Écart : {formatCurrency(cashBalance.differenceDisplay)}
              </Typography>
            </Box>
          </Box>

          {/* Block: Sales summary */}
          <Box sx={printBlockSx}>
            <Typography
              component="h2"
              sx={{
                fontSize: "0.85rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                mb: 1,
                borderBottom: "1px solid #333",
                pb: 0.5,
              }}
            >
              Récapitulatif des ventes
            </Typography>
            <Stack spacing={0.25} sx={{ fontSize: "0.7rem" }}>
              <Typography sx={{ fontSize: "0.7rem" }}>
                Carte : {saleDatas.card.count} règlement
                {saleDatas.card.count !== 1 ? "s" : ""}, total{" "}
                {formatCurrency(saleDatas.card.amount)}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem" }}>
                Espèces : {saleDatas.cash.count} règlement
                {saleDatas.cash.count !== 1 ? "s" : ""}, total{" "}
                {formatCurrency(saleDatas.cash.amount)}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem" }}>
                Chèque : {saleDatas.check.count} règlement
                {saleDatas.check.count !== 1 ? "s" : ""}, total{" "}
                {formatCurrency(saleDatas.check.amount)}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem" }}>
                Avoir : {saleDatas.giftcard.count} règlement
                {saleDatas.giftcard.count !== 1 ? "s" : ""}, total{" "}
                {formatCurrency(saleDatas.giftcard.amount)}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem" }}>
                virements : {saleDatas.transfer.count} règlement
                {saleDatas.transfer.count !== 1 ? "s" : ""}, total{" "}
                {formatCurrency(saleDatas.transfer.amount)}
              </Typography>
              
            </Stack>
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 700,
                mt: 1,
                pt: 1,
                borderTop: "1px solid #333",
              }}
            >
              Total ventes : {formatCurrency(salesTotal)}
            </Typography>
          </Box>

          {/* Block: Global promotions */}
          <Box sx={printBlockSx}>
            <Typography
              component="h2"
              sx={{
                fontSize: "0.85rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                mb: 1,
                borderBottom: "1px solid #333",
                pb: 0.5,
              }}
            >
              Promotions globales
            </Typography>
            <Stack spacing={0.25} sx={{ fontSize: "0.7rem" }}>
              <Typography sx={{ fontSize: "0.7rem" }}>
                40 % : {globalPromoStats.percent40} vente
                {globalPromoStats.percent40 !== 1 ? "s" : ""}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem" }}>
                5 € : {globalPromoStats.fixed5} vente
                {globalPromoStats.fixed5 !== 1 ? "s" : ""}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem" }}>
                Autres : {globalPromoStats.other} vente
                {globalPromoStats.other !== 1 ? "s" : ""}
              </Typography>
            </Stack>
          </Box>

          {/* Block: Refund summary */}
          <Box sx={printBlockSx}>
            <Typography
              component="h2"
              sx={{
                fontSize: "0.85rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                mb: 1,
                borderBottom: "1px solid #333",
                pb: 0.5,
              }}
            >
              Récapitulatif des remboursements
            </Typography>
            <Stack spacing={0.25} sx={{ fontSize: "0.7rem" }}>
              <Typography sx={{ fontSize: "0.7rem" }}>
                Carte : {refundDatas.card.count} remboursement
                {refundDatas.card.count !== 1 ? "s" : ""}, total{" "}
                {formatCurrency(refundDatas.card.amount)}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem" }}>
                Espèces : {refundDatas.cash.count} remboursement
                {refundDatas.cash.count !== 1 ? "s" : ""}, total{" "}
                {formatCurrency(refundDatas.cash.amount)}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem" }}>
                Chèque : {refundDatas.check.count} remboursement
                {refundDatas.check.count !== 1 ? "s" : ""}, total{" "}
                {formatCurrency(refundDatas.check.amount)}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem" }}>
                Avoir : {refundDatas.giftcard.count} remboursement
                {refundDatas.giftcard.count !== 1 ? "s" : ""}, total{" "}
                {formatCurrency(refundDatas.giftcard.amount)}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem" }}>
                virements : {refundDatas.transfer.count} remboursement
                {refundDatas.transfer.count !== 1 ? "s" : ""}, total{" "}
                {formatCurrency(refundDatas.transfer.amount)}
              </Typography>
            </Stack>
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 700,
                mt: 1,
                pt: 1,
                borderTop: "1px solid #333",
              }}
            >
              Total remboursements : {formatCurrency(refundsTotal)}
            </Typography>
          </Box>

          {/* Block: Global total */}
          <Box sx={printBlockSx}>
            <Typography
              sx={{
                fontSize: "0.85rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                mb: 0.5,
              }}
            >
              Total global
            </Typography>
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 700,
                pt: 0.5,
                borderTop: "1px solid #333",
              }}
            >
              Net (ventes - remboursements) : {formatCurrency(totalAmount)}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </>
  );
};

export function useBilanCaissePrint() {
  const [payload, setPayload] = useState<BilanCaissePrintPayload | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const documentTitle = useMemo(() => {
    if (!payload) return "Bilan-caisse";
    return `Bilan-caisse-${payload.session.id}`;
  }, [payload]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: `@page{size:80mm auto; margin: 8mm}`,
    documentTitle,
    onAfterPrint: () => setPayload(null),
  });

  useEffect(() => {
    if (!payload) return;
    handlePrint();
  }, [payload, handlePrint]);

  const triggerPrintBilanCaisse = (nextPayload: BilanCaissePrintPayload) => {
    setPayload(nextPayload);
  };

  const bilanCaissePrintNode = (
    <Box sx={{ display: "none", displayPrint: "block" }} ref={printRef}>
      {payload && (
        <BilanCaissePrint
          session={payload.session}
          transactions={payload.transactions}
          closingAmount={payload.closingAmount}
        />
      )}
    </Box>
  );

  return { triggerPrintBilanCaisse, bilanCaissePrintNode };
}
