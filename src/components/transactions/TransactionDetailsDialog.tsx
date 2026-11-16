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

/** Which transaction the dialog shows: exactly one of the two. */
type TransactionSource =
  | {
      /** The transaction in hand. Its full details are loaded by id. */
      transaction: TransactionModel | null;
      transactionId?: never;
    }
  | {
      /** Loads the transaction from its id alone, when there's none in hand (e.g. a labeled item's `sale_id`). */
      transactionId: number | null;
      transaction?: never;
    };

type TransactionDetailsDialogProps = TransactionSource & {
  open: boolean;
  onClose: () => void;
  categories: CategoryModel[];
  editable?: boolean;
  onSubmit?: (data: EditTransactionSchema) => void;
};

export const TransactionDetailsDialog = ({
  open,
  onClose,
  categories,
  editable = false,
  onSubmit,
  ...source
}: TransactionDetailsDialogProps) => {
  const transaction = source.transaction ?? null;
  const id = transaction?.id ?? source.transactionId ?? null;
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
