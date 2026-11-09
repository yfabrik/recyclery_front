import type { ComponentType } from "react";
import type { SalesAnalyticsFilters } from "./filters";
import { GiftCardsSection } from "./GiftCardsSection";
import { KpiSection } from "./KpiSection";
import {
  LegacyPaymentMethodsSection,
  LegacyPostalCodesSection,
} from "./LegacySections";
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
  { id: "payment-methods", width: "half", Component: LegacyPaymentMethodsSection },
  { id: "postal-codes", width: "half", Component: LegacyPostalCodesSection },
  { id: "gift-cards", width: "half", Component: GiftCardsSection },
  { id: "transactions", width: "full", Component: TransactionListSection },
];
