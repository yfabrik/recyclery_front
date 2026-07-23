import { idSchema } from "@recyclerie/api/primitives/zod";
import * as z from "zod";
import {
  DISPOSAL_TYPE_FILTER_VALUES,
  FORM_DISPOSAL_TYPES,
} from "../../constants/disposalTypes";
import type { CategoryModel } from "../../interfaces/Models";
import {
  filterIsoDate,
  idSchema as filterIdSchema,
  nullString,
} from "../../interfaces/ZodTypes";
import { dayjs, toIsoDate } from "../dateService";

const disposalTypeEnum = z.enum(
  FORM_DISPOSAL_TYPES.map((type) => type.value) as [
    (typeof FORM_DISPOSAL_TYPES)[number]["value"],
    ...(typeof FORM_DISPOSAL_TYPES)[number]["value"][],
  ],
);

export const wasteFormSchema = (categories: CategoryModel[]) =>
  z
    .object({
      disposal_date: z.coerce.date("La date de sortie est requise"),
      disposal_type: disposalTypeEnum,
      category_id: idSchema("categorie requis"),
      subcategory_id: z.union([nullString(), idSchema()]),
      eco_organism_id: z.union([nullString(), idSchema()]),
      weight_kg: z.coerce.number().positive("Le poids est requis"),
      volume_m3: z.coerce.number().nonnegative().default(0),
      transport_method: z.string().transform((v) => (v == "" ? null : v)),
      transport_company: z.string().transform((v) => (v == "" ? null : v)),
      transport_cost: z.coerce.number().nonnegative().default(0),
      notes: z.string().transform((v) => (v == "" ? null : v)),
    })
    .superRefine((data, ctx) => {
      const selectedCategory = categories.find((c) => c.id === data.category_id);
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

export const wasteFilterSchema = z.object({
  category_id: z.union([filterIdSchema(), z.literal("")]),
  disposal_type: z.enum(DISPOSAL_TYPE_FILTER_VALUES),
  date_from: filterIsoDate(),
  date_to: filterIsoDate(),
});

export type WasteFilters = z.infer<typeof wasteFilterSchema>;

export const getWasteFilterDefaults = (): WasteFilters => ({
  category_id: "",
  disposal_type: "",
  date_from: toIsoDate(dayjs().subtract(7, "day").toDate()),
  date_to: toIsoDate(new Date()),
});
