import type {
  CreateEmployeeResponse,
  DeleteEmployeeResponse,
  DetailEmployeeResponse,
  ListEmployeesResponse,
  UpdateEmployeeResponse,
} from "@recyclerie/api/responses/employees";
import type { EmployeeDataInput, EmployeeFilterInput } from "@recyclerie/api/schemas/employees";
import type { AxiosResponse } from "axios";
import type { EmployeeModel } from "../../interfaces/Models";
import axiosInstance from "./axios";


export const getEmployees = (
  filters?: EmployeeFilterInput,
): Promise<AxiosResponse<ListEmployeesResponse>> =>
  axiosInstance.get<ListEmployeesResponse>("/api/employees", { params: filters });

export const detailEmployee = (
  id: EmployeeModel["id"],
): Promise<AxiosResponse<DetailEmployeeResponse>> =>
  axiosInstance.get<DetailEmployeeResponse>(`/api/employees/${id}`);

export const createEmployees = (
  data: EmployeeDataInput,
): Promise<AxiosResponse<CreateEmployeeResponse>> =>
  axiosInstance.post<CreateEmployeeResponse>("/api/employees", data);

export const updateEmployee = (
  id: EmployeeModel["id"],
  data: EmployeeDataInput,
): Promise<AxiosResponse<UpdateEmployeeResponse>> =>
  axiosInstance.put<UpdateEmployeeResponse>(`/api/employees/${id}`, data);

export const deleteEmployee = (
  id: EmployeeModel["id"],
): Promise<AxiosResponse<DeleteEmployeeResponse>> =>
  axiosInstance.delete<DeleteEmployeeResponse>(`/api/employees/${id}`);
