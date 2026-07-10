import { z } from "zod";
import type { CategoryModel } from "../../interfaces/Models";
import { idSchema, nullString } from "../../interfaces/ZodTypes";
import {
  LABELED_ITEM_CONDITION_VALUES,
} from "../../constants/labeledItemConditions";

export const itemCoreFieldsSchema = (categories: CategoryModel[]) =>
  z
    .object({
      category_id: idSchema("category requis"),
      subcategory_id: z.union([
        nullString(),
        idSchema(),
      ]),
      weight: z.coerce.number().positive(),
      price: z.coerce.number().positive("prix requis"),
      description: z.string().transform((v) => (v === "" ? null : v)),//TODO recheck the description field
      // description: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      //TODO existe aussi en copy pasted dans arrival form
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
    location: z.string().transform((v) => (v === "" ? null : v)),//TODO recheck the location field
    // location: z.string().optional(),
  });

export type LabeledItemSchema = z.infer<ReturnType<typeof labeledItemSchema>>;
export type LabeledItemPayload = LabeledItemSchema;

export const manualItemSchema = (categories: CategoryModel[]) =>
  itemCoreFieldsSchema(categories).extend({
    promotion: z.coerce.number().min(0).max(100),
  });

export type ManualItemSchema = z.infer<ReturnType<typeof manualItemSchema>>;
