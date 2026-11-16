import type { LabeledItemWithSaleModel } from "../interfaces/Models";

/** A button on a row of the labels page, in display order. */
export type LabelRowAction =
  | { type: "print" }
  | { type: "edit" }
  | { type: "markSold" }
  | { type: "delete" }
  | { type: "markAvailable" }
  | { type: "viewSale"; saleId: number };

/**
 * The buttons of a labels page row. A sold item is locked: no Edit, no Delete.
 * If a Sale lists it, the row opens that Sale; otherwise (marked sold by hand)
 * it can be put back in stock.
 */
export const labelRowActions = (
  item: Pick<LabeledItemWithSaleModel, "status" | "sale_id">,
): LabelRowAction[] => {
  switch (item.status) {
    case "available":
      return [
        { type: "print" },
        { type: "edit" },
        { type: "markSold" },
        { type: "delete" },
      ];
    case "sold":
      return item.sale_id == null
        ? [{ type: "print" }, { type: "markAvailable" }]
        : [{ type: "print" }, { type: "viewSale", saleId: item.sale_id }];
    default:
      item.status satisfies never;
      return [{ type: "print" }];
  }
};
