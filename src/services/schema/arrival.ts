import { ARRIVAL_SOURCE_TYPES } from "@recyclerie/api/enums";
import z from "zod";
import type { CategoryModel } from "../../interfaces/Models";
import {
  filterIsoDate,
  idSchema as filterIdSchema,
  optionalId,
  requiredFormId,
  requiredPositiveNumber,
} from "../../interfaces/ZodTypes";
import { toIsoDate } from "../dateService";

const sourceTypeEnum = z.enum(ARRIVAL_SOURCE_TYPES);

export const arrivalFormSchema = (categories: CategoryModel[]) =>
  z
    .object({
      category_id: requiredFormId("La catégorie est requise"),
      subcategory_id: optionalId(),
      weight: requiredPositiveNumber("Le poids est requis"),
      arrival_date: z.date("La date est requise"),
      arrival_time: z.date("L'heure est requise"),
      source_type: sourceTypeEnum,
      collection_point_id: optionalId(),
      source_details: z.string(),
      notes: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.source_type === "point" && !data.collection_point_id)
        ctx.addIssue({
          code: "custom",
          path: ["collection_point_id"],
          message: "Veuillez sélectionner un point de collecte",
        });
      const selectedCategory = categories.find(
        (c) => c.id === Number(data.category_id),
      );
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

export type ArrivalFormOutput = z.infer<ReturnType<typeof arrivalFormSchema>>;
export type ArrivalFormValues = z.input<ReturnType<typeof arrivalFormSchema>>;

export const arrivalFilterSchema = z.object({
  date_from: filterIsoDate(),
  date_to: filterIsoDate(),
  source_type: z.union([sourceTypeEnum, z.literal("")]),
  collection_point_id: z.union([filterIdSchema(), z.literal("")]),
});
export type ArrivalFilters = z.infer<typeof arrivalFilterSchema>;

export const getArrivalFilterDefaults = (): ArrivalFilters => ({
  date_from: toIsoDate(new Date()),
  date_to: toIsoDate(new Date()),
  source_type: "",
  collection_point_id: "",
});
