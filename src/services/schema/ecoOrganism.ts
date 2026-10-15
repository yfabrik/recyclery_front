import {
  ARRIVAL_SOURCE_TYPES,
  ECO_ORG_METRIC_SOURCES,
} from "@recyclerie/api/enums";
import { phoneSchema } from "@recyclerie/api/primitives/zod";
import z from "zod";
import {
  idSchema as filterIdSchema,
  noEmptyStr,
} from "../../interfaces/ZodTypes";

export const ecoOrganismFormSchema = z.object({
  name: noEmptyStr("nom requis"),
  description: z.string(),
  contact_email: z.union([z.literal(""), z.email()]),
  contact_phone: z.union([z.literal(""), phoneSchema()]),
  address: z.string(),
  website: z.union([z.literal(""), z.url()]),
  inCategories: z.array(z.number().positive()),
  sellCategories: z.array(z.number().positive()),
  is_active: z.boolean(),
});

export type EcoOrganismFormOutput = z.infer<typeof ecoOrganismFormSchema>;
export type EcoOrganismFormValues = z.input<typeof ecoOrganismFormSchema>;

/**
 * URL / form state of the eco-organism stats filters. Not the API query: see
 * `toEcoOrgQuartersQuery`. Only `collection_point_id` is server-side; the other
 * fields filter the fetched rows in memory.
 */
export const ecoOrgFilterFormSchema =z.object({
  eco_organism_id: z.union([filterIdSchema(), z.literal("")]),
  metric_source: z.enum(ECO_ORG_METRIC_SOURCES),

  quarter: z.string(),
  month_year: z.coerce.date().nullable(),
  source_type: z.enum([...ARRIVAL_SOURCE_TYPES, ""]),
  collection_point_id: z.union([filterIdSchema(), z.literal("")]),
  category: z.string(),
});

export type EcoOrgFilterFormValues = z.infer<typeof ecoOrgFilterFormSchema>;
export type EcoOrgFilterFormInput = z.input<typeof ecoOrgFilterFormSchema>;

export const getEcoOrgFilterFormDefaults = (): EcoOrgFilterFormValues => ({
  eco_organism_id: "",
  metric_source: "quarterOut",
  quarter: "",
  month_year: null,
  source_type: "",
  collection_point_id: "",
  category: "",
});
