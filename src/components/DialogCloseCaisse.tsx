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
import type { ListSalesTransactionsResponse } from "@recyclerie/api/responses/salesTransactions";
import { useBilanCaissePrint } from "./BilanCaissePrint";
import { CloseCaisseForm } from "./forms/CloseCaisseForm";
import { formatCurrency, roundCurrency, sumCashInPayments } from "../services/cartService";
import { Print } from "@mui/icons-material";
import type { CloseCaisseFormOutput } from "../services/schema/caisse";

interface DialogCloseCaisseProps {
  closeSessionDialog: boolean;
  setCloseSessionDialog: (value: React.SetStateAction<boolean>) => void;
  currentSession: CashSession;
  handleCloseSession: (d: CloseCaisseFormOutput) => void;
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
      success: true,
      data: [],
      pagination: {
        total: 0,
        perPage: 50,
        totalPages: 1,
        page: 1,
        hasNext: false,
        hasPrevious: false,
      },
    } satisfies ListSalesTransactionsResponse,
  });
  const [state, setState] = useState<"prepare" | "valid">("prepare");
  const [closingAmount, setClosingAmount] = useState(0);
  const { triggerPrintBilanCaisse, bilanCaissePrintNode } = useBilanCaissePrint();
  const expectedCashAmount = sumCashInPayments(
    transactions.data?.data || [],
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
          expectedAMount={roundCurrency(expectedCashAmount)}
        />
        {state == "valid" && (
          <>
            <Button
              size="small"
              startIcon={<Print />}
              onClick={() =>
                triggerPrintBilanCaisse({
                  session: currentSession,
                  transactions: (transactions.data?.data ?? []).map(
                    (transaction) => ({
                      ...transaction,
                      payments: transaction.payments ?? [],
                    }),
                  ),
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
