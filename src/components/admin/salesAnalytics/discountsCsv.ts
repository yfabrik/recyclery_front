import type {
  SalesDiscountsDto,
  WholeTransactionDiscountDto,
} from "@recyclerie/api/responses/salesAnalytics";
import type { CsvColumn } from "../../../utils/csv";
import { comparisonLookup } from "./comparison";
import { toPercent } from "./format";

/** One line of the discounts CSV. `null` cells are written empty. */
export type DiscountsCsvRow = {
  section: string;
  label: string;
  store: string;
  sales_count: number | null;
  /** Percent, one decimal. */
  share_of_sales: number | null;
  discount: number;
  /** Percent, one decimal. */
  share_of_gross_revenue: number | null;
  average_basket_before: number | null;
  average_basket_after: number | null;
  /** The same discount over the comparison range; null when there is none. */
  comparison_discount: number | null;
};

export const DISCOUNTS_CSV_COLUMNS: CsvColumn<DiscountsCsvRow>[] = [
  { header: "Rubrique", key: "section" },
  { header: "Libellé", key: "label" },
  { header: "Magasin", key: "store" },
  { header: "Ventes", key: "sales_count" },
  { header: "Part des ventes (%)", key: "share_of_sales" },
  { header: "Remise (€)", key: "discount" },
  { header: "Part du CA brut (%)", key: "share_of_gross_revenue" },
  { header: "Panier moyen avant (€)", key: "average_basket_before" },
  { header: "Panier moyen après (€)", key: "average_basket_after" },
  { header: "Remise période de comparaison (€)", key: "comparison_discount" },
];

const emptyRow = {
  store: "",
  sales_count: null,
  share_of_sales: null,
  share_of_gross_revenue: null,
  average_basket_before: null,
  average_basket_after: null,
  comparison_discount: null,
} satisfies Partial<DiscountsCsvRow>;

/** The comparison range's entry for the same notable discount (or "Autres"). */
export const comparisonDiscountGroup = (
  comparison: SalesDiscountsDto | null,
  key: WholeTransactionDiscountDto["key"],
) =>
  comparisonLookup(comparison?.whole_transaction_discounts, (group) => group.key)(key) ?? null;

/** Rows of the discounts CSV: totals, top categories, then each whole-transaction discount and its Stores. */
export const discountsCsvRows = (
  current: SalesDiscountsDto,
  comparison: SalesDiscountsDto | null,
): DiscountsCsvRow[] => {
  const shareOfGross = (amount: number) =>
    toPercent(current.gross_revenue > 0 ? amount / current.gross_revenue : 0, 1);
  const comparedCategory = comparisonLookup(comparison?.top_categories, (c) => c.category_id);
  const total = (
    label: string,
    pick: (figures: SalesDiscountsDto) => number,
    extra: Partial<DiscountsCsvRow> = {},
  ): DiscountsCsvRow => ({
    ...emptyRow,
    section: "Total",
    label,
    discount: pick(current),
    share_of_gross_revenue: shareOfGross(pick(current)),
    comparison_discount: comparison ? pick(comparison) : null,
    ...extra,
  });

  return [
    total("Toutes les remises", (f) => f.total_discount, {
      sales_count: current.sales_count,
    }),
    total("Promotions sur articles", (f) => f.category_promotion_discount),
    total("Remises sur le ticket", (f) => f.whole_transaction_discount),
    ...current.top_categories.map((category) => ({
      ...emptyRow,
      section: "Catégorie",
      label: category.name,
      discount: category.discount,
      comparison_discount: comparedCategory(category.category_id)?.discount ?? null,
    })),
    ...current.whole_transaction_discounts.flatMap((group) => [
      {
        section: "Remise sur le ticket",
        label: group.label,
        store: "Tous magasins",
        sales_count: group.sales_count,
        share_of_sales: toPercent(group.share_of_sales, 1),
        discount: group.discount_amount,
        share_of_gross_revenue: null,
        average_basket_before: group.average_basket_before,
        average_basket_after: group.average_basket_after,
        comparison_discount: comparisonDiscountGroup(comparison, group.key)?.discount_amount ?? null,
      },
      ...(group.by_store ?? []).map((store) => ({
        ...emptyRow,
        section: "Remise sur le ticket",
        label: group.label,
        store: store.store_name,
        sales_count: store.sales_count,
        discount: store.discount_amount,
        average_basket_before: store.average_basket_before,
        average_basket_after: store.average_basket_after,
      })),
    ]),
  ];
};
