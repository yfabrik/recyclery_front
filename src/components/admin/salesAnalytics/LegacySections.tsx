import { useMemo } from "react";
import { toSaleStatsQuery } from "../../../services/mapper/sale";
import { toSaleFilterValues } from "./filters";
import type { SalesAnalyticsSectionProps } from "./sections";

// The page's former payment block, fed by the new filters until its own
// analytics route replaces it.
