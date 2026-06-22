import { Card, Grid, Typography } from "@mui/material";
import type { TransactionModel } from "../../interfaces/Models";
import {
  formatCurrency,
  getTransactionGlobalPromotionDiscount,
  getTransactionSubtotal,
} from "../../services/cartService";
import { useTransactionRefunds } from "../../hooks/useTransactionRefunds";

interface TransactionFinancialSummaryCardProps {
  transaction: TransactionModel;
}

export const TransactionFinancialSummaryCard = ({
  transaction,
}: TransactionFinancialSummaryCardProps) => {
  const { totalRefunded } = useTransactionRefunds(transaction.id);
  const transactionGlobalPromotionDiscount =
    getTransactionGlobalPromotionDiscount(transaction);
  const transactionSubtotal = getTransactionSubtotal(transaction);

  return (
    <Card variant="outlined" sx={{ p: 2, bgcolor: "#e3f2fd" }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Résumé financier
        </Typography>
        <Grid container spacing={2}>
          {transactionGlobalPromotionDiscount > 0 && (
            <>
              <Grid size={{ xs: 4 }}>
                <Typography variant="body2" color="textSecondary">
                  Sous-total:
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(transactionSubtotal)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Typography variant="body2" color="textSecondary">
                  Promotion globale:
                </Typography>
                <Typography variant="h6" color="success.main">
                  -{formatCurrency(transactionGlobalPromotionDiscount)}
                </Typography>
              </Grid>
            </>
          )}
          <Grid size={{ xs: 4 }}>
            <Typography variant="body2" color="textSecondary">
              Montant vendu:
            </Typography>
            <Typography variant="h6" color="success.main">
              {formatCurrency(transaction.total_amount)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Typography variant="body2" color="textSecondary">
              Total remboursé:
            </Typography>
            <Typography variant="h6" color="error">
              -{formatCurrency(totalRefunded)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Typography variant="body2" color="textSecondary">
              Solde restant:
            </Typography>
            <Typography variant="h6" color="primary">
              {formatCurrency(transaction.total_amount - totalRefunded)}
            </Typography>
          </Grid>
        </Grid>
    </Card>
  );
};
