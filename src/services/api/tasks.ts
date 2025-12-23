import axiosInstance from "./axios";

export const getTasks = () => axiosInstance.get("/api/tasks")
export const getEmployeesForTask = (id)=>axiosInstance.get(`/api/tasks/${id}/employees`)

export const updateTask = (id,data)=>axiosInstance.put(`/api/tasks/${id}`,data)
export const createTask =(data)=>axiosInstance.post("/api/tasks",data)
export const deleteTask = (id)=>axiosInstance.delete(`/api/tasks/${id}`)

export const addEmployeeToTask=(id,employee_id)=>axiosInstance.post(`/api/tasks/${id}/employees`,{employee_id})
export const removeEmployeeFromTask=(id,employee_id)=>axiosInstance.delete(`/api/tasks/${id}/employees/${employee_id}`)