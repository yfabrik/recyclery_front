import {
  Add,
  Assessment,
  Backpack,
  Clear,
  Close,
  Description,
  FilterList,
  Loyalty,
  Print,
  Receipt,
  Refresh,
  Remove,
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
  CircularProgress,
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
  Tooltip,
  Typography,
  type TypographyOwnProps,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import type { CategoryModel, TransactionModel } from "../../interfaces/Models";
import { idSchema, nullString } from "../../interfaces/ZodTypes";
import { fetchStores as fStore } from "../../services/api/store";
import {
  createCreditNote,
  createRefund,
  getRefundForTransaction,
  getTransactions,
  getTranscationPostalStats,
  getTranscationStats,
} from "../../services/api/transactions";
import { Loading } from "../Loading";
import { useFieldArray, useForm } from "react-hook-form";
import { FormInput, FormSelect } from "../forms/FormBase";
import { itemSchema, type CartItem } from "../forms/cartSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchCategories } from "../../services/api/categories";

interface refund {
  id?: number;
  refund_type: string;
  refund_amount: string;
  refund_reason: string;
  refund_method: string;
  created_at: Date;
  created_by_name: string;
  status: string;
}
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount || 0);
};

const getPaymentMethodLabel = (method: "cash" | "card" | "check") => {
  const labels = {
    cash: "Espèces",
    card: "Carte bancaire",
    check: "Chèque",
    giftCard:"avoir"
  };
  return labels[method] || method;
};

export const SalesAnalyticsTab = () => {
  const [page, setPage] = useState(1);

  const filterSchema = z.object({
    store_id: [idSchema(), nullString()],
    date_from: z.coerce
      .date()
      .transform((val) => val.toISOString().slice(0, 10)),
    date_to: z.coerce.date().transform((val) => val.toISOString().slice(0, 10)),
    transaction_number: [z.string().trim().nonempty(), nullString()],
  });
  type Filters = z.infer<typeof filterSchema>;

  // const filters = useForm({
  //   defaultValues: {
  //     store_id: "",
  //     period: "month", // 'week', 'month', 'custom'
  //     date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  //       .toISOString()
  //       .split("T")[0],
  //     date_to: new Date().toISOString().split("T")[0],
  //     transaction_number: "", // Recherche par numéro de transaction
  //   },
  //   resolver:zodResolver(filterSchema)
  // })
  // const [salesData, setSalesData] = useState<TransactionModel[]>([]);
  // const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    store_id: "",
    period: "month", // 'week', 'month', 'custom'
    date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    date_to: new Date().toISOString().split("T")[0],
    transaction_number: "", // Recherche par numéro de transaction
  });
  // const [statistics, setStatistics] = useState({
  //   total_transactions: 0,
  //   total_sales: 0,
  //   total_sales_before_refunds: 0,
  //   total_refunded: 0,
  //   average_transaction: 0,
  //   sessions_count: 0,
  //   payment_methods: [],
  // });
  // const [postalCodeStats, setPostalCodeStats] = useState([]);

  // États pour la pop-up de remboursement
  const [refundDialog, setRefundDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionModel | null>(null);
  const [refundForm, setRefundForm] = useState({
    refund_type: "full", // 'full' ou 'partial'
    refund_amount: "",
    refund_reason: "",
    refund_method: "cash", // 'cash', 'card', 'check'
    notes: "",
  });

  // États pour la pop-up des détails de transaction
  const [transactionDetailsDialog, setTransactionDetailsDialog] =
    useState(false);
  const [transactionRefunds, setTransactionRefunds] = useState<refund[]>([]);

  // État pour stocker tous les remboursements des transactions
  const [allTransactionRefunds, setAllTransactionRefunds] = useState({});

  // États pour la pop-up des avoirs
  const [creditNoteDialog, setCreditNoteDialog] = useState(false);
  const [selectedTransactionForCredit, setSelectedTransactionForCredit] =
    useState<TransactionModel | null>(null);
  const [creditNoteForm, setCreditNoteForm] = useState({
    reason: "",
    credit_amount: "",
    notes: "",
  });

  // useEffect(() => {
  //   fetchSalesData();
  // }, [filters]);

  const queryClient = useQueryClient();

  const stores = useQuery({
    queryKey: ["stores", { active: true }],
    queryFn: () =>
      fStore({ active: true }).then((response) => response.data.stores),
  });
  if (stores.isError) toast.error("Erreur lors du chargement des magasins");
  // const fetchStores = async () => {
  //   try {
  //     const response = await fStore({ active: true });

  //     setStores(response.data.stores);
  //   } catch (error) {
  //     console.error("Erreur lors du chargement des magasins:", error);
  //     toast.error("Erreur lors du chargement des magasins");
  //   }
  // };

  // const stats = useQuery({
  //   queryKey:["transactionStats"],
  //   queryFn:()=>{

  //   }
  // })
  const transactions = useQuery({
    queryKey: ["transactions", filters, page],
    queryFn: () =>
      getTransactions({
        ...filters,
        store_id: filters.store_id ? +filters.store_id : undefined,
        page,
      }).then((response) => response.data),
  });
  const statistics = useQuery({
    queryKey: ["transactionsStats", filters],
    queryFn: () =>
      getTranscationStats(filters).then((response) => response.data.stats),
    // placeholderData: {
    //   stats: {
    //     total_transactions: 0,
    //     total_sales: 0,
    //     total_sales_before_refunds: 0,
    //     total_refunded: 0,
    //     average_transaction: 0,
    //     sessions_count: 0,
    //     payment_methods: []
    //   }
    // }
  });
  const postalCodeStats = useQuery({
    queryKey: ["transactionsPostalStats", filters],
    queryFn: () =>
      getTranscationPostalStats(filters).then(
        (response) => response.data.postal_codes,
      ),
  });

  // const fetchSalesData = async () => {
  //   try {
  //     setLoading(true);
  //     // Préparer les paramètres pour l'API (sans transaction_number pour l'instant)
  //     const apiParams = {
  //       store_id: filters.store_id,
  //       period: filters.period,
  //       date_from: filters.date_from,
  //       date_to: filters.date_to,
  //     };

  //     // Récupérer les transactions
  //     const transactionsResponse = await getTransactions(apiParams);
  //     // Récupérer les statistiques
  //     const statsResponse = await getTranscationStats(apiParams);
  //     // Récupérer les statistiques par code postal
  //     const postalResponse = await getTranscationPostalStats(apiParams);

  //     let transactions = transactionsResponse.data.transactions || [];

  //     // Filtrage côté client par numéro de transaction si spécifié
  //     if (filters.transaction_number) {
  //       transactions = transactions.filter(
  //         (transaction: TransactionModel) =>
  //           transaction.id &&
  //           transaction.id.toString().includes(filters.transaction_number),
  //       );
  //     }

  //     setSalesData(transactions);
  //     setStatistics(statsResponse.data.stats || {});
  //     setPostalCodeStats(postalResponse.data.postal_codes || []);

  //     // Récupérer les remboursements pour toutes les transactions
  //     // await fetchAllTransactionRefunds(transactions);
  //   } catch (error) {
  //     console.error("Erreur lors du chargement des données de vente:", error);
  //     toast.error("Erreur lors du chargement des données");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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



  // Fonctions de gestion des actions
  const handleCreditNote = (transaction: TransactionModel) => {
    setSelectedTransactionForCredit(transaction);
    setCreditNoteForm({
      reason: "",
      credit_amount: transaction.total_amount.toString(),
      notes: "",
    });
    setCreditNoteDialog(true);
  };

  const handleReprintReceipt = (transactionId: number) => {
    // Fonction pour réimprimer le ticket de caisse
    toast.success(
      `Réimpression du ticket de caisse ${transactionId} en cours...`,
    );
    // Ici on pourrait ajouter la logique d'impression réelle
  };

  const handleRefund = (transaction: TransactionModel) => {
    // Ouvrir la pop-up de remboursement avec les données de la transaction
    setSelectedTransaction(transaction);
    console.log(transaction)
    setRefundForm({
      refund_type: "full",
      refund_amount: transaction.total_amount.toString(),
      refund_reason: "",
      refund_method: transaction.payment_method || "cash",
      notes: "",
    });
    setRefundDialog(true);
  };

  const handleRefundFormChange = (field, value) => {
    setRefundForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Si le type de remboursement change vers "total", remettre le montant total
    if (field === "refund_type" && value === "full" && selectedTransaction) {
      setRefundForm((prev) => ({
        ...prev,
        refund_amount: selectedTransaction.total_amount.toString(),
      }));
    }
  };

  const handleProcessRefund = async () => {
    if (!refundForm.refund_reason) {
      toast.error("Veuillez sélectionner une raison de remboursement");
      return;
    }

    if (
      refundForm.refund_type === "partial" &&
      (!refundForm.refund_amount || parseFloat(refundForm.refund_amount) <= 0)
    ) {
      toast.error("Veuillez saisir un montant de remboursement valide");
      return;
    }

    try {
      const refundData = {
        transaction_id: selectedTransaction.id,
        refund_type: refundForm.refund_type,
        refund_amount:
          refundForm.refund_type === "full"
            ? selectedTransaction.total_amount
            : parseFloat(refundForm.refund_amount),
        refund_reason: refundForm.refund_reason,
        refund_method: refundForm.refund_method,
        notes: refundForm.notes,
      };

      await createRefund(refundData);

      toast.success("Remboursement effectué avec succès");
      setRefundDialog(false);
      setSelectedTransaction(null);
      // fetchSalesData(); // Recharger les données
    } catch (error) {
      console.error("Erreur lors du remboursement:", error);
      toast.error("Erreur lors du remboursement");
    }
  };

  const handleCloseRefundDialog = () => {
    setRefundDialog(false);
    setSelectedTransaction(null);
    setRefundForm({
      refund_type: "full",
      refund_amount: "",
      refund_reason: "",
      refund_method: "cash",
      notes: "",
    });
  };

  // Fonction pour ouvrir les détails d'une transaction
  const handleViewTransactionDetails = async (
    transaction: TransactionModel,
  ) => {
    setSelectedTransaction(transaction);
    setTransactionDetailsDialog(true);
    // await fetchTransactionRefunds(transaction.id);
  };

  // Fonction pour récupérer les remboursements d'une transaction
  // const fetchTransactionRefunds = async (transactionId: number) => {
  //   try {
  //     setLoadingRefunds(true);

  //     const response = await getRefundForTransaction(transactionId);
  //     if (response.data.success) {
  //       setTransactionRefunds(response.data.refunds || []);
  //     }
  //   } catch (error) {
  //     console.error("Erreur lors du chargement des remboursements:", error);
  //     setTransactionRefunds([]);
  //   } finally {
  //     setLoadingRefunds(false);
  //   }
  // };

  // Fonction pour fermer les détails de transaction
  const handleCloseTransactionDetailsDialog = () => {
    setTransactionDetailsDialog(false);
    setSelectedTransaction(null);
    setTransactionRefunds([]);
  };

  // Fonctions pour la pop-up des avoirs
  const handleCreditNoteFormChange = (field, value) => {
    setCreditNoteForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProcessCreditNote = async () => {
    if (!creditNoteForm.reason || !creditNoteForm.credit_amount) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (parseFloat(creditNoteForm.credit_amount) <= 0) {
      toast.error("Le montant de l'avoir doit être positif");
      return;
    }

    try {
      const creditNoteData = {
        transaction_id: selectedTransactionForCredit.id,
        reason: creditNoteForm.reason,
        credit_amount: parseFloat(creditNoteForm.credit_amount),
        notes: creditNoteForm.notes,
      };

      await createCreditNote(creditNoteData);

      toast.success("Avoir créé avec succès");
      setCreditNoteDialog(false);
      setSelectedTransactionForCredit(null);
      // fetchSalesData(); // Recharger les données
    } catch (error) {
      console.error("Erreur lors de la création de l'avoir:", error);
      toast.error("Erreur lors de la création de l'avoir");
    }
  };

  const handleCloseCreditNoteDialog = () => {
    setCreditNoteDialog(false);
    setSelectedTransactionForCredit(null);
    setCreditNoteForm({
      reason: "",
      credit_amount: "",
      notes: "",
    });
  };

  // Fonction pour récupérer tous les remboursements des transactions
  // const fetchAllTransactionRefunds = async (transactions) => {
  //   try {
  //     const refundsPromises = transactions.map(async (transaction) => {
  //       try {
  //         const response = await getRefundForTransaction(transaction.id);

  //         return {
  //           transactionId: transaction.id,
  //           refunds: response.data.success ? response.data.refunds : [],
  //         };
  //       } catch (error) {
  //         console.error(
  //           `Erreur récupération remboursements transaction ${transaction.id}:`,
  //           error,
  //         );
  //         return {
  //           transactionId: transaction.id,
  //           refunds: [],
  //         };
  //       }
  //     });

  //     const refundsResults = await Promise.all(refundsPromises);
  //     const refundsMap = {};
  //     refundsResults.forEach((result) => {
  //       refundsMap[result.transactionId] = result.refunds;
  //     });

  //     setAllTransactionRefunds(refundsMap);
  //   } catch (error) {
  //     console.error("Erreur lors du chargement des remboursements:", error);
  //   }
  // };

  // if (
  //   transactions.isLoading ||
  //   statistics.isLoading ||
  //   postalCodeStats.isLoading
  // ) {
  //   return (
  //     <Box
  //       sx={{
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         minHeight: 400,
  //       }}
  //     >
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

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
          loading={transactions.isLoading ||
            statistics.isLoading ||
            postalCodeStats.isLoading}
          onClick={() => queryClient.invalidateQueries({
            queryKey: ["transactionsPostalStats", "transactions", "transactionsStats"]
          })}
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
        {postalCodeStats.data && postalCodeStats.data.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📍 Top des codes postaux
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 2 }}
                >
                  Les 10 codes postaux générant le plus de chiffre d'affaires
                </Typography>
                {postalCodeStats.data?.slice(0, 10).map((postal, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        📮 {postal.customer_postal_code}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="success.main"
                        fontWeight="bold"
                      >
                        {formatCurrency(postal.total_sales)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        {postal.transaction_count} transaction
                        {postal.transaction_count > 1 ? "s" : ""}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Panier moyen:{" "}
                        {formatCurrency(postal.average_transaction)}
                      </Typography>
                    </Box>
                    {index < postalCodeStats.data?.slice(0, 10).length - 1 && (
                      <Divider sx={{ mt: 1 }} />
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        )}
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
              <Typography variant="h6"><Description /> Détail des transactions</Typography>
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
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {transaction.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </TableCell>
                        <TableCell>
                          {transaction?.CashSession?.CashRegister?.Recyclery
                            .name || "N/A"}
                        </TableCell>
                        <TableCell>
                          {transaction?.CashSession?.User?.username || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getPaymentMethodLabel(
                              transaction.payment_method,
                            )}
                            size="small"
                            color={
                              transaction.payment_method === "cash"
                                ? "success"
                                : "primary"
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color="success.main"
                          >
                            {formatCurrency(transaction.total_amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const refunds =
                              allTransactionRefunds[transaction.id] || [];
                            if (refunds.length === 0) {
                              return (
                                <Typography variant="body2" color="textSecondary">
                                  Aucun
                                </Typography>
                              );
                            }

                            const totalRefunded = refunds.reduce(
                              (sum, refund) =>
                                sum + parseFloat(refund.refund_amount),
                              0,
                            );
                            const isFullRefund = refunds.some(
                              (refund) => refund.refund_type === "full",
                            );
                            const hasCreditNote = refunds.some(
                              (refund) => refund.refund_type === "credit_note",
                            );

                            return (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 0.5,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  color="error"
                                  fontWeight="bold"
                                >
                                  -{formatCurrency(totalRefunded)}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 0.5,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {refunds.map((refund, index) => (
                                    <Chip
                                      key={refund.id}
                                      label={
                                        refund.refund_type === "full"
                                          ? "Total"
                                          : refund.refund_type === "partial"
                                            ? "Partiel"
                                            : refund.refund_type === "credit_note"
                                              ? "Avoir"
                                              : refund.refund_type
                                      }
                                      size="small"
                                      color={
                                        refund.refund_type === "full"
                                          ? "error"
                                          : refund.refund_type === "partial"
                                            ? "warning"
                                            : refund.refund_type === "credit_note"
                                              ? "info"
                                              : "default"
                                      }
                                      variant="outlined"
                                    />
                                  ))}
                                </Box>
                                {isFullRefund && (
                                  <Chip
                                    label="Remboursé"
                                    size="small"
                                    color="error"
                                    variant="filled"
                                  />
                                )}
                                {hasCreditNote && (
                                  <Chip
                                    label="Avoir"
                                    size="small"
                                    color="info"
                                    variant="filled"
                                  />
                                )}
                              </Box>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="Voir les détails">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                  handleViewTransactionDetails(transaction)
                                }
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Créer un avoir">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleCreditNote(transaction)}
                              >
                                <Receipt />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Réimprimer le ticket">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() =>
                                  handleReprintReceipt(transaction.id)
                                }
                              >
                                <Print />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Remboursement">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRefund(transaction)}
                              >
                                <Undo />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
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
            <RefundForm selectedTransaction={selectedTransaction} />

            // <Grid container spacing={3} sx={{ mt: 1 }}>
            //   {/* Informations de la transaction */}
            //   <Grid size={{ xs: 12 }}>
            //     <Card variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa" }}>
            //       <Typography variant="subtitle2" gutterBottom>
            //         Informations de la transaction
            //       </Typography>
            //       <Grid container spacing={2}>
            //         <Grid size={{ xs: 6 }}>
            //           <Typography variant="body2" color="textSecondary">
            //             Montant total:{" "}
            //             <strong>
            //               {formatCurrency(selectedTransaction.total_amount)}
            //             </strong>
            //           </Typography>
            //         </Grid>
            //         <Grid size={{ xs: 6 }}>
            //           <Typography variant="body2" color="textSecondary">
            //             Mode de paiement:{" "}
            //             <strong>
            //               {getPaymentMethodLabel(
            //                 selectedTransaction.payment_method,
            //               )}
            //             </strong>
            //           </Typography>
            //         </Grid>
            //         <Grid size={{ xs: 6 }}>
            //           <Typography variant="body2" color="textSecondary">
            //             Date:{" "}
            //             <strong>
            //               {new Date(
            //                 selectedTransaction.createdAt,
            //               ).toLocaleDateString("fr-FR")}
            //             </strong>
            //           </Typography>
            //         </Grid>
            //         <Grid size={{ xs: 6 }}>
            //           <Typography variant="body2" color="textSecondary">
            //             Caissier:{" "}
            //             <strong>
            //               {selectedTransaction.CashSession?.User?.username ||
            //                 "N/A"}
            //             </strong>
            //           </Typography>
            //         </Grid>
            //       </Grid>
            //     </Card>
            //   </Grid>

            //   {/* TODO need list des items with checkbox to select witch one to refunds + 1 checkbox on top to select all 
            //   refund_method need "giftCard"?
            //   */}
            //   {/* Type de remboursement */}
            //   {selectedTransaction.items?.map(item =>
            //   (
            //     <Card>
            //       <CardContent>
            //         <Typography>barcode:{item.barcode}</Typography>
            //         <Typography>cat:{item.category_id}</Typography>
            //         <Typography>{item.price}€</Typography>
            //         <Typography>{item.weight}kg</Typography>
            //         <Typography>{item.TransactionItem.quantity}</Typography>
            //         <Typography>{item.TransactionItem.price}</Typography>

            //       </CardContent>
            //     </Card>
            //   )
            //   )
            //   }
            //   <Grid size={{ xs: 12 }}>
            //     <FormControl fullWidth>
            //       <InputLabel>Type de remboursement</InputLabel>
            //       <Select
            //         value={refundForm.refund_type}
            //         label="Type de remboursement"
            //         onChange={(e) =>
            //           handleRefundFormChange("refund_type", e.target.value)
            //         }
            //       >
            //         <MenuItem value="full">Remboursement total</MenuItem>
            //         <MenuItem value="partial">Remboursement partiel</MenuItem>
            //       </Select>
            //     </FormControl>
            //   </Grid>

            //   {/* Montant du remboursement */}
            //   {refundForm.refund_type === "partial" && (
            //     <Grid size={{ xs: 12 }}>
            //       <TextField
            //         fullWidth
            //         type="number"
            //         label="Montant du remboursement (€)"
            //         value={refundForm.refund_amount}
            //         onChange={(e) =>
            //           handleRefundFormChange("refund_amount", e.target.value)
            //         }
            //         helperText={`Maximum: ${formatCurrency(
            //           selectedTransaction.total_amount,
            //         )}`}
            //         slotProps={{
            //           htmlInput: {
            //             min: 0.01,
            //             max: selectedTransaction.total_amount,
            //             step: 0.01,
            //           },
            //         }}
            //       />
            //     </Grid>
            //   )}

            //   {/* Raison du remboursement */}
            //   <Grid size={{ xs: 12 }}>
            //     <FormControl fullWidth>
            //       <InputLabel>Raison du remboursement</InputLabel>
            //       <Select
            //         value={refundForm.refund_reason}
            //         label="Raison du remboursement"
            //         onChange={(e) =>
            //           handleRefundFormChange("refund_reason", e.target.value)
            //         }
            //       >
            //         <MenuItem value="customer_request">Demande client</MenuItem>
            //         <MenuItem value="product_defect">
            //           Produit défectueux
            //         </MenuItem>
            //         <MenuItem value="wrong_product">Mauvais produit</MenuItem>
            //         <MenuItem value="overcharge">Surcharge</MenuItem>
            //         <MenuItem value="return_policy">
            //           Politique de retour
            //         </MenuItem>
            //         <MenuItem value="other">Autre</MenuItem>
            //       </Select>
            //     </FormControl>
            //   </Grid>

            //   {/* Mode de remboursement */}
            //   <Grid size={{ xs: 12, md: 6 }}>
            //     <FormControl fullWidth>
            //       <InputLabel>Mode de remboursement</InputLabel>
            //       <Select
            //         value={refundForm.refund_method}
            //         label="Mode de remboursement"
            //         onChange={(e) =>
            //           handleRefundFormChange("refund_method", e.target.value)
            //         }
            //       >
            //         <MenuItem value="cash">Espèces</MenuItem>
            //         <MenuItem value="card">Carte bancaire</MenuItem>
            //         <MenuItem value="check">Chèque</MenuItem>
            //       </Select>
            //     </FormControl>
            //   </Grid>

            //   {/* Notes */}
            //   <Grid size={{ xs: 12 }}>
            //     <TextField
            //       fullWidth
            //       multiline
            //       rows={3}
            //       label="Notes (optionnel)"
            //       value={refundForm.notes}
            //       onChange={(e) =>
            //         handleRefundFormChange("notes", e.target.value)
            //       }
            //       placeholder="Informations supplémentaires..."
            //     />
            //   </Grid>

            //   {/* Résumé du remboursement */}
            //   <Grid size={{ xs: 12 }}>
            //     <Card variant="outlined" sx={{ p: 2, bgcolor: "#e3f2fd" }}>
            //       <Typography variant="subtitle2" gutterBottom>
            //         Résumé du remboursement
            //       </Typography>
            //       <Typography variant="body2">
            //         Montant à rembourser:{" "}
            //         <strong>
            //           {formatCurrency(
            //             refundForm.refund_type === "full"
            //               ? selectedTransaction.total_amount
            //               : parseFloat(refundForm.refund_amount || 0),
            //           )}
            //         </strong>
            //       </Typography>
            //       <Typography variant="body2" color="textSecondary">
            //         Mode de remboursement:{" "}
            //         <strong>
            //           {getPaymentMethodLabel(refundForm.refund_method)}
            //         </strong>
            //       </Typography>
            //     </Card>
            //   </Grid>
            // </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRefundDialog}>Annuler</Button>
          <Button
            onClick={handleProcessRefund}
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
            // <Grid container spacing={3} sx={{ mt: 1 }}>
            //   {/* Informations de la transaction */}
            //   <Grid size={{ xs: 12 }}>
            //     <Card variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa" }}>
            //       <Typography
            //         variant="subtitle1"
            //         gutterBottom
            //         fontWeight="bold"
            //       >
            //         📋 Informations de la transaction
            //       </Typography>
            //       <Grid container spacing={2}>
            //         <Grid size={{ xs: 6, md: 3 }}>
            //           <Typography variant="body2" color="textSecondary">
            //             Numéro: <strong>#{selectedTransaction.id}</strong>
            //           </Typography>
            //         </Grid>
            //         <Grid size={{ xs: 6, md: 3 }}>
            //           <Typography variant="body2" color="textSecondary">
            //             Montant:{" "}
            //             <strong>
            //               {formatCurrency(selectedTransaction.total_amount)}
            //             </strong>
            //           </Typography>
            //         </Grid>
            //         <Grid size={{ xs: 6, md: 3 }}>
            //           <Typography variant="body2" color="textSecondary">
            //             Mode de paiement:{" "}
            //             <strong>
            //               {getPaymentMethodLabel(
            //                 selectedTransaction.payment_method,
            //               )}
            //             </strong>
            //           </Typography>
            //         </Grid>
            //         <Grid size={{ xs: 6, md: 3 }}>
            //           <Typography variant="body2" color="textSecondary">
            //             Date:{" "}
            //             <strong>
            //               {new Date(
            //                 selectedTransaction.createdAt,
            //               ).toLocaleDateString("fr-FR")}
            //             </strong>
            //           </Typography>
            //         </Grid>
            //         <Grid size={{ xs: 6, md: 3 }}>
            //           <Typography variant="body2" color="textSecondary">
            //             Heure:{" "}
            //             <strong>
            //               {new Date(
            //                 selectedTransaction.createdAt,
            //               ).toLocaleTimeString("fr-FR")}
            //             </strong>
            //           </Typography>
            //         </Grid>
            //         <Grid size={{ xs: 6, md: 3 }}>
            //           <Typography variant="body2" color="textSecondary">
            //             Caissier:{" "}
            //             <strong>
            //               {selectedTransaction.CashSession?.User?.username ||
            //                 "N/A"}
            //             </strong>
            //           </Typography>
            //         </Grid>
            //         <Grid size={{ xs: 6, md: 3 }}>
            //           <Typography variant="body2" color="textSecondary">
            //             Magasin:{" "}
            //             <strong>
            //               {selectedTransaction.CashSession?.CashRegister
            //                 ?.Recyclery?.name || "N/A"}
            //             </strong>
            //           </Typography>
            //         </Grid>
            //         <Grid size={{ xs: 6, md: 3 }}>
            //           <Typography variant="body2" color="textSecondary">
            //             Statut:{" "}
            //             <strong>
            //               {selectedTransaction.refunded_at ? (
            //                 <Chip
            //                   label="Remboursé"
            //                   color="error"
            //                   size="small"
            //                 />
            //               ) : (
            //                 <Chip label="Actif" color="success" size="small" />
            //               )}
            //             </strong>
            //           </Typography>
            //         </Grid>
            //       </Grid>
            //     </Card>
            //   </Grid>

            //   {/* Historique des remboursements */}
            //   <Grid size={{ xs: 12 }}>
            //     <Card variant="outlined" sx={{ p: 2 }}>
            //       <Typography
            //         variant="subtitle1"
            //         gutterBottom
            //         fontWeight="bold"
            //       >
            //         💰 Historique des remboursements
            //       </Typography>

            //       {loadingRefunds ? (
            //         <Box
            //           sx={{ display: "flex", justifyContent: "center", py: 3 }}
            //         >
            //           <CircularProgress />
            //         </Box>
            //       ) : transactionRefunds.length > 0 ? (
            //         <TableContainer>
            //           <Table size="small">
            //             <TableHead>
            //               <TableRow>
            //                 <TableCell>Type</TableCell>
            //                 <TableCell>Montant</TableCell>
            //                 <TableCell>Raison</TableCell>
            //                 <TableCell>Mode</TableCell>
            //                 <TableCell>Date</TableCell>
            //                 <TableCell>Créé par</TableCell>
            //                 <TableCell>Statut</TableCell>
            //               </TableRow>
            //             </TableHead>
            //             <TableBody>
            //               {transactionRefunds.map((refund) => (
            //                 <TableRow key={refund.id}>
            //                   <TableCell>
            //                     <Chip
            //                       label={
            //                         refund.refund_type === "full"
            //                           ? "Total"
            //                           : "Partiel"
            //                       }
            //                       color={
            //                         refund.refund_type === "full"
            //                           ? "error"
            //                           : "warning"
            //                       }
            //                       size="small"
            //                     />
            //                   </TableCell>
            //                   <TableCell>
            //                     <Typography
            //                       variant="body2"
            //                       fontWeight="bold"
            //                       color="error"
            //                     >
            //                       -{formatCurrency(refund.refund_amount)}
            //                     </Typography>
            //                   </TableCell>
            //                   <TableCell>
            //                     <Typography variant="body2">
            //                       {refund.refund_reason ===
            //                         "customer_request" && "Demande client"}
            //                       {refund.refund_reason === "product_defect" &&
            //                         "Produit défectueux"}
            //                       {refund.refund_reason === "wrong_product" &&
            //                         "Mauvais produit"}
            //                       {refund.refund_reason === "overcharge" &&
            //                         "Surcharge"}
            //                       {refund.refund_reason === "return_policy" &&
            //                         "Politique de retour"}
            //                       {refund.refund_reason === "other" && "Autre"}
            //                     </Typography>
            //                   </TableCell>
            //                   <TableCell>
            //                     <Chip
            //                       label={getPaymentMethodLabel(
            //                         refund.refund_method,
            //                       )}
            //                       color="info"
            //                       size="small"
            //                     />
            //                   </TableCell>
            //                   <TableCell>
            //                     <Typography variant="body2">
            //                       {new Date(refund.created_at).toLocaleString(
            //                         "fr-FR",
            //                       )}
            //                     </Typography>
            //                   </TableCell>
            //                   <TableCell>
            //                     <Typography variant="body2">
            //                       {refund.created_by_name || "N/A"}
            //                     </Typography>
            //                   </TableCell>
            //                   <TableCell>
            //                     <Chip
            //                       label={
            //                         refund.status === "completed"
            //                           ? "Terminé"
            //                           : refund.status
            //                       }
            //                       color={
            //                         refund.status === "completed"
            //                           ? "success"
            //                           : "default"
            //                       }
            //                       size="small"
            //                     />
            //                   </TableCell>
            //                 </TableRow>
            //               ))}
            //             </TableBody>
            //           </Table>
            //         </TableContainer>
            //       ) : (
            //         <Box sx={{ textAlign: "center", py: 3 }}>
            //           <Typography variant="body2" color="textSecondary">
            //             Aucun remboursement pour cette transaction
            //           </Typography>
            //         </Box>
            //       )}
            //     </Card>
            //   </Grid>

            //   {/* Résumé financier */}
            //   <Grid size={{ xs: 12 }}>
            //     <Card variant="outlined" sx={{ p: 2, bgcolor: "#e3f2fd" }}>
            //       <Typography
            //         variant="subtitle1"
            //         gutterBottom
            //         fontWeight="bold"
            //       >
            //         💼 Résumé financier
            //       </Typography>
            //       <Grid container spacing={2}>
            //         <Grid size={{ xs: 4 }}>
            //           <Typography variant="body2" color="textSecondary">
            //             Montant initial:
            //           </Typography>
            //           <Typography variant="h6" color="success.main">
            //             {formatCurrency(selectedTransaction.total_amount)}
            //           </Typography>
            //         </Grid>
            //         <Grid size={{ xs: 4 }}>
            //           <Typography variant="body2" color="textSecondary">
            //             Total remboursé:
            //           </Typography>
            //           <Typography variant="h6" color="error">
            //             -
            //             {formatCurrency(
            //               transactionRefunds.reduce(
            //                 (sum, refund) =>
            //                   sum + parseFloat(refund.refund_amount),
            //                 0,
            //               ),
            //             )}
            //           </Typography>
            //         </Grid>
            //         <Grid size={{ xs: 4 }}>
            //           <Typography variant="body2" color="textSecondary">
            //             Solde restant:
            //           </Typography>
            //           <Typography variant="h6" color="primary">
            //             {formatCurrency(
            //               selectedTransaction.total_amount -
            //               transactionRefunds.reduce(
            //                 (sum, refund) =>
            //                   sum + parseFloat(refund.refund_amount),
            //                 0,
            //               ),
            //             )}
            //           </Typography>
            //         </Grid>
            //       </Grid>
            //     </Card>
            //   </Grid>
            // </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransactionDetailsDialog}>Fermer</Button>
        </DialogActions>
      </Dialog>
      {/* Dialog de création d'avoir */}
      <Dialog
        open={creditNoteDialog}
        onClose={handleCloseCreditNoteDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Receipt color="warning" />
            <Typography variant="h6">
              Créer un avoir - Transaction #{selectedTransactionForCredit?.id}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTransactionForCredit && (
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
                          {formatCurrency(
                            selectedTransactionForCredit.total_amount,
                          )}
                        </strong>
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="textSecondary">
                        Mode de paiement:{" "}
                        <strong>
                          {getPaymentMethodLabel(
                            selectedTransactionForCredit.payment_method,
                          )}
                        </strong>
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="textSecondary">
                        Date:{" "}
                        <strong>
                          {new Date(
                            selectedTransactionForCredit.createdAt,
                          ).toLocaleDateString("fr-FR")}
                        </strong>
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="textSecondary">
                        Caissier:{" "}
                        <strong>
                          {selectedTransactionForCredit.CashSession?.User
                            ?.username || "N/A"}
                        </strong>
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              {/* Raison de l'avoir */}
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Raison de l'avoir</InputLabel>
                  <Select
                    value={creditNoteForm.reason}
                    label="Raison de l'avoir"
                    onChange={(e) =>
                      handleCreditNoteFormChange("reason", e.target.value)
                    }
                  >
                    <MenuItem value="customer_request">Demande client</MenuItem>
                    <MenuItem value="product_defect">
                      Produit défectueux
                    </MenuItem>
                    <MenuItem value="wrong_product">Mauvais produit</MenuItem>
                    <MenuItem value="overcharge">Surcharge</MenuItem>
                    <MenuItem value="return_policy">
                      Politique de retour
                    </MenuItem>
                    <MenuItem value="price_error">Erreur de prix</MenuItem>
                    <MenuItem value="other">Autre</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Montant de l'avoir */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Montant de l'avoir (€)"
                  value={creditNoteForm.credit_amount}
                  onChange={(e) =>
                    handleCreditNoteFormChange("credit_amount", e.target.value)
                  }
                  helperText={`Maximum: ${formatCurrency(
                    selectedTransactionForCredit.total_amount,
                  )}`}
                  slotProps={{
                    htmlInput: {
                      min: 0.01,
                      max: selectedTransactionForCredit.total_amount,
                      step: 0.01,
                    },
                  }}
                />
              </Grid>

              {/* Notes */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes (optionnel)"
                  value={creditNoteForm.notes}
                  onChange={(e) =>
                    handleCreditNoteFormChange("notes", e.target.value)
                  }
                  placeholder="Informations supplémentaires sur cet avoir..."
                />
              </Grid>

              {/* Résumé de l'avoir */}
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: "#fff3e0" }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Résumé de l'avoir
                  </Typography>
                  <Typography variant="body2">
                    Montant de l'avoir:{" "}
                    <strong>
                      {formatCurrency(creditNoteForm.credit_amount || 0)}
                    </strong>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Raison:{" "}
                    <strong>
                      {creditNoteForm.reason === "customer_request" &&
                        "Demande client"}
                      {creditNoteForm.reason === "product_defect" &&
                        "Produit défectueux"}
                      {creditNoteForm.reason === "wrong_product" &&
                        "Mauvais produit"}
                      {creditNoteForm.reason === "overcharge" && "Surcharge"}
                      {creditNoteForm.reason === "return_policy" &&
                        "Politique de retour"}
                      {creditNoteForm.reason === "price_error" &&
                        "Erreur de prix"}
                      {creditNoteForm.reason === "other" && "Autre"}
                      {!creditNoteForm.reason && "Non spécifiée"}
                    </strong>
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreditNoteDialog}>Annuler</Button>
          <Button
            onClick={handleProcessCreditNote}
            variant="contained"
            color="warning"
            startIcon={<Receipt />}
            disabled={!creditNoteForm.reason || !creditNoteForm.credit_amount}
          >
            Créer l'avoir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


interface CardStatProps {
  value: string
  text: string
  color: TypographyOwnProps["color"]
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
  )
}

interface DetailTransactionProps {
  selectedTransaction: TransactionModel
}
const DetailTransaction = ({ selectedTransaction }: DetailTransactionProps) => {

  const refunds = useQuery({
    queryKey: ["refunds", { id: selectedTransaction.id }],
    queryFn: () => getRefundForTransaction(selectedTransaction.id).then(response => response.data.refunds),
    enabled: () => selectedTransaction !== null,
    placeholderData: []
  })
  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      {/* Informations de la transaction */}
      <Grid size={{ xs: 12 }}>
        <Card variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa" }}>
          <Typography
            variant="subtitle1"
            gutterBottom
            fontWeight="bold"
          >
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
                  {getPaymentMethodLabel(
                    selectedTransaction.payment_method,
                  )}
                </strong>
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Date:{" "}
                <strong>
                  {new Date(
                    selectedTransaction.createdAt,
                  ).toLocaleDateString("fr-FR")}
                </strong>
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Heure:{" "}
                <strong>
                  {new Date(
                    selectedTransaction.createdAt,
                  ).toLocaleTimeString("fr-FR")}
                </strong>
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Caissier:{" "}
                <strong>
                  {selectedTransaction.CashSession?.User?.username ||
                    "N/A"}
                </strong>
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Magasin:{" "}
                <strong>
                  {selectedTransaction.CashSession?.CashRegister
                    ?.Recyclery?.name || "N/A"}
                </strong>
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Statut:{" "}
                <strong>
                  {selectedTransaction.refunded_at ? (
                    <Chip
                      label="Remboursé"
                      color="error"
                      size="small"
                    />
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
          <Typography
            variant="subtitle1"
            gutterBottom
            fontWeight="bold"
          >
            💰 Historique des remboursements
          </Typography>
          <Loading isLoading={refunds.isLoading}>
            {refunds.data?.length > 0 ? (
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
                            -{formatCurrency(refund.refund_amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {refund.refund_reason ===
                              "customer_request" && "Demande client"}
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
                            label={getPaymentMethodLabel(
                              refund.refund_method,
                            )}
                            color="info"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(refund.created_at).toLocaleString(
                              "fr-FR",
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {refund.created_by_name || "N/A"}
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
          <Typography
            variant="subtitle1"
            gutterBottom
            fontWeight="bold"
          >
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
                  refunds.data.reduce(
                    (sum, refund) =>
                      sum + parseFloat(refund.refund_amount),
                    0,
                  ),
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
                  refunds.data.reduce(
                    (sum, refund) =>
                      sum + parseFloat(refund.refund_amount),
                    0,
                  ),
                )}
              </Typography>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  )
}

interface RefundFormProps {
  selectedTransaction: TransactionModel
  // categories: CategoryModel[]
}


const getCartLinePrice = (line: CartItem): number => {

  let bundles = 0
  let extraItems = line.quantity
  if (line.bundleQuantity && line.bundleQuantity !== 0) {
    bundles = Math.trunc(line.quantity / line.bundleQuantity)
    extraItems = line.quantity % line.bundleQuantity
  }
  const sum = (price: number, quantity: number) => price * quantity * (1 - line.promotion / 100)
  return (
    sum(line.price, extraItems) + sum(line.bundlePrice || line.price, bundles)
  )
}
const refundItemSchema = z.object({ ...itemSchema.shape, refundQuantity: z.number() })
type ItemToRefund = z.infer<typeof refundItemSchema>
const schema = z.object({
  cart: z.array(refundItemSchema),
  refund_reason: z.enum([
    "customer_request",
    "product_defect",
    "wrong_product",
    "overcharge",
    "return_policy",
    "other"]),
  refund_method: z.enum(["cash",
    "card",
    "check", "giftCard"]),
  notes: z.string()
})

const RefundForm = ({ selectedTransaction }: RefundFormProps) => {
  const categories = useQuery({
    queryKey: [
      "categories",
      { include: ["category", "promo"], only_category: true, sell: true },
    ],
    queryFn: () =>
      fetchCategories({ include: ["category", "promo"], only_category: true, sell: true }).then(
        (response) => response.data.categories,
      ),
  });
  const cartItems = selectedTransaction.items?.map(item => {

    const category = categories.data?.find(c => c.id === item.category_id)
    const subcategory = category?.subcategories?.find(c => c.id === item.category_id)

    //manque la possibilité de faire un autre refund, faut recup les deja refund et empecher de reduire le refund count
    return {
      ...item,
      ...item.TransactionItem,
      category_name: category?.name || "",
      subcategory_name: subcategory?.name || "",
      promotion: item.TransactionItem.promotionValue,
      refundQuantity: 0,
    } satisfies ItemToRefund
  })
  const form = useForm({
    defaultValues: {
      cart: cartItems,
      refund_reason: "",
      refund_method: "",
      notes: ""
    },
    resolver: zodResolver(schema)
  })
  const cart = form.watch("cart")
  const state = form.getFieldState("cart")
  const { fields, update } = useFieldArray({
    control: form.control,
    name: "cart"
  })

  useEffect(() => {
    console.log("c", cart)
    console.log("s", state)
  }, [cart])

  return (
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

      {/* TODO need list des items with checkbox to select witch one to refunds + 1 checkbox on top to select all 
        refund_method need "giftCard"?
        */}
      {/* Type de remboursement */}
      <TableContainer>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Article</TableCell>
              <TableCell>Poids unitaire</TableCell>
              <TableCell>Prix unitaire</TableCell>
              <TableCell>Quantité</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Refunds</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((item, index) => (

              <TableRow key={item.id}>
                <TableCell>
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography variant="body1" fontWeight="medium">
                        {item.name}
                      </Typography>
                      {isNaN(+item.barcode) && (
                        <Chip
                          size="small"
                          label="Manuel"
                          color="info"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {item.barcode}
                    </Typography>
                    {(item.category_name ||
                      item.subcategory_name) && (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                        >
                          {item.category_name}
                          {item.subcategory_name &&
                            ` > ${item.subcategory_name}`}
                        </Typography>
                      )}
                  </Box>
                </TableCell>
                <TableCell>{item.weight.toFixed(2)}Kg</TableCell>
                <TableCell>
                  {item.price.toFixed(2)}€
                  {item.promotion != 0 && (
                    <Chip
                      color="secondary"
                      icon={<Loyalty />}
                      sx={{
                        marginLeft: 1,
                      }}
                      label={`-${item.promotion}%`}
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >

                    <Typography
                      sx={{ minWidth: 30, textAlign: "center" }}
                    >
                      {item.quantity}
                    </Typography>

                    {item.bundleQuantity && item.bundleQuantity != 0 && item.bundleQuantity != 1 && item.quantity >= item.bundleQuantity &&
                      <Chip
                        color="secondary"
                        icon={<Backpack />}
                        sx={{
                          marginLeft: 1,
                        }}
                        label={`${Math.trunc(item.quantity / item.bundleQuantity)} pack`}
                        size="small"
                      />
                    }
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography fontWeight="bold">
                    {getCartLinePrice(item).toFixed(2)}
                    €
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => {
                        // if (item.refundQuantity === 0) return
                        if (!form.getFieldState(`cart.${index}`).isDirty) return
                        form.setValue(`cart.${index}.refundQuantity`, item.refundQuantity - 1, { shouldDirty: true, shouldTouch: true })//pour dirty field
                        return update(index, {
                          ...item,
                          refundQuantity: item.refundQuantity - 1,
                        });
                      }}
                    >
                      <Remove />
                    </IconButton>
                    <Typography
                      sx={{ minWidth: 30, textAlign: "center" }}
                    >
                      {item.refundQuantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (item.refundQuantity === item.quantity) return
                        form.setValue(`cart.${index}.refundQuantity`, item.refundQuantity - 1, { shouldDirty: true, shouldTouch: true })//just pour dirty field
                        return update(index, {
                          ...item,
                          refundQuantity: item.refundQuantity + 1,
                        })
                      }

                      }
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>


      {/* Raison du remboursement */}
      <Grid size={{ xs: 12 }}>
        <FormSelect control={form.control} name="refund_reason" label="Raison du remboursement" >
          <MenuItem value="customer_request">Demande client</MenuItem>
          <MenuItem value="product_defect">
            Produit défectueux
          </MenuItem>
          <MenuItem value="wrong_product">Mauvais produit</MenuItem>
          <MenuItem value="overcharge">Surcharge</MenuItem>
          <MenuItem value="return_policy">
            Politique de retour
          </MenuItem>
          <MenuItem value="other">Autre</MenuItem>
        </FormSelect>
      </Grid>

      {/* Mode de remboursement */}
      <Grid size={{ xs: 12, md: 6 }}>
        <FormSelect control={form.control} name="refund_method" label="Mode de remboursement">
          <MenuItem value="cash">Espèces</MenuItem>
          <MenuItem value="card">Carte bancaire</MenuItem>
          <MenuItem value="check">Chèque</MenuItem>
          <MenuItem value="giftCard">GiftCard</MenuItem>

        </FormSelect>

      </Grid>

      {/* Notes */}
      <Grid size={{ xs: 12 }}>
        <FormInput control={form.control} name="notes" label="Notes (optionnel)" extra={{
          placeholder: "Informations supplémentaires..."
        }} />

      </Grid>

      {/* Résumé du remboursement */}
      <Grid size={{ xs: 12 }}>
        <Card variant="outlined" sx={{ p: 2, bgcolor: "#e3f2fd" }}>
          <Typography variant="subtitle2" gutterBottom>
            Résumé du remboursement
          </Typography>
          <Typography variant="body2">
            Montant à rembourser:{" "}
            <strong>
              {cart.reduce((prev, current) => {
                const item = { ...current, quantity: current.refundQuantity } satisfies CartItem
                prev += getCartLinePrice(item)
                return prev
              }, 0).toFixed(2)
              }€
              {/* {formatCurrency(
                refundForm.refund_type === "full"
                  ? selectedTransaction.total_amount
                  : parseFloat(refundForm.refund_amount || 0),
              )} */}
            </strong>
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Mode de remboursement:{" "}
            <strong>
              {getPaymentMethodLabel(form.getValues("refund_method"))}
            </strong>
          </Typography>
        </Card>
      </Grid>
    </Grid>
  )
}