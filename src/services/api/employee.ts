import type { EmployeeModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

interface UserFilters {
  store_id?: number;
  active?: boolean;
  include?: string;
}

export const getEmployees = (filters: UserFilters | null = null) =>
  axiosInstance.get("/api/employees", { params: filters }); //TODO faut que role devienne un array

export const createEmployees = (data: EmployeeModel) =>
  axiosInstance.post("/api/employees", data);
export const updateEmployee = (id: number, data: EmployeeModel) =>
  axiosInstance.put(`/api/employees/${id}`, data);
export const deleteEmployee = (id: number) =>
  axiosInstance.delete(`/api/employees/${id}`);
