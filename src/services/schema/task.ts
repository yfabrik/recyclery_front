import {
  RECURRENCE_PATTERNS,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
} from "@recyclerie/api/enums";
import { z } from "zod";
import {
  PRIORITY_FILTER_VALUES,
} from "../../constants/taskPriorities";
import {
  RECURRENCE_FILTER_VALUES,
} from "../../constants/recurrencePatterns";
import { idSchema, noEmptyStr } from "../../interfaces/ZodTypes";

const recurrencePatternEnum = z.enum(RECURRENCE_PATTERNS);
const categoryEnum = z.enum(TASK_CATEGORIES);
const priorityEnum = z.enum(TASK_PRIORITIES);

/** Admin TaskForm schema (template / full task fields). Distinct from planningFormSchema. */
export const taskFormSchema = z.object({
  name: noEmptyStr("Le nom de la tâche est requis"),
  // Prefer z.number / z.date over coerce+transform so z.input === z.infer.
  hourly_rate: z.union([z.literal(""), z.number()]),
  description: z.string(),
  category: categoryEnum,
  priority: priorityEnum,
  location: z.string(),
  assigned_to: z.union([z.literal(""), z.number().positive()]),
  required_skills: z.array(z.string()),
  equipment_needed: z.array(z.string()),
  is_recurring: z.boolean(),
  recurrence_pattern: z.union([z.literal(""), recurrencePatternEnum]),
  notes: z.string(),
  scheduled_date: z.date("La date est requise"),
  start_time: z.date("L'heure de début est requise"),
  end_time: z.date("L'heure de fin est requise"),
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
