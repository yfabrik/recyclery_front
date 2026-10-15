import { WASTE_DISPOSAL_TYPES } from "@recyclerie/api/enums";
import * as z from "zod";
import { DISPOSAL_TYPE_FILTER_VALUES } from "../../constants/disposalTypes";
import type { CategoryModel } from "../../interfaces/Models";
import {
  filterIsoDate,
  idSchema as filterIdSchema,
  optionalId,
  requiredFormId,
} from "../../interfaces/ZodTypes";
import { dayjs, toIsoDate } from "../dateService";

const disposalTypeEnum = z.enum(WASTE_DISPOSAL_TYPES);

export const wasteFormSchema = (categories: CategoryModel[]) =>
  z
    .object({
      disposal_date: z.date("La date de sortie est requise"),
      disposal_type: disposalTypeEnum,
      category_id: requiredFormId("categorie requis"),
      subcategory_id: optionalId(),
      eco_organism_id: optionalId(),
      weight_kg: z.number().positive("Le poids est requis"),
      volume_m3: z.number().nonnegative(),
      transport_method: z.string(),
      transport_company: z.string(),
      transport_cost: z.number().nonnegative(),
      notes: z.string(),
    })
    .superRefine((data, ctx) => {
      const selectedCategory = categories.find(
        (c) => c.id === data.category_id,
      );
      const hasSubcategories =
        (selectedCategory?.subcategories?.length ?? 0) > 0;
      if (hasSubcategories && !data.subcategory_id) {
        ctx.addIssue({
          code: "custom",
          path: ["subcategory_id"],
          message: "Sous-catégorie requise",
        });
      }

      if (data.disposal_type === "eco_organism" && !data.eco_organism_id)
        ctx.addIssue({
          code: "custom",
          path: ["eco_organism_id"],
          message: "Veuillez sélectionner un eco_orgnism",
        });
    });

export type WasteFormOutput = z.infer<ReturnType<typeof wasteFormSchema>>;
export type WasteFormValues = z.input<ReturnType<typeof wasteFormSchema>>;

/** URL / form state of the waste filters. Not the API query: see `toWasteQuery`. */
export const wasteFilterFormSchema =z.object({
  category_id: z.union([filterIdSchema(), z.literal("")]),
  disposal_type: z.enum(DISPOSAL_TYPE_FILTER_VALUES),
  date_from: filterIsoDate(),
  date_to: filterIsoDate(),
});

export type WasteFilterFormValues = z.infer<typeof wasteFilterFormSchema>;

export const getWasteFilterFormDefaults = (): WasteFilterFormValues => ({
  category_id: "",
  disposal_type: "",
  date_from: toIsoDate(dayjs().subtract(7, "day").toDate()),
  date_to: toIsoDate(new Date()),
});
