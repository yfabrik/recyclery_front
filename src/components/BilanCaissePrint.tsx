import { Print } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import type { CashSession, TransactionModel } from "../interfaces/Models";

interface BilanCaisseProps {
  session: CashSession;
  transactions: TransactionModel[];
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
      transactions.reduce(
        (prev, current) =>
          current.payment_method == "cash"
            ? (prev += current.total_amount)
            : prev,
        session.opening_amount,
      ),
    [transactions, session.opening_amount],
  );

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    pageStyle: `@page{size:80mm auto; margin: 8mm}`,
  });

  type transacStats = Record<
    TransactionModel["payment_method"],
    {
      amount: number;
      count: number;
    }
  >;

  const transactionDatas: transacStats = useMemo(() => {
    return transactions.reduce(
      (prev: transacStats, current) => {
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
          default:
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
      },
    );
  }, [transactions]);

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

  const recycleryName = session.Recyclery?.name ?? "Recyclerie";
  const cashRegisterName = session.CashRegister?.name ?? "Caisse";
  const closedAt = session.closed_at
    ? new Date(session.closed_at).toLocaleString()
    : `${new Date().toLocaleString()} ,pas fermée`;
  const countedAmount = session.closing_amount ?? closingAmount ?? 0;
  const expected = session.expected_amount ?? expected_amount;
  const difference = session.difference_amount ?? expected_amount - countedAmount;

  return (
    <>
      <Button startIcon={<Print />} onClick={reactToPrintFn}>
        Imprimer bilan
      </Button>
      <Box
        ref={contentRef}
        sx={{
          display: "none",
          displayPrint: "block",
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
                {new Date(session.createdAt).toLocaleString()}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem" }}>
                Fond de caisse : {session.opening_amount} €
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
                Comptage : {countedAmount} €
              </Typography>
              <Typography sx={{ fontSize: "0.7rem" }}>
                Attendu : {expected} €
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: difference === 0 ? 500 : 700,
                  color: difference === 0 ? "inherit" : "#b00",
                }}
              >
                Écart : {difference} €
              </Typography>
            </Box>
          </Box>

          {/* Block: Transaction summary */}
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
              Récapitulatif des transactions
            </Typography>
            <Stack spacing={0.25} sx={{ fontSize: "0.7rem" }}>
              <Typography sx={{ fontSize: "0.7rem" }}>
                Carte : {transactionDatas.card.count} règlement
                {transactionDatas.card.count !== 1 ? "s" : ""}, total{" "}
                {transactionDatas.card.amount} €
              </Typography>
              <Typography sx={{ fontSize: "0.7rem" }}>
                Espèces : {transactionDatas.cash.count} règlement
                {transactionDatas.cash.count !== 1 ? "s" : ""}, total{" "}
                {transactionDatas.cash.amount} €
              </Typography>
              <Typography sx={{ fontSize: "0.7rem" }}>
                Chèque : {transactionDatas.check.count} règlement
                {transactionDatas.check.count !== 1 ? "s" : ""}, total{" "}
                {transactionDatas.check.amount} €
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
              {transactions.length} transaction
              {transactions.length !== 1 ? "s" : ""} — Total : {totalAmount} €
            </Typography>
          </Box>
        </Stack>
      </Box>
    </>
  );
};
