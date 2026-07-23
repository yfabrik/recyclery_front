import { idSchema } from "@recyclerie/api/primitives/zod";
import { z } from "zod";
import { LABELED_ITEM_CONDITION_VALUES } from "../../constants/labeledItemConditions";
import type { CategoryModel } from "../../interfaces/Models";
import { nullString } from "../../interfaces/ZodTypes";

export const itemCoreFieldsSchema = (categories: CategoryModel[]) =>
  z
    .object({
      category_id: idSchema("category requis"),
      subcategory_id: z.union([nullString(), idSchema()]),
      weight: z.coerce.number().positive(),
      price: z.coerce.number().positive("prix requis"),
      description: z.string().transform((v) => (v === "" ? null : v)),
    })
    .superRefine((data, ctx) => {
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
    });

export type ItemCoreFields = z.infer<ReturnType<typeof itemCoreFieldsSchema>>;

export const labeledItemSchema = (categories: CategoryModel[]) =>
  itemCoreFieldsSchema(categories).extend({
    condition_state: z.enum(LABELED_ITEM_CONDITION_VALUES),
    location: z.string().transform((v) => (v === "" ? null : v)),
  });

export type LabeledItemFormOutput = z.infer<ReturnType<typeof labeledItemSchema>>;
export type LabeledItemFormValues = z.input<ReturnType<typeof labeledItemSchema>>;
/** @deprecated Use LabeledItemFormOutput */
export type LabeledItemSchema = LabeledItemFormOutput;
/** @deprecated Use LabeledItemFormOutput */
export type LabeledItemPayload = LabeledItemFormOutput;

export const manualItemSchema = (categories: CategoryModel[]) =>
  itemCoreFieldsSchema(categories).extend({
    promotion: z.coerce.number().min(0).max(100),
  });

export type ManualItemFormOutput = z.infer<ReturnType<typeof manualItemSchema>>;
export type ManualItemFormValues = z.input<ReturnType<typeof manualItemSchema>>;
/** @deprecated Use ManualItemFormOutput */
export type ManualItemSchema = ManualItemFormOutput;
