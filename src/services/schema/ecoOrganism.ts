import { ARRIVAL_SOURCE_TYPES } from "@recyclerie/api/enums";
import { idSchema, phoneSchema } from "@recyclerie/api/primitives/zod";
import z from "zod";
import {
  idSchema as filterIdSchema,
  noEmptyStr,
  nullString,
} from "../../interfaces/ZodTypes";

export const ecoOrganismFormSchema = z.object({
  name: noEmptyStr("nom requis"),
  description: z.string().transform((v) => (v == "" ? null : v)),
  contact_email: z.union([nullString(), z.email()]),
  contact_phone: z.union([
    nullString(),
    phoneSchema(),
  ]),
  address: z.string().transform((v) => (v == "" ? null : v)),
  website: z.union([nullString(), z.url()]),
  inCategories: z.array(idSchema()).default([]),
  sellCategories: z.array(idSchema()).default([]),
  is_active: z.boolean(),
});

export type EcoOrganismFormOutput = z.infer<typeof ecoOrganismFormSchema>;
export type EcoOrganismFormValues = z.input<typeof ecoOrganismFormSchema>;

const ECO_ORG_METRIC_SOURCES = ["quarterIn", "quarterOut", "quarterSell"] as const;

export const ecoOrgFilterSchema = z.object({
  eco_organism_id: z.union([filterIdSchema(), z.literal("")]),
  metric_source: z.enum(ECO_ORG_METRIC_SOURCES),
  quarter: z.string(),
  month_year: z.coerce.date().nullable(),
  source_type: z.enum([...ARRIVAL_SOURCE_TYPES, ""]),
  collection_point_id: z.union([filterIdSchema(), z.literal("")]),
  category: z.string(),
});

export type EcoOrgFilters = z.infer<typeof ecoOrgFilterSchema>;
export type EcoOrgFilterValues = z.input<typeof ecoOrgFilterSchema>;

export const getEcoOrgFilterDefaults = (): EcoOrgFilters => ({
  eco_organism_id: "",
  metric_source: "quarterOut",
  quarter: "",
  month_year: null,
  source_type: "",
  collection_point_id: "",
  category: "",
});
