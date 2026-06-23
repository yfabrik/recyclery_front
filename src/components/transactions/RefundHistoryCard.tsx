import {
  Box,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { TransactionModel } from "../../interfaces/Models";
import { getPaymentMethodColor, getPaymentMethodLabel } from "../../constants/paymentMethods";
import { getRefundReasonLabel } from "../../constants/refundReasons";
import type { RefundTransaction } from "../../services/api/transactions";
import { formatCurrency, getTransactionStoreName } from "../../services/cartService";
import { useTransactionRefunds } from "../../hooks/useTransactionRefunds";
import { Loading } from "../Loading";

const getRefundType = (
  refund: RefundTransaction,
  parentTotal: number,
  cumulativeRefunded: number,
): "full" | "partial" => {
  if (refund.refund_type) return refund.refund_type;
  if (refund.total_amount >= parentTotal) return "full";
  if (cumulativeRefunded >= parentTotal) return "full";
  return "partial";
};

interface RefundHistoryCardProps {
  transaction: TransactionModel;
}

export const RefundHistoryCard = ({ transaction }: RefundHistoryCardProps) => {
  const { refundsQuery, refunds } = useTransactionRefunds(transaction.id);
  const hasRefunds = refunds.length > 0;

  return (
    <Card variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Historique des remboursements
        </Typography>
        <Loading isLoading={refundsQuery.isLoading}>
          {hasRefunds ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Montant</TableCell>
                    <TableCell>Raison</TableCell>
                    <TableCell>Mode</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Heure</TableCell>
                    <TableCell>Magasin</TableCell>
                    <TableCell>Créé par</TableCell>
                    <TableCell>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {refunds.map((refund, index) => {
                    const cumulativeRefunded = refunds
                      .slice(0, index + 1)
                      .reduce((sum, r) => sum + r.total_amount, 0);
                    const refundType = getRefundType(
                      refund,
                      transaction.total_amount,
                      cumulativeRefunded,
                    );
                    const refundDate = new Date(refund.createdAt);
                    return (
                      <TableRow key={refund.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            #{refund.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={refundType === "full" ? "Total" : "Partiel"}
                            color={refundType === "full" ? "error" : "warning"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" color="error">
                            -{formatCurrency(refund.total_amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {getRefundReasonLabel(refund.refund_reason)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getPaymentMethodLabel(refund.payment_method)}
                            color={getPaymentMethodColor(refund.payment_method)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {refundDate.toLocaleDateString("fr-FR")}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {refundDate.toLocaleTimeString("fr-FR")}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {getTransactionStoreName(refund)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {refund.created_by ||
                              refund.CashSession?.User?.username ||
                              "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={refund.status === "completed" ? "Terminé" : refund.status}
                            color={refund.status === "completed" ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Aucun remboursement pour cette transaction
              </Typography>
            </Box>
          )}
        </Loading>
    </Card>
  );
};
