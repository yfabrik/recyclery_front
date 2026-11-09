import type { Query, QueryClient } from "@tanstack/react-query";

/** First element of every analytics route's query key. */
export const SALES_ANALYTICS_QUERY_KEY = ["salesAnalytics"] as const;

/** `["salesAnalytics", route, query]`. */
export const salesAnalyticsQueryKey = (route: string, query: unknown) =>
  [...SALES_ANALYTICS_QUERY_KEY, route, query] as const;

/**
 * Sections of the page that read other routes. The transaction list keeps
 * `GET /sales-transactions`; drop `transactionsStats` when the payment section
 * moves to an analytics route.
 */
const OTHER_SECTION_KEYS = new Set<unknown>([
  "transactions",
  "transactionsStats",
]);

/** A query shown on the Suivi des Ventes page. */
export const isSalesAnalyticsPageQuery = ({ queryKey }: Pick<Query, "queryKey">) =>
  queryKey[0] === SALES_ANALYTICS_QUERY_KEY[0] || OTHER_SECTION_KEYS.has(queryKey[0]);

/** "Actualiser": marks every query of the page stale and refetches the ones on screen. */
export const refreshSalesAnalytics = (client: QueryClient) =>
  client.invalidateQueries({ predicate: isSalesAnalyticsPageQuery });
