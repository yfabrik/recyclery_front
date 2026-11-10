import type {
  SalesCategoriesDto,
  SalesCategoryRowDto,
} from "@recyclerie/api/responses/salesAnalytics";
import { rowsToCsv, type CsvColumn } from "../../../utils/csv";
import { computeChange } from "./change";
import { comparisonLookup, csvColumns } from "./comparison";
import { countLabel, toPercent } from "./format";

export type CategoryFigures = Pick<
  SalesCategoryRowDto,
  "net_revenue" | "quantity" | "share" | "average_price"
>;

/** What the bars are sized and sorted by, in the order of the switch. */
export const CATEGORY_METRICS = ["net_revenue", "quantity"] as const;
export type CategoryMetric = (typeof CATEGORY_METRICS)[number];

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
  const compared = comparisonLookup(comparison?.categories, (c) => c.category_id);
  const listed = new Set(current.categories.map((c) => c.category_id));
  const comparisonOf = (categoryId: number | null) => {
    if (!comparison) return null;
    const row = compared(categoryId);
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
 * then one "Autres (N catégories)" bar for the rest, even a single one,
 * unless `showAll`.
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
  if (showAll || sorted.length <= limit) return sorted.map(bar);

  const others = sorted.slice(limit);
  const value = others.reduce((sum, row) => sum + row.current[metric], 0);
  return [
    ...sorted.slice(0, limit).map(bar),
    {
      key: "others",
      name: `Autres (${countLabel(others.length, "catégorie")})`,
      value,
      share: ratio(value, total),
      row: null,
    },
  ];
};

/** Room between a bar's edge and its label, in px. */
export const BAR_LABEL_PADDING = 6;

/** Where a bar's label is written, and how much width it has there. */
export type BarLabelPlacement = { x: number; inside: boolean; room: number };

/**
 * Where a bar's label is written: inside the bar from its start (left end)
 * when it fits there, else just after the bar's end; when it fits on
 * neither, on the side with more room (see `fitBarLabel`). `start` and `end`
 * are the bar's left and right x in px, `areaEnd` the right edge of the
 * drawing area.
 */
export const barLabelPlacement = (
  bar: { start: number; end: number },
  labelWidth: number,
  areaEnd: number,
): BarLabelPlacement => {
  const inside = {
    x: bar.start + BAR_LABEL_PADDING,
    inside: true,
    room: bar.end - bar.start - 2 * BAR_LABEL_PADDING,
  };
  const after = {
    x: bar.end + BAR_LABEL_PADDING,
    inside: false,
    room: areaEnd - bar.end - BAR_LABEL_PADDING,
  };
  if (labelWidth <= inside.room) return inside;
  if (labelWidth <= after.room) return after;
  return inside.room > after.room ? inside : after;
};

/** Letters of a category name kept before a bar label gives up a figure. */
const MIN_NAME_LETTERS = 7;

const shortenName = (name: string, letters: number) =>
  letters >= name.length ? name : `${name.slice(0, letters).trimEnd()}…`;

/**
 * A bar's label at most `room` px wide by `widthOf`: `name` then `figures`
 * (" · 12,00 €", " · 3,4 %"). Too wide, the name is shortened with "…" down
 * to 7 letters; then the figures go, last first; then the name is shortened
 * further.
 */
export const fitBarLabel = (
  name: string,
  figures: readonly string[],
  room: number,
  widthOf: (text: string) => number,
) => {
  for (let kept = figures.length; kept >= 0; kept--) {
    const tail = figures.slice(0, kept).join("");
    const minLetters = kept === 0 ? 1 : Math.min(MIN_NAME_LETTERS, name.length);
    for (let letters = name.length; letters >= minLetters; letters--) {
      const label = `${shortenName(name, letters)}${tail}`;
      if (widthOf(label) <= room) return label;
    }
  }
  return shortenName(name, 1);
};

/** A ratio as a percentage with 2 decimals (0.2375 → 23.75); blank when there is none. */
const csvPercent = (ratio: number | null | undefined) =>
  ratio == null ? "" : toPercent(ratio, 2);

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
    csvColumns(
      CSV_COLUMNS,
      CSV_COMPARISON_COLUMNS,
      rows.some((row) => row.comparison !== null),
    ),
  );
