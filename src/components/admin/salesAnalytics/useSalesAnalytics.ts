import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { SalesAnalyticsRoute } from "../../../services/api/salesAnalytics";
import { toSalesAnalyticsQuery, type SalesAnalyticsFilters } from "./filters";
import { salesAnalyticsQueryKey } from "./queryKeys";

/** A section's query: the route's `{ ranges, current, comparison }` for the page filters. */
export const useSalesAnalytics = <T>(
  route: SalesAnalyticsRoute<T>,
  filters: SalesAnalyticsFilters,
) => {
  const query = useMemo(() => toSalesAnalyticsQuery(filters), [filters]);
  return useQuery({
    queryKey: salesAnalyticsQueryKey(route.key, query),
    queryFn: () => route.fetch(query),
    placeholderData: keepPreviousData,
  });
};
