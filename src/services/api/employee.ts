import type { AxiosResponse } from "axios";
import type {
  ListEmployeesResponse,
  DetailEmployeeResponse,
  CreateEmployeeResponse,
  UpdateEmployeeResponse,
  DeleteEmployeeResponse,
} from "@recyclerie/api/responses/employees";
import axiosInstance from "./axios";
import type { Schema } from "../../components/forms/EmployeeForm";

interface EmployeeFilters {
  store_id?: number;
  active?: boolean;
  include?: string;
}

export const getEmployees = (
  filters?: EmployeeFilters,
): Promise<AxiosResponse<ListEmployeesResponse>> =>
  axiosInstance.get<ListEmployeesResponse>("/api/employees", { params: filters });

export const detailEmployee = (
  id: number,
): Promise<AxiosResponse<DetailEmployeeResponse>> =>
  axiosInstance.get<DetailEmployeeResponse>(`/api/employees/${id}`);

export const createEmployees = (
  data: Schema,
): Promise<AxiosResponse<CreateEmployeeResponse>> =>
  axiosInstance.post<CreateEmployeeResponse>("/api/employees", data);

export const updateEmployee = (
  id: number,
  data: Schema,
): Promise<AxiosResponse<UpdateEmployeeResponse>> =>
  axiosInstance.put<UpdateEmployeeResponse>(`/api/employees/${id}`, data);

export const deleteEmployee = (
  id: number,
): Promise<AxiosResponse<DeleteEmployeeResponse>> =>
  axiosInstance.delete<DeleteEmployeeResponse>(`/api/employees/${id}`);
