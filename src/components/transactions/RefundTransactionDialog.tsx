import { Undo } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import type { CategoryModel, TransactionModel } from "../../interfaces/Models";
import { formatCurrency, getPaymentMethodLabel } from "../../services/cartService";
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
}: RefundTransactionDialogProps) => (
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
      {transaction && (
        <>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa" }}>
                <Typography variant="subtitle2" gutterBottom>
                  Informations de la transaction
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="textSecondary">
                      Montant total:{" "}
                      <strong>{formatCurrency(transaction.total_amount)}</strong>
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="textSecondary">
                      Mode de paiement:{" "}
                      <strong>
                        {getPaymentMethodLabel(transaction.payment_method)}
                      </strong>
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="textSecondary">
                      Date:{" "}
                      <strong>
                        {new Date(transaction.createdAt).toLocaleDateString(
                          "fr-FR",
                        )}
                      </strong>
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="textSecondary">
                      Caissier:{" "}
                      <strong>
                        {transaction.CashSession?.User?.username || "N/A"}
                      </strong>
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>

          <RefundForm
            formId={formId}
            onSubmit={onSubmit}
            selectedTransaction={transaction}
            categories={categories}
          />
        </>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Annuler</Button>
      <Button
        type="submit"
        form={formId}
        variant="contained"
        color="error"
        startIcon={<Undo />}
      >
        Procéder au remboursement
      </Button>
    </DialogActions>
  </Dialog>
);
