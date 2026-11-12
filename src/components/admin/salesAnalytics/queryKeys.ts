import type { Query, QueryClient } from "@tanstack/react-query";
import type { SalesAnalyticsRouteKey } from "../../../services/api/salesAnalytics";

/** First element of every analytics route's query key. */
export const SALES_ANALYTICS_QUERY_KEY = ["salesAnalytics"] as const;

/** `["salesAnalytics", route, query]`. */
export const salesAnalyticsQueryKey = (route: SalesAnalyticsRouteKey, query: unknown) =>
  [...SALES_ANALYTICS_QUERY_KEY, route, query] as const;

/**
 * Sections of the page that read other routes: the transaction list keeps
 * `GET /sales-transactions`.
 */
const OTHER_SECTION_KEYS = new Set<unknown>([
  "transactions",
]);

/** A query shown on the Suivi des Ventes page. */
export const isSalesAnalyticsPageQuery = ({ queryKey }: Pick<Query, "queryKey">) =>
  queryKey[0] === SALES_ANALYTICS_QUERY_KEY[0] || OTHER_SECTION_KEYS.has(queryKey[0]);

/** "Actualiser": marks every query of the page stale and refetches the ones on screen. */
export const refreshSalesAnalytics = (client: QueryClient) =>
  client.invalidateQueries({ predicate: isSalesAnalyticsPageQuery });
