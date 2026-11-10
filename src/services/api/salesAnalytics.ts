import type { GiftCardAnalyticsDto } from "@recyclerie/api/responses/giftCards";
import type {
  SalesAnalyticsDto,
  SalesAnalyticsResponse,
  SalesCategoriesDto,
  SalesCategoryRefDto,
  SalesDiscountsDto,
  SalesHeatmapDto,
  SalesKpisDto,
  SalesPaymentMethodsDto,
  SalesPostalCodesDto,
  SalesStoresDto,
  SalesTimelineDto,
} from "@recyclerie/api/responses/salesAnalytics";
import type { SalesAnalyticsQueryInput } from "@recyclerie/api/schemas/salesAnalytics";
import axiosInstance from "./axios";

/**
 * One analytics route: its query-key name and how to fetch its
 * `{ ranges, current, comparison }`. `P`: the route's own params, beyond the
 * common query.
 */
export type SalesAnalyticsRoute<T, P extends object = Record<never, never>> = {
  key: string;
  fetch: (query: SalesAnalyticsQueryInput & P) => Promise<SalesAnalyticsDto<T>>;
};

const analyticsRoute = <T, P extends object = Record<never, never>>(
  key: string,
  path: string,
): SalesAnalyticsRoute<T, P> => ({
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

/** The categories route's own param: the opened category, whose subcategories it lists. */
type SalesCategoriesParams = { parent_id?: SalesCategoryRefDto["id"] };

export const salesCategoriesRoute = analyticsRoute<SalesCategoriesDto, SalesCategoriesParams>(
  "categories",
  "/api/sales-transactions/analytics/categories",
);

export const salesDiscountsRoute = analyticsRoute<SalesDiscountsDto>(
  "discounts",
  "/api/sales-transactions/analytics/discounts",
);

export const giftCardAnalyticsRoute = analyticsRoute<GiftCardAnalyticsDto>(
  "gift-cards",
  "/api/gift-cards/analytics",
);
