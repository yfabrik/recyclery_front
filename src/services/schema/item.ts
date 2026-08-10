import { z } from "zod";
import { LABELED_ITEM_CONDITION_VALUES } from "../../constants/labeledItemConditions";
import type { CategoryModel } from "../../interfaces/Models";
import {
  optionalId,
  requiredFormId,
  requiredPositiveNumber,
} from "../../interfaces/ZodTypes";

const itemCoreObjectSchema = z.object({
  category_id: requiredFormId("category requis"),
  subcategory_id: optionalId(),
  weight: z.number().positive(),
  price: z.number().positive("prix requis"),
  description: z.string(),
});

const withCategorySubcategoryRefine =
  (categories: CategoryModel[]) =>
  (
    data: { category_id: number; subcategory_id: number | "" },
    ctx: z.RefinementCtx,
  ) => {
    const selectedCategory = categories.find((c) => c.id === data.category_id);
    const hasSubcategories =
      (selectedCategory?.subcategories?.length ?? 0) > 0;
    if (hasSubcategories && !data.subcategory_id) {
      ctx.addIssue({
        code: "custom",
        path: ["subcategory_id"],
        message: "Sous-categorie requise",
      });
    }
  };

export const itemCoreFieldsSchema = (categories: CategoryModel[]) =>
  itemCoreObjectSchema.superRefine(withCategorySubcategoryRefine(categories));

export type ItemCoreFields = z.infer<ReturnType<typeof itemCoreFieldsSchema>>;

export const labeledItemSchema = (categories: CategoryModel[]) =>
  itemCoreObjectSchema
    .extend({
      condition_state: z.enum(LABELED_ITEM_CONDITION_VALUES),
      location: z.string(),
      quantity: z.number().int().positive().max(100).default(1),
    })
    .superRefine(withCategorySubcategoryRefine(categories));

export type LabeledItemFormOutput = z.infer<
  ReturnType<typeof labeledItemSchema>
>;
export type LabeledItemFormValues = z.input<
  ReturnType<typeof labeledItemSchema>
>;

/** Manual POS: weight/price start as `""` so the user must fill them; promo optional. */
export const manualItemSchema = (categories: CategoryModel[]) =>
  itemCoreObjectSchema
    .extend({
      weight: requiredPositiveNumber("Le poids est requis"),
      price: requiredPositiveNumber("prix requis"),
      promotion: z.union([z.literal(""), z.number().min(0).max(100)]),
    })
    .superRefine(withCategorySubcategoryRefine(categories));

export type ManualItemFormOutput = z.infer<
  ReturnType<typeof manualItemSchema>
>;
export type ManualItemFormValues = z.input<
  ReturnType<typeof manualItemSchema>
>;
