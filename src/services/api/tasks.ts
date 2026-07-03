import type { AxiosResponse } from "axios";
import type { TaskListFilter } from "@recyclerie/api/schemas/tasks";
import type {
  ListTasksResponse,
  CreateTaskResponse,
  UpdateTaskResponse,
  DeleteTaskResponse,
  TaskEmployeesResponse,
  AssignEmployeeTaskResponse,
  RemoveEmployeeTaskResponse,
} from "@recyclerie/api/responses/tasks";
import axiosInstance from "./axios";
import type { TaskFormSchema } from "../../components/forms/TaskForm";
import type { EmployeeModel, TaskModel } from "../../interfaces/Models";

export type { TaskListFilter };

export function parseTaskJsonArray(
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

export type TaskDisplay = Omit<
  TaskModel,
  "required_skills" | "equipment_needed"
> & {
  required_skills: string[];
  equipment_needed: string[];
  assigned_employees?: EmployeeModel[];
};

export function normalizeTaskForDisplay(task: TaskModel): TaskDisplay {
  return {
    ...task,
    required_skills: parseTaskJsonArray(task.required_skills),
    equipment_needed: parseTaskJsonArray(task.equipment_needed),
  };
}

export function taskToFormValues(
  task: TaskModel | TaskDisplay,
): Partial<TaskFormSchema> {
  return {
    name: task.name,
    description: task.description ?? "",
    category: task.category,
    priority: task.priority ?? "medium",
    location: task.location ?? "",
    required_skills: parseTaskJsonArray(task.required_skills),
    equipment_needed: parseTaskJsonArray(task.equipment_needed),
    hourly_rate: task.hourly_rate != null ? Number(task.hourly_rate) : undefined,
    is_recurring: false,
    recurrence_pattern: null,
    notes: task.notes ?? "",
    scheduled_date: new Date(task.scheduled_date),
    start_time: task.start_time ? new Date(task.start_time) : new Date(),
    end_time: task.end_time ? new Date(task.end_time) : new Date(),
  };
}

export const getTasks = (
  filter?: Partial<TaskListFilter>,
): Promise<AxiosResponse<ListTasksResponse>> =>
  axiosInstance.get<ListTasksResponse>("/api/tasks", {
    params: { ...filter, include: filter?.include?.toString() },
  });

export const getEmployeesForTask = (
  id: number,
): Promise<AxiosResponse<TaskEmployeesResponse>> =>
  axiosInstance.get<TaskEmployeesResponse>(`/api/tasks/${id}/employees`);

export const updateTask = (
  id: number,
  data: TaskFormSchema,
): Promise<AxiosResponse<UpdateTaskResponse>> =>
  axiosInstance.put<UpdateTaskResponse>(`/api/tasks/${id}`, data);

export const createTask = (
  data: TaskFormSchema,
): Promise<AxiosResponse<CreateTaskResponse>> =>
  axiosInstance.post<CreateTaskResponse>("/api/tasks", data);

export const deleteTask = (
  id: number,
): Promise<AxiosResponse<DeleteTaskResponse>> =>
  axiosInstance.delete<DeleteTaskResponse>(`/api/tasks/${id}`);

export const addEmployeeToTask = (
  id: number,
  employee_id: number,
): Promise<AxiosResponse<AssignEmployeeTaskResponse>> =>
  axiosInstance.post<AssignEmployeeTaskResponse>(`/api/tasks/${id}/employees`, {
    employee_id,
  });

export const removeEmployeeFromTask = (
  id: number,
  employee_id: number,
): Promise<AxiosResponse<RemoveEmployeeTaskResponse>> =>
  axiosInstance.delete<RemoveEmployeeTaskResponse>(
    `/api/tasks/${id}/employees/${employee_id}`,
  );
