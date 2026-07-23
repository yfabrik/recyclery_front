import { RECURRENCE_PATTERNS } from "@recyclerie/api/enums";
import { z } from "zod";
import {
  PRIORITY_FILTER_VALUES,
} from "../../constants/taskPriorities";
import {
  RECURRENCE_FILTER_VALUES,
} from "../../constants/recurrencePatterns";
import { idSchema, noEmptyStr, nullString } from "../../interfaces/ZodTypes";

const recurrencePatternEnum = z.enum(RECURRENCE_PATTERNS);

/** Admin TaskForm schema (template / full task fields). Distinct from planningFormSchema. */
export const taskFormSchema = z.object({
  name: noEmptyStr("Le nom de la tâche est requis"),
  hourly_rate: z.coerce.number().optional(),
  description: z
    .string()
    .trim()
    .transform((v) => (v == "" ? null : v)),
  category: noEmptyStr("La catégorie est requise"),
  priority: noEmptyStr("La priorité est requise"),
  location: z
    .string()
    .trim()
    .transform((v) => (v == "" ? null : v)),
  assigned_to: z.union([z.string(), z.number()]).optional().nullable(),
  required_skills: z.array(z.string()).default([]),
  equipment_needed: z.array(z.string()).default([]),
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.union([nullString(), recurrencePatternEnum]),
  notes: z
    .string()
    .trim()
    .transform((v) => (v == "" ? null : v)),
  scheduled_date: z.coerce.date(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
});

export type TaskFormOutput = z.infer<typeof taskFormSchema>;
export type TaskFormValues = z.input<typeof taskFormSchema>;

export const customTaskFilterSchema = z.object({
  search: z.string().trim().optional(),
  store_id: z.union([idSchema(), z.literal("")]),
  priority: z.enum(PRIORITY_FILTER_VALUES),
  recurrence: z.enum(RECURRENCE_FILTER_VALUES),
});

export type CustomTaskFilters = z.infer<typeof customTaskFilterSchema>;

export const CUSTOM_TASK_FILTER_DEFAULTS: CustomTaskFilters = {
  search: "",
  store_id: "",
  priority: "all",
  recurrence: "all",
};
