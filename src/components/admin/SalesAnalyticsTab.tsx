import {
  Assessment,
  Clear,
  Description,
  FilterList,
  Refresh,
  Undo,
  Visibility,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TransactionModel } from "../../interfaces/Models";
import { fetchCategories } from "../../services/api/categories";
import { fetchStores as fStore } from "../../services/api/store";
import {
  createRefund,
  getTransactions,
  getTranscationStats,
} from "../../services/api/transactions";
import {
  formatCurrency,
  getCartLinePrice,
  getPaymentMethodLabel,
} from "../../services/cartService";
import { DetailTransaction } from "../DetailTransaction";
import { RefundForm, type Schema } from "../forms/RefundForm";
import { SaleFiltersForm, type Filters } from "../forms/SaleFiltersForm";
import { Loading } from "../Loading";
import { SalePaymentStats } from "../SalePaymentStats";
import { SalePostalStats } from "../SalePostalStats";
import { TransactionTableLine } from "../TransactionTableLine";

export const SalesAnalyticsTab = () => {
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<Filters>({
    store_id: "",
    period: "month", // 'week', 'month', 'custom'
    date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    date_to: new Date().toISOString().split("T")[0],
    transaction_number: "", // Recherche par numéro de transaction
  });

  // États pour la pop-up de remboursement
  const [refundDialog, setRefundDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionModel | null>(null);

  // États pour la pop-up des détails de transaction
  const [transactionDetailsDialog, setTransactionDetailsDialog] =
    useState(false);

  const queryClient = useQueryClient();

  const stores = useQuery({
    queryKey: ["stores", { active: true }],
    queryFn: () =>
      fStore({ active: true }).then((response) => response.data.stores),
  });
  if (stores.isError) toast.error("Erreur lors du chargement des magasins");

  const transactions = useQuery({
    queryKey: ["transactions", filters, page],
    queryFn: () =>
      getTransactions({
        ...filters,
        store_id: filters.store_id ? +filters.store_id : undefined,
        include: ["refund", "items"],
        page,
      }).then((response) => response.data),
  });
  const statistics = useQuery({
    queryKey: ["transactionsStats", filters],
    queryFn: () =>
      getTranscationStats(filters).then((response) => response.data.stats),
    placeholderData: {
      total_transactions: 0,
      total_sales: 0,
      total_sales_before_refunds: 0,
      total_refunded: 0,
      average_transaction: 0,
      sessions_count: 0,
      payment_methods: [],
      by_day: [],
      by_category: [],
    } as Awaited<
      ReturnType<typeof getTranscationStats>
    >["data"]["stats"],
  });

  const categories = useQuery({
    queryKey: [
      "categories",
      { include: ["category", "promo"], only_category: true, sell: true },
    ],
    queryFn: () =>
      fetchCategories({
        include: ["category", "promo"],
        only_category: true,
        sell: true,
      }).then((response) => response.data.categories),
  });

  const addRefund = useMutation({
    mutationFn: (v: { id: number; data: Schema }) => createRefund(v.id, v.data),
    onSuccess: () => {
      handleCloseRefundDialog();
      toast.success("Remboursement effectué avec succès");
    },
    onError: () => {
      toast.error("Erreur lors du remboursement");
    },
  });

  const handleSubmitRefund = async (data: Schema) => {
    const d = data.cart
      .map((item) => {
        return {
          ...item,
          quantity: item.refundQuantity,
        };
      })
      .filter((i) => i.quantity > 0);
    const refundValue = d.reduce(
      (prev, current) => (prev += getCartLinePrice(current)),
      0,
    );

    addRefund.mutate({
      id: selectedTransaction.id,
      data: { ...data, items: [...d], total_amount: refundValue },
    });
  };


  const handleReprintReceipt = (transactionId: number) => {
    // Fonction pour réimprimer le ticket de caisse
    toast.success(
      `Réimpression du ticket de caisse ${transactionId} en cours...`,
    );
    // Ici on pourrait ajouter la logique d'impression réelle
  };

  const handleRefund = (transaction: TransactionModel) => {
    setSelectedTransaction(transaction);
    setRefundDialog(true);
  };

  const handleCloseRefundDialog = () => {
    setRefundDialog(false);
    setSelectedTransaction(null);
  };

  // Fonction pour ouvrir les détails d'une transaction
  const handleViewTransactionDetails = (transaction: TransactionModel) => {
    setSelectedTransaction(transaction);
    setTransactionDetailsDialog(true);
  };

  // Fonction pour fermer les détails de transaction
  const handleCloseTransactionDetailsDialog = () => {
    setTransactionDetailsDialog(false);
    setSelectedTransaction(null);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          <Assessment /> Suivi des Ventes
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          loading={transactions.isLoading || statistics.isLoading}
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: [
                "transactionsPostalStats",
                "transactions",
                "transactionsStats",
              ],
            })
          }
          sx={{ minWidth: 140 }}
        >
          Actualiser
        </Button>
      </Box>
      {/* Filtres */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <FilterList />
          Filtres
        </Typography>

        <SaleFiltersForm
          stores={stores.data || []}
          defaultValues={filters}
          onChange={(values) =>
            setFilters((prev) => ({
              ...prev,
              ...values,
            }))
          }
        />
      </Paper>
      {/* Statistiques principales */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {statistics.data?.total_transactions || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Transactions totales
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {formatCurrency(statistics.data?.total_sales || 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Chiffre d'affaires net
              </Typography>
              {statistics.data?.total_refunded && (
                  <Box sx={{ mt: 1 }}>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      display="block"
                    >
                      Brut:{" "}
                      {formatCurrency(
                        statistics.data?.total_sales_before_refunds ||
                        statistics.data?.total_sales ||
                        0,
                      )}
                    </Typography>
                    <Typography variant="caption" color="error" display="block">
                      Remboursé: -
                      {formatCurrency(statistics.data?.total_refunded || 0)}
                    </Typography>
                  </Box>
                )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {formatCurrency(statistics.data?.average_transaction || 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Panier moyen
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {statistics.data?.sessions_count || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Sessions de caisse
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Répartition par mode de paiement et codes postaux */}
      <Grid container spacing={3} sx={{ mb: 3 }}>

        {/* Répartition par mode de paiement */}
        {statistics.data?.payment_methods &&
          statistics.data?.payment_methods.length > 0 && (
            <Grid size={{ xs: 12, md: 6 }}>
              <SalePaymentStats filters={filters} statistics={statistics.data} />
            </Grid>
          )}

        {/* Statistiques par code postal */}

        <Grid size={{ xs: 12, md: 6 }}>
          <SalePostalStats filters={filters} />
        </Grid>
      </Grid>
      {/* Liste des transactions */}
      <Card>
        <Loading isLoading={transactions.isLoading}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">
                <Description /> Détail des transactions
              </Typography>
              {filters.transaction_number && (
                <Chip
                  label={`Filtré par: ${filters.transaction_number} (${transactions.data?.transactions?.length || 0
                    } résultat${transactions.data?.transactions?.length || 0 > 1 ? "s" : ""})`}
                  color="primary"
                  variant="outlined"
                  onDelete={() =>
                    setFilters((prev) => ({ ...prev, transaction_number: "" }))
                  }
                  deleteIcon={<Clear />}
                />
              )}
            </Box>

            {!transactions.data?.transactions?.length ||
              transactions.data?.transactions?.length === 0 ? (
              <Alert severity="info">
                Aucune transaction trouvée pour la période sélectionnée.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>N° Transaction</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Magasin</TableCell>
                      <TableCell>Caissier</TableCell>
                      <TableCell>Mode de paiement</TableCell>
                      <TableCell align="right">Montant</TableCell>
                      <TableCell>Remboursements</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.data?.transactions?.map((transaction) => (
                      <TransactionTableLine
                        key={transaction.id}
                        transaction={transaction}
                        handleRefund={handleRefund}
                        handleReprintReceipt={handleReprintReceipt}
                        handleShowDetail={handleViewTransactionDetails}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box sx={{ display: "flex", justifyContent: "center", padding: 1 }}>
              <Pagination
                count={
                  Math.trunc((transactions.data?.pagination?.total || 0) / 50) +
                  1 || 10
                }
                color="primary"
                page={page}
                onChange={(e, val) => setPage(val)}
              />
            </Box>
          </CardContent>
        </Loading>
      </Card>

      {/* Pop-up de remboursement */}
      <Dialog
        open={refundDialog}
        onClose={handleCloseRefundDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Undo color="error" />
            <Typography variant="h6">
              Remboursement - Transaction #{selectedTransaction?.id}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {/* Informations de la transaction */}
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa" }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Informations de la transaction
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="textSecondary">
                          Montant total:{" "}
                          <strong>
                            {formatCurrency(selectedTransaction.total_amount)}
                          </strong>
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="textSecondary">
                          Mode de paiement:{" "}
                          <strong>
                            {getPaymentMethodLabel(
                              selectedTransaction.payment_method,
                            )}
                          </strong>
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="textSecondary">
                          Date:{" "}
                          <strong>
                            {new Date(
                              selectedTransaction.createdAt,
                            ).toLocaleDateString("fr-FR")}
                          </strong>
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2" color="textSecondary">
                          Caissier:{" "}
                          <strong>
                            {selectedTransaction.CashSession?.User?.username ||
                              "N/A"}
                          </strong>
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              </Grid>

              <RefundForm
                formId="refundForm"
                onSubmit={handleSubmitRefund}
                selectedTransaction={selectedTransaction}
                categories={categories.data || []}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRefundDialog}>Annuler</Button>
          <Button
            type="submit"
            form="refundForm"
            variant="contained"
            color="error"
            startIcon={<Undo />}
          >
            Procéder au remboursement
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog des détails de transaction */}
      <Dialog
        open={transactionDetailsDialog}
        onClose={handleCloseTransactionDetailsDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Visibility color="primary" />
            <Typography variant="h6">
              Détails de la Transaction #{selectedTransaction?.id}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <DetailTransaction selectedTransaction={selectedTransaction} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransactionDetailsDialog}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};