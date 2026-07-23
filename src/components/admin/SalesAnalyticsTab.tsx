import {
  Assessment,
  Clear,
  Description,
  PointOfSale,
  Receipt,
  Refresh,
  ShoppingCart,
  TrendingUp,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../../utils/apiToastMessage";
import { useQueryErrorToast } from "../../hooks/useQueryErrorToast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TransactionModel } from "../../interfaces/Models";
import { fetchCategories } from "../../services/api/categories";
import { fetchStores as fStore } from "../../services/api/store";
import {
  createRefund,
  getTransactions,
  getTranscationStats,
  type transactionsFilters,
} from "../../services/api/transactions";
import { formatCurrency } from "../../services/cartService";
import { RefundTransactionDialog } from "../transactions/RefundTransactionDialog";
import { TransactionDetailsDialog } from "../transactions/TransactionDetailsDialog";
import { TransactionListTable } from "../transactions/TransactionListTable";
import type { Schema } from "../forms/RefundForm";
import { SaleFiltersForm } from "../forms/filters/SaleFiltersForm";
import {
  getSaleFilterDefaults,
  saleFilterSchema,
  type SaleFilters as Filters,
} from "../../services/schema/sale";
import { SalePaymentStats } from "../SalePaymentStats";
import { SalePostalStats } from "../SalePostalStats";
import { useReceiptPrint } from "../ReceiptPrint";
import { buildCreateRefundBody } from "../../utils/refundBody";
import { reprintTransactionReceipt } from "../../utils/transactionReceipt";
import { StatCard } from "../StatCard";
import type { RefundDataInput } from "@recyclerie/api/schemas/salesTransactions";
import { useUrlFilters } from "../../hooks/useUrlFilters";

const toTransactionFilters = ({
  store_id,
  period,
  date_from,
  date_to,
}: Filters): transactionsFilters => ({
  store_id: store_id || undefined,
  period,
  date_from,
  date_to,
});

export const SalesAnalyticsTab = () => {
  const defaults = useMemo(() => getSaleFilterDefaults(), []);
  const { filters, setFilters, page, setPage } = useUrlFilters({
    schema: saleFilterSchema,
    defaults,
    withPage: true,
  });

  const [refundDialog, setRefundDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionModel | null>(null);
  const [transactionDetailsDialog, setTransactionDetailsDialog] =
    useState(false);

  const queryClient = useQueryClient();

  const stores = useQuery({
    queryKey: ["stores", { active: true }],
    queryFn: () =>
      fStore({ active: true }).then((response) => response.data.data),
  });
  useQueryErrorToast(stores.error, "Erreur lors du chargement des magasins");

  const transactions = useQuery({
    queryKey: ["transactions", filters, page],
    queryFn: () =>
      getTransactions({
        ...toTransactionFilters(filters),
        include: ["refund", "items"],
        page,
      }).then((response) => response.data),
  });
  const statistics = useQuery({
    queryKey: ["transactionsStats", filters],
    queryFn: () =>
      getTranscationStats(toTransactionFilters(filters)).then(
        (response) => response.data.data,
      ),
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
    } as Awaited<ReturnType<typeof getTranscationStats>>["data"]["data"],
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
      }).then((response) => response.data.data),
  });

  // const createRefundPayloadFromForm = (data: Schema): RefundDataInput => ({...data});
  const addRefund = useMutation({
    mutationFn: (v: { id: TransactionModel["id"]; data: RefundDataInput }) =>
      createRefund(v.id, v.data),
    onSuccess: (data) => {
      handleCloseRefundDialog();
      toast.success(
        getApiSuccessMessage(data, "Remboursement effectué avec succès"),
      );
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionsStats"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Erreur lors du remboursement"));
    },
  });

  const handleSubmitRefund = async (data: Schema) => {
    if (!selectedTransaction?.cash_session_id) {
      toast.error("Session de caisse introuvable pour ce remboursement.");
      return;
    }
    const payload = buildCreateRefundBody(data, selectedTransaction.cash_session_id,);
    addRefund.mutate({
      id: selectedTransaction.id,
      data: payload
    });
  };

  const { triggerPrintReceipt, receiptPrintNode } = useReceiptPrint();

  const handleReprintReceipt = (transactionId: TransactionModel["id"]) => {
    reprintTransactionReceipt(transactionId, triggerPrintReceipt);
  };

  const handleRefund = (transaction: TransactionModel) => {
    setSelectedTransaction(transaction);
    setRefundDialog(true);
  };

  const handleCloseRefundDialog = () => {
    setRefundDialog(false);
    setSelectedTransaction(null);
  };

  const handleViewTransactionDetails = (transaction: TransactionModel) => {
    setSelectedTransaction(transaction);
    setTransactionDetailsDialog(true);
  };

  const handleCloseTransactionDetailsDialog = () => {
    setTransactionDetailsDialog(false);
    setSelectedTransaction(null);
  };

  const transactionList = transactions.data?.data ?? [];

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

      <Paper sx={{ p: 2, mb: 3 }}>
        <SaleFiltersForm
          stores={stores.data || []}
          defaultValues={filters}
          onChange={setFilters}
        />
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Transactions totales"
            value={statistics.data?.total_transactions || 0}
            icon={<Receipt />}
            color="primary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Chiffre d'affaires net"
            value={formatCurrency(Number(statistics.data?.total_sales || 0))}
            icon={<TrendingUp />}
            color="success"
            subtitle={
              statistics.data?.total_refunded
                ? `Brut: ${formatCurrency(
                  Number(
                    statistics.data.total_sales_before_refunds ||
                    statistics.data.total_sales ||
                    0,
                  ),
                )} · Remboursé: -${formatCurrency(Number(statistics.data.total_refunded || 0))}`
                : undefined
            }
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Panier moyen"
            value={formatCurrency(Number(statistics.data?.average_transaction || 0))}
            icon={<ShoppingCart />}
            color="info"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Sessions de caisse"
            value={statistics.data?.sessions_count || 0}
            icon={<PointOfSale />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statistics.data?.payment_methods &&
          statistics.data?.payment_methods.length > 0 && (
            <Grid size={{ xs: 12, md: 6 }}>
              <SalePaymentStats filters={toTransactionFilters(filters)} />
            </Grid>
          )}

        <Grid size={{ xs: 12, md: 6 }}>
          <SalePostalStats filters={toTransactionFilters(filters)} />
        </Grid>
      </Grid>

      <Card>
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
                label={`Filtré par: ${filters.transaction_number} (${transactionList.length} résultat${transactionList.length > 1 ? "s" : ""})`}
                color="primary"
                variant="outlined"
                onDelete={() =>
                  setFilters({ ...filters, transaction_number: "" })
                }
                deleteIcon={<Clear />}
              />
            )}
          </Box>

          <TransactionListTable
            transactions={transactionList}
            isLoading={transactions.isLoading}
            emptyMessage="Aucune transaction trouvée pour la période sélectionnée."
            page={page}
            total={transactions.data?.pagination?.total || 0}
            onPageChange={setPage}
            handleReprintReceipt={handleReprintReceipt}
            handleShowDetail={handleViewTransactionDetails}
          // handleRefund={handleRefund}
          />
        </CardContent>
      </Card>

      <RefundTransactionDialog
        open={refundDialog}
        onClose={handleCloseRefundDialog}
        transaction={selectedTransaction}
        categories={categories.data || []}
        onSubmit={handleSubmitRefund}
      />

      <TransactionDetailsDialog
        open={transactionDetailsDialog}
        onClose={handleCloseTransactionDetailsDialog}
        transaction={selectedTransaction}
        categories={categories.data ?? []}
      />

      {receiptPrintNode}
    </Box>
  );
};
