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
        // payment_method: "cash",
        session: currentSession.id,
      }).then((response) => response.data),
    placeholderData: { success: false, transactions: [] },
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
          
        />
        {state == "valid" && (
          <BilanCaissePrint
            session={currentSession}
            transactions={transactions.data?.transactions || []}
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
