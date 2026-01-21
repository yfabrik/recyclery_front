import axiosInstance from "./axios";
interface filterTask{
    include?:"user"
}
export const getTasks = (filter?:filterTask) => axiosInstance.get("/api/tasks",{params:filter})
export const getEmployeesForTask = (id:number)=>axiosInstance.get(`/api/tasks/${id}/employees`)

export const updateTask = (id:number,data)=>axiosInstance.put(`/api/tasks/${id}`,data)
export const createTask =(data)=>axiosInstance.post("/api/tasks",data)
export const deleteTask = (id:number)=>axiosInstance.delete(`/api/tasks/${id}`)

export const addEmployeeToTask=(id:number,employee_id:number)=>axiosInstance.post(`/api/tasks/${id}/employees`,{employee_id})
export const removeEmployeeFromTask=(id:number,employee_id:number)=>axiosInstance.delete(`/api/tasks/${id}/employees/${employee_id}`)