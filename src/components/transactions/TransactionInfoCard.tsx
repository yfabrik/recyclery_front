import { Description } from "@mui/icons-material";
import { Card, Chip, Grid, Typography } from "@mui/material";
import type { TransactionModel } from "../../interfaces/Models";
import type { RefundTransaction } from "../../services/api/transactions";
import { getTransactionStoreName } from "../../services/cartService";

interface TransactionInfoCardProps {
  transaction: TransactionModel;
  refunds?: RefundTransaction[];
}

export const TransactionInfoCard = ({
  transaction,
  refunds,
}: TransactionInfoCardProps) => {
  const refundList = refunds ?? transaction.refunds ?? [];
  const totalRefunded = refundList.reduce(
    (sum, refund) => sum + refund.total_amount,
    0,
  );
  const hasRefunds = refundList.length > 0;
  const isFullyRefunded = totalRefunded >= transaction.total_amount;

  return (
    <Card variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa" }}>
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        <Description sx={{ verticalAlign: "middle", mr: 0.5 }} />
        Informations de la transaction
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Typography variant="body2" color="textSecondary">
            Numéro: <strong>#{transaction.id}</strong>
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Typography variant="body2" color="textSecondary">
            Date:{" "}
            <strong>
              {new Date(transaction.createdAt).toLocaleDateString("fr-FR")}
            </strong>
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Typography variant="body2" color="textSecondary">
            Heure:{" "}
            <strong>
              {new Date(transaction.createdAt).toLocaleTimeString("fr-FR")}
            </strong>
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Typography variant="body2" color="textSecondary">
            Magasin: <strong>{getTransactionStoreName(transaction)}</strong>
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Typography variant="body2" color="textSecondary">
            Caissier:{" "}
            <strong>
              {transaction.CashSession?.User?.username || "N/A"}
            </strong>
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Typography variant="body2" color="textSecondary" component="div">
            Statut:{" "}
            {hasRefunds ? (
              <Chip
                label={
                  isFullyRefunded ? "Remboursé" : "Partiellement remboursé"
                }
                color={isFullyRefunded ? "error" : "warning"}
                size="small"
              />
            ) : (
              <Chip label="Actif" color="success" size="small" />
            )}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
};
