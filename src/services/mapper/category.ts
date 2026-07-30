import type { CategoryDataInput } from "@recyclerie/api/schemas/categories";
import type { CategoryModel } from "../../interfaces/Models";
import type { CategoryFormOutput, CategoryFormValues } from "../schema/category";
import { emptyToNull } from "../zodTransform";

export function categoryToFormValues(
  category: Partial<CategoryModel>,
): Partial<CategoryFormValues> {
  return {
    name: category.name ?? "",
    description: category.description ?? "",
    icon: category.icon ?? "",
    defaultPrice: category.defaultPrice ?? 0,
    defaultWeight: category.defaultWeight ?? 0,
    parent_id: category.parent_id ?? null,
    priceBasedOnWeight: category.priceBasedOnWeight ?? false,
    bundlePrice: category.bundlePrice ?? "",
    bundleQuantity: category.bundleQuantity ?? "",
  };
}

export const categoryPayloadFromForm = (
  data: CategoryFormOutput,
): CategoryDataInput => {
  return {
    name: data.name,
    description: emptyToNull(data.description),
    icon: emptyToNull(data.icon),
    defaultPrice: data.defaultPrice,
    defaultWeight: data.defaultWeight,
    parent_id: data.parent_id,
    priceBasedOnWeight: data.priceBasedOnWeight,
    bundlePrice: data.bundlePrice === "" ? null : data.bundlePrice,
    bundleQuantity: data.bundleQuantity === "" ? null : data.bundleQuantity,
  } satisfies CategoryDataInput;
};
