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
import { BilanCaissePrint } from "./BilanCaissePrint";
import { CloseCaisseForm, type Schema } from "./forms/CloseCaisseForm";

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
    queryKey: ["transactions", { session: currentSession.id }],
    queryFn: () =>
      getTransactions({
        session: currentSession.id,
      }).then((response) => response.data),
    placeholderData: {
      success: true as const,
      transactions: [] as TransactionModel[],
      pagination: { limit: 0, offset: 0, total: 0 },
    },
  });
  //Recup total argent transaction type cash and session==sesion
  const [state, setState] = useState<"prepare" | "valid">("prepare");
  const [closingAmount, setClosingAmount] = useState(0);

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
          {transactions.data?.transactions.reduce(
            (prev, current) =>
              current.payment_method == "cash"
                ? (prev += current.total_amount)
                : prev,
            currentSession.opening_amount,
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
          <BilanCaissePrint
            session={currentSession}
            transactions={transactions.data?.transactions || []}
            closingAmount={closingAmount}
          />
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
