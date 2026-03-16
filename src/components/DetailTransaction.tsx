import { useQuery } from "@tanstack/react-query";
import type { TransactionModel } from "../interfaces/Models";
import { getRefundForTransaction } from "../services/api/transactions";
import {
  Box,
  Card,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Description } from "@mui/icons-material";
import { formatCurrency, getPaymentMethodLabel } from "../services/cartService";
import { Loading } from "./Loading";

interface DetailTransactionProps {
  selectedTransaction: TransactionModel;
}
export const DetailTransaction = ({
  selectedTransaction,
}: DetailTransactionProps) => {
  const refunds = useQuery({
    queryKey: ["refunds", { id: selectedTransaction.id }],
    queryFn: () =>
      getRefundForTransaction(selectedTransaction.id).then(
        (response) => response.data.refunds,
      ),
    enabled: () => selectedTransaction !== null,
    placeholderData: [],
  });
  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      {/* Informations de la transaction */}
      <Grid size={{ xs: 12 }}>
        <Card variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa" }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            <Description /> Informations de la transaction
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Numéro: <strong>#{selectedTransaction.id}</strong>
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Montant:{" "}
                <strong>
                  {formatCurrency(selectedTransaction.total_amount)}
                </strong>
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Mode de paiement:{" "}
                <strong>
                  {getPaymentMethodLabel(selectedTransaction.payment_method)}
                </strong>
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Date:{" "}
                <strong>
                  {new Date(selectedTransaction.createdAt).toLocaleDateString(
                    "fr-FR",
                  )}
                </strong>
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Heure:{" "}
                <strong>
                  {new Date(selectedTransaction.createdAt).toLocaleTimeString(
                    "fr-FR",
                  )}
                </strong>
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Caissier:{" "}
                <strong>
                  {selectedTransaction.CashSession?.User?.username || "N/A"}
                </strong>
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Magasin:{" "}
                <strong>
                  {selectedTransaction.CashSession?.CashRegister?.Recyclery
                    ?.name || "N/A"}
                </strong>
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Statut:{" "}
                <strong>
                  {selectedTransaction?.refunds && selectedTransaction?.refunds[0].createdAt ? (
                    <Chip label="Remboursé" color="error" size="small" />
                  ) : (
                    <Chip label="Actif" color="success" size="small" />
                  )}
                </strong>
              </Typography>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      {/* Historique des remboursements */}
      <Grid size={{ xs: 12 }}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            💰 Historique des remboursements
          </Typography>
          <Loading isLoading={refunds.isLoading}>
            {refunds.data && refunds.data?.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Montant</TableCell>
                      <TableCell>Raison</TableCell>
                      <TableCell>Mode</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Créé par</TableCell>
                      <TableCell>Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {refunds.data?.map((refund) => (
                      <TableRow key={refund.id}>
                        <TableCell>
                          <Chip
                            label={
                              refund.refund_type === "full"
                                ? "Total"
                                : "Partiel"
                            }
                            color={
                              refund.refund_type === "full"
                                ? "error"
                                : "warning"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="error"
                          >
                            -{formatCurrency(refund.total_amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {refund.refund_reason === "customer_request" &&
                              "Demande client"}
                            {refund.refund_reason === "product_defect" &&
                              "Produit défectueux"}
                            {refund.refund_reason === "wrong_product" &&
                              "Mauvais produit"}
                            {refund.refund_reason === "overcharge" &&
                              "Surcharge"}
                            {refund.refund_reason === "return_policy" &&
                              "Politique de retour"}
                            {refund.refund_reason === "other" && "Autre"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getPaymentMethodLabel(refund.payment_method)}
                            color="info"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(refund.createdAt).toLocaleString("fr-FR")}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {refund.created_by || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              refund.status === "completed"
                                ? "Terminé"
                                : refund.status
                            }
                            color={
                              refund.status === "completed"
                                ? "success"
                                : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
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
      </Grid>

      {/* Résumé financier */}
      <Grid size={{ xs: 12 }}>
        <Card variant="outlined" sx={{ p: 2, bgcolor: "#e3f2fd" }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            💼 Résumé financier
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" color="textSecondary">
                Montant initial:
              </Typography>
              <Typography variant="h6" color="success.main">
                {formatCurrency(selectedTransaction.total_amount)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" color="textSecondary">
                Total remboursé:
              </Typography>
              <Typography variant="h6" color="error">
                -
                {formatCurrency(
                  refunds.data?.reduce(
                    (sum, refund) => sum + refund.total_amount,
                    0,
                  ) || 0,
                )}
              </Typography>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" color="textSecondary">
                Solde restant:
              </Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(
                  selectedTransaction.total_amount -
                    (refunds.data?.reduce(
                      (sum, refund) => sum + refund.total_amount,
                      0,
                    ) || 0),
                )}
              </Typography>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  );
};
