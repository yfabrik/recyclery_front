import axiosInstance from "./axios";

export interface userModel {
  id?: number;
  username: string;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  recyclery_id?: number;
  is_active: boolean;
}

export const fetchUsers = () => axiosInstance.get("/api/users");
export const getEmployees = ()=>axiosInstance.get("/api/users/employees")

export const createUser = (data: userModel) =>
  axiosInstance.post("/api/users", data);
export const updateUser = (id: number, data: userModel) =>
  axiosInstance.put(`/api/users/${id}`, data);
export const deleteUser = (id: number) =>
  axiosInstance.delete(`/api/users/${id}`);

export const updateUserPassword = (id: number, data: userModel) =>
  axiosInstance.put(`/api/users/${id}/password`, data);



export const getRoles = () => axiosInstance.get("/api/users/roles");
export const getUsersStats = () => axiosInstance.get("/api/users/stats");


export const getAssignedStores = (employee_id)=>axiosInstance.get(`/api/employee-stores/employee/${employee_id}`)
export const removeAssignedStores = (employee_id)=>axiosInstance.delete(`/api/employee-stores/employee/${employee_id}`)
export const addAssignedStore = (data)=>axiosInstance.post('/api/employee-stores',data)

export const getUserWorkdays = (id)=>axiosInstance.get(`/api/employee-workdays/employee/${id}`)
export const addWorkdaysToUser = (id,data)=>axiosInstance.post(`/api/employee-workdays/employee/${id}`,data)