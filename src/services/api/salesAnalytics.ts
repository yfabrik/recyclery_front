import type {
  SalesAnalyticsDto,
  SalesAnalyticsResponse,
  SalesCategoriesDto,
  SalesKpisDto,
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
export const salesCategoriesRoute = analyticsRoute<SalesCategoriesDto, SalesCategoriesQueryInput>(
  "categories",
  "/api/sales-transactions/analytics/categories",
);
