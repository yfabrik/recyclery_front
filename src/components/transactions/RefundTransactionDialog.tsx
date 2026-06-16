import { Undo } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import type { CategoryModel, TransactionModel } from "../../interfaces/Models";
import { useSelectedTransaction } from "../../hooks/useSelectedTransaction";
import { Loading } from "../Loading";
import { RefundForm, type Schema } from "../forms/RefundForm";

interface RefundTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  transaction: TransactionModel | null;
  categories: CategoryModel[];
  onSubmit: (data: Schema) => void;
  formId?: string;
}

export const RefundTransactionDialog = ({
  open,
  onClose,
  transaction,
  categories,
  onSubmit,
  formId = "refundForm",
}: RefundTransactionDialogProps) => {
  const details = useSelectedTransaction(transaction?.id ?? null, open);
  const fullTransaction = details.data ?? transaction;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Undo color="error" />
          <Typography variant="h6">
            Remboursement - Transaction #{transaction?.id}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Loading isLoading={details.isLoading}>
          {fullTransaction && (
            <RefundForm
              formId={formId}
              onSubmit={onSubmit}
              selectedTransaction={fullTransaction}
              categories={categories}
            />
          )}
        </Loading>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          type="submit"
          form={formId}
          variant="contained"
          color="error"
          startIcon={<Undo />}
          disabled={details.isLoading}
        >
          Procéder au remboursement
        </Button>
      </DialogActions>
    </Dialog>
  );
};
