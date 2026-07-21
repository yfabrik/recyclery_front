import { RECURRENCE_PATTERNS, TASK_CATEGORIES } from "@recyclerie/api/enums";
import { idSchema } from "@recyclerie/api/primitives/zod";
import z from "zod";
import { noEmptyStr, nullString, weekDays } from "../../interfaces/ZodTypes";

export const presenceFormSchema = z.object({
  collection_point_id: idSchema("un point de collecte est requis"),
  day_of_week: weekDays("choissisez un jour"),
  is_present: z.boolean(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  // is_24h: z.boolean(),
  notes: z.string().transform((v) => (v == "" ? null : v)),
});

export type PresenceFormOutput = z.infer<typeof presenceFormSchema>;
export type PresenceFormValues = z.input<typeof presenceFormSchema>;

export const collecteFormSchema = z.object({
  day_of_week: weekDays("choissisez un jour"),
  is_active: z.boolean(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  notes: z.string().transform((v) => (v == "" ? null : v)),
  store_id: z.union([nullString(), idSchema()]),
  location: z.array(z.string()).default([]),
});

export type CollecteFormOutput = z.infer<typeof collecteFormSchema>;
export type CollecteFormValues = z.input<typeof collecteFormSchema>;

export const storeOpeningFormSchema = z.object({
  store_id: idSchema("choississez un magasin"),
  day_of_week: weekDays("choisissez un jour"),
  is_recurring: z.boolean(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  is_24h: z.boolean(),
  notes: z.string().transform((val) => (val == "" ? null : val)),
});

export type StoreOpeningFormOutput = z.infer<typeof storeOpeningFormSchema>;
export type StoreOpeningFormValues = z.input<typeof storeOpeningFormSchema>;

const categoryEnum = z.enum(TASK_CATEGORIES);
const recurrencePatternEnum = z.enum(RECURRENCE_PATTERNS);
//TODO ? should stay here or is it just a task ?
/** Custom/one-off planning task (as opposed to recurring collecte/presence schedules). */
export const planningFormSchema = z.object({
  name: noEmptyStr("name requis"),
  category: categoryEnum,
  scheduled_date: z.coerce.date("La date est requise"),
  start_time: z.coerce.date("L'heure de début est requise"),
  end_time: z.coerce.date("L'heure de fin est requise"),
  priority: noEmptyStr("La priorité est requise"),
  store_id: z.union([nullString(), idSchema()]),
  recurrence_pattern: z.union([nullString(), recurrencePatternEnum]),
  notes: z.string().transform((v) => (v == "" ? null : v)),
});

export type PlanningFormOutput = z.infer<typeof planningFormSchema>;
export type PlanningFormValues = z.input<typeof planningFormSchema>;
