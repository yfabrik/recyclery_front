import type { LabeledItemModel } from "../../interfaces/Models";
import type { LabeledItemFormValues } from "../schema/item";

export function labeledItemToFormValues(
  item: LabeledItemModel,
): Partial<LabeledItemFormValues> {
  return {
    category_id: item.category_id,
    subcategory_id: item.subcategory_id ?? "",
    weight: item.weight,
    price: item.price,
    condition_state: item.condition_state,
    description: item.description ?? "",
    location: "",
  };
}
