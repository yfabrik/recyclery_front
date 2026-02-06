import type { AxiosResponse } from "axios";
import type { UserModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

interface UserFilters {
  role?: "employee" | "admin";
  store_id?: number;
  active?: boolean;
  include?: string;
}

export const fetchUsers = (filters?: UserFilters): Promise<AxiosResponse<{ message: string, users: UserModel[] }>> =>
  axiosInstance.get("/api/users", { params: filters }); //TODO faut que role devienne un array
// export const getEmployees = () => axiosInstance.get("/api/users/employees")

export const createUser = (data: UserModel) =>
  axiosInstance.post("/api/users", data);
export const updateUser = (id: number, data: UserModel) =>
  axiosInstance.put(`/api/users/${id}`, data);
export const deleteUser = (id: number) =>
  axiosInstance.delete(`/api/users/${id}`);

export const updateUserPassword = (id: number, data: UserModel) =>
  axiosInstance.put(`/api/users/${id}/password`, data);

export const getRoles = () => axiosInstance.get("/api/users/roles");
export const getUsersStats = () => axiosInstance.get("/api/users/stats");

interface EmployeeStoreModel {
  employee_id: number;
  store_id: number;
  is_primary: boolean;
}


export const getAssignedStores = (employee_id: number) =>
  axiosInstance.get(`/api/employee-stores/employee/${employee_id}`);
export const removeAssignedStores = (employee_id: number) =>
  axiosInstance.delete(`/api/employee-stores/employee/${employee_id}`);
export const addAssignedStore = (data: EmployeeStoreModel) =>
  axiosInstance.post("/api/employee-stores", data);

export const getUserWorkdays = (id: number) =>
  axiosInstance.get(`/api/employee-workdays/employee/${id}`);
export const addWorkdaysToUser = (id: number, data) =>
  axiosInstance.post(`/api/employee-workdays/employee/${id}`, data);
