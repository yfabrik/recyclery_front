import { useMemo } from "react";
import { SalePaymentStats } from "../../SalePaymentStats";
import { SalePostalStats } from "../../SalePostalStats";
import { toSaleStatsQuery } from "../../../services/mapper/sale";
import { toSaleFilterValues } from "./filters";
import type { SalesAnalyticsSectionProps } from "./sections";

// The page's former payment and postal-code blocks, fed by the new filters
// until their own analytics routes replace them.

export const LegacyPaymentMethodsSection = ({ filters }: SalesAnalyticsSectionProps) => {
  const query = useMemo(() => toSaleStatsQuery(toSaleFilterValues(filters)), [filters]);
  return <SalePaymentStats filters={query} />;
};

export const LegacyPostalCodesSection = ({ filters }: SalesAnalyticsSectionProps) => {
  const query = useMemo(() => toSaleStatsQuery(toSaleFilterValues(filters)), [filters]);
  return <SalePostalStats filters={query} />;
};
