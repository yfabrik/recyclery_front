import type { GiftCardAnalyticsResponse } from "@recyclerie/api/responses/giftCards";
import type {
  SalesAnalyticsCategoriesResponse,
  SalesAnalyticsDiscountsResponse,
  SalesAnalyticsHeatmapResponse,
  SalesAnalyticsKpisResponse,
  SalesAnalyticsPaymentMethodsResponse,
  SalesAnalyticsPostalCodesResponse,
  SalesAnalyticsResponse,
  SalesAnalyticsStoresResponse,
  SalesAnalyticsTimelineResponse,
  SalesCategoryRefDto,
} from "@recyclerie/api/responses/salesAnalytics";
import type { SalesAnalyticsQueryInput } from "@recyclerie/api/schemas/salesAnalytics";
import axiosInstance from "./axios";

/*
 * Unlike the other services (`getX(): Promise<AxiosResponse<XResponse>>`),
 * each analytics route is a route object from one factory: every route takes
 * the same query and answers the same `{ ranges, current, comparison }`
 * envelope, so `useSalesAnalytics` runs any of them with the page filters,
 * and a new section's route is one path below plus one line. Each route is
 * typed by its response alias from `@recyclerie/api`, the one the backend
 * controller is typed by too.
 */

/** Path of each analytics route, by its query-key name. */
const SALES_ANALYTICS_PATHS = {
  kpis: "/api/sales-transactions/analytics/kpis",
  "postal-codes": "/api/sales-transactions/analytics/postal-codes",
  heatmap: "/api/sales-transactions/analytics/heatmap",
  "payment-methods": "/api/sales-transactions/analytics/payment-methods",
  stores: "/api/sales-transactions/analytics/stores",
  timeline: "/api/sales-transactions/analytics/timeline",
  categories: "/api/sales-transactions/analytics/categories",
  discounts: "/api/sales-transactions/analytics/discounts",
  "gift-cards": "/api/gift-cards/analytics",
} as const satisfies Record<string, `/api/${string}`>;

/** Query-key name of an analytics route: `["salesAnalytics", key, query]`. */
export type SalesAnalyticsRouteKey = keyof typeof SALES_ANALYTICS_PATHS;

/** The response of any analytics route. */
type AnyAnalyticsResponse = SalesAnalyticsResponse<unknown>;

/**
 * One analytics route: its query-key name and how to fetch its
 * `{ ranges, current, comparison }` (`R["data"]`). `R`: its response alias;
 * `P`: its own params, beyond the common query.
 */
export type SalesAnalyticsRoute<
  R extends AnyAnalyticsResponse,
  P extends object = Record<never, never>,
> = {
  key: SalesAnalyticsRouteKey;
  fetch: (query: SalesAnalyticsQueryInput & P) => Promise<R["data"]>;
};

const analyticsRoute = <
  R extends AnyAnalyticsResponse,
  P extends object = Record<never, never>,
>(
  key: SalesAnalyticsRouteKey,
): SalesAnalyticsRoute<R, P> => ({
  key,
  fetch: (query) =>
    axiosInstance
      .get<R>(SALES_ANALYTICS_PATHS[key], { params: query })
      .then((response) => response.data.data),
});

/** The categories route's own param: the opened category, whose subcategories it lists. */
type SalesCategoriesParams = { parent_id?: SalesCategoryRefDto["id"] };

export const salesKpisRoute = analyticsRoute<SalesAnalyticsKpisResponse>("kpis");
export const salesPostalCodesRoute =
  analyticsRoute<SalesAnalyticsPostalCodesResponse>("postal-codes");
export const salesHeatmapRoute = analyticsRoute<SalesAnalyticsHeatmapResponse>("heatmap");
export const salesPaymentMethodsRoute =
  analyticsRoute<SalesAnalyticsPaymentMethodsResponse>("payment-methods");
export const salesStoresRoute = analyticsRoute<SalesAnalyticsStoresResponse>("stores");
export const salesTimelineRoute = analyticsRoute<SalesAnalyticsTimelineResponse>("timeline");
export const salesCategoriesRoute = analyticsRoute<
  SalesAnalyticsCategoriesResponse,
  SalesCategoriesParams
>("categories");
export const salesDiscountsRoute = analyticsRoute<SalesAnalyticsDiscountsResponse>("discounts");
export const giftCardAnalyticsRoute = analyticsRoute<GiftCardAnalyticsResponse>("gift-cards");
