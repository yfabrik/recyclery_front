import { Edit, Save, Visibility } from "@mui/icons-material";
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
import type { Schema as EditTransactionSchema } from "../forms/cartSchema";
import { TransactionDetailsContent } from "./TransactionDetailsContent";

const EDIT_TRANSACTION_FORM_ID = "editTransactionForm";

interface TransactionDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  transaction: TransactionModel | null;
  categories: CategoryModel[];
  editable?: boolean;
  onSubmit?: (data: EditTransactionSchema) => void;
}

export const TransactionDetailsDialog = ({
  open,
  onClose,
  transaction,
  categories,
  editable = false,
  onSubmit,
}: TransactionDetailsDialogProps) => {
  const details = useSelectedTransaction(transaction?.id ?? null, open);
  const fullTransaction = details.data ?? transaction;
  const isEditable =
    editable &&
    fullTransaction?.transactionType === "sell" &&
    Boolean(onSubmit);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isEditable ? (
            <Edit color="primary" />
          ) : (
            <Visibility color="primary" />
          )}
          <Typography variant="h6">
            {isEditable ? "Modifier" : "Détails de"} la Transaction #
            {transaction?.id}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Loading isLoading={details.isLoading}>
          {fullTransaction && (
            <TransactionDetailsContent
              key={fullTransaction.id}
              formId={EDIT_TRANSACTION_FORM_ID}
              transaction={fullTransaction}
              categories={categories}
              editable={isEditable}
              onSubmit={onSubmit}
            />
          )}
        </Loading>
      </DialogContent>
      <DialogActions>
        {isEditable && (
          <Button
            type="submit"
            form={EDIT_TRANSACTION_FORM_ID}
            variant="contained"
            color="primary"
            startIcon={<Save />}
            disabled={details.isLoading}
          >
            Enregistrer
          </Button>
        )}
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};
