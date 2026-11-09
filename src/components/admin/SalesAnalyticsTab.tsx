import { Assessment } from "@mui/icons-material";
import { Box, Grid, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useQueryErrorToast } from "../../hooks/useQueryErrorToast";
import { useUrlFilters } from "../../hooks/useUrlFilters";
import { fetchStores } from "../../services/api/store";
import {
  getSalesAnalyticsFilterDefaults,
  salesAnalyticsFilterSchema,
} from "./salesAnalytics/filters";
import { SalesAnalyticsFilterBar } from "./salesAnalytics/SalesAnalyticsFilterBar";
import { SALES_ANALYTICS_SECTIONS } from "./salesAnalytics/sections";

/** Suivi des Ventes: the filter bar, then one ordered list of sections. */
export const SalesAnalyticsTab = () => {
  const defaults = useMemo(() => getSalesAnalyticsFilterDefaults(), []);
  const { filters, setFilters, page, setPage } = useUrlFilters({
    schema: salesAnalyticsFilterSchema,
    defaults,
    withPage: true,
  });

  const stores = useQuery({
    queryKey: ["stores", { active: true }],
    queryFn: () =>
      fetchStores({ active: true }).then((response) => response.data.data),
  });
  useQueryErrorToast(stores.error, "Erreur lors du chargement des magasins");

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        <Assessment /> Suivi des Ventes
      </Typography>

      <SalesAnalyticsFilterBar
        filters={filters}
        onChange={setFilters}
        stores={stores.data ?? []}
      />

      {/* A section may render nothing (Stores once a Store is selected): its empty item is hidden so it leaves no row gap. */}
      <Grid container spacing={3}>
        {SALES_ANALYTICS_SECTIONS.map(({ id, width, Component }) => (
          <Grid
            key={id}
            size={{ xs: 12, md: width === "half" ? 6 : 12 }}
            sx={{ "&:empty": { display: "none" } }}
          >
            <Component
              filters={filters}
              onFiltersChange={setFilters}
              page={page}
              onPageChange={setPage}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
