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
    pageStyle: `@page{size:80mm auto}`,
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
        }}
      >
        <Stack>
          <Typography> ADAPEMONT Recyclerie</Typography>
          <Typography>Bilan Caisse: {session.CashRegister?.name}</Typography>
          <Typography> session n°: {session.id}</Typography>

          <Typography sx={{ fontWeight: "bold" }}>
            {" "}
            Ouverture: {new Date(session.createdAt).toLocaleString()}
          </Typography>

          <Typography>
            Fermeture:
            {session.closed_at
              ? new Date(session.closed_at).toLocaleString()
              : "pas fermé" + new Date().toLocaleString() + " ?"}
          </Typography>
          <Typography> fond de caisse :{session.opening_amount} €</Typography>
          <Typography>
            {" "}
            comptage:{session.closing_amount || closingAmount}€
          </Typography>

          <Typography>
            {" "}
            expected:{session.expected_amount || expected_amount}€
          </Typography>
          <Typography>
            {" "}
            difference:{" "}
            {session.difference_amount ||
              expected_amount - (closingAmount || 0)}
            €
          </Typography>

          <Typography>
            {" "}
            {transactionDatas.card.count} reglements par carte, total:{" "}
            {transactionDatas.card.amount}€
          </Typography>

          <Typography>
            {" "}
            {transactionDatas.cash.count} reglements en especes, total:{" "}
            {transactionDatas.cash.amount}€
          </Typography>
          <Typography>
            {" "}
            {transactionDatas.check.count} reglements par cheque, total:{" "}
            {transactionDatas.check.amount}€
          </Typography>
          <Typography>
            {transactions.length} reglements, Total:{" "}
            {transactions.reduce(
              (prev, current) =>
                current.transactionType == "sell"
                  ? (prev += current.total_amount)
                  : (prev -= current.total_amount),
              0,
            )}
            €
          </Typography>
        </Stack>
      </Box>
    </>
  );
};
