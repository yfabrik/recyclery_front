import type { LabeledItemDataInput } from "@recyclerie/api/schemas/items";
import type { LabeledItemModel } from "../../interfaces/Models";
import type { LabeledItemQuery } from "../api/labeledItems";
import type {
  LabeledItemFormOutput,
  LabeledItemFormValues,
  ManualItemFormOutput,
} from "../schema/item";
import type { LabelFilterFormValues } from "../schema/label";
import { emptyToNull, omitBlank } from "../zodTransform";

export const toLabeledItemQuery = (f: LabelFilterFormValues): LabeledItemQuery =>
  omitBlank({
    status: f.status,
    category_id: f.category_id,
    search: f.search,
    date_from: f.date_from,
    date_to: f.date_to,
  });

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

export const labeledItemPayloadFromForm = (
  data: LabeledItemFormOutput,
): LabeledItemDataInput => {
  return {
    category_id: data.category_id,
    subcategory_id:
      data.subcategory_id === "" ? null : data.subcategory_id,
    weight: data.weight,
    price: data.price,
    description: emptyToNull(data.description),
    condition_state: data.condition_state,
    location: emptyToNull(data.location),
    quantity: data.quantity,
  } satisfies LabeledItemDataInput;
};

/** Manual POS item — same core shaping; promotion stays for cart, not labeled API. */
export const manualItemPayloadFromForm = (data: ManualItemFormOutput) => {
  return {
    category_id: data.category_id,
    subcategory_id:
      data.subcategory_id === "" ? null : data.subcategory_id,
    weight: data.weight,
    price: data.price,
    description: emptyToNull(data.description),
    promotion: data.promotion === "" ? 0 : data.promotion,
  };
};
