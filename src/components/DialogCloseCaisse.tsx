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
import { formatCurrency, roundCurrency, sumCashInPayments } from "../services/cartService";
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
  const expectedCashAmount = sumCashInPayments(
    transactions.data?.transactions || [],
    currentSession.opening_amount,
  );
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
          Total supposé : {formatCurrency(roundCurrency(expectedCashAmount))}
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
