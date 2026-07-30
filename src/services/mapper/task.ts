import type { TaskDataInput } from "@recyclerie/api/schemas/tasks";
import type { TaskModel } from "../../interfaces/Models";
import type {
  PlanningFormOutput,
  PlanningFormValues,
} from "../schema/schedule";
import type { TaskFormOutput, TaskFormValues } from "../schema/task";
import { emptyToNull } from "../zodTransform";

function parseTaskJsonArray(
  value: string | string[] | null | undefined,
): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

/** Map API task → admin TaskForm defaults. */
export function taskToFormValues(
  task: Omit<TaskModel, "required_skills" | "equipment_needed"> & {
    required_skills?: string | string[] | null;
    equipment_needed?: string | string[] | null;
  },
): Partial<TaskFormValues> {
  return {
    name: task.name,
    description: task.description ?? "",
    category: task.category,
    priority: task.priority ?? "medium",
    location: task.location ?? "",
    required_skills: parseTaskJsonArray(task.required_skills),
    equipment_needed: parseTaskJsonArray(task.equipment_needed),
    hourly_rate: task.hourly_rate != null ? Number(task.hourly_rate) : "",
    is_recurring: false,
    recurrence_pattern: "",
    notes: task.notes ?? "",
    scheduled_date: new Date(task.scheduled_date),
    start_time: task.start_time ? new Date(task.start_time) : new Date(),
    end_time: task.end_time ? new Date(task.end_time) : new Date(),
  };
}

export const taskPayloadFromForm = (data: TaskFormOutput): TaskDataInput => {
  const {
    description,
    location,
    notes,
    recurrence_pattern,
    assigned_to,
    hourly_rate: _hourlyRate,
    ...rest
  } = data;

  return {
    ...rest,
    description: emptyToNull(description),
    location: emptyToNull(location),
    notes: emptyToNull(notes),
    recurrence_pattern: recurrence_pattern === "" ? null : recurrence_pattern,
    assigned_to: assigned_to === "" ? null : assigned_to,
    is_recurring: !!recurrence_pattern,
  } satisfies TaskDataInput;
};

/** Map API task → planning page form defaults. */
export function taskToPlanningFormValues(
  task: Partial<TaskModel>,
): Partial<PlanningFormValues> {
  return {
    name: task.name,
    category: task.category,
    priority: task.priority ?? "medium",
    scheduled_date: task.scheduled_date
      ? new Date(task.scheduled_date)
      : undefined,
    start_time: task.start_time ? new Date(task.start_time) : undefined,
    end_time: task.end_time ? new Date(task.end_time) : undefined,
    notes: task.notes ?? "",
    store_id: task.store_id ?? "",
  };
}

export const planningTaskPayloadFromForm = (
  data: PlanningFormOutput,
): TaskDataInput => {
  const { store_id, recurrence_pattern, notes, ...rest } = data;
  return {
    ...rest,
    notes: emptyToNull(notes),
    recurrence_pattern: recurrence_pattern === "" ? null : recurrence_pattern,
    store_id: store_id === "" ? null : store_id,
    description: null,
    location: null,
    required_skills: [] as string[],
    equipment_needed: [] as string[],
    is_recurring: !!recurrence_pattern,
  } satisfies TaskDataInput;
};
