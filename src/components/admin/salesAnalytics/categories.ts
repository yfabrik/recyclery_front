import type {
  SalesCategoriesDto,
  SalesCategoryRowDto,
} from "@recyclerie/api/responses/salesAnalytics";
import { rowsToCsv, type CsvColumn } from "../../../utils/csv";
import { computeChange } from "./change";

export type CategoryFigures = Pick<
  SalesCategoryRowDto,
  "net_revenue" | "quantity" | "share" | "average_price"
>;

/** What the bars are sized and sorted by. */
export type CategoryMetric = "net_revenue" | "quantity";

/** A category of the section, with its figures in both ranges. */
export type CategoryRow = Pick<
  SalesCategoryRowDto,
  "category_id" | "name" | "has_subcategories"
> & {
  key: string;
  /** Sold (or refunded) in the current range. False: listed for its comparison figures only. */
  inCurrent: boolean;
  current: CategoryFigures;
  /** Null without a comparison range (`compare=none`); zeros when it sold nothing then. */
  comparison: CategoryFigures | null;
};

/** One bar of the chart: a category, or "Autres" (`row: null`). */
export type CategoryBar = {
  key: string;
  name: string;
  value: number;
  /** Share of the bars' total, 0–1. */
  share: number;
  row: CategoryRow | null;
};

/** Bars shown before the rest is grouped under "Autres". */
export const TOP_CATEGORIES = 10;

const NO_FIGURES: CategoryFigures = {
  net_revenue: 0,
  quantity: 0,
  share: 0,
  average_price: 0,
};

const figures = ({
  net_revenue,
  quantity,
  share,
  average_price,
}: SalesCategoryRowDto): CategoryFigures => ({
  net_revenue,
  quantity,
  share,
  average_price,
});

const rowKey = (categoryId: number | null) =>
  categoryId == null ? "none" : `category-${categoryId}`;

/**
 * Every category of the current range, in the server's order, then those sold
 * only in the comparison range; each with its figures in both ranges.
 */
export const categoryRows = (
  current: SalesCategoriesDto,
  comparison: SalesCategoriesDto | null,
): CategoryRow[] => {
  const compared = new Map(
    (comparison?.categories ?? []).map((c) => [c.category_id, c]),
  );
  const listed = new Set(current.categories.map((c) => c.category_id));
  const comparisonOf = (categoryId: number | null) => {
    if (!comparison) return null;
    const row = compared.get(categoryId);
    return row ? figures(row) : NO_FIGURES;
  };
  return [
    ...current.categories.map(
      (c): CategoryRow => ({
        key: rowKey(c.category_id),
        category_id: c.category_id,
        name: c.name,
        has_subcategories: c.has_subcategories,
        inCurrent: true,
        current: figures(c),
        comparison: comparisonOf(c.category_id),
      }),
    ),
    ...(comparison?.categories ?? [])
      .filter((c) => !listed.has(c.category_id))
      .map(
        (c): CategoryRow => ({
          key: rowKey(c.category_id),
          category_id: c.category_id,
          name: c.name,
          has_subcategories: c.has_subcategories,
          inCurrent: false,
          current: NO_FIGURES,
          comparison: figures(c),
        }),
      ),
  ];
};

/** Highest first on `metric`, then by name. */
export const sortCategoryRows = (rows: CategoryRow[], metric: CategoryMetric) =>
  [...rows].sort(
    (a, b) =>
      b.current[metric] - a.current[metric] || a.name.localeCompare(b.name, "fr"),
  );

const ratio = (value: number, total: number) => (total > 0 ? value / total : 0);

/**
 * The chart: the current range's categories sorted on `metric`, the top 10
 * then one "Autres (N catégories)" bar for the rest, unless `showAll`.
 * A single leftover category is shown rather than grouped.
 */
export const categoryBars = (
  rows: CategoryRow[],
  metric: CategoryMetric,
  { showAll = false, limit = TOP_CATEGORIES }: { showAll?: boolean; limit?: number } = {},
): CategoryBar[] => {
  const sorted = sortCategoryRows(
    rows.filter((row) => row.inCurrent),
    metric,
  );
  const total = sorted.reduce((sum, row) => sum + row.current[metric], 0);
  const bar = (row: CategoryRow): CategoryBar => ({
    key: row.key,
    name: row.name,
    value: row.current[metric],
    share: ratio(row.current[metric], total),
    row,
  });
  if (showAll || sorted.length <= limit + 1) return sorted.map(bar);

  const others = sorted.slice(limit);
  const value = others.reduce((sum, row) => sum + row.current[metric], 0);
  return [
    ...sorted.slice(0, limit).map(bar),
    {
      key: "others",
      name: `Autres (${others.length} catégories)`,
      value,
      share: ratio(value, total),
      row: null,
    },
  ];
};

/** A ratio as a percentage with 2 decimals (0.2375 → 23.75); blank when there is none. */
const csvPercent = (ratio: number | null | undefined) =>
  ratio == null ? "" : Math.round(ratio * 10_000) / 100;

const csvChange = (row: CategoryRow, metric: CategoryMetric) =>
  csvPercent(computeChange(row.current[metric], row.comparison?.[metric])?.ratio);

const CSV_COLUMNS: CsvColumn<CategoryRow>[] = [
  { header: "Catégorie", key: "name" },
  { header: "CA net", key: "net_revenue", format: (_, row) => row.current.net_revenue },
  { header: "Quantité", key: "quantity", format: (_, row) => row.current.quantity },
  { header: "Part du CA (%)", key: "share", format: (_, row) => csvPercent(row.current.share) },
  { header: "Prix moyen", key: "average_price", format: (_, row) => row.current.average_price },
];

const CSV_COMPARISON_COLUMNS: CsvColumn<CategoryRow>[] = [
  {
    header: "CA net comparaison",
    key: "comparison.net_revenue",
    format: (_, row) => row.comparison?.net_revenue,
  },
  {
    header: "Évolution CA net (%)",
    key: "change.net_revenue",
    format: (_, row) => csvChange(row, "net_revenue"),
  },
  {
    header: "Quantité comparaison",
    key: "comparison.quantity",
    format: (_, row) => row.comparison?.quantity,
  },
  {
    header: "Évolution quantité (%)",
    key: "change.quantity",
    format: (_, row) => csvChange(row, "quantity"),
  },
];

/** The table as CSV, with the comparison columns when there is a comparison range. */
export const categoriesCsv = (rows: CategoryRow[]) =>
  rowsToCsv(
    rows,
    rows.some((row) => row.comparison !== null)
      ? [...CSV_COLUMNS, ...CSV_COMPARISON_COLUMNS]
      : CSV_COLUMNS,
  );
