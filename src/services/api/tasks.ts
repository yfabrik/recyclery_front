import type { AxiosResponse } from "axios";
import axiosInstance from "./axios";
import type { TaskFormSchema } from "../../components/forms/TaskForm";
import type { EmployeeModel, TaskModel } from "../../interfaces/Models";
interface filterTask {
  include?: ("user" | "store")[];
  store_id?: number;
  date_from?: string | Date;
  date_to?: string | Date;
  category?: TaskModel["category"];
}
export const getTasks = (filter?: filterTask): Promise<AxiosResponse<{ message: string, tasks: TaskModel[] }>> =>
  axiosInstance.get("/api/tasks", { params: { ...filter, include: filter?.include?.toString() } });

export const getEmployeesForTask = (id: number): Promise<AxiosResponse<{
  message: string, employees: EmployeeModel []
}>> =>
  axiosInstance.get(`/api/tasks/${id}/employees`);

export const updateTask = (id: number, data: TaskFormSchema) =>
  axiosInstance.put(`/api/tasks/${id}`, data);

export const createTask = (data: TaskFormSchema) =>
  axiosInstance.post("/api/tasks", data);

export const deleteTask = (id: number) =>
  axiosInstance.delete(`/api/tasks/${id}`);

export const addEmployeeToTask = (id: number, employee_id: number) =>
  axiosInstance.post(`/api/tasks/${id}/employees`, { employee_id });

export const removeEmployeeFromTask = (id: number, employee_id: number) =>
  axiosInstance.delete(`/api/tasks/${id}/employees/${employee_id}`);
