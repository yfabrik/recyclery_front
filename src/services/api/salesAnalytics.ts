import type {
  SalesAnalyticsDto,
  SalesAnalyticsResponse,
  SalesCategoriesDto,
  SalesDiscountsDto,
  SalesHeatmapDto,
  SalesKpisDto,
  SalesPaymentMethodsDto,
  SalesPostalCodesDto,
  SalesStoresDto,
  SalesTimelineDto,
} from "@recyclerie/api/responses/salesAnalytics";
import type {
  SalesAnalyticsQueryInput,
  SalesCategoriesQueryInput,
} from "@recyclerie/api/schemas/salesAnalytics";
import axiosInstance from "./axios";

/**
 * One analytics route: its query-key name and how to fetch its
 * `{ ranges, current, comparison }`. `Q`: a route's own query, when it takes
 * params beyond the common ones.
 */
export type SalesAnalyticsRoute<T, Q extends SalesAnalyticsQueryInput = SalesAnalyticsQueryInput> = {
  key: string;
  fetch: (query: Q) => Promise<SalesAnalyticsDto<T>>;
};

const analyticsRoute = <T, Q extends SalesAnalyticsQueryInput = SalesAnalyticsQueryInput>(
  key: string,
  path: string,
): SalesAnalyticsRoute<T, Q> => ({
  key,
  fetch: (query) =>
    axiosInstance
      .get<SalesAnalyticsResponse<T>>(path, { params: query })
      .then((response) => response.data.data),
});

export const salesKpisRoute = analyticsRoute<SalesKpisDto>(
  "kpis",
  "/api/sales-transactions/analytics/kpis",
);

export const salesPostalCodesRoute = analyticsRoute<SalesPostalCodesDto>(
  "postal-codes",
  "/api/sales-transactions/analytics/postal-codes",
);

export const salesHeatmapRoute = analyticsRoute<SalesHeatmapDto>(
  "heatmap",
  "/api/sales-transactions/analytics/heatmap",
);

export const salesPaymentMethodsRoute = analyticsRoute<SalesPaymentMethodsDto>(
  "payment-methods",
  "/api/sales-transactions/analytics/payment-methods",
);

export const salesStoresRoute = analyticsRoute<SalesStoresDto>(
  "stores",
  "/api/sales-transactions/analytics/stores",
);

export const salesTimelineRoute = analyticsRoute<SalesTimelineDto>(
  "timeline",
  "/api/sales-transactions/analytics/timeline",
);

export const salesCategoriesRoute = analyticsRoute<SalesCategoriesDto, SalesCategoriesQueryInput>(
  "categories",
  "/api/sales-transactions/analytics/categories",
);

export const salesDiscountsRoute = analyticsRoute<SalesDiscountsDto>(
  "discounts",
  "/api/sales-transactions/analytics/discounts",
);
