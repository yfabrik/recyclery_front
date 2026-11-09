import {
  SALES_ANALYTICS_COMPARE_MODES,
  SALES_ANALYTICS_PERIODS,
  type SalesAnalyticsCompareMode,
  type SalesAnalyticsQueryInput,
} from "@recyclerie/api/schemas/salesAnalytics";
import z from "zod";
import { filterIsoDate, idSchema } from "../../../interfaces/ZodTypes";
import { toIsoDate } from "../../../services/dateService";
import type { SaleFilterFormValues } from "../../../services/schema/sale";
import { omitBlank } from "../../../services/zodTransform";
import { presetRange } from "./period";

/**
 * URL state of the Suivi des Ventes page. One `useUrlFilters` owns every key
 * (it rewrites the whole query string), so the transaction list's search lives
 * here too. Not the API query: see `toSalesAnalyticsQuery`.
 */
export const salesAnalyticsFilterSchema = z.object({
  period: z.enum(SALES_ANALYTICS_PERIODS),
  date_from: filterIsoDate(),
  date_to: filterIsoDate(),
  store_id: z.union([idSchema(), z.literal("")]),
  compare: z.enum(SALES_ANALYTICS_COMPARE_MODES),
  /** Search of the transaction list section. */
  transaction_number: z.string().trim().optional(),
});
export type SalesAnalyticsFilters = z.infer<typeof salesAnalyticsFilterSchema>;

export const COMPARE_LABELS: Record<
  SalesAnalyticsCompareMode,
  { option: string; vs: string }
> = {
  last_year: { option: "Année précédente (N-1)", vs: "vs N-1" },
  previous: { option: "Période précédente", vs: "vs période préc." },
  none: { option: "Aucune comparaison", vs: "" },
};

/** Paris calendar date of now. */
export const todayIsoDate = () => toIsoDate(new Date());

export const getSalesAnalyticsFilterDefaults = (
  today: string = todayIsoDate(),
): SalesAnalyticsFilters => ({
  period: "month",
  ...presetRange("month", today, today),
  store_id: "",
  compare: "last_year",
  transaction_number: "",
});

/** Query of every `/analytics/*` route. */
export const toSalesAnalyticsQuery = (
  f: SalesAnalyticsFilters,
): SalesAnalyticsQueryInput => ({
  period: f.period,
  date_from: f.date_from,
  date_to: f.date_to,
  compare: f.compare,
  ...omitBlank({ store_id: f.store_id }),
});

/**
 * The page's former filter shape, taken by `toSaleQuery` for the transaction
 * list (`GET /sales-transactions`, which ignores `period`).
 */
export const toSaleFilterValues = (
  f: SalesAnalyticsFilters,
): SaleFilterFormValues => ({
  period: "custom",
  date_from: f.date_from,
  date_to: f.date_to,
  store_id: f.store_id,
  transaction_number: f.transaction_number ?? "",
});
