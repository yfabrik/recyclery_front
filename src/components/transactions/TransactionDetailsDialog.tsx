import { Visibility } from "@mui/icons-material";
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
import { DetailTransaction } from "../DetailTransaction";

interface TransactionDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  transaction: TransactionModel | null;
  categories: CategoryModel[];
}

export const TransactionDetailsDialog = ({
  open,
  onClose,
  transaction,
  categories,
}: TransactionDetailsDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
    <DialogTitle>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Visibility color="primary" />
        <Typography variant="h6">
          Détails de la Transaction #{transaction?.id}
        </Typography>
      </Box>
    </DialogTitle>
    <DialogContent>
      {transaction && (
        <DetailTransaction
          selectedTransaction={transaction}
          categories={categories}
        />
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Fermer</Button>
    </DialogActions>
  </Dialog>
);
