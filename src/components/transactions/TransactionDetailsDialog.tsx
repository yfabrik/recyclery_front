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
import type { CartFormOutput as EditTransactionSchema } from "../../services/schema/cart";
import { TransactionDetailsContent } from "./TransactionDetailsContent";

const EDIT_TRANSACTION_FORM_ID = "editTransactionForm";

interface TransactionDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  /** The transaction in hand. Its full details are loaded by id either way. */
  transaction?: TransactionModel | null;
  /** Loads the transaction from its id alone, when there's none in hand (e.g. a labeled item's `sale_id`). */
  transactionId?: number | null;
  categories: CategoryModel[];
  editable?: boolean;
  onSubmit?: (data: EditTransactionSchema) => void;
}

export const TransactionDetailsDialog = ({
  open,
  onClose,
  transaction = null,
  transactionId = null,
  categories,
  editable = false,
  onSubmit,
}: TransactionDetailsDialogProps) => {
  const id = transaction?.id ?? transactionId;
  const details = useSelectedTransaction(id, open);
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
            {id}
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
