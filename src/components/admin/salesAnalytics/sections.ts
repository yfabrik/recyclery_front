import type { ComponentType } from "react";
import { CategoriesSection } from "./CategoriesSection";
import { DiscountsSection } from "./DiscountsSection";
import type { SalesAnalyticsFilters } from "./filters";
import { GiftCardsSection } from "./GiftCardsSection";
import { HeatmapSection } from "./HeatmapSection";
import { KpiSection } from "./KpiSection";
import { PaymentMethodsSection } from "./PaymentMethodsSection";
import { PostalCodesSection } from "./PostalCodesSection";
import { StoresSection } from "./StoresSection";
import { TimelineSection } from "./TimelineSection";
import { TransactionListSection } from "./TransactionListSection";

/** What every section receives. It runs its own query and shows its own states. */
export type SalesAnalyticsSectionProps = {
  filters: SalesAnalyticsFilters;
  /** E.g. a Store row that sets the Store filter. */
  onFiltersChange: (next: SalesAnalyticsFilters) => void;
  /** The transaction list's page, kept in the URL with the filters. */
  page: number;
  onPageChange: (page: number) => void;
};

export type SalesAnalyticsSection = {
  id: string;
  /** "half": two sections side by side on wide screens. */
  width: "full" | "half";
  Component: ComponentType<SalesAnalyticsSectionProps>;
};

/** The page, top to bottom. Adding or removing a section is one line. */
export const SALES_ANALYTICS_SECTIONS: SalesAnalyticsSection[] = [
  { id: "kpis", width: "full", Component: KpiSection },
  { id: "timeline", width: "full", Component: TimelineSection },
  { id: "categories", width: "full", Component: CategoriesSection },
  { id: "stores", width: "full", Component: StoresSection },
  { id: "heatmap", width: "full", Component: HeatmapSection },
  { id: "payment-methods", width: "half", Component: PaymentMethodsSection },
  { id: "discounts", width: "half", Component: DiscountsSection },
  { id: "postal-codes", width: "half", Component: PostalCodesSection },
  { id: "gift-cards", width: "half", Component: GiftCardsSection },
  { id: "transactions", width: "full", Component: TransactionListSection },
];
