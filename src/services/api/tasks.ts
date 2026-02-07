import type { AxiosResponse } from "axios";
import axiosInstance from "./axios";
import type { EmployeeModel, TaskModel } from "../../interfaces/Models";
interface filterTask {
  include?: ("user" | "store")[];
  store_id?: number;
  date_from?: Date;
  date_to?: Date;
  category?: "vente" | "point" | "collection" | "custom";
}
export const getTasks = (filter?: filterTask): Promise<AxiosResponse<{ message: string, tasks: TaskModel[] }>> => {
  if (filter?.include)
    filter = { ...filter, include: filter.include.toString() }
  return axiosInstance.get("/api/tasks", { params: filter });
}

export const getEmployeesForTask = (id: number): Promise<AxiosResponse<{
  message: string, employees: EmployeeModel []
}>> =>
  axiosInstance.get(`/api/tasks/${id}/employees`);

export const updateTask = (id: number, data) =>
  axiosInstance.put(`/api/tasks/${id}`, data);

export const createTask = (data) => axiosInstance.post("/api/tasks", data);

export const deleteTask = (id: number) =>
  axiosInstance.delete(`/api/tasks/${id}`);

export const addEmployeeToTask = (id: number, employee_id: number) =>
  axiosInstance.post(`/api/tasks/${id}/employees`, { employee_id });

export const removeEmployeeFromTask = (id: number, employee_id: number) =>
  axiosInstance.delete(`/api/tasks/${id}/employees/${employee_id}`);
