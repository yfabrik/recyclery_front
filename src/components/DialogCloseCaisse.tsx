import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { CashSession } from "../interfaces/Models";
import type { TransactionModel } from "../interfaces/Models";
import { getTransactions } from "../services/api/transactions";
import { useBilanCaissePrint } from "./BilanCaissePrint";
import { CloseCaisseForm, type Schema } from "./forms/CloseCaisseForm";
import { formatCurrency, sumCashInPayments } from "../services/cartService";
import { Print } from "@mui/icons-material";

interface DialogCloseCaisseProps {
  closeSessionDialog: boolean;
  setCloseSessionDialog: (value: React.SetStateAction<boolean>) => void;
  currentSession: CashSession;
  handleCloseSession: (d: Schema) => void;
}
export const DialogCloseCaisse = ({
  closeSessionDialog,
  setCloseSessionDialog,
  currentSession,
  handleCloseSession,
}: DialogCloseCaisseProps) => {
  const transactions = useQuery({
    queryKey: ["transactions", { session: currentSession.id, include: ["payments"] }],
    queryFn: () =>
      getTransactions({
        session: currentSession.id,
        include: ["payments"],
      }).then((response) => response.data),
    placeholderData: {
      success: true as const,
      message: "",
      data: [],
      transactions: [] as TransactionModel[],
    },
  });
  //Recup total argent transaction type cash and session==sesion
  const [state, setState] = useState<"prepare" | "valid">("prepare");
  const [closingAmount, setClosingAmount] = useState(0);
  const { triggerPrintBilanCaisse, bilanCaissePrintNode } = useBilanCaissePrint();
  return (
    <Dialog
      open={closeSessionDialog}
      onClose={() => {
        setState("prepare");
        setCloseSessionDialog(false);
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Fermeture de Caisse</DialogTitle>

      <DialogContent>
        <Typography>
          total supposé:{" "}
          {formatCurrency(sumCashInPayments(transactions.data?.transactions || [], currentSession.opening_amount)
            // (transactions.data?.transactions || []).reduce((prev: number, current) => {
            //   // Calculate total cash in payments array, if payments present (i.e. for "mixed" payments)
            //   if (Array.isArray(current.payments) && current.payments.length > 0) {
            //     const totalCashInPayments = current.payments.reduce((p, c) =>
            //       c.method === "cash" ? p + c.amount : p,
            //       0
            //     );
            //     // Only add to prev if actual cash present in payments
            //     if (totalCashInPayments !== 0) {
            //       return prev + totalCashInPayments;
            //     }
            //   }
            //   // Otherwise, if the transaction's payment_method is "cash", add its total_amount
            //   if (current.payment_method === "cash") {
            //     return prev + current.total_amount;
            //   }
            //   // Otherwise, leave accumulator unchanged
            //   return prev;
            // }, currentSession.opening_amount)
          )}
        </Typography>
        {state == "valid" && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Attention: Cette action fermera définitivement votre session de
            caisse.
          </Alert>
        )}
        <CloseCaisseForm
          formId="closeCaisseForm"
          onSubmit={handleCloseSession}
          state={state}
          setState={setState}
          closingAmount={closingAmount}
          setClosingAmount={setClosingAmount}
        />
        {state == "valid" && (
          <>
            <Button
              size="small"
              startIcon={<Print />}
              onClick={() =>
                triggerPrintBilanCaisse({
                  session: currentSession,
                  transactions: transactions.data?.transactions || [],
                  closingAmount,
                })
              }
            >
              Imprimer
            </Button>
            {bilanCaissePrintNode}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCloseSessionDialog(false)}>Annuler</Button>
        {state == "valid" && (
          <Button
            type="submit"
            form="closeCaisseForm"
            variant="contained"
            color="error"
          >
            Fermer la Caisse
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
