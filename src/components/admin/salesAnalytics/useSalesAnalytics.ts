import type { SalesAnalyticsResponse } from "@recyclerie/api/responses/salesAnalytics";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { SalesAnalyticsRoute } from "../../../services/api/salesAnalytics";
import { toSalesAnalyticsQuery, type SalesAnalyticsFilters } from "./filters";
import { salesAnalyticsQueryKey } from "./queryKeys";

/**
 * A section's query: the route's `{ ranges, current, comparison }` for the
 * page filters, plus the route's own `params` (e.g. the categories'
 * `parent_id`). Memoise `params`, or the query is rebuilt on every render.
 */
export const useSalesAnalytics = <R extends SalesAnalyticsResponse<unknown>, P extends object>(
  route: SalesAnalyticsRoute<R, P>,
  filters: SalesAnalyticsFilters,
  params?: P,
) => {
  const query = useMemo(
    () => ({ ...toSalesAnalyticsQuery(filters), ...params }),
    [filters, params],
  );
  return useQuery({
    queryKey: salesAnalyticsQueryKey(route.key, query),
    queryFn: () => route.fetch(query),
    placeholderData: keepPreviousData,
  });
};
