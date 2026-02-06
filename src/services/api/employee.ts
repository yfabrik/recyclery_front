import type { AxiosResponse } from "axios";
import type { Schema } from "../../components/forms/EmployeeForm";
import type { EmployeeModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

interface UserFilters {
  store_id?: number;
  active?: boolean;
  include?: string;
}

export const getEmployees = (filters?: UserFilters): Promise<AxiosResponse<{ message: string, data: EmployeeModel[] }>> =>
  axiosInstance.get("/api/employees", { params: filters });

export const createEmployees = (data: Schema) =>
  axiosInstance.post("/api/employees", data);

export const updateEmployee = (id: number, data: Schema) =>
  axiosInstance.put(`/api/employees/${id}`, data);

export const deleteEmployee = (id: number) =>
  axiosInstance.delete(`/api/employees/${id}`);
