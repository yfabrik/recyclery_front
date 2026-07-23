import type {
  AssignEmployeeTaskResponse,
  CreateTaskResponse,
  DeleteTaskResponse,
  ListTasksResponse,
  RemoveEmployeeTaskResponse,
  TaskEmployeesResponse,
  UpdateTaskResponse,
} from "@recyclerie/api/responses/tasks";
import type { TaskDataInput, TaskListFilter, TaskListFilterInput } from "@recyclerie/api/schemas/tasks";
import type { AxiosResponse } from "axios";
import type { EmployeeModel, TaskModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

// export type { TaskListFilter };

type TaskListQuery = Omit<TaskListFilterInput, "include"> & {
  include?: TaskListFilter["include"];
};

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

export const getTasks = (
  filter?: TaskListQuery,
): Promise<AxiosResponse<ListTasksResponse>> =>
  axiosInstance.get<ListTasksResponse>("/api/tasks", {
    params: { ...filter, include: filter?.include?.toString() },
  });

export const getEmployeesForTask = (
  id: TaskModel["id"],
): Promise<AxiosResponse<TaskEmployeesResponse>> =>
  axiosInstance.get<TaskEmployeesResponse>(`/api/tasks/${id}/employees`);

export const updateTask = (
  id: TaskModel["id"],
  data: TaskDataInput,
): Promise<AxiosResponse<UpdateTaskResponse>> =>
  axiosInstance.put<UpdateTaskResponse>(`/api/tasks/${id}`, data);

export const createTask = (
  data: TaskDataInput,
): Promise<AxiosResponse<CreateTaskResponse>> =>
  axiosInstance.post<CreateTaskResponse>("/api/tasks", data);

export const deleteTask = (
  id: TaskModel["id"],
): Promise<AxiosResponse<DeleteTaskResponse>> =>
  axiosInstance.delete<DeleteTaskResponse>(`/api/tasks/${id}`);

export const addEmployeeToTask = (
  id: TaskModel["id"],
  employee_id: EmployeeModel["id"],
): Promise<AxiosResponse<AssignEmployeeTaskResponse>> =>
  axiosInstance.post<AssignEmployeeTaskResponse>(`/api/tasks/${id}/employees`, {
    employee_id,
  });

export const removeEmployeeFromTask = (
  id: TaskModel["id"],
  employee_id: EmployeeModel["id"],
): Promise<AxiosResponse<RemoveEmployeeTaskResponse>> =>
  axiosInstance.delete<RemoveEmployeeTaskResponse>(
    `/api/tasks/${id}/employees/${employee_id}`,
  );
