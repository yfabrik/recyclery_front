import type {
  SalesAnalyticsDto,
  SalesAnalyticsResponse,
  SalesKpisDto,
  SalesPostalCodesDto,
} from "@recyclerie/api/responses/salesAnalytics";
import type { SalesAnalyticsQueryInput } from "@recyclerie/api/schemas/salesAnalytics";
import axiosInstance from "./axios";

/** One analytics route: its query-key name and how to fetch its `{ ranges, current, comparison }`. */
export type SalesAnalyticsRoute<T> = {
  key: string;
  fetch: (query: SalesAnalyticsQueryInput) => Promise<SalesAnalyticsDto<T>>;
};

const analyticsRoute = <T>(key: string, path: string): SalesAnalyticsRoute<T> => ({
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
