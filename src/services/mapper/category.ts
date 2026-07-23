import type { CategoryDataInput } from "@recyclerie/api/schemas/categories";
import type { CategoryModel } from "../../interfaces/Models";
import type { CategoryFormOutput, CategoryFormValues } from "../schema/category";

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
  

 export const categoryPayloadFromForm = (data: CategoryFormOutput): CategoryDataInput => ({...data})
