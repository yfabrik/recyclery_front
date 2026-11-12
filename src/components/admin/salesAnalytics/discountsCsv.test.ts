import type {
  SalesDiscountsDto,
  WholeTransactionDiscountDto,
} from "@recyclerie/api/responses/salesAnalytics";
import { describe, expect, it } from "vitest";
import { rowsToCsv } from "../../../utils/csv";
import { DISCOUNTS_CSV_COLUMNS, discountsCsvRows } from "./discountsCsv";

const group = (
  key: WholeTransactionDiscountDto["key"],
  label: string,
  figures: Partial<WholeTransactionDiscountDto> = {},
): WholeTransactionDiscountDto => ({
  key,
  label,
  sales_count: 0,
  share_of_sales: 0,
  discount_amount: 0,
  average_basket_before: 0,
  average_basket_after: 0,
  by_store: [],
  ...figures,
});

const current: SalesDiscountsDto = {
  total_discount: 83.5,
  category_promotion_discount: 16.5,
  whole_transaction_discount: 67,
  gross_revenue: 236.5,
  share_of_gross_revenue: 83.5 / 236.5,
  sales_count: 7,
  top_categories: [
    {
      category_id: 1,
      name: "Vaisselle",
      discount: 61.67,
      category_promotion_discount: 0,
      whole_transaction_discount: 61.67,
    },
    {
      category_id: 3,
      name: "Jouets",
      discount: 10,
      category_promotion_discount: 10,
      whole_transaction_discount: 0,
    },
  ],
  whole_transaction_discounts: [
    group("percent-40", "40 %", {
      sales_count: 2,
      share_of_sales: 2 / 7,
      discount_amount: 60,
      average_basket_before: 75,
      average_basket_after: 45,
      by_store: [
        {
          store_id: 2,
          store_name: "Lons",
          sales_count: 1,
          discount_amount: 40,
          average_basket_before: 100,
          average_basket_after: 60,
        },
      ],
    }),
    group("fixed-5", "5 €"),
    group("other", "Autres", {
      sales_count: 1,
      share_of_sales: 1 / 7,
      discount_amount: 2,
      average_basket_before: 40,
      average_basket_after: 38,
    }),
  ],
};

const comparison: SalesDiscountsDto = {
  total_discount: 8,
  category_promotion_discount: 0,
  whole_transaction_discount: 8,
  gross_revenue: 12,
  share_of_gross_revenue: 8 / 12,
  sales_count: 1,
  top_categories: [
    {
      category_id: 1,
      name: "Vaisselle",
      discount: 8,
      category_promotion_discount: 0,
      whole_transaction_discount: 8,
    },
  ],
  whole_transaction_discounts: [
    group("percent-40", "40 %", { sales_count: 1, share_of_sales: 1, discount_amount: 8 }),
    group("fixed-5", "5 €"),
    group("other", "Autres"),
  ],
};

describe("discountsCsvRows", () => {
  it("lists the totals, the top categories, then each whole-transaction discount and its Stores, beside the comparison", () => {
    expect(rowsToCsv(discountsCsvRows(current, comparison), DISCOUNTS_CSV_COLUMNS).split("\r\n")).toEqual([
      "Rubrique,Libellé,Magasin,Ventes,Part des ventes (%),Remise (€),Part du CA brut (%),Panier moyen avant (€),Panier moyen après (€),Remise période de comparaison (€)",
      "Total,Toutes les remises,,7,,83.5,35.3,,,8",
      "Total,Promotions sur articles,,,,16.5,7,,,0",
      "Total,Remises sur le ticket,,,,67,28.3,,,8",
      "Catégorie,Vaisselle,,,,61.67,,,,8",
      "Catégorie,Jouets,,,,10,,,,",
      "Remise sur le ticket,40 %,Tous magasins,2,28.6,60,,75,45,8",
      "Remise sur le ticket,40 %,Lons,1,,40,,100,60,",
      "Remise sur le ticket,5 €,Tous magasins,0,0,0,,0,0,0",
      "Remise sur le ticket,Autres,Tous magasins,1,14.3,2,,40,38,0",
    ]);
  });

  it("leaves the comparison column empty on compare=none", () => {
    const rows = discountsCsvRows(current, null);

    expect(rows.every((row) => row.comparison_discount === null)).toBe(true);
  });
});
