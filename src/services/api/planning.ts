import type { AxiosResponse } from "axios";
import type { EmployeeModel, ScheduleModel, TaskModel } from "../../interfaces/Models";
import axiosInstance from "./axios";
interface filters {
  store_id?: number;
  category?: "vente" | "point" | "collection" | "custom";
}
export const getPlanning = (filters?: filters): Promise<AxiosResponse<{ message: string, schedules: ScheduleModel[] }>> =>
  axiosInstance.get("/api/planning", { params: filters });

export const updatePlanning = (id: number, data) =>
  axiosInstance.put(`/api/planning/${id}`, data);

export const createPlanning = (data): Promise<AxiosResponse<{ message: string, schedules: ScheduleModel }>> =>
  axiosInstance.post("/api/planning", data);

export const deletePlanning = (id: number) =>
  axiosInstance.delete(`/api/planning/${id}`);

export const getAvailableUserForTask = (id: number): Promise<AxiosResponse<{
  message: string, employees: (EmployeeModel & {
    is_available: boolean,
    has_conflicts: boolean,
    already_assigned: boolean,
    conflicts: TaskModel[]
  })[]
}>> =>
  axiosInstance.get(`/api/planning/${id}/available-employees`);
