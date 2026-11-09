import type {
  SalesAnalyticsDto,
  SalesStoreDto,
  SalesStoresDto,
} from "@recyclerie/api/responses/salesAnalytics";
import { rowsToCsv, type CsvColumn } from "../../../utils/csv";
import { computeChange, type Change } from "./change";

/** A row of the Store table: the Store's figures and its net revenue vs the comparison range. */
export type StoreRow = SalesStoreDto & {
  /** null on `compare=none`; 0 when the Store is not listed in the comparison range. */
  comparison_net_revenue: number | null;
  change: Change | null;
};

/** The current range's Stores, each matched by id with the same Store in the comparison range. */
export const toStoreRows = ({
  current,
  comparison,
}: Pick<SalesAnalyticsDto<SalesStoresDto>, "current" | "comparison">): StoreRow[] => {
  const before = new Map(
    comparison?.stores.map((store) => [store.store_id, store.net_revenue]),
  );
  return current.stores.map((store) => {
    const comparison_net_revenue = comparison
      ? (before.get(store.store_id) ?? 0)
      : null;
    return {
      ...store,
      comparison_net_revenue,
      change: computeChange(store.net_revenue, comparison_net_revenue),
    };
  });
};

/** A 0–1 ratio as a percentage, `decimals` after the dot. */
const toPercent = (ratio: number, decimals: number) =>
  Math.round(ratio * 100 * 10 ** decimals) / 10 ** decimals;

const COLUMNS: CsvColumn<StoreRow>[] = [
  { header: "Magasin", key: "name" },
  { header: "CA net", key: "net_revenue" },
  { header: "CA brut", key: "gross_revenue" },
  { header: "Remboursé", key: "refunded_amount" },
  { header: "Ventes", key: "sales_count" },
  { header: "Panier moyen", key: "average_basket" },
  {
    header: "Part du CA net (%)",
    key: "net_revenue_share",
    format: (_value, row) => toPercent(row.net_revenue_share, 2),
  },
];

const COMPARISON_COLUMNS: CsvColumn<StoreRow>[] = [
  { header: "CA net comparaison", key: "comparison_net_revenue" },
  {
    header: "Évolution CA net (%)",
    key: "change",
    format: (_value, row) =>
      row.change?.ratio == null ? "" : toPercent(row.change.ratio, 1),
  },
];

/** CSV of the Store table; the comparison columns only when there is a comparison. */
export const storesCsv = (rows: StoreRow[]) =>
  rowsToCsv(
    rows,
    rows.some((row) => row.comparison_net_revenue !== null)
      ? [...COLUMNS, ...COMPARISON_COLUMNS]
      : COLUMNS,
  );
