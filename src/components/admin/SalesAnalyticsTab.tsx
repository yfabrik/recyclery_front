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
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  type TypographyOwnProps,
} from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import z from "zod";
import type { TransactionModel } from "../../interfaces/Models";
import { idSchema, nullString } from "../../interfaces/ZodTypes";
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
import { FormDate, FormInput, FormSelect } from "../forms/FormBase";
import { RefundForm, type Schema } from "../forms/RefundForm";
import { Loading } from "../Loading";
import { SalePostalStats } from "../SalePostalStats";
import { TransactionTableLine } from "../TransactionTableLine";

export const SalesAnalyticsTab = () => {
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
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
      stats: {
        total_transactions: 0,
        total_sales: 0,
        total_sales_before_refunds: 0,
        total_refunded: 0,
        average_transaction: 0,
        sessions_count: 0,
        payment_methods: [],
      },
    },
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

  const handlePeriodChange = (period: string) => {
    const today = new Date();
    let date_from, date_to;

    switch (period) {
      case "week":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi
        date_from = startOfWeek.toISOString().split("T")[0];
        date_to = today.toISOString().split("T")[0];
        break;
      case "month":
        date_from = new Date(today.getFullYear(), today.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        date_to = today.toISOString().split("T")[0];
        break;
      default:
        // Garder les dates actuelles pour 'custom'
        return setFilters((prev) => ({ ...prev, period }));
    }

    setFilters((prev) => ({
      ...prev,
      period,
      date_from,
      date_to,
    }));
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

        <Grid container spacing={2} alignItems="center">
          {/* Filtre par magasin */}
          <Grid size={{ xs: 12, md: 3 }}>
            {/* <FormSelect control={filters.control} name="store_id" label="Magasin" >
              <MenuItem key="all-stores" value="">
                Tous les magasins
              </MenuItem>
              {stores.data?.map((store) => (
                <MenuItem key={store.id} value={store.id}>
                  {store.name}
                </MenuItem>
              ))}
            </FormSelect> */}
            <FormControl fullWidth>
              <InputLabel>Magasin</InputLabel>
              <Select
                value={filters.store_id}
                label="Magasin"
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, store_id: e.target.value }))
                }
              >
                <MenuItem key="all-stores" value="">
                  Tous les magasins
                </MenuItem>
                {stores.data?.map((store) => (
                  <MenuItem key={store.id} value={store.id}>
                    {store.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filtre par période */}
          <Grid size={{ xs: 12, md: 3 }}>
            {/* <FormSelect control={filters.control} name="period" label="Période">
              <MenuItem key="week" value="week">
                Cette semaine
              </MenuItem>
              <MenuItem key="month" value="month">
                Ce mois
              </MenuItem>
              <MenuItem key="custom" value="custom">
                Personnalisée
              </MenuItem>
            </FormSelect> */}
            <FormControl fullWidth>
              <InputLabel>Période</InputLabel>
              <Select
                value={filters.period}
                label="Période"
                onChange={(e) => handlePeriodChange(e.target.value)}
              >
                <MenuItem key="week" value="week">
                  Cette semaine
                </MenuItem>
                <MenuItem key="month" value="month">
                  Ce mois
                </MenuItem>
                <MenuItem key="custom" value="custom">
                  Personnalisée
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Dates personnalisées */}
          {filters.period === "custom" && (
            <>
              <Grid size={{ xs: 12, md: 3 }}>
                {/* <FormDate control={filters.control} label="Date de début" name="date_from" /> */}

                <TextField
                  fullWidth
                  label="Date de début"
                  type="date"
                  value={filters.date_from}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      date_from: e.target.value,
                    }))
                  }
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                {/* <FormDate control={filters.control} label="Date de fin" name="date_to" /> */}

                <TextField
                  fullWidth
                  label="Date de fin"
                  type="date"
                  value={filters.date_to}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, date_to: e.target.value }))
                  }
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </>
          )}

          {/* Recherche par numéro de transaction */}
          <Grid size={{ xs: 12, md: 3 }}>
            {/* <FormInput control={filters.control} name="transaction_number" label="N° de transaction" extra={{
              placeholder: "Ex: 20231215-001",
              slotProps: {
                input: {
                  endAdornment:
                    <IconButton
                      size="small"
                      onClick={() =>
                        filters.resetField('transaction_number')
                      }
                      edge="end"
                    >
                      <Clear />
                    </IconButton>
                }
              }
            }} /> */}
            <TextField
              fullWidth
              label="N° de transaction"
              value={filters.transaction_number}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  transaction_number: e.target.value,
                }))
              }
              placeholder="Ex: 20231215-001"
              variant="outlined"
              size="small"
              slotProps={{
                input: {
                  endAdornment: filters.transaction_number && (
                    <IconButton
                      size="small"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          transaction_number: "",
                        }))
                      }
                      edge="end"
                    >
                      <Clear />
                    </IconButton>
                  ),
                },
              }}
            />
          </Grid>

          {/* Bouton pour effacer tous les filtres */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              {/* <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={() => filters.reset()}
              >Effacer tous les filtres</Button> */}
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={() =>
                  setFilters({
                    store_id: "",
                    period: "month",
                    date_from: new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      1,
                    )
                      .toISOString()
                      .split("T")[0],
                    date_to: new Date().toISOString().split("T")[0],
                    transaction_number: "",
                  })
                }
                size="small"
              >
                Effacer tous les filtres
              </Button>
            </Box>
          </Grid>
        </Grid>
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
              {statistics.data?.total_refunded ||
                (0 > 0 && (
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
                ))}
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
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    💳 Répartition par mode de paiement
                  </Typography>
                  {statistics.data?.payment_methods.map((method, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2">
                          {getPaymentMethodLabel(method.payment_method)}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {method.count} (
                          {(
                            (method.count /
                              statistics.data?.total_transactions) *
                            100
                          ).toFixed(1)}
                          %)
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" color="textSecondary">
                          Montant total
                        </Typography>
                        <Typography
                          variant="body2"
                          color="success.main"
                          fontWeight="bold"
                        >
                          {formatCurrency(method.total)}
                        </Typography>
                      </Box>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}

        {/* Statistiques par code postal */}

        <Grid size={{ xs: 12, md: 6 }}>
          <SalePostalStats />
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
                  label={`Filtré par: ${filters.transaction_number} (${
                    transactions.data?.transactions?.length || 0
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

interface CardStatProps {
  value: string;
  text: string;
  color: TypographyOwnProps["color"];
}
const CardStat = ({ value, text, color }: CardStatProps) => {
  return (
    <Card>
      <CardContent sx={{ textAlign: "center" }}>
        <Typography variant="h4" color={color} fontWeight="bold">
          {value}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {text}
        </Typography>
        {statistics.data?.total_refunded ||
          (0 > 0 && (
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
          ))}
      </CardContent>
    </Card>
  );
};

interface FilterFormProps {
  stores: StoreModel[];
}
const FilterForm = ({ stores }: FilterFormProps) => {
  const filterSchema = z.object({
    store_id: [idSchema(), nullString()],
    date_from: z.coerce
      .date()
      .transform((val) => val.toISOString().slice(0, 10)),
    date_to: z.coerce.date().transform((val) => val.toISOString().slice(0, 10)),
    transaction_number: [z.string().trim().nonempty(), nullString()],
  });
  type Filters = z.infer<typeof filterSchema>;

  const filters = useForm({
    defaultValues: {
      store_id: "",
      period: "month", // 'week', 'month', 'custom'
      date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0],
      date_to: new Date().toISOString().split("T")[0],
      transaction_number: "", // Recherche par numéro de transaction
    },
    resolver: zodResolver(filterSchema),
  });
  return (
    <form>
      <Grid container spacing={2} alignItems="center">
        {/* Filtre par magasin */}
        <Grid size={{ xs: 12, md: 3 }}>
          <FormSelect control={filters.control} name="store_id" label="Magasin">
            <MenuItem key="all-stores" value="">
              Tous les magasins
            </MenuItem>
            {stores.map((store) => (
              <MenuItem key={store.id} value={store.id}>
                {store.name}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        {/* Filtre par période */}
        <Grid size={{ xs: 12, md: 3 }}>
          <FormSelect control={filters.control} name="period" label="Période">
            <MenuItem key="week" value="week">
              Cette semaine
            </MenuItem>
            <MenuItem key="month" value="month">
              Ce mois
            </MenuItem>
            <MenuItem key="custom" value="custom">
              Personnalisée
            </MenuItem>
          </FormSelect>
        </Grid>

        {/* Dates personnalisées */}
        {filters.period === "custom" && (
          <>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormDate
                control={filters.control}
                label="Date de début"
                name="date_from"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormDate
                control={filters.control}
                label="Date de fin"
                name="date_to"
              />
            </Grid>
          </>
        )}

        {/* Recherche par numéro de transaction */}
        <Grid size={{ xs: 12, md: 3 }}>
          <FormInput
            control={filters.control}
            name="transaction_number"
            label="N° de transaction"
            extra={{
              placeholder: "Ex: 20231215-001",
              slotProps: {
                input: {
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => filters.resetField("transaction_number")}
                      edge="end"
                    >
                      <Clear />
                    </IconButton>
                  ),
                },
              },
            }}
          />
        </Grid>

        {/* Bouton pour effacer tous les filtres */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={() => filters.reset()}
            >
              Effacer tous les filtres
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};
