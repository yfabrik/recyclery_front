import {
  Assessment,
  PointOfSale,
  Receipt,
  Refresh,
  ShoppingCart,
  TrendingUp,
} from "@mui/icons-material";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { useMemo } from "react";
import { useQueryErrorToast } from "../../hooks/useQueryErrorToast";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchStores as fStore } from "../../services/api/store";
import { getTranscationStats } from "../../services/api/transactions";
import { formatCurrency } from "../../services/cartService";
import { TransactionListSection } from "./salesAnalytics/TransactionListSection";
import { SaleFiltersForm } from "../forms/filters/SaleFiltersForm";
import {
  getSaleFilterFormDefaults,
  saleFilterFormSchema,
} from "../../services/schema/sale";
import { SalePaymentStats } from "../SalePaymentStats";
import { SalePostalStats } from "../SalePostalStats";
import { StatCard } from "../StatCard";
import { useUrlFilters } from "../../hooks/useUrlFilters";
import { toSaleStatsQuery } from "../../services/mapper/sale";

export const SalesAnalyticsTab = () => {
  const defaults = useMemo(() => getSaleFilterFormDefaults(), []);
  const { filters, setFilters, page, setPage } = useUrlFilters({
    schema: saleFilterFormSchema,
    defaults,
    withPage: true,
  });
  const statsQuery = useMemo(() => toSaleStatsQuery(filters), [filters]);

  const queryClient = useQueryClient();

  const stores = useQuery({
    queryKey: ["stores", { active: true }],
    queryFn: () =>
      fStore({ active: true }).then((response) => response.data.data),
  });
  useQueryErrorToast(stores.error, "Erreur lors du chargement des magasins");

  const statistics = useQuery({
    queryKey: ["transactionsStats", statsQuery],
    queryFn: () =>
      getTranscationStats(statsQuery).then((response) => response.data.data),
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
          loading={statistics.isLoading}
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
              <SalePaymentStats filters={statsQuery} />
            </Grid>
          )}

        <Grid size={{ xs: 12, md: 6 }}>
          <SalePostalStats filters={statsQuery} />
        </Grid>
      </Grid>

      <TransactionListSection
        filters={filters}
        page={page}
        onPageChange={setPage}
        onClearTransactionNumber={() =>
          setFilters({ ...filters, transaction_number: "" })
        }
      />
    </Box>
  );
};
