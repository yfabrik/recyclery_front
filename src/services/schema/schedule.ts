import { RECURRENCE_PATTERNS, TASK_CATEGORIES } from "@recyclerie/api/enums";
import z from "zod";
import {
  noEmptyStr,
  optionalId,
  requiredFormId,
  requiredFormWeekday,
} from "../../interfaces/ZodTypes";

export const presenceFormSchema = z.object({
  collection_point_id: requiredFormId("un point de collecte est requis"),
  day_of_week: requiredFormWeekday("choisissez un jour"),
  is_present: z.boolean(),
  start_time: z.date("L'heure de début est requise"),
  end_time: z.date("L'heure de fin est requise"),
  notes: z.string(),
});

export type PresenceFormOutput = z.infer<typeof presenceFormSchema>;
export type PresenceFormValues = z.input<typeof presenceFormSchema>;

export const collecteFormSchema = z.object({
  day_of_week: requiredFormWeekday("choisissez un jour"),
  is_active: z.boolean(),
  start_time: z.date("L'heure de début est requise"),
  end_time: z.date("L'heure de fin est requise"),
  notes: z.string(),
  store_id: optionalId(),
  location: z.array(z.string()),
});

export type CollecteFormOutput = z.infer<typeof collecteFormSchema>;
export type CollecteFormValues = z.input<typeof collecteFormSchema>;

export const storeOpeningFormSchema = z.object({
  store_id: requiredFormId("choisissez un magasin"),
  day_of_week: requiredFormWeekday("choisissez un jour"),
  is_recurring: z.boolean(),
  start_time: z.date("L'heure de début est requise"),
  end_time: z.date("L'heure de fin est requise"),
  is_24h: z.boolean(),
  notes: z.string(),
});

export type StoreOpeningFormOutput = z.infer<typeof storeOpeningFormSchema>;
export type StoreOpeningFormValues = z.input<typeof storeOpeningFormSchema>;

const categoryEnum = z.enum(TASK_CATEGORIES);
const recurrencePatternEnum = z.enum(RECURRENCE_PATTERNS);

/** Custom/one-off planning task (as opposed to recurring collecte/presence schedules). */
export const planningFormSchema = z.object({
  name: noEmptyStr("name requis"),
  category: categoryEnum,
  scheduled_date: z.date("La date est requise"),
  start_time: z.date("L'heure de début est requise"),
  end_time: z.date("L'heure de fin est requise"),
  priority: noEmptyStr("La priorité est requise"),
  store_id: optionalId(),
  recurrence_pattern: z.union([z.literal(""), recurrencePatternEnum]),
  notes: z.string(),
});

export type PlanningFormOutput = z.infer<typeof planningFormSchema>;
export type PlanningFormValues = z.input<typeof planningFormSchema>;
